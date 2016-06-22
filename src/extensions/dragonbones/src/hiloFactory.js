/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * HiloSlot
 */
(function(superClass) {
    var RAD2DEG = 180/Math.PI;
    var TextureAtlas = dragonBones.TextureAtlas;
    var HiloSlot = function() {
        superClass.call(this, this);
        this._display = null;
    };

    __extends(HiloSlot, superClass, {
        dispose: function() {
            if (this._displayList) {
                var length = this._displayList.length;
                for (var i = 0; i < length; i++) {
                    var content = this._displayList[i];
                    if (content instanceof Armature) {
                        content.dispose();
                    }
                }
            }

            superClass.prototype.dispose();
            this._display = null;
        },
        _updateDisplay: function(value) {
            this._display = value;
        },
        _getDisplayIndex: function() {
            if (this._display && this._display.parent) {
                return this._display.parent.getChildIndex(this._display);
            }
            return -1;
        },
        _addDisplayToContainer: function(container, index) {
            if (this._display && container) {
                if(index){
                    container.addChildAt(this._display, index);
                }
                else{
                    container.addChild(this._display);
                }
            }
        },
        _removeDisplayFromContainer: function() {
            if (this._display && this._display.parent) {
                this._display.parent.removeChild(this._display);
            }
        },
        _updateTransform: function() {
            if (this._display) {
                this._display.x = this._global.x;
                this._display.y = this._global.y;
                this._display.scaleX = this._global.scaleX;
                this._display.scaleY = this._global.scaleY;
                this._display.rotation = this._global.skewX * RAD2DEG;
            }
        },
        _updateDisplayVisible: function(value) {
            if (this._display && this._parent) {
                this._display.visible = this._parent._visible && this._visible && value;
            }
        },
        _updateDisplayColor: function(aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier, colorChange) {
            superClass.prototype._updateDisplayColor.call(this, aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier, colorChange);
            if (this._display) {
                this._display.alpha = aMultiplier;
            }
        },
        _updateDisplayBlendMode: function(value) {
            // if (this._display && value) {
            //     this._display.blendMode = value;
            // }
        },
        _calculateRelativeParentTransform: function() {
            this._global.scaleX = this._origin.scaleX * this._offset.scaleX;
            this._global.scaleY = this._origin.scaleY * this._offset.scaleY;
            this._global.skewX = this._origin.skewX + this._offset.skewX;
            this._global.skewY = this._origin.skewY + this._offset.skewY;
            this._global.x = this._origin.x + this._offset.x + this._parent._tweenPivot.x;
            this._global.y = this._origin.y + this._offset.y + this._parent._tweenPivot.y;

            if (this._displayDataList &&
                this._currentDisplayIndex >= 0 &&
                this._displayDataList[this._currentDisplayIndex] &&
                TextureAtlas.rotatedDic[this._displayDataList[this._currentDisplayIndex].name] == 1) {
                this._global.skewX -= 1.57;
                this._global.skewY -= 1.57;
            }
        }
    });

    dragonBones.HiloSlot = HiloSlot;
})(dragonBones.Slot);

/**
 * HiloFactory
 */
(function(superClass){
    var Armature = dragonBones.Armature;
    var HiloSlot = dragonBones.HiloSlot;

    var HiloFactory = function(){
        superClass.call(this, this);
    };
    __extends(HiloFactory, superClass, {
        _generateArmature:function(){
            var armature = new Armature(new Hilo.Container);
            return armature;
        },
        _generateSlot:function(){
            var slot = new HiloSlot();
            return slot;
        },
        _generateDisplay:function(textureAtlas, fullName, pivotX, pivotY){
            var texture = textureAtlas.getTexture(fullName);
            var region = texture.region;
            var bitmap = new Hilo.Bitmap({
                image:textureAtlas.texture,
                rect:[region.x, region.y, region.width, region.height]
            });

            if(isNaN(pivotX)||isNaN(pivotY))
            {
                var subTextureFrame = textureAtlas.getFrame(fullName);
                if(subTextureFrame != null)
                {
                    pivotX = subTextureFrame.width/2;
                    pivotY = subTextureFrame.height/2;
                }
                else
                {
                    pivotX = texture.region.width/2;
                    pivotY = texture.region.height/2;
                }
            }
            bitmap.pivotX = pivotX;
            bitmap.pivotY = pivotY;
            return bitmap;
        }
    });

    dragonBones.HiloFactory = HiloFactory;
}(dragonBones.BaseFactory));

dragonBones.tick = function(dt){
    dragonBones.WorldClock.clock.advanceTime(dt * 0.001);
};