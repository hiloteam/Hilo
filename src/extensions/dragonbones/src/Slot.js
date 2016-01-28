(function(){
    function Slot(displayBridge) {
        Slot.superclass.constructor.call(this);
        this._displayBridge = displayBridge;
        this._displayList = [];
        this._displayIndex = -1;
        this._scaleType = 1;

        this._originZOrder = 0;
        this._tweenZorder = 0;
        this._offsetZOrder = 0;

        this._isDisplayOnStage = false;
        this._isHideDisplay = false;
    }
    dragonBones.extends(Slot, dragonBones.DBObject);

    Slot.prototype.getZOrder = function () {
        return this._originZOrder + this._tweenZorder + this._offsetZOrder;
    };

    Slot.prototype.setZOrder = function (value) {
        if (this.getZOrder() != value) {
            this._offsetZOrder = value - this._originZOrder - this._tweenZorder;
            if (this.armature) {
                this.armature._slotsZOrderChanged = true;
            }
        }
    };

    Slot.prototype.getDisplay = function () {
        var display = this._displayList[this._displayIndex];
        if (display instanceof dragonBones.Armature) {
            return (display).getDisplay();
        }
        return display;
    };
    Slot.prototype.setDisplay = function (value) {
        this._displayList[this._displayIndex] = value;
        this._setDisplay(value);
    };

    Slot.prototype.getChildArmature = function () {
        var display = this._displayList[this._displayIndex];
        if (display instanceof dragonBones.Armature) {
            return display;
        }
        return null;
    };
    Slot.prototype.setChildArmature = function (value) {
        this._displayList[this._displayIndex] = value;
        if (value) {
            this._setDisplay(value.getDisplay());
        }
    };

    Slot.prototype.getDisplayList = function () {
        return this._displayList;
    };
    Slot.prototype.setDisplayList = function (value) {
        if (!value) {
            throw new Error();
        }
        var i = this._displayList.length = value.length;
        while (i--) {
            this._displayList[i] = value[i];
        }
        if (this._displayIndex >= 0) {
            var displayIndexBackup = this._displayIndex;
            this._displayIndex = -1;
            this._changeDisplay(displayIndexBackup);
        }
    };

    Slot.prototype._setDisplay = function (display) {
        if (this._displayBridge.getDisplay()) {
            this._displayBridge.setDisplay(display);
        } else {
            this._displayBridge.setDisplay(display);
            if (this.armature) {
                this._displayBridge.addDisplay(this.armature.getDisplay(), -1);
                this.armature._slotsZOrderChanged = true;
            }
        }

        this.updateChildArmatureAnimation();

        if (!this._isHideDisplay && this._displayBridge.getDisplay()) {
            this._isDisplayOnStage = true;
        } else {
            this._isDisplayOnStage = false;
        }
    };

    Slot.prototype._changeDisplay = function (displayIndex) {
        if (displayIndex < 0) {
            if (!this._isHideDisplay) {
                this._isHideDisplay = true;
                this._displayBridge.removeDisplay();
                this.updateChildArmatureAnimation();
            }
        } else {
            if (this._isHideDisplay) {
                this._isHideDisplay = false;
                var changeShowState = true;
                if (this.armature) {
                    this._displayBridge.addDisplay(this.armature.getDisplay(), -1);
                    this.armature._slotsZOrderChanged = true;
                }
            }

            var length = this._displayList.length;
            if (displayIndex >= length && length > 0) {
                displayIndex = length - 1;
            }
            if (this._displayIndex != displayIndex) {
                this._displayIndex = displayIndex;

                var display = this._displayList[this._displayIndex];
                if (display instanceof dragonBones.Armature) {
                    this._setDisplay((display).getDisplay());
                } else {
                    this._setDisplay(display);
                }

                if (this._dislayDataList && this._displayIndex < this._dislayDataList.length) {
                    this.origin.copy(this._dislayDataList[this._displayIndex].transform);
                }
            } else if (changeShowState) {
                this.updateChildArmatureAnimation();
            }
        }

        if (!this._isHideDisplay && this._displayBridge.getDisplay()) {
            this._isDisplayOnStage = true;
        } else {
            this._isDisplayOnStage = false;
        }
    };

    Slot.prototype.setVisible = function (value) {
        if (value != this._visible) {
            this._visible = value;
            this._updateVisible(this._visible);
        }
    };

    Slot.prototype._setArmature = function (value) {
        Slot.superclass._setArmature.call(this, value);
        if (this.armature) {
            this.armature._slotsZOrderChanged = true;
            this._displayBridge.addDisplay(this.armature.getDisplay(), -1);
        } else {
            this._displayBridge.removeDisplay();
        }
    };

    Slot.prototype.dispose = function () {
        if (!this._displayBridge) {
            return;
        }
        Slot.superclass.dispose.call(this);

        this._displayBridge.dispose();
        this._displayList.length = 0;

        this._displayBridge = null;
        this._displayList = null;
        this._dislayDataList = null;
    };

    Slot.prototype._update = function () {
        Slot.superclass._update.call(this);
        if (this._isDisplayOnStage) {
            var pivotX = this.parent._tweenPivot.x;
            var pivotY = this.parent._tweenPivot.y;
            if (pivotX || pivotY) {
                var parentMatrix = this.parent._globalTransformMatrix;
                this._globalTransformMatrix.tx += parentMatrix.a * pivotX + parentMatrix.c * pivotY;
                this._globalTransformMatrix.ty += parentMatrix.b * pivotX + parentMatrix.d * pivotY;
            }

            this._displayBridge.updateTransform(this._globalTransformMatrix, this.global);
        }
    };

    Slot.prototype._updateVisible = function (value) {
        this._displayBridge.setVisible(this.parent.getVisible() && this._visible && value);
    };

    Slot.prototype.updateChildArmatureAnimation = function () {
        var childArmature = this.getChildArmature();

        if (childArmature) {
            if (this._isHideDisplay) {
                childArmature.animation.stop();
                childArmature.animation._lastAnimationState = null;
            } else {
                var lastAnimationName = this.armature ? this.armature.animation.getLastAnimationName() : null;
                if (lastAnimationName && childArmature.animation.hasAnimation(lastAnimationName)) {
                    childArmature.animation.gotoAndPlay(lastAnimationName);
                } else {
                    childArmature.animation.play();
                }
            }
        }
    };
    dragonBones.Slot = Slot;
})();