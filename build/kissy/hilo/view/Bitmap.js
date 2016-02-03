/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/Bitmap', function(S, Hilo, Class, View, Drawable){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Bitmap.html?noHeader' width = '300' height = '200' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var bmp = new Hilo.Bitmap({image:imgElem, rect:[0, 0, 100, 100]});
 * stage.addChild(bmp);
 * </pre>
 * @class Bitmap类表示位图图像类。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
 * <ul>
 * <li><b>image</b> - 位图所在的图像image。必需。</li>
 * <li><b>rect</b> - 位图在图像image中矩形区域。</li>
 * </ul>
 * @module hilo/view/Bitmap
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 */
 var Bitmap = Class.create(/** @lends Bitmap.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Bitmap");
        Bitmap.superclass.constructor.call(this, properties);

        this.drawable = new Drawable(properties);

        //init width and height
        if(!this.width || !this.height){
            var rect = this.drawable.rect;
            if(rect){
                this.width = rect[2];
                this.height = rect[3];
            }
        }
    },

    /**
     * 设置位图的图片。
     * @param {Image|String} image 图片对象或地址。
     * @param {Array} rect 指定位图在图片image的矩形区域。
     * @returns {Bitmap} 位图本身。
     */
    setImage: function(image, rect){
        this.drawable.init({image:image, rect:rect});
        if(rect){
            this.width = rect[2];
            this.height = rect[3];
        }
        return this;
    }
 });

return Bitmap;

}, {
    requires: ['hilo/core/Hilo', 'hilo/core/Class', 'hilo/view/View', 'hilo/view/Drawable']
});