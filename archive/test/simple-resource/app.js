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
    }
})

module.exports = app
