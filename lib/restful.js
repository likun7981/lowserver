'use strict';

var _require = require('./utils/paths'),
    dbPath = _require.dbPath;

var jsonServer = require('json-server');
var Mock = require('mockjs');

var autoFillMethods = ['POST', 'PUT', 'PATCH'];

function upperFirstCase(word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1);
}

function mapParamsMiddleware(mapParams) {
  return function (req, res, next) {
    Object.keys(mapParams).forEach(function (key) {
      req.query[mapParams[key]] = req.query[key];
      delete req.query[key];
    });
    next();
  };
}
function autoFillMiddleware(autoFill, dbData) {
  return function (req, res, next) {
    if (req.NOT_AUTO_FILL) {
      return next();
    }
    var autoFills = autoFill[req.params.name];
    if (autoFills) {
      autoFills = typeof autoFills === 'function' ? autoFills(dbData, Mock) : Mock.mock(autoFills);
      if (autoFillMethods.some(function (method) {
        return req.method.toUpperCase() === method;
      })) {
        req.body = Object.assign({}, req.body, autoFills);
      }
    }
    next();
  };
}

function restful(config, db, app) {
  var _config$primaryKey = config.primaryKey,
      primaryKey = _config$primaryKey === undefined ? 'id' : _config$primaryKey,
      _config$restful = config.restful,
      restful = _config$restful === undefined ? {} : _config$restful;
  var _restful$mapParams = restful.mapParams,
      mapParams = _restful$mapParams === undefined ? {} : _restful$mapParams,
      _restful$autoFill = restful.autoFill,
      autoFill = _restful$autoFill === undefined ? {} : _restful$autoFill;

  var dbState = void 0;
  if (!config.save) {
    dbState = db.getState();
  } else {
    dbState = dbPath;
  }
  var router = jsonServer.router(dbState, {
    foreignKeySuffix: upperFirstCase(primaryKey)
  });
  router.db._.id = primaryKey;
  router.render = function (req, res) {
    if (config.render) {
      res.locals.data = config.render(res.locals.data, req, res);
    }
    res.jsonp(res.locals.data);
  };
  app.use(mapParamsMiddleware(mapParams));
  app.use('/:name', autoFillMiddleware(autoFill, db));
  app.use(router);
  return app;
}

module.exports = restful;