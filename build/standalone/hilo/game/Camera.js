/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Camera.
 * @param {Object} properties The properties to create a view object, contains all writeable props of this class
 * @module hilo/game/Camera
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Number} width The width of the camera.
 * @property {Number} height The height of the camera.
 * @property {Object} scroll The scrolling value of the camera {x:0, y:0}.
 * @property {View} target The target that the camera follow.
 * @property {Array} bounds The rect area where camera is allowed to move [x, y, width, height].
 * @property {Array} deadzone The rect area where camera isn't allowed to move[ x, y, width, height].
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

        util.copy(this, properties);
    },
    /**
     * @language=en
     * update.
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
     * @language=en
     * Follow the target.
     * @param {Object} target The target that the camera follow. It must has x and y properties.
     * @param {Array} deadzone The rect area where camera isn't allowed to move[ x, y, width, height].
    */
    follow:function(target, deadzone){
        this.target = target;
        if(deadzone !== undefined){
            this.deadzone = deadzone;
        }
        this.tick();
    }
});

window.Hilo.Camera = Camera;
})(window);