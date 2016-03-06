/**
 * Hilo 1.0.0 for amd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define('hilo/game/Camera', ['hilo/core/Hilo', 'hilo/core/Class'], function(Hilo, Class){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera Class represents the camera.
 * @param {Object} properties Create attribute parameter object. Such may contain all writable properties.
 * @module hilo/game/Camera
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} width Lens Width
 * @property {Number} height Lens Height
 * @property {Object} scroll Scroll value {x:0, y:0}
 * @property {View} target The target the camera follows.
 * @property {Array} bounds A rectangular area of the camera's moving boundary [x, y, width, height]
 * @property {Array} deadzone The camera does not move this rectangular area. [ x, y, width, height]
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
     * Update
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
     * Follow goal.
     * @param {Object} target Object to follow. Object must have x,y property.
     * @param {Array} deadzone The rectangular area not moved by the camera [ x, y, width, height]
    */
    follow:function(target, deadzone){
        this.target = target;
        if(deadzone !== undefined){
            this.deadzone = deadzone;
        }
        this.tick();
    }
});


return Camera;

});
