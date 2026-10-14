const VpnAccount = require('../models/vpnAccount');
const ConnectionLog = require('../models/connectionLog');

// GET /api/v1/vpn/me — the logged-in user's VPN accounts, with server info populated.
exports.myVpnAccounts = async (req, res, next) => {
    const accounts = await VpnAccount.find({ user: req.user.id })
        .populate('server')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        accounts
    });
};

exports.getSingleVpnAccount = async (req, res, next) => {
    const account = await VpnAccount.findById(req.params.id).populate('server');
    if (!account) {
        return res.status(404).json({ success: false, message: 'VPN account not found' });
    }
    // Only the owner (or an admin) may view this account.
    if (account.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this account' });
    }
    res.status(200).json({ success: true, account });
};

// POST /api/v1/vpn/:id/simulate-connect
// Premium-only simulated action: logs a mock "connect" event and increments
// devicesConnected, up to the account's deviceSlotLimit. No real network
// activity occurs; this exists to demonstrate the usage-history feature.
exports.simulateConnect = async (req, res, next) => {
    const account = await VpnAccount.findById(req.params.id);
    if (!account) {
        return res.status(404).json({ success: false, message: 'VPN account not found' });
    }
    if (account.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (account.tier !== 'premium') {
        return res.status(400).json({ success: false, message: 'Connection simulation is a Premium feature' });
    }
    if (account.devicesConnected >= account.deviceSlotLimit) {
        return res.status(400).json({ success: false, message: 'All device slots are already connected' });
    }

    const log = await ConnectionLog.create({
        vpnAccount: account._id,
        server: account.server,
        connectedAt: Date.now(),
        simulatedDeviceLabel: req.body.deviceLabel || `Device ${account.devicesConnected + 1}`
    });

    account.devicesConnected += 1;
    await account.save();

    res.status(201).json({ success: true, log, account });
};

// POST /api/v1/vpn/:id/simulate-disconnect
exports.simulateDisconnect = async (req, res, next) => {
    const account = await VpnAccount.findById(req.params.id);
    if (!account) {
        return res.status(404).json({ success: false, message: 'VPN account not found' });
    }
    if (account.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const log = await ConnectionLog.findOne({
        vpnAccount: account._id,
        disconnectedAt: null
    }).sort({ connectedAt: -1 });

    if (log) {
        log.disconnectedAt = Date.now();
        await log.save();
    }

    account.devicesConnected = Math.max(0, account.devicesConnected - 1);
    await account.save();

    res.status(200).json({ success: true, account });
};

// GET /api/v1/vpn/:id/history — simulated connection/usage history log.
exports.connectionHistory = async (req, res, next) => {
    const account = await VpnAccount.findById(req.params.id);
    if (!account) {
        return res.status(404).json({ success: false, message: 'VPN account not found' });
    }
    if (account.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const logs = await ConnectionLog.find({ vpnAccount: account._id }).sort({ connectedAt: -1 });
    res.status(200).json({ success: true, logs });
};

// Admin: all VPN accounts, for the dashboard tier-distribution chart.
exports.allVpnAccounts = async (req, res, next) => {
    const accounts = await VpnAccount.find().populate('server').populate('user', 'name email');
    res.status(200).json({ success: true, accounts });
};
