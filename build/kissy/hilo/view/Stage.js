/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/Stage', function(S, Hilo, Class, Container, CanvasRenderer, DOMRenderer, WebGLRenderer){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * 示例:
 * <pre>
 * var stage = new Hilo.Stage({
 *     renderType:'canvas',
 *     container: containerElement,
 *     width: 320,
 *     height: 480
 * });
 * </pre>
 * @class 舞台是可视对象树的根，可视对象只有添加到舞台或其子对象后才会被渲染出来。创建一个hilo应用一般都是从创建一个stage开始的。
 * @augments Container
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。主要有：
 * <ul>
 * <li><b>container</b>:String|HTMLElement - 指定舞台在页面中的父容器元素。它是一个dom容器或id。若不传入此参数且canvas未被加入到dom树，则需要在舞台创建后手动把舞台画布加入到dom树中，否则舞台不会被渲染。可选。</li>
 * <li><b>renderType</b>:String - 指定渲染方式，canvas|dom|webgl，默认canvas。可选。</li>
 * <li><b>canvas</b>:String|HTMLCanvasElement|HTMLElement - 指定舞台所对应的画布元素。它是一个canvas或普通的div，也可以传入元素的id。若为canvas，则使用canvas来渲染所有对象，否则使用dom+css来渲染。可选。</li>
 * <li><b>width</b>:Number</li> - 指定舞台的宽度。默认为canvas的宽度。可选。
 * <li><b>height</b>:Number</li> - 指定舞台的高度。默认为canvas的高度。可选。
 * <li><b>paused</b>:Boolean</li> - 指定舞台是否停止渲染。默认为false。可选。
 * </ul>
 * @module hilo/view/Stage
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/Container
 * @requires hilo/renderer/CanvasRenderer
 * @requires hilo/renderer/DOMRenderer
 * @requires hilo/renderer/WebGLRenderer
 * @property {HTMLCanvasElement|HTMLElement} canvas 舞台所对应的画布。它可以是一个canvas或一个普通的div。只读属性。
 * @property {Renderer} renderer 舞台渲染器。只读属性。
 * @property {Boolean} paused 指示舞台是否暂停刷新渲染。
 * @property {Object} viewport 舞台内容在页面中的渲染区域。包含的属性有：left、top、width、height。只读属性。
 */
var Stage = Class.create(/** @lends Stage.prototype */{
    Extends: Container,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Stage');
        Stage.superclass.constructor.call(this, properties);

        this._initRenderer(properties);

        //init size
        var width = this.width, height = this.height,
            viewport = this.updateViewport();
        if(!properties.width) width = (viewport && viewport.width) || 320;
        if(!properties.height) height = (viewport && viewport.height) || 480;
        this.resize(width, height, true);
    },

    canvas: null,
    renderer: null,
    paused: false,
    viewport: null,

    /**
     * @private
     */
    _initRenderer: function(properties){
        var canvas = properties.canvas;
        var container = properties.container;
        var renderType = properties.renderType||'canvas';

        if(typeof canvas === 'string') canvas = Hilo.getElement(canvas);
        if(typeof container === 'string') container = Hilo.getElement(container);

        if(!canvas){
            var canvasTagName = renderType === 'dom'?'div':'canvas';
            canvas = Hilo.createElement(canvasTagName, {
                style: {
                    position: 'absolute'
                }
            });
        }
        else if(!canvas.getContext){
            renderType = 'dom';
        }

        this.canvas = canvas;
        if(container) container.appendChild(canvas);

        var props = {canvas:canvas, stage:this};
        switch(renderType){
            case 'dom':
                this.renderer = new DOMRenderer(props);
                break;
            case 'webgl':
                if(WebGLRenderer.isSupport()){
                    this.renderer = new WebGLRenderer(props);
                }
                else{
                    this.renderer = new CanvasRenderer(props);
                }
                break;
            case 'canvas':
            default:
                this.renderer = new CanvasRenderer(props);
                break;
        }
    },

    /**
     * 添加舞台画布到DOM容器中。注意：此方法覆盖了View.addTo方法。
     * @param {HTMLElement} domElement 一个dom元素。
     * @returns {Stage} 舞台本身，可用于链式调用。
     */
    addTo: function(domElement){
        var canvas = this.canvas;
        if(canvas.parentNode !== domElement){
            domElement.appendChild(canvas);
        }
        return this;
    },

    /**
     * 调用tick会触发舞台的更新和渲染。开发者一般无需使用此方法。
     * @param {Number} delta 调度器当前调度与上次调度tick之间的时间差。
     */
    tick: function(delta){
        if(!this.paused){
            this._render(this.renderer, delta);
        }
    },

    /**
     * 开启/关闭舞台的DOM事件响应。要让舞台上的可视对象响应用户交互，必须先使用此方法开启舞台的相应事件的响应。
     * @param {String|Array} type 要开启/关闭的事件名称或数组。
     * @param {Boolean} enabled 指定开启还是关闭。如果不传此参数，则默认为开启。
     * @returns {Stage} 舞台本身。链式调用支持。
     */
    enableDOMEvent: function(type, enabled){
        var me = this,
            canvas = me.canvas,
            types = typeof type === 'string' ? [type] : type,
            enabled = enabled !== false,
            handler = me._domListener || (me._domListener = function(e){me._onDOMEvent(e)});

        for(var i = 0; i < types.length; i++){
            var type = types[i];

            if(enabled){
                canvas.addEventListener(type, handler, false);
            }else{
                canvas.removeEventListener(type, handler);
            }
        }

        return me;
    },

    /**
     * DOM事件处理函数。此方法会把事件调度到事件的坐标点所对应的可视对象。
     * @private
     */
    _onDOMEvent: function(e){
        var type = e.type, event = e, isTouch = type.indexOf('touch') == 0;

        //calculate stageX/stageY
        var posObj = e;
        if(isTouch){
            var touches = e.touches, changedTouches = e.changedTouches;
            posObj = (touches && touches.length) ? touches[0] :
                     (changedTouches && changedTouches.length) ? changedTouches[0] : null;
        }

        var x = posObj.pageX || posObj.clientX, y = posObj.pageY || posObj.clientY,
            viewport = this.viewport || this.updateViewport();

        event.stageX = x = (x - viewport.left) / this.scaleX;
        event.stageY = y = (y - viewport.top) / this.scaleY;

        //鼠标事件需要阻止冒泡方法
        event.stopPropagation = function(){
            this._stopPropagationed = true;
        };

        var obj = this.getViewAtPoint(x, y, true, false, true)||this,
            canvas = this.canvas, target = this._eventTarget;

        //fire mouseout/touchout event for last event target
        var leave = type === 'mouseout';
        //当obj和target不同 且obj不是target的子元素时才触发out事件
        if(target && (target != obj && (!target.contains || !target.contains(obj))|| leave)){
            var out = (type === 'touchmove') ? 'touchout' :
                      (type === 'mousemove' || leave || !obj) ? 'mouseout' : null;
            if(out) {
                var outEvent = Hilo.copy({}, event);
                outEvent.type = out;
                outEvent.eventTarget = target;
                target._fireMouseEvent(outEvent);
            }
            event.lastEventTarget = target;
            this._eventTarget = null;
        }

        //fire event for current view
        if(obj && obj.pointerEnabled && type !== 'mouseout'){
            event.eventTarget = this._eventTarget = obj;
            obj._fireMouseEvent(event);
        }

        //set cursor for current view
        if(!isTouch){
            var cursor = (obj && obj.pointerEnabled && obj.useHandCursor) ? 'pointer' : '';
            canvas.style.cursor = cursor;
        }

        //fix android: `touchmove` fires only once
        if(Hilo.browser.android && type === 'touchmove'){
            e.preventDefault();
        }
    },

    /**
     * 更新舞台在页面中的可视区域，即渲染区域。当舞台canvas的样式border、margin、padding等属性更改后，需要调用此方法更新舞台渲染区域。
     * @returns {Object} 舞台的可视区域。即viewport属性。
     */
    updateViewport: function(){
        var canvas = this.canvas, viewport = null;
        if(canvas.parentNode){
            viewport = this.viewport = Hilo.getElementRect(canvas);
        }
        return viewport;
    },

    /**
     * 改变舞台的大小。
     * @param {Number} width 指定舞台新的宽度。
     * @param {Number} height 指定舞台新的高度。
     * @param {Boolean} forceResize 指定是否强制改变舞台大小，即不管舞台大小是否相同，仍然强制执行改变动作，可确保舞台、画布以及视窗之间的尺寸同步。
     */
    resize: function(width, height, forceResize){
        if(forceResize || this.width !== width || this.height !== height){
            this.width = width;
            this.height = height;
            this.renderer.resize(width, height);
            this.updateViewport();
        }
    }

});


return Stage;

}, {
    requires: ['hilo/core/Hilo', 'hilo/core/Class', 'hilo/view/Container', 'hilo/renderer/CanvasRenderer', 'hilo/renderer/DOMRenderer', 'hilo/renderer/WebGLRenderer']
});