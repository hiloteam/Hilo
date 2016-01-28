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

* run `npm install yeoman`
* run `npm install generator-hilo`
* run `yo hilo` to create a project to continue your fascinating game development

### API Documentation

Get started by reading [docs/api/index.html](http://hiloteam.github.io/api/index.html)

### API Samples
 * [Index](examples/index.html)
 * Visual Objects (View)
    * [Bitmap](examples/Bitmap.html)
    * [Sprite](examples/Sprite.html)
    * [Graphics](examples/Graphics.html)
    * [DOM element](examples/DOMElement.html)
    * [Button](examples/Button.html)
    * [Background](examples/Background.html)
    * [Canvas Text](examples/Text.html)

 * Others
    * [Load queue](examples/LoadQueue.html)
    * [Web sound](examples/WebSound.html)
    * [Mouse Event](examples/MouseEvent.html)
    * [Drag](examples/drag.html)

 * Extensions
    * [Camera](examples/Camera.html)
    * [Camera3d](examples/Camera3d.html)
    * [Skeleton Animation - Dragonbones](src/extensions/dragonbones/README.md)
    * [Particle System](examples/ParticleSystem.html)
    * [Physics](src/extensions/physics/README.md)

### RoadMap

![Hilo RoadMap](http://gtms03.alicdn.com/tps/i3/TB1VaALIFXXXXcLXVXXlFbLSXXX-940-668.png)

### Demonstrations

 * [1111 dance mv](http://www.tmall.com/go/market/promotion-act/mv-alone.php)
 * [car game](#hilo/demo/raw/master/race/index.html)
 * [Flappy Bird](#hilo/demo/raw/master/flappy/index.html)
 * [2048](#hilo/demo/raw/master/2048/index.html)
 * [Fruit Ninja](#hilo/demo/raw/master/fruit-ninja/index.html)
 * [Whack Mole](#hilo/demo/raw/master/whackmole/index.html)
 * [No One Dies](#hilo/demo/raw/master/noonedie/index.html)



[travis-image]: https://travis-ci.org/hiloteam/generator-hilo.svg?branch=master
[travis-url]: https://travis-ci.org/hiloteam/generator-hilo