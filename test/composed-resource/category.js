const mongoose = require('mongoose')
    , Schema   = mongoose.Schema

const schema = new Schema({
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    name: {
        type: String,
        maxLength: 50
    }
})

const Category = mongoose.model('Category', schema)

module.exports = Category
