'use strict';

module.exports = {
  // restful接口时生效的配置
  restful: {
    // 映射参数到json-server要求
    mapParams: {},
    // 创建更新时 自动填充的数据，例如 更新日期等
    autoFill: {}
  },
  // urls, restful的时候此项不生效. 你如果只想用简单的mock数据, 用这个选项就可以了
  urls: {},
  // 数据model, 初始化数据
  models: {},
  // 主键值名称, 默认值id
  primaryKey: 'id',
  // 请求前缀
  prefix: '',
  render: function render(data, req, res) {
    return data;
  }
};