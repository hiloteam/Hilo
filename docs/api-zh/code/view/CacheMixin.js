/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

var _cacheCanvas, _cacheContext;
/**
 * @class CacheMixin是一个包含cache功能的mixin。可以通过 Class.mix(target, CacheMixin) 来为target增加cache功能。
 * @static
 * @mixin
 * @module hilo/view/CacheMixin
 * @requires hilo/core/Hilo
 * @requires hilo/view/Drawable
 */
var CacheMixin = /** @lends CacheMixin# */ {
    _cacheDirty:true,
    /**
     * 缓存到图片里。可用来提高渲染效率。
     * @param {Boolean} forceUpdate 是否强制更新缓存
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this.drawable){
            this.updateCache();
        }
    },
    /**
     * 更新缓存
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
     * 设置缓存是否dirty
     * @param {Boolean} dirty 是否dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};