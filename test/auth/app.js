const express    = require('express')
    , bodyParser = require('body-parser')
    , mongoose   = require('mongoose')
    , R          = require('ramda')
    , User       = require('./user')
    , app        = express()
    , {resource, auth} = require('../../')

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

auth(app, {
    secret: 'veryverysecret',
    Model: User,
    fields: ['name', 'password'],
    responses: {
        accessDenied: {error: 'Unauthorized Access'},
        wrongCredits: {error: 'Wrong Credentials'},
        internalError: {error: 'Internal Server Error'}
    },
    route: '/auth',
    ignore: ['/auth', '/register']
    // {url: '/users', methods: ['GET']}
})

app.get('/me', (req, res) => {
    res.json(R.pick(['id', 'name', 'email'], req.user))
})

app.use(resource(User, {
    json: {
        resource: R.pick(['id', 'name', 'email']),
        collectionItem: R.pick(['id', 'name', 'email'])
    },
    add: {
        route: '/register'
    }
}))

module.exports = app
