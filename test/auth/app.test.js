const R    = require('ramda')
    , test = require('wajez-api-test')
    , app  = require('./app')
    , User = require('./user')
    , it   = test(app)

describe('Authentication Test', () => {
    let token = null,
        user = null,
        data = {
            name: 'Amine',
            email: 'me@you.him',
            password: '0123456789'
        }

    before(() => User.remove({}).catch(console.error))

    it.get('/users', {
        status: 401
    })

    it.post('/register', {
        data,
        body: R.pick(['name', 'email'], data),
        status: 201,
        verify: (res, done) => {
            user = res.body
            done()
        }
    })

    it.get('/me', {
        params: () => user,
        status: 401
    })

    it.post('/auth', {
        data: {name: 'foo', password: 'bar'},
        status: 401
    })

    it.post('/auth', {
        data,
        verify: (res, done) => {
            token = res.body.token
            done()
        }
    })

    it.get('/me', {
        params: () => user,
        headers: () => ({Authorization: `Bearer ${token}`}),
        body: () => user
    })

    after(() => User.remove({}).catch(console.error))
})
