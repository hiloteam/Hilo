/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * <iframe src='../../../examples/BitmapText.html?noHeader' width = '550' height = '80' scrolling='no'></iframe>
 * <br/>
 * @class BitmapText  support bitmap text function ,but only support single-line text
 * @augments Container
 * @param {Object} properties the options of create Instance.It can contains all writable property
 * @module hilo/view/BitmapText
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/Container
 * @requires hilo/view/Bitmap
 * @property {Object} glyphs font glyph set of bitmap. format:{letter:{image:img, rect:[0,0,100,100]}}
 * @property {Number} letterSpacing spacing of letter. default:0
 * @property {String} text content of bitmap text. Not writable,set this value by 'setText'
 * @property {String} textAlign property values:left、center、right, default:left,Not writable,set this property by 'setTextAlign'
 */
/**
 * @language=zh
 * <iframe src='../../../examples/BitmapText.html?noHeader' width = '550' height = '80' scrolling='no'></iframe>
 * <br/>
 * @class BitmapText类提供使用位图文本的功能。当前仅支持单行文本。
 * @augments Container
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/BitmapText
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/Container
 * @requires hilo/view/Bitmap
 * @property {Object} glyphs 位图字体的字形集合。格式为：{letter:{image:img, rect:[0,0,100,100]}}。
 * @property {Number} letterSpacing 字距，即字符间的间隔。默认值为0。
 * @property {String} text 位图文本的文本内容。只读属性。设置文本请使用setText方法。
 * @property {String} textAlign 文本对齐方式，值为left、center、right, 默认left。只读属性。设置文本对齐方式请使用setTextAlign方法。
 */
var BitmapText = Class.create(/** @lends BitmapText.prototype */{
    Extends: Container,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('BitmapText');
        BitmapText.superclass.constructor.call(this, properties);

        var text = properties.text + '';
        if(text){
            this.text = '';
            this.setText(text);
        }

        this.pointerChildren = false; //disable user events for single letters
    },

    glyphs: null,
    letterSpacing: 0,
    text: '',
    textAlign:'left',

    /**
     * @language=en
     * set the content of bitmap text
     * @param {String} text content
     * @returns {BitmapText} BitmapText Instance,support chained calls
     */
    /**
     * @language=zh
     * 设置位图文本的文本内容。
     * @param {String} text 要设置的文本内容。
     * @returns {BitmapText} BitmapText对象本身。链式调用支持。
     */
    setText: function(text){
        var me = this, str = text.toString(), len = str.length;
        if(me.text == str) return;
        me.text = str;

        var i, charStr, charGlyph, charObj, width = 0, height = 0, left = 0;
        for(i = 0; i < len; i++){
            charStr = str.charAt(i);
            charGlyph = me.glyphs[charStr];
            if(charGlyph){
                left = width + (width > 0 ? me.letterSpacing : 0);
                if(me.children[i]){
                    charObj = me.children[i];
                    charObj.setImage(charGlyph.image, charGlyph.rect);
                }
                else{
                    charObj = me._createBitmap(charGlyph);
                    me.addChild(charObj);
                }
                charObj.x = left;
                width = left + charGlyph.rect[2];
                height = Math.max(height, charGlyph.rect[3]);
            }
        }

        for(i = me.children.length - 1;i >= len;i --){
            me._releaseBitmap(me.children[i]);
            me.children[i].removeFromParent();
        }

        me.width = width;
        me.height = height;
        this.setTextAlign();
        return me;
    },
    _createBitmap:function(cfg){
        var bmp;
        if(BitmapText._pool.length){
            bmp = BitmapText._pool.pop();
            bmp.setImage(cfg.image, cfg.rect);
        }
        else{
            bmp = new Bitmap({
                image:cfg.image,
                rect:cfg.rect
            });
        }
        return bmp;
    },
    _releaseBitmap:function(bmp){
        BitmapText._pool.push(bmp);
    },

     /**
      * @language=en
      * set the textAlign of text。
     * @param textAlign value of textAlign:left、center、right
     * @returns {BitmapText} itmapText Instance,support chained calls
     */
     /**
      * @language=zh
      * 设置位图文本的对齐方式。
     * @param textAlign 文本对齐方式，值为left、center、right
     * @returns {BitmapText} BitmapText对象本身。链式调用支持。
     */
    setTextAlign:function(textAlign){
        this.textAlign = textAlign||this.textAlign;
        switch(this.textAlign){
            case "center":
                this.pivotX = this.width * .5;
                break;
            case "right":
                this.pivotX = this.width;
                break;
            case "left":
                /* falls through */
            default:
                this.pivotX = 0;
                break;
        }
        return this;
    },

    /**
     * @language=en
     * detect whether can display the string by the currently assigned font provided
     * @param {String} str to detect string
     * @returns {Boolean} whether can display the string
     */
    /**
     * @language=zh
     * 返回能否使用当前指定的字体显示提供的字符串。
     * @param {String} str 要检测的字符串。
     * @returns {Boolean} 是否能使用指定字体。
     */
    hasGlyphs: function(str){
        var glyphs = this.glyphs;
        if(!glyphs) return false;

        str = str.toString();
        var len = str.length, i;
        for(i = 0; i < len; i++){
            if(!glyphs[str.charAt(i)]) return false;
        }
        return true;
    },

    Statics:/** @lends BitmapText */{
        _pool:[],
        /**
         * @language=en
         * easy way to generate a collection of glyphs
         * @static
         * @param {String} text character text.
         * @param {Image} image character image.
         * @param {Number} col default:the length of string
         * @param {Number} row default:1
         * @returns {BitmapText} BitmapText对象本身。链式调用支持。
         */
        /**
         * @language=zh
         * 简易方式生成字形集合。
         * @static
         * @param {String} text 字符文本。
         * @param {Image} image 字符图片。
         * @param {Number} col 列数  默认和文本字数一样
         * @param {Number} row 行数 默认1行
         * @returns {BitmapText} BitmapText对象本身。链式调用支持。
         */
        createGlyphs:function(text, image, col, row){
            var str = text.toString();
            col = col||str.length;
            row = row||1;
            var w = image.width/col;
            var h = image.height/row;
            var glyphs = {};
            for(var i = 0, l = text.length;i < l;i ++){
                var charStr = str.charAt(i);
                glyphs[charStr] = {
                    image:image,
                    rect:[w * (i % col), h * Math.floor(i / col), w, h]
                };
            }
            return glyphs;
        }
    }

});
