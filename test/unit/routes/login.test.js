const jwt = require('jsonwebtoken')
const {assert} = require('chai')
const {Account} = require('../../db')
const {assertRoute} = require('../../utils')
const {login} = require('../../../src')

describe('Unit > Routes > login', () => {

  const secret = 'SomeVerySecureKey!'

  it('returns error if no fields', () =>
    assertRoute(login(secret, Account, ['email', 'password']), {
      method: 'post',
      uri: '/login',
      error: {name: 'WrongCredentialsError'}
    })
  )

  it('returns error if a field is missing', () =>
    assertRoute(login(secret, Account, ['email', 'password']), {
      method: 'post',
      uri: '/login',
      req: {
        body: {
          email: 'foo@bar.com',
          pass: '123' // <- should be 'password'
        }
      },
      error: {name: 'WrongCredentialsError'}
    })
  )

  it('runs find query with fields', () =>
    assertRoute(login(secret, Account, ['email', 'password']), {
      method: 'post',
      uri: '/login',
      req: {
        body: {email: 'foo@bar.com', password: '123'}
      },
      query: {
        type: 'find',
        conditions: {email: 'foo@bar.com', password: '123'},
        projection: null,
        options: {
          limit: 1,
        },
        populate: []
      },
      dbData: [{
        id: 'foo'
      }]
    })
  )

  it('returns error if no record found on database', () =>
    assertRoute(login(secret, Account, ['email', 'password']), {
      method: 'post',
      uri: '/login',
      req: {
        body: {email: 'foo@bar.com', password: '123'}
      },
      query: {
        type: 'find',
        conditions: {email: 'foo@bar.com', password: '123'},
        projection: null,
        options: {
          limit: 1,
        },
        populate: []
      },
      dbData: [],
      error: {name: 'WrongCredentialsError'}
    })
  )

  it('returns a token', () =>
    assertRoute(login(secret, Account, ['email', 'password']), {
      method: 'post',
      uri: '/login',
      req: {
        body: {email: 'foo@bar.com', password: '123'}
      },
      query: {
        type: 'find',
        conditions: {email: 'foo@bar.com', password: '123'},
        projection: null,
        options: {
          limit: 1,
        },
        populate: []
      },
      dbData: [{id: 'fooId'}],
      sentData: {token: jwt.sign({id: 'fooId'}, secret)}
    })
  )

})
