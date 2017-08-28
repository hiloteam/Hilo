/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * <iframe src='../../../examples/Sprite.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Sprite animation class.
 * @augments View
 * @module hilo/view/Sprite
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @param properties Properties parameters for creating object, include all writable properties of this class, also include:
 * <ul>
 * <li><b>frames</b> - Sprite animation frames data object.</li>
 * </ul>
 * @property {number} currentFrame Current showing frame index, range from 0, readoly!
 * @property {boolean} paused Is sprite paused, default value is false.
 * @property {boolean} loop Is sprite play in loop, default value is false.
 * @property {boolean} timeBased Is sprite animate base on time, default value is false (base on frame).
 * @property {number} interval Interval between sprite animation frames. If timeBased is true, measured in ms, otherwise, measured in frames.
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

    _frames: null, //所有帧的集合 Collection of all frames
    _frameNames: null, //带名字name的帧的集合 Collection of frames that with name
    _frameElapsed: 0, //当前帧持续的时间或帧数 Elapsed time of current frame.
    _firstRender: true, //标记是否是第一次渲染 Is the first render.

    paused: false,
    loop: true,
    timeBased: false,
    interval: 1,
    currentFrame: 0, //当前帧的索引 Index of current frame

    /**
     * @language=en
     * Return the total amount of sprite animation frames.
     * @returns {Uint} The total amount of frames.
     */
    getNumFrames: function(){
        return this._frames ? this._frames.length : 0;
    },

    /**
     * @language=en
     * Add frame into sprite.
     * @param {Object} frame Frames to add into.
     * @param {Int} startIndex The index to start adding frame, if is not given, add at the end of sprite.
     * @returns {Sprite} Sprite itself.
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
     * @language=en
     * Set the frame on the given index.
     * @param {Object} frame The frame data to set on that index.
     * @param {Int} index Index of the frame to set.
     * @returns {Sprite} Sprite itself.
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
     * @language=en
     * Get the frame of given parameter from sprite.
     * @param {Object} indexOrName The index or name of the frame.
     * @returns {Object} The sprite object.
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
     * @language=en
     * Get frame index from sprite.
     * @param {Object} frameValue Index or name of the frame.
     * @returns {Object} Sprite frame object.
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
     * @language=en
     * Play sprite.
     * @returns {Sprite} The Sprite object.
     */
    play: function(){
        this.paused = false;
        return this;
    },

    /**
     * @language=en
     * Pause playing sprite.
     * @returns {Sprite} The Sprite object.
     */
    stop: function(){
        this.paused = true;
        return this;
    },

    /**
     * @language=en
     * Jump to an assigned frame.
     * @param {Object} indexOrName Index or name of an frame to jump to.
     * @param {Boolean} pause Does pause after jumping to the new index.
     * @returns {Sprite} The Sprite object.
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
     * @language=en
     * Render function.
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
     * @language=en
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
     * @language=en
     * Set a callback on an assigned frame. Every time assigned frame is played, invoke the callback function. If callback is empty, callback function will be removed.
     * @param {Int|String} frame Index or name of the assigned frame.
     * @param {Function} callback Callback function.
     * @returns {Sprite} The Sprite object.
     */
    setFrameCallback: function(frame, callback){
        frame = this.getFrame(frame);
        if(frame) frame.callback = callback;
        return this;
    },

    /**
     * @language=en
     * Callback function on when sprite enter a new frame. default value is null. Note: this function is obsolete, use addFrameCallback funciton instead.
     * @type Function
     * @deprecated
     */
    onEnterFrame: null

});

window.Hilo.Sprite = Sprite;
})(window);