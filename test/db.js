const mongoose = require('mongoose')
const {Schema} = mongoose

const connect = async () => {
  mongoose.Promise = global.Promise
  return mongoose.connect(`mongodb://localhost/wajez-api`)
}

const clean = async () => {
  await Account.remove({})
  await Category.remove({})
  await Tag.remove({})
  await Comment.remove({})
  await Post.remove({})
  await User.remove({})
}

const disconnect = async () => {
  mongoose.connection.close()
}

const AlphaString = {
  type: String,
  match: /^[A-Za-z ]{5,25}$/
}

const AlphaText = {
  type: String,
  match: /^[A-Za-z ,-\.]{50,200}$/
}

const Category = mongoose.model('Category', new Schema({
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
  name: AlphaString
}))

const User = mongoose.model('User', new Schema({
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  },
  name: AlphaString,
  picture: Buffer,
  since: Date,
  rank: Number
}))

const Account = mongoose.model('Account', new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  email: AlphaString,
  password: AlphaString
}))

const Post = mongoose.model('Post', new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  title:  AlphaString,
  content: AlphaText
}))

const Comment = mongoose.model('Comment', new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: AlphaText
}))

const Tag = mongoose.model('Tag', new Schema({
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  name: AlphaString
}))

module.exports = {connect, disconnect, clean, Category, User, Account, Post, Comment, Tag}
