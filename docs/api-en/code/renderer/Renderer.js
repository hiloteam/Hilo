/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Renderer Renderer is the base class of renderer.
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} canvas The canvas of renderer. It can be a dom element, such as a div element, or a canvas element. readonly.
 * @property {Object} stage The stage of renderer, readonly.
 * @property {String} renderType The render type of renderer, readonly.
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
     * Prepare for draw visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    startDraw: function(target){ },

    /**
     * Draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    draw: function(target){ },

    /**
     * The handling method after draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    endDraw: function(target){ },

    /**
     * Transfrom the visual object. The subclass need to implement it.
     */
    transform: function(){ },

    /**
     * Hide the visual object. The subclass need to implement it.
     */
    hide: function(){ },

    /**
     * Remove the visual object from canvas. Notice that it dosen't remove the object from stage. The subclass need to implement it.
     * @param {View} target The visual target to remove.
     */
    remove: function(target){ },

    /**
     * Clear the given region of canvas. The subclass need to implement it.
     * @param {Number} x The position on the x axis of the given region.
     * @param {Number} y The position on the y axis of the given region.
     * @param {Number} width The width of the given region.
     * @param {Number} height The height of the given region.
     */
    clear: function(x, y, width, height){ },

    /**
     * Resize the renderer's canvas.
     * @param {Number} width The width of renderer's canvas.
     * @param {Number} height The height of the renderer's canvas.
     */
    resize: function(width, height){ }

});