/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class Renderer Renderer is the base class of renderer.
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} canvas The canvas of renderer. It can be a dom element, such as a div element, or a canvas element. readonly.
 * @property {Object} stage The stage of renderer, readonly.
 * @property {String} renderType The render type of renderer, readonly.
 */
/**
 * @language=zh
 * @class 渲染器抽象基类。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} canvas 渲染器对应的画布。它可能是一个普通的DOM元素，比如div，也可以是一个canvas画布元素。只读属性。
 * @property {Object} stage 渲染器对应的舞台。只读属性。
 * @property {String} renderType 渲染方式。只读属性。
 */
var Renderer = Class.create(/** @lends Renderer.prototype */{
    constructor: function(properties){
        properties = properties || {};
        Hilo.copy(this, properties, true);
    },

    renderType:null,
    canvas: null,
    stage: null,

    /**
     * @language=en
     * Prepare for draw visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    /**
     * @language=zh
     * 为开始绘制可视对象做准备。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    startDraw: function(target){ },

    /**
     * @language=en
     * Draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    /**
     * @language=zh
     * 绘制可视对象。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    draw: function(target){ },

    /**
     * @language=en
     * The handling method after draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    /**
     * @language=zh
     * 结束绘制可视对象后的后续处理方法。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    endDraw: function(target){ },

    /**
     * @language=en
     * Transfrom the visual object. The subclass need to implement it.
     */
    /**
     * @language=zh
     * 对可视对象进行变换。需要子类来实现。
     */
    transform: function(){ },

    /**
     * @language=en
     * Hide the visual object. The subclass need to implement it.
     */
    /**
     * @language=zh
     * 隐藏可视对象。需要子类来实现。
     */
    hide: function(){ },

    /**
     * @language=en
     * Remove the visual object from canvas. Notice that it dosen't remove the object from stage. The subclass need to implement it.
     * @param {View} target The visual target to remove.
     */
    /**
     * @language=zh
     * 从画布中删除可视对象。注意：不是从stage中删除对象。需要子类来实现。
     * @param {View} target 要删除的可视对象。
     */
    remove: function(target){ },

    /**
     * @language=en
     * Clear the given region of canvas. The subclass need to implement it.
     * @param {Number} x The position on the x axis of the given region.
     * @param {Number} y The position on the y axis of the given region.
     * @param {Number} width The width of the given region.
     * @param {Number} height The height of the given region.
     */
    /**
     * @language=zh
     * 清除画布指定区域。需要子类来实现。
     * @param {Number} x 指定区域的x轴坐标。
     * @param {Number} y 指定区域的y轴坐标。
     * @param {Number} width 指定区域的宽度。
     * @param {Number} height 指定区域的高度。
     */
    clear: function(x, y, width, height){ },

    /**
     * @language=en
     * Resize the renderer's canvas.
     * @param {Number} width The width of renderer's canvas.
     * @param {Number} height The height of the renderer's canvas.
     */
    /**
     * @language=zh
     * 改变渲染器的画布大小。
     * @param {Number} width 指定渲染画布新的宽度。
     * @param {Number} height 指定渲染画布新的高度。
     */
    resize: function(width, height){ }

});