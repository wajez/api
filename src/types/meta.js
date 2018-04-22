const {$, Lazy, Enum, Union} = require('wajez-utils')

const packageName = 'wn/wajez/api'
const packageURL  = 'https://github.com/wajez/api/blob/master/types.md'

const Optional = type => Union(packageName, packageURL)('', [$.Undefined, type])

module.exports = {
  Optional,
  _: $.RecordType,
  Lazy: Lazy(packageName, packageURL),
  Enum: Enum(packageName, packageURL),
  Union: Union(packageName, packageURL),
}
