<a name="1.1.5"></a>
## [1.1.5](https://github.com/hiloteam/hilo/compare/v1.1.4...v1.1.5) (2017-12-12)


### Bug Fixes

* dragonbones dispatchOnce event bug ([8d978e9](https://github.com/hiloteam/hilo/commit/8d978e9))
* view.getBounds bug, when view has align property, see [#108](https://github.com/hiloteam/hilo/issues/108) ([0f5b1ec](https://github.com/hiloteam/hilo/commit/0f5b1ec))

<a name="1.1.2"></a>
## [1.1.2](https://github.com/hiloteam/hilo/compare/v1.1.1...v1.1.2) (2017-08-28)


### Bug Fixes

* fix ticker.getMeasuredFPS should not be greater than target fps ([5db97ab](https://github.com/hiloteam/hilo/commit/5db97ab))


<a name="1.1.1"></a>
## [1.1.1](https://github.com/hiloteam/hilo/compare/v1.1.0...v1.1.1) (2017-07-20)


### Bug Fixes

* dragMove event should be sent at the end, fix [#92](https://github.com/hiloteam/hilo/issues/92) ([7b3341e](https://github.com/hiloteam/hilo/commit/7b3341e))
* fix detect orientation bug, close [#91](https://github.com/hiloteam/hilo/issues/91) ([93537c7](https://github.com/hiloteam/hilo/commit/93537c7))


<a name="1.1.0"></a>
## [1.1.0](https://github.com/hiloteam/hilo/compare/v1.0.5...v1.1.0) (2017-06-29)


### Features

* add CanvasRenderer blendmode support ([38f3b6d](https://github.com/hiloteam/hilo/commit/38f3b6d))
* add util/util ([5397509](https://github.com/hiloteam/hilo/commit/5397509))
* add utils/browser ([7fc585a](https://github.com/hiloteam/hilo/commit/7fc585a))


<a name="1.0.5"></a>
## [1.0.5](https://github.com/hiloteam/hilo/compare/v1.0.4...v1.0.5) (2017-06-02)


### Bug Fixes

* call drag.starDrag twice bug ([b74fb02](https://github.com/hiloteam/hilo/commit/b74fb02))


### Features

* add drawable crossOrigin support ([8f1da6b](https://github.com/hiloteam/hilo/commit/8f1da6b))
* WebAudio.getAudio add the preferWebAudio option to select whether or not to use WebAudio first ([a4c5651](https://github.com/hiloteam/hilo/commit/a4c5651))


<a name="1.0.4"></a>
## [1.0.4](https://github.com/hiloteam/hilo/compare/v1.0.3...v1.0.4) (2017-04-28)


### Bug Fixes

* Tween Ease.Back bug ([1ecd93c](https://github.com/hiloteam/hilo/commit/1ecd93c))

<a name="1.0.3"></a>
## [1.0.3](https://github.com/hiloteam/hilo/compare/v1.0.2...v1.0.3) (2017-04-26)


### Bug Fixes

* cacheMixin load image bug ([91affbb](https://github.com/hiloteam/hilo/commit/91affbb))
* firefox use webkit vendor, close [#77](https://github.com/hiloteam/hilo/issues/77) ([7357c7d](https://github.com/hiloteam/hilo/commit/7357c7d)), closes [#77](https://github.com/hiloteam/hilo/issues/77)
* graphics.drawSVGPath negative number bug ([560bdf8](https://github.com/hiloteam/hilo/commit/560bdf8))
* npm module standalone bug ([2d4b369](https://github.com/hiloteam/hilo/commit/2d4b369))
* polyfill use if to judge that some environments use Object.freeze to freeze the prototype will throw an exception ([ba4ac94](https://github.com/hiloteam/hilo/commit/ba4ac94))
* ticker.start(true) use raf when fps >= 60 ([7d5e1a0](https://github.com/hiloteam/hilo/commit/7d5e1a0))
* Tween.to & Tween.from params add default value ([653cf36](https://github.com/hiloteam/hilo/commit/653cf36))


### Features

* loadQueue add support for webp (#76)([6b00c62](https://github.com/hiloteam/hilo/commit/6b00c62))
* add typescript definitions ([#83](https://github.com/hiloteam/hilo/issues/83)) ([cd3f4d6](https://github.com/hiloteam/hilo/commit/cd3f4d6))
* graphics.drawSVGPath supports all attributes except Arcs, close [#85](https://github.com/hiloteam/hilo/issues/85) ([2002f04](https://github.com/hiloteam/hilo/commit/2002f04)), closes [#85](https://github.com/hiloteam/hilo/issues/85)


<a name="1.0.2"></a>
## [1.0.2](https://github.com/hiloteam/hilo/compare/v1.0.1...v1.0.2) (2016-12-06)


### Bug Fixes

* CanvasRenderer & WebGLRenderer stage resize bug ([44111fa](https://github.com/hiloteam/hilo/commit/44111fa))
* Particle.onUpdate need return false when it is died ([2baabc3](https://github.com/hiloteam/hilo/commit/2baabc3))
* the stop method of ParticleSystem does not work ([#49](https://github.com/hiloteam/hilo/issues/49)) ([eb640a1](https://github.com/hiloteam/hilo/commit/eb640a1))
* WebGLRenderer.isSupported => WebGLRenderer.isSupport ([89c7243](https://github.com/hiloteam/hilo/commit/89c7243))


### Features

* add handle lost context event in WebGLRenderer ([722371c](https://github.com/hiloteam/hilo/commit/722371c))
* add Hilo.version ([aab1300](https://github.com/hiloteam/hilo/commit/aab1300))
* add Ticker.interval & Ticker.timeout & Ticker.nextTick ([ef7f355](https://github.com/hiloteam/hilo/commit/ef7f355))
* auto cache WebAudio buffer & add WebAudio.clearBufferCache ([79203d7](https://github.com/hiloteam/hilo/commit/79203d7))
* physic.bindView add isStatic prop ([ede92ed](https://github.com/hiloteam/hilo/commit/ede92ed))
* physics auto reindexStatic body ([bebc846](https://github.com/hiloteam/hilo/commit/bebc846))
* physics.bindView add layers and group config for collision ([7fb2c16](https://github.com/hiloteam/hilo/commit/7fb2c16))
* update dragonbones to v4.3.5 ([#51](https://github.com/hiloteam/hilo/issues/51)) ([096baab](https://github.com/hiloteam/hilo/commit/096baab))
* WebGL render mode support view's tint property ([00da91a](https://github.com/hiloteam/hilo/commit/00da91a))


<a name="1.0.1"></a>
## [1.0.1](https://github.com/hiloteam/hilo/compare/v1.0.0...v1.0.1) (2016-05-18)


### Bug Fixes

* Bitmap.setImage need set width&height ([7806046](https://github.com/hiloteam/hilo/commit/7806046))
* eventMixin.on once bug ([fcaebfd](https://github.com/hiloteam/hilo/commit/fcaebfd))
* Hilo.getElementRect bug ([d1dda4a](https://github.com/hiloteam/hilo/commit/d1dda4a))
* set DOMElement pointer-event style to visible when it's pointerEnabled is true ([fa28684](https://github.com/hiloteam/hilo/commit/fa28684))
* Text.js len & wlen are used before there were defined ([7268ea4](https://github.com/hiloteam/hilo/commit/7268ea4))


### Features
* add English api doc.
* change WebGLRenderer.isSupport() to WebGLRenderer.isSupported ([f9f9bc4](https://github.com/hiloteam/hilo/commit/f9f9bc4))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/hiloteam/hilo/compare/4efc6e6...v1.0.0) (2016-03-01)


### Bug Fixes

* WebGLRenderer worldMatrix bug ([4efc6e6](https://github.com/hiloteam/hilo/commit/4efc6e6))



