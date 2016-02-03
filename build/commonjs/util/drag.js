/**
 * Hilo 1.0.0 for commonjs
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
var Class = require('../core/Class');
var Hilo = require('../core/Hilo');

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/drag.html?noHeader' width = '550' height = '250' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var bmp = new Bitmap({image:img});
 * Hilo.copy(bmp, Hilo.drag);
 * bmp.startDrag([0, 0, 550, 400]);
 * </pre>
 * @class drag是一个包含拖拽功能的mixin。可以通过 Class.mix(view, drag)或Hilo.copy(view, drag)来为view增加拖拽功能。
 * @mixin
 * @static
 * @module hilo/util/drag
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 */
var drag = {
    /**
      * 开始拖拽
      * @param {Array} bounds 拖拽范围，基于父容器坐标系，[x, y, width, height]， 默认无限制
    */
    startDrag:function(bounds){
        var that = this;
        var stage;
        var bounds = bounds||[-Infinity, -Infinity, Infinity, Infinity];
        var mouse = {
            x:0,
            y:0,
            preX:0,
            preY:0
        };
        var minX = bounds[0];
        var minY = bounds[1];
        var maxX = bounds[2] == Infinity?Infinity:minX + bounds[2];
        var maxY = bounds[3] == Infinity?Infinity:minY + bounds[3];

        function onStart(e){
            e.stopPropagation();
            updateMouse(e);
            that.off(Hilo.event.POINTER_START, onStart);

            that.fire("dragStart", mouse);

            that.__dragX = that.x - mouse.x;
            that.__dragY = that.y - mouse.y;

            if(!stage){
                stage = this.getStage();
            }
            stage.on(Hilo.event.POINTER_MOVE, onMove);
            document.addEventListener(Hilo.event.POINTER_END, onStop);
        }

        function onStop(e){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);

            that.fire("dragEnd", mouse);
            that.on(Hilo.event.POINTER_START, onStart);
        }

        function onMove(e){
            updateMouse(e);

            that.fire("dragMove", mouse);

            var x = mouse.x + that.__dragX;
            var y = mouse.y + that.__dragY;

            that.x = Math.max(minX, Math.min(maxX, x));
            that.y = Math.max(minY, Math.min(maxY, y));
        }

        function updateMouse(e){
            mouse.preX = mouse.x;
            mouse.preY = mouse.y;
            mouse.x = e.stageX;
            mouse.y = e.stageY;
        }

        function stopDrag(){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);
            that.off(Hilo.event.POINTER_START, onStart);
        }
        that.on(Hilo.event.POINTER_START, onStart);

        that.stopDrag = stopDrag;
    },
    /**
      * 停止拖拽
    */
    stopDrag:function(){

    }
};

module.exports = drag;