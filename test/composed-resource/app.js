const express    = require('express')
	, bodyParser = require('body-parser')
    , mongoose   = require('mongoose')
	, R          = require('ramda')
    , Category   = require('./category')
    , Post   	 = require('./post')
    , transformers = require('./transformers')
    , {resource} = require('../../src/')
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

app.use(resource(Category, {
    json: {
        resource: transformers.categoryResource,
        collectionItem: transformers.categoryCollectionItem
    },
    children: [{
        field: 'parent',
        route: false
    },{
        field: 'children',
        Model: Category,
        json: {
            resource: transformers.categoryResource,
            collectionItem: transformers.categoryCollectionItem
        },
        reference: 'parent'
    }, {
        field: 'posts',
        Model: Post,
        json: {
            resource: transformers.postResource,
            collectionItem: transformers.postCollectionItem
        }
    }]
}))

module.exports = app
