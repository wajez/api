const R          = require('ramda')
    , User       = require('./user')
    , api = require('../../src/')

const app = api({
    database: `mongodb://localhost/wajez-api`,
    auth: {
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
    }
})

app.get('/me', (req, res) => {
    res.json(R.pick(['id', 'name', 'email'], req.user))
})

app.resource(User, {
    json: {
        resource: R.pick(['id', 'name', 'email']),
        collectionItem: R.pick(['id', 'name', 'email'])
    },
    add: {
        route: '/register'
    }
})

app.handleErrors()

module.exports = app
