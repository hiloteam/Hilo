/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class Ticker is a Timer. It can run the code at specified framerate.
 * @param {Number} fps The fps of ticker.
 * @module hilo/util/Ticker
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 */
/**
 * @language=zh
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
     * @language=en
     * Start the ticker.
     * @param {Boolean} userRAF Whether or not use requestAnimationFrame, default is not.
     */
    /**
     * @language=zh
     * 启动定时器。
     * @param {Boolean} userRAF 是否使用requestAnimationFrame，默认为false。
     */
    start: function(useRAF){
        if(this._intervalId) return;
        this._lastTime = +new Date();

        var self = this, interval = this._interval,
            raf = window.requestAnimationFrame ||
                  window[Hilo.browser.jsVendor + 'RequestAnimationFrame'];

        var runLoop;
        if(useRAF && raf){
            var tick = function(){
                self._tick();
            };
            runLoop = function(){
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
     * @language=en
     * Stop the ticker.
     */
    /**
     * @language=zh
     * 停止定时器。
     */
    stop: function(){
        clearTimeout(this._intervalId);
        this._intervalId = null;
        this._lastTime = 0;
    },

    /**
     * @language=en
     * Pause the ticker.
     */
    /**
     * @language=zh
     * 暂停定时器。
     */
    pause: function(){
        this._paused = true;
    },

    /**
     * @language=en
     * Resume the ticker.
     */
    /**
     * @language=zh
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

        var tickersCopy = tickers.slice(0);
        for(var i = 0, len = tickersCopy.length; i < len; i++){
            tickersCopy[i].tick(deltaTime);
        }
    },

    /**
     * @language=en
     * Get the fps.
     */
    /**
     * @language=zh
     * 获得测定的运行时帧率。
     */
    getMeasuredFPS: function(){
        return this._measuredFPS;
    },

    /**
     * @language=en
     * Add tickObject. The tickObject must implement the tick method.
     * @param {Object} tickObject The tickObject to add.It must implement the tick method.
     */
    /**
     * @language=zh
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
     * @language=en
     * Remove the tickObject
     * @param {Object} tickObject The tickObject to remove.
     */
    /**
     * @language=zh
     * 删除定时器对象。
     * @param {Object} tickObject 要删除的定时器对象。
     */
    removeTick: function(tickObject){
        var tickers = this._tickers,
            index = tickers.indexOf(tickObject);
        if(index >= 0){
            tickers.splice(index, 1);
        }
    },
    /**
     * 下次tick时回调
     * @param  {Function} callback
     * @return {tickObj}
     */
    nextTick:function(callback){
        var that = this;
        var tickObj = {
            tick:function(dt){
                that.removeTick(tickObj);
                callback();
            }
        };

        that.addTick(tickObj);
        return tickObj;
    },
    /**
     * 延迟指定的时间后调用回调, 类似setTimeout
     * @param  {Function} callback
     * @param  {Number}   duration 延迟的毫秒数
     * @return {tickObj}
     */
    timeout:function(callback, duration){
        var that = this;
        var targetTime = new Date().getTime() + duration;
        var tickObj = {
            tick:function(){
                var nowTime = new Date().getTime();
                var dt = nowTime - targetTime;
                if(dt >= 0){
                    that.removeTick(tickObj);
                    callback();
                }
            }
        };
        that.addTick(tickObj);
        return tickObj;
    },
    /**
     * 指定的时间周期来调用函数, 类似setInterval
     * @param  {Function} callback
     * @param  {Number}   duration 时间周期，单位毫秒
     * @return {tickObj}
     */
    interval:function(callback, duration){
        var that = this;
        var targetTime = new Date().getTime() + duration;
        var tickObj = {
            tick:function(){
                var nowTime = new Date().getTime();
                var dt = nowTime - targetTime;
                if(dt >= 0){
                    if(dt < duration){
                        nowTime -= dt;
                    }
                    targetTime = nowTime + duration;
                    callback();
                }
            }
        };
        that.addTick(tickObj);
        return tickObj;
    }
});