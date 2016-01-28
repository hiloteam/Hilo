/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/renderer/CanvasRenderer', function(S, Class, Hilo, Renderer){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class canvas画布渲染器。所有可视对象将渲染在canvas画布上。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/CanvasRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @property {CanvasRenderingContext2D} context canvas画布的上下文。只读属性。
 */
var CanvasRenderer = Class.create(/** @lends CanvasRenderer.prototype */{
    Extends: Renderer,
    constructor: function(properties){
        CanvasRenderer.superclass.constructor.call(this, properties);

        this.context = this.canvas.getContext("2d");
    },
    renderType:'canvas',
    context: null,

    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        if(target.visible && target.alpha > 0){
            if(target === this.stage){
                this.context.clearRect(0, 0, target.width, target.height);
            }
            this.context.save();
            return true;
        }
        return false;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var ctx = this.context, w = target.width, h = target.height;

        //draw background
        var bg = target.background;
        if(bg){
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);
        }

        //draw image
        var drawable = target.drawable, image = drawable && drawable.image;
        if(image){
            var rect = drawable.rect, sw = rect[2], sh = rect[3], offsetX = rect[4], offsetY = rect[5];
            //ie9+浏览器宽高为0时会报错
            if(!sw || !sh){
                return;
            }
            if(!w && !h){
                //fix width/height TODO: how to get rid of this?
                w = target.width = sw;
                h = target.height = sh;
            }
            //the pivot is the center of frame if has offset, otherwise is (0, 0)
            if(offsetX || offsetY) ctx.translate(offsetX - sw * 0.5, offsetY - sh * 0.5);
            ctx.drawImage(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
        }
    },

    /**
     * @private
     * @see Renderer#endDraw
     */
    endDraw: function(target){
        this.context.restore();
    },

    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        var drawable = target.drawable;
        if(drawable && drawable.domElement){
            Hilo.setElementStyleByView(target);
            return;
        }

        var ctx = this.context,
            scaleX = target.scaleX,
            scaleY = target.scaleY;

        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
        }else{
            var x = target.x,
                y = target.y,
                pivotX = target.pivotX,
                pivotY = target.pivotY,
                rotation = target.rotation % 360,
                mask = target.mask;

            if(mask){
                mask._render(this);
                ctx.clip();
            }

            //alignment
            var align = target.align;
            if(align){
                if(typeof align === 'function'){
                    target.align();
                }else{
                    var parent = target.parent;
                    if(parent){
                        var w = target.width, h = target.height,
                            pw = parent.width, ph = parent.height;
                        switch(align){
                            case 'TL':
                                x = 0;
                                y = 0;
                                break;
                            case 'T':
                                x = pw - w >> 1;
                                y = 0;
                                break;
                            case 'TR':
                                x = pw - w;
                                y = 0;
                                break;
                            case 'L':
                                x = 0;
                                y = ph - h >> 1;
                                break;
                            case 'C':
                                x = pw - w >> 1;
                                y = ph - h >> 1;
                                break;
                            case 'R':
                                x = pw - w;
                                y = ph - h >> 1;
                                break;
                            case 'BL':
                                x = 0;
                                y = ph - h;
                                break;
                            case 'B':
                                x = pw - w >> 1;
                                y = ph - h;
                                break;
                            case 'BR':
                                x = pw - w;
                                y = ph - h;
                                break;
                        }
                    }
                }
            }

            if(x != 0 || y != 0) ctx.translate(x, y);
            if(rotation != 0) ctx.rotate(rotation * Math.PI / 180);
            if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
            if(pivotX != 0 || pivotY != 0) ctx.translate(-pivotX, -pivotY);
        }

        if(target.alpha > 0) ctx.globalAlpha *= target.alpha;
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
     * @see Renderer#clear
     */
    clear: function(x, y, width, height){
        this.context.clearRect(x, y, width, height);
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
    }

});

return CanvasRenderer;

}, {
    requires: ['hilo/core/Class', 'hilo/core/Hilo', 'hilo/renderer/Renderer']
});