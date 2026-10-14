const mongoose = require('mongoose')

const serverSchema = new mongoose.Schema({
    label: {
        type: String,
        required: [true, 'Please enter a server label'],
        trim: true,
        maxLength: [60, 'Server label cannot exceed 60 characters']
    },
    country: {
        type: String,
        required: [true, 'Please enter the server country']
    },
    city: {
        type: String,
        required: [true, 'Please enter the server city']
    },
    simulatedIp: {
        type: String,
        required: [true, 'Please enter a simulated IP address'],
        default: '10.0.0.1'
    },
    capacity: {
        type: Number,
        required: [true, 'Please enter server capacity'],
        default: 50
    },
    activeConnections: {
        type: Number,
        default: 0
    },
    tier: {
        type: String,
        required: true,
        enum: {
            values: ['basic', 'premium', 'both'],
            message: 'Please select a valid tier for this server'
        },
        default: 'both'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['active', 'maintenance', 'offline'],
            message: 'Please select a valid status for this server'
        },
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Server', serverSchema);
