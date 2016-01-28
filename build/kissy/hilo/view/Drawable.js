/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/Drawable', function(S, Hilo, Class){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Drawable是可绘制图像的包装。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Drawable
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} image 要绘制的图像。即可被CanvasRenderingContext2D.drawImage使用的对象类型，可以是HTMLImageElement、HTMLCanvasElement、HTMLVideoElement等对象。
 * @property {array} rect 要绘制的图像的矩形区域。
 */
var Drawable = Class.create(/** @lends Drawable.prototype */{
    constructor: function(properties){
        this.init(properties);
    },

    image: null,
    rect: null,

    /**
     * 初始化可绘制对象。
     * @param {Object} properties 要初始化的属性。
     */
    init: function(properties){
        var me = this, oldImage = me.image;
        if(Drawable.isDrawable(properties)){
            me.image = properties;
        }else{
            Hilo.copy(me, properties, true);
        }

        var image = me.image;
        if(typeof image === 'string'){
            if(oldImage && image === oldImage.getAttribute('src')){
                image = me.image = oldImage;
            }else{
                me.image = null;
                //load image dynamically
                var img = new Image();
                img.onload = function(){
                    img.onload = null;
                    me.init(img);
                };
                img.src = image;
                return;
            }
        }

        if(image && !me.rect) me.rect = [0, 0, image.width, image.height];
    },

    Statics: /** @lends Drawable */{
        /**
         * 判断参数elem指定的元素是否可包装成Drawable对象。
         * @param {Object} elem 要测试的对象。
         * @return {Boolean} 如果是可包装成Drawable对象则返回true，否则为false。
         */
        isDrawable: function(elem){
            if(!elem || !elem.tagName) return false;
            var tagName = elem.tagName.toLowerCase();
            return tagName === "img" || tagName === "canvas" || tagName === "video";
        }
    }
});

return Drawable;

}, {
    requires: ['hilo/core/Hilo', 'hilo/core/Class']
});