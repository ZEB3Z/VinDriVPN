const mongoose = require('mongoose')
const crypto = require('crypto')

const vpnAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    },
    tier: {
        type: String,
        required: true,
        enum: ['basic', 'premium']
    },
    server: {
        type: mongoose.Schema.ObjectId,
        ref: 'Server',
        required: true
    },
    deviceSlotLimit: {
        type: Number,
        required: true,
        default: 1
    },
    devicesConnected: {
        type: Number,
        default: 0
    },
    bandwidthTier: {
        type: String,
        enum: ['capped', 'unlimited'],
        default: 'capped'
    },
    killSwitchEnabled: {
        type: Boolean,
        default: false
    },
    dedicatedIp: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'revoked'],
        default: 'active'
    },
    credentialUsername: {
        type: String,
        unique: true
    },
    credentialToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Generate a simulated username/token pair before saving, if not already set.
// This is display-only: it does not correspond to any real VPN credential.
vpnAccountSchema.pre('validate', function (next) {
    if (!this.credentialUsername) {
        this.credentialUsername = 'vd-' + crypto.randomBytes(4).toString('hex')
    }
    if (!this.credentialToken) {
        this.credentialToken = crypto.randomBytes(16).toString('hex')
    }
    next()
})

module.exports = mongoose.model('VpnAccount', vpnAccountSchema);
