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



