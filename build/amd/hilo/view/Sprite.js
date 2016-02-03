/**
 * Hilo 1.0.0 for amd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define('hilo/view/Sprite', ['hilo/core/Hilo', 'hilo/core/Class', 'hilo/view/View', 'hilo/view/Drawable'], function(Hilo, Class, View, Drawable){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Sprite.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class 动画精灵类。
 * @augments View
 * @module hilo/view/Sprite
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @param properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
 * <ul>
 * <li><b>frames</b> - 精灵动画的帧数据对象。</li>
 * </ul>
 * @property {number} currentFrame 当前播放帧的索引。从0开始。只读属性。
 * @property {boolean} paused 判断精灵是否暂停。默认为false。
 * @property {boolean} loop 判断精灵是否可以循环播放。默认为true。
 * @property {boolean} timeBased 指定精灵动画是否是以时间为基准。默认为false，即以帧为基准。
 * @property {number} interval 精灵动画的帧间隔。如果timeBased为true，则单位为毫秒，否则为帧数。
 */
var Sprite = Class.create(/** @lends Sprite.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Sprite");
        Sprite.superclass.constructor.call(this, properties);

        this._frames = [];
        this._frameNames = {};
        this.drawable = new Drawable();
        if(properties.frames) this.addFrame(properties.frames);
    },

    _frames: null, //所有帧的集合
    _frameNames: null, //带名字name的帧的集合
    _frameElapsed: 0, //当前帧持续的时间或帧数
    _firstRender: true, //标记是否是第一次渲染

    paused: false,
    loop: true,
    timeBased: false,
    interval: 1,
    currentFrame: 0, //当前帧的索引

    /**
     * 返回精灵动画的总帧数。
     * @returns {Uint} 精灵动画的总帧数。
     */
    getNumFrames: function(){
        return this._frames ? this._frames.length : 0;
    },

    /**
     * 往精灵动画序列中增加帧。
     * @param {Object} frame 要增加的精灵动画帧数据。
     * @param {Int} startIndex 开始增加帧的索引位置。若不设置，默认为在末尾添加。
     * @returns {Sprite} Sprite对象本身。
     */
    addFrame: function(frame, startIndex){
        var start = startIndex != null ? startIndex : this._frames.length;
        if(frame instanceof Array){
            for(var i = 0, len = frame.length; i < len; i++){
                this.setFrame(frame[i], start + i);
            }
        }else{
            this.setFrame(frame, start);
        }
        return this;
    },

    /**
     * 设置精灵动画序列指定索引位置的帧。
     * @param {Object} frame 要设置的精灵动画帧数据。
     * @param {Int} index 要设置的索引位置。
     * @returns {Sprite} Sprite对象本身。
     */
    setFrame: function(frame, index){
        var frames = this._frames,
            total = frames.length;
        index = index < 0 ? 0 : index > total ? total : index;
        frames[index] = frame;
        if(frame.name) this._frameNames[frame.name] = frame;
        if(index == 0 && !this.width || !this.height){
            this.width = frame.rect[2];
            this.height = frame.rect[3];
        }
        return this;
    },

    /**
     * 获取精灵动画序列中指定的帧。
     * @param {Object} indexOrName 要获取的帧的索引位置或别名。
     * @returns {Object} 精灵帧对象。
     */
    getFrame: function(indexOrName){
        if(typeof indexOrName === 'number'){
            var frames = this._frames;
            if(indexOrName < 0 || indexOrName >= frames.length) return null;
            return frames[indexOrName];
        }
        return this._frameNames[indexOrName];
    },

    /**
     * 获取精灵动画序列中指定帧的索引位置。
     * @param {Object} frameValue 要获取的帧的索引位置或别名。
     * @returns {Object} 精灵帧对象。
     */
    getFrameIndex: function(frameValue){
        var frames = this._frames,
            total = frames.length,
            index = -1;
        if(typeof frameValue === 'number'){
            index = frameValue;
        }else{
            var frame = typeof frameValue === 'string' ? this._frameNames[frameValue] : frameValue;
            if(frame){
                for(var i = 0; i < total; i++){
                    if(frame === frames[i]){
                        index = i;
                        break;
                    }
                }
            }
        }
        return index;
    },

    /**
     * 播放精灵动画。
     * @returns {Sprite} Sprite对象本身。
     */
    play: function(){
        this.paused = false;
        return this;
    },

    /**
     * 暂停播放精灵动画。
     * @returns {Sprite} Sprite对象本身。
     */
    stop: function(){
        this.paused = true;
        return this;
    },

    /**
     * 跳转精灵动画到指定的帧。
     * @param {Object} indexOrName 要跳转的帧的索引位置或别名。
     * @param {Boolean} pause 指示跳转后是否暂停播放。
     * @returns {Sprite} Sprite对象本身。
     */
    goto: function(indexOrName, pause){
        var total = this._frames.length,
            index = this.getFrameIndex(indexOrName);

        this.currentFrame = index < 0 ? 0 : index >= total ? total - 1 : index;
        this.paused = pause;
        this._firstRender = true;
        return this;
    },

    /**
     * 渲染方法。
     * @private
     */
    _render: function(renderer, delta){
        var lastFrameIndex = this.currentFrame, frameIndex;

        if(this._firstRender){
            frameIndex = lastFrameIndex;
            this._firstRender = false;
        }else{
            frameIndex = this._nextFrame(delta);
        }

        if(frameIndex != lastFrameIndex){
            this.currentFrame = frameIndex;
            var callback = this._frames[frameIndex].callback;
            callback && callback.call(this);
        }

        //NOTE: it will be deprecated, don't use it.
        if(this.onEnterFrame) this.onEnterFrame(frameIndex);

        this.drawable.init(this._frames[frameIndex]);
        Sprite.superclass._render.call(this, renderer, delta);
    },

    /**
     * @private
     */
    _nextFrame: function(delta){
        var frames = this._frames,
            total = frames.length,
            frameIndex = this.currentFrame,
            frame = frames[frameIndex],
            duration = frame.duration || this.interval,
            elapsed = this._frameElapsed;

        //calculate the current frame elapsed frames/time
        var value = (frameIndex == 0 && !this.drawable) ? 0 : elapsed + (this.timeBased ? delta : 1);
        elapsed = this._frameElapsed = value < duration ? value : 0;

        if(frame.stop || !this.loop && frameIndex >= total - 1){
            this.stop();
        }

        if(!this.paused && elapsed == 0){
            if(frame.next != null){
                //jump to the specified frame
                frameIndex = this.getFrameIndex(frame.next);
            }else if(frameIndex >= total - 1){
                //at the end of the frames, go back to first frame
                frameIndex = 0;
            }else if(this.drawable){
                //normal go forward to next frame
                frameIndex++;
            }
        }

        return frameIndex;
    },

    /**
     * 设置指定帧的回调函数。即每当播放头进入指定帧时调用callback函数。若callback为空，则会删除回调函数。
     * @param {Int|String} frame 要指定的帧的索引位置或别名。
     * @param {Function} callback 指定回调函数。
     * @returns {Sprite} 精灵本身。
     */
    setFrameCallback: function(frame, callback){
        frame = this.getFrame(frame);
        if(frame) frame.callback = callback;
        return this;
    },

    /**
     * 精灵动画的播放头进入新帧时的回调方法。默认值为null。此方法已废弃，请使用addFrameCallback方法。
     * @type Function
     * @deprecated
     */
    onEnterFrame: null

});

return Sprite;

});