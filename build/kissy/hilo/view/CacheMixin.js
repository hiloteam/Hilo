/**
 * Hilo 1.1.7 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/CacheMixin', function(S, Drawable, browser){



var _cacheCanvas, _cacheContext;
/**
 * @language=en
 * @class CacheMixin A mixin that contains cache method.You can mix cache method to the target by use Class.mix(target, CacheMixin).
 * @static
 * @mixin
 * @module hilo/view/CacheMixin
 * @requires hilo/view/Drawable
 * @requires hilo/util/browser
 */
var CacheMixin = /** @lends CacheMixin# */ {
    _cacheDirty:true,
    /**
     * @language=en
     * Cache the view.
     * @param {Boolean} forceUpdate is force update cache.
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this.drawable){
            this.updateCache();
        }
    },
    /**
     * @language=en
     * Update the cache.
     */
    updateCache:function(){
        if(browser.supportCanvas){
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
     * @language=en
     * set the cache state diry.
     * @param {Boolean} dirty is cache dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};

return CacheMixin;

}, {
    requires: ['hilo/view/Drawable', 'hilo/util/browser']
});