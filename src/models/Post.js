const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDOMPurify(new JSDOM().window);

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    seenBy: {
        type: Array,
        default: []
    },
    author: {
        type: String
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHTML: {
        type: String,
        required: true
    }
})

postSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    if (this.markdown) {
        this.sanitizedHTML = dompurify.sanitize(marked(this.markdown))
    }

    next();
});

postSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj;
}

module.exports = mongoose.model('Post', postSchema);