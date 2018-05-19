const jwt = require('jsonwebtoken')
const {assert} = require('chai')
const {connect, clean, disconnect, Account} = require('../../db')
const {runMiddlewares} = require('../../utils')
const {auth} = require('../../../src')

describe('Unit > Middlewares > auth', () => {
  before(async () => {
    await connect()
    await clean()
  })

  const secret = 'SomeVerySecureKey!'

  it('returns error if token is missing', async () => {
    const req = {}
    const result = await runMiddlewares([auth({secret}, Account)], req, {})
    assert.isDefined(result.error)
    assert.equal(result.error.name, 'UnauthorizedError')
  })

  it('returns error if token is wrong', async () => {
    const req = {
      headers: {
        authorization: 'Bearer blablabla'
      }
    }
    const result = await runMiddlewares([auth({secret}, Account)], req, {})
    assert.isDefined(result.error)
    assert.equal(result.error.name, 'UnauthorizedError')
  })

  it('returns error if record is missing', async () => {
    const req = {
      headers: {
        authorization: 'Bearer ' + jwt.sign({id: '5aff49a6b82cdb1be2218752'}, secret)
      }
    }
    const result = await runMiddlewares([auth({secret}, Account)], req, {})
    assert.isDefined(result.error)
    assert.equal(result.error.name, 'UnauthorizedError')
  })

  it('sets the record in the request object', async () => {
    const user = await Account.create({email: 'some@email.com', password: 'somePassword'})
    const req = {
      headers: {
        authorization: 'Bearer ' + jwt.sign({id: user.id}, secret)
      }
    }
    const result = await runMiddlewares([auth({secret}, Account)], req, {})
    assert.isUndefined(result.error)
    assert.isDefined(req.user)
    assert.equal(req.user.id, user.id)
    assert.equal(req.user.email, user.email)
  })

  after(disconnect)
})
