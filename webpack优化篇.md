# webpack优化篇

## 一、删除未引用代码

在实际开发中，有可能会写很多未使用的代码，但因为某些原因不能删除，在打包的时候如果包含这些无用代码，占空间影响效率。

所以！！需要删除这些未引用的代码

### 1.1 Tree shaking

[webpack中文文档之Tree Shaking](https://webpack.docschina.org/guides/tree-shaking/)

移除JS上下文中未引用的代码就叫`tree shaking`。主要依赖于ES2015模块系统中的静态结构特性，例如`import`和`export`。

**移除未引用的代码**，这种说法不全面。其实是**找出并删除这些无副作用的代码**。

【副作用】的定义是，在导入时会执行特殊行为的代码，而不是仅仅暴露一个或多个`export`。有些代码具有副作用，但不能删除。比如`polyfill`。

将文件标记为无副作用，通常在`package.json`中设置`sideEffects`属性来实现：

```json
{
  "name": "your-project",
  "sideEffects": false
}
```

若是将`sideEffects`设置成了`false`则表示所有文件都是无副作用的，如果代码中又有一些有副作用，则可以改为提供一个数组：

```json
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js",
    "*.css"
  ]
}
```

> 注意，所有导入文件都会受到 tree shaking 的影响。这意味着，如果在项目中使用类似 `css-loader` 并 import 一个 CSS 文件，则需要将其添加到 side effect 列表中，以免在生产模式中无意中将它删除。

### 1.2 `sideEffects`和`usedExports`

`sideEffects`和 `usedExports`（更多被认为是 tree shaking）是两种不同的优化方式。

**`sideEffects` 更为有效** 是因为它允许跳过整个模块/文件和整个文件子树。

`usedExports` 依赖于`terser`去检测语句中的副作用。它是一个 JavaScript 任务而且没有像 `sideEffects` 一样简单直接。

可以通过`/*#__PURE__*/`注释给一个语句标记为没有副作用。

```js
var Button$1 = /*#__PURE__*/ withAppProvider()(Button);
```

### 1.3 压缩输出

**删除未使用的代码并进行代码压缩**就是压缩输出。实现压缩输出的方式，是要启用`webpack5`内部的`TerserPlugin`插件。

启用它的方式：

- `webpack4`直接通过`mode`配置成`production`；
- `webpack4`如果没有配置mode也会默认启动；
- 在命令行中添加`--optimize-minimmize`，比如`“build”、"webpack --optimize-minimize"`

## 二、代码分离

代码分离的特性主要是：能把代码分离到不同的bundle中，然后按需加载或并行加载这些模块。

常用的代码分离方法：

- **入口起点**：使用 [`entry`](https://webpack.docschina.org/configuration/entry-context) 配置手动地分离代码
- **防止重复**：使用`webpack.optimize.CommonsChunkPlugin`插件去重和分离chunk (**但是在webpack4中已废弃**)
- **动态导入**：通过模块的内联函数调用来分离代码。

### 2.1 入口起点

🌰将两个`js`文件作为入口文件，其中每个文件都引入模块`lodash`，这样会导致重复引用。

```js
// 安装lodash
npm i lodash
```

```js
// another-module.js
import _ from 'lodash';

console.log(_.join(['Another', 'module', 'loaded!'], ' '));
```

`webpack.config.js`文件：

```js
const path = require('path');

 module.exports = {
  //entry: './src/index.js',
  mode: 'development',
  entry: {
    index: './src/index.js',
    another: './src/another-module.js',
  },
   output: {
    //filename: 'main.js',
    filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
 };
```

**隐患：**

- 如果入口 chunk 之间包含一些重复的模块，那些重复模块都会被引入到各个 bundle 中。
- 这种方法不够灵活，并且不能动态地将核心应用程序逻辑中的代码拆分出来。

### 2.2 防止重复

配置`dependOn option`选项，这样可以在多个chunk之间共享模块：

```js
const path = require('path');

 module.exports = {
   mode: 'development',
   entry: {
    //index: './src/index.js',
    //another: './src/another-module.js',
    index: {
      import: './src/index.js',
      dependOn: 'shared',
    },
    another: {
      import: './src/another-module.js',
      dependOn: 'shared',
    },
    shared: 'lodash',
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
 };
```

如果要在一个HTML页面上使用多个入口时，还需配置`optimization.runtimeChunk:'single'`。否则会遇到麻烦：

比如：

```html
<!DOCTYPE html>
<script src="component-1.js"></script>
<script src="component-2.js"></script>
```

`component-1.js`

```js
import obj from './obj.js';
obj.count++;
console.log('component-1', obj.count);
```

`component-2.js`

```js
import obj from './obj.js';
obj.count++;
console.log('component-2', obj.count);
```

`obj.js`

```js
export default { count: 0 };
```

> 一个模块不能被实例化两次！`ECMAScript`模块和`CommonJS`模块都指定一个模块在每个JavaScript上下文中只能被实例化一次。这种保证允许模块的顶级范围用于全局状态，并在该模块的所有用法之间共享。

修改`webpack.config.js`配置文件：

```js
const path = require('path');

 module.exports = {
   mode: 'development',
   entry: {
     index: {
       import: './src/index.js',
       dependOn: 'shared',
     },
     another: {
       import: './src/another-module.js',
       dependOn: 'shared',
     },
     shared: 'lodash',
   },
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
   },
  // 添加
  optimization: {
    runtimeChunk: 'single',
  },
 };
```

这样最后生成的除了`index.bundle.js`和`another.bundle.js`外，还有一个`runtime.bundle.js`文件。

### 2.3 `SplitChunks`插件

`SplitChunksPlugin`插件可以将公共的依赖模块提取到现有的入口chunk中，或者提取到一个新生成的chunk。

修改`webpack.config.js`：

```js
optimization: {
     splitChunks: {
       chunks: 'all',
     },
   },
```

使用`optimization.splitChunks`配置选项之后，现在应该可以抛光，`index.bundle.js`和`another.bundle.js`中已经移除了重复的依赖模块。需要注意的是，插件将`lodash`分离到单独的块，并且将其从主包中移除，减小了大小。

### 2.4 动态导入

```js
function getComponent() {
    return import ( /* webpackChunkName: "custom-lodash" */ 'lodash').then(_ => {
        var element = document.createElement('div')
        element.innerHTML = _.join(["Hello", "LinDaiDai"])

        return element
    }).catch(error => 'An error occurred while loading the component')
}

getComponent().then(component => {
    document.body.appendChild(component)
})
```

**使用async函数:**

由于`import()`返回的是一个`promise`, 因此我们可以使用`async`函数来简化它.

```js
async function getComponent() {
    const element = document.createElement('div');
    const { default: _ } = await import('lodash');
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    return element;
}
getComponent().then((component) => {
   document.body.appendChild(component);
 });
```

## 三、懒加载

> 这种方式实际上是先把你的代码在一些逻辑断点处分离开，然后在一些代码块中完成某些操作后，立即引用或即将引用另外一些新的代码块。这样加快了应用的初始加载速度，减轻了它的总体体积，因为某些代码块可能永远不会被加载。

```js
/**
 * 懒加载效果
 */
function getComponent() {
    var element = document.createElement('div')
    element.innerHTML = 'Hello LinDaiDai'

    var btn = document.createElement('button')
    btn.innerHTML = '点击按钮'
    element.appendChild(btn)

    btn.onclick = e =>
        import ( /* webpackChunkName: "lodash" */ "lodash").then(_ => {
            console.log(_.join(['点击了按钮', '加载了lodash']))
        })
    return element
}
document.body.appendChild(getComponent())
```

上述代码实现，在项目打包后未加载`vendors~lodash.bundle.js`，只有点击了按钮后，才按需加载。重复点击后，只会加载一次。[`Vue`中的懒加载](https://alexjover.com/blog/lazy-load-in-vue-using-webpack-s-code-splitting/)

`Vue`组件的延迟加载：

```js
Vue.component("AsyncCmp", () => import("./AsyncCmp"));
```

通过将`import`函数包装到箭头函数中，`Vue`仅在被请求时才执行它，并在那一刻加载模块。

🌰

```js
// src/print.js
console.log('print.js 模块被加载了')

export default () => {
    console.log('点击按钮')
}
```

修改`src/index.js`：

```js
function getComponent() {
    var element = document.createElement('div')
    element.innerHTML = 'Hello LinDaiDai'

    var btn = document.createElement('button')
    btn.innerHTML = '点击按钮'
    element.appendChild(btn)
        // btn.onclick = e =>
        //     import ( /* webpackChunkName: "lodash" */ "lodash").then(_ => {
        //         console.log(_.join(['点击了按钮', '加载了lodash']))
        //     })
    btn.onclick = e =>
        import ( /* webpackChunkName: "print" */ "./print").then(module => {
            var print = module.default
            print()
        })

    return element
}
document.body.appendChild(getComponent())
```

> 注意当调用ES6模块的`import()`方法（约会模块）时，必须指向模块的`.default`值，因为它才是promise被处理后返回的实际的`module`对象。