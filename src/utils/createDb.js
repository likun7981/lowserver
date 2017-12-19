const { dbPath } = require('./paths')
const fs = require('fs')
const lowdb = require('lowdb')
const Mock = require('mockjs')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')
const lodashId = require('lodash-id')
const _ = require('lodash')

module.exports = function (config) {
  const models = config.models || {}
  if (!_.isPlainObject(models)) {
    throw new Error(`Models must be an object. Found ${typeof obj}`)
  }
  const resource = Mock.mock(config.models || {})
  let adapter = new Memory('', { defaultValue: resource })
  if (config.save) {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(resource))
    }
    adapter = new FileSync(dbPath)
  }
  const db = lowdb(adapter)
  db._.id = config.primaryKey || 'id'
  // const __remove = lodashId.__remove
  // lodashId.__remove = function (array, item) {
  //   __remove.apply(this, [array, item])
  // }
  db._.mixin(lodashId)
  return db
}
