/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class 渲染器抽象基类。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} canvas 渲染器对应的画布。它可能是一个普通的DOM元素，比如div，也可以是一个canvas画布元素。只读属性。
 * @property {Object} stage 渲染器对应的舞台。只读属性。
 * @property {String} renderType 渲染方式。只读属性。
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
     * 为开始绘制可视对象做准备。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    /**
     * @language=zh
     * 为开始绘制可视对象做准备。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    startDraw: function(target){ },

    /**
     * @language=en
     * 绘制可视对象。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    /**
     * @language=zh
     * 绘制可视对象。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    draw: function(target){ },

    /**
     * @language=en
     * 结束绘制可视对象后的后续处理方法。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    /**
     * @language=zh
     * 结束绘制可视对象后的后续处理方法。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    endDraw: function(target){ },

    /**
     * @language=en
     * 对可视对象进行变换。需要子类来实现。
     */
    /**
     * @language=zh
     * 对可视对象进行变换。需要子类来实现。
     */
    transform: function(){ },

    /**
     * @language=en
     * 隐藏可视对象。需要子类来实现。
     */
    /**
     * @language=zh
     * 隐藏可视对象。需要子类来实现。
     */
    hide: function(){ },

    /**
     * @language=en
     * 从画布中删除可视对象。注意：不是从stage中删除对象。需要子类来实现。
     * @param {View} target 要删除的可视对象。
     */
    /**
     * @language=zh
     * 从画布中删除可视对象。注意：不是从stage中删除对象。需要子类来实现。
     * @param {View} target 要删除的可视对象。
     */
    remove: function(target){ },

    /**
     * @language=en
     * 清除画布指定区域。需要子类来实现。
     * @param {Number} x 指定区域的x轴坐标。
     * @param {Number} y 指定区域的y轴坐标。
     * @param {Number} width 指定区域的宽度。
     * @param {Number} height 指定区域的高度。
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
     * 改变渲染器的画布大小。
     * @param {Number} width 指定渲染画布新的宽度。
     * @param {Number} height 指定渲染画布新的高度。
     */
    /**
     * @language=zh
     * 改变渲染器的画布大小。
     * @param {Number} width 指定渲染画布新的宽度。
     * @param {Number} height 指定渲染画布新的高度。
     */
    resize: function(width, height){ }

});