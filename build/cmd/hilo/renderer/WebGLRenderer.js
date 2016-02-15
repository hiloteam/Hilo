/**
 * Hilo 1.0.0 for cmd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define(function(require, exports, module){

var Class = require('hilo/core/Class');
var Renderer = require('hilo/renderer/Renderer');
var Matrix = require('hilo/geom/Matrix');

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * Heavily inspired by PIXI's SpriteRenderer:
 * https://github.com/pixijs/pixi.js/blob/v3.0.9/src/core/sprites/webgl/SpriteRenderer.js
 */

var DEG2RAD = Math.PI / 180;
/**
 * @class webgl画布渲染器。所有可视对象将渲染在canvas画布上。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/WebGLRenderer
 * @requires hilo/core/Class
 * @requires hilo/renderer/Renderer
 * @requires  hilo/geom/Matrix
 * @property {WebGLRenderingContext} gl webgl上下文。只读属性。
 */
var WebGLRenderer = Class.create(/** @lends WebGLRenderer.prototype */{
    Extends: Renderer,
    Statics:/** @lends WebGLRenderer */{
        /**
         * 最大批渲染数量。
         * @type {Number}
         */
        MAX_BATCH_NUM:2000,
        /**
         * 顶点属性数。只读属性。
         * @type {Number}
         */
        ATTRIBUTE_NUM:5,
        /**
         * 是否支持WebGL。只读属性。
         * @type {Boolean}
         */
        isSupport:null
    },
    renderType:'webgl',
    gl:null,
    constructor: function(properties){
        window.__render = this;
        WebGLRenderer.superclass.constructor.call(this, properties);
        var gl = this.gl = this.canvas.getContext("webgl")||this.canvas.getContext('experimental-webgl');

        this.maxBatchNum = WebGLRenderer.MAX_BATCH_NUM;
        this.positionStride = WebGLRenderer.ATTRIBUTE_NUM * 4;
        var vertexNum = this.maxBatchNum * WebGLRenderer.ATTRIBUTE_NUM * 4;
        var indexNum = this.maxBatchNum * 6;
        this.positions = new Float32Array(vertexNum);
        this.indexs = new Uint16Array(indexNum);
        for (var i=0, j=0; i < indexNum; i += 6, j += 4)
        {
            this.indexs[i + 0] = j + 0;
            this.indexs[i + 1] = j + 1;
            this.indexs[i + 2] = j + 2;
            this.indexs[i + 3] = j + 1;
            this.indexs[i + 4] = j + 2;
            this.indexs[i + 5] = j + 3;
        }
        this.batchIndex = 0;
        this.sprites = [];

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);

        this._initShaders();
        this.defaultShader.active();

        this.positionBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexs, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, this.positionStride, 0);//x, y
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, this.positionStride, 2 * 4);//x, y
        gl.vertexAttribPointer(this.a_alpha, 1, gl.FLOAT, false, this.positionStride, 4 * 4);//alpha
    },

    context: null,

    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        if(target.visible && target.alpha > 0){
            if(target === this.stage){
                this.clear();
            }
            return true;
        }
        return false;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var ctx = this.context, w = target.width, h = target.height;

        //TODO:draw background
        var bg = target.background;

        //draw image
        var drawable = target.drawable, image = drawable && drawable.image;
        if(image){
            var gl = this.gl;
            if(!image.texture){
                this.activeShader.uploadTexture(image);
            }

            var rect = drawable.rect, sw = rect[2], sh = rect[3], offsetX = rect[4], offsetY = rect[5];
            if(!w && !h){
                //fix width/height TODO: how to get rid of this?
                w = target.width = sw;
                h = target.height = sh;
            }

            if(this.batchIndex >= this.maxBatchNum){
                this._renderBatches();
            }

            var vertexs = this._createVertexs(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
            var index = this.batchIndex * this.positionStride;
            var positions = this.positions;
            var alpha = target.__webglRenderAlpha;
            positions[index + 0] = vertexs[0];//x
            positions[index + 1] = vertexs[1];//y
            positions[index + 2] = vertexs[2];//uvx
            positions[index + 3] = vertexs[3];//uvy
            positions[index + 4] = alpha;//alpha

            positions[index + 5] = vertexs[4];
            positions[index + 6] = vertexs[5];
            positions[index + 7] = vertexs[6];
            positions[index + 8] = vertexs[7];
            positions[index + 9] = alpha;

            positions[index + 10] = vertexs[8]
            positions[index + 11] = vertexs[9]
            positions[index + 12] = vertexs[10]
            positions[index + 13] = vertexs[11]
            positions[index + 14] = alpha;

            positions[index + 15] = vertexs[12]
            positions[index + 16] = vertexs[13]
            positions[index + 17] = vertexs[14]
            positions[index + 18] = vertexs[15]
            positions[index + 19] = alpha;

            var matrix = target.__webglWorldMatrix;
            for(var i = 0;i < 4;i ++){
                var x = positions[index + i*5];
                var y = positions[index + i*5 + 1];

                positions[index + i*5] = matrix.a*x+matrix.c*y + matrix.tx;
                positions[index + i*5 + 1] = matrix.b*x+matrix.d*y + matrix.ty;
            }

            target.texture = image.texture;
            this.sprites[this.batchIndex++] = target;
        }
    },

    /**
     * @private
     * @see Renderer#endDraw
     */
    endDraw: function(target){
        if(target === this.stage){
            this._renderBatches();
        }
    },
    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        var drawable = target.drawable;
        if(drawable && drawable.domElement){
            Hilo.setElementStyleByView(target);
            return;
        }

        var ctx = this.context,
            scaleX = target.scaleX,
            scaleY = target.scaleY;

        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
            target.__webglWorldMatrix = target.__webglWorldMatrix||new Matrix(1, 0, 0, 1, 0, 0);
        }else{
            target.__webglWorldMatrix = target.__webglWorldMatrix||new Matrix(1, 0, 0, 1, 0, 0);
            this._setConcatenatedMatrix(target, target.parent);
        }

        if(target.alpha > 0) {
            if(target.parent && target.parent.__webglRenderAlpha){
                target.__webglRenderAlpha = target.alpha * target.parent.__webglRenderAlpha;
            }
            else{
                target.__webglRenderAlpha = target.alpha;
            }
        }
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var drawable = target.drawable;
        var elem = drawable && drawable.domElement;

        if(elem){
            var parentElem = elem.parentNode;
            if(parentElem){
                parentElem.removeChild(elem);
            }
        }
    },

    /**
     * @private
     * @see Renderer#clear
     */
    clear: function(x, y, width, height){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        if(this.width !== width || this.height !== height){
            this.width = this.canvas.width = width;
            this.height = this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);

            this.canvasHalfWidth = width * .5;
            this.canvasHalfHeight = height * .5;

            this._uploadProjectionTransform(true);
        }
    },
    _renderBatches:function(){
        var gl = this.gl;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions.subarray(0, this.batchIndex * this.positionStride));
        var startIndex = 0;
        var batchNum = 0;
        var preTexture = null;
        for(var i = 0;i < this.batchIndex;i ++){
            var sprite = this.sprites[i];
            if(preTexture && preTexture !== sprite.texture){
                this._renderBatch(startIndex, i);
                startIndex = i;
                batchNum = 1;
            }
            preTexture = sprite.texture;
        }
        this._renderBatch(startIndex, this.batchIndex);
        this.batchIndex = 0;
    },
    _renderBatch:function(start, end){
        var gl = this.gl;
        var num = end - start;
        if(num > 0){
            gl.bindTexture(gl.TEXTURE_2D, this.sprites[start].texture);
            gl.drawElements(gl.TRIANGLES, num * 6, gl.UNSIGNED_SHORT, start * 6 * 2);
        }
    },
    _uploadProjectionTransform:function(force){
        if(!this._projectionTransformElements||force){
            this._projectionTransformElements = new Float32Array([
                1/this.canvasHalfWidth, 0, 0,
                0, -1/this.canvasHalfHeight, 0,
                -1, 1, 1,
            ]);
        }

        this.gl.uniformMatrix3fv(this.u_projectionTransform, false, this._projectionTransformElements);
    },
    _initShaders:function(){
        var VSHADER_SOURCE ='\
            attribute vec2 a_position;\n\
            attribute vec2 a_TexCoord;\n\
            attribute float a_alpha;\n\
            uniform mat3 u_projectionTransform;\n\
            varying vec2 v_TexCoord;\n\
            varying float v_alpha;\n\
            void main(){\n\
                gl_Position =  vec4((u_projectionTransform * vec3(a_position, 1.0)).xy, 1.0, 1.0);\n\
                v_TexCoord = a_TexCoord;\n\
                v_alpha = a_alpha;\n\
            }\n\
        ';

        var FSHADER_SOURCE = '\n\
            precision mediump float;\n\
            uniform sampler2D u_Sampler;\n\
            varying vec2 v_TexCoord;\n\
            varying float v_alpha;\n\
            void main(){\n\
                gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_alpha;\n\
            }\n\
        ';

        this.defaultShader = new Shader(this, {
            v:VSHADER_SOURCE,
            f:FSHADER_SOURCE
        },{
            attributes:["a_position", "a_TexCoord", "a_alpha"],
            uniforms:["u_projectionTransform", "u_Alpha", "u_Sampler"]
        });
    },
    _createVertexs:function(img, tx, ty, tw, th, x, y, w, h){
        var tempVertexs = this.__tempVertexs||[];
        var width = img.width;
        var height = img.height;

        tw = tw/width;
        th = th/height;
        tx = tx/width;
        ty = ty/height;

        w = w;
        h = h;
        x = x;
        y = y;

        if(tw + tx > 1){
            tw = 1 - tx;
        }

        if(th + ty > 1){
            th = 1 - ty;
        }

        var index = 0;
        tempVertexs[index++] = x; tempVertexs[index++] = y; tempVertexs[index++] = tx; tempVertexs[index++] = ty;
        tempVertexs[index++] = x+w;tempVertexs[index++] = y; tempVertexs[index++] = tx+tw; tempVertexs[index++] = ty;
        tempVertexs[index++] = x; tempVertexs[index++] = y+h; tempVertexs[index++] = tx;tempVertexs[index++] = ty+th;
        tempVertexs[index++] = x+w;tempVertexs[index++] = y+h;tempVertexs[index++] = tx+tw;tempVertexs[index++] = ty+th;

        return tempVertexs;
    },
    _setConcatenatedMatrix:function(view, ancestor){
        var mtx = view.__webglWorldMatrix;
        var cos = 1, sin = 0,
            rotation = view.rotation % 360,
            pivotX = view.pivotX, pivotY = view.pivotY,
            scaleX = view.scaleX, scaleY = view.scaleY;

        if(rotation){
            var r = rotation * DEG2RAD;
            cos = Math.cos(r);
            sin = Math.sin(r);
        }

        mtx.a = cos*scaleX;
        mtx.b = sin*scaleX;
        mtx.c = -sin*scaleY;
        mtx.d = cos*scaleY;
        mtx.tx =  view.x - mtx.a * pivotX - mtx.c * pivotY;
        mtx.ty =  view.y - mtx.b * pivotX - mtx.d * pivotY;

        mtx.concat(ancestor.__webglWorldMatrix);
    }
});

/**
 * shader
 * @param {WebGLRenderer} renderer [description]
 * @param {Object} source
 * @param {String} source.v 顶点shader
 * @param {String} source.f 片段shader
 * @param {Object} attr
 * @param {Array} attr.attributes attribute数组
 * @param {Array} attr.uniforms uniform数组
 */
var _cacheTexture = {};
var Shader = function(renderer, source, attr){
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.program = this._createProgram(this.gl, source.v, source.f);

    attr = attr||{};
    this.attributes = attr.attributes||[];
    this.uniforms = attr.uniforms||[];
}

Shader.prototype = {
    active:function(){
        var that = this;
        var renderer = that.renderer;
        var gl = that.gl;
        var program = that.program;

        if(program && gl){
            renderer.activeShader = that;
            gl.useProgram(program);
            that.attributes.forEach(function(attribute){
                renderer[attribute] = gl.getAttribLocation(program, attribute);
                gl.enableVertexAttribArray(renderer[attribute]);
            });

            that.uniforms.forEach(function(uniform){
                renderer[uniform] = gl.getUniformLocation(program, uniform);
            });

            if(that.width !== renderer.width || that.height !== renderer.height){
                that.width = renderer.width;
                that.height = renderer.height;
                renderer._uploadProjectionTransform();
            }
        }
    },
    uploadTexture:function(image){
        var gl = this.gl;
        var renderer = this.renderer;
        if(_cacheTexture[image.src]){
            image.texture = _cacheTexture[image.src];
        }
        else{
            var texture = gl.createTexture();
            var u_Sampler = renderer.u_Sampler;


            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.uniform1i(u_Sampler, 0);
            gl.bindTexture(gl.TEXTURE_2D, null);

            image.texture = texture;
            _cacheTexture[image.src] = texture;
        }
    },
    _createProgram:function(gl, vshader, fshader){
        var vertexShader = this._createShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = this._createShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        var program = gl.createProgram();
        if (program) {
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);

            gl.linkProgram(program);

            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!linked) {
                var error = gl.getProgramInfoLog(program);
                console.log('Failed to link program: ' + error);
                gl.deleteProgram(program);
                return null;
            }
        }
        return program;
    },
    _createShader:function(gl, type, source){
        var shader = gl.createShader(type);
        if(shader){
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiled) {
                var error = gl.getShaderInfoLog(shader);
                console.log('Failed to compile shader: ' + error);
                gl.deleteShader(shader);
                return null;
            }
        }
        return shader;
    }
};

WebGLRenderer.isSupport = function(){
    if(this._isSupport !== undefined){
        return this._isSupport;
    }
    else{
        var canvas = document.createElement('canvas');
        if(canvas.getContext && (canvas.getContext('webgl')||canvas.getContext('experimental-webgl'))){
            this._isSupport = true;
        }
        else{
            this._isSupport = false;
        }
        return this._isSupport;
    }
};

return WebGLRenderer;

});