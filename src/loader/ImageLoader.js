/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @private
 * @class image resources loader.
 * @module hilo/loader/ImageLoader
 * @requires hilo/core/Class
 */
/**
 * @language=zh
 * @private
 * @class 图片资源加载器。
 * @module hilo/loader/ImageLoader
 * @requires hilo/core/Class
 */
var ImageLoader = Class.create({
    load: function(data){
        var me = this;

        var image = new Image();
        if(data.crossOrigin){
            image.crossOrigin = data.crossOrigin;
        }

        image.onload = function(){
            me.onLoad(image);
        };
        image.onerror = image.onabort = me.onError.bind(image);
        image.src = data.src + (data.noCache ? (data.src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date()) : '');
    },

    onLoad: function(image){
        image.onload = image.onerror = image.onabort = null;
        return image;
    },

    onError: function(e){
        var image = e.target;
        image.onload = image.onerror = image.onabort = null;
        return e;
    }

});