/**
 * hilojs 2.0.3 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/Bitmap', function(S, Hilo, Class, View, Drawable){



/**
 * @language=en
 * <iframe src='../../../examples/Bitmap.html?noHeader' width = '300' height = '200' scrolling='no'></iframe>
 * <br/>
 * Example:
 * <pre>
 * var bmp = new Hilo.Bitmap({image:imgElem, rect:[0, 0, 100, 100]});
 * stage.addChild(bmp);
 * </pre>
 * @class Bitmap
 * @augments View
 * @param {Object} properties the options of create Instance.It can contains all writable property and Moreover：
 * <ul>
 * <li><b>image</b> - the image of bitmap which contained, required.</li>
 * <li><b>rect</b> - the range of bitmap in the image, option</li>
 * <li><b>crossOrigin</b> - Whether cross-domain is needed, default is false</li>
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
     * @language=en
     * set the image。
     * @param {Image|String} Image Object or URL.
     * @param {Array} rect the range of bitmap in the image, option.
     * @param {Boolean} crossOrigin Whether cross-domain is needed, default is false.
     * @returns {Bitmap} self。
     */
    setImage: function(image, rect, crossOrigin){
        this.drawable.init({image:image, rect:rect, crossOrigin:crossOrigin});
        if(rect){
            this.width = rect[2];
            this.height = rect[3];
        }
        else if(!this.width && !this.height){
            rect = this.drawable.rect;
            if(rect){
                this.width = rect[2];
                this.height = rect[3];
            }
        }
        return this;
    }
 });


return Bitmap;

}, {
    requires: ['hilo/core/Hilo', 'hilo/core/Class', 'hilo/view/View', 'hilo/view/Drawable']
});