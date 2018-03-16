const R    = require('ramda')
    , test = require('wajez-api-test')
    , app  = require('./app')
    , User = require('./user')

test(app).resource(User, {
	create: ['name', 'email', 'password'],
	json: {
        resource: R.pick(['id', 'name', 'email']),
        collectionItem: R.pick(['id', 'name', 'email'])
	}
})
