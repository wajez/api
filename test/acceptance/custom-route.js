const express = require('express')
const {router, get, beforeSend, setData} = require('../../src')

const app = express()

app.use(router([
  get('/greet', [
    beforeSend(setData(async () => ({message: 'Hey there!'})))
  ]),
  get('/greet/:name', [
    beforeSend(setData(async ({params}) => ({message: `Hey ${params.name}!`})))
  ]),
]))

const it = require('wajez-api-test')(app)

describe('Acceptance > Custom Route', () => {

  it.get('/greet', {
    body: {message: 'Hey there!'}
  })

  it.get('/greet/Amine', {
    body: {message: 'Hey Amine!'}
  })

})
