'use strict';

module.exports = function (name) {
  require('babel-register')({
    only: new RegExp(`(${name})`),
    presets: ['es2015', 'stage-0'],
    babelrc: false
  });
};