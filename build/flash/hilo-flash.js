/**
 * Hilo 1.1.7 for flashAdaptor
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(){
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @private
 * @class Flash渲染器。将可视对象以flash方式渲染出来。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/flash/FlashRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 */
var FlashRenderer = (function(){

var _stageStateList = ["x", "y", "scaleX", "scaleY", "rotation", "visible", "alpha"];
var _stateList = _stageStateList.concat(["pivotX", "pivotY", "width", "height", "depth"]);
var _textStateList = _stateList.concat(["text", "color", "textAlign", "outline", "lineSpacing", "font"]);
var n = 0;

var state = {
    View: _stateList,
    Stage: _stageStateList,
    Graphics: _stateList,
    Text: _textStateList
};

function createFid(target){
    return target.id + (n++);
}

return Hilo.Class.create(/** @lends FlashRenderer.prototype */{
    Extends: Hilo.Renderer,
    constructor: function(properties){
        FlashRenderer.superclass.constructor.call(this, properties);

        this.stage._ADD_TO_FLASH = true;
        this.stage.fid = createFid(this.stage);
        this.stage.flashType = "Stage";

        this.commands = properties.commands || [];
        this.commands.push("create", this.stage.fid, "Stage");
        this.commands.push("stageAddChild", this.stage.fid);
    },

    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        if(target == this.stage){
            return true;
        }

        target._lastState = target._lastState || {};
        //create
        if(!target._ADD_TO_FLASH){
            target._ADD_TO_FLASH = true;
            target.fid = createFid(target);

            if(target._drawTextLine){
                target.flashType = "Text";
            }
            else if(target.beginLinearGradientFill){
                target.flashType = "Graphics";
            }
            else if(target == this.stage){
                target.flashType = "Stage";
            }
            else{
                target.flashType = "View";
            }
            this.commands.push("create", target.fid, target.flashType);
        }

        return true;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        if(target == this.stage){
            return;
        }

        target._lastState = target._lastState || {};

        var lastParent = target._lastState.parent;
        var parent = target.parent;

        if(parent){
            if(!lastParent || parent.fid != lastParent.fid){
                this.commands.push("addChild", parent.fid, target.fid, target.depth);
            }
        }
        target._lastState.parent = target.parent;

        switch(target.flashType){
            case "Graphics":
                if(target.isDirty && target.flashGraphicsCommands && target.flashGraphicsCommands.length > 0){
                    this.commands.push("graphicsDraw", target.fid, target.flashGraphicsCommands.join(";"));
                    target.isDirty = false;
                }
                break;
            case "Text":
                break;
        }
    },

    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        var stateList = state[target.flashType];
        var lastState = target._lastState = target._lastState||{};

        if(stateList){
            for(var i = 0,l = stateList.length;i < l;i ++){
                var prop = stateList[i];
                var lastValue = lastState[prop];
                var value = target[prop];

                lastState[prop] = value;
                if(lastValue != value){
                    this.commands.push("setProp", target.fid, prop, value);
                }
            }

            //画图
            if(target.drawable && target.drawable.image && target.drawable.rect){
                var image = target.drawable.image;
                var rectStr = target.drawable.rect.join(",");

                if(rectStr != lastState.rectStr){
                    this.commands.push("setProp", target.fid, "rect", rectStr);
                }

                if(image.src != lastState.imageSrc) {
                    this.commands.push("setImage", target.fid, image.src);
                }

                lastState.rectStr = rectStr;
                lastState.imageSrc = image.src;
            }

            var background = target.background||"undefined";
            if(typeof background == "string" && background != lastState.background){
                this.commands.push("setProp", target.fid, "background", background);
                lastState.background = background;
            }
        }
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var parent = target.parent;
        if(parent){
            this.commands.push("removeChild", target.parent.fid, target.fid);
            if(target._lastState){
                target._lastState.parent = null;
            }
        }
    }
});

})();
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @private
 * @class FlashAdaptor
 * @module hilo/flash/FlashAdaptor
 * @requires hilo/core/Hilo
 * @requires hilo/view/Text
 * @requires hilo/view/Graphics
 * @requires hilo/media/WebAudio
 * @requires hilo/media/WebSound
 * @requires hilo/view/Stage
 * @requires hilo/flash/FlashRenderer
*/
var FlashAdaptor = (function(){

var scripts = document.scripts;
var selfScript = scripts[scripts.length - 1];
var scriptDir = selfScript.src.substring(0, selfScript.src.lastIndexOf('/') + 1);
var defaultSwf = scriptDir + 'hilo.swf';

var defaultOption = {
    url: defaultSwf,
    id: "hiloFlash",
    fps: 60,
    useFlashLoad:false,
    width: "100%",
    height: "100%"
};

var imageCallBacks = {};
var isFlashReady = false;
var flashCommands = [];

var Adaptor = {
    /**
     * 初始化flash
     * @public
     * @method init
     * @param {Object} option 参数option定义
     *      {String} option.url flash网址
     *      {String} option.fps  flash fps, 默认60
     *      {Boolean} option.forceFlash 强制flash模式
     *      {String}  option.id  flash id，默认 hiloFlash
     *      {Boolean} option.useFlashLoad  是否用flash加载图片,默认不用flash
     */
    init:function(option){
        var mixOption = {};
        Hilo.util.copy(mixOption, defaultOption);
        Hilo.util.copy(mixOption, window.hiloFlashOption||{});
        Hilo.util.copy(mixOption, option||{});

        var that = this;

        if(!Hilo.browser.supportCanvas || mixOption.forceFlash || location.search.indexOf("forceFlash") > -1){
            Hilo.isFlash = true;
            this._addFlashCallback();
            this._flashShim(mixOption);
        }
        else{
            Hilo.View.prototype.release = function(){
                this.removeFromParent();
            };
        }
    },
    setFps:function(fps){
        if(this._fps != fps){
            this._fps = fps;
            flashCommands.push("setFps", fps);
        }
    },
    _flashShim:function(option){
        var that = this;

        document.addEventListener = document.addEventListener || function(type, handler){
            document.attachEvent("on" + type, handler);
        };

        document.removeEventListener = document.removeEventListener || function(type, handler){
            document.detachEvent("on" + type, handler);
        };

        Array.prototype.indexOf = Array.prototype.indexOf||function(a){
            for(var i = 0, l = this.length;i > l;i ++){
                if(this[i] === a){
                    return i;
                }
            }
            return -1;
        };

        if(option.useFlashLoad){
            Hilo.ImageLoader.prototype.load = function(data){
                var me = this;
                Hilo.flashLoadImage(data.src, function(e){
                    me.onLoad(e.target);
                }, function(){
                    me.onError();
                });
            };
        }

        Hilo.Stage.prototype._initRenderer = function(properties){
            var canvas = this.canvas;
            if(typeof canvas === 'string') canvas = Hilo.getElement(canvas);
            if(canvas && canvas.id){
                option.id = canvas.id;
            }

            var container = properties.container;
            if(typeof container === 'string') container = Hilo.getElement(container);

            if(canvas && canvas.parentNode){
                container = container||canvas.parentNode;
                canvas.parentNode.removeChild(canvas);
            }

            if(!container) container = document.body;

            this.canvas = container;
            var width = this.width, height = this.height,
            viewport = this.updateViewport();
            if(!properties.width) width = (viewport && viewport.width) || 320;
            if(!properties.height) height = (viewport && viewport.height) || 480;

            that._insertSwf(Hilo.util.copy(option, {
                container:container,
                width:width * (this.scaleX||1),
                height:height * (this.scaleY||1)
            }));

            var props = {canvas:container, stage:this, commands:flashCommands};
            this.renderer = new FlashRenderer(props);
        };

        Hilo.Stage.prototype.addTo = function(domElement){
            var swf = this._swf;
            if(swf && swf.parentNode !== domElement){
                domElement.appendChild(swf);
            }
            return this;
        };

        var enableDOMEvent = Hilo.Stage.prototype.enableDOMEvent;
        Hilo.Stage.prototype.enableDOMEvent = function(type, enabled){
            var canvas = this.canvas;
            if(!canvas.addEventListener){
                canvas.addEventListener = function(type, handler){
                    canvas.attachEvent('on' + type, handler);
                };
                canvas.removeEventListener = function(type, handler){
                    canvas.detachEvent('on' + type, handler);
                };
            }

            return enableDOMEvent.call(this, type, enabled);
        };

        var onDOMEvent = Hilo.Stage.prototype._onDOMEvent;
        Hilo.Stage.prototype._onDOMEvent = function(e){
            onDOMEvent.call(this, e || fixEvent());
        };

        Hilo.View.prototype.release = function(){
            this.removeFromParent();
            if(this.fid){
                flashCommands.push("release", this.fid);
            }
        };

        Hilo.Text.prototype.render = function(renderer){
            renderer.draw(this);
        };

        Hilo.Graphics.prototype.render = function(renderer){
            renderer.draw(this);
        };

        var graphicsFuncs = [
            "lineStyle", "beginFill", "endFill",
            "beginBitmapFill", "beginPath", "closePath", "moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo",
            "drawRect", "drawRoundRectComplex", "drawRoundRect", "drawCircle", "drawEllipse", "cache", "uncache", "clear"
        ];

        //flashGraphicsCommands  command由";"分割 参数由"!"分割 参数中数组由":"分割
        for(var i = 0;i < graphicsFuncs.length;i ++){
            var funcName = graphicsFuncs[i];
            Hilo.Graphics.prototype[funcName] = function(funcName){
                return function(){
                    var args = Array.prototype.slice.call(arguments);
                    var arr = [funcName].concat(args).join("!");

                    this.flashGraphicsCommands = this.flashGraphicsCommands||[];
                    this.flashGraphicsCommands.push(arr);
                    this.isDirty = true;
                    return this;
                }
            }(funcName);
        }

        Hilo.Graphics.prototype.beginRadialGradientFill = function(x0, y0, r0, x1, y1, r1, colors, ratios){
            var cmd = ["beginRadialGradientFill", x0, y0, r0, x1, y1, r1, colors.join(":"), ratios.join(":")].join("!");
            this.flashGraphicsCommands = this.flashGraphicsCommands||[];
            this.flashGraphicsCommands.push(cmd);
            this.isDirty = true;
            return this;
        };

        Hilo.Graphics.prototype.beginLinearGradientFill = function(x0, y0, x1, y1, colors, ratios){
            var cmd = ["beginLinearGradientFill", x0, y0, x1, y1, colors.join(":"), ratios.join(":")].join("!");
            this.flashGraphicsCommands = this.flashGraphicsCommands||[];
            this.flashGraphicsCommands.push(cmd);
            this.isDirty = true;
            return this;
        };

        Hilo.Graphics.prototype.drawSVGPath = function(pathData){
            var me = this, addAction = me._addAction,
                path = pathData.split(/,| (?=[a-zA-Z])/);

            me.beginPath();
            for(var i = 0, len = path.length; i < len; i++){
                var str = path[i], cmd = str.charAt(0).toUpperCase(), p = str.substring(1).split(/,| /);
                if(p[0].length == 0) p.shift();

                switch(cmd){
                    case 'M':
                        me.moveTo(p[0], p[1]);
                        break;
                    case 'L':
                        me.lineTo(p[0], p[1]);
                        break;
                    case 'C':
                        me.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                        break;
                    case 'Z':
                        me.closePath();
                        break;
                }
            }
            return me;
        };

        Hilo.WebSound.removeAudio = function(source){
            var src = typeof source === 'string' ? source : source.src;
            var audio = this._audios[src];
            if(audio){
                audio.stop();
                audio.off();
                audio.release();
                this._audios[src] = null;
                delete this._audios[src];
            }
        };

        Hilo.WebAudio.isSupported = true;
        Hilo.WebAudio.enabled = true;
        Hilo.WebAudio.enable = function(){};

        Hilo.WebAudio.prototype._init = function(){
            this.fid = Hilo.getUid("audio");
            flashCommands.push("audio", "create", this.fid, this.src);
            if(this.autoPlay){
                this.play();
            }
        };

        Hilo.WebAudio.prototype.load = function(){
            flashCommands.push("audio", "load", this.fid);
            return this;
        };

        Hilo.WebAudio.prototype.play = function(){
            flashCommands.push("audio", "play", this.fid, this.loop?1:0);
            return this;
        };

        Hilo.WebAudio.prototype.pause = function(){
            flashCommands.push("audio", "pause", this.fid);
            return this;
        };

        Hilo.WebAudio.prototype.resume = function(){
            flashCommands.push("audio", "resume", this.fid);
            return this;
        };

        Hilo.WebAudio.prototype.stop = function(){
            flashCommands.push("audio", "stop", this.fid);
            return this;
        };

        Hilo.WebAudio.prototype.setVolume = function(volume){
            flashCommands.push("audio", "setVolume", this.fid, volume);
            return this;
        };

        Hilo.WebAudio.prototype.setMute = function(muted){
            flashCommands.push("audio", "setMute", this.fid, muted?1:0);
            return this;
        };

        Hilo.WebAudio.prototype.release = function(){
            flashCommands.push("audio", "release", this.fid);
            return this;
        };
    },
    _insertSwf:function(option){
        var that = this;
        var swf;
        var src = option.url;
        var id = option.id;
        var color = option.color||null;
        var fps = option.fps;
        var container = option.container;
        var width = option.width;
        var height = option.height;

        this.setFps(fps);

        if(window.attachEvent){
            var hasHTML = container.innerHTML;
            container.innerHTML =
            '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' +
            ' codebase="' + location.protocol + '//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0">' +
            '<param name="allowScriptAccess" value="always">' +
            '<param name="flashvars" value="id=' + id + '">' +
            '<param name="wmode" value="transparent">' +
            '<param name="bgcolor" value="' + color + '">' +
            '</object>' + hasHTML;
            var swf = container.getElementsByTagName("object")[0];
            swf.id = swf.name = id;
            swf["movie"] = src;
        }
        else{
            swf = document.createElement("embed");
            swf.setAttribute("src",src);
            swf.setAttribute("type","application/x-shockwave-flash");
            swf.setAttribute("allowScriptAccess","always");
            swf.setAttribute("allowFullScreen","true");
            swf.setAttribute("bgcolor",color);
            swf.setAttribute("pluginspage","http://www.adobe.com/go/getflashplayer_cn");
            swf.setAttribute("wmode", "transparent");
            swf.setAttribute("FlashVars", "debug=0");
            container.appendChild(swf);
        }
        swf.name = id;
        swf.width = width;
        swf.height = height;
        swf.id = id;

        this._swf = swf;

        Hilo.Stage.prototype.tick = function(delta){
            if(!this.paused){
                this._render(this.renderer, delta);
                that.tick();
            }
        };

        return swf;
    },
    tick:function(){
        if(isFlashReady && flashCommands.length > 0){
            this._swf.CallFunction(
                '<invoke name="executeCommand" returntype="javascript"><arguments><string>'
                + flashCommands.join("√") + '</string></arguments></invoke>'
            );
            // console.log("executeCommand", flashCommands.join(","));
            flashCommands.length = 0;
        }
    },
    _addFlashCallback:function(type){
        var that = this;
        Hilo.__flashFireEvent = function(type, key){
            if(type.indexOf("key") > -1 && document.fireEvent){
                var e = document.createEventObject();
                e.keyCode = key;
                document.fireEvent("on" + type, e);
            }
            else if(that._swf && that._swf.fireEvent){
                that._swf.fireEvent("on" + type);
            }
        };

        var flashImageCache = that.__flashImageCache = {};
        var flashLoaderCache = {};
        /*
         * 加载flash图片
         * @method flashLoadImage
        */
        Hilo.flashLoadImage = function(src, successHandler, errorHandler){
            if(flashImageCache[src]){
                successHandler(flashImageCache[src]);
                return;
            }
            imageCallBacks[src] = imageCallBacks[src]||[];
            imageCallBacks[src].push([successHandler, errorHandler||successHandler]);

            if(!flashLoaderCache[src]){
                flashLoaderCache[src] = true;
                flashCommands.push("loadImage", src);
            }
        };

        /*
         *flash 可以调接口时回调函数
        */
        Hilo.__flashUnlock = function(){
            isFlashReady = true;
        };

        /*
         * falsh图片加载完回调函数
         * @param {String} src:图片地址
         * @param {Number} errorCode: 0：图片加载成功， 1:图片加载失败
         * @param {Number} width:图片宽
         * @param {Number} height:图片高
        */
        Hilo.__flashImageCallBack = function(src, errorCode, width, height){
            // console.log("imageCallBack", src, errorCode);
            var arr = imageCallBacks[src];
            if(arr && arr.length > 0){
                var e = {
                     target:{
                        src:src,
                        width:width,
                        height:height,
                        isFlash:true,
                        tagName:"img"
                    },
                    errorCode:errorCode
                };

                if(errorCode == 0){
                    flashImageCache[src] = e;
                }

                for(var i = 0, l = arr.length;i < l;i ++){
                    arr[i][errorCode](e);
                }
                arr.length = 0;
            }
        }
    }
};

function fixEvent(){
    var event = window.event;
    var e = {
        rawEvent:event,
        type:event.type,
        target:event.srcElememt,
        preventDefault:function(){
            event.returnValue = false;
        },
        stopPropagation:function(){
            event.cancelBubble = true;
        }
    };

    if(event.type.indexOf("mouse") != -1){
        e.clientX = event.clientX;
        e.clientY = event.clientY;
        if(event.type == "mouseover")
            e.relatedTarget = event.fromElement;
        else if(event.type == "mouseout")
            e.relatedTarget = event.toElement;
    }
    else if(event.type.indexOf("key") != -1){
        e.charCode = e.keyCode = event.keyCode;
    }
    return e;
}

if(selfScript.getAttribute('data-auto') === 'true') Adaptor.init();
return Hilo.FlashAdaptor = Adaptor;

})();
})();
