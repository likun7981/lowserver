'use strict';

var path = require('path');

function getRelative(filePath) {
  var relativePath = path.relative('.', filePath);
  return relativePath.startsWith('..') ? relativePath : `./${relativePath}`;
}

module.exports = getRelative;