(function(){
    var geom = dragonBones.use("geom");
    var events = dragonBones.use("events");
    var Slot = dragonBones.Slot;
    function Bone() {
        Bone.superclass.constructor.call(this);
        this._children = [];
        this._scaleType = 2;

        this._tweenPivot = new geom.Point();

        this.scaleMode = 1;
    }
    dragonBones.extends(Bone, dragonBones.DBObject);

    Bone.prototype.setVisible = function (value) {
        if (this._visible != value) {
            this._visible = value;
            var i = this._children.length;
            while (i--) {
                var child = this._children[i];
                if (child instanceof Slot) {
                    (child)._updateVisible(this._visible);
                }
            }
        }
    };

    Bone.prototype._setArmature = function (value) {
        Bone.superclass._setArmature.call(this, value);
        var i = this._children.length;
        while (i--) {
            this._children[i]._setArmature(this.armature);
        }
    };

    Bone.prototype.dispose = function () {
        if (!this._children) {
            return;
        }
        Bone.superclass.dispose.call(this);

        var i = this._children.length;
        while (i--) {
            this._children[i].dispose();
        }
        this._children.length = 0;

        this._children = null;
        this._tweenPivot = null;

        this.slot = null;
    };

    Bone.prototype.contains = function (child) {
        if (!child) {
            throw new Error();
        }
        if (child == this) {
            return false;
        }
        var ancestor = child;
        while (!(ancestor == this || ancestor == null)) {
            ancestor = ancestor.parent;
        }
        return ancestor == this;
    };

    Bone.prototype.addChild = function (child) {
        if (!child) {
            throw new Error();
        }

        if (child == this || (child instanceof Bone && (child).contains(this))) {
            throw new Error("An Bone cannot be added as a child to itself or one of its children (or children's children, etc.)");
        }

        if (child.parent) {
            child.parent.removeChild(child);
        }
        this._children[this._children.length] = child;
        child._setParent(this);
        child._setArmature(this.armature);

        if (!this.slot && child instanceof Slot) {
            this.slot = child;
        }
    };

    Bone.prototype.removeChild = function (child) {
        if (!child) {
            throw new Error();
        }

        var index = this._children.indexOf(child);
        if (index >= 0) {
            this._children.splice(index, 1);
            child._setParent(null);
            child._setArmature(null);

            if (child == this.slot) {
                this.slot = null;
            }
        } else {
            throw new Error();
        }
    };

    Bone.prototype.getSlots = function () {
        var slotList = [];
        var i = this._children.length;
        while (i--) {
            if (this._children[i] instanceof Slot) {
                slotList.unshift(this._children[i]);
            }
        }
        return slotList;
    };

    Bone.prototype._arriveAtFrame = function (frame, timelineState, animationState, isCross) {
        if (frame) {
            var mixingType = animationState.getMixingTransform(name);
            if (animationState.displayControl && (mixingType == 2 || mixingType == -1)) {
                if (!this.displayController || this.displayController == animationState.name) {
                    var tansformFrame = frame;
                    if (this.slot) {
                        var displayIndex = tansformFrame.displayIndex;
                        if (displayIndex >= 0) {
                            if (!isNaN(tansformFrame.zOrder) && tansformFrame.zOrder != this.slot._tweenZorder) {
                                this.slot._tweenZorder = tansformFrame.zOrder;
                                this.armature._slotsZOrderChanged = true;
                            }
                        }
                        this.slot._changeDisplay(displayIndex);
                        this.slot._updateVisible(tansformFrame.visible);
                    }
                }
            }

            if (frame.event && this.armature.hasEventListener(events.FrameEvent.BONE_FRAME_EVENT)) {
                var frameEvent = new events.FrameEvent(events.FrameEvent.BONE_FRAME_EVENT);
                frameEvent.bone = this;
                frameEvent.animationState = animationState;
                frameEvent.frameLabel = frame.event;
                this.armature._eventList.push(frameEvent);
            }

            if (frame.sound && Bone._soundManager.hasEventListener(events.SoundEvent.SOUND)) {
                var soundEvent = new events.SoundEvent(events.SoundEvent.SOUND);
                soundEvent.armature = this.armature;
                soundEvent.animationState = animationState;
                soundEvent.sound = frame.sound;
                Bone._soundManager.dispatchEvent(soundEvent);
            }

            if (frame.action) {
                for(var index = 0, l = this._children.length;index < l;index ++){
                    if (this._children[index] instanceof Slot) {
                        var childArmature = (this._children[index]).getChildArmature();
                        if (childArmature) {
                            childArmature.animation.gotoAndPlay(frame.action);
                        }
                    }
                }
            }
        } else {
            if (this.slot) {
                this.slot._changeDisplay(-1);
            }
        }
    };

    Bone.prototype._updateColor = function (aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier, isColorChanged) {
        if (isColorChanged || this._isColorChanged) {
            this.slot._displayBridge.updateColor(aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier);
        }
        this._isColorChanged = isColorChanged;
    };
    Bone._soundManager = events.SoundEventManager.getInstance();
    dragonBones.Bone = Bone;
})();