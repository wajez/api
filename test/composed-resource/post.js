const mongoose = require('mongoose')
    , Schema   = mongoose.Schema

const schema = new Schema({
    title: String,
    content: String
})

const Post = mongoose.model('Post', schema)

module.exports = Post
