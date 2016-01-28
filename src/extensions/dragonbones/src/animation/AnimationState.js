(function(){
	var ns = dragonBones.use("animation");
    var events = dragonBones.use("events");

    var TimelineState = ns.TimelineState;

	function AnimationState() {
        this.loop = 0;
        this.layer = 0;
        this._timelineStates = {};
    }
    AnimationState._borrowObject = function () {
        if (AnimationState._pool.length == 0) {
            return new AnimationState();
        }
        return AnimationState._pool.pop();
    };

    AnimationState._returnObject = function (animationState) {
        if (AnimationState._pool.indexOf(animationState) < 0) {
            AnimationState._pool[AnimationState._pool.length] = animationState;
        }

        animationState.clear();
    };

    AnimationState._clear = function () {
        var i = AnimationState._pool.length;
        while (i--) {
            AnimationState._pool[i].clear();
        }
        AnimationState._pool.length = 0;
    };

    AnimationState.prototype.fadeIn = function (armature, clip, fadeInTime, timeScale, loop, layer, displayControl, pauseBeforeFadeInComplete) {
        this.layer = layer;
        this.clip = clip;
        this.name = this.clip.name;
        this.totalTime = this.clip.duration;

        this._armature = armature;

        if (Math.round(this.clip.duration * this.clip.frameRate) < 2 || timeScale == Infinity) {
            this.timeScale = 1;
            this.currentTime = this.totalTime;
            if (this.loop >= 0) {
                this.loop = 1;
            } else {
                this.loop = -1;
            }
        } else {
            this.timeScale = timeScale;
            this.currentTime = 0;
            this.loop = loop;
        }

        this._pauseBeforeFadeInComplete = pauseBeforeFadeInComplete;

        this._fadeInTime = fadeInTime * this.timeScale;
        this._fadeState = 1;
        this._fadeOutBeginTime = 0;
        this._fadeOutWeight = -1;
        this._fadeWeight = 0;
        this._fadeIn = true;
        this._fadeOut = false;

        this.loopCount = -1;
        this.displayControl = displayControl;
        this.isPlaying = true;
        this.isComplete = false;

        this.weight = 1;
        this.blend = true;
        this.enabled = true;
        this.tweenEnabled = true;

        this.updateTimelineStates();
    };

    AnimationState.prototype.fadeOut = function (fadeOutTime, pause) {
        if (typeof pause === "undefined") { pause = false; }
        if (!this._armature || this._fadeOutWeight >= 0) {
            return;
        }
        this._fadeState = -1;
        this._fadeOutWeight = this._fadeWeight;
        this._fadeOutTime = fadeOutTime * this.timeScale;
        this._fadeOutBeginTime = this.currentTime;
        this._fadeOut = true;

        this.isPlaying = !pause;
        this.displayControl = false;

        for(var index = 0, l = this._timelineStates.length;index < l;index ++){
            (this._timelineStates[index]).fadeOut();
        }

        this.enabled = true;
    };

    AnimationState.prototype.play = function () {
        this.isPlaying = true;
    };

    AnimationState.prototype.stop = function () {
        this.isPlaying = false;
    };

    AnimationState.prototype.getMixingTransform = function (timelineName) {
        if (this._mixingTransforms) {
            return Number(this._mixingTransforms[timelineName]);
        }
        return -1;
    };

    AnimationState.prototype.addMixingTransform = function (timelineName, type, recursive) {
        if (typeof type === "undefined") { type = 2; }
        if (typeof recursive === "undefined") { recursive = true; }
        if (this.clip && this.clip.getTimeline(timelineName)) {
            if (!this._mixingTransforms) {
                this._mixingTransforms = {};
            }
            if (recursive) {
                var i = this._armature._boneList.length;
                var bone;
                var currentBone;
                while (i--) {
                    bone = this._armature._boneList[i];
                    if (bone.name == timelineName) {
                        currentBone = bone;
                    }
                    if (currentBone && (currentBone == bone || currentBone.contains(bone))) {
                        this._mixingTransforms[bone.name] = type;
                    }
                }
            } else {
                this._mixingTransforms[timelineName] = type;
            }

            this.updateTimelineStates();
        } else {
            throw new Error();
        }
    };

    AnimationState.prototype.removeMixingTransform = function (timelineName, recursive) {
        if (typeof timelineName === "undefined") { timelineName = null; }
        if (typeof recursive === "undefined") { recursive = true; }
        if (timelineName) {
            if (recursive) {
                var i = this._armature._boneList.length;
                var bone;
                var currentBone;
                while (i--) {
                    bone = this._armature._boneList[i];
                    if (bone.name == timelineName) {
                        currentBone = bone;
                    }
                    if (currentBone && (currentBone == bone || currentBone.contains(bone))) {
                        delete this._mixingTransforms[bone.name];
                    }
                }
            } else {
                delete this._mixingTransforms[timelineName];
            }

            for(var index = 0, l = this._mixingTransforms.length;index < l;index ++){
                var hasMixing = true;
                break;
            }
            if (!hasMixing) {
                this._mixingTransforms = null;
            }
        } else {
            this._mixingTransforms = null;
        }

        this.updateTimelineStates();
    };

    AnimationState.prototype.advanceTime = function (passedTime) {
        if (!this.enabled) {
            return false;
        }
        var event;
        var isComplete;

        if (this._fadeIn) {
            this._fadeIn = false;
            if (this._armature.hasEventListener(events.AnimationEvent.FADE_IN)) {
                event = new events.AnimationEvent(events.AnimationEvent.FADE_IN);
                event.animationState = this;
                this._armature._eventList.push(event);
            }
        }

        if (this._fadeOut) {
            this._fadeOut = false;
            if (this._armature.hasEventListener(events.AnimationEvent.FADE_OUT)) {
                event = new events.AnimationEvent(events.AnimationEvent.FADE_OUT);
                event.animationState = this;
                this._armature._eventList.push(event);
            }
        }

        this.currentTime += passedTime * this.timeScale;

        if (this.isPlaying && !this.isComplete) {
            var progress;
            var currentLoopCount;
            if (this._pauseBeforeFadeInComplete) {
                this._pauseBeforeFadeInComplete = false;
                this.isPlaying = false;
                progress = 0;
                currentLoopCount = Math.floor(progress);
            } else {
                progress = this.currentTime / this.totalTime;

                currentLoopCount = Math.floor(progress);
                if (currentLoopCount != this.loopCount) {
                    if (this.loopCount == -1) {
                        if (this._armature.hasEventListener(events.AnimationEvent.START)) {
                            event = new events.AnimationEvent(events.AnimationEvent.START);
                            event.animationState = this;
                            this._armature._eventList.push(event);
                        }
                    }
                    this.loopCount = currentLoopCount;
                    if (this.loopCount) {
                        if (this.loop && this.loopCount * this.loopCount >= this.loop * this.loop - 1) {
                            isComplete = true;
                            progress = 1;
                            currentLoopCount = 0;
                            if (this._armature.hasEventListener(events.AnimationEvent.COMPLETE)) {
                                event = new events.AnimationEvent(events.AnimationEvent.COMPLETE);
                                event.animationState = this;
                                this._armature._eventList.push(event);
                            }
                        } else {
                            if (this._armature.hasEventListener(events.AnimationEvent.LOOP_COMPLETE)) {
                                event = new events.AnimationEvent(events.AnimationEvent.LOOP_COMPLETE);
                                event.animationState = this;
                                this._armature._eventList.push(event);
                            }
                        }
                    }
                }
            }

            for (var index in this._timelineStates) {
                (this._timelineStates[index]).update(progress);
            }
            var frameList = this.clip.getFrameList();
            if (frameList.length > 0) {
                var playedTime = this.totalTime * (progress - currentLoopCount);
                var isArrivedFrame = false;
                var frameIndex;
                while (!this._currentFrame || playedTime > this._currentFrame.position + this._currentFrame.duration || playedTime < this._currentFrame.position) {
                    if (isArrivedFrame) {
                        this._armature._arriveAtFrame(this._currentFrame, null, this, true);
                    }
                    isArrivedFrame = true;
                    if (this._currentFrame) {
                        frameIndex = frameList.indexOf(this._currentFrame);
                        frameIndex++;
                        if (frameIndex >= frameList.length) {
                            frameIndex = 0;
                        }
                        this._currentFrame = frameList[frameIndex];
                    } else {
                        this._currentFrame = frameList[0];
                    }
                }

                if (isArrivedFrame) {
                    this._armature._arriveAtFrame(this._currentFrame, null, this, false);
                }
            }
        }

        if (this._fadeState > 0) {
            if (this._fadeInTime == 0) {
                this._fadeWeight = 1;
                this._fadeState = 0;
                this.isPlaying = true;
                if (this._armature.hasEventListener(events.AnimationEvent.FADE_IN_COMPLETE)) {
                    event = new events.AnimationEvent(events.AnimationEvent.FADE_IN_COMPLETE);
                    event.animationState = this;
                    this._armature._eventList.push(event);
                }
            } else {
                this._fadeWeight = this.currentTime / this._fadeInTime;
                if (this._fadeWeight >= 1) {
                    this._fadeWeight = 1;
                    this._fadeState = 0;
                    if (!this.isPlaying) {
                        this.currentTime -= this._fadeInTime;
                    }
                    this.isPlaying = true;
                    if (this._armature.hasEventListener(events.AnimationEvent.FADE_IN_COMPLETE)) {
                        event = new events.AnimationEvent(events.AnimationEvent.FADE_IN_COMPLETE);
                        event.animationState = this;
                        this._armature._eventList.push(event);
                    }
                }
            }
        } else if (this._fadeState < 0) {
            if (this._fadeOutTime == 0) {
                this._fadeWeight = 0;
                this._fadeState = 0;
                if (this._armature.hasEventListener(events.AnimationEvent.FADE_OUT_COMPLETE)) {
                    event = new events.AnimationEvent(events.AnimationEvent.FADE_OUT_COMPLETE);
                    event.animationState = this;
                    this._armature._eventList.push(event);
                }
                return true;
            } else {
                this._fadeWeight = (1 - (this.currentTime - this._fadeOutBeginTime) / this._fadeOutTime) * this._fadeOutWeight;
                if (this._fadeWeight <= 0) {
                    this._fadeWeight = 0;
                    this._fadeState = 0;
                    if (this._armature.hasEventListener(events.AnimationEvent.FADE_OUT_COMPLETE)) {
                        event = new events.AnimationEvent(events.AnimationEvent.FADE_OUT_COMPLETE);
                        event.animationState = this;
                        this._armature._eventList.push(event);
                    }
                    return true;
                }
            }
        }

        if (isComplete) {
            this.isComplete = true;
            if (this.loop < 0) {
                this.fadeOut((this._fadeOutWeight || this._fadeInTime) / this.timeScale, true);
            }
        }

        return false;
    };

    AnimationState.prototype.updateTimelineStates = function () {
        if (this._mixingTransforms) {
            for (var timelineName in this._timelineStates) {
                if (this._mixingTransforms[timelineName] == null) {
                    this.removeTimelineState(timelineName);
                }
            }

            for (timelineName in this._mixingTransforms) {
                if (!this._timelineStates[timelineName]) {
                    this.addTimelineState(timelineName);
                }
            }
        } else {
            for (timelineName in this.clip.getTimelines()) {
                if (!this._timelineStates[timelineName]) {
                    this.addTimelineState(timelineName);
                }
            }
        }
    };

    AnimationState.prototype.addTimelineState = function (timelineName) {
        var bone = this._armature.getBone(timelineName);
        if (bone) {
            var timelineState = TimelineState._borrowObject();
            var timeline = this.clip.getTimeline(timelineName);
            timelineState.fadeIn(bone, this, timeline);
            this._timelineStates[timelineName] = timelineState;
        }
    };

    AnimationState.prototype.removeTimelineState = function (timelineName) {
        TimelineState._returnObject(this._timelineStates[timelineName]);
        delete this._timelineStates[timelineName];
    };

    AnimationState.prototype.clear = function () {
        this.clip = null;
        this.enabled = false;

        this._armature = null;
        this._currentFrame = null;
        this._mixingTransforms = null;

        for (var timelineName in this._timelineStates) {
            this.removeTimelineState(timelineName);
        }
    };
    AnimationState._pool = [];
	ns.AnimationState = AnimationState;
})();