let { dbPath } = require('./utils/paths')
const jsonServer = require('json-server')
const Mock = require('mockjs')

const autoFillMethods = ['POST', 'PUT', 'PATCH']

function upperFirstCase (word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1)
}

function mapParamsMiddleware (mapParams) {
  return (req, res, next) => {
    Object.keys(mapParams).forEach(function (key) {
      req.query[mapParams[key]] = req.query[key]
      delete req.query[key]
    })
    next()
  }
}
function autoFillMiddleware (autoFill, dbData) {
  return function (req, res, next) {
    if (req.NOT_AUTO_FILL) {
      return next()
    }
    let autoFills = autoFill[req.params.name]
    if (autoFills) {
      autoFills =
        typeof autoFills === 'function'
          ? autoFills(dbData, Mock)
          : Mock.mock(autoFills)
      if (autoFillMethods.some(method => req.method.toUpperCase() === method)) {
        req.body = Object.assign({}, req.body, autoFills)
      }
    }
    next()
  }
}

function restful (config, db, app) {
  const { primaryKey = 'id', restful = {} } = config
  const { mapParams = {}, autoFill = {} } = restful
  let dbState
  if (!config.save) {
    dbState = db.getState()
  } else {
    dbState = dbPath
  }
  const router = jsonServer.router(dbState, {
    foreignKeySuffix: upperFirstCase(primaryKey)
  })
  router.db._.id = primaryKey
  router.render = function (req, res) {
    if (config.render) {
      res.locals.data = config.render(res.locals.data, req, res)
    }
    res.jsonp(res.locals.data)
  }
  app.use(mapParamsMiddleware(mapParams))
  app.use('/:name', autoFillMiddleware(autoFill, db))
  app.use(router)
  return app
}

module.exports = restful
