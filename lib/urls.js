'use strict';

var chalk = require('chalk');
var Mock = require('mockjs');
var express = require('express');

var allowTypes = ['object', 'function', 'string'];
function validType(v) {
  return allowTypes.some(function (type) {
    return typeof v === type;
  });
}

function writeMiddleware(db) {
  return function (req, res, next) {
    db.write();
    next();
  };
}

// 非restful不进行字段自动填充
function signNotAutoFill(req, res, next) {
  req.NOT_AUTO_FILL = true;
  next();
}

function createMockHandler(value, db) {
  return function (req, res, next) {
    var realValue = void 0;
    if (typeof value === 'function') {
      realValue = value(db, req, res);
    } else {
      realValue = Mock.mock(value);
    }
    res.locals.data = realValue;
    next();
  };
}

function parseKey(key) {
  var method = 'get';
  var path = key;

  if (key.indexOf(' ') > -1) {
    var splited = key.split(' ');
    method = splited[0].toLowerCase();
    path = splited[1];
  }

  return { method, path };
}

function urls(config, db) {
  var app = express.Router();
  var _config$urls = config.urls,
      urls = _config$urls === undefined ? {} : _config$urls;

  urls = typeof urls === 'function' ? urls(Mock) : urls;
  var w = writeMiddleware(db);
  Object.keys(urls).forEach(function (key) {
    var keyParsed = parseKey(key);
    var v = urls[key];
    if (!app[keyParsed.method]) {
      return console.log(`\nmethod of ${chalk.dim(key)} is not valid`);
    }
    if (!validType(v)) {
      return console.log(`\nmock value of ${chalk.cyan(key)} should be function or object or string, but got ${chalk.red(typeof urls[key])}`);
    }
    app[keyParsed.method](keyParsed.path, signNotAutoFill, createMockHandler(urls[key], db), w);
  });
  return app;
}

module.exports = urls;