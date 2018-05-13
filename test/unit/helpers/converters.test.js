const assert = require('chai').assert
const mongoose = require('mongoose')
const {Schema} = mongoose
const {converter, resource, listItem} = require('../../../src/helpers/converters')
const {applyConverter, reference, model} = require('wajez-utils')

describe('Unit > helpers > converters', () => {
  const User = mongoose.model('UnitHelpersUser', new Schema({
    posts: [{
      type: Schema.Types.ObjectId,
      ref: 'UnitHelpersPost'
    }],
    name: String,
    picture: Buffer,
    since: Date,
    rank: Number,
    links: {
      facebook: String,
      twitter: String,
      github: String
    }
  }))
  const Post = mongoose.model('UnitHelpersPost', new Schema({
    writer: {
      type: Schema.Types.ObjectId,
      ref: 'UnitHelpersUser'
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'UnitHelpersComment'
    }],
    title: String,
    content: String
  }))
  const PostComment = mongoose.model('UnitHelpersComment', new Schema({
    post: {
      type: Schema.Types.ObjectId,
      ref: 'UnitHelpersPost'
    },
    writer: {
      type: Schema.Types.ObjectId,
      ref: 'UnitHelpersUser'
    },
    content: String
  }))

  const convert = (name, recursions) => applyConverter(converter(recursions, reference(`UnitHelpers${name}`)))
  const now = new Date()
  const userA = {
    id: Buffer.from('111111', 'hex'),
    posts: [{
      id: Buffer.from('221111', 'hex'),
      writer: Buffer.from('111111', 'hex'),
      comments: [{
        id: Buffer.from('331111', 'hex'),
        post: Buffer.from('221111', 'hex'),
        writer: Buffer.from('112222', 'hex'),
        content: 'First comment content!'
      }, {
        id: Buffer.from('332222', 'hex'),
        post: Buffer.from('221111', 'hex'),
        writer: Buffer.from('113333', 'hex'),
        content: 'Second comment content!'
      }],
      title: 'Post 1',
      content: 'Post 1 content here'
    }, {
      id: Buffer.from('222222', 'hex'),
      writer: Buffer.from('111111', 'hex'),
      comments: [{
        id: Buffer.from('331111', 'hex'),
        post: Buffer.from('222222', 'hex'),
        writer: Buffer.from('113333', 'hex'),
        content: 'Third comment content!'
      }, {
        id: Buffer.from('332222', 'hex'),
        post: Buffer.from('222222', 'hex'),
        writer: Buffer.from('115555', 'hex'),
        content: 'Fourth comment content!'
      }],
      title: 'Post 2',
      content: 'Post 2 content here'
    }],
    name: 'Amine',
    picture: Buffer.from('awesome-picture'),
    since: now,
    rank: 5,
    links: {
      facebook: 'fb.com',
      twitter: 'tw',
      github: 'ghub'
    }
  }

  it('makes a converter without recursion', () => {
    const convertUser = convert('User', 0)
    assert.deepEqual(convertUser(userA), {
      id: '111111',
      posts: ['221111', '222222'],
      name: 'Amine',
      picture: Buffer.from('awesome-picture').toString(),
      since: now,
      rank: 5,
      links: undefined
    })
  })

  it('makes a converter with 1 recursion', () => {
    const convertUser = convert('User', 1)
    assert.deepEqual(convertUser(userA), {
      id: '111111',
      posts: [{
        id: '221111',
        writer: '111111',
        comments: ['331111', '332222'],
        title: 'Post 1',
        content: 'Post 1 content here'
      }, {
        id: '222222',
        writer: '111111',
        comments: ['331111', '332222'],
        title: 'Post 2',
        content: 'Post 2 content here'
      }],
      name: 'Amine',
      picture: Buffer.from('awesome-picture').toString(),
      since: now,
      rank: 5,
      links: {
        facebook: 'fb.com',
        twitter: 'tw',
        github: 'ghub'
      }
    })
  })
})
