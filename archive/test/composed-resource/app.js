const R        = require('ramda')
    , api      = require('../../src/')
    , insert   = require('./insert')
    , Category = require('./category')
    , Post     = require('./post')
    , transformers = require('./transformers')

const app = api({
    database: `mongodb://localhost/wajez-api`
})

app.resource(Category, {
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
})

app.listen(3000)

module.exports = app
