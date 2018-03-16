const test = require('wajez-api-test')
    , app  = require('./app')
    , it   = test(app)

describe('Simple Resource', () => {
    it.get('/api', {
        body: {hello: 'world!'}
    })
})
