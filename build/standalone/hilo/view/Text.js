/**
 * Hilo 1.0.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var CacheMixin = Hilo.CacheMixin;


/**
 * @language=en
 * <iframe src='../../../examples/Text.html?noHeader' width = '320' height = '240' scrolling='no'></iframe>
 * <br/>
 * @class Text class provide basic text-display function, use DOMElement for complex text-display.
 * @augments View
 * @mixes CacheMixin
 * @borrows CacheMixin#cache as #cache
 * @borrows CacheMixin#updateCache as #updateCache
 * @borrows CacheMixin#setCacheDirty as #setCacheDirty
 * @param {Object} properties Properties parameters for the object. Includes all writable properties.
 * @module hilo/view/Text
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {String} text Text to display.
 * @property {String} color Color of the text.
 * @property {String} textAlign Horizontal alignment way of the text. May be one of the following value:'start', 'end', 'left', 'right', and 'center'. Note:Need to specify the width property of the text to take effect
 * @property {String} textVAlign Vertical alignment way of the text. May be one of the following value:'top', 'middle', 'bottom'. Note:Need to specify the height property of the text to take effect.
 * @property {Boolean} outline Draw the outline of the text or fill the text.
 * @property {Number} lineSpacing The spacing between lines. Measured in px, default value is 0.
 * @property {Number} maxWidth The max length of the text, default value is 200.
 * @property {String} font Text's CSS font style, readonly! Use setFont function to set text font.
 * @property {Number} textWidth Width of the text, readonly! Works only on canvas mode.
 * @property {Number} textHeight Height of the text, readonly! Works only on canvas mode.
 */
var Text = Class.create(/** @lends Text.prototype */{
    Extends: View,
    Mixes: CacheMixin,
    constructor: function (properties) {
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Text');
        Text.superclass.constructor.call(this, properties);

        // if(!properties.width) this.width = 200; //default width
        if (!properties.font) this.font = '12px arial'; //default font style
        this._fontHeight = Text.measureFontHeight.call(this, this.font);
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
    setFont: function (font) {
        var me = this;
        if (me.font !== font) {
            me.font = font;
            me._fontHeight = Text.measureFontHeight.call(this, font);
        }

        return me;
    },

    /**
     * @language=en
     * Overwrite render function.
     * @private
     */
    render: function (renderer, delta) {
        var me = this;

        if (renderer.renderType === 'canvas') {
            if (me._cacheDirty) {
                me._draw(renderer.context);
            } else {
                // we should use cache to draw to improve performance
                renderer.draw(me);
            }
        }
        else if (renderer.renderType === 'dom') {
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
        else {
            renderer.draw(me);
        }
    },

    /**
     * @language=en
     * Draw text under the assigned render context.
     * @private
     */
    _draw: function (context) {
        var me = this, text = me.text.toString();
        if (!text) return;

        //set drawing style
        context.font = me.font;
        context.textAlign = me.textAlign;
        context.textBaseline = 'top';

        //find and draw all explicit lines
        var lines = text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
        var width = 0, height = 0;
        var lineHeight = me._fontHeight + me.lineSpacing;
        var i, line, w, len, wlen;
        var drawLines = [];

        for (i = 0, len = lines.length; i < len; i++) {
            line = lines[i];
            w = context.measureText(line).width;

            //check if the line need to split
            if (w <= me.maxWidth) {
                drawLines.push({text: line, y: height});
                // me._drawTextLine(context, line, height);
                if (width < w) width = w;
                height += lineHeight;
                continue;
            }

            var str = '', oldWidth = 0, newWidth, j, word;

            for (j = 0, wlen = line.length; j < wlen; j++) {
                word = line[j];
                newWidth = context.measureText(str + word).width;

                if (newWidth > me.maxWidth) {
                    drawLines.push({text: str, y: height});
                    // me._drawTextLine(context, str, height);
                    if (width < oldWidth) width = oldWidth;
                    height += lineHeight;
                    str = word;
                } else {
                    oldWidth = newWidth;
                    str += word;
                }

                if (j == wlen - 1) {
                    drawLines.push({text: str, y: height});
                    // me._drawTextLine(context, str, height);
                    if (str !== word && width < newWidth) width = newWidth;
                    height += lineHeight;
                }
            }
        }

        me.textWidth = width;
        me.textHeight = height;
        if (!me.width) me.width = width;
        if (!me.height) me.height = height;

        //vertical alignment
        var startY = 0;
        switch (me.textVAlign) {
            case 'middle':
                startY = me.height - me.textHeight >> 1;
                break;
            case 'bottom':
                startY = me.height - me.textHeight;
                break;
        }

        //draw background
        var bg = me.background;
        if (bg) {
            context.fillStyle = bg;
            context.fillRect(0, 0, me.width, me.height);
        }

        if (me.outline) context.strokeStyle = me.color;
        else context.fillStyle = me.color;

        //draw text lines
        for (i = 0; i < drawLines.length; i++) {
            line = drawLines[i];
            me._drawTextLine(context, line.text, startY + line.y);
        }
    },

    /**
     * @language=en
     * Draw a line of text under the assigned render context.
     * @private
     */
    _drawTextLine: function (context, text, y) {
        var me = this, x = 0, width = me.width;

        switch (me.textAlign) {
            case 'center':
                x = width >> 1;
                break;
            case 'right':
            case 'end':
                x = width;
                break;
        }

        if (me.outline) context.strokeText(text, x, y);
        else context.fillText(text, x, y);
    },

    Statics: /** @lends Text */{
        /**
         * @language=en
         * Measure the line height of the assigned text font style.
         * @param {String} font Font style to measure.
         * @return {Number} Return line height of the assigned font style.
         */
        measureFontHeight: function (font) {
            var me = this;
            var fontHeight = 0;
            
            if (Hilo.browser.supportCanvas) {
                var canvas = me._cacheCanvas;
                var context = me._cacheContext;

                if (!canvas) {
                    canvas = this._cacheCanvas = document.createElement('canvas');
                    context = this._cacheContext = this._cacheCanvas.getContext('2d');
                }

                var width = Math.ceil(context.measureText('|MÉq').width);
                var baseline = Math.ceil(context.measureText('M').width);
                var height = 2 * baseline;

                baseline = baseline * 1.4 | 0;

                canvas.width = width;
                canvas.height = height;

                context.fillStyle = '#f00';
                context.fillRect(0, 0, width, height);

                context.font = font;

                context.textBaseline = 'alphabetic';
                context.fillStyle = '#000';
                context.fillText('|MÉq', 0, baseline);

                var imagedata = context.getImageData(0, 0, width, height).data;
                var pixels = imagedata.length;
                var line = width * 4;

                var i = 0;
                var j = 0;
                var idx = 0;
                var stop = false;

                // scan pixel to find text ascent
                for (i = 0; i < baseline; ++i) {
                    for (j = 0; j < line; j += 4) {
                        if (imagedata[idx + j] !== 255) {
                            stop = true;
                            break;
                        }
                    }

                    if (!stop) {
                        idx += line;
                    } else {
                        break;
                    }
                }

                var ascent = baseline - i;

                idx = pixels - line;
                stop = false;

                // scan pixel to find text descent.
                for (i = height; i > baseline; --i) {
                    for (j = 0; j < line; j += 4) {
                        if (imagedata[idx + j] !== 255) {
                            stop = true;
                            break;
                        }
                    }

                    if (!stop) {
                        idx -= line;
                    } else {
                        break;
                    }
                }

                fontHeight = (i - baseline) + ascent;

            } else {
                var docElement = document.documentElement;
                var elem = Hilo.createElement('div', {style: {font: font, position: 'absolute'}, innerHTML: 'M'});

                docElement.appendChild(elem);
                fontHeight = elem.offsetHeight;
                docElement.removeChild(elem);
            }

            return fontHeight;
        }
    }

});

Hilo.Text = Text;
})(window);