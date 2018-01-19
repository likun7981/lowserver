export default {
  // restful
  restful: {
    // 映射自定义参数到json-server参数
    mapParams: {},
    // 创建更新时 自动填充的数据，例如 更新日期等
    autoFill: {}
  },
  // urls,
  // 1. 你如果只想用简单的mock数据, 用这个选项就可以了,
  // 2. 你想复写restful接口或者在使用restful的时候新增一些非restful标准的接口时
  urls: {},
  // 是否保存到文件中, 默认保存在内存中
  save: false,
  // 数据model, 初始化数据
  models: {},
  // 主键值名称, 默认值id, 主要用于db操作时的主键
  primaryKey: 'id',
  // 请求前缀
  prefix: '',
  // 返回数据统一格式化
  render: (data, req, res) => {
    return data
  }
}
