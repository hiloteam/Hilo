Hilo - HTML5 Game Framework [![Build Status][travis-image]][travis-url]
===========================

Hilo is a Cross-end HTML5 Game development solution. It could help developers build HTML5 games conveniently in minutes.

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

Get started by reading [docs/api/index.html](http://hiloteam.github.io/api/index.html)

### API Samples
 * [Index.html](http://hiloteam.github.io/Hilo/examples/index.html)
 * Visual Objects (View)
    * [Bitmap](http://hiloteam.github.io/Hilo/examples/Bitmap.html)
    * [Sprite](http://hiloteam.github.io/Hilo/examples/Sprite.html)
    * [Graphics](http://hiloteam.github.io/Hilo/examples/Graphics.html)
    * [DOM element](http://hiloteam.github.io/Hilo/examples/DOMElement.html)
    * [Button](http://hiloteam.github.io/Hilo/examples/Button.html)
    * [Background](http://hiloteam.github.io/Hilo/examples/Background.html)
    * [Canvas Text](http://hiloteam.github.io/Hilo/examples/Text.html)

 * Others
    * [Load queue](http://hiloteam.github.io/Hilo/examples/LoadQueue.html)
    * [Web sound](http://hiloteam.github.io/Hilo/examples/WebSound.html)
    * [Mouse Event](http://hiloteam.github.io/Hilo/examples/MouseEvent.html)
    * [Drag](http://hiloteam.github.io/Hilo/examples/drag.html)

 * Extensions
    * [Camera](http://hiloteam.github.io/Hilo/examples/Camera.html)
    * [Camera3d](http://hiloteam.github.io/Hilo/examples/Camera3d.html)
    * [Skeleton Animation - Dragonbones](http://hiloteam.github.io/Hilo/src/extensions/dragonbones/demo/cat)
    * [Particle System](http://hiloteam.github.io/Hilo/examples/ParticleSystem.html)
    * [Physics](http://hiloteam.github.io/Hilo/src/extensions/physics/demo/index.html)

### RoadMap

![Hilo RoadMap](http://gtms03.alicdn.com/tps/i3/TB1VaALIFXXXXcLXVXXlFbLSXXX-940-668.png)

### Wiki

[wiki](https://github.com/hiloteam/Hilo/wiki)

### Demonstrations

 * [1111 dance mv](http://www.tmall.com/go/market/promotion-act/mv-alone.php)
 * [car game](#hilo/demo/raw/master/race/index.html)
 * [Flappy Bird](#hilo/demo/raw/master/flappy/index.html)
 * [2048](#hilo/demo/raw/master/2048/index.html)
 * [Fruit Ninja](#hilo/demo/raw/master/fruit-ninja/index.html)
 * [Whack Mole](#hilo/demo/raw/master/whackmole/index.html)
 * [No One Dies](#hilo/demo/raw/master/noonedie/index.html)



[travis-image]: https://travis-ci.org/hiloteam/Hilo.svg?branch=master
[travis-url]: https://travis-ci.org/hiloteam/Hilo