/**
 * Hilo 1.0.1 for commonjs
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
var Class = require('../core/Class');



/**
 * @language=en
 * @private
 * @class image resources loader.
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

        image.onload = //me.onLoad.bind(image);
        function(){
            me.onLoad(image)
        };
        image.onerror = image.onabort = me.onError.bind(image);
        image.src = data.src + (data.noCache ? (data.src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date) : '');
    },

    onLoad: function(e){
        e = e||window.event;
        var image = e//e.target;
        image.onload = image.onerror = image.onabort = null;
        return image;
    },

    onError: function(e){
        var image = e.target;
        image.onload = image.onerror = image.onabort = null;
        return e;
    }

});

module.exports = ImageLoader;