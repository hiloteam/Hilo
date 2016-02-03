/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Graphics.html?noHeader' width = '320' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Graphics类包含一组创建矢量图形的方法。
 * @augments View
 * @mixes CacheMixin
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Graphics
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {Number} lineWidth 笔画的线条宽度。默认为1。只读属性。
 * @property {Number} lineAlpha 笔画的线条透明度。默认为1。只读属性。
 * @property {String} lineCap 笔画的线条端部样式。可选值有：butt、round、square等，默认为null。只读属性。
 * @property {String} lineJoin 笔画的线条连接样式。可选值有：miter、round、bevel等，默认为null。只读属性。
 * @property {Number} miterLimit 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。只读属性。
 * @property {String} strokeStyle 笔画边框的样式。默认值为'0'，即黑色。只读属性。
 * @property {String} fillStyle 内容填充的样式。默认值为'0'，即黑色。只读属性。
 * @property {Number} fillAlpha 内容填充的透明度。默认值为0。只读属性。
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
     * 指定绘制图形的线条样式。
     * @param {Number} thickness 线条的粗细值。默认为1。
     * @param {String} lineColor 线条的CSS颜色值。默认为黑色，即'0'。
     * @param {Number} lineAlpha 线条的透明度值。默认为不透明，即1。
     * @param {String} lineCap 线条的端部样式。可选值有：butt、round、square等，默认值为null。
     * @param {String} lineJoin 线条的连接样式。可选值有：miter、round、bevel等，默认值为null。
     * @param {Number} miterLimit 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。
     * @returns {Graphics} Graphics对象本身。
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
     * 指定绘制图形的填充样式和透明度。
     * @param {String} fill 填充样式。可以是color、gradient或pattern。
     * @param {Number} alpha 透明度。
     * @returns {Graphics} Graphics对象本身。
     */
    beginFill: function(fill, alpha){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['fillStyle', (me.fillStyle = fill)]);
        addAction.call(me, ['fillAlpha', (me.fillAlpha = alpha || 1)]);
        me.hasFill = true;
        return me;
    },

    /**
     * 应用并结束笔画的绘制和图形样式的填充。
     * @returns {Graphics} Graphics对象本身。
     */
    endFill: function(){
        var me = this, addAction = me._addAction;

        if(me.hasStroke) addAction.call(me, ['stroke']);
        if(me.hasFill) addAction.call(me, ['fill']);
        me.setCacheDirty(true);
        return me;
    },

    /**
     * 指定绘制图形的线性渐变填充样式。
     * @param {Number} x0 渐变的起始点的x轴坐标。
     * @param {Number} y0 渐变的起始点的y轴坐标。
     * @param {Number} x1 渐变的结束点的x轴坐标。
     * @param {Number} y1 渐变的结束点的y轴坐标。
     * @param {Array} colors 渐变中使用的CSS颜色值数组。
     * @param {Array} ratois 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值。
     * @returns {Graphics} Graphics对象本身。
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
     * 指定绘制图形的放射性渐变填充样式。
     * @param {Number} x0 渐变的起始圆的x轴坐标。
     * @param {Number} y0 渐变的起始圆的y轴坐标。
     * @param {Number} r0 渐变的起始圆的半径。
     * @param {Number} x1 渐变的结束圆的x轴坐标。
     * @param {Number} y1 渐变的结束圆的y轴坐标。
     * @param {Number} r1 渐变的结束圆的半径。
     * @param {Array} colors 渐变中使用的CSS颜色值数组。
     * @param {Array} ratois 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值。
     * @returns {Graphics} Graphics对象本身。
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
     * 开始一个位图填充样式。
     * @param {HTMLImageElement} image 指定填充的Image对象。
     * @param {String} repetition 指定填充的重复设置参数。它可以是以下任意一个值：repeat, repeat-x, repeat-y, no-repeat。默认为''。
     * @returns {Graphics} Graphics对象本身。
     */
    beginBitmapFill: function(image, repetition){
        var me = this, pattern = helpContext.createPattern(image, repetition || '');
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = pattern)]);
    },

    /**
     * 开始一个新的路径。
     * @returns {Graphics} Graphics对象本身。
     */
    beginPath: function(){
        return this._addAction(['beginPath']);
    },

    /**
     * 关闭当前的路径。
     * @returns {Graphics} Graphics对象本身。
     */
    closePath: function(){
        return this._addAction(['closePath']);
    },

    /**
     * 将当前绘制位置移动到点(x, y)。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    moveTo: function(x, y){
        return this._addAction(['moveTo', x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的直线。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    lineTo: function(x, y){
        return this._addAction(['lineTo', x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的二次曲线。
     * @param {Number} cpx 控制点cp的x轴坐标。
     * @param {Number} cpy 控制点cp的y轴坐标。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    quadraticCurveTo: function(cpx, cpy, x, y){
        return this._addAction(['quadraticCurveTo', cpx, cpy, x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的贝塞尔曲线。
     * @param {Number} cp1x 控制点cp1的x轴坐标。
     * @param {Number} cp1y 控制点cp1的y轴坐标。
     * @param {Number} cp2x 控制点cp2的x轴坐标。
     * @param {Number} cp2y 控制点cp2的y轴坐标。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y){
        return this._addAction(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
    },

    /**
     * 绘制一个矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 矩形的宽度。
     * @param {Number} height 矩形的高度。
     * @returns {Graphics} Graphics对象本身。
     */
    drawRect: function(x, y, width, height){
        return this._addAction(['rect', x, y, width, height]);
    },

    /**
     * 绘制一个复杂的圆角矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 圆角矩形的宽度。
     * @param {Number} height 圆角矩形的高度。
     * @param {Number} cornerTL 圆角矩形的左上圆角大小。
     * @param {Number} cornerTR 圆角矩形的右上圆角大小。
     * @param {Number} cornerBR 圆角矩形的右下圆角大小。
     * @param {Number} cornerBL 圆角矩形的左下圆角大小。
     * @returns {Graphics} Graphics对象本身。
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
     * 绘制一个圆角矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 圆角矩形的宽度。
     * @param {Number} height 圆角矩形的高度。
     * @param {Number} cornerSize 圆角矩形的圆角大小。
     * @returns {Graphics} Graphics对象本身。
     */
    drawRoundRect: function(x, y, width, height, cornerSize){
        return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
    },

    /**
     * 绘制一个圆。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} radius 圆的半径。
     * @returns {Graphics} Graphics对象本身。
     */
    drawCircle: function(x, y, radius){
        return this._addAction(['arc', x + radius, y + radius, radius, 0, Math.PI * 2, 0]);
    },

    /**
     * 绘制一个椭圆。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 椭圆的宽度。
     * @param {Number} height 椭圆的高度。
     * @returns {Graphics} Graphics对象本身。
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
     * 根据参数指定的SVG数据绘制一条路径。
     * 代码示例:
     * <p>var path = 'M250 150 L150 350 L350 350 Z';</p>
     * <p>var shape = new Hilo.Graphics({width:500, height:500});</p>
     * <p>shape.drawSVGPath(path).beginFill('#0ff').endFill();</p>
     * @param {String} pathData 要绘制的SVG路径数据。
     * @returns {Graphics} Graphics对象本身。
     */
    drawSVGPath: function(pathData){
        var me = this, addAction = me._addAction,
            path = pathData.split(/,| (?=[a-zA-Z])/);

        addAction.call(me, ['beginPath']);
        for(var i = 0, len = path.length; i < len; i++){
            var str = path[i], cmd = str[0].toUpperCase(), p = str.substring(1).split(/,| /);
            if(p[0].length == 0) p.shift();

            switch(cmd){
                case 'M':
                    addAction.call(me, ['moveTo', p[0], p[1]]);
                    break;
                case 'L':
                    addAction.call(me, ['lineTo', p[0], p[1]]);
                    break;
                case 'C':
                    addAction.call(me, ['bezierCurveTo', p[0], p[1], p[2], p[3], p[4], p[5]]);
                    break;
                case 'Z':
                    addAction.call(me, ['closePath']);
                    break;
            }
        }
        return me;
    },

    /**
     * 执行全部绘制动作。内部私有方法。
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
     * 重写渲染实现。
     * @private
     */
    render: function(renderer, delta){
        var me = this, canvas = renderer.canvas;
        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }else{
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * 清除所有绘制动作并复原所有初始状态。
     * @returns {Graphics} Graphics对象本身。
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
     * 添加一个绘制动作。内部私有方法。
     * @private
     */
    _addAction: function(action){
        var me = this;
        me._actions.push(action);
        return me;
    }

});

})();