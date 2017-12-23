# Hilo - HTML5 互动游戏引擎 [![npm][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![size][size-image]][size-url] [![gitter.im][gitter-image]][gitter-url]

[English Version](./README.md)

Hilo 是阿里巴巴集团开发的一款HTML5跨终端游戏解决方案，ta可以帮助开发者快速创建HTML5游戏。

### 主要特性

* Hilo 支持多种模块范式的包装版本，包括AMD，CMD，COMMONJS，Standalone多种方式接入。另外，你可以根据需要新增和扩展模块和类型；
* 极精简的模块设计，完全面向对象；
* 多种渲染方式, 提供DOM，Canvas，Flash，WebGL等多种渲染方案（目前已经申请专利）；
* 全端浏览器的支持和高性能方案，独有的Flash渲染方案，即使在低版本IE浏览器下也可以跑起来“酷炫”游戏； DOM渲染方案能显著解决低性能手机浏览器遇到的性能问题；
* 物理引擎支持——Chipmunk，支持自扩展物理实现；骨骼动画支持——DragonBones，同时内建骨骼动画系统——Tahiti（目前内部使用）；
* 案例丰富，框架成熟，已经经历多届阿里巴巴双十一，年中大促互动营销活动考验；


### 编译和构建

目前采用gulp构建:

* 运行 `npm install` 安装依赖.
* 运行 `gulp` 构建.
* 运行 `gulp extensions` 构建插件.
* 运行 `gulp doc` 构建Hilo API 文档.
* 运行 `gulp test` 构建测试.
* build 目录下会生成多种范式版本的Hilo，包括`CMD, AMD, CommonJS, KMD`

### 创建Hilo 游戏工程

* 运行 `npm install -g yo`
* 运行 `npm install -g generator-hilo`
* 运行 `yo hilo`
* 经过以上几步会创建Hilo的预置初始工程，接下来你建造属于你的游戏吧。

### API 文档

参见 [docs/api-zh/index.html](https://hiloteam.github.io/Hilo/docs/api-zh/index.html)

### API 样例

 * [Index.html](https://hiloteam.github.io/Hilo/examples/index.html)
 * 可视对象 (View)
    * [Bitmap](https://hiloteam.github.io/Hilo/examples/Bitmap.html)
    * [Sprite](https://hiloteam.github.io/Hilo/examples/Sprite.html)
    * [Graphics](https://hiloteam.github.io/Hilo/examples/Graphics.html)
    * [DOM element](https://hiloteam.github.io/Hilo/examples/DOMElement.html)
    * [Button](https://hiloteam.github.io/Hilo/examples/Button.html)
    * [Background](https://hiloteam.github.io/Hilo/examples/Background.html)
    * [Canvas Text](https://hiloteam.github.io/Hilo/examples/Text.html)

 * 其他
    * [Load queue](https://hiloteam.github.io/Hilo/examples/LoadQueue.html)
    * [Web sound](https://hiloteam.github.io/Hilo/examples/WebSound.html)
    * [Mouse Event](https://hiloteam.github.io/Hilo/examples/MouseEvent.html)
    * [Drag](https://hiloteam.github.io/Hilo/examples/drag.html)

 * Hilo扩展 样例
    * [Camera](https://hiloteam.github.io/Hilo/examples/Camera.html)
    * [Camera3d](https://hiloteam.github.io/Hilo/examples/Camera3d.html)
    * [Skeleton Animation - Dragonbones](https://hiloteam.github.io/Hilo/src/extensions/dragonbones/demo/index.html)
    * [Particle System](https://hiloteam.github.io/Hilo/examples/ParticleSystem.html)
    * [Physics](https://hiloteam.github.io/Hilo/src/extensions/physics/demo/index.html)

### Demos

  [![example image][example-image]][example-url]

 * [1111 dance mv](http://g.alicdn.com/tmapp/hilodemos/3.0.7/mv1111/index.html)
 * [Flappy Bird](http://g.alicdn.com/tmapp/hilodemos/3.0.7/flappy/index.html)
 * [2048](http://g.alicdn.com/tmapp/hilodemos/3.0.7/2048/index.html)
 * [Fruit Ninja](http://g.alicdn.com/tmapp/hilodemos/3.0.7/fruit-ninja/index.html)

### 作者

 * [flashlizi](https://github.com/flashlizi)
 * [06wj](https://github.com/06wj)
 * [picacure](https://github.com/picacure)

### 联系我们

  * [![gitter.im][gitter-image]][gitter-url]
  * QQ群:372765886

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[travis-image]: https://img.shields.io/travis/hiloteam/Hilo.svg?style=flat-square
[travis-url]: https://travis-ci.org/hiloteam/Hilo

[gitter-image]: https://img.shields.io/badge/GITTER-join%20chat-green.svg?style=flat-square
[gitter-url]: https://gitter.im/hiloteam/Hilo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[npm-image]: https://img.shields.io/npm/v/hilojs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/hilojs

[size-image]:http://img.badgesize.io/hiloteam/hilo/master/build/standalone/hilo-standalone.min.js.svg?compression=gzip&style=flat-square
[size-url]: https://cdn.rawgit.com/hiloteam/Hilo/master/build/standalone/hilo-standalone.min.js

[example-image]: https://img.alicdn.com/tps/TB1vDlBLVXXXXcDXVXXXXXXXXXX-850-806.png
[example-url]: https://hiloteam.github.io/examples/index.html