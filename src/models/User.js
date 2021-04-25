const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    id: {
        type: String
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    totalPosts: {
        type: Number,
        default: 0
    },
    bio: {
        type: String
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    apiKey: {
        type: String
    }
});

module.exports = mongoose.model('User', userSchema)