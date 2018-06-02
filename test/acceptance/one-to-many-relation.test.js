const {assert} = require('chai')
const {api} = require('../../src')
const {app} = require('../utils')
const {connect, clean, disconnect, User, Post} = require('../db')
const {model, generate, merge, S} = require('wajez-utils')

const it = require('wajez-api-test')(require('./app'))

const makeUser = () => {
  const user = generate(model(User))()
  user.picture = user.picture.toString()
  return user
}

const makePost = generate(model(Post))

describe('Acceptance > One to Many Relation', () => {
  before(async () => {
    await connect()
    await clean()
  })

  const users = [makeUser(), makeUser()]
  const posts = []
  for (let i = 0; i < 10; i ++)
    posts.push(makePost())

  // add user0
  it.post('/users', {
    data: users[0],
    verify: (res, done) => {
      users[0] = res.body
      done()
    }
  })
  // check user0 posts list is empty
  it.get('/users/:id/posts', {
    params: () => users[0],
    body: []
  })
  // add post0 with user0 as writer
  it.post('/posts', {
    data: () => merge(posts[0], {writer: users[0].id}),
    verify: (res, done) => {
      posts[0] = res.body
      done()
    }
  })
  // check user0 posts list contains post0
  it.get('/users/:id/posts', {
    params: () => users[0],
    body: () => [posts[0]]
  })
  // check post0 writer is user0
  it.get('/posts/:id/writer', {
    params: () => posts[0],
    body: () => users[0]
  })
  // add post1..9 to user0's posts
  for (let i = 1; i < 10; i ++) {
    const index = i
    it.post('/posts', {
      data: () => posts[index],
      verify: (res, done) => {
        posts[index] = res.body
        done()
      }
    })
  }
  it.put('/users/:id', {
    params: () => users[0],
    data: () => ({posts: posts.map(_ => _.id)})
  })
  it.get('/posts', {
    verify: (res, done) => {
      for (let i = 1; i < 10; i ++)
        posts[i] = res.body[i]
      done()
    }
  })
  // check user0 list contains all posts
  it.get('/users/:id/posts', {
    params: () => users[0],
    body: () => posts
  })
  // check can use offset and limit params
  it.get('/users/:id/posts?limit=3', {
    params: () => users[0],
    body: () => posts.slice(0, 3)
  })
  it.get('/users/:id/posts?sort=title', {
    params: () => users[0],
    body: () => S.sortBy(S.prop('title'), posts)
  })
  // update post9 to have no writer
  it.put('/posts/:id', {
    params: () => posts[9],
    data: () => ({writer: null})
  })
  // add user1 with post9
  it.post('/users', {
    data: () => merge(users[1], {posts: [posts[9].id]}),
    verify: (res, done) => {
      users[1] = res.body
      done()
    }
  })
  it.get('/posts', {
    verify: (res, done) => {
      for (let i = 1; i < 10; i ++)
        posts[i] = res.body[i]
      done()
    }
  })
  // check user1 posts list contains post9
  it.get('/users/:id/posts', {
    params: () => users[1],
    body: () => [posts[9]]
  })
  // check user0 posts list contains posts0..8
  it.get('/users/:id/posts', {
    params: () => users[0],
    body: () => posts.slice(0, 9)
  })
  // check post9 writer is user1
  it.get('/posts/:id/writer', {
    params: () => posts[9],
    body: () => users[1]
  })
  // remove post0
  it.delete('/posts/:id', {
    params: () => posts[0]
  })
  // check user0 posts list contains posts1..8
  it.get('/users/:id/posts', {
    params: () => users[0],
    body: () => posts.slice(1, 9)
  })
  // remove user0
  it.delete('/users/:id', {
    params: () => users[0]
  })
  // check posts1..8 have no writer
  for (let i = 1; i < 9; i ++) {
    const index = i
    it.get('/posts/:id/writer', {
      params: () => posts[index],
      verify: (res, done) => {
        assert.isNull(res.body)
        done()
      }
    })
  }
  // add post0
  it.post('/posts', {
    data: () => merge(posts[0], {id: undefined, writer: null}),
    verify: (res, done) => {
      posts[0] = res.body
      done()
    }
  })
  // add posts 0 and 1 to user1
  it.put('/users/:id', {
    params: () => users[1],
    data: () => ({
      posts: {
        add: [posts[0].id, posts[1].id]
      }
    })
  })
  // check users1 posts
  it.get('/users/:id/posts', {
    params: () => users[1],
    body: () => [
      merge(posts[1], {writer: users[1].id}),
      posts[9],
      merge(posts[0], {writer: users[1].id})
    ]
  })
  // check posts 9, 0 and 1 has user1 as writer
  it.get('/posts/:id/writer', {
    params: () => posts[9],
    body: () => users[1]
  })
  it.get('/posts/:id/writer', {
    params: () => posts[0],
    body: () => users[1]
  })
  it.get('/posts/:id/writer', {
    params: () => posts[1],
    body: () => users[1]
  })
  // remove post9 and add post2
  it.put('/users/:id', {
    params: () => users[1],
    data: () => ({
      posts: {
        add: [posts[2].id],
        remove: [posts[9].id]
      }
    })
  })
  // check post9 has no writer
  it.get('/posts/:id/writer', {
    params: () => posts[9],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  // check post2 has user1 as writer
  it.get('/posts/:id/writer', {
    params: () => posts[2],
    body: () => users[1]
  })

  after(disconnect)
})
