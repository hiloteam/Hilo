/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

var _cacheCanvas, _cacheContext;
/**
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
     * Cache the view.
     * @param {Boolean} forceUpdate is force update cache.
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this.drawable){
            this.updateCache();
        }
    },
    /**
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
            this.drawable = this.drawable||new Drawable();
            this.drawable.init({
                image:_cacheCanvas.toDataURL()
            });
            this._cacheDirty = false;
        }
    },
    /**
     * set the cache state diry.
     * @param {Boolean} dirty is cache dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};