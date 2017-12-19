const chalk = require('chalk')
const Mock = require('mockjs')
const express = require('express')

const allowTypes = ['object', 'function', 'string']
function validType (v) {
  return allowTypes.some(type => {
    return typeof v === type
  })
}

function writeMiddleware (db) {
  return (req, res, next) => {
    db.write()
    next()
  }
}

// 非restful不进行字段自动填充
function signNotAutoFill (req, res, next) {
  req.NOT_AUTO_FILL = true
  next()
}

function createMockHandler (value, db) {
  return (req, res, next) => {
    let realValue
    if (typeof value === 'function') {
      realValue = value(db, req, res)
    } else {
      realValue = Mock.mock(value)
    }
    res.locals.data = realValue
    next()
  }
}

function parseKey (key) {
  let method = 'get'
  let path = key

  if (key.indexOf(' ') > -1) {
    const splited = key.split(' ')
    method = splited[0].toLowerCase()
    path = splited[1]
  }

  return { method, path }
}

function urls (config, db) {
  const app = express.Router()
  let { urls = {} } = config
  urls = typeof urls === 'function' ? urls(Mock) : urls
  const w = writeMiddleware(db)
  Object.keys(urls).forEach(key => {
    const keyParsed = parseKey(key)
    const v = urls[key]
    if (!app[keyParsed.method]) {
      return console.log(`\nmethod of ${chalk.dim(key)} is not valid`)
    }
    if (!validType(v)) {
      return console.log(
        `\nmock value of ${chalk.cyan(
          key
        )} should be function or object or string, but got ${chalk.red(
          typeof urls[key]
        )}`
      )
    }
    app[keyParsed.method](
      keyParsed.path,
      signNotAutoFill,
      createMockHandler(urls[key], db),
      w
    )
  })
  return app
}

module.exports = urls
