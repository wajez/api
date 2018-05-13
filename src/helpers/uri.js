const {plural} = require('pluralize')
const {$, def, S} = require('wajez-utils')
const T = require('../types')

const uri = def('uri', {}, [T.MongooseModel, $.String],
  model => {
    const words = model.modelName
      .replace(/\.?([A-Z]+)/g, (x, y) => '-' + y.toLowerCase())
      .replace(/^-/, '')
      .split('-')
    words.push(plural(words.pop()))
    return '/' + words.join('-')
  }
)

module.exports = {uri}
