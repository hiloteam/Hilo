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