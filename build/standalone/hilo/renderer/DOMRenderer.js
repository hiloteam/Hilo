/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Renderer = Hilo.Renderer;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class DOM+CSS3渲染器。将可视对象以DOM元素方式渲染出来。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/DOMRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @requires hilo/view/Drawable
 */
var DOMRenderer = (function(){

return Class.create({
    Extends: Renderer,
    constructor: function(properties){
        DOMRenderer.superclass.constructor.call(this, properties);
    },
    renderType:'dom',
    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        //prepare drawable
        var drawable = (target.drawable = target.drawable || new Drawable());
        drawable.domElement = drawable.domElement || createDOMDrawable(target, drawable);
        return true;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var parent = target.parent,
            targetElem = target.drawable.domElement,
            currentParent = targetElem.parentNode;

        if(parent){
            var parentElem = parent.drawable.domElement;
            if(parentElem != currentParent){
                parentElem.appendChild(targetElem);
            }
            //fix image load bug
            if(!target.width && !target.height){
                var rect = target.drawable.rect;
                if(rect && (rect[2] || rect[3])){
                    target.width = rect[2];
                    target.height = rect[3];
                }
            }
        }
        else if(target === this.stage && !currentParent){
            targetElem.style.overflow = 'hidden';
            this.canvas.appendChild(targetElem);
        }
    },

    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        Hilo.setElementStyleByView(target);
        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY,
                scaleX = target.scaleX,
                scaleY = target.scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
        }
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var drawable = target.drawable;
        var elem = drawable && drawable.domElement;

        if(elem){
            var parentElem = elem.parentNode;
            if(parentElem){
                parentElem.removeChild(elem);
            }
        }
    },

    /**
     * @private
     * @see Renderer#hide
     */
    hide: function(target){
        var elem = target.drawable && target.drawable.domElement;
        if(elem) elem.style.display = 'none';
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        var style = this.canvas.style;
        style.width = width + 'px';
        style.height = height + 'px';
        if(style.position != "absolute") {
          style.position = "relative";
        }
    }
});

/**
 * 创建一个可渲染的DOM，可指定tagName，如canvas或div。
 * @param {Object} view 一个可视对象或类似的对象。
 * @param {Object} imageObj 指定渲染的image及相关设置，如绘制区域rect。
 * @return {HTMLElement} 新创建的DOM对象。
 * @private
 */
function createDOMDrawable(view, imageObj){
    var tag = view.tagName || "div",
        img = imageObj.image,
        w = view.width || (img && img.width),
        h =  view.height || (img && img.height),
        elem = Hilo.createElement(tag), style = elem.style;

    if(view.id) elem.id = view.id;
    style.position = "absolute";
    style.left = (view.left || 0) + "px";
    style.top = (view.top || 0) + "px";
    style.width = w + "px";
    style.height = h + "px";

    if(tag == "canvas"){
        elem.width = w;
        elem.height = h;
        if(img){
            var ctx = elem.getContext("2d");
            var rect = imageObj.rect || [0, 0, w, h];
            ctx.drawImage(img, rect[0], rect[1], rect[2], rect[3],
                         (view.x || 0), (view.y || 0),
                         (view.width || rect[2]),
                         (view.height || rect[3]));
        }
    }else{
        style.opacity = view.alpha != undefined ? view.alpha : 1;
        if(view === this.stage || view.clipChildren) style.overflow = "hidden";
        if(img && img.src){
            style.backgroundImage = "url(" + img.src + ")";
            var bgX = view.rectX || 0, bgY = view.rectY || 0;
            style.backgroundPosition = (-bgX) + "px " + (-bgY) + "px";
        }
    }
    return elem;
}

})();

Hilo.DOMRenderer = DOMRenderer;
})(window);