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
 * @class Camera3d is a pseudo-3d camera.
 * @module hilo/game/Camera3d
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Number} fv The distance of the fov(The distance between eyes and the Z plane，it determines the scale ratio of the 3d object).
 * @property {Number} fx The x position of the screen viewpoint(The distance between the screen viewpoint and the screen left top corner on the x axis).
 * @property {Number} fy The y position of the screen viewpoint(The distance between the screen viewpoint and the screen left top corner on the y axis).
 * @property {Object} stage The 3d object's container, it can be stage or container.It is required if you need to sort the 3d object by z axis.
 * @property {Number} x The x position.
 * @property {Number} y The y position.
 * @property {Number} z The z position.
 * @property {Number} rotationX The x rotation.
 * @property {Number} rotationY The y rotation.
 * @property {Number} rotationZ The z rotation.
 */
var Camera3d = (function(){

	var degtorad = Math.PI / 180;

	//Rotate the axis.
	function rotateX(x, y, z, ca, sa) {//rotate x
		return {
			x: x,
			y: y * ca - z * sa,
			z: y * sa + z * ca
		};
	}
	function rotateY(x, y, z, ca, sa) {//rotate y
		return {
			x: x * ca - z * sa,
			y: y,
			z: x * sa + z * ca
		};
	}
	function rotateZ(x, y, z, ca, sa) {//rotate z
		return {
			x: x * ca - y * sa,
			y: x * sa + y * ca,
			z: z
		};
	}

	var Camera3d = Class.create(/** @lends Camera3d.prototype */{

		constructor: function(properties){
			properties.x = properties.x || 0;
			properties.y = properties.y || 0;
			properties.z = properties.z || 0;
			properties.rotationX = properties.rotationX || 0;
			properties.rotationY = properties.rotationY || 0;
			properties.rotationZ = properties.rotationZ || 0;

        	util.copy(this, properties);
		},

	    /**
         * @language=en
         * Translate the camera，used for Zoomin/out feature.
	     * @param {Number} x The x position.
	     * @param {Number} y The y position.
	     * @param {Number} z The z position.
	     */
		translate : function(x,y,z){
			this.tx = x;
			this.ty = y;
			this.tz = z;
		},

	    /**
         * @language=en
         * Rotate by the x axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateX : function(angle){
			this.rotationX = angle;
		},

	    /**
         * @language=en
         * Rotate by the y axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateY : function(angle){
			this.rotationY = angle;
		},

	    /**
         * @language=en
         * Rotate by the z axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateZ : function(angle){
			this.rotationZ = angle;
		},

	    /**
         * @language=en
         * Project the 3d point to 2d point.
	     * @param {object} vector3D The 3d position, it must have x, y and z properties.
	     * @param {View} view The view related to the 3d position.It'll be auto translated by the 3d position.
         * @returns {Object} The 2d object include z and scale properties, e.g.:{x:x, y:y, z:z, scale}
	     */
		project : function(vector3D, view){

			var rx = this.rotationX * degtorad,
				ry = this.rotationY * degtorad,
				rz = this.rotationZ * degtorad,

				cosX = Math.cos(rx), sinX = Math.sin(rx),
				cosY = Math.cos(ry), sinY = Math.sin(ry),
				cosZ = Math.cos(rz), sinZ = Math.sin(rz),

				// 旋转变换前的 仿射矩阵位移，
				dx = vector3D.x - this.x,
				dy = vector3D.y - this.y,
				dz = vector3D.z - this.z;

			// 旋转矩阵变换
			var vector = rotateZ(dx, dy, dz, cosZ, sinZ);
			vector = rotateY(vector.x, vector.y, vector.z, cosY, sinY);
			vector = rotateX(vector.x, vector.y, vector.z, cosX, sinX);

			// 最后的仿射矩阵变换
			if(this.tx) vector.x -= this.tx;
			if(this.ty) vector.y -= this.ty;
			if(this.tz) vector.z -= this.tz;

			var	perspective = this.fv / (this.fv + vector.z),
				_x = vector.x * perspective,
				_y = -vector.y * perspective;

            var result = {
                x : _x + this.fx,
                y : _y + this.fy,
                z : -vector.z,
                scale : perspective
            };

			if(view){
                view.x = result.x;
                view.y = result.y;
                view.z = result.z;
                view.scaleX = result.scale;
                view.scaleY = result.scale;
			}

            return result;
		},

	    /**
         * @language=en
         * Sort by z axis.
	     */
		sortZ : function(){
			this.stage.children.sort(function(view_a, view_b){
                return view_a.z > view_b.z;
            });
		},

	    /**
         * @language=en
         * Used for the ticker.
	     */
		tick : function(){
			this.sortZ();
		}

	});

	return Camera3d;

})();
window.Hilo.Camera3d = Camera3d;
})(window);