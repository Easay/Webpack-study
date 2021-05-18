## 前辈经验总结

- webpack中文网：[webpack中文网](https://www.webpackjs.com/concepts/)
- LinDaiDai：[霖呆呆的webpack之路](https://github.com/LinDaiDai/niubility-coding-js/blob/master/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/webpack/README.md)

## 前端工程化

### webpack

webpack是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。

#### webpack学习之路

更新基础篇：[webpack学习之路-基础篇](https://github.com/Easay/Webpack-study/blob/main/Webpack%E5%AD%A6%E4%B9%A0%E4%B9%8B%E8%B7%AF.md)

主要包括：
- 如何创建webpack项目？
- 如何安装webpack和webpack-cli
- webpack项目的组成结构
- 基础loader和plugin的使用和配置

更新构建方式篇：[webpack学习之路-构建方式篇](https://github.com/Easay/Webpack-study/blob/main/Webpack%E5%AD%A6%E4%B9%A0%E4%B9%8B%E8%B7%AF-%E6%9E%84%E5%BB%BA%E6%96%B9%E5%BC%8F%E7%AF%87.md)

主要包括：
- Watch Mode(观察者模式)
- webpack-dev-server
- webpack-dev-middleware
- webpack-merge
- process.env.NODE_ENV
- webpack.DefinePlugin插件
- 命令行传递变量给配置文件

更新优化篇：[webpack优化篇](https://github.com/Easay/Webpack-study/blob/main/webpack%E4%BC%98%E5%8C%96%E7%AF%87.md)

主要包括：
- 删除未引用的代码（Tree shaking）
- 代码分离（splitChunksPlugin）
- 懒加载
