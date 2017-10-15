const test = require('wajez-api-test')
	, app = require('./app')
	, transformers = require('./transformers')
	, Category = require('./category')
	, Post = require('./post')

test(app).resource(Category, {
	json: { // required
		resource: transformers.categoryResource,
		collectionItem: transformers.categoryCollectionItem
	},
	routes: {
		collection: '/categories', // default: `/${resource-name-in-plural}`
		resource: '/categories/:id' // default: `/${resource-name-in-plural}/:id`
	},
	create: ['name', 'parent'],
	children: [ // default: all array fields of ObjectId type
		{
			field: 'children',  // required
			Model: Category,   // required
			json: { // required
				resource: transformers.categoryResource,
				collectionItem: transformers.categoryCollectionItem
			},
			reference: 'parent', // default: null; no reference!
			route: '/categories/:id/children', // default: `${routes.resource}/${field}`
			create: ['name'], // default: all non-array fields - the reference field above, if any
		},
		{
			field: 'posts',
			Model: Post,
			json: {
				resource: transformers.postResource,
				collectionItem: transformers.postCollectionItem
			}
		}
	]
})
