'use strict';

var path = require('path');
var chalk = require('chalk');
var chokidar = require('chokidar');
var Mock = require('mockjs');
var fs = require('fs');
var jsonServer = require('json-server');
var restc = require('restc');

var _require = require('./utils/paths'),
    appPath = _require.appPath;

var registerBabel = require('./utils/registerBabel');
var getRelative = require('./utils/getRelative');
var sortRouterStack = require('./utils/sortRouterStack');
var createDb = require('./utils/createDb');

var restful = require('./restful');
var urls = require('./urls');

var error = null;
var clearOldRouter = null;

function applyServer(app) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'lowserver.config';

  var resolvedFilePath = path.join(appPath, name);
  registerBabel(name);
  var config = getConfig(resolvedFilePath);
  applyServerReal(config, app);
  var watcher = chokidar.watch([resolvedFilePath, resolvedFilePath + '.js'], {
    ignored: /node_modules/,
    persistent: true
  });
  watcher.on('change', function (filePath) {
    console.log(chalk.green('CHANGED'), chalk.inverse(getRelative(filePath)));
    error = null;
    config = getConfig(resolvedFilePath);
    applyServerReal(config, app);
    delete require.cache[filePath];
  });
}

function applyServerReal(config, app) {
  var db = createDb(config);
  var prefix = config.prefix ? '/' + config.prefix : '/';
  if (clearOldRouter) {
    clearOldRouter();
  }
  var middlewares = jsonServer.defaults({
    bodyParser: true
  });
  app.use(restc.express());
  app.use(middlewares);
  var router = urls(config, db);
  router = restful(config, db, router);
  app.use(prefix, router);
  clearOldRouter = sortRouterStack(app);
}

function outputError() {
  if (!error) return;
  console.log(chalk.red('Failed to parse mock config.'));
  if (error._babel) {
    var filePath = error.message.split(': ')[0];
    var relativeFilePath = getRelative(filePath);
    var errors = error.stack.split('\n').filter(function (line) {
      return line.trim().indexOf('at ') !== 0;
    }).map(function (line) {
      return line.replace(`${filePath}: `, '');
    });
    errors.splice(1, 0, ['']);

    console.log();
    console.log(`Error in ${relativeFilePath}`);
    console.log(errors.join('\n'));
    console.log();
  } else {
    console.log();
    console.log('Error', error.stack);
  }
}

function getConfig(resolvedFilePath) {
  delete require.cache[resolvedFilePath];
  delete require.cache[path.join(resolvedFilePath, 'index.js')];
  var config = {};
  if (hasConfig(resolvedFilePath)) {
    try {
      config = require(resolvedFilePath);
      config = config.default || config;
      config = typeof config === 'function' ? config(Mock) : config;
    } catch (e) {
      error = e;
      console.log();
      outputError();
      config = {};
    }
    return config;
  }
  return config;
}

function hasConfig(resolvedFilePath) {
  return fs.existsSync(resolvedFilePath) || fs.existsSync(resolvedFilePath + '.js');
}

module.exports = { applyServer, outputError };