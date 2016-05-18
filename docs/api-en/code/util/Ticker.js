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
     * @language=en
     * Stop the ticker.
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
    pause: function(){
        this._paused = true;
    },

    /**
     * @language=en
     * Resume the ticker.
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
     * @language=en
     * Get the fps.
     */
    getMeasuredFPS: function(){
        return this._measuredFPS;
    },

    /**
     * @language=en
     * Add tickObject. The tickObject must implement the tick method.
     * @param {Object} tickObject The tickObject to add.It must implement the tick method.
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
    removeTick: function(tickObject){
        var tickers = this._tickers,
            index = tickers.indexOf(tickObject);
        if(index >= 0){
            tickers.splice(index, 1);
        }
    }

});