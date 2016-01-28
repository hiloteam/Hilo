/**
 * Hilo 1.0.0 for cmd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define(function(require, exports, module){

var Class = require('hilo/core/Class');
var Hilo = require('hilo/core/Hilo');

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Ticker是一个定时器类。它可以按指定帧率重复运行，从而按计划执行代码。
 * @param {Number} fps 指定定时器的运行帧率。
 * @module hilo/util/Ticker
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 */
var Ticker = Class.create(/** @lends Ticker.prototype */{
    constructor: function(fps){
        this._targetFPS = fps || 30;
        this._interval = 1000 / this._targetFPS;
        this._tickers = [];
    },

    _paused: false,
    _targetFPS: 0,
    _interval: 0,
    _intervalId: null,
    _tickers: null,
    _lastTime: 0,
    _tickCount: 0,
    _tickTime: 0,
    _measuredFPS: 0,

    /**
     * 启动定时器。
     * @param {Boolean} userRAF 是否使用requestAnimationFrame，默认为false。
     */
    start: function(useRAF){
        if(this._intervalId) return;
        this._lastTime = +new Date();

        var self = this, interval = this._interval,
            raf = window.requestAnimationFrame ||
                  window[Hilo.browser.jsVendor + 'RequestAnimationFrame'];

        if(useRAF && raf){
            var tick = function(){
                self._tick();
            }
            var runLoop = function(){
                self._intervalId = setTimeout(runLoop, interval);
                raf(tick);
            };
        }else{
            runLoop = function(){
                self._intervalId = setTimeout(runLoop, interval);
                self._tick();
            };
        }

        runLoop();
    },

    /**
     * 停止定时器。
     */
    stop: function(){
        clearTimeout(this._intervalId);
        this._intervalId = null;
        this._lastTime = 0;
    },

    /**
     * 暂停定时器。
     */
    pause: function(){
        this._paused = true;
    },

    /**
     * 恢复定时器。
     */
    resume: function(){
        this._paused = false;
    },

    /**
     * @private
     */
    _tick: function(){
        if(this._paused) return;
        var startTime = +new Date(),
            deltaTime = startTime - this._lastTime,
            tickers = this._tickers;

        //calculates the real fps
        if(++this._tickCount >= this._targetFPS){
            this._measuredFPS = 1000 / (this._tickTime / this._tickCount) + 0.5 >> 0;
            this._tickCount = 0;
            this._tickTime = 0;
        }else{
            this._tickTime += startTime - this._lastTime;
        }
        this._lastTime = startTime;

        for(var i = 0, len = tickers.length; i < len; i++){
            tickers[i].tick(deltaTime);
        }
    },

    /**
     * 获得测定的运行时帧率。
     */
    getMeasuredFPS: function(){
        return this._measuredFPS;
    },

    /**
     * 添加定时器对象。定时器对象必须实现 tick 方法。
     * @param {Object} tickObject 要添加的定时器对象。此对象必须包含 tick 方法。
     */
    addTick: function(tickObject){
        if(!tickObject || typeof(tickObject.tick) != 'function'){
            throw new Error('Ticker: The tick object must implement the tick method.');
        }
        this._tickers.push(tickObject);
    },

    /**
     * 删除定时器对象。
     * @param {Object} tickObject 要删除的定时器对象。
     */
    removeTick: function(tickObject){
        var tickers = this._tickers,
            index = tickers.indexOf(tickObject);
        if(index >= 0){
            tickers.splice(index, 1);
        }
    }

});

return Ticker;

});