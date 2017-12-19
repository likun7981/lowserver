'use strict';

var path = require('path');
var resolveApp = function resolveApp() {
  var resolvePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return path.join(process.cwd(), resolvePath);
};

module.exports = {
  dbPath: resolveApp('db.json'),
  appPath: resolveApp()
};