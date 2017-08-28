/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Container = window.Hilo.Container;
var Drawable = window.Hilo.Drawable;
var util = window.Hilo.util;


/**
 * @language=en
 * <iframe src='../../../examples/ParticleSystem.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class ParticleSystem A particle system.
 * @augments Container
 * @module hilo/game/ParticleSystem
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Container
 * @requires hilo/view/Drawable
 * @requires hilo/util/util
 * @property {Number} [emitTime=0.2] Emit time interval(in second).
 * @property {Number} [emitTimeVar=0] Emit time interval variances.
 * @property {Number} [emitNum=10] Emit number.
 * @property {Number} [emitNumVar=0] Emit number variances.
 * @property {Number} [emitterX=0] The emitter x position.
 * @property {Number} [emitterY=0] The emitter y position.
 * @property {Number} [totalTime=Infinity] Total time.
 * @property {Number} [gx=0] The gravity x value.
 * @property {Number} [gy=0] The gravity y value.
 * @param {Object} properties properties The properties to create a view object, contains all writeable props of this class
 * @param {Object} properties.particle The config of particle.
 * @param {Number} [properties.particle.x=0] The x position.
 * @param {Number} [properties.particle.y=0] The y position
 * @param {Number} [properties.particle.vx=0] The x velocity.
 * @param {Number} [properties.particle.vy=0] The y velocity.
 * @param {Number} [properties.particle.ax=0] The x acceleration.
 * @param {Number} [properties.particle.ay=0] The y acceleration.
 * @param {Number} [properties.particle.life=1] The time particle lives(in second).
 * @param {Number} [properties.particle.alpha=1] The alpha.
 * @param {Number} [properties.particle.alphaV=0] The alpha decline rate.
 * @param {Number} [properties.particle.scale=1] The scale.
 * @param {Number} [properties.particle.scaleV=0] The scale decline rate.
*/
var ParticleSystem = (function(){
    //粒子属性
    var props = ['x', 'y', 'vx', 'vy', 'ax', 'ay', 'rotation', 'rotationV', 'scale', 'scaleV', 'alpha', 'alphaV', 'life'];
    var PROPS = [];
    for(var i = 0, l = props.length;i < l;i ++){
        var p = props[i];
        PROPS.push(p);
        PROPS.push(p + "Var");
    }

    //粒子默认值
    var PROPS_DEFAULT = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        scale:1,
        scaleV:0,
        alpha:1,
        alphaV:0,
        rotation: 0,
        rotationV: 0,
        life: 1
    };

    var diedParticles = [];

    var ParticleSystem = Class.create(/** @lends ParticleSystem.prototype */{
        Extends:Container,
        constructor:function(properties){
            this.id = this.id || properties.id || Hilo.getUid("ParticleSystem");

            this.emitterX = 0;
            this.emitterY = 0;

            this.gx = 0;
            this.gy = 0;
            this.totalTime = Infinity;

            this.emitNum = 10;
            this.emitNumVar = 0;

            this.emitTime = .2;
            this.emitTimeVar = 0;

            this.particle = {};

            ParticleSystem.superclass.constructor.call(this, properties);

            this.reset(properties);
        },
        Statics:{
            PROPS:PROPS,
            PROPS_DEFAULT:PROPS_DEFAULT,
            diedParticles:diedParticles
        },
        /**
         * @language=en
         * Reset the properties.
         * @param {Object} cfg
        */
        reset: function(cfg) {
            util.copy(this, cfg);
            this.particle.system = this;
            if(this.totalTime <= 0){
                this.totalTime = Infinity;
            }
        },
        /**
         * @language=en
         * 更新
         * @param {Number} dt delta time(in milliseconds)
        */
        onUpdate: function(dt) {
            dt *= .001;
            if (this._isRun) {
                this._totalRunTime += dt;
                this._currentRunTime += dt;
                if (this._currentRunTime >= this._emitTime) {
                    this._currentRunTime = 0;
                    this._emitTime = getRandomValue(this.emitTime, this.emitTimeVar);
                    this._emit();
                }

                if (this._totalRunTime >= this.totalTime) {
                    this.stop();
                }
            }
        },
        /**
         * @language=en
         * Emit particles.
        */
        _emit: function() {
            var num = getRandomValue(this.emitNum, this.emitNumVar)>>0;
            for (var i = 0; i < num; i++) {
                this.addChild(Particle.create(this.particle));
            }
        },
        /**
         * @language=en
         * Start emit particles.
        */
        start: function() {
            this.stop(true);
            this._currentRunTime = 0;
            this._totalRunTime = 0;
            this._isRun = true;
            this._emitTime = getRandomValue(this.emitTime, this.emitTimeVar);
        },
        /**
         * @language=en
         * Stop emit particles.
         * @param {Boolean} clear Whether or not clear all the particles.
        */
        stop: function(clear) {
            this._isRun = false;
            if (clear) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    this.children[i].destroy();
                }
            }
        }
    });

    /**
     * @language=en
     * @class 粒子
     * @inner
     * @param {Number} vx The x velocity.
     * @param {Number} vy The y velocity.
     * @param {Number} ax The x acceleration.
     * @param {Number} ay The y acceleration.
     * @param {Number} scaleV The scale decline rate.
     * @param {Number} alphaV The alpha decline rate.
     * @param {Number} rotationV The rotate speed.
     * @param {Number} life The time particle lives(in seconds)
    */
    var Particle = Class.create({
        Extends:View,
        constructor:function(properties){
            this.id = this.id || properties.id || Hilo.getUid("Particle");
            Particle.superclass.constructor.call(this, properties);
            this.init(properties);
        },
        /**
         * @language=en
         * Update the particle.
        */
        onUpdate: function(dt) {
            dt *= .001;
            if(this._died){
                return false;
            }
            var ax = this.ax + this.system.gx;
            var ay = this.ay + this.system.gy;

            this.vx += ax * dt;
            this.vy += ay * dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.rotation += this.rotationV;

            if (this._time > .1) {
                this.alpha += this.alphaV;
            }

            this.scale += this.scaleV;
            this.scaleX = this.scaleY = this.scale;

            this._time += dt;
            if (this._time >= this.life || this.alpha <= 0) {
                this.destroy();
                return false;
            }
        },
        /**
         * @language=en
         * Set the image of particle.
        */
        setImage: function(img, frame) {
            this.drawable = this.drawable||new Drawable();
            frame = frame || [0, 0, img.width, img.height];

            this.width = frame[2];
            this.height = frame[3];
            this.drawable.rect = frame;
            this.drawable.image = img;
        },
        /**
         * @language=en
         * Destroy the particle.
        */
        destroy: function() {
            this._died = true;
            this.alpha = 0;
            this.removeFromParent();
            diedParticles.push(this);
        },
        /**
         * @language=en
         * Init the particle.
        */
        init: function(cfg) {
            this.system = cfg.system;
            this._died = false;
            this._time = 0;
            this.alpha = 1;
            for (var i = 0, l = PROPS.length; i < l; i++) {
                var p = PROPS[i];
                var v = cfg[p] === undefined ? PROPS_DEFAULT[p] : cfg[p];
                this[p] = getRandomValue(v, cfg[p + 'Var']);
            }

            this.x += this.system.emitterX;
            this.y += this.system.emitterY;

            if (cfg.image) {
                var frame = cfg.frame;
                if(frame && frame[0].length){
                    frame = frame[(Math.random() * frame.length) >> 0];
                }
                this.setImage(cfg.image, frame);
                if(cfg.pivotX !== undefined){
                    this.pivotX = cfg.pivotX * frame[2];
                }
                if(cfg.pivotY !== undefined){
                    this.pivotY = cfg.pivotY * frame[3];
                }
            }
        },
        Statics:{
            /**
             * @language=en
             * Create the particle.
             * @param {Object} cfg The config of particle.
            */
            create:function(cfg) {
                if (diedParticles.length > 0) {
                    var particle = diedParticles.pop();
                    particle.init(cfg);
                    return particle;
                } else {
                    return new Particle(cfg);
                }
            }
        }

    });

    /**
     * Get the random value.
     * @private
     * @param  {Number} value     The value.
     * @param  {Number} variances The variances.
     * @return {Number}
     */
    function getRandomValue(value, variances){
        return variances ? value + (Math.random() - .5) * 2 * variances : value;
    }

    return ParticleSystem;
})();
window.Hilo.ParticleSystem = ParticleSystem;
})(window);