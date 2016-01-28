(function(){
	var ns = dragonBones.use("utils");
    var objects = dragonBones.use("objects");
    var TransformUtil = ns.TransformUtil;

	function DBDataUtil() {
    }
    DBDataUtil.transformArmatureData = function (armatureData) {
        var boneDataList = armatureData.getBoneDataList();
        var i = boneDataList.length;
        var boneData;
        var parentBoneData;
        while (i--) {
            boneData = boneDataList[i];
            if (boneData.parent) {
                parentBoneData = armatureData.getBoneData(boneData.parent);
                if (parentBoneData) {
                    boneData.transform.copy(boneData.global);
                    TransformUtil.transformPointWithParent(boneData.transform, parentBoneData.global);
                }
            }
        }
    };

    DBDataUtil.transformArmatureDataAnimations = function (armatureData) {
        var animationDataList = armatureData.getAnimationDataList();
        var i = animationDataList.length;
        while (i--) {
            DBDataUtil.transformAnimationData(animationDataList[i], armatureData);
        }
    };

    DBDataUtil.transformAnimationData = function (animationData, armatureData) {
        var skinData = armatureData.getSkinData(null);
        var boneDataList = armatureData.getBoneDataList();
        var slotDataList = skinData.getSlotDataList();
        var i = boneDataList.length;

        var boneData;
        var timeline;
        var slotData;
        var displayData;
        var parentTimeline;
        var frameList;
        var originTransform;
        var originPivot;
        var prevFrame;
        var frame;
        var frameListLength;

        while (i--) {
            boneData = boneDataList[i];
            timeline = animationData.getTimeline(boneData.name);
            if (!timeline) {
                continue;
            }

            slotData = null;

            for (var slotIndex in slotDataList) {
                slotData = slotDataList[slotIndex];
                if (slotData.parent == boneData.name) {
                    break;
                }
            }

            parentTimeline = boneData.parent ? animationData.getTimeline(boneData.parent) : null;

            frameList = timeline.getFrameList();

            originTransform = null;
            originPivot = null;
            prevFrame = null;
            frameListLength = frameList.length;
            for (var j = 0; j < frameListLength; j++) {
                frame = frameList[j];
                if (parentTimeline) {
                    DBDataUtil._helpTransform1.copy(frame.global);

                    DBDataUtil.getTimelineTransform(parentTimeline, frame.position, DBDataUtil._helpTransform2);
                    TransformUtil.transformPointWithParent(DBDataUtil._helpTransform1, DBDataUtil._helpTransform2);

                    frame.transform.copy(DBDataUtil._helpTransform1);
                } else {
                    frame.transform.copy(frame.global);
                }

                frame.transform.x -= boneData.transform.x;
                frame.transform.y -= boneData.transform.y;
                frame.transform.skewX -= boneData.transform.skewX;
                frame.transform.skewY -= boneData.transform.skewY;
                frame.transform.scaleX -= boneData.transform.scaleX;
                frame.transform.scaleY -= boneData.transform.scaleY;

                if (!timeline.transformed) {
                    if (slotData) {
                        frame.zOrder -= slotData.zOrder;
                    }
                }

                if (!originTransform) {
                    originTransform = timeline.originTransform;
                    originTransform.copy(frame.transform);
                    originTransform.skewX = TransformUtil.formatRadian(originTransform.skewX);
                    originTransform.skewY = TransformUtil.formatRadian(originTransform.skewY);
                    originPivot = timeline.originPivot;
                    originPivot.x = frame.pivot.x;
                    originPivot.y = frame.pivot.y;
                }

                frame.transform.x -= originTransform.x;
                frame.transform.y -= originTransform.y;
                frame.transform.skewX = TransformUtil.formatRadian(frame.transform.skewX - originTransform.skewX);
                frame.transform.skewY = TransformUtil.formatRadian(frame.transform.skewY - originTransform.skewY);
                frame.transform.scaleX -= originTransform.scaleX;
                frame.transform.scaleY -= originTransform.scaleY;

                if (!timeline.transformed) {
                    frame.pivot.x -= originPivot.x;
                    frame.pivot.y -= originPivot.y;
                }

                if (prevFrame) {
                    var dLX = frame.transform.skewX - prevFrame.transform.skewX;

                    if (prevFrame.tweenRotate) {
                        if (prevFrame.tweenRotate > 0) {
                            if (dLX < 0) {
                                frame.transform.skewX += Math.PI * 2;
                                frame.transform.skewY += Math.PI * 2;
                            }

                            if (prevFrame.tweenRotate > 1) {
                                frame.transform.skewX += Math.PI * 2 * (prevFrame.tweenRotate - 1);
                                frame.transform.skewY += Math.PI * 2 * (prevFrame.tweenRotate - 1);
                            }
                        } else {
                            if (dLX > 0) {
                                frame.transform.skewX -= Math.PI * 2;
                                frame.transform.skewY -= Math.PI * 2;
                            }

                            if (prevFrame.tweenRotate < 1) {
                                frame.transform.skewX += Math.PI * 2 * (prevFrame.tweenRotate + 1);
                                frame.transform.skewY += Math.PI * 2 * (prevFrame.tweenRotate + 1);
                            }
                        }
                    } else {
                        frame.transform.skewX = prevFrame.transform.skewX + TransformUtil.formatRadian(frame.transform.skewX - prevFrame.transform.skewX);
                        frame.transform.skewY = prevFrame.transform.skewY + TransformUtil.formatRadian(frame.transform.skewY - prevFrame.transform.skewY);
                    }
                }

                prevFrame = frame;
            }
            timeline.transformed = true;
        }
    };

    DBDataUtil.getTimelineTransform = function (timeline, position, retult) {
        var frameList = timeline.getFrameList();
        var i = frameList.length;

        var currentFrame;
        var tweenEasing;
        var progress;
        var nextFrame;
        while (i--) {
            currentFrame = frameList[i];
            if (currentFrame.position <= position && currentFrame.position + currentFrame.duration > position) {
                tweenEasing = currentFrame.tweenEasing;
                if (i == frameList.length - 1 || isNaN(tweenEasing) || position == currentFrame.position) {
                    retult.copy(currentFrame.global);
                } else {
                    progress = (position - currentFrame.position) / currentFrame.duration;
                    if (tweenEasing) {
                        progress = animation.TimelineState.getEaseValue(progress, tweenEasing);
                    }

                    nextFrame = frameList[i + 1];

                    retult.x = currentFrame.global.x + (nextFrame.global.x - currentFrame.global.x) * progress;
                    retult.y = currentFrame.global.y + (nextFrame.global.y - currentFrame.global.y) * progress;
                    retult.skewX = TransformUtil.formatRadian(currentFrame.global.skewX + (nextFrame.global.skewX - currentFrame.global.skewX) * progress);
                    retult.skewY = TransformUtil.formatRadian(currentFrame.global.skewY + (nextFrame.global.skewY - currentFrame.global.skewY) * progress);
                    retult.scaleX = currentFrame.global.scaleX + (nextFrame.global.scaleX - currentFrame.global.scaleX) * progress;
                    retult.scaleY = currentFrame.global.scaleY + (nextFrame.global.scaleY - currentFrame.global.scaleY) * progress;
                }
                break;
            }
        }
    };

    DBDataUtil.addHideTimeline = function (animationData, armatureData) {
        var boneDataList = armatureData.getBoneDataList();
        var i = boneDataList.length;

        var boneData;
        var boneName;
        while (i--) {
            boneData = boneDataList[i];
            boneName = boneData.name;
            if (!animationData.getTimeline(boneName)) {
                animationData.addTimeline(objects.TransformTimeline.HIDE_TIMELINE, boneName);
            }
        }
    };
    DBDataUtil._helpTransform1 = new objects.DBTransform();
    DBDataUtil._helpTransform2 = new objects.DBTransform();
	ns.DBDataUtil = DBDataUtil;
})();