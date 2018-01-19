# lowserver

> Easy to apply a mock server into express app.

## 安装

```bash
# npm
$ npm install lowserver

# yarn
$ yarn add --dev lowserver
```

## Usage

### apply to express

```js
const express = require("express")
var { applyServer } = require("lowserver")
var app = express()

// apply to express
applyServer(app)
```
### 创建配置文件
> 提醒: 你可以使用es6

- 在根目录创建 `lowserver-config.js` 文件
```
+-- your-project
|   +-- lowserver-config.js
|   +-- node_modules
|   +-- package.json
|   +-- README.md
```
- 或者可以在根目录创建`lowserver-config`目录使用`index.js`导出配置
```
+-- your-project
|   +-- lowserver-config
|   |	+-- index.js
|   +-- node_modules
|   +-- package.json
|   +-- README.md
```
#### 所有配置项（默认值）

```js
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
	primaryKey: "id",
	// 请求前缀
	prefix: "",
	// 返回数据统一格式化
	render: (data, req, res) => {
		return data;
	}
};
```

#### 例子

* 如果你需要 mock 一个支持 restful 接口配置 lowserver-config.js 文件可以这样写

> 这个功能由 json-server 实现, 具有分页，关键字搜索，排序等功能, 更多详情请参考[json-server](https://github.com/typicode/json-server)

```javascript
export default {
	// models 配置支持mockjs语法
	models: {
		"users|10": [("id|+1": 1), (name: "@cname"), (age: "@integer(10,30)")]
	}
};
```

启动开发服务器后, 你就可以访问以下路由

```
GET    /users   // 获取所有users
GET    /users/1 // 获取id为1的user
POST   /users   // 新增user
PUT    /users/1 // 替换id为1的user
PATCH  /users/1 // 更新id为1的user
DELETE /users/1 // 删除id为1的user
```

* 如果出现后台写了一些 非 restful 标准 的接口时候, 你可以这样配置

> 可以直接使用 参数 db 操作, 模拟更真实的  接口数据, 详情参考[lowdb](https://github.com/typicode/lowdb)或者你直接看[lodash](https://lodash.com/docs/4.17.4#chain), 关于 id 的操作你可以看[lodash-id](https://github.com/typicode/lodash-id)

```javascript
export default {
	urls: {
		"GET /getUserById": db => {
			// 这里return是response 响应值
			return db
				.get("users")
				.getById(1)
				.value();
		},
		"POST /addUser": (db, req) => {
			const user = req.body;
			return db
				.get("users")
				.insert(user)
				.value();
		}
	}
};
```

* 如果在使用 restful 接口的 时候 一些字段你需要接口自动填充，比如创建时间, 更新时间，你可以这样配置

```javascript
// 这样你创建, 更新user时候会自动填充created这个字段，这样就可以模拟和真实接口一样的参数
export default {
	restful: {
		autoFill: {
			users: {
				created: '@date("yyyy-MM-dd")'
			}
		}
	},
	models: {
		// ...
	}
};
```

* 如果在分页查询的时候参数与`json-server`要求的参数不一样, 你可以这样配置

> 更多查询参数[json-server query params](https://github.com/typicode/json-server#filter)

```javascript
export default {
	restful: {
		mapParams: {
			// 后端的key: json-server参数key
			pageNumber: _page,
			pageSize: _limit
		}
	},
	models: {
		// ...
	}
};
```

* 如果只需要简单的 mock 一些数据像 `easy-mock` 那样, 你可以这样配置

```javascript
export default {
	urls: {
		"GET /user": {
			name: "@cname",
			age: "@integer(10, 30)"
		},
		"POST /user": {
			name: "@cname",
			age: "@integer(10, 30)"
		}
	}
};
```

* 如果你需要在数据返回时格式化一个固定的格式, 你可以添加 render 选项

```javascript
export default {
	// ...其他配置
	render: data => {
		// 你只需要在这里返回你要的格式,
		// 你要添加随机错误的话也可以在这个方法里面操作
		return {
			code: 0,
			data
		};
	}
	// ...其他配置
};
```

* 需要添加请求前缀 你只需要配置 `prefix`选项即可

#### Q&A

1. 和 json-server 有什么区别?

* json-server 只符合 restful 标准，非 restful 标准不能. 比如批量添加、删除接口
* json-server 在添加更新的时候没有 autofill, 不能更接近真实的接口
* json-server 的查询参数是固定的如果前端去  映射的话, 在接入真正接口的时候又需要修改

2. 和 easy-mock 有什么区别?

* easy-mock 只能简单的 mock 查询接口, 增加删除修改等没有
* easy-mock 不能保存你对数据的更改
