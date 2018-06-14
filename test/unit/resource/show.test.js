const {assert} = require('chai')
const {User, Post, Comment} = require('../../db')
const {assertRoute} = require('../../utils')
const {show, beforeRun, setQuery, getQuery} = require('../../../src')
const {I, id, merge} = require('wajez-utils')

describe('Unit > Resource > show', () => {

  const now = new Date()

  const user = {
    id: Buffer.from('111111', 'hex'),
    account: Buffer.from('551111', 'hex'),
    posts: [{
      id: Buffer.from('221111', 'hex'),
      writer: Buffer.from('111111', 'hex'),
      comments: [
        Buffer.from('331111', 'hex'),
        Buffer.from('332222', 'hex')
      ],
      title: 'Post 1',
      content: 'Post 1 content here'
    }, {
      id: Buffer.from('222222', 'hex'),
      writer: Buffer.from('111111', 'hex'),
      comments: [
        Buffer.from('331111', 'hex'),
        Buffer.from('332222', 'hex')
      ],
      title: 'Post 2',
      content: 'Post 2 content here'
    }],
    postsLength: 2,
    name: 'Naruto',
    picture: Buffer.from('kagi-bunshen-picture'),
    since: now,
    rank: 5
  }

  it('shows a record', () =>
    assertRoute(show(User), {
      method: 'get',
      uri: '/users/:id',
      req: {
        params: {
          id: '111111'
        }
      },
      query: {
        type: 'find',
        conditions: {_id: '111111'},
        projection: null,
        options: {
          limit: 1,
        },
        populate: []
      }
    })
  )

  it('changes the param and query', () =>
    assertRoute(show(User, {
      uri: '/account/:name',
      actions: [
        beforeRun(setQuery(async req => {
          const query = getQuery(req)
          query.conditions = {name: req.params.name}
          return query
        }))
      ]
    }), {
      method: 'get',
      uri: '/account/:name',
      req: {
        params: {
          name: 'Amine'
        }
      },
      query: {
        type: 'find',
        conditions: {name: 'Amine'},
        projection: null,
        options: {
          limit: 1,
        },
        populate: []
      }
    })
  )

  it('can populate children', () =>
    assertRoute(show(User, {
      converter: {
        posts: {
          id,
          title: I,
          content: I
        }
      },
      actions: [
        beforeRun(setQuery(async req => merge(getQuery(req), {
          populate: [{
            path: 'posts',
            match: {},
            select: null,
            options: {}
          }]
        })))
      ]
    }), {
      method: 'get',
      uri: '/users/:id',
      req: {
        params: {
          id: '111111'
        }
      },
      query: {
        type: 'find',
        conditions: {_id: '111111'},
        projection: null,
        options: {
          limit: 1
        },
        populate: [{
          path: 'posts',
          match: {},
          select: null,
          options: {}
        }]
      },
      dbData: [user],
      sentData: {
        id: '111111',
        account: '551111',
        posts: [{
          id: '221111',
          title: 'Post 1',
          content: 'Post 1 content here'
        }, {
          id: '222222',
          title: 'Post 2',
          content: 'Post 2 content here'
        }],
        postsLength: 2,
        name: 'Naruto',
        picture: Buffer.from('kagi-bunshen-picture').toString(),
        since: now,
        rank: 5
      }
    })
  )

})
