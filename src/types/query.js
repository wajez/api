const {$, S} = require('wajez-utils')
const {_, Enum, Union} = require('./meta')
const {Relation} = require('wajez-utils/src/types')

const QueryConditions = $.Object
const QueryProjection = $.Nullable($.String)
const QueryOptions = $.Object

const MockQuery = _({
  type: Enum('MockQueryType', ['mock']),
  data: $.Any,
})

const FindQuery = _({
  type: Enum('FindQueryType', ['find']),
  conditions: QueryConditions,
  projection: QueryProjection,
  options: QueryOptions,
  populate: $.Array(_({
    path: $.String,
    match: QueryConditions,
    select: QueryProjection,
    options: QueryOptions
  }))
})

const RemoveQuery = _({
  type: Enum('RemoveQueryType', ['remove']),
  conditions: QueryConditions,
  relations: $.Array(Relation)
})

const CreateQuery = _({
  type: Enum('CreateQueryType', ['create']),
  data: $.Object,
  relations: $.Array(Relation)
})

const UpdateQuery = _({
  type: Enum('UpdateQueryType', ['update']),
  conditions: QueryConditions,
  data: $.Object,
  relations: $.Array(Relation)
})

const Query = Union('Query', [
  CreateQuery,
  FindQuery,
  UpdateQuery,
  RemoveQuery,
  MockQuery
])

module.exports = {Query}
