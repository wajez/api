const express    = require('express')
    , bodyParser = require('body-parser')
    , mongoose   = require('mongoose')
    , R          = require('ramda')
    , transform  = require('wajez-transform')
    , User       = require('./user')
    , {resource} = require('../../')
    , app        = express()

mongoose.Promise = global.Promise
mongoose.connect(`mongodb://localhost/chwia-api-test`, {
    useMongoClient: true
})
const db = mongoose.connection

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}))

app.use(bodyParser.json({
    limit: '50mb'
}))

app.use(resource(User, {
    json: {
        resource: R.pick(['id', 'name', 'email', 'token']),
        collectionItem: R.pick(['id', 'name', 'email'])
    },
    add: {
        beforeQuery: req => {
            req.body.token = '0123456789012345678901234567890123456789012345678901234567890123'
        }
    }
}))

module.exports = app
