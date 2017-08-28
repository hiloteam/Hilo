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
 * @class TextureAtlas纹理集是将许多小的纹理图片整合到一起的一张大图。这个类可根据一个纹理集数据读取纹理小图、精灵动画等。
 * @param {Object} atlasData 纹理集数据。它可包含如下数据：
 * <ul>
 * <li><b>image</b> - 纹理集图片。必需。</li>
 * <li><b>width</b> - 纹理集图片宽度。若frames数据为Object时，此属性必需。</li>
 * <li><b>height</b> - 纹理集图片高度。若frames数据为Object时，此属性必需。</li>
 * <li><b>frames</b> - 纹理集帧数据，可以是Array或Object。必需。
 * <ul>
 * <li>若为Array，则每项均为一个纹理图片帧数据，如：[[0, 0, 50, 50], [0, 50, 50, 50]。</li>
 * <li>若为Object，则需包含frameWidth(帧宽)、frameHeight(帧高)、numFrames(帧数) 属性。</li>
 * </ul>
 * </li>
 * <li><b>sprites</b> - 纹理集精灵动画定义，其每个值均定义一个精灵。为Object对象。可选。
 * <ul>
 * <li>若为Number，即此精灵只包含一帧，此帧为帧数据中索引为当前值的帧。如：sprites:{'foo':1}。</li>
 * <li>若为Array，则每项均为一个帧的索引值。如：sprites:{'foo':[0, 1, 2, 3]}。</li>
 * <li>若为Object，则需包含from(起始帧索引值)、to(末帧索引值) 属性。</li>
 * </ul>
 * </li>
 * </ul>
 * @module hilo/util/TextureAtlas
 * @requires hilo/core/Class
 */
var TextureAtlas = (function(){

return Class.create(/** @lends TextureAtlas.prototype */{
    constructor: function(atlasData){
        this._frames = parseTextureFrames(atlasData);
        this._sprites = parseTextureSprites(atlasData, this._frames);
    },

    _frames: null,
    _sprites: null,

    /**
     * @language=en
     * 获取指定索引位置index的帧数据。
     * @param {Int} index 要获取帧的索引位置。
     * @returns {Object} 帧数据。
     */
    getFrame: function(index){
        var frames = this._frames;
        return frames && frames[index];
    },

    /**
     * @language=en
     * 获取指定id的精灵数据。
     * @param {String} id 要获取精灵的id。
     * @returns {Object} 精灵数据。
     */
    getSprite: function(id){
        var sprites = this._sprites;
        return sprites && sprites[id];
    },

    Statics: /** @lends TextureAtlas */ {
        /**
         * @language=en
         * Shorthand method to create spirte frames
         * @param {String|Array} name Name of one animation|a group of animation
         * @param {String} frames Frames message, eg:"0-5" means frame 0 to frame 5.
         * @param {Number} w The width of each frame.
         * @param {Number} h The height of each frame.
         * @param {Bollean} loop Is play in loop.
         * @param {Number} duration The time between each frame. default value is 1 (Frame), but if timeBased is true, default value will be duration(milli-second).
         * @example
         *  //demo1 make one animation
         *  createSpriteFrames("walk", "0-5,8,9", meImg, 55, 88, true, 1);
         *  //demo2 make a group of animation
         *  createSpriteFrames([
         *    ["walk", "0-5,8,9", meImg, 55, 88, true, 1],
         *    ["jump", "0-5", meImg, 55, 88, false, 1]
         *  ]);
        */
        createSpriteFrames:function(name, frames, img, w, h, loop, duration){
            var i, l;
            if(Object.prototype.toString.call(name) === "[object Array]"){
                var res = [];
                for(i = 0, l = name.length;i < l;i ++){
                    res = res.concat(this.createSpriteFrames.apply(this, name[i]));
                }
                return res;
            }
            else{
                if(typeof(frames) === "string"){
                    var all = frames.split(",");
                    frames = [];
                    for(var j = 0, jl = all.length;j < jl;j ++){
                        var temp = all[j].split("-");
                        if(temp.length == 1){
                            frames.push(parseInt(temp[0]));
                        }
                        else{
                            for(i = parseInt(temp[0]), l = parseInt(temp[1]);i <= l;i ++){
                                frames.push(i);
                            }
                        }
                    }
                }

                var col = Math.floor(img.width/w);
                for(i = 0;i < frames.length;i ++){
                    var n = frames[i];
                    frames[i] = {
                        rect:[w*(n%col), h*Math.floor(n/col), w, h],
                        image:img,
                        duration:duration
                    };
                }
                frames[0].name = name;
                if(loop){
                    frames[frames.length-1].next = name;
                }
                else{
                    frames[frames.length-1].stop = true;
                }
                return frames;
            }
        }
    }
});

/**
 * @language=en
 * Parse texture frames
 * @private
 */
function parseTextureFrames(atlasData){
    var i, len;
    var frameData = atlasData.frames;
    if(!frameData) return null;

    var frames = [], obj;

    if(frameData instanceof Array){ //frames by array
        for(i = 0, len = frameData.length; i < len; i++){
            obj = frameData[i];
            frames[i] = {
                image: atlasData.image,
                rect: obj
            };
        }
    }else{ //frames by object
        var frameWidth = frameData.frameWidth;
        var frameHeight = frameData.frameHeight;
        var cols = atlasData.width / frameWidth | 0;
        var rows = atlasData.height / frameHeight | 0;
        var numFrames = frameData.numFrames || cols * rows;
        for(i = 0; i < numFrames; i++){
            frames[i] = {
                image: atlasData.image,
                rect: [i%cols*frameWidth, (i/cols|0)*frameHeight, frameWidth, frameHeight]
            };
        }
    }

    return frames;
}

/**
 * @language=en
 * Parse texture sprites
 * @private
 */
function parseTextureSprites(atlasData, frames){
    var i, len;
    var spriteData = atlasData.sprites;
    if(!spriteData) return null;

    var sprites = {}, sprite, spriteFrames, spriteFrame;

    for(var s in spriteData){
        sprite = spriteData[s];
        if(isNumber(sprite)){ //single frame
            spriteFrames = translateSpriteFrame(frames[sprite]);
        }else if(sprite instanceof Array){ //frames by array
            spriteFrames = [];
            for(i = 0, len = sprite.length; i < len; i++){
                var spriteObj = sprite[i], frameObj;
                if(isNumber(spriteObj)){
                    spriteFrame = translateSpriteFrame(frames[spriteObj]);
                }else{
                    frameObj = spriteObj.rect;
                    if(isNumber(frameObj)) frameObj = frames[spriteObj.rect];
                    spriteFrame = translateSpriteFrame(frameObj, spriteObj);
                }
                spriteFrames[i] = spriteFrame;
            }
        }else{ //frames by object
            spriteFrames = [];
            for(i = sprite.from; i <= sprite.to; i++){
                spriteFrames[i - sprite.from] = translateSpriteFrame(frames[i], sprite[i]);
            }
        }
        sprites[s] = spriteFrames;
    }

    return sprites;
}

function translateSpriteFrame(frameObj, spriteObj){
    var spriteFrame = {
        image: frameObj.image,
        rect: frameObj.rect
    };

    if(spriteObj){
        spriteFrame.name = spriteObj.name || null;
        spriteFrame.duration = spriteObj.duration || 0;
        spriteFrame.stop = !!spriteObj.stop;
        spriteFrame.next = spriteObj.next || null;
    }

    return spriteFrame;
}

function isNumber(value){
    return typeof value === 'number';
}

})();
window.Hilo.TextureAtlas = TextureAtlas;
})(window);