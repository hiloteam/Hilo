/**
 * hilojs 2.0.3 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/loader/ImageLoader', function(S, Class){



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
            image.crossOrigin = "Anonymous";
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

return ImageLoader;

}, {
    requires: ['hilo/core/Class']
});