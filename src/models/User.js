const mongoose = require('mongoose');
const slugify = require('slugify');

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
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.pre('validate', function(next) {
    this.slug = slugify(this.name, { lower: true, strict: true })

    next();
});

module.exports = mongoose.model('User', userSchema)