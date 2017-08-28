/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


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
    concat: function(mtx){
        var args = arguments,
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        var ma, mb, mc, md, mx, my;
        if(args.length >= 6){
            ma = args[0];
            mb = args[1];
            mc = args[2];
            md = args[3];
            mx = args[4];
            my = args[5];
        }
        else{
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

window.Hilo.Matrix = Matrix;
})(window);