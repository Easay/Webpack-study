# Webpack4学习之路

## 构建方式篇

- webpack --watch
- webpack-dev-server
- webpack-dev-middle
- webpack-merge
- process.env.NODE_ENV
- webpack.DefinePlugin插件

### 一、开发工具

#### 1.1 Watch Mode（观察者模式）

在`package.json`里配置一个脚本命令：

```js
"scripts": {
	"watch": "webpack --watch"
}
```

**特点：**

- 使用`npm run watch`命令后，会看到编译过程，不会退出命令行，实时监控文件。
- 修改本地代码后，自动重新编译，但需要手动刷新页面才能看到变化。

#### 1.2 webpack-dev-server

会提供一个简单的web服务器，作用是监听文件改变并自动编译后刷新页面。

**使用：**

- 安装：`npm i --save-dev webpack-dev-server`
- 添加脚本命令：`"start":"webpack-dev-server --open"`

**效果：**

不会生成dist文件夹，而是开启了一个本地的web服务器：`localhost:8080`

**其他配置项：**

在`webpack.config.js`中配置：

```js
module.exports = {
    devServer: {
        contentBase: './dist', // 告诉服务器从哪里提供内容
        host: '0.0.0.0', // 默认是 localhost
        port: 8000, // 端口号, 默认是8080
        open: true, // 是否自动打开浏览器
        hot: true, // 启用 webpack 的模块热替换特性
        hotOnly: true // 当编译失败之后不进行热更新
    }
}
```

更多关于`devServer`的配置：[devServer](https://www.webpackjs.com/configuration/dev-server/)

#### 1.3 webpack-dev-middleware

`webpack-dev-middleware`是一个容器（wrapper），它可以把webpack处理后的文件传递给一个服务器（server）。

`webpack-dev-server`能够开启一个本地的`web`服务器, 就是因为在内部使用了它，但是, 它也可以作为一个包来单独使用。

`webpack-dev-middleware`+`express server`实现：

- 配置一条`script`命令可以运行一个本地web服务器
- 每次修改本地代码能重新编译
- 不会自动刷新页面

**实现步骤：**

1.安装依赖：

```
npm i --save-dev webpack-dev-middleware express
```

2.根目录下创建`server.js`编写本地服务：

```js
// server.js
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')

const app = express()
const config = require('./webpack.config')
const compiler = webpack(config)
// 把 webpack 处理后的文件传递给一个服务器
app.use(webpackDevMiddleware(compiler))

app.listen(3000, function() {
    console.log('Example app listening on port 3000!\n');
})
```

3.在`package.json`里配置指令运行`server.js`：

```js
{
    "scripts": {
        "server": "node server.js"
    }
}
```

4.修改`webpack.config.js`文件：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
    devtool: 'inline-source-map', // 仅开发环境报错追踪
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['dist']
        }),
        new HtmlWebpackPlugin({
            title: 'Webpack Output2',
            filename: 'index.html',
            template: 'src/index.html'
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
+       publicPath: '/assets/'
    }
}
```

5.修改`server.js`：

```js
// server.js
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')

const app = express()
const config = require('./webpack.config')
const compiler = webpack(config)
// 把webpack 处理后的文件传递给一个服务器
app.use(webpackDevMiddleware(compiler 
+	,{
+	    publicPath: config.output.publicPath
+	}
))

app.listen(3000, function() {
    console.log('Example app listening on port 3000!\n');
})
```

6.执行`npm run server`,打开`localhost:3000`，发现页面提示：

```
Cannot GET/
```

7.打开`localhost:3000/assets/`才能看到正确页面

并且如果项目里有对资源的引用的话, 也会自动加上`publicPath`的前缀:

```
icon.png => 变为 /assets/icon.png
```

注意：⚠

- 如果没有配置`output.publicPath`和`webpack-dev-middleware`的`publicPath`, 则默认都会是`""`，以根目录作为配置项；
- 如果配置了`output.publicPath`, 则`webpack-dev-middleware`中的`publicPath`也要和它一样才行。

### 二、不同的环境

- 开发环境

  开发环境中, 我们可能有实时重新加载(live reloading) 、热模块替换(hot module replacement)等能力

- 生产环境

  生产环境中, 我们更加关注更小的bundle(压缩输出), 更轻量的source map, 还有更优化的资源等.

为了遵循逻辑分离, 我们可以为每个环境编写彼此独立的webpack配置。可以将这些公用的配置项提取出来, 然后不同的配置写在不同的文件中.

#### 2.1 webpack-merge

该工具可以将这些配置项合并在一起。

```
npm i --save-dev webpack-merge
```

将`webpack.config.js`拆开，编写成三个不同的webpack配置文件：

```
- |- webpack.config.js
+ |- webpack.common.js
+ |- webpack.dev.js
+ |- webpack.prod.js
```

**`webpack.common.js`:**

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'webpack bundle'
        })
    ]
}
```

**`webpack.dev.js`：**

```js
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
    devtool: 'inline-source-map', // 错误追踪
    devServer: { // 设置 webpack-dev-server 监听的文件
        contentBase: './dist'
    }
})
```

**`webpack.prod.js`：**

```js
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(commonConfig, {
    plugins: [
        new UglifyJSPlugin() // 压缩输出
    ]
})
```

最后修改`package.json`的脚本命令：

```json
"scripts": {
    "start": "webpack-dev-server --open --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
},
```

- 执行`npm run start`为开发环境，会自动打开`localhost:8080`页面并有自动重载功能。

- 执行`npm run build`为生产环境，会打包生成dist文件夹，且bundle中js为压缩过后的代码。

#### 2.2 process.env,NODE_ENV

判断是开发环境还是生产环境。技术上讲，`NODE_ENV` 是一个由 Node.js 暴露给执行脚本的系统环境变量。

可以在本地代码中使用：

```js
// print.js
export function print() {
    console.log(process.env.NODE_ENV) // development 或者 prodution
}
```

**不能在`webpack.config.js`中获取到它，打印出来是undefined。**比如，如果我们想根据环境决定最终输出的js文件名字：

```js
process.env.NODE_ENV === 'production' ? '[name].[hash].bundle.js' : '[name].bundle.js'
```

上面的语句写在配置文件中是不能获得期待效果的。（2.5介绍如何实现）

#### 2.3 模式（mode）

可以在配置中提供mode选项：

```js
module.exports = {
  mode: 'production'
};
```

或在命令行中传递：

```
webpack --mode=production
```

不同的模式下，webpack支持不同的内置插件：

- **development**

```js
// webpack.development.config.js
module.exports = {
+ mode: 'development'
- plugins: [
-   new webpack.NamedModulesPlugin(),
-   new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
- ]
}
```

- **production**

```js
// webpack.production.config.js
module.exports = {
+  mode: 'production',
-  plugins: [
-    new UglifyJsPlugin(/* ... */),
-    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
-    new webpack.optimize.ModuleConcatenationPlugin(),
-    new webpack.NoEmitOnErrorsPlugin()
-  ]
}
```

#### 2.4 webpack.DefinePlugin插件

这个插件允许我们在`webpack.config.js`中修改环境：

```js
+ const webpack = require('webpack');
  const merge = require('webpack-merge');
  const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
  const commonConfig = require('./webpack.common.js');

  module.exports = merge(commonConfig, {
    devtool: 'source-map',
    plugins: [
      new UglifyJSPlugin({
        sourceMap: true
-     })
+     }),
+     new webpack.DefinePlugin({
+       'process.env.NODE_ENV': JSON.stringify('production')
+     })
    ]
  });
```

🍌`webpack.DefinePlugin`中设置环境比命令行中设置`mode`的优先级高！！

#### 2.5 如何在配置文件中获取环境变量

1.**命令行可以传递变量**

如果在命令行中通过`--env`来设置一些变量，这些变量值能使我们在配置文件中访问到：

例如在`package.json`文件中新建命令行`local`

```
{
    "scripts": {
        "start": "webpack-dev-server --open --config webpack.dev.js",
        "build": "webpack --config webpack.prod.js",
+       "local": "webpack --env.custom=local --env.production --progress --config webpack.local.js"
    }
}
```

- `env-custom=local`表示给环境变量设置一个自定义属性`custom`，它的值为`local`;
- `env.production`表示设置`env.production=true`;
- `--process`表示显示编译进度的百分比；
- `--config webpack.local.js`表示以`webpack.local.js`中的内容执行webpack构建。

创建一个`webpack.local.js`：

```js
const commonConfig = require('./webpack.common') //另一个配置文件webpack.common.js
const merge = require('webpack-merge') //webpack-merge工具

module.exports = env => {
    console.log('custom: ', env.custom) // 'local'
    console.log('Production: ', env.production) // true
    return merge(commonConfig, {})
}
```

上述配置文件与`webpack.config.js`的区别在于，导出了一个函数，且这个函数的参数是`env`环境变量。这样就可以获取命令行中设置的参数值。

2.**利用命令行传递变量的方式，判断环境**

在命令行中传递一个变量，比如`NODE_ENV`.

创建配置文件`webpack.combine.js`：

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = env => {
    return {
        entry: './src/index.js',
        output: {
            filename: env.NODE_ENV === 'production' ? '[name].[hash].bundle.js' : '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: '合并成同一个webpack配置'
            })
        ]
    }
}
```

在`packge.json`中进行参数的传递：

```json
{
    "name": "webpack-bundle",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "webpack-dev-server --open --config webpack.dev.js",
        "build": "webpack --config webpack.prod.js",
        "local": "webpack --env.custom=local --env.production=false --mode=development --progress --config webpack.local.js",
+       "combine-dev": "webpack --env.NODE_ENV=development --config webpack.combine.js",
+       "combine-prod": "webpack --env.NODE_ENV=production --config webpack.combine.js"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
        "clean-webpack-plugin": "^3.0.0",
        "html-webpack-plugin": "^3.2.0",
        "lodash": "^4.17.15",
        "uglifyjs-webpack-plugin": "^2.2.0",
        "webpack": "^4.41.5",
        "webpack-cli": "^3.3.10",
        "webpack-dev-server": "^3.10.3",
        "webpack-merge": "^4.2.2"
    }
}
```

🎨注意：这里改的`env.NODE_ENV`并不是`process.env.NODE_ENV`,所以它并不能改变`process.env`.也就是说，无论通过哪种方式生成的页面，获取到的`process.env.NODE_ENV`都还是`production`。



