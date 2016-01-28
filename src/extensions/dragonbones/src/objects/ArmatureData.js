(function(){
	var ns = dragonBones.use("objects");
	function ArmatureData() {
        this._boneDataList = [];
        this._skinDataList = [];
        this._animationDataList = [];
    }
    ArmatureData.prototype.getBoneDataList = function () {
        return this._boneDataList;
    };

    ArmatureData.prototype.getSkinDataList = function () {
        return this._skinDataList;
    };

    ArmatureData.prototype.getAnimationDataList = function () {
        return this._animationDataList;
    };

    ArmatureData.prototype.dispose = function () {
        var i = this._boneDataList.length;
        while (i--) {
            this._boneDataList[i].dispose();
        }
        i = this._skinDataList.length;
        while (i--) {
            this._skinDataList[i].dispose();
        }
        i = this._animationDataList.length;
        while (i--) {
            this._animationDataList[i].dispose();
        }
        this._boneDataList.length = 0;
        this._skinDataList.length = 0;
        this._animationDataList.length = 0;
        this._boneDataList = null;
        this._skinDataList = null;
        this._animationDataList = null;
    };

    ArmatureData.prototype.getBoneData = function (boneName) {
        var i = this._boneDataList.length;
        while (i--) {
            if (this._boneDataList[i].name == boneName) {
                return this._boneDataList[i];
            }
        }
        return null;
    };

    ArmatureData.prototype.getSkinData = function (skinName) {
        if (!skinName) {
            return this._skinDataList[0];
        }
        var i = this._skinDataList.length;
        while (i--) {
            if (this._skinDataList[i].name == skinName) {
                return this._skinDataList[i];
            }
        }

        return null;
    };

    ArmatureData.prototype.getAnimationData = function (animationName) {
        var i = this._animationDataList.length;
        while (i--) {
            if (this._animationDataList[i].name == animationName) {
                return this._animationDataList[i];
            }
        }
        return null;
    };

    ArmatureData.prototype.addBoneData = function (boneData) {
        if (!boneData) {
            throw new Error();
        }

        if (this._boneDataList.indexOf(boneData) < 0) {
            this._boneDataList[this._boneDataList.length] = boneData;
        } else {
            throw new Error();
        }
    };

    ArmatureData.prototype.addSkinData = function (skinData) {
        if (!skinData) {
            throw new Error();
        }

        if (this._skinDataList.indexOf(skinData) < 0) {
            this._skinDataList[this._skinDataList.length] = skinData;
        } else {
            throw new Error();
        }
    };

    ArmatureData.prototype.addAnimationData = function (animationData) {
        if (!animationData) {
            throw new Error();
        }

        if (this._animationDataList.indexOf(animationData) < 0) {
            this._animationDataList[this._animationDataList.length] = animationData;
        }
    };

    ArmatureData.prototype.sortBoneDataList = function () {
        var i = this._boneDataList.length;
        if (i == 0) {
            return;
        }

        var helpArray = [];
        while (i--) {
            var boneData = this._boneDataList[i];
            var level = 0;
            var parentData = boneData;
            while (parentData && parentData.parent) {
                level++;
                parentData = this.getBoneData(parentData.parent);
            }
            helpArray[i] = { level: level, boneData: boneData };
        }

        helpArray.sort(this.sortBoneData);

        i = helpArray.length;
        while (i--) {
            this._boneDataList[i] = helpArray[i].boneData;
        }
    };

    ArmatureData.prototype.sortBoneData = function (object1, object2) {
        return object1.level > object2.level ? 1 : -1;
    };
	ns.ArmatureData = ArmatureData;
})();