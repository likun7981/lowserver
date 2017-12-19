// 调整 stack，把 historyApiFallback 放到最后
module.exports = function (app) {
  let lastIndex = null
  app._router.stack.forEach((item, index) => {
    if (item.name === 'webpackDevMiddleware') {
      lastIndex = index
    }
  })

  if (lastIndex && lastIndex > 0) {
    const newStack = app._router.stack
    newStack.push(newStack[lastIndex - 1])
    newStack.push(newStack[lastIndex])
    newStack.splice(lastIndex - 1, 2)
    app._router.stack = newStack
  }
  return function () {
    app._router.stack.splice(
      lastIndex - 1,
      app._router.stack.length - 1 - lastIndex
    )
  }
}
