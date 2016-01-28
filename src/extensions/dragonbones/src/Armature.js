(function(){
    var animation = dragonBones.use("animation");
    var events = dragonBones.use("events");
    var Slot = dragonBones.Slot;
    var Bone = dragonBones.Bone;

    function Armature(display) {
        Armature.superclass.constructor.call(this);
        this.animation = new animation.Animation(this);

        this._display = display;
        this._slotsZOrderChanged = false;
        this._slotList = [];
        this._boneList = [];
        this._eventList = [];
    }
    dragonBones.extends(Armature, events.EventDispatcher);

    Armature.prototype.getDisplay = function () {
        return this._display;
    };

    Armature.prototype.dispose = function () {
        if (!this.animation) {
            return;
        }

        this.animation.dispose();

        var i = this._slotList.length;
        while (i--) {
            this._slotList[i].dispose();
        }

        i = this._boneList.length;
        while (i--) {
            this._boneList[i].dispose();
        }

        this._slotList.length = 0;
        this._boneList.length = 0;
        this._eventList.length = 0;

        this._slotList = null;
        this._boneList = null;
        this._eventList = null;
        this._display = null;

        this.animation = null;
    };

    Armature.prototype.advanceTime = function (passedTime) {
        this.animation.advanceTime(passedTime);
        passedTime *= this.animation.timeScale;

        var i = this._boneList.length;
        while (i--) {
            this._boneList[i]._update();
        }
        i = this._slotList.length;
        var slot;
        while (i--) {
            slot = this._slotList[i];
            slot._update();
            if (slot._isDisplayOnStage) {
                var childArmature = slot.getChildArmature();
                if (childArmature) {
                    childArmature.advanceTime(passedTime);
                }
            }
        }

        if (this._slotsZOrderChanged) {
            this.updateSlotsZOrder();
            if (this.hasEventListener(events.ArmatureEvent.Z_ORDER_UPDATED)) {
                this.dispatchEvent(new events.ArmatureEvent(events.ArmatureEvent.Z_ORDER_UPDATED));
            }
        }

        if (this._eventList.length) {
            var length = this._eventList.length;
            for (i = 0; i < length; i++) {
                this.dispatchEvent(this._eventList[i]);
            }
            this._eventList.length = 0;
        }
    };

    Armature.prototype.getSlots = function (returnCopy) {
        if (typeof returnCopy === "undefined") { returnCopy = true; }
        return returnCopy ? this._slotList.concat() : this._slotList;
    };

    Armature.prototype.getBones = function (returnCopy) {
        if (typeof returnCopy === "undefined") { returnCopy = true; }
        return returnCopy ? this._boneList.concat() : this._boneList;
    };

    Armature.prototype.getSlot = function (slotName) {
        var i = this._slotList.length;
        while (i--) {
            if (this._slotList[i].name == slotName) {
                return this._slotList[i];
            }
        }
        return null;
    };

    Armature.prototype.getSlotByDisplay = function (display) {
        if (display) {
            var i = this._slotList.length;
            while (i--) {
                if (this._slotList[i].getDisplay() == display) {
                    return this._slotList[i];
                }
            }
        }
        return null;
    };

    Armature.prototype.removeSlot = function (slot) {
        if (!slot) {
            throw new Error();
        }

        if (this._slotList.indexOf(slot) >= 0) {
            slot.parent.removeChild(slot);
        } else {
            throw new Error();
        }
    };

    Armature.prototype.removeSlotByName = function (slotName) {
        if (!slotName) {
            return;
        }

        var slot = this.getSlot(slotName);
        if (slot) {
            this.removeSlot(slot);
        }
    };

    Armature.prototype.getBone = function (boneName) {
        var i = this._boneList.length;
        while (i--) {
            if (this._boneList[i].name == boneName) {
                return this._boneList[i];
            }
        }
        return null;
    };

    Armature.prototype.getBoneByDisplay = function (display) {
        var slot = this.getSlotByDisplay(display);
        return slot ? slot.parent : null;
    };

    Armature.prototype.removeBone = function (bone) {
        if (!bone) {
            throw new Error();
        }

        if (this._boneList.indexOf(bone) >= 0) {
            if (bone.parent) {
                bone.parent.removeChild(bone);
            } else {
                bone._setArmature(null);
            }
        } else {
            throw new Error();
        }
    };

    Armature.prototype.removeBoneByName = function (boneName) {
        if (!boneName) {
            return;
        }

        var bone = this.getBone(boneName);
        if (bone) {
            this.removeBone(bone);
        }
    };

    Armature.prototype.addChild = function (object, parentName) {
        if (!object) {
            throw new Error();
        }
        if (parentName) {
            var boneParent = this.getBone(parentName);
            if (boneParent) {
                boneParent.addChild(object);
            } else {
                throw new Error();
            }
        } else {
            if (object.parent) {
                object.parent.removeChild(object);
            }
            object._setArmature(this);
        }
    };

    Armature.prototype.updateSlotsZOrder = function () {
        this._slotList.sort(this.sortSlot);
        var i = this._slotList.length;
        var slot;
        while (i--) {
            slot = this._slotList[i];
            if (slot._isDisplayOnStage) {
                slot._displayBridge.addDisplay(this._display, -1);
            }
        }

        this._slotsZOrderChanged = false;
    };

    Armature.prototype._addDBObject = function (object) {
        if (object instanceof Slot) {
            var slot = object;
            if (this._slotList.indexOf(slot) < 0) {
                this._slotList[this._slotList.length] = slot;
            }
        } else if (object instanceof Bone) {
            var bone = object;
            if (this._boneList.indexOf(bone) < 0) {
                this._boneList[this._boneList.length] = bone;
                this._sortBoneList();
            }
        }
    };

    Armature.prototype._removeDBObject = function (object) {
        if (object instanceof Slot) {
            var slot = object;
            var index = this._slotList.indexOf(slot);
            if (index >= 0) {
                this._slotList.splice(index, 1);
            }
        } else if (object instanceof Bone) {
            var bone = object;
            index = this._boneList.indexOf(bone);
            if (index >= 0) {
                this._boneList.splice(index, 1);
            }
        }
    };

    Armature.prototype._sortBoneList = function () {
        var i = this._boneList.length;
        if (i == 0) {
            return;
        }
        var helpArray = [];
        var level;
        var bone;
        var boneParent;
        while (i--) {
            level = 0;
            bone = this._boneList[i];
            boneParent = bone;
            while (boneParent) {
                level++;
                boneParent = boneParent.parent;
            }
            helpArray[i] = { level: level, bone: bone };
        }

        helpArray.sort(this.sortBone);

        i = helpArray.length;
        while (i--) {
            this._boneList[i] = helpArray[i].bone;
        }
    };

    Armature.prototype._arriveAtFrame = function (frame, timelineState, animationState, isCross) {
        if (frame.event && this.hasEventListener(events.FrameEvent.ANIMATION_FRAME_EVENT)) {
            var frameEvent = new events.FrameEvent(events.FrameEvent.ANIMATION_FRAME_EVENT);
            frameEvent.animationState = animationState;
            frameEvent.frameLabel = frame.event;
            this._eventList.push(frameEvent);
        }

        if (frame.sound && Armature._soundManager.hasEventListener(events.SoundEvent.SOUND)) {
            var soundEvent = new events.SoundEvent(events.SoundEvent.SOUND);
            soundEvent.armature = this;
            soundEvent.animationState = animationState;
            soundEvent.sound = frame.sound;
            Armature._soundManager.dispatchEvent(soundEvent);
        }

        if (frame.action) {
            if (animationState.isPlaying) {
                this.animation.gotoAndPlay(frame.action);
            }
        }
    };

    Armature.prototype.sortSlot = function (slot1, slot2) {
        return slot1.getZOrder() < slot2.getZOrder() ? 1 : -1;
    };

    Armature.prototype.sortBone = function (object1, object2) {
        return object1.level < object2.level ? 1 : -1;
    };
    Armature._soundManager = events.SoundEventManager.getInstance();
    
    dragonBones.Armature = Armature;
})();