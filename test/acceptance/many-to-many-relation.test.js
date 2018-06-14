const {assert} = require('chai')
const {api} = require('../../src')
const {app} = require('../utils')
const {connect, clean, disconnect, Tag, Post} = require('../db')
const {model, generate, merge, S} = require('wajez-utils')

const it = require('wajez-api-test')(require('./app'))

const makePost = () => {
  const post = generate(model(Post))()
  post.tagsLength = 0
  return post
}

const makeTag = generate(model(Tag))

describe('Acceptance > Many to Many Relation', () => {
  before(async () => {
    await connect()
    await clean()
  })

  const tags = [makeTag(), makeTag(), makeTag()]
  const posts = [makePost(), makePost(), makePost()]

  // add posts and tags
  for (let i = 0; i < 3; i ++) {
    const index = i
    it.post('/posts', {
      data: posts[index],
      verify: (res, done) => {
        posts[index] = res.body
        done()
      }
    })
    it.post('/tags', {
      data: tags[index],
      verify: (res, done) => {
        tags[index] = res.body
        done()
      }
    })
  }

  // add tag0 to post0
  it.put('/posts/:id', {
    params: () => posts[0],
    data: () => ({
      tags: {add: [tags[0].id]}
    })
  })
  // check post0 has tag0
  it.get('/posts/:id/tags', {
    params: () => posts[0],
    body: () => [tags[0]]
  })
  // check post0's tagsLength
  it.get('/posts/:id', {
    params: () => posts[0],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, 1)
      posts[0].tagsLength = 1
      done()
    }
  })
  // check tag0 has post0
  it.get('/tags/:id/posts', {
    params: () => tags[0],
    body: () => [posts[0]]
  })

  // add post1 to tag0
  it.put('/tags/:id', {
    params: () => tags[0],
    data: () => ({
      posts: {add: [posts[1].id]}
    })
  })
  // check post1's tagsLength
  it.get('/posts/:id', {
    params: () => posts[1],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, 1)
      posts[1].tagsLength = 1
      done()
    }
  })
  // check tag0 has posts 0 and 1
  it.get('/tags/:id/posts', {
    params: () => tags[0],
    body: () => [posts[0], posts[1]]
  })
  // check post 0 has tag0
  it.get('/posts/:id/tags', {
    params: () => posts[0],
    body: () => [tags[0]]
  })
  // check post 1 has tag0
  it.get('/posts/:id/tags', {
    params: () => posts[1],
    body: () => [tags[0]]
  })
  // add post2 and remove post 0 from tag0
  it.put('/tags/:id', {
    params: () => tags[0],
    data: () => ({
      posts: {add: [posts[2].id], remove: [posts[0].id]}
    })
  })
  // check post0's tagsLength
  it.get('/posts/:id', {
    params: () => posts[0],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, 0)
      posts[0].tagsLength = 0
      done()
    }
  })
  // check post2's tagsLength
  it.get('/posts/:id', {
    params: () => posts[2],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, 1)
      posts[2].tagsLength = 1
      done()
    }
  })
  // check post0 has no tags
  it.get('/posts/:id/tags', {
    params: () => posts[0],
    body: () => []
  })
  // check post1 has tag0
  it.get('/posts/:id/tags', {
    params: () => posts[1],
    body: () => [tags[0]]
  })
  // check post2 has tag0
  it.get('/posts/:id/tags', {
    params: () => posts[2],
    body: () => [tags[0]]
  })
  // check tag0 has posts 1 and 2
  it.get('/tags/:id/posts', {
    params: () => tags[0],
    body: () => [posts[1], posts[2]]
  })

  // add post having tags
  it.post('/posts', {
    data: () => merge(makePost(), {tags: tags.map(_ => _.id)}),
    verify: (res, done) => {
      posts.push(res.body)
      done()
    }
  })
  // check post3's tagsLength
  it.get('/posts/:id', {
    params: () => posts[3],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, tags.length)
      posts[3].tagsLength = tags.length
      done()
    }
  })
  // check post 3 has all tags
  it.get('/posts/:id/tags', {
    params: () => posts[3],
    body: () => tags
  })
  // check tag0 has posts 1, 2, and 3
  it.get('/tags/:id/posts', {
    params: () => tags[0],
    body: () => posts.slice(1)
  })
  // check tag1 has post 3
  it.get('/tags/:id/posts', {
    params: () => tags[1],
    body: () => [posts[3]]
  })
  // check tag2 has post 3
  it.get('/tags/:id/posts', {
    params: () => tags[2],
    body: () => [posts[3]]
  })
  // remove tag2
  it.delete('/tags/:id', {
    params: () => tags[2]
  })
  // check post3's tagsLength
  it.get('/posts/:id', {
    params: () => posts[3],
    verify: (res, done) => {
      assert.equal(res.body.tagsLength, 2)
      posts[3].tagsLength = 2
      done()
    }
  })
  // check post3 has tags 0 and 1
  it.get('/posts/:id/tags', {
    params: () => posts[3],
    body: () => tags.slice(0, 2)
  })
  // remove post3
  it.delete('/posts/:id', {
    params: () => posts[3]
  })
  // check tag0 has posts 1 and 2
  it.get('/tags/:id/posts', {
    params: () => tags[0],
    body: () => [posts[1], posts[2]]
  })
  // check tag1 has no posts
  it.get('/tags/:id/posts', {
    params: () => tags[1],
    body: () => []
  })

  after(disconnect)
})
