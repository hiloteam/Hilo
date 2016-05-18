/**
 * Hilo 1.0.1 for commonjs
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
var Hilo = require('../core/Hilo');
var Class = require('../core/Class');
var Drawable = require('./Drawable');



var _cacheCanvas = Hilo.createElement('canvas');
var _cacheContext = _cacheCanvas.getContext('2d');
/**
 * @language=en
 * @class CacheMixin A mixin that contains cache method.You can mix cache method to the target by use Class.mix(target, CacheMixin).
 * @mixin
 * @static
 * @module hilo/view/CacheMixin
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/Drawable
 */
var CacheMixin = {
    _cacheDirty:true,
    /**
     * @language=en
     * Cache the view.
     * @param {Boolean} forceUpdate is force update cache.
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this._cacheImage){
            this.updateCache();
        }
    },
    /**
     * @language=en
     * Update the cache.
     */
    updateCache:function(){
        //TODO:width, height自动判断
        _cacheCanvas.width = this.width;
        _cacheCanvas.height = this.height;
        this._draw(_cacheContext);
        this._cacheImage = new Image();
        this._cacheImage.src = _cacheCanvas.toDataURL();
        this.drawable = this.drawable||new Drawable();
        this.drawable.init(this._cacheImage);
        this._cacheDirty = false;
    },
    /**
     * @language=en
     * set the cache state diry.
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};

module.exports = CacheMixin;