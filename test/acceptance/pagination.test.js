const {assert} = require('chai')
const {connect, disconnect, User} = require('../db')
const {I, id, model, applyConverter, generate, S} = require('wajez-utils')

const it = require('wajez-api-test')(require('./app'))

const make = () => {
  const user = generate(model(User))()
  user.picture = user.picture.toString()
  return user
}

describe('Acceptance > Pagination and Sort', () => {
  let users = []

  before(async () => {
    await connect()
    await User.remove({})
    for(let i = 0; i < 150; i++)
      users.push(make())
    await User.insertMany(users)
  })

  it.get('/users?limit=200', {
    verify: (res, done) => {
      assert.lengthOf(res.body, 150)
      assert.equal(res.get('Content-Total'), 150)
      users = res.body
      done()
    }
  })

  it.get('/users', {
    body: () => users.slice(0, 100),
    verify: (res, done) => {
      assert.equal(res.get('content-total'), 150)
      done()
    }
  })

  it.get('/users?offset=17&limit=24', {
    body: () => users.slice(17, 41)
  })

  it.get('/users?sort=name', {
    body: () => S.fromMaybe([], S.take(100, S.sortBy(S.prop('name'), users)))
  })

  after(disconnect)
})
