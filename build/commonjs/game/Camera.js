/**
 * Hilo 1.0.0 for commonjs
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
var Hilo = require('../core/Hilo');
var Class = require('../core/Class');

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera类表示摄像机。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/game/Camera
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} width 镜头宽
 * @property {Number} height 镜头高
 * @property {Object} scroll 滚动值 {x:0, y:0}
 * @property {View} target 摄像机跟随的目标
 * @property {Array} bounds 摄像机移动边界的矩形区域 [x, y, width, height]
 * @property {Array} deadzone 摄像机不移动的矩形区域 [ x, y, width, height]
 */
var Camera = Class.create(/** @lends Camera.prototype */{
    constructor:function(properties){
        this.width = 0;
        this.height = 0;

        this.target = null;
        this.deadzone = null;
        this.bounds = null;

        this.scroll = {
            x:0,
            y:0
        };

        Hilo.copy(this, properties);
    },
    /**
     * 更新
     * @param {Number} deltaTime
    */
    tick:function(deltaTime){
        var target = this.target;
        var scroll = this.scroll;
        var bounds = this.bounds;
        var deadzone = this.deadzone;

        if(target){
            var viewX, viewY;
            if(deadzone){
                viewX = Math.min(Math.max(target.x - scroll.x, deadzone[0]), deadzone[0] + deadzone[2]);
                viewY = Math.min(Math.max(target.y - scroll.y, deadzone[1]), deadzone[1] + deadzone[3]);
            }
            else{
                viewX = this.width * .5;
                viewY = this.height * .5;
            }

            scroll.x = target.x - viewX;
            scroll.y = target.y - viewY;

            if(bounds){
                scroll.x = Math.min(Math.max(scroll.x, bounds[0]), bounds[0] + bounds[2]);
                scroll.y = Math.min(Math.max(scroll.y, bounds[1]), bounds[1] + bounds[3]);
            }
        }
        else{
            scroll.x = 0;
            scroll.y = 0;
        }
    },
    /**
     * 跟随目标
     * @param {Object} target 跟随的目标，必须是有x,y属性的对象
     * @param {Array} deadzone 摄像机不移动的矩形区域 [ x, y, width, height]
    */
    follow:function(target, deadzone){
        this.target = target;
        if(deadzone !== undefined){
            this.deadzone = deadzone;
        }
        this.tick();
    }
});


module.exports = Camera;