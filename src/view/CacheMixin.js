/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class CacheMixin A mixin that contains cache method.You can mix cache method to the target by use Class.mix(target, CacheMixin).
 * @static
 * @mixin
 * @module hilo/view/CacheMixin
 * @requires hilo/core/Hilo
 * @requires hilo/view/Drawable
 */
/**
 * @language=zh
 * @class CacheMixin是一个包含cache功能的mixin。可以通过 Class.mix(target, CacheMixin) 来为target增加cache功能。
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
    /**
     * @language=zh
     * 缓存到图片里。可用来提高渲染效率。
     * @param {Boolean} forceUpdate 是否强制更新缓存
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
    /**
     * @language=zh
     * 更新缓存
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

            cacheCanvas.width = Math.max(cacheCanvas.width, this.width);
            cacheCanvas.height = Math.max(cacheCanvas.height, this.height);
            cacheContext.clearRect(0, 0, cacheCanvas.width, cacheCanvas.height);

            this._draw(cacheContext);
            this._cacheImage = new Image();
            this._cacheImage.src = cacheCanvas.toDataURL();

            // firefox and safari dont read base64 image's width and height
            // it's default to 0
            this._cacheImage.width = cacheCanvas.width;
            this._cacheImage.height = cacheCanvas.height;

            this.drawable = this.drawable || new Drawable();
            this.drawable.init(this._cacheImage);
            this._cacheDirty = false;
        }
    },
    /**
     * @language=en
     * set the cache state diry.
     * @param {Boolean} dirty is cache dirty
     */
    /**
     * @language=zh
     * 设置缓存是否dirty
     * @param {Boolean} dirty 是否dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};