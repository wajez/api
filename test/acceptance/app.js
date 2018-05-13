const express = require('express')
const bodyParser = require('body-parser')
const {api} = require('../../src')
const {User, Account, Category, Post, Comment, Tag} = require('../db')
const {oneOne, oneMany, manyMany} = require('wajez-utils')

const app = express()
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

app.use(api([User, Account, Category, Post, Comment, Tag], [
  oneOne('User', 'account', 'Account', 'owner'),
  oneMany('User', 'posts', 'Post', 'writer'),
  manyMany('Post', 'tags', 'Tag', 'posts'),
]))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({error: `${err}`})
})

module.exports = app
