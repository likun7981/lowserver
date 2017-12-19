const path = require('path')

function getRelative (filePath) {
  const relativePath = path.relative('.', filePath)
  return relativePath.startsWith('..') ? relativePath : `./${relativePath}`
}

module.exports = getRelative
