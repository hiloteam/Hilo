(function(){
	var ns = dragonBones.use("animation");
    var objects = dragonBones.use("objects");
    var geom = dragonBones.use("geom");
    var utils = dragonBones.use("utils");

	function TimelineState() {
        this.transform = new objects.DBTransform();
        this.pivot = new geom.Point();

        this._durationTransform = new objects.DBTransform();
        this._durationPivot = new geom.Point();
        this._durationColor = new geom.ColorTransform();
    }
    TimelineState._borrowObject = function () {
        if (TimelineState._pool.length == 0) {
            return new TimelineState();
        }
        return TimelineState._pool.pop();
    };

    TimelineState._returnObject = function (timeline) {
        if (TimelineState._pool.indexOf(timeline) < 0) {
            TimelineState._pool[TimelineState._pool.length] = timeline;
        }

        timeline.clear();
    };

    TimelineState._clear = function () {
        var i = TimelineState._pool.length;
        while (i--) {
            TimelineState._pool[i].clear();
        }
        TimelineState._pool.length = 0;
    };

    TimelineState.getEaseValue = function (value, easing) {
        if (easing > 1) {
            var valueEase = 0.5 * (1 - Math.cos(value * Math.PI)) - value;
            easing -= 1;
        } else if (easing > 0) {
            valueEase = Math.sin(value * TimelineState.HALF_PI) - value;
        } else if (easing < 0) {
            valueEase = 1 - Math.cos(value * TimelineState.HALF_PI) - value;
            easing *= -1;
        }
        return valueEase * easing + value;
    };

    TimelineState.prototype.fadeIn = function (bone, animationState, timeline) {
        this._bone = bone;
        this._animationState = animationState;
        this._timeline = timeline;

        this._originTransform = this._timeline.originTransform;
        this._originPivot = this._timeline.originPivot;

        this._tweenTransform = false;
        this._tweenColor = false;

        this._totalTime = this._animationState.totalTime;

        this.transform.x = 0;
        this.transform.y = 0;
        this.transform.scaleX = 0;
        this.transform.scaleY = 0;
        this.transform.skewX = 0;
        this.transform.skewY = 0;
        this.pivot.x = 0;
        this.pivot.y = 0;

        this._durationTransform.x = 0;
        this._durationTransform.y = 0;
        this._durationTransform.scaleX = 0;
        this._durationTransform.scaleY = 0;
        this._durationTransform.skewX = 0;
        this._durationTransform.skewY = 0;
        this._durationPivot.x = 0;
        this._durationPivot.y = 0;

        this._currentFrame = null;

        switch (this._timeline.getFrameList().length) {
            case 0:
                this._bone._arriveAtFrame(null, this, this._animationState, false);
                this._updateState = 0;
                break;
            case 1:
                this._updateState = -1;
                break;
            default:
                this._updateState = 1;
                break;
        }
    };

    TimelineState.prototype.fadeOut = function () {
        this.transform.skewX = utils.TransformUtil.formatRadian(this.transform.skewX);
        this.transform.skewY = utils.TransformUtil.formatRadian(this.transform.skewY);
    };

    TimelineState.prototype.update = function (progress) {
        if (this._updateState) {
            if (this._updateState > 0) {
                if (this._timeline.scale == 0) {
                    progress = 1;
                } else {
                    progress /= this._timeline.scale;
                }

                if (progress == 1) {
                    progress = 0.99999999;
                }

                progress += this._timeline.offset;
                var loopCount = Math.floor(progress);
                progress -= loopCount;

                var playedTime = this._totalTime * progress;
                var isArrivedFrame = false;
                var frameIndex;
                while (!this._currentFrame || playedTime > this._currentFramePosition + this._currentFrameDuration || playedTime < this._currentFramePosition) {
                    if (isArrivedFrame) {
                        this._bone._arriveAtFrame(this._currentFrame, this, this._animationState, true);
                    }
                    isArrivedFrame = true;
                    if (this._currentFrame) {
                        frameIndex = this._timeline.getFrameList().indexOf(this._currentFrame) + 1;
                        if (frameIndex >= this._timeline.getFrameList().length) {
                            frameIndex = 0;
                        }
                        this._currentFrame = this._timeline.getFrameList()[frameIndex];
                    } else {
                        frameIndex = 0;
                        this._currentFrame = this._timeline.getFrameList()[0];
                    }
                    this._currentFrameDuration = this._currentFrame.duration;
                    this._currentFramePosition = this._currentFrame.position;
                }

                if (isArrivedFrame) {
                    this.tweenActive = this._currentFrame.displayIndex >= 0;
                    frameIndex++;
                    if (frameIndex >= this._timeline.getFrameList().length) {
                        frameIndex = 0;
                    }
                    var nextFrame = this._timeline.getFrameList()[frameIndex];

                    if (frameIndex == 0 && this._animationState.loop && this._animationState.loopCount >= Math.abs(this._animationState.loop) - 1 && ((this._currentFramePosition + this._currentFrameDuration) / this._totalTime + loopCount - this._timeline.offset) * this._timeline.scale > 0.99999999) {
                        this._updateState = 0;
                        this._tweenEasing = NaN;
                    } else if (this._currentFrame.displayIndex < 0 || nextFrame.displayIndex < 0 || !this._animationState.tweenEnabled) {
                        this._tweenEasing = NaN;
                    } else if (isNaN(this._animationState.clip.tweenEasing)) {
                        this._tweenEasing = this._currentFrame.tweenEasing;
                    } else {
                        this._tweenEasing = this._animationState.clip.tweenEasing;
                    }

                    if (isNaN(this._tweenEasing)) {
                        this._tweenTransform = false;
                        this._tweenColor = false;
                    } else {
                        this._durationTransform.x = nextFrame.transform.x - this._currentFrame.transform.x;
                        this._durationTransform.y = nextFrame.transform.y - this._currentFrame.transform.y;
                        this._durationTransform.skewX = nextFrame.transform.skewX - this._currentFrame.transform.skewX;
                        this._durationTransform.skewY = nextFrame.transform.skewY - this._currentFrame.transform.skewY;
                        this._durationTransform.scaleX = nextFrame.transform.scaleX - this._currentFrame.transform.scaleX;
                        this._durationTransform.scaleY = nextFrame.transform.scaleY - this._currentFrame.transform.scaleY;

                        if (frameIndex == 0) {
                            this._durationTransform.skewX = utils.TransformUtil.formatRadian(this._durationTransform.skewX);
                            this._durationTransform.skewY = utils.TransformUtil.formatRadian(this._durationTransform.skewY);
                        }

                        this._durationPivot.x = nextFrame.pivot.x - this._currentFrame.pivot.x;
                        this._durationPivot.y = nextFrame.pivot.y - this._currentFrame.pivot.y;

                        if (this._durationTransform.x != 0 || this._durationTransform.y != 0 || this._durationTransform.skewX != 0 || this._durationTransform.skewY != 0 || this._durationTransform.scaleX != 0 || this._durationTransform.scaleY != 0 || this._durationPivot.x != 0 || this._durationPivot.y != 0) {
                            this._tweenTransform = true;
                        } else {
                            this._tweenTransform = false;
                        }

                        if (this._currentFrame.color && nextFrame.color) {
                            this._durationColor.alphaOffset = nextFrame.color.alphaOffset - this._currentFrame.color.alphaOffset;
                            this._durationColor.redOffset = nextFrame.color.redOffset - this._currentFrame.color.redOffset;
                            this._durationColor.greenOffset = nextFrame.color.greenOffset - this._currentFrame.color.greenOffset;
                            this._durationColor.blueOffset = nextFrame.color.blueOffset - this._currentFrame.color.blueOffset;

                            this._durationColor.alphaMultiplier = nextFrame.color.alphaMultiplier - this._currentFrame.color.alphaMultiplier;
                            this._durationColor.redMultiplier = nextFrame.color.redMultiplier - this._currentFrame.color.redMultiplier;
                            this._durationColor.greenMultiplier = nextFrame.color.greenMultiplier - this._currentFrame.color.greenMultiplier;
                            this._durationColor.blueMultiplier = nextFrame.color.blueMultiplier - this._currentFrame.color.blueMultiplier;

                            if (this._durationColor.alphaOffset != 0 || this._durationColor.redOffset != 0 || this._durationColor.greenOffset != 0 || this._durationColor.blueOffset != 0 || this._durationColor.alphaMultiplier != 0 || this._durationColor.redMultiplier != 0 || this._durationColor.greenMultiplier != 0 || this._durationColor.blueMultiplier != 0) {
                                this._tweenColor = true;
                            } else {
                                this._tweenColor = false;
                            }
                        } else if (this._currentFrame.color) {
                            this._tweenColor = true;
                            this._durationColor.alphaOffset = -this._currentFrame.color.alphaOffset;
                            this._durationColor.redOffset = -this._currentFrame.color.redOffset;
                            this._durationColor.greenOffset = -this._currentFrame.color.greenOffset;
                            this._durationColor.blueOffset = -this._currentFrame.color.blueOffset;

                            this._durationColor.alphaMultiplier = 1 - this._currentFrame.color.alphaMultiplier;
                            this._durationColor.redMultiplier = 1 - this._currentFrame.color.redMultiplier;
                            this._durationColor.greenMultiplier = 1 - this._currentFrame.color.greenMultiplier;
                            this._durationColor.blueMultiplier = 1 - this._currentFrame.color.blueMultiplier;
                        } else if (nextFrame.color) {
                            this._tweenColor = true;
                            this._durationColor.alphaOffset = nextFrame.color.alphaOffset;
                            this._durationColor.redOffset = nextFrame.color.redOffset;
                            this._durationColor.greenOffset = nextFrame.color.greenOffset;
                            this._durationColor.blueOffset = nextFrame.color.blueOffset;

                            this._durationColor.alphaMultiplier = nextFrame.color.alphaMultiplier - 1;
                            this._durationColor.redMultiplier = nextFrame.color.redMultiplier - 1;
                            this._durationColor.greenMultiplier = nextFrame.color.greenMultiplier - 1;
                            this._durationColor.blueMultiplier = nextFrame.color.blueMultiplier - 1;
                        } else {
                            this._tweenColor = false;
                        }
                    }

                    if (!this._tweenTransform) {
                        if (this._animationState.blend) {
                            this.transform.x = this._originTransform.x + this._currentFrame.transform.x;
                            this.transform.y = this._originTransform.y + this._currentFrame.transform.y;
                            this.transform.skewX = this._originTransform.skewX + this._currentFrame.transform.skewX;
                            this.transform.skewY = this._originTransform.skewY + this._currentFrame.transform.skewY;
                            this.transform.scaleX = this._originTransform.scaleX + this._currentFrame.transform.scaleX;
                            this.transform.scaleY = this._originTransform.scaleY + this._currentFrame.transform.scaleY;

                            this.pivot.x = this._originPivot.x + this._currentFrame.pivot.x;
                            this.pivot.y = this._originPivot.y + this._currentFrame.pivot.y;
                        } else {
                            this.transform.x = this._currentFrame.transform.x;
                            this.transform.y = this._currentFrame.transform.y;
                            this.transform.skewX = this._currentFrame.transform.skewX;
                            this.transform.skewY = this._currentFrame.transform.skewY;
                            this.transform.scaleX = this._currentFrame.transform.scaleX;
                            this.transform.scaleY = this._currentFrame.transform.scaleY;

                            this.pivot.x = this._currentFrame.pivot.x;
                            this.pivot.y = this._currentFrame.pivot.y;
                        }
                    }

                    if (!this._tweenColor) {
                        if (this._currentFrame.color) {
                            this._bone._updateColor(this._currentFrame.color.alphaOffset, this._currentFrame.color.redOffset, this._currentFrame.color.greenOffset, this._currentFrame.color.blueOffset, this._currentFrame.color.alphaMultiplier, this._currentFrame.color.redMultiplier, this._currentFrame.color.greenMultiplier, this._currentFrame.color.blueMultiplier, true);
                        } else if (this._bone._isColorChanged) {
                            this._bone._updateColor(0, 0, 0, 0, 1, 1, 1, 1, false);
                        }
                    }
                    this._bone._arriveAtFrame(this._currentFrame, this, this._animationState, false);
                }

                if (this._tweenTransform || this._tweenColor) {
                    progress = (playedTime - this._currentFramePosition) / this._currentFrameDuration;
                    if (this._tweenEasing) {
                        progress = TimelineState.getEaseValue(progress, this._tweenEasing);
                    }
                }

                if (this._tweenTransform) {
                    var currentTransform = this._currentFrame.transform;
                    var currentPivot = this._currentFrame.pivot;
                    if (this._animationState.blend) {
                        this.transform.x = this._originTransform.x + currentTransform.x + this._durationTransform.x * progress;
                        this.transform.y = this._originTransform.y + currentTransform.y + this._durationTransform.y * progress;
                        this.transform.skewX = this._originTransform.skewX + currentTransform.skewX + this._durationTransform.skewX * progress;
                        this.transform.skewY = this._originTransform.skewY + currentTransform.skewY + this._durationTransform.skewY * progress;
                        this.transform.scaleX = this._originTransform.scaleX + currentTransform.scaleX + this._durationTransform.scaleX * progress;
                        this.transform.scaleY = this._originTransform.scaleY + currentTransform.scaleY + this._durationTransform.scaleY * progress;

                        this.pivot.x = this._originPivot.x + currentPivot.x + this._durationPivot.x * progress;
                        this.pivot.y = this._originPivot.y + currentPivot.y + this._durationPivot.y * progress;
                    } else {
                        this.transform.x = currentTransform.x + this._durationTransform.x * progress;
                        this.transform.y = currentTransform.y + this._durationTransform.y * progress;
                        this.transform.skewX = currentTransform.skewX + this._durationTransform.skewX * progress;
                        this.transform.skewY = currentTransform.skewY + this._durationTransform.skewY * progress;
                        this.transform.scaleX = currentTransform.scaleX + this._durationTransform.scaleX * progress;
                        this.transform.scaleY = currentTransform.scaleY + this._durationTransform.scaleY * progress;

                        this.pivot.x = currentPivot.x + this._durationPivot.x * progress;
                        this.pivot.y = currentPivot.y + this._durationPivot.y * progress;
                    }
                }

                if (this._tweenColor) {
                    if (this._currentFrame.color) {
                        this._bone._updateColor(this._currentFrame.color.alphaOffset + this._durationColor.alphaOffset * progress, this._currentFrame.color.redOffset + this._durationColor.redOffset * progress, this._currentFrame.color.greenOffset + this._durationColor.greenOffset * progress, this._currentFrame.color.blueOffset + this._durationColor.blueOffset * progress, this._currentFrame.color.alphaMultiplier + this._durationColor.alphaMultiplier * progress, this._currentFrame.color.redMultiplier + this._durationColor.redMultiplier * progress, this._currentFrame.color.greenMultiplier + this._durationColor.greenMultiplier * progress, this._currentFrame.color.blueMultiplier + this._durationColor.blueMultiplier * progress, true);
                    } else {
                        this._bone._updateColor(this._durationColor.alphaOffset * progress, this._durationColor.redOffset * progress, this._durationColor.greenOffset * progress, this._durationColor.blueOffset * progress, 1 + this._durationColor.alphaMultiplier * progress, 1 + this._durationColor.redMultiplier * progress, 1 + this._durationColor.greenMultiplier * progress, 1 + this._durationColor.blueMultiplier * progress, true);
                    }
                }
            } else {
                this._updateState = 0;
                if (this._animationState.blend) {
                    this.transform.copy(this._originTransform);

                    this.pivot.x = this._originPivot.x;
                    this.pivot.y = this._originPivot.y;
                } else {
                    this.transform.x = this.transform.y = this.transform.skewX = this.transform.skewY = this.transform.scaleX = this.transform.scaleY = 0;

                    this.pivot.x = 0;
                    this.pivot.y = 0;
                }

                this._currentFrame = this._timeline.getFrameList()[0];

                this.tweenActive = this._currentFrame.displayIndex >= 0;

                if (this._currentFrame.color) {
                    this._bone._updateColor(this._currentFrame.color.alphaOffset, this._currentFrame.color.redOffset, this._currentFrame.color.greenOffset, this._currentFrame.color.blueOffset, this._currentFrame.color.alphaMultiplier, this._currentFrame.color.redMultiplier, this._currentFrame.color.greenMultiplier, this._currentFrame.color.blueMultiplier, true);
                } else {
                    this._bone._updateColor(0, 0, 0, 0, 1, 1, 1, 1, false);
                }

                this._bone._arriveAtFrame(this._currentFrame, this, this._animationState, false);
            }
        }
    };

    TimelineState.prototype.clear = function () {
        this._updateState = 0;
        this._bone = null;
        this._animationState = null;
        this._timeline = null;
        this._currentFrame = null;
        this._originTransform = null;
        this._originPivot = null;
    };
    TimelineState.HALF_PI = Math.PI * 0.5;

    TimelineState._pool = [];
	ns.TimelineState = TimelineState;
})();