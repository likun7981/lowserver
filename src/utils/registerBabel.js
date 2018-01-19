module.exports = function (name) {
  require('babel-register')({
    only: new RegExp(`/${name}`),
    presets: [
      [
        'env',
        {
          targets: {
            node: 4
          },
          exclude: ['transform-regenerator']
        }
      ]
    ],
    babelrc: false
  })
}
