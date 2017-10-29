const R          = require('ramda')
    , api        = require('../../src/')
    , transform  = require('wajez-transform')
    , User       = require('./user')

const app = api({
    database: `mongodb://localhost/wajez-api`
})

app.resource(User, {
    json: {
        resource: R.pick(['id', 'name', 'email', 'token']),
        collectionItem: R.pick(['id', 'name', 'email'])
    },
    add: {
        beforeQuery: req => {
            req.body.token = '0123456789012345678901234567890123456789012345678901234567890123'
        }
    }
})

module.exports = app
