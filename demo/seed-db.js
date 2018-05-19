/**
 * Run this script to seed the demo database.
 */
const {seed, oneMany} = require('wajez-utils')
const {
  connect, clean, disconnect,
  User, Account, Category,
  Post, Comment, Tag,
  relations
} = require('../test/db')

const run = async () => {
  await connect()
  try {
    await clean()
    await seed({
      Account: 60,
      User: 50,
      Category: 20,
      Post: 150,
      Comment: 200,
      Tag: 31
    }, relations)
    await disconnect()
    return 'Database is ready!'
  } catch (err) {
    await disconnect()
    throw err
  }
}

run().then(console.log).catch(console.error)
