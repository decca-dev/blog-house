const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    category: {
        type: String
    },
    actionType: {
        type: String
    },
    by: {
        type: String,
    },
    onUser: {
        type: String
    },
    reason: {
        type: String,
        default: "Unspecified"
    },
    at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Log', logSchema);