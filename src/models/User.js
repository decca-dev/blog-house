const mongoose = require('mongoose');
const slugify = require('slugify');
const genID = require('../misc/genID');
const genKey = require('../misc/genKey');

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
    uid: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/decc00n/image/upload/v1619792623/user.png'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        default: ''
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
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    reputation: {
        type: Number,
        default: 0
    }
});

userSchema.pre('validate', function(next) {
    this.slug = slugify(this.name, { lower: true, strict: true })

    this.uid = genID();

    this.apiKey = genKey();

    next();
});

module.exports = mongoose.model('User', userSchema)