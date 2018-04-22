const {assert} = require('chai')
const {connect, disconnect, User} = require('../db')
const {model, generate, merge} = require('wajez-utils')

const it = require('wajez-api-test')(require('./app'))

const make = () => {
  const user = generate(model(User))()
  user.picture = user.picture.toString()
  return user
}

describe('Acceptance > Simple CRUD', () => {
  before(async () => {
    await connect()
    await User.remove({})
  })

  let users = [make(), make()]

  // the list is empty
  it.get('/users', {
    body: []
  })
  // add new user
  it.post('/users', {
    data: () => users[0],
    // body: () => users[0],
    verify: (res, done) => {
      users[0] = res.body
      done()
    }
  })
  // the list contains one user
  it.get('/users', {
    body: () => [users[0]]
  })
  // the user can be shown
  it.get('/users/:id', {
    params: () => users[0],
    body: () => users[0]
  })
  // edit the user
  it.put('/users/:id', {
    params: () => users[0],
    data: () => users[1],
    verify: (res, done) => {
      users[0] = res.body
      done()
    }
  })
  // the user is modified
  it.get('/users/:id', {
    params: () => users[0],
    body: () => users[0]
  })
  // remove the user
  it.delete('/users/:id', {
    params: () => users[0]
  })
  // the list is empty
  it.get('/users', {
    body: []
  })
  // showing the user returns null
  it.get('/users/:id', {
    params: () => users[0],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  // can't edit missing user
  it.put('/users/:id', {
    params: () => users[0],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })

  after(disconnect)
})
