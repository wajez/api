const mongoose = require('mongoose')
const {$, def, S} = require('wajez-utils')
const T = require('./types')
const Err = require('./error')

const applyQuery = def('applyQuery', {}, [T.Query, T.MongooseModel, $.Any],
  async (query, model) => {
    await before(query, model)
    if (query.type === 'create')
      return applyCreateQuery(query, model)
    if (query.type === 'find')
      return applyFindQuery(query, model)
    if (query.type === 'update')
      return applyUpdateQuery(query, model)
    if (query.type === 'remove')
      return applyRemoveQuery(query, model)
    if (query.type === 'mock')
      return applyMockQuery(query, model)
    return null
  }
)

const applyCreateQuery = def('applyCreateQuery', {}, [T.Query, T.MongooseModel, $.Any],
  async (query, model) => {
    const created = await model.create(query.data)
    await after(query, null, created)
    return created
  }
)

const applyUpdateQuery = def('applyUpdateQuery', {}, [T.Query, T.MongooseModel, $.Any],
  async (query, model) => {
    const old = await model.findOne(query.conditions)

    if (query.data.$operations) {
      for (const field in query.data.$operations) {
        const existing = (old && old[field]) ? old[field] : []
        const adding = query.data.$operations[field] ? (query.data.$operations[field].add || []) : []
        const removing = query.data.$operations[field] ? (query.data.$operations[field].remove || []) : []

        const values = {}
        existing.forEach(val => {values[val] = true})
        adding.forEach(val => {values[val] = true})
        removing.forEach(val => {
          delete values[val]
        })

        query.data[field] = Object.keys(values)
      }
      delete query.data.$operations
    }

    const updated = await model.findOneAndUpdate(query.conditions, query.data, {new: true, runValidators: true})
    await after(query, old, updated)

    return updated
  }
)

const applyFindQuery = def('applyFindQuery', {}, [T.Query, T.MongooseModel, $.Any],
  ({conditions, projection, options, populate}, model) => {
    const q = model.find(conditions, projection, options)
    populate.forEach(_ => q.populate(_))
    return q
  }
)

const applyRemoveQuery = def('applyRemoveQuery', {}, [T.Query, T.MongooseModel, $.Any],
  async (query, model) => {
    const old = await model.findOne(query.conditions)
    await model.remove(query.conditions)
    await after(query, old, null)
  }
)

const applyMockQuery = def('applyMockQuery', {}, [T.Query, T.MongooseModel, $.Any],
  async ({data}, model) => data
)

const before = def('before', {}, [T.Query, T.MongooseModel, $.Any],
  async (query, model) => {
    if (query.type !== 'create' && query.type !== 'update')
      return null
    for(const relation of query.relations) {
      if (relation.type === 'one-one')
        await beforeOneOne(relation, query, model)
      if (relation.type === 'many-one')
        await beforeManyOne(relation, query, model)
      if (relation.type === 'one-many')
        await beforeOneMany(relation, query, model)
      if (relation.type === 'many-many')
        await beforeManyMany(relation, query, model)
    }
  }
)

const beforeOneOne = def('beforeOneOne', {}, [T.Relation, T.Query, T.MongooseModel, $.Any],
  async ({source, target}, query, model) => {
    if (query.data[source.field]) {
      const related = await mongoose.model(target.name).findOne({_id: query.data[source.field]})
      if (!related)
        throw new Err(`Unable to save ${source.name}, the value of '${source.field}' is not valid!`)
      if (target.field && related[target.field] != null)
        throw new Err(`Unable to save ${source.name}, the ${target.name} referenced by '${source.field}' has already a '${target.field}'!`)
    }
  }
)

const beforeManyOne = def('beforeManyOne', {}, [T.Relation, T.Query, T.MongooseModel, $.Any],
  async ({source, target}, query, model) => {
    if (query.data[source.field]) {
      const related = await mongoose.model(target.name).findOne({_id: query.data[source.field]})
      if (!related)
        throw new Err(`Unable to save ${source.name}, the value of '${source.field}' is not valid!`)
    }
  }
)

const beforeOneMany = def('beforeOneMany', {}, [T.Relation, T.Query, T.MongooseModel, $.Any],
  async ({source, target}, query, model) => {
    if (query.data[source.field]) {
      let ids = []
      if (query.data[source.field].constructor === Array && query.data[source.field].length > 0) {
        ids = ids.concat(query.data[source.field])
      } else {
        if (query.data[source.field].add) {
          ids = ids.concat(query.data[source.field].add)
        }
        if (query.data[source.field].remove) {
          ids = ids.concat(query.data[source.field].remove)
        }
        query.data.$operations = query.data.$operations || {}
        query.data.$operations[source.field] = query.data[source.field]
        delete query.data[source.field]
      }
      if (ids.length > 0) {
        let items = await mongoose.model(target.name).find({_id: {$in: ids}})
        if (target.field) {
          for (const item of items)
            if (item[target.field] != null && (query.type !== 'update' || item[target.field] != query.conditions._id))
              throw new Err(`Unable to save ${source.name}, one of the '${source.field}' has already a '${target.field}' = ${item[target.field]}!`)
        }
        if (items.length < ids.length) {
          items = items.map(_ => _.id)
          const missing = ids.filter(id => !items.includes(id))
          throw new Err(`${target.name} records with ids [${missing.join(', ')}] are missing!`)
        }
      }
    }
  }
)

const beforeManyMany = def('beforeManyMany', {}, [T.Relation, T.Query, T.MongooseModel, $.Any],
  async ({source, target}, query, model) => {
    if (query.data[source.field]) {
      let ids = []
      if (query.data[source.field].constructor === Array && query.data[source.field].length > 0) {
        ids = ids.concat(query.data[source.field])
      } else {
        if (query.data[source.field].add) {
          ids = ids.concat(query.data[source.field].add)
        }
        if (query.data[source.field].remove) {
          ids = ids.concat(query.data[source.field].remove)
        }
        query.data.$operations = query.data.$operations || {}
        query.data.$operations[source.field] = query.data[source.field]
        delete query.data[source.field]
      }
      if (ids.length > 0) {
        let items = await mongoose.model(target.name).find({_id: {$in: ids}})
        if (items.length < ids.length) {
          items = items.map(_ => _.id)
          const missing = ids.filter(id => !items.includes(id))
          throw new Err(`${target.name} records with ids [${missing.join(', ')}] are missing!`)
        }
      }
    }
  }
)

const after = def('after', {}, [T.Query, $.Any, $.Any, $.Any],
  async (query, old, updated) => {
    for(const relation of query.relations) {
      if (relation.type === 'one-one')
        await afterOneOne(relation, old, updated)
      if (relation.type === 'many-one')
        await afterManyOne(relation, old, updated)
      if (relation.type === 'one-many')
        await afterOneMany(relation, old, updated)
      if (relation.type === 'many-many')
        await afterManyMany(relation, old, updated)
    }
  }
)

const afterOneOne = def('afterOneOne', {}, [T.Relation, $.Any, $.Any, $.Any],
  async ({source, target}, old, updated) => {
    if (!target.field)
      return null

    const data = {}
    if (old && old[source.field] && (!updated || updated[source.field] != old[source.field])) {
      data[target.field] = null
      await mongoose.model(target.name).findOneAndUpdate({_id: old[source.field]}, data, {new: true, runValidators: true})
    }
    if (updated && updated[source.field] && (!old || old[source.field] != updated[source.field])) {
      data[target.field] = updated._id
      await mongoose.model(target.name).findOneAndUpdate({_id: updated[source.field]}, data, {new: true, runValidators: true})
    }
  }
)

const afterManyOne = def('afterManyOne', {}, [T.Relation, $.Any, $.Any, $.Any],
  async ({source, target}, old, updated) => {
    if (!target.field)
      return null

    if (old && old[source.field] && (!updated || updated[source.field] != old[source.field])) {
      const data = {$pull: {}}
      data.$pull[target.field] = old._id
      await mongoose.model(target.name).findOneAndUpdate({_id: old[source.field]}, data, {new: true, runValidators: true})
    }
    if (updated && updated[source.field] && (!old || old[source.field] != updated[source.field])) {
      const data = {$addToSet: {}}
      data.$addToSet[target.field] = updated._id
      await mongoose.model(target.name).findOneAndUpdate({_id: updated[source.field]}, data, {new: true, runValidators: true})
    }
  }
)

const afterOneMany = def('afterOneMany', {}, [T.Relation, $.Any, $.Any, $.Any],
  async ({source, target}, old, updated) => {
    if (!target.field)
      return null

    const oldIds = (old && old[source.field]) ? old[source.field] : []
    const newIds = (updated && updated[source.field]) ? updated[source.field] : []
    const removedIds = oldIds.filter(id => !newIds.map(_ => _.toString()).includes(id.toString()))
    const addedIds = newIds.filter(id => !oldIds.map(_ => _.toString()).includes(id.toString()))

    const data = {}
    if (removedIds.length > 0) {
      data[target.field] = null
      await mongoose.model(target.name).updateMany({_id: {$in: removedIds}}, data, {new: true, runValidators: true})
    }
    if (addedIds.length > 0) {
      data[target.field] = updated._id
      await mongoose.model(target.name).updateMany({_id: {$in: addedIds}}, data, {new: true, runValidators: true})
    }
  }
)

const afterManyMany = def('afterManyMany', {}, [T.Relation, $.Any, $.Any, $.Any],
  async ({source, target}, old, updated) => {
    if (!target.field)
      return null

    const oldIds = (old && old[source.field]) ? old[source.field] : []
    const newIds = (updated && updated[source.field]) ? updated[source.field] : []
    const removedIds = oldIds.filter(id => !newIds.map(_ => _.toString()).includes(id.toString()))
    const addedIds = newIds.filter(id => !oldIds.map(_ => _.toString()).includes(id.toString()))

    if (removedIds.length > 0) {
      const data = {$pull: {}}
      data.$pull[target.field] = old._id
      await mongoose.model(target.name).updateMany({_id: {$in: removedIds}}, data, {new: true, runValidators: true})
    }
    if (addedIds.length > 0) {
      const data = {$addToSet: {}}
      data.$addToSet[target.field] = updated._id
      await mongoose.model(target.name).updateMany({_id: {$in: addedIds}}, data, {new: true, runValidators: true})
    }
  }
)

module.exports = {applyQuery}
