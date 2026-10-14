const Server = require('../models/server');

// Public/authenticated: list servers, optionally filtered by tier and availability.
// Used by the Premium server-picker at checkout.
// GET /api/v1/servers?tier=premium&availableOnly=true
exports.getServers = async (req, res, next) => {
    const filter = { status: 'active' };

    if (req.query.tier) {
        filter.tier = { $in: [req.query.tier, 'both'] };
    }

    let servers = await Server.find(filter).sort({ country: 1, city: 1 });

    if (req.query.availableOnly === 'true') {
        servers = servers.filter(s => s.activeConnections < s.capacity);
    }

    res.status(200).json({
        success: true,
        servers
    });
};

exports.getSingleServer = async (req, res, next) => {
    const server = await Server.findById(req.params.id);
    if (!server) {
        return res.status(404).json({ success: false, message: 'Server not found' });
    }
    res.status(200).json({ success: true, server });
};

// Admin: full list regardless of status, for the Servers admin page.
exports.getAdminServers = async (req, res, next) => {
    const servers = await Server.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, servers });
};

// Admin: create a new server location.
exports.newServer = async (req, res, next) => {
    const server = await Server.create(req.body);
    if (!server) {
        return res.status(400).json({ success: false, message: 'Server not created' });
    }
    res.status(201).json({ success: true, server });
};

// Admin: update a server location (capacity, status, tier, etc).
exports.updateServer = async (req, res, next) => {
    let server = await Server.findById(req.params.id);
    if (!server) {
        return res.status(404).json({ success: false, message: 'Server not found' });
    }
    server = await Server.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, server });
};

// Admin: delete a server location.
exports.deleteServer = async (req, res, next) => {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) {
        return res.status(404).json({ success: false, message: 'Server not found' });
    }
    res.status(200).json({ success: true, message: 'Server deleted' });
};
