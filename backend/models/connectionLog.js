const mongoose = require('mongoose')

// A simulated connection/usage history entry. Created only when the user
// clicks "Simulate Connect" in the dashboard — not by any real network
// activity, since no real VPN tunnel exists in this project.
const connectionLogSchema = new mongoose.Schema({
    vpnAccount: {
        type: mongoose.Schema.ObjectId,
        ref: 'VpnAccount',
        required: true
    },
    server: {
        type: mongoose.Schema.ObjectId,
        ref: 'Server',
        required: true
    },
    connectedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    disconnectedAt: {
        type: Date,
        default: null
    },
    simulatedDeviceLabel: {
        type: String,
        default: 'Device 1'
    }
})

module.exports = mongoose.model('ConnectionLog', connectionLogSchema);
