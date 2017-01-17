/**
 * Hilo 1.0.2 for cmd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define(function(require, exports, module){

var Hilo = require('hilo/core/Hilo');
var Drawable = require('hilo/view/Drawable');



var _cacheCanvas, _cacheContext;
/**
 * @language=en
 * @class CacheMixin A mixin that contains cache method.You can mix cache method to the target by use Class.mix(target, CacheMixin).
 * @static
 * @mixin
 * @module hilo/view/CacheMixin
 * @requires hilo/core/Hilo
 * @requires hilo/view/Drawable
 */
var CacheMixin = /** @lends CacheMixin# */ {
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
        if(Hilo.browser.supportCanvas){
            if(!_cacheCanvas){
                _cacheCanvas = document.createElement('canvas');
                _cacheContext = _cacheCanvas.getContext('2d');
            }

            //TODO:width, height自动判断
            _cacheCanvas.width = this.width;
            _cacheCanvas.height = this.height;
            this._draw(_cacheContext);
            this._cacheImage = new Image();
            this._cacheImage.src = _cacheCanvas.toDataURL();
            this.drawable = this.drawable||new Drawable();
            this.drawable.init(this._cacheImage);
            this._cacheDirty = false;
        }
    },
    /**
     * @language=en
     * set the cache state diry.
     * @param {Boolean} dirty is cache dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};

return CacheMixin;

});