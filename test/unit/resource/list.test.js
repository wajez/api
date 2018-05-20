const {assert} = require('chai')
const {User, Post, Comment} = require('../../db')
const {assertRoute} = require('../../utils')
const {list, onReadParams, setOffset} = require('../../../src')
const {id, merge} = require('wajez-utils')

describe('Unit > Resource > list', () => {

  const now = new Date()

  const users = [{
    id: Buffer.from('111111', 'hex'),
    account: Buffer.from('551111', 'hex'),
    posts: [
      Buffer.from('221111', 'hex'),
      Buffer.from('222222', 'hex'),
    ],
    name: 'Naruto',
    picture: Buffer.from('kagi-bunshen-picture'),
    since: now,
    rank: 5
  }, {
    id: Buffer.from('112222', 'hex'),
    account: Buffer.from('552222', 'hex'),
    posts: [
      Buffer.from('223333', 'hex'),
      Buffer.from('224444', 'hex'),
    ],
    name: 'Sasuke',
    picture: Buffer.from('katun-picture'),
    since: now,
    rank: 4.5
  }]

  it('creates a route which returns list of resources', () =>
    assertRoute(list(User), {
      method: 'get',
      uri: '/users',
      req: {
        query: {
          where: '{"name": "Sasuke"}'
        }
      },
      query: {
        type: 'find',
        conditions: {name: 'Sasuke'},
        projection: null,
        options: {
          skip: 0,
          limit: 100,
          sort: null,
        },
        populate: []
      },
      dbData: users,
      sentData: users.map(user => ({
        id: id(user.id),
        name: user.name,
        since: user.since,
        rank: user.rank,
        picture: user.picture.toString()
      }))
    })
  )

  it('overrites the uri', () =>
    assertRoute(list(User, {
      uri: '/custom-uri'
    }), {
      method: 'get',
      uri: '/custom-uri'
    })
  )

  it('modifies the converter', () =>
    assertRoute(list(User, {
      converter: {
        picture: _ => null
      }
    }), {
      method: 'get',
      uri: '/users',
      dbData: users,
      sentData: users.map(user => ({
        id: id(user.id),
        name: user.name,
        since: user.since,
        rank: user.rank,
        picture: null
      }))
    })
  )

  it('handles pagination params', () =>
    assertRoute(list(User), {
      method: 'get',
      uri: '/users',
      req: {
        query: {
          offset: '21',
          limit: '33'
        }
      },
      query: {
        type: 'find',
        conditions: {},
        projection: null,
        options: {
          skip: 21,
          limit: 33,
          sort: null
        },
        populate: []
      }
    })
  )

  it('overrides pagination params', () =>
    assertRoute(list(User, {
      actions: [
        onReadParams(setOffset('start', 0))
      ]
    }), {
      method: 'get',
      uri: '/users',
      req: {
        query: {
          limit: '33',
          start: '11'
        }
      },
      query: {
        type: 'find',
        conditions: {},
        projection: null,
        options: {
          skip: 11,
          limit: 33,
          sort: null
        },
        populate: []
      }
    })
  )

  it('sorts the list', () =>
    assertRoute(list(User), {
      method: 'get',
      uri: '/users',
      req: {
        query: {
          sort: 'name'
        }
      },
      query: {
        type: 'find',
        conditions: {},
        projection: null,
        options: {
          skip: 0,
          limit: 100,
          sort: 'name'
        },
        populate: []
      }
    })
  )

})
