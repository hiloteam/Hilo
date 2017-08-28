/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Drawable is a wrapper of drawable images.
 * @param {Object} properties create Objects properties, contains all writable properties.
 * @module hilo/view/Drawable
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Object} image Image to be drawed, can used by CanvasRenderingContext2D.drawImage，like HTMLImageElement、HTMLCanvasElement、HTMLVideoElement。
 * @property {array} rect The retangle area that image will be drawed.
 */
var Drawable = Class.create(/** @lends Drawable.prototype */{
    constructor: function(properties){
        this.init(properties);
    },

    image: null,
    rect: null,

    /**
     * @language=en
     * Initialize drawable elements.
     * @param {Object} properties Properties need to be initialized.
     */
    init: function(properties){
        var me = this, oldImage = me.image;
        if(Drawable.isDrawable(properties)){
            me.image = properties;
        }else{
            util.copy(me, properties, true);
        }

        var image = me.image;
        if(typeof image === 'string'){
            if(oldImage && image === oldImage.getAttribute('src')){
                image = me.image = oldImage;
            }else{
                me.image = null;
                //load image dynamically
                var img = new Image();
                if(properties.crossOrigin){
                    img.crossOrigin = properties.crossOrigin;
                }
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
         * @language=en
         * Check whether the given 'elem' and be wrapped into Drawable object.
         * @param {Object} elem Element to be tested.
         * @return {Boolean} Return true if element can be wrapped into Drawable element, otherwises return false.
         */
        isDrawable: function(elem){
            if(!elem || !elem.tagName) return false;
            var tagName = elem.tagName.toLowerCase();
            return tagName === "img" || tagName === "canvas" || tagName === "video";
        }
    }
});
window.Hilo.Drawable = Drawable;
})(window);