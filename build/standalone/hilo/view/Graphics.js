/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var CacheMixin = window.Hilo.CacheMixin;


/**
 * @language=en
 * <iframe src='../../../examples/Graphics.html?noHeader' width = '320' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Graphics class contains a group of functions for creating vector graphics.
 * @augments View
 * @mixes CacheMixin
 * @borrows CacheMixin#cache as #cache
 * @borrows CacheMixin#updateCache as #updateCache
 * @borrows CacheMixin#setCacheDirty as #setCacheDirty
 * @param {Object} properties Properties parameters of the object to create. Contains all writable properties of this class.
 * @module hilo/view/Graphics
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {Number} lineWidth The thickness of lines in space units, default value is 1, readonly!
 * @property {Number} lineAlpha The alpha value (transparency) of line, default value is 1, readonly!
 * @property {String} lineCap The style of how every end point of line are drawn, value options: butt, round, square. default value is null, readonly!
 * @property {String} lineJoin The joint style of two lines. value options: miter, round, bevel. default value is null, readonly!
 * @property {Number} miterLimit The miter limit ratio in space units, works only when lineJoin value is miter. default value is 10, readonly!
 * @property {String} strokeStyle The color or style to use for lines around shapes, default value is 0 (the black color), readonly!
 * @property {String} fillStyle The color or style to use inside shapes, default value is 0 (the black color), readonly!
 * @property {Number} fillAlpha The transparency of color or style inside shapes, default value is 0, readonly!
 */
var Graphics = (function(){

var canvas = document.createElement('canvas');
var helpContext = canvas.getContext && canvas.getContext('2d');

return Class.create(/** @lends Graphics.prototype */{
    Extends: View,
    Mixes:CacheMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Graphics');
        Graphics.superclass.constructor.call(this, properties);

        this._actions = [];
    },

    lineWidth: 1,
    lineAlpha: 1,
    lineCap: null, //'butt', 'round', 'square'
    lineJoin: null, //'miter', 'round', 'bevel'
    miterLimit: 10,
    hasStroke: false,
    strokeStyle: '0',
    hasFill: false,
    fillStyle: '0',
    fillAlpha: 0,

    /**
     * @language=en
     * Set the lines style for drawing shapes.
     * @param {Number} thickness The thickness of lines, default value is 1.
     * @param {String} lineColor The CSS color value of lines, default value is 0 (the black color).
     * @param {Number} lineAlpha The transparency of lines, default value is 1 (fully opaque).
     * @param {String} lineCap The style of how every end point of line are drawn, value options: butt, round, square. default value is null.
     * @param {String} lineJoin The joint style of two lines. value options: miter, round, bevel. default value is null.
     * @param {Number} miterLimit The miter limit ratio in space units, works only when lineJoin value is miter. default value is 10.
     * @returns {Graphics} The Graphics Object.
     */
    lineStyle: function(thickness, lineColor, lineAlpha, lineCap, lineJoin, miterLimit){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['lineWidth', (me.lineWidth = thickness || 1)]);
        addAction.call(me, ['strokeStyle', (me.strokeStyle = lineColor || '0')]);
        addAction.call(me, ['lineAlpha', (me.lineAlpha = lineAlpha || 1)]);
        if(lineCap != undefined) addAction.call(me, ['lineCap', (me.lineCap = lineCap)]);
        if(lineJoin != undefined) addAction.call(me, ['lineJoin', (me.lineJoin = lineJoin)]);
        if(miterLimit != undefined) addAction.call(me, ['miterLimit', (me.miterLimit = miterLimit)]);
        me.hasStroke = true;
        return me;
    },

    /**
     * @language=en
     * Set how to fill shapes and the transparency.
     * @param {String} fill Filling style. this can be color, gradient or pattern.
     * @param {Number} alpha Transparency.
     * @returns {Graphics} The Graphics Object.
     */
    beginFill: function(fill, alpha){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['fillStyle', (me.fillStyle = fill)]);
        addAction.call(me, ['fillAlpha', (me.fillAlpha = alpha || 1)]);
        me.hasFill = true;
        return me;
    },

    /**
     * @language=en
     * Apply and end lines-drawing and shapes-filling.
     * @returns {Graphics} The Graphics Object.
     */
    endFill: function(){
        var me = this, addAction = me._addAction;

        if(me.hasStroke) addAction.call(me, ['stroke']);
        if(me.hasFill) addAction.call(me, ['fill']);
        me.setCacheDirty(true);
        return me;
    },

    /**
     * @language=en
     * Set linear gradient filling style to draw shapes.
     * @param {Number} x0 The x-coordinate value of the linear gradient start point.
     * @param {Number} y0 The y-coordinate value of the linear gradient start point.
     * @param {Number} x1 The x-coordinate value of the linear gradient end point.
     * @param {Number} y1 The y-coordinate value of the linear gradient end point.
     * @param {Array} colors An array of CSS colors used in the linear gradient.
     * @param {Array} ratios An array of position between start point and end point, should be one-to-one to colors in the colors array. each value range between 0.0 to 1.0.
     * @returns {Graphics} The Graphics Object.
     */
    beginLinearGradientFill: function(x0, y0, x1, y1, colors, ratios){
        var me = this, gradient = helpContext.createLinearGradient(x0, y0, x1, y1);

        for (var i = 0, len = colors.length; i < len; i++){
            gradient.addColorStop(ratios[i], colors[i]);
        }
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = gradient)]);
    },

    /**
     * @language=en
     * Set radial gradient filling style to draw shapes.
     * @param {Number} x0 The x-coordinate value of the radial gradient start circle.
     * @param {Number} y0 The y-coordinate value of the radial gradient start circle.
     * @param {Number} r0 The diameter of the radial gradient start circle.
     * @param {Number} x1 The x-coordinate value of the radial gradient end circle.
     * @param {Number} y1 The y-coordinate value of the radial gradient end circle.
     * @param {Number} r1 The radius of the radial gradient end circle.
     * @param {Array} colors An array of CSS colors used in the radial gradient.
     * @param {Array} ratios An array of position between start circle and end circle, should be one-to-one to colors in the colors array. each value range between 0.0 to 1.0.
     * @returns {Graphics} The Graphics Object.
     */
    beginRadialGradientFill: function(x0, y0, r0, x1, y1, r1, colors, ratios){
        var me = this, gradient = helpContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
        for (var i = 0, len = colors.length; i < len; i++)
        {
            gradient.addColorStop(ratios[i], colors[i]);
        }
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = gradient)]);
    },

    /**
     * @language=en
     * Begin an image filling pattern.
     * @param {HTMLImageElement} image The Image to fill.
     * @param {String} repetition The fill repetition style, can be one of valus:repeat, repeat-x, repeat-y, no-repeat. default valus is ''.
     * @returns {Graphics} The Graphics Object.
     */
    beginBitmapFill: function(image, repetition){
        var me = this, pattern = helpContext.createPattern(image, repetition || '');
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = pattern)]);
    },

    /**
     * @language=en
     * Begin a new path.
     * @returns {Graphics} The Graphics Object.
     */
    beginPath: function(){
        return this._addAction(['beginPath']);
    },

    /**
     * @language=en
     * Close current path.
     * @returns {Graphics} The Graphics Object.
     */
    closePath: function(){
        return this._addAction(['closePath']);
    },

    /**
     * @language=en
     * Move current drawing point to a new point on coordinate values (x, y).
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    moveTo: function(x, y){
        return this._addAction(['moveTo', x, y]);
    },

    /**
     * @language=en
     * Draw a line from current point to the point on the coordinate value (x, y).
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    lineTo: function(x, y){
        return this._addAction(['lineTo', x, y]);
    },

    /**
     * @language=en
     * Draw a quadratic Bézier curve from current point to the point on coordinate (x, y).
     * @param {Number} cpx The x-coordinate value of the Bézier curve control point cp.
     * @param {Number} cpy The y-coordinate value of the Bézier curve control point cp.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    quadraticCurveTo: function(cpx, cpy, x, y){
        return this._addAction(['quadraticCurveTo', cpx, cpy, x, y]);
    },

    /**
     * @language=en
     * Draw a Bézier curve from current point to the point on coordinate (x, y).
     * @param {Number} cp1x The x-coordinate value of the Bézier curve control point cp1.
     * @param {Number} cp1y The y-coordinate value of the Bézier curve control point cp1.
     * @param {Number} cp2x The x-coordinate value of the Bézier curve control point cp2.
     * @param {Number} cp2y The y-coordinate value of the Bézier curve control point cp2.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y){
        return this._addAction(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
    },

    /**
     * @language=en
     * Draw a rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of the rectangle.
     * @param {Number} height The height of the rectangle.
     * @returns {Graphics} The Graphics Object.
     */
    drawRect: function(x, y, width, height){
        return this._addAction(['rect', x, y, width, height]);
    },

    /**
     * @language=en
     * Draw a complex rounded rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of rounded rectangle.
     * @param {Number} height The height of rounded rectangle.
     * @param {Number} cornerTL The size of the rounded corner on the top-left of the rounded rectangle.
     * @param {Number} cornerTR The size of the rounded corner on the top-right of the rounded rectangle.
     * @param {Number} cornerBR The size of the rounded corner on the bottom-left of the rounded rectangle.
     * @param {Number} cornerBL The size of the rounded corner on the bottom-right of the rounded rectangle.
     * @returns {Graphics} The Graphics Object.
     */
    drawRoundRectComplex: function(x, y, width, height, cornerTL, cornerTR, cornerBR, cornerBL){
        var me = this, addAction = me._addAction;
        addAction.call(me, ['moveTo', x + cornerTL, y]);
        addAction.call(me, ['lineTo', x + width - cornerTR, y]);
        addAction.call(me, ['arc', x + width - cornerTR, y + cornerTR, cornerTR, -Math.PI/2, 0, false]);
        addAction.call(me, ['lineTo', x + width, y + height - cornerBR]);
        addAction.call(me, ['arc', x + width - cornerBR, y + height - cornerBR, cornerBR, 0, Math.PI/2, false]);
        addAction.call(me, ['lineTo', x + cornerBL, y + height]);
        addAction.call(me, ['arc', x + cornerBL, y + height - cornerBL, cornerBL, Math.PI/2, Math.PI, false]);
        addAction.call(me, ['lineTo', x, y + cornerTL]);
        addAction.call(me, ['arc', x + cornerTL, y + cornerTL, cornerTL, Math.PI, Math.PI*3/2, false]);
        return me;
    },

    /**
     * @language=en
     * Draw a rounded rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of rounded rectangle.
     * @param {Number} height The height of rounded rectangle.
     * @param {Number} cornerSize The size of all rounded corners.
     * @returns {Graphics} The Graphics Object.
     */
    drawRoundRect: function(x, y, width, height, cornerSize){
        return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
    },

    /**
     * @language=en
     * Draw a circle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} radius The radius of the circle.
     * @returns {Graphics} The Graphics Object.
     */
    drawCircle: function(x, y, radius){
        return this._addAction(['arc', x + radius, y + radius, radius, 0, Math.PI * 2, 0]);
    },

    /**
     * @language=en
     * Draw an ellipse.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of the ellipse.
     * @param {Number} height The height of the ellipse.
     * @returns {Graphics} The Graphics Object.
     */
    drawEllipse: function(x, y, width, height){
        var me = this;
        if(width == height) return me.drawCircle(x, y, width);

        var addAction = me._addAction;
        var w = width / 2, h = height / 2, C = 0.5522847498307933, cx = C * w, cy = C * h;
        x = x + w;
        y = y + h;

        addAction.call(me, ['moveTo', x + w, y]);
        addAction.call(me, ['bezierCurveTo', x + w, y - cy, x + cx, y - h, x, y - h]);
        addAction.call(me, ['bezierCurveTo', x - cx, y - h, x - w, y - cy, x - w, y]);
        addAction.call(me, ['bezierCurveTo', x - w, y + cy, x - cx, y + h, x, y + h]);
        addAction.call(me, ['bezierCurveTo', x + cx, y + h, x + w, y + cy, x + w, y]);
        return me;
    },

    /**
     * @language=en
     * Draw a path from the SVG data given by parameters. Not support Arcs.
     * Demo:
     * <p>var path = 'M250 150 L150 350 L350 350 Z';</p>
     * <p>var shape = new Hilo.Graphics({width:500, height:500});</p>
     * <p>shape.drawSVGPath(path).beginFill('#0ff').endFill();</p>
     * @param {String} pathData The SVG path data to draw.
     * @returns {Graphics} The Graphics Object.
     */
    drawSVGPath: function(pathData){
        var me = this, addAction = me._addAction,
            path = pathData.replace(/,/g, ' ').replace(/-/g, ' -').split(/(?=[a-zA-Z])/);
        addAction.call(me, ['beginPath']);
        var currentPoint = {x:0, y:0};
        var lastControlPoint = {x:0, y:0};
        var lastCmd;
        for(var i = 0, len = path.length; i < len; i++){
            var str = path[i];
            if(!str.length){
                continue;
            }
            var realCmd = str[0];
            var cmd = realCmd.toUpperCase();
            var p = this._getSVGParams(str);
            var useRelative = cmd !== realCmd;

            switch(cmd){
                case 'M':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['moveTo', p[0], p[1]]);
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;
                case 'L':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['lineTo', p[0], p[1]]);
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;
                case 'H':
                    if(useRelative){
                        p[0] += currentPoint.x;
                    }
                    addAction.call(me, ['lineTo', p[0], currentPoint.y]);
                    currentPoint.x = p[0];
                    break;
                case 'V':
                    if(useRelative){
                        p[0] += currentPoint.y;
                    }
                    addAction.call(me, ['lineTo', currentPoint.x, p[0]]);
                    currentPoint.y = p[0];
                    break;
                case 'Z':
                    addAction.call(me, ['closePath']);
                    break;
                case 'C':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['bezierCurveTo', p[0], p[1], p[2], p[3], p[4], p[5]]);
                    lastControlPoint.x = p[2];
                    lastControlPoint.y = p[3];
                    this._setCurrentPoint(currentPoint, p[4], p[5]);
                    break;
                case 'S':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    if(lastCmd === 'C' || lastCmd === 'S'){
                        controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                    }
                    else{
                        controlPoint = currentPoint;
                    }
                    addAction.call(me, ['bezierCurveTo', controlPoint.x, controlPoint.y, p[0], p[1], p[2], p[3]]);
                    lastControlPoint.x = p[0];
                    lastControlPoint.y = p[1];
                    this._setCurrentPoint(currentPoint, p[2], p[3]);
                    break;
                case 'Q':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['quadraticCurveTo', p[0], p[1], p[2], p[3]]);
                    lastControlPoint.x = p[0];
                    lastControlPoint.y = p[1];
                    this._setCurrentPoint(currentPoint, p[2], p[3]);
                    break;
                case 'T':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    var controlPoint;
                    if(lastCmd === 'Q' || lastCmd === 'T'){
                        controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                    }
                    else{
                        controlPoint = currentPoint;
                    }
                    addAction.call(me, ['quadraticCurveTo', controlPoint.x, controlPoint.y, p[0], p[1]]);
                    lastControlPoint = controlPoint;
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;                
            }
            lastCmd = cmd;
            
        }
        return me;
    },
    _getSVGParams:function(str){
        var p = str.substring(1).replace(/[\s]+$|^[\s]+/g, '').split(/[\s]+/);
        if(p[0].length == 0) {
            p.shift();
        }
        for(var i = 0, l = p.length;i < l;i ++){
            p[i] = parseFloat(p[i]);
        }
        return p;
    },
    _convertToAbsolute:function(currentPoint, data){
        for(var i = 0, l = data.length;i < l;i ++){
            if(i%2 === 0){
                data[i] += currentPoint.x;
            }
            else{
                data[i] += currentPoint.y;
            }
        }
    },
    _setCurrentPoint:function(currentPoint, x, y){
        currentPoint.x = x;
        currentPoint.y = y;
    },
    _getReflectionPoint:function(centerPoint, point){
        return {
            x:centerPoint.x * 2 - point.x,
            y:centerPoint.y * 2 - point.y
        };
    },

    /**
     * @language=en
     * Apply all draw actions. private function.
     * @private
     */
    _draw: function(context){
        var me = this, actions = me._actions, len = actions.length, i;

        context.beginPath();
        for(i = 0; i < len; i++){
            var action = actions[i],
                f = action[0],
                args = action.length > 1 ? action.slice(1) : null;

            if(typeof(context[f]) == 'function') context[f].apply(context, args);
            else context[f] = action[1];
        }
    },

    /**
     * @language=en
     * Overwrite render function.
     * @private
     */
    render: function(renderer, delta){
        var me = this;
        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }else{
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * @language=en
     * Clear all draw actions and reset to the initial state.
     * @returns {Graphics} The Graphics Object.
     */
    clear: function(){
        var me = this;

        me._actions.length = 0;
        me.lineWidth = 1;
        me.lineAlpha = 1;
        me.lineCap = null;
        me.lineJoin = null;
        me.miterLimit = 10;
        me.hasStroke = false;
        me.strokeStyle = '0';
        me.hasFill = false;
        me.fillStyle = '0';
        me.fillAlpha = 1;

        me.setCacheDirty(true);
        return me;
    },

    /**
     * @language=en
     * Add a draw action, this is a private function.
     * @private
     */
    _addAction: function(action){
        var me = this;
        me._actions.push(action);
        return me;
    }

});

})();

window.Hilo.Graphics = Graphics;
})(window);