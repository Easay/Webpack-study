# Webpack4学习之路

## 基础篇

- 基本使用
- 配置文件
- 资源管理：style-loader、css-loader、file-loader
- 管理输出：多个输入/输出，HtmlWebpackPlugin，CleanWebpackPlugin

### 一、基本使用

- 本地安装
- 全局安装

使用本地安装的方式安装`webpack`。因为全局安装之后，会使项目中的`webpack`锁定到执行版本中，并且在使用不同的版本的项目中，可能会导致构建失败。

#### 1.1 初始化项目

在某个目录下，创建webpack-basic项目，并初始化：

```
$ mkdir webpack-basic && cd webpack-basic
$ npm init -y
```

#### 1.2 本地安装webpack

在`webpack-basic`的根目录下执行指令分别安装`webpack`和`webpack-cli`：

```
$ npm install webpack webpack-cli --save-dev
```

#### 1.3 创建bundle文件

- 根目录下创建`src`目录，并创建`index.js`文件

```js
// src/index.js
function component() {
    var element = document.createElement('div');

    element.innerHTML = "Hello Webpack";

    return element;
}

document.body.appendChild(component());
```

- 根目录下创建dist目录，并创建`index.html`文件

```html
<!--dist/index.html-->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>webpack起步</title>
</head>

<body>
    <script src="main.js"></script>
</body>

</html>
```

`index,html`中引入的是`main.js`文件，这是因为打包过后，webpack会在dist文件夹生成`main.js`文件。

#### 1.4 执行webpack打包

```
npx webpack
```

这是由于webpack4在没有人为写配置文件的情况下，自带的默认配置：

- `src/index.js`作为打包的入口（entry选项）
- `dist/main.js`作为输出（output选项）

> 打包后会以我们的脚本文件为入口，输出为`main.js`

### 二、配置文件

在webpack3中，不允许没有配置文件，需要有`webpack.config.js`文件指定入口出口。

#### 2.1 webpack.config.js

根目录下，创建`webpack.config.js`的文件，添加基本配置：

```js
// webpack.config.js
const path = require('path')

module.exports = {
    //入口
   entry: './src/index.js',
    //出口
   output: {
   	filename: 'bundle.js',
   	path: path.resolve(__dirname, 'dist')
   }
}
```

重新执行命令指定以某个配置文件来创建：

```
npx webpack --config webpack.config.js
```

#### 2.2 NPM脚本

可以通过修改配置文件，改变webpack打包的指令。在`package.json`中添加`npm`脚本：

```js
{
    "name": "webpack-basic",
    "version": "1.0.0",
    "description": "",
    "private": true,
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
+       "build": "webpack"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
        "webpack": "^4.41.5",
        "webpack-cli": "^3.3.10"
    },
    "dependencies": {
        "lodash": "^4.17.15"
    }
}
```

接下来可以替代之前的`npx webpack`命令：

```
$ npm run build
```

### 三、管理资源

除了JS文件，我们可能还会使用图片、CSS文件、字体等资源。*loader* 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块，然后你就可以利用 webpack 的打包能力，对它们进行处理。

#### 3.1 加载CSS

- `style-loader`
- `css-loader`

在JS中引入外部的CSS资源有两种方式：

```js
// index.js
import './style.css'

// 或者用require()的方式
const style = require('./style.css')
```

首先需要在项目中安装这两个`loader`：

```
npm i --save-dev style-loader css-loader
```

然后在`webpack.config.js`中进行配置：

```js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

> `style-loader`要放到`css-loader`前面, 不然打包的时候会报错。
>
> 因为loader的执行顺序是：从右往左，从下往上。

- css-loader

   作用实际是能识别导入的`css`模块，并通过特定的语法规则进行内容转换。

- style-loader

  `style-loader`它的原理其实就是通过一个JS脚本创建一个`style`标签，里面会包含一些样式。并且它是不能单独使用的，因为它并不负责解析`css`之前的依赖关系。

> 单独使用css-loader只能保证解析css模块，但并没有效果
>
> style-loader可以创建一个style标签，把引入的css样式放入标签内。
>
> index.js中引入几个css模块，就会生成几个style标签，后面的同名样式会覆盖签名的。

#### 3.2 加载图片

安装`file-loader`

```
npm i --save-dev file-loader
```

修改配置文件

```js
	module: {
        rules: [{
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    }
```

打包后，dis文件夹里会出现一个以MD5哈希值命名的png文件。

`file-loader`的其他可选参数：`name`、`context`、`publicPath`、`outputPath`等。

```js
rules: [
	{
		test: /\.(png|svg|jpg|gif)$/,
		use: [
			{
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'images/'
				}
			}
		]
	}
]
```

`name`的`[name]`表示使用文件的原始名称, `[ext]`表示文件的原始类型, `[hash]`表示以哈希值命名, `[path]`表示资源相对于`context`的路径.

(`context` 默认为`webpack.config.js`)

### 四、管理输出

#### 4.1 多个输入、输出

`entry`和`output`支持多个输入和输出。在`src`下创建两个`js`文件：`print.js`和`index.js`。

修改配置文件：

```js
const path = require('path')

module.exports = {
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
  	output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}
```

其中，`[name].bundle.js`表示输出的文件以原名字命名，以`.bundle.js`结尾，所以上面两个文件打包后，生成`app.bundle.js`和`print.bundle.js`。

#### 4.2 HtmlWebpackPlugin

之前都是手动新建`index.html`，使用这个插件可以动态生成，并将输出的`js`文件引入这个html中。

**安装：**

```
npm i --save-dev html-webpack-plugin
```

**修改`webpack.config.js`**：

```js
const path = require('path')
+ const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
+    plugins: [
+        new HtmlWebpackPlugin({
+            title: 'Webpack Output Management'
+        })
+    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}
```

**其他配置项：**

- title：设定index.html的标题名
- filename：默认为index.html，指定生成的index.html的路径和名称
- template：如果自己写index.html，这个属性规定了模板路径；
- favion：指定index.html的图标

#### 4.3 清理/dist文件夹

安装`clean-webpack-plugin`插件：

```
npm i --save-dev clean-webpack-plugin
```

修改`webpack-config.js`文件：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
+ const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js",
    print: "./src/print.js",
  },
  plugins: [
+   new CleanWebpackPlugin({
+       cleanAfterEveryBuildPatterns: ["dist"], // 这个是非必填的
+   }),
    new HtmlWebpackPlugin({
      title: "Webpack Output Management",
      filename: "assets/admin.html",
      template: "src/index.html",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

对于官网上的配置方法：

```js
const CleanWebpackPlugin = require('clean-webpack-plugin');
...
new CleanWebpackPlugin(['dist'])
```

如果`cleanwebpackPlugin`的版本是3.0以上的，会报错。