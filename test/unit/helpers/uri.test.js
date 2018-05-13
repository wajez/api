const assert = require('chai').assert
const {uri} = require('../../../src/helpers')

describe('Unit > helpers > uri', () => {
  it('gets the default URI', () => {
    assert.equal(uri({modelName: 'User', schema: {obj: {}}}), '/users')
    assert.equal(uri({modelName: 'PostCategory', schema: {obj: {}}}), '/post-categories')
  })
})
