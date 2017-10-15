const transform = require('wajez-transform')
	, R = require('ramda')

const id = model => {
	if (!model)
		return null
	if (!model.id)
		return model.toString('hex')
	return model.id.toString('hex')
}

const map = R.curry((fn, list) => {
	if (! list)
		return []
	return list.map(fn)
})

const defined = R.curry((fn, data) => data ? fn(data) : null)

const categoryCollectionItem = transform({
	id: ['id', id],
	name: 'name',
	parent: ['parent', id],
	children: ['children', map(id)],
	posts: ['posts', map(id)]
})

const postCollectionItem = transform({
	id: ['id', id],
	title: 'title',
	content: 'content'
})

const categoryResource = transform({
	id: ['id', id],
	name: 'name',
	parent: ['parent', defined(categoryCollectionItem)],
	children: ['children', map(categoryCollectionItem)],
	posts: ['posts', map(postCollectionItem)]
})

const postResource = transform({
	id: ['id', id],
	title: 'title',
	content: 'content'
})

module.exports = {
	categoryCollectionItem,
	categoryResource,
	postCollectionItem,
	postResource
}
