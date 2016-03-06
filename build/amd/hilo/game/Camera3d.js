/**
 * Hilo 1.0.0 for amd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define('hilo/game/Camera3d', ['hilo/core/Hilo', 'hilo/core/Class'], function(Hilo, Class){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera3d Pseudo 3D virtual camera.
 * @module hilo/game/Camera3d
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} fv Distance from the camera viewpoint (viewpoint w.r.t. the eyes form the screen.)
 * @property {Number} fx The camera viewpoint X (relative to the ipper left corner of the screen viewpoint distance X)
 * @property {Number} fy The camera viewpoint Y (relative to the ipper left corner of the screen viewpoint distance Y)
 * @property {Object} stage Where the 3D object can be a stage or a container, is a must when combined with ticker parameter.
 * @property {Number} x Lens dimensional coordinates x
 * @property {Number} y Lens dimensional coordinates y
 * @property {Number} z Lens dimensional coordinates z
 * @property {Number} rotationX X axis rotation angle
 * @property {Number} rotationY Y axis rotation angle
 * @property {Number} rotationZ Z axis rotation angle
 */
var Camera3d = (function(){

	var degtorad = Math.PI / 180;

	// Vector rotation
	function rotateX(x, y, z, ca, sa) {// Around the X axis
		return {
			x: x,
			y: y * ca - z * sa,
			z: y * sa + z * ca
		};
	}
	function rotateY(x, y, z, ca, sa) {// Around the Y axis
		return {
			x: x * ca - z * sa,
			y: y,
			z: x * sa + z * ca
		};
	}
	function rotateZ(x, y, z, ca, sa) {// Around the Z axis
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

        	Hilo.copy(this, properties);
		},

	    /**
	     * Affine transformation matrix displacement.
	     * Unlike directly modify Camera3d.x/y/z coordinates, is done sequentially.
	     * After rotation transformation, coupled with a displacement transducer.
	     * The main function can be done using Zoomin.out function.
	     * @param {Number} x coordinate
	     * @param {Number} y coordinate
	     * @param {Number} z coordinate
	     */
		translate : function(x,y,z){
			this.tx = x;
			this.ty = y;
			this.tz = z;
		},

	    /**
	     * The rotation angle of the X-axis direction, the equivalent Euler angles system beta.
	     * @param {Number} X rotation angle
	     */
		rotateX : function(angle){
			this.rotationX = angle;
		},

	    /**
	     * The rotation angle of the Y-axis direction, the equivalent Euler angles system gamma.
	     * @param {Number} Y rotation angle
	     */
		rotateY : function(angle){
			this.rotationY = angle;
		},

	    /**
	     * The rotation angle of the Z-axis direction, the equivalent Euler angles system alpha.
	     * @param {Number} Z rotation angle
	     */
		rotateZ : function(angle){
			this.rotationZ = angle;
		},

	    /**
	     * The 3D coordinates to 2D projection coordinates, and return the Z-axis depth, and projection display scaling.
	     * @param {object} Three-dimensional coordinates of the object
	     * @param {object} Hilo.View objects for automatic coordinate conversion
	     */
		project : function(vector3D, view){

			var rx = this.rotationX * degtorad,
				ry = this.rotationY * degtorad,
				rz = this.rotationZ * degtorad,

				cosX = Math.cos(rx), sinX = Math.sin(rx),
				cosY = Math.cos(ry), sinY = Math.sin(ry),
				cosZ = Math.cos(rz), sinZ = Math.sin(rz),

				// Rotation affine transformation matrix pre displacement
				dx = vector3D.x - this.x,
				dy = vector3D.y - this.y,
				dz = vector3D.z - this.z,

			// Rotation matrix transformation
			vector = rotateZ(dx, dy, dz, cosZ, sinZ);
			vector = rotateY(vector.x, vector.y, vector.z, cosY, sinY);
			vector = rotateX(vector.x, vector.y, vector.z, cosX, sinX);

			// The final affine transformation matrix
			if(this.tx) vector.x -= this.tx;
			if(this.ty) vector.y -= this.ty;
			if(this.tz) vector.z -= this.tz;

			var	perspective = this.fv / (this.fv + vector.z),
				_x = vector.x * perspective,
				_y = -vector.y * perspective;

			if(view) {
                view.x = _x + this.fx;
                view.y = _y + this.fy;
                view.z = -vector.z;
                view.scaleX = perspective;
                view.scaleY = perspective;
			} else {
				return {
					x : _x + this.fx,
					y : _y + this.fy,
					z : -vector.z,
					scale : perspective
				};
			}
		},

	    /**
	     * Z depth sorting
	     */
		sortZ : function(){
			this.stage.children.sort(function(view_a, view_b){
                return view_a.z > view_b.z;
            });
		},

	    /**
	     * Ticker Polling Use
	     */
		tick : function(){
			this.sortZ();
		}

	});

	return Camera3d;

})();

return Camera3d;

});
