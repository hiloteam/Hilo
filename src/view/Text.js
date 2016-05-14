/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * <iframe src='../../../examples/Text.html?noHeader' width = '320' height = '240' scrolling='no'></iframe>
 * <br/>
 * @class Text class provide basic text-display function, use DOMElement for complex text-display.
 * @augments View
 * @param {Object} properties Properties parameters for the object. Includes all writable properties.
 * @module hilo/view/Text
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {String} text Text to display.
 * @property {String} color Color of the text.
 * @property {String} textAlign Horizontal alignment way of the text. May be one of the following value:'start', 'end', 'left', 'right', and 'center'。
 * @property {String} textVAlign Vertical alignment way of the text. May be one of the following value:'top', 'middle', 'bottom'。
 * @property {Boolean} outline Draw the outline of the text or fill the text.
 * @property {Number} lineSpacing The spacing between lines. Measured in px, default value is 0.
 * @property {Number} maxWidth The max length of the text, default value is 200.
 * @property {String} font Text's CSS font style, readonly! Use setFont function to set text font.
 * @property {Number} textWidth Width of the text, readonly! Works only on canvas mode.
 * @property {Number} textHeight Height of the text, readonly! Works only on canvas mode.
 */
/**
 * @language=zh
 * <iframe src='../../../examples/Text.html?noHeader' width = '320' height = '240' scrolling='no'></iframe>
 * <br/>
 * @class Text类提供简单的文字显示功能。复杂的文本功能可以使用DOMElement。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Text
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {String} text 指定要显示的文本内容。
 * @property {String} color 指定使用的字体颜色。
 * @property {String} textAlign 指定文本的对齐方式。可以是以下任意一个值：'start', 'end', 'left', 'right', and 'center'。
 * @property {String} textVAlign 指定文本的垂直对齐方式。可以是以下任意一个值：'top', 'middle', 'bottom'。
 * @property {Boolean} outline 指定文本是绘制边框还是填充。
 * @property {Number} lineSpacing 指定文本的行距。单位为像素。默认值为0。
 * @property {Number} maxWidth 指定文本的最大宽度。默认值为200。
 * @property {String} font 文本的字体CSS样式。只读属性。设置字体样式请用setFont方法。
 * @property {Number} textWidth 指示文本内容的宽度，只读属性。仅在canvas模式下有效。
 * @property {Number} textHeight 指示文本内容的高度，只读属性。仅在canvas模式下有效。
 */
var Text = Class.create(/** @lends Text.prototype */{
    Extends: View,
    Mixes:CacheMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Text');
        Text.superclass.constructor.call(this, properties);

        // if(!properties.width) this.width = 200; //default width
        if(!properties.font) this.font = '12px arial'; //default font style
        this._fontHeight = Text.measureFontHeight(this.font);
    },

    text: null,
    color: '#000',
    textAlign: null,
    textVAlign: null,
    outline: false,
    lineSpacing: 0,
    maxWidth: 200,
    font: null, //ready-only
    textWidth: 0, //read-only
    textHeight: 0, //read-only

    /**
     * @language=en
     * Set text CSS font style.
     * @param {String} font Text CSS font style to set.
     * @returns {Text} the Text object, chained call supported.
     */
    /**
     * @language=zh
     * 设置文本的字体CSS样式。
     * @param {String} font 要设置的字体CSS样式。
     * @returns {Text} Text对象本身。链式调用支持。
     */
    setFont: function(font){
        var me = this;
        if(me.font !== font){
            me.font = font;
            me._fontHeight = Text.measureFontHeight(font);
        }

        return me;
    },

    /**
     * @language=en
     * Overwrite render function.
     * @private
     */
    /**
     * @language=zh
     * 覆盖渲染方法。
     * @private
     */
    render: function(renderer, delta){
        var me = this, canvas = renderer.canvas;

        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }
        else if(renderer.renderType === 'dom'){
            var drawable = me.drawable;
            var domElement = drawable.domElement;
            var style = domElement.style;

            style.font = me.font;
            style.textAlign = me.textAlign;
            style.color = me.color;
            style.width = me.width + 'px';
            style.height = me.height + 'px';
            style.lineHeight = (me._fontHeight + me.lineSpacing) + 'px';

            domElement.innerHTML = me.text;
            renderer.draw(this);
        }
        else{
            //TODO:自动更新cache  TODO:auto update cache
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * @language=en
     * Draw text under the assigned render context.
     * @private
     */
    /**
     * @language=zh
     * 在指定的渲染上下文上绘制文本。
     * @private
     */
    _draw: function(context){
        var me = this, text = me.text.toString();
        if(!text) return;

        //set drawing style
        context.font = me.font;
        context.textAlign = me.textAlign;
        context.textBaseline = 'top';

        //find and draw all explicit lines
        var lines = text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
        var width = 0, height = 0;
        var lineHeight = me._fontHeight + me.lineSpacing;
        var i, line, w;
        var drawLines = [];

        for(i = 0, len = lines.length; i < len; i++){
            line = lines[i];
            w = context.measureText(line).width;

            //check if the line need to split
            if(w <= me.maxWidth){
                drawLines.push({text:line, y:height});
                // me._drawTextLine(context, line, height);
                if(width < w) width = w;
                height += lineHeight;
                continue;
            }

            var str = '', oldWidth = 0, newWidth, j, word;

            for(j = 0, wlen = line.length; j < wlen; j++){
                word = line[j];
                newWidth = context.measureText(str + word).width;

                if(newWidth > me.maxWidth){
                    drawLines.push({text:str, y:height});
                    // me._drawTextLine(context, str, height);
                    if(width < oldWidth) width = oldWidth;
                    height += lineHeight;
                    str = word;
                }else{
                    oldWidth = newWidth;
                    str += word;
                }

                if(j == wlen - 1){
                    drawLines.push({text:str, y:height});
                    // me._drawTextLine(context, str, height);
                    if(str !== word && width < newWidth) width = newWidth;
                    height += lineHeight;
                }
            }
        }

        me.textWidth = width;
        me.textHeight = height;
        if(!me.width) me.width = width;
        if(!me.height) me.height = height;

        //vertical alignment
        var startY = 0;
        switch(me.textVAlign){
            case 'middle':
                startY = me.height - me.textHeight >> 1;
                break;
            case 'bottom':
                startY = me.height - me.textHeight;
                break;
        }

        //draw background
        var bg = me.background;
        if(bg){
            context.fillStyle = bg;
            context.fillRect(0, 0, me.width, me.height);
        }

        if(me.outline) context.strokeStyle = me.color;
        else context.fillStyle = me.color;

        //draw text lines
        for(var i = 0; i < drawLines.length; i++){
            var line = drawLines[i];
            me._drawTextLine(context, line.text, startY + line.y);
        }
    },

    /**
     * @language=en
     * Draw a line of text under the assigned render context.
     * @private
     */
    /**
     * @language=zh
     * 在指定的渲染上下文上绘制一行文本。
     * @private
     */
    _drawTextLine: function(context, text, y){
        var me = this, x = 0, width = me.width;

        switch(me.textAlign){
            case 'center':
                x = width >> 1;
                break;
            case 'right':
            case 'end':
                x = width;
                break;
        };

        if(me.outline) context.strokeText(text, x, y);
        else context.fillText(text, x, y);
    },

    Statics: /** @lends Text */{
        /**
         * @language=en
         * Measure the line height of the assigned text font style.
         * @param {String} font Font style to measure.
         * @return {Number} Return line height of the assigned font style.
         */
        /**
         * @language=zh
         * 测算指定字体样式的行高。
         * @param {String} font 指定要测算的字体样式。
         * @return {Number} 返回指定字体的行高。
         */
        measureFontHeight: function(font){
            var docElement = document.documentElement, fontHeight;
            var elem = Hilo.createElement('div', {style:{font:font, position:'absolute'}, innerHTML:'M'});

            docElement.appendChild(elem);
            fontHeight = elem.offsetHeight;
            docElement.removeChild(elem);
            return fontHeight;
        }
    }

});
