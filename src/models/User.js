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
    },
    password: {
        type: String,
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    uid: {
        type: String,
        required: true,
        unique: true,
        default: genID()
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/decc00n/image/upload/v1619792623/user.png'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bannedAt: {
        type: Date
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
        unique: true,
        default: genKey()
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    resetLink: {
        type: String,
        default: ''
    },
    posRep: {
        type: Number,
        default: 0
    },
    negRep: {
        type: Number,
        default: 0
    },
    hasPosRepped: {
        type: Array,
        default: [],
    },
    hasNegRepped: {
        type: Array,
        default: []
    }
});

userSchema.pre('validate', function(next) {
    this.slug = slugify(this.name, { lower: true, strict: true })

    next();
});

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.resetLink;
    delete obj.apiKey;
    delete obj.email;
    delete obj.__v;
    return obj;
}

module.exports = mongoose.model('User', userSchema)