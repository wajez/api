const mongoose = require('mongoose')
const {Schema} = mongoose
const {oneOne, oneMany, manyOne, manyMany} = require('wajez-utils')

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
  name: {
    type: String,
    unique: true
  }
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
  name: {
    type: String,
    default: 'Anonymous'
  },
  picture: Buffer,
  since: Date,
  rank: Number
}))

const Account = mongoose.model('Account', new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['admin', 'user']
  },
  active: Boolean,
  email: {
    type: String,
    match: /^[^@]{2,30}@.{2,30}$/,
    unique: true,
  },
  password: {
    type: String,
    minLength: 8,
  }
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
  title:  {
    type: String,
    minLength: 5,
    maxLength: 50,
  },
  content: String
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
  content: String
}))

const Tag = mongoose.model('Tag', new Schema({
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  name: {
    type: String,
    unique: true
  }
}))

const relations = [
  oneMany('Category', 'children', 'Category', 'parent'),
  oneMany('Category', 'posts', 'Post', 'category'),
  oneOne('User', 'account', 'Account', 'owner'),
  oneMany('User', 'posts', 'Post', 'writer'),
  oneMany('Post', 'comments', 'Comment', 'post'),
  manyMany('Post', 'tags', 'Tag', 'posts'),
  manyOne('Comment', 'writer', 'User', null)
]

module.exports = {connect, disconnect, clean, Category, User, Account, Post, Comment, Tag, relations}
