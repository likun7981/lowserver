const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const Mock = require('mockjs')
const fs = require('fs')
const jsonServer = require('json-server')
const restc = require('restc')

const { appPath } = require('./utils/paths')
const registerBabel = require('./utils/registerBabel')
const getRelative = require('./utils/getRelative')
const sortRouterStack = require('./utils/sortRouterStack')
const createDb = require('./utils/createDb')

const restful = require('./restful')
const urls = require('./urls')

let error = null
let clearOldRouter = null

function applyServer (app, name = 'lowserver-config') {
  const resolvedFilePath = path.join(appPath, name)
  registerBabel(name)
  let config = getConfig(resolvedFilePath)
  applyServerReal(config, app)
  const watcher = chokidar.watch([resolvedFilePath, resolvedFilePath + '.js'], {
    ignored: /node_modules/,
    persistent: true
  })
  watcher.on('change', filePath => {
    console.log(chalk.green('CHANGED'), chalk.inverse(getRelative(filePath)))
    error = null
    config = getConfig(resolvedFilePath)
    applyServerReal(config, app)
    delete require.cache[filePath]
  })
}

function applyServerReal (config, app) {
  let db = createDb(config)
  const prefix = config.prefix ? '/' + config.prefix : '/'
  if (clearOldRouter) {
    clearOldRouter()
  }
  const middlewares = jsonServer.defaults({
    bodyParser: true
  })
  app.use(restc.express())
  app.use(middlewares)
  let router = urls(config, db)
  router = restful(config, db, router)
  app.use(prefix, router)
  clearOldRouter = sortRouterStack(app)
}

function outputError () {
  if (!error) return
  console.log(chalk.red('Failed to parse mock config.'))
  if (error._babel) {
    const filePath = error.message.split(': ')[0]
    const relativeFilePath = getRelative(filePath)
    const errors = error.stack
      .split('\n')
      .filter(line => line.trim().indexOf('at ') !== 0)
      .map(line => line.replace(`${filePath}: `, ''))
    errors.splice(1, 0, [''])

    console.log()
    console.log(`Error in ${relativeFilePath}`)
    console.log(errors.join('\n'))
    console.log()
  } else {
    console.log()
    console.log('Error', error.stack)
  }
}

function getConfig (resolvedFilePath) {
  delete require.cache[resolvedFilePath]
  delete require.cache[path.join(resolvedFilePath, 'index.js')]
  let config = {}
  if (hasConfig(resolvedFilePath)) {
    try {
      config = require(resolvedFilePath)
      config = config.default || config
      config = typeof config === 'function' ? config(Mock) : config
    } catch (e) {
      error = e
      console.log()
      outputError()
      config = {}
    }
    return config
  }
  return config
}

function hasConfig (resolvedFilePath) {
  return (
    fs.existsSync(resolvedFilePath) || fs.existsSync(resolvedFilePath + '.js')
  )
}

module.exports = { applyServer, outputError }
