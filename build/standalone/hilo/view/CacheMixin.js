/**
 * Hilo 1.0.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Drawable = Hilo.Drawable;


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
    _cacheCanvas: null,
    _cacheContext: null,
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
        var cacheCanvas = this._cacheCanvas;
        var cacheContext = this._cacheContext;

        if(Hilo.browser.supportCanvas){
            //TODO:width, height自动判断
            if (!cacheCanvas) {
                cacheCanvas = this._cacheCanvas = document.createElement('canvas');
                cacheContext = this._cacheContext = this._cacheCanvas.getContext('2d');
            }

            cacheCanvas.width = this.width;
            cacheCanvas.height = this.height;
            cacheContext.clearRect(0, 0, this.width, this.height);
            this._draw(cacheContext);
            this._cacheImage = new Image();
            this._cacheImage.src = cacheCanvas.toDataURL();
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
Hilo.CacheMixin = CacheMixin;
})(window);