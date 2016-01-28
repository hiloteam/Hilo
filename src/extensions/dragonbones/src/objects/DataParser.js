(function(){
	var ns = dragonBones.use("objects");
    var utils = dragonBones.use("utils");
    var geom = dragonBones.use("geom");
    
    var SkeletonData = ns.SkeletonData;
    var ArmatureData = ns.ArmatureData;
    var BoneData = ns.BoneData;
    var SkinData = ns.SkinData;
    var SlotData = ns.SlotData;
    var DisplayData = ns.DisplayData;
    var AnimationData = ns.AnimationData;
    var TransformTimeline = ns.TransformTimeline;
    var TransformFrame = ns.TransformFrame;
    var Frame = ns.Frame;

	function DataParser() {
    }
    DataParser.parseTextureAtlasData = function (rawData, scale) {
        if (typeof scale === "undefined") { scale = 1; }
        if (!rawData) {
            throw new Error();
        }

        var textureAtlasData = {};
        textureAtlasData.__name = rawData[utils.ConstValues.A_NAME];
        var subTextureList = rawData[utils.ConstValues.SUB_TEXTURE];
        for(var index = 0, l = subTextureList.length;index < l;index ++){
            var subTextureObject = subTextureList[index];
            var subTextureName = subTextureObject[utils.ConstValues.A_NAME];
            var subTextureData = new geom.Rectangle(Number(subTextureObject[utils.ConstValues.A_X]) / scale, Number(subTextureObject[utils.ConstValues.A_Y]) / scale, Number(subTextureObject[utils.ConstValues.A_WIDTH]) / scale, Number(subTextureObject[utils.ConstValues.A_HEIGHT]) / scale);
            textureAtlasData[subTextureName] = subTextureData;
        }

        return textureAtlasData;
    };

    DataParser.parseSkeletonData = function (rawData) {
        if (!rawData) {
            throw new Error();
        }

        var frameRate = Number(rawData[utils.ConstValues.A_FRAME_RATE]);
        var data = new SkeletonData();
        data.name = rawData[utils.ConstValues.A_NAME];

        var armatureObjectList = rawData[utils.ConstValues.ARMATURE];
        for(var index = 0, l = armatureObjectList.length;index < l;index ++){
            var armatureObject = armatureObjectList[index];
            data.addArmatureData(DataParser.parseArmatureData(armatureObject, data, frameRate));
        }

        return data;
    };

    DataParser.parseArmatureData = function (armatureObject, data, frameRate) {
        var armatureData = new ArmatureData();
        armatureData.name = armatureObject[utils.ConstValues.A_NAME];

        var boneObjectList = armatureObject[utils.ConstValues.BONE];
        for(var index = 0, l = boneObjectList.length;index < l;index ++){
            var boneObject = boneObjectList[index];
            armatureData.addBoneData(DataParser.parseBoneData(boneObject));
        }

        var skinObjectList = armatureObject[utils.ConstValues.SKIN];
        for(var index = 0, l = skinObjectList.length;index < l;index ++){
            var skinObject = skinObjectList[index];
            armatureData.addSkinData(DataParser.parseSkinData(skinObject, data));
        }

        utils.DBDataUtil.transformArmatureData(armatureData);
        armatureData.sortBoneDataList();

        var animationObjectList = armatureObject[utils.ConstValues.ANIMATION];
        for(var index = 0, l = animationObjectList.length;index < l;index ++){
            var animationObject = animationObjectList[index];
            armatureData.addAnimationData(DataParser.parseAnimationData(animationObject, armatureData, frameRate));
        }

        return armatureData;
    };

    DataParser.parseBoneData = function (boneObject) {
        var boneData = new BoneData();
        boneData.name = boneObject[utils.ConstValues.A_NAME];
        boneData.parent = boneObject[utils.ConstValues.A_PARENT];
        boneData.length = Number(boneObject[utils.ConstValues.A_LENGTH]) || 0;

        DataParser.parseTransform(boneObject[utils.ConstValues.TRANSFORM], boneData.global);
        boneData.transform.copy(boneData.global);

        return boneData;
    };

    DataParser.parseSkinData = function (skinObject, data) {
        var skinData = new SkinData();
        skinData.name = skinObject[utils.ConstValues.A_NAME];
        var slotObjectList = skinObject[utils.ConstValues.SLOT];
        for(var index = 0, l = slotObjectList.length;index < l;index ++){
            var slotObject = slotObjectList[index];
            skinData.addSlotData(DataParser.parseSlotData(slotObject, data));
        }

        return skinData;
    };

    DataParser.parseSlotData = function (slotObject, data) {
        var slotData = new SlotData();
        slotData.name = slotObject[utils.ConstValues.A_NAME];
        slotData.parent = slotObject[utils.ConstValues.A_PARENT];
        slotData.zOrder = Number(slotObject[utils.ConstValues.A_Z_ORDER]);

        var displayObjectList = slotObject[utils.ConstValues.DISPLAY];
        for(var index = 0, l = displayObjectList.length;index < l;index ++){
            var displayObject = displayObjectList[index];
            slotData.addDisplayData(DataParser.parseDisplayData(displayObject, data));
        }

        return slotData;
    };

    DataParser.parseDisplayData = function (displayObject, data) {
        var displayData = new DisplayData();
        displayData.name = displayObject[utils.ConstValues.A_NAME];
        displayData.type = displayObject[utils.ConstValues.A_TYPE];

        displayData.pivot = data.addSubTexturePivot(0, 0, displayData.name);

        DataParser.parseTransform(displayObject[utils.ConstValues.TRANSFORM], displayData.transform, displayData.pivot);

        return displayData;
    };

    DataParser.parseAnimationData = function (animationObject, armatureData, frameRate) {
        var animationData = new AnimationData();
        animationData.name = animationObject[utils.ConstValues.A_NAME];
        animationData.frameRate = frameRate;
        animationData.loop = Number(animationObject[utils.ConstValues.A_LOOP]) || 0;
        animationData.fadeInTime = Number(animationObject[utils.ConstValues.A_FADE_IN_TIME]);
        animationData.duration = Number(animationObject[utils.ConstValues.A_DURATION]) / frameRate;
        animationData.scale = Number(animationObject[utils.ConstValues.A_SCALE]);

        if (animationObject.hasOwnProperty(utils.ConstValues.A_TWEEN_EASING)) {
            var tweenEase = animationObject[utils.ConstValues.A_TWEEN_EASING];
            if (tweenEase == undefined || tweenEase == null) {
                animationData.tweenEasing = NaN;
            } else {
                animationData.tweenEasing = Number(tweenEase);
            }
        } else {
            animationData.tweenEasing = NaN;
        }

        DataParser.parseTimeline(animationObject, animationData, DataParser.parseMainFrame, frameRate);

        var timeline;
        var timelineName;
        var timelineObjectList = animationObject[utils.ConstValues.TIMELINE];
        for(var index = 0, l = timelineObjectList.length;index < l;index ++){
            var timelineObject = timelineObjectList[index];
            timeline = DataParser.parseTransformTimeline(timelineObject, animationData.duration, frameRate);
            timelineName = timelineObject[utils.ConstValues.A_NAME];
            animationData.addTimeline(timeline, timelineName);
        }

        utils.DBDataUtil.addHideTimeline(animationData, armatureData);
        utils.DBDataUtil.transformAnimationData(animationData, armatureData);

        return animationData;
    };

    DataParser.parseTimeline = function (timelineObject, timeline, frameParser, frameRate) {
        var position = 0;
        var frame;
        var frameObjectList = timelineObject[utils.ConstValues.FRAME]||[];

        for(var index = 0, l = frameObjectList.length;index < l;index ++){
            var frameObject = frameObjectList[index];
            frame = frameParser(frameObject, frameRate);
            frame.position = position;
            timeline.addFrame(frame);
            position += frame.duration;
        }
        if (frame) {
            frame.duration = timeline.duration - frame.position;
        }
    };

    DataParser.parseTransformTimeline = function (timelineObject, duration, frameRate) {
        var timeline = new TransformTimeline();
        timeline.duration = duration;

        DataParser.parseTimeline(timelineObject, timeline, DataParser.parseTransformFrame, frameRate);

        timeline.scale = Number(timelineObject[utils.ConstValues.A_SCALE]);
        timeline.offset = Number(timelineObject[utils.ConstValues.A_OFFSET]);

        return timeline;
    };

    DataParser.parseFrame = function (frameObject, frame, frameRate) {
        frame.duration = Number(frameObject[utils.ConstValues.A_DURATION]) / frameRate;
        frame.action = frameObject[utils.ConstValues.A_ACTION];
        frame.event = frameObject[utils.ConstValues.A_EVENT];
        frame.sound = frameObject[utils.ConstValues.A_SOUND];
    };

    DataParser.parseMainFrame = function (frameObject, frameRate) {
        var frame = new Frame();
        DataParser.parseFrame(frameObject, frame, frameRate);
        return frame;
    };

    DataParser.parseTransformFrame = function (frameObject, frameRate) {
        var frame = new TransformFrame();
        DataParser.parseFrame(frameObject, frame, frameRate);

        frame.visible = Number(frameObject[utils.ConstValues.A_HIDE]) != 1;

        if (frameObject.hasOwnProperty(utils.ConstValues.A_TWEEN_EASING)) {
            var tweenEase = frameObject[utils.ConstValues.A_TWEEN_EASING];
            if (tweenEase == undefined || tweenEase == null) {
                frame.tweenEasing = NaN;
            } else {
                frame.tweenEasing = Number(tweenEase);
            }
        } else {
            frame.tweenEasing = 0;
        }

        frame.tweenRotate = Number(frameObject[utils.ConstValues.A_TWEEN_ROTATE]) || 0;
        frame.displayIndex = Number(frameObject[utils.ConstValues.A_DISPLAY_INDEX]) || 0;

        frame.zOrder = Number(frameObject[utils.ConstValues.A_Z_ORDER]) || 0;

        DataParser.parseTransform(frameObject[utils.ConstValues.TRANSFORM], frame.global, frame.pivot);
        frame.transform.copy(frame.global);

        var colorTransformObject = frameObject[utils.ConstValues.COLOR_TRANSFORM];
        if (colorTransformObject) {
            frame.color = new geom.ColorTransform();
            frame.color.alphaOffset = Number(colorTransformObject[utils.ConstValues.A_ALPHA_OFFSET]);
            frame.color.redOffset = Number(colorTransformObject[utils.ConstValues.A_RED_OFFSET]);
            frame.color.greenOffset = Number(colorTransformObject[utils.ConstValues.A_GREEN_OFFSET]);
            frame.color.blueOffset = Number(colorTransformObject[utils.ConstValues.A_BLUE_OFFSET]);

            frame.color.alphaMultiplier = Number(colorTransformObject[utils.ConstValues.A_ALPHA_MULTIPLIER]) * 0.01;
            frame.color.redMultiplier = Number(colorTransformObject[utils.ConstValues.A_RED_MULTIPLIER]) * 0.01;
            frame.color.greenMultiplier = Number(colorTransformObject[utils.ConstValues.A_GREEN_MULTIPLIER]) * 0.01;
            frame.color.blueMultiplier = Number(colorTransformObject[utils.ConstValues.A_BLUE_MULTIPLIER]) * 0.01;
        }

        return frame;
    };

    DataParser.parseTransform = function (transformObject, transform, pivot) {
        if (typeof pivot === "undefined") { pivot = null; }
        if (transformObject) {
            if (transform) {
                transform.x = Number(transformObject[utils.ConstValues.A_X]);
                transform.y = Number(transformObject[utils.ConstValues.A_Y]);
                transform.skewX = Number(transformObject[utils.ConstValues.A_SKEW_X]) * utils.ConstValues.ANGLE_TO_RADIAN;
                transform.skewY = Number(transformObject[utils.ConstValues.A_SKEW_Y]) * utils.ConstValues.ANGLE_TO_RADIAN;
                transform.scaleX = Number(transformObject[utils.ConstValues.A_SCALE_X]);
                transform.scaleY = Number(transformObject[utils.ConstValues.A_SCALE_Y]);
            }
            if (pivot) {
                pivot.x = Number(transformObject[utils.ConstValues.A_PIVOT_X]);
                pivot.y = Number(transformObject[utils.ConstValues.A_PIVOT_Y]);
            }
        }
    };
	ns.DataParser = DataParser;
})();