(function(){
	var ns = dragonBones.use("animation");
    var AnimationState = ns.AnimationState;
    
	function Animation(armature) {
        this._armature = armature;
        this._animationLayer = [];
        this._isPlaying = false;

        this.animationNameList = [];
        this.tweenEnabled = true;
        this.timeScale = 1;
    }
    Animation.prototype.getLastAnimationName = function () {
        return this._lastAnimationState ? this._lastAnimationState.name : null;
    };

    Animation.prototype.getLastAnimationState = function () {
        return this._lastAnimationState;
    };

    Animation.prototype.getAnimationDataList = function () {
        return this._animationDataList;
    };
    Animation.prototype.setAnimationDataList = function (value) {
        this._animationDataList = value;
        this.animationNameList.length = 0;
        for(var index = 0, l = this._animationDataList.length;index < l;index ++){
            this.animationNameList[this.animationNameList.length] = this._animationDataList[index].name;
        }
    };

    Animation.prototype.getIsPlaying = function () {
        return this._isPlaying && !this.getIsComplete();
    };

    Animation.prototype.getIsComplete = function () {
        if (this._lastAnimationState) {
            if (!this._lastAnimationState.isComplete) {
                return false;
            }
            var j = this._animationLayer.length;
            while (j--) {
                var animationStateList = this._animationLayer[j];
                var i = animationStateList.length;
                while (i--) {
                    if (!animationStateList[i].isComplete) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    };

    Animation.prototype.dispose = function () {
        if (!this._armature) {
            return;
        }
        this.stop();
        var i = this._animationLayer.length;
        while (i--) {
            var animationStateList = this._animationLayer[i];
            var j = animationStateList.length;
            while (j--) {
                AnimationState._returnObject(animationStateList[j]);
            }
            animationStateList.length = 0;
        }
        this._animationLayer.length = 0;
        this.animationNameList.length = 0;

        this._armature = null;
        this._animationLayer = null;
        this._animationDataList = null;
        this.animationNameList = null;
    };

    Animation.prototype.gotoAndPlay = function (animationName, fadeInTime, duration, loop, layer, group, fadeOutMode, displayControl, pauseFadeOut, pauseFadeIn) {
        if (typeof fadeInTime === "undefined") { fadeInTime = -1; }
        if (typeof duration === "undefined") { duration = -1; }
        if (typeof loop === "undefined") { loop = NaN; }
        if (typeof layer === "undefined") { layer = 0; }
        if (typeof group === "undefined") { group = null; }
        if (typeof fadeOutMode === "undefined") { fadeOutMode = Animation.SAME_LAYER_AND_GROUP; }
        if (typeof displayControl === "undefined") { displayControl = true; }
        if (typeof pauseFadeOut === "undefined") { pauseFadeOut = true; }
        if (typeof pauseFadeIn === "undefined") { pauseFadeIn = true; }
        if (!this._animationDataList) {
            return null;
        }
        var i = this._animationDataList.length;
        var animationData;
        while (i--) {
            if (this._animationDataList[i].name == animationName) {
                animationData = this._animationDataList[i];
                break;
            }
        }
        if (!animationData) {
            return null;
        }

        this._isPlaying = true;

        fadeInTime = fadeInTime < 0 ? (animationData.fadeInTime < 0 ? 0.3 : animationData.fadeInTime) : fadeInTime;

        var durationScale;
        if (duration < 0) {
            durationScale = animationData.scale < 0 ? 1 : animationData.scale;
        } else {
            durationScale = duration / animationData.duration;
        }

        loop = isNaN(loop) ? animationData.loop : loop;
        layer = this.addLayer(layer);

        var animationState;
        var animationStateList;
        switch (fadeOutMode) {
            case Animation.NONE:
                break;
            case Animation.SAME_LAYER:
                animationStateList = this._animationLayer[layer];
                i = animationStateList.length;
                while (i--) {
                    animationState = animationStateList[i];
                    animationState.fadeOut(fadeInTime, pauseFadeOut);
                }
                break;
            case Animation.SAME_GROUP:
                j = this._animationLayer.length;
                while (j--) {
                    animationStateList = this._animationLayer[j];
                    i = animationStateList.length;
                    while (i--) {
                        animationState = animationStateList[i];
                        if (animationState.group == group) {
                            animationState.fadeOut(fadeInTime, pauseFadeOut);
                        }
                    }
                }
                break;
            case Animation.ALL:
                var j = this._animationLayer.length;
                while (j--) {
                    animationStateList = this._animationLayer[j];
                    i = animationStateList.length;
                    while (i--) {
                        animationState = animationStateList[i];
                        animationState.fadeOut(fadeInTime, pauseFadeOut);
                    }
                }
                break;
            case Animation.SAME_LAYER_AND_GROUP:
            default:
                animationStateList = this._animationLayer[layer];
                i = animationStateList.length;
                while (i--) {
                    animationState = animationStateList[i];
                    if (animationState.group == group) {
                        animationState.fadeOut(fadeInTime, pauseFadeOut);
                    }
                }
                break;
        }

        this._lastAnimationState = AnimationState._borrowObject();
        this._lastAnimationState.group = group;
        this._lastAnimationState.tweenEnabled = this.tweenEnabled;
        this._lastAnimationState.fadeIn(this._armature, animationData, fadeInTime, 1 / durationScale, loop, layer, displayControl, pauseFadeIn);

        this.addState(this._lastAnimationState);

        var slotList = this._armature._slotList;
        var slot;
        var childArmature;
        i = slotList.length;
        while (i--) {
            slot = slotList[i];
            childArmature = slot.getChildArmature();
            if (childArmature) {
                childArmature.animation.gotoAndPlay(animationName, fadeInTime);
            }
        }

        return this._lastAnimationState;
    };

    Animation.prototype.play = function () {
        if (!this._animationDataList || this._animationDataList.length == 0) {
            return;
        }
        if (!this._lastAnimationState) {
            this.gotoAndPlay(this._animationDataList[0].name);
        } else if (!this._isPlaying) {
            this._isPlaying = true;
        } else {
            this.gotoAndPlay(this._lastAnimationState.name);
        }
    };

    Animation.prototype.stop = function () {
        this._isPlaying = false;
    };

    Animation.prototype.getState = function (name, layer) {
        if (typeof layer === "undefined") { layer = 0; }
        var l = this._animationLayer.length;
        if (l == 0) {
            return null;
        } else if (layer >= l) {
            layer = l - 1;
        }

        var animationStateList = this._animationLayer[layer];
        if (!animationStateList) {
            return null;
        }
        var i = animationStateList.length;
        while (i--) {
            if (animationStateList[i].name == name) {
                return animationStateList[i];
            }
        }

        return null;
    };

    Animation.prototype.hasAnimation = function (animationName) {
        var i = this._animationDataList.length;
        while (i--) {
            if (this._animationDataList[i].name == animationName) {
                return true;
            }
        }

        return false;
    };

    Animation.prototype.advanceTime = function (passedTime) {
        if (!this._isPlaying) {
            return;
        }
        passedTime *= this.timeScale;

        var l = this._armature._boneList.length;
        var i;
        var j;
        var k = l;
        var stateListLength;
        var bone;
        var boneName;
        var weigthLeft;

        var x;
        var y;
        var skewX;
        var skewY;
        var scaleX;
        var scaleY;
        var pivotX;
        var pivotY;

        var layerTotalWeight;
        var animationStateList;
        var animationState;
        var timelineState;
        var weight;
        var transform;
        var pivot;

        l--;
        while (k--) {
            bone = this._armature._boneList[k];
            boneName = bone.name;
            weigthLeft = 1;

            x = 0;
            y = 0;
            skewX = 0;
            skewY = 0;
            scaleX = 0;
            scaleY = 0;
            pivotX = 0;
            pivotY = 0;

            i = this._animationLayer.length;
            while (i--) {
                layerTotalWeight = 0;
                animationStateList = this._animationLayer[i];
                stateListLength = animationStateList.length;
                for (j = 0; j < stateListLength; j++) {
                    animationState = animationStateList[j];
                    if (k == l) {
                        if (animationState.advanceTime(passedTime)) {
                            this.removeState(animationState);
                            j--;
                            stateListLength--;
                            continue;
                        }
                    }

                    timelineState = animationState._timelineStates[boneName];
                    if (timelineState && timelineState.tweenActive) {
                        weight = animationState._fadeWeight * animationState.weight * weigthLeft;
                        transform = timelineState.transform;
                        pivot = timelineState.pivot;
                        x += transform.x * weight;
                        y += transform.y * weight;
                        skewX += transform.skewX * weight;
                        skewY += transform.skewY * weight;
                        scaleX += transform.scaleX * weight;
                        scaleY += transform.scaleY * weight;
                        pivotX += pivot.x * weight;
                        pivotY += pivot.y * weight;

                        layerTotalWeight += weight;
                    }
                }

                if (layerTotalWeight >= weigthLeft) {
                    break;
                } else {
                    weigthLeft -= layerTotalWeight;
                }
            }
            transform = bone.tween;
            pivot = bone._tweenPivot;

            transform.x = x;
            transform.y = y;
            transform.skewX = skewX;
            transform.skewY = skewY;
            transform.scaleX = scaleX;
            transform.scaleY = scaleY;
            pivot.x = pivotX;
            pivot.y = pivotY;
        }
    };

    Animation.prototype.addLayer = function (layer) {
        if (layer >= this._animationLayer.length) {
            layer = this._animationLayer.length;
            this._animationLayer[layer] = [];
        }
        return layer;
    };

    Animation.prototype.addState = function (animationState) {
        var animationStateList = this._animationLayer[animationState.layer];
        animationStateList.push(animationState);
    };

    Animation.prototype.removeState = function (animationState) {
        var layer = animationState.layer;
        var animationStateList = this._animationLayer[layer];
        animationStateList.splice(animationStateList.indexOf(animationState), 1);

        AnimationState._returnObject(animationState);

        if (animationStateList.length == 0 && layer == this._animationLayer.length - 1) {
            this._animationLayer.length--;
        }
    };
    Animation.NONE = "none";
    Animation.SAME_LAYER = "sameLayer";
    Animation.SAME_GROUP = "sameGroup";
    Animation.SAME_LAYER_AND_GROUP = "sameLayerAndGroup";
    Animation.ALL = "all";
	ns.Animation = Animation;
})();