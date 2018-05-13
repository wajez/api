const {assert} = require('chai')
const {User, Post, Comment} = require('../../db')
const {assertRoute} = require('../../utils')
const {add, beforeQuery} = require('../../../src')
const {id, merge} = require('wajez-utils')

describe('Unit > Resource > add', () => {

  it('adds new records', () =>
    assertRoute(add(User), {
      method: 'post',
      uri: '/users',
      req: {
        body: {
          name: 'Amine',
          rank: 5
        }
      },
      query: {
        type: 'create',
        data: {
          name: 'Amine',
          rank: 5
        },
        relations: []
      }
    })
  )

  it('transforms data', () =>
    assertRoute(add(User, {
      actions: [
        beforeQuery((req, res, next) => {
          req.body.name = 'Baaka'
          next()
        })
      ]
    }), {
      method: 'post',
      uri: '/users',
      req: {
        body: {
          name: 'Amine',
          rank: 5
        }
      },
      query: {
        type: 'create',
        data: {
          name: 'Baaka',
          rank: 5
        },
        relations: []
      }
    })
  )

})
