(function(){
	var ns = dragonBones.use("factorys");
    var objects = dragonBones.use("objects");
    
	function BaseFactory() {
        BaseFactory.superclass.constructor.call(this);

        this._dataDic = {};
        this._textureAtlasDic = {};
        this._textureAtlasLoadingDic = {};
    }
    dragonBones.extends(BaseFactory, dragonBones.events.EventDispatcher);
    BaseFactory.prototype.getSkeletonData = function (name) {
        return this._dataDic[name];
    };

    BaseFactory.prototype.addSkeletonData = function (data, name) {
        if (!data) {
            throw new Error();
        }
        name = name || data.name;
        if (!name) {
            throw new Error("Unnamed data!");
        }
        if (this._dataDic[name]) {
        }
        this._dataDic[name] = data;
    };

    BaseFactory.prototype.removeSkeletonData = function (name) {
        delete this._dataDic[name];
    };

    BaseFactory.prototype.getTextureAtlas = function (name) {
        return this._textureAtlasDic[name];
    };

    BaseFactory.prototype.addTextureAtlas = function (textureAtlas, name) {
        if (!textureAtlas) {
            throw new Error();
        }

        name = name || textureAtlas.name;
        if (!name) {
            throw new Error("Unnamed data!");
        }
        if (this._textureAtlasDic[name]) {
        }
        this._textureAtlasDic[name] = textureAtlas;
    };

    BaseFactory.prototype.removeTextureAtlas = function (name) {
        delete this._textureAtlasDic[name];
    };

    BaseFactory.prototype.dispose = function (disposeData) {
        if (typeof disposeData === "undefined") { disposeData = true; }
        if (disposeData) {
            for (var i in this._dataDic) {
                this._dataDic[i].dispose();
            }
            for (var i in this._textureAtlasDic) {
                this._textureAtlasDic[i].dispose();
            }
        }
        this._dataDic = null;
        this._textureAtlasDic = null;
        this._textureAtlasLoadingDic = null;
        this._currentDataName = null;
        this._currentTextureAtlasName = null;
    };

    BaseFactory.prototype.buildArmature = function (armatureName, animationName, skeletonName, textureAtlasName, skinName) {
        if (skeletonName) {
            var data = this._dataDic[skeletonName];
            if (data) {
                var armatureData = data.getArmatureData(armatureName);
            }
        } else {
            for (skeletonName in this._dataDic) {
                data = this._dataDic[skeletonName];
                armatureData = data.getArmatureData(armatureName);
                if (armatureData) {
                    break;
                }
            }
        }

        if (!armatureData) {
            return null;
        }

        this._currentDataName = skeletonName;
        this._currentTextureAtlasName = textureAtlasName || skeletonName;

        var armature = this._generateArmature();
        armature.name = armatureName;
        var bone;
        var boneData;
        var boneDataList = armatureData.getBoneDataList();
        for (var index = 0, l = boneDataList.length;index < l;index ++) {
            boneData = boneDataList[index];
            bone = new dragonBones.Bone();
            bone.name = boneData.name;
            bone.origin.copy(boneData.transform);
            if (armatureData.getBoneData(boneData.parent)) {
                armature.addChild(bone, boneData.parent);
            } else {
                armature.addChild(bone, null);
            }
        }

        if (animationName && animationName != armatureName) {
            var animationArmatureData = data.getArmatureData(animationName);
            if (!animationArmatureData) {
                for (skeletonName in this._dataDic) {
                    data = this._dataDic[skeletonName];
                    animationArmatureData = data.getArmatureData(animationName);
                    if (animationArmatureData) {
                        break;
                    }
                }
            }
        }

        if (animationArmatureData) {
            armature.animation.setAnimationDataList(animationArmatureData.getAnimationDataList());
        } else {
            armature.animation.setAnimationDataList(armatureData.getAnimationDataList());
        }

        var skinData = armatureData.getSkinData(skinName);
        if (!skinData) {
            throw new Error();
        }

        var slot;
        var displayData;
        var childArmature;
        var i;
        var helpArray = [];
        var slotData;
        var slotDataList = skinData.getSlotDataList();
        var displayDataList;
        for (var index = 0, l = slotDataList.length;index < l;index ++) {
            slotData = slotDataList[index];
            bone = armature.getBone(slotData.parent);
            if (!bone) {
                continue;
            }
            displayDataList = slotData.getDisplayDataList();
            slot = this._generateSlot();
            slot.name = slotData.name;
            slot._originZOrder = slotData.zOrder;
            slot._dislayDataList = displayDataList;

            helpArray.length = 0;
            i = displayDataList.length;
            while (i--) {
                displayData = displayDataList[i];
                switch (displayData.type) {
                    case objects.DisplayData.ARMATURE:
                        childArmature = this.buildArmature(displayData.name, null, this._currentDataName, this._currentTextureAtlasName, null);
                        if (childArmature) {
                            helpArray[i] = childArmature;
                        }
                        break;
                    case objects.DisplayData.IMAGE:
                    default:
                        helpArray[i] = this._generateDisplay(this._textureAtlasDic[this._currentTextureAtlasName], displayData.name, displayData.pivot.x, displayData.pivot.y);
                        break;
                }
            }
            slot.setDisplayList(helpArray);
            slot._changeDisplay(0);
            bone.addChild(slot);
        }

        armature._slotsZOrderChanged = true;
        armature.advanceTime(0);
        return armature;
    };

    BaseFactory.prototype.getTextureDisplay = function (textureName, textureAtlasName, pivotX, pivotY) {
        if (textureAtlasName) {
            var textureAtlas = this._textureAtlasDic[textureAtlasName];
        }
        if (!textureAtlas && !textureAtlasName) {
            for (textureAtlasName in this._textureAtlasDic) {
                textureAtlas = this._textureAtlasDic[textureAtlasName];
                if (textureAtlas.getRegion(textureName)) {
                    break;
                }
                textureAtlas = null;
            }
        }
        if (textureAtlas) {
            if (isNaN(pivotX) || isNaN(pivotY)) {
                var data = this._dataDic[textureAtlasName];
                if (data) {
                    var pivot = data.getSubTexturePivot(textureName);
                    if (pivot) {
                        pivotX = pivot.x;
                        pivotY = pivot.y;
                    }
                }
            }

            return this._generateDisplay(textureAtlas, textureName, pivotX, pivotY);
        }
        return null;
    };

    BaseFactory.prototype._generateArmature = function () {
        return null;
    };

    BaseFactory.prototype._generateSlot = function () {
        return null;
    };

    BaseFactory.prototype._generateDisplay = function (textureAtlas, fullName, pivotX, pivotY) {
        return null;
    };
    ns.BaseFactory = BaseFactory;
})();