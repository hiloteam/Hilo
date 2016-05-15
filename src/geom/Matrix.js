/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class Matrix class is a transforming matrix, which declare how points in one coordinate maped to another coordinate.
 * @param {Number} a The value affects pixel positioning alongside the x axis when Scale or rotate images.
 * @param {Number} b The value affects pixel positioning alongside the y axis when rotate or skew images.
 * @param {Number} c The value affects pixel positioning alongside the x axis when rotate or skew images.
 * @param {Number} d The value affects pixel positioning alongside the y axis when Scale or rotate images.
 * @param {Number} tx The distance to move every point alongside the x axis.
 * @param {Number} ty The distance to move every point alongside the y axis.
 * @module hilo/geom/Matrix
 * @requires hilo/core/Class
 */
/**
 * @language=zh
 * @class Matrix类表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。
 * @param {Number} a 缩放或旋转图像时影响像素沿 x 轴定位的值。
 * @param {Number} b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
 * @param {Number} c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
 * @param {Number} d 缩放或旋转图像时影响像素沿 y 轴定位的值。
 * @param {Number} tx 沿 x 轴平移每个点的距离。
 * @param {Number} ty 沿 y 轴平移每个点的距离。
 * @module hilo/geom/Matrix
 * @requires hilo/core/Class
 */
var Matrix = Class.create(/** @lends Matrix.prototype */{
    constructor: function(a, b, c, d, tx, ty){
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * @language=en
     * Link a Matrix to current Matrix, in order to make geometry effects on these two composed more effective.
     * @param {Matrix} mtx Matrix that link to the source matrix.
     * @returns {Matrix} A Matrix Object.
     */
    /**
     * @language=zh
     * 将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * @param {Matrix} mtx 要连接到源矩阵的矩阵。
     * @returns {Matrix} 一个Matrix对象。
     */
    concat: function(mtx){
        var args = arguments,
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        if(args.length >= 6){
            var ma = args[0], mb = args[1], mc = args[2],
                md = args[3], mx = args[4], my = args[5];
        }else{
            ma = mtx.a;
            mb = mtx.b;
            mc = mtx.c;
            md = mtx.d;
            mx = mtx.tx;
            my = mtx.ty;
        }

        this.a = a * ma + b * mc;
        this.b = a * mb + b * md;
        this.c = c * ma + d * mc;
        this.d = c * mb + d * md;
        this.tx = tx * ma + ty * mc + mx;
        this.ty = tx * mb + ty * md + my;
        return this;
    },

    /**
     * @language=en
     * Rotate the Matrix Object.
     * @param {Number} angle The angle to rotate.
     * @returns {Matrix} A Matrix object.
     */
    /**
     * @language=zh
     * 对 Matrix 对象应用旋转转换。
     * @param {Number} angle 旋转的角度。
     * @returns {Matrix} 一个Matrix对象。
     */
    rotate: function(angle){
        var sin = Math.sin(angle), cos = Math.cos(angle),
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        this.a = a * cos - b * sin;
        this.b = a * sin + b * cos;
        this.c = c * cos - d * sin;
        this.d = c * sin + d * cos;
        this.tx = tx * cos - ty * sin;
        this.ty = tx * sin + ty * cos;
        return this;
    },

    /**
     * @language=en
     * Scale the Matrix.
     * @param {Number} sx The value to multiply those object scale alongside the x axis.
     * @param {Number} sy The value to multiply those object scale alongside the y axis.
     * @returns {Matrix} A Matrix object.
     */
    /**
     * @language=zh
     * 对矩阵应用缩放转换。
     * @param {Number} sx 用于沿 x 轴缩放对象的乘数。
     * @param {Number} sy 用于沿 y 轴缩放对象的乘数。
     * @returns {Matrix} 一个Matrix对象。
     */
    scale: function(sx, sy){
        this.a *= sx;
        this.d *= sy;
        this.c *= sx;
        this.b *= sy;
        this.tx *= sx;
        this.ty *= sy;
        return this;
    },

    /**
     * @language=en
     * Translate the Matrix alongside x axis and y axis by dx and dy.
     * @param {Number} dx Translate Matrix alongside the x axis to the right (measured in px).
     * @param {Number} dy Translate Matrix alongside the y axis to the right (measured in px).
     * @returns {Matrix} A Matrix object.
     */
    /**
     * @language=zh
     * 沿 x 和 y 轴平移矩阵，由 dx 和 dy 参数指定。
     * @param {Number} dx 沿 x 轴向右移动的量（以像素为单位）。
     * @param {Number} dy 沿 y 轴向右移动的量（以像素为单位）。
     * @returns {Matrix} 一个Matrix对象。
     */
    translate: function(dx, dy){
        this.tx += dx;
        this.ty += dy;
        return this;
    },

    /**
     * @language=en
     * Set each Matrix property a value to trigger null transform. The Matrix after applying identity matrix transformation will be exactly the same as original.
     * @returns {Matrix} A Matrix object.
     */
    /**
     * @language=zh
     * 为每个矩阵属性设置一个值，该值将导致 null 转换。通过应用恒等矩阵转换的对象将与原始对象完全相同。
     * @returns {Matrix} 一个Matrix对象。
     */
    identity: function(){
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    },

    /**
     * @language=en
     * Apply an invert transformation of original Matrix. Using this invert transformation, you can reset a Matrix to a state before it had been apply some Matrix.
     * @returns {Matrix} A Matrix object.
     */
    /**
     * @language=zh
     * 执行原始矩阵的逆转换。您可以将一个逆矩阵应用于对象来撤消在应用原始矩阵时执行的转换。
     * @returns {Matrix} 一个Matrix对象。
     */
    invert: function(){
        var a = this.a;
        var b = this.b;
        var c = this.c;
        var d = this.d;
        var tx = this.tx;
        var i = a * d - b * c;

        this.a = d / i;
        this.b = -b / i;
        this.c = -c / i;
        this.d = a / i;
        this.tx = (c * this.ty - d * tx) / i;
        this.ty = -(a * this.ty - b * tx) / i;
        return this;
    },

    /**
     * @language=en
     * Return the result after apply a Matrix displaying transform on the point.
     * @param {Object} point Point need to transform.
     * @param {Boolean} round Whether ceil the coordinate values of the point.
     * @param {Boolean} returnNew Whether return a new point.
     * @returns {Object} 由应用矩阵转换所产生的点。
     */
    /**
     * @language=zh
     * 返回将 Matrix 对象表示的几何转换应用于指定点所产生的结果。
     * @param {Object} point 想要获得其矩阵转换结果的点。
     * @param {Boolean} round 是否对点的坐标进行向上取整。
     * @param {Boolean} returnNew 是否返回一个新的点。
     * @returns {Object} 由应用矩阵转换所产生的点。
     */
    transformPoint: function(point, round, returnNew){
        var x = point.x * this.a + point.y * this.c + this.tx,
            y = point.x * this.b + point.y * this.d + this.ty;

        if(round){
            x = x + 0.5 >> 0;
            y = y + 0.5 >> 0;
        }
        if(returnNew) return {x:x, y:y};
        point.x = x;
        point.y = y;
        return point;
    }

});
