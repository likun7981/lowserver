const path = require('path')
const resolveApp = function (resolvePath = '') {
  return path.join(process.cwd(), resolvePath)
}

module.exports = {
  dbPath: resolveApp('db.json'),
  appPath: resolveApp()
}
