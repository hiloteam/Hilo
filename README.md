# Hilo - HTML5 Game Framework [![npm][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![size][size-image]][size-url] [![gitter.im][gitter-image]][gitter-url]

[中文版](./README_ZH.md)

Hilo is a Cross-end HTML5 Game development solution developed by Alibaba Group. It could help developers build HTML5 games conveniently in minutes.

### Features

* independency modules design, support multiple module styles;
* Object Oriented Programmed Development;
* Simple and efficient Visual Object Architecture;
* Multiple render model supported, including `CanvasRenderer`, `DOMRenderer` and `WebGLRenderer`;
* Compatible for multiple desktop and mobile browsers. Using `Flash Shim` to support IE (yes as you can see, it support IE);
* Physics extensions supported: `Chipmunk`
* Skeleton animation extensions supported: `DragonBones`


### Compile and build

Built by gulp:

* run `npm install` to install all dependencies.
* run `gulp` to build source.
* run `gulp extensions` to build extensions source.
* run `gulp doc` to build API documentation.
* run `gulp test` to run tests.
* multiple module styles can be found in build folder, involving `CMD, AMD, CommonJS, KMD`.

### Project Generator for games

* run `npm install -g yo`
* run `npm install -g generator-hilo`
* run `yo hilo` to create a project to continue your fascinating game development

### API Documentation

Get started by reading [docs/api-en/index.html](https://hiloteam.github.io/Hilo/docs/api-en/index.html)

### API Samples

 * [Index.html](https://hiloteam.github.io/Hilo/examples/index.html)
 * Visual Objects (View)
    * [Bitmap](https://hiloteam.github.io/Hilo/examples/Bitmap.html)
    * [Sprite](https://hiloteam.github.io/Hilo/examples/Sprite.html)
    * [Graphics](https://hiloteam.github.io/Hilo/examples/Graphics.html)
    * [DOM element](https://hiloteam.github.io/Hilo/examples/DOMElement.html)
    * [Button](https://hiloteam.github.io/Hilo/examples/Button.html)
    * [Background](https://hiloteam.github.io/Hilo/examples/Background.html)
    * [Canvas Text](https://hiloteam.github.io/Hilo/examples/Text.html)

 * Others
    * [Load queue](https://hiloteam.github.io/Hilo/examples/LoadQueue.html)
    * [Web sound](https://hiloteam.github.io/Hilo/examples/WebSound.html)
    * [Mouse Event](https://hiloteam.github.io/Hilo/examples/MouseEvent.html)
    * [Drag](https://hiloteam.github.io/Hilo/examples/drag.html)

 * Extensions
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

### Authors

 * [flashlizi](https://github.com/flashlizi)
 * [06wj](https://github.com/06wj)
 * [picacure](https://github.com/picacure)

### Contact us

  * [![gitter.im][gitter-image]][gitter-url]
  * QQ Group:372765886

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars1.githubusercontent.com/u/800043?v=4" width="100px;"/><br/><sub><b>06wj</b></sub>](https://github.com/06wj)<br/>|[<img src="https://avatars1.githubusercontent.com/u/8164116?v=4" width="100px;"/><br/><sub><b>Jonham</b></sub>](https://github.com/Jonham)<br/>|[<img src="https://avatars1.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars1.githubusercontent.com/u/949518?v=4" width="100px;"/><br/><sub><b>picacure</b></sub>](https://github.com/picacure)<br/>|[<img src="https://avatars1.githubusercontent.com/u/1174471?v=4" width="100px;"/><br/><sub><b>steel1990</b></sub>](https://github.com/steel1990)<br/>|[<img src="https://avatars1.githubusercontent.com/u/5621469?v=4" width="100px;"/><br/><sub><b>dsouzadyn</b></sub>](https://github.com/dsouzadyn)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
|[<img src="https://avatars1.githubusercontent.com/u/6802825?v=4" width="100px;"/><br/><sub><b>jljsj33</b></sub>](https://github.com/jljsj33)<br/>|[<img src="https://avatars2.githubusercontent.com/u/8075271?v=4" width="100px;"/><br/><sub><b>ldllidonglin</b></sub>](https://github.com/ldllidonglin)<br/>|[<img src="https://avatars2.githubusercontent.com/u/8518239?v=4" width="100px;"/><br/><sub><b>gitter-badger</b></sub>](https://github.com/gitter-badger)<br/>|[<img src="https://avatars0.githubusercontent.com/u/7558788?v=4" width="100px;"/><br/><sub><b>huangwenming</b></sub>](https://github.com/huangwenming)<br/>|[<img src="https://avatars2.githubusercontent.com/u/2086996?v=4" width="100px;"/><br/><sub><b>daemonchen</b></sub>](https://github.com/daemonchen)<br/>|[<img src="https://avatars0.githubusercontent.com/u/972067?v=4" width="100px;"/><br/><sub><b>vidyuthd</b></sub>](https://github.com/vidyuthd)<br/>|
[<img src="https://avatars1.githubusercontent.com/u/11460601?v=4" width="100px;"/><br/><sub><b>zivyangll</b></sub>](https://github.com/zivyangll)<br/>|[<img src="https://avatars2.githubusercontent.com/u/15242708?v=4" width="100px;"/><br/><sub><b>mosaic101</b></sub>](https://github.com/mosaic101)<br/>|[<img src="https://avatars0.githubusercontent.com/u/366060?v=4" width="100px;"/><br/><sub><b>SunYin</b></sub>](https://github.com/SunYin)<br/>|[<img src="https://avatars0.githubusercontent.com/u/5381367?v=4" width="100px;"/><br/><sub><b>wangfulin</b></sub>](https://github.com/wangfulin)<br/>|[<img src="https://avatars3.githubusercontent.com/u/9135512?v=4" width="100px;"/><br/><sub><b>Mrluobo</b></sub>](https://github.com/Mrluobo)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Thu Jul 25 2019 20:59:10 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

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
