/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * <iframe src='../../../examples/DOMElement.html?noHeader' width = '330' height = '250' scrolling='no'></iframe>
 * <br/>
 * demo:
 * <pre>
 * var domView = new Hilo.DOMElement({
 *     element: Hilo.createElement('div', {
 *         style: {
 *             backgroundColor: '#004eff',
 *             position: 'absolute'
 *         }
 *     }),
 *     width: 100,
 *     height: 100,
 *     x: 50,
 *     y: 70
 * }).addTo(stage);
 * </pre>
 * @name DOMElement
 * @class DOMElement is a wrapper of dom element.
 * @augments View
 * @param {Object} properties create Objects properties. Contains all writable properties in this class. Special properties include:
 * <ul>
 * <li><b>element</b> - dom element to wrap, required! </li>
 * </ul>
 * @module hilo/view/DOMElement
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 */
var DOMElement = Class.create(/** @lends DOMElement.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("DOMElement");
        DOMElement.superclass.constructor.call(this, properties);

        this.drawable = new Drawable();
        var elem = this.drawable.domElement = properties.element || Hilo.createElement('div');
        elem.id = this.id;

        if(this.pointerEnabled){
            elem.style.pointerEvents = 'visible';
        }
    },

    /**
     * @language=en
     * Overwrite render method.
     * @private
     */
    _render: function(renderer, delta){
        if(!this.onUpdate || this.onUpdate(delta) !== false){
            renderer.transform(this);
            if(this.visible && this.alpha > 0){
                this.render(renderer, delta);
            }
        }
    },

    /**
     * @language=en
     * Overwrite render method.
     * @private
     */
    render: function(renderer, delta){
        if(renderer.renderType !== 'dom'){
            var canvas = renderer.canvas;
            var elem = this.drawable.domElement, depth = this.depth,
                nextElement = canvas.nextSibling, nextDepth;
            if(elem.parentNode) return;

            //draw dom element just after stage canvas
            while(nextElement && nextElement.nodeType != 3){
                nextDepth = parseInt(nextElement.style.zIndex) || 0;
                if(nextDepth <= 0 || nextDepth > depth){
                    break;
                }
                nextElement = nextElement.nextSibling;
            }
            canvas.parentNode.insertBefore(this.drawable.domElement, nextElement);
        }else{
            renderer.draw(this);
        }
    }
});
window.Hilo.DOMElement = DOMElement;
})(window);