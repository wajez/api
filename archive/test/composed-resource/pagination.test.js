const R = require('ramda')
    , test = require('wajez-api-test')
	, app = require('./app')
	, transformers = require('./transformers')
	, Category = require('./category')
	, Post = require('./post')
    , it = test(app)
    , insert = require('./insert')

describe('Pagination Test', () => {
    let categories, posts, firstCategory

    before(done => {
        Post.remove({})
        .then(() => Category.remove({}))
        .then(() => insert(Category, 100))
        .then(cats => {
            firstCategory = cats[0]
            return insert(Post, 100, post => {
                post.category = firstCategory
                return post
            })
        })
        .then(posts => {
            firstCategory.posts = posts
            firstCategory.save(err => err ? done(err) : done())
        })
        .catch(done)
    })

    it.get('/categories?limit=120', {
        verify: (res, done) => {
            if (res.body.length != 100)
                return done('Wrong count!')
            categories = res.body
            done()
        }
    })

    it.get('/categories?limit=20', {
        body: () => categories.slice(0, 20)
    })

    it.get('/categories?offset=5&limit=10', {
        body: () => categories.slice(5, 15)
    })

    it.get('/categories/:id/posts', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        verify: (res, done) => {
            if (res.body.length != 50)
                return done('Wrong count!')
            done()
        }
    })

    it.get('/categories/:id/posts?limit=120', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        verify: (res, done) => {
            if (res.body.length != 100)
                return done('Wrong count!')
            posts = res.body
            done()
        }
    })

    it.get('/categories/:id/posts?offset=15&limit=11', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        body: () => posts.slice(15, 26)
    })

    it.get('/categories/:id?posts-limit=110', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        body: () => ({posts})
    })

    it.get('/categories/:id?posts-offset=5&posts-limit=13', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        body: () => ({posts: posts.slice(5, 18)})
    })

    it.get('/categories?limit=100&posts-offset=5&posts-limit=13', {
        params: () => ({id: firstCategory.id.toString('hex')}),
        verify: (res, done) => {
            let i = 0, category = null
            while(i < 100) {
                if (res.body[i].id == firstCategory.id.toString('hex')) {
                    category = res.body[i]
                    break
                }
                i ++
            }
            if (category == null)
                return done('A category is missing!')
            if (category.posts.length != 13)
                return done('Wrong limit!')
            if (category.posts[0] != posts[5].id)
                return done('Wrong offset!')
            done()
        }
    })

    after(done => {
        Post.remove({})
        .then(() => Category.remove({}))
        .then(() => done())
        .catch(done)
    })
})
