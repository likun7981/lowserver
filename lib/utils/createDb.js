'use strict';

var _require = require('./paths'),
    dbPath = _require.dbPath;

var fs = require('fs');
var lowdb = require('lowdb');
var Mock = require('mockjs');
var FileSync = require('lowdb/adapters/FileSync');
var Memory = require('lowdb/adapters/Memory');
var lodashId = require('lodash-id');
var _ = require('lodash');

module.exports = function (config) {
  var models = config.models || {};
  if (!_.isPlainObject(models)) {
    throw new Error(`Models must be an object. Found ${typeof obj}`);
  }
  var resource = Mock.mock(config.models || {});
  var adapter = new Memory('', { defaultValue: resource });
  if (config.save) {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(resource));
    }
    adapter = new FileSync(dbPath);
  }
  var db = lowdb(adapter);
  db._.id = config.primaryKey || 'id';
  // const __remove = lodashId.__remove
  // lodashId.__remove = function (array, item) {
  //   __remove.apply(this, [array, item])
  // }
  db._.mixin(lodashId);
  return db;
};