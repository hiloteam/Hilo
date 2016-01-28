/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera3d 伪3D虚拟摄像机。
 * @module hilo/game/Camera3d
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} fv 镜头视点距离（屏幕视点相对眼睛距离，绝对了坐标缩放比例）
 * @property {Number} fx 镜头视点X（屏幕视点相对屏幕左上角X距离）
 * @property {Number} fy 镜头视点Y（屏幕视点相对屏幕左上角Y距离）
 * @property {Object} stage 3D对象所在容器，可以是stage或container，结合ticker时是必须参数，用来Z深度排序
 * @property {Number} x 镜头三维坐标x
 * @property {Number} y 镜头三维坐标y
 * @property {Number} z 镜头三维坐标z
 * @property {Number} rotationX X轴旋转角度
 * @property {Number} rotationY Y轴旋转角度
 * @property {Number} rotationZ Z轴旋转角度
 */
var Camera3d = (function(){

	var degtorad = Math.PI / 180;

	//向量旋转
	function rotateX(x, y, z, ca, sa) {//绕X轴旋转
		return {
			x: x,
			y: y * ca - z * sa,
			z: y * sa + z * ca
		};
	}
	function rotateY(x, y, z, ca, sa) {//绕Y轴旋转
		return {
			x: x * ca - z * sa,
			y: y,
			z: x * sa + z * ca
		};
	}
	function rotateZ(x, y, z, ca, sa) {//绕Z轴旋转
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
	     * 仿射矩阵位移变换，不同于直接修改Camera3d.x/y/z. 是在Camera3d依次做坐标位移 - 旋转变换 后，再加上一个位移变换。主要功能可以做Zoomin/out 功能
	     * @param {Number} x坐标
	     * @param {Number} y坐标
	     * @param {Number} z坐标
	     */
		translate : function(x,y,z){
			this.tx = x;
			this.ty = y;
			this.tz = z;
		},

	    /**
	     * 旋转X轴方向角度，相当于欧拉角系统的 beta
	     * @param {Number} X旋转角度
	     */
		rotateX : function(angle){
			this.rotationX = angle;
		},

	    /**
	     * 旋转Y轴方向角度，相当于欧拉角系统的 gamma
	     * @param {Number} Y旋转角度
	     */
		rotateY : function(angle){
			this.rotationY = angle;
		},

	    /**
	     * 旋转Z轴方向角度，相当于欧拉角系统的 alpha
	     * @param {Number} Z旋转角度
	     */
		rotateZ : function(angle){
			this.rotationZ = angle;
		},

	    /**
	     * 将三维坐标转换投影为二维坐标，同时返回Z轴深度，和投影显示的缩放比例
	     * @param {object} 三维坐标对象
	     * @param {object} Hilo.View对象，用于自动转换坐标
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
				dz = vector3D.z - this.z,

			// 旋转矩阵变换
			vector = rotateZ(dx, dy, dz, cosZ, sinZ);
			vector = rotateY(vector.x, vector.y, vector.z, cosY, sinY);
			vector = rotateX(vector.x, vector.y, vector.z, cosX, sinX);

			// 最后的仿射矩阵变换
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
	     * Z深度排序
	     */
		sortZ : function(){
			this.stage.children.sort(function(view_a, view_b){
                return view_a.z > view_b.z;
            });
		},

	    /**
	     * Ticker 轮询使用
	     */
		tick : function(){
			this.sortZ();
		}

	});

	return Camera3d;

})();