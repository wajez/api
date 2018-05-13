const {assert} = require('chai')
const {connect, disconnect, clean, User, Account} = require('../db')
const {model, generate, merge} = require('wajez-utils')

const it = require('wajez-api-test')(require('./app'))

const makeUser = () => {
  const user = generate(model(User))()
  user.picture = user.picture.toString()
  return user
}

const makeAccount = generate(model(Account))

describe('Acceptance > One to One Relation', () => {
  before(async () => {
    await connect()
    await clean()
  })

  const users = [makeUser(), makeUser()]
  const accounts = [makeAccount(), makeAccount()]

  // add user1
  it.post('/users', {
    data: users[0],
    verify: (res, done) => {
      users[0] = res.body
      done()
    }
  })
  // check user1's account is null
  it.get('/users/:id/account', {
    params: () => users[0],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  // add account1 with user1 as owner
  it.post('/accounts', {
    data: () => merge(accounts[0], {owner: users[0].id}),
    verify: (res, done) => {
      accounts[0] = res.body
      done()
    }
  })
  // check account1's owner is user1
  it.get('/accounts/:id/owner', {
    params: () => accounts[0],
    body: () => users[0]
  })
  // check user1's account is account1
  it.get('/users/:id/account', {
    params: () => users[0],
    body: () => accounts[0]
  })
  // check adding account2 with user1 as owner returns error
  it.post('/accounts', {
    data: () => merge(accounts[1], {owner: users[0].id}),
    status: 500
  })
  // add account2
  it.post('/accounts', {
    data: () => accounts[1],
    verify: (res, done) => {
      accounts[1] = res.body
      done()
    }
  })
  // add user2 with account2
  it.post('/users', {
    data: () => merge(users[1], {account: accounts[1].id}),
    verify: (res, done) => {
      users[1] = res.body
      done()
    }
  })
  // check user2's account is account2
  it.get('/users/:id/account', {
    params: () => users[1],
    body: () => accounts[1]
  })
  // check account2's owner is user2
  it.get('/accounts/:id/owner', {
    params: () => accounts[1],
    body: () => users[1]
  })
  // check updating user1 to use account2 triggers error
  it.put('/users/:id', {
    params: () => users[0],
    data: () => ({account: accounts[1].id}),
    status: 500
  })
  // remove user2
  it.delete('/users/:id', {
    params: () => users[1]
  })
  // check account2's owner is null
  it.get('/accounts/:id/owner', {
    params: () => accounts[1],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  // update user1 to use account2
  it.put('/users/:id', {
    params: () => users[0],
    data: () => ({account: accounts[1].id})
  })
  // check user1's account is account2
  it.get('/users/:id/account', {
    params: () => users[0],
    body: () => accounts[1]
  })
  // check account2's owner is user1
  it.get('/accounts/:id/owner', {
    params: () => accounts[1],
    body: () => users[0]
  })
  // check account1's owner is null
  it.get('/accounts/:id/owner', {
    params: () => accounts[0],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  // update account2 to have no owner
  it.put('/accounts/:id', {
    params: () => accounts[1],
    data: {owner: null}
  })
  // check user1's account is null
  it.get('/users/:id/account', {
    params: () => users[0],
    verify: (res, done) => {
      assert.isNull(res.body)
      done()
    }
  })
  after(disconnect)
})
