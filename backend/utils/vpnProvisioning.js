const Server = require('../models/server');
const VpnAccount = require('../models/vpnAccount');

// Tier feature presets. Premium's device count/add-ons can be overridden by
// the values the customer picked at checkout (see premiumOptions below).
const TIER_DEFAULTS = {
    basic: {
        deviceSlotLimit: 1,
        bandwidthTier: 'capped',
        killSwitchEnabled: false,
        dedicatedIp: null
    },
    premium: {
        deviceSlotLimit: 5,
        bandwidthTier: 'unlimited',
        killSwitchEnabled: false,
        dedicatedIp: null
    }
};

// Basic tier: automatically finds any active server with an open slot.
// Uses a single atomic findOneAndUpdate so two concurrent Basic purchases
// cannot both land on the same last-open slot (avoids overselling capacity).
async function autoAssignServer(tier) {
    const server = await Server.findOneAndUpdate(
        {
            status: 'active',
            tier: { $in: [tier, 'both'] },
            $expr: { $lt: ['$activeConnections', '$capacity'] }
        },
        { $inc: { activeConnections: 1 } },
        { new: true }
    );

    if (!server) {
        throw new Error('No available VPN server slots at this time. Please try again shortly.');
    }
    return server;
}

// Premium tier: customer has already chosen a server id. Re-validate and
// claim the slot atomically at the moment of purchase, since availability
// may have changed since the picker was rendered.
async function claimChosenServer(serverId, tier) {
    const server = await Server.findOneAndUpdate(
        {
            _id: serverId,
            status: 'active',
            tier: { $in: [tier, 'both'] },
            $expr: { $lt: ['$activeConnections', '$capacity'] }
        },
        { $inc: { activeConnections: 1 } },
        { new: true }
    );

    if (!server) {
        throw new Error('The selected server no longer has an open slot. Please choose another server.');
    }
    return server;
}

// Releases a previously claimed slot (used if VpnAccount creation fails
// after a server was already claimed, to avoid leaking a slot).
async function releaseServerSlot(serverId) {
    await Server.findByIdAndUpdate(serverId, { $inc: { activeConnections: -1 } });
}

// Provisions a VpnAccount for a single paid order item that represents a
// VPN product. This is the core "fulfillment" step described in the
// project proposal: it simulates credential generation and server-slot
// assignment entirely at the database layer.
//
// options:
//   serviceType: 'vpn_basic' | 'vpn_premium'
//   userId, orderId, productId
//   premiumOptions: { serverId, deviceSlotLimit, killSwitchEnabled, dedicatedIpRequested } (premium only)
async function provisionVpnAccount({ serviceType, userId, orderId, productId, premiumOptions }) {
    const tier = serviceType === 'vpn_premium' ? 'premium' : 'basic';
    const defaults = TIER_DEFAULTS[tier];

    let server;
    if (tier === 'basic') {
        server = await autoAssignServer('basic');
    } else {
        if (!premiumOptions || !premiumOptions.serverId) {
            throw new Error('A server must be selected for Premium VPN accounts.');
        }
        server = await claimChosenServer(premiumOptions.serverId, 'premium');
    }

    try {
        const account = await VpnAccount.create({
            user: userId,
            order: orderId,
            product: productId,
            tier,
            server: server._id,
            deviceSlotLimit: (premiumOptions && premiumOptions.deviceSlotLimit) || defaults.deviceSlotLimit,
            bandwidthTier: defaults.bandwidthTier,
            killSwitchEnabled: tier === 'premium' && !!(premiumOptions && premiumOptions.killSwitchEnabled),
            dedicatedIp: (tier === 'premium' && premiumOptions && premiumOptions.dedicatedIpRequested)
                ? `10.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`
                : null
        });
        return account;
    } catch (err) {
        // Roll back the slot claim so a failed account creation doesn't
        // permanently strand a slot as "in use".
        await releaseServerSlot(server._id);
        throw err;
    }
}

module.exports = { provisionVpnAccount, autoAssignServer, claimChosenServer, releaseServerSlot };
