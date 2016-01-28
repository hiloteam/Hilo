(function(){
	var ns = dragonBones.use("objects");
    var geom = dragonBones.use("geom");
    
	function SkeletonData() {
        this._armatureDataList = [];
        this._subTexturePivots = {};
    }
    SkeletonData.prototype.getArmatureNames = function () {
        var nameList = [];
        for (var armatureDataIndex in this._armatureDataList) {
            nameList[nameList.length] = this._armatureDataList[armatureDataIndex].name;
        }
        return nameList;
    };

    SkeletonData.prototype.getArmatureDataList = function () {
        return this._armatureDataList;
    };

    SkeletonData.prototype.dispose = function () {
        for (var armatureDataIndex in this._armatureDataList) {
            this._armatureDataList[armatureDataIndex].dispose();
        }
        this._armatureDataList.length = 0;

        this._armatureDataList = null;
        this._subTexturePivots = null;
    };

    SkeletonData.prototype.getArmatureData = function (armatureName) {
        var i = this._armatureDataList.length;
        while (i--) {
            if (this._armatureDataList[i].name == armatureName) {
                return this._armatureDataList[i];
            }
        }

        return null;
    };

    SkeletonData.prototype.addArmatureData = function (armatureData) {
        if (!armatureData) {
            throw new Error();
        }

        if (this._armatureDataList.indexOf(armatureData) < 0) {
            this._armatureDataList[this._armatureDataList.length] = armatureData;
        } else {
            throw new Error();
        }
    };

    SkeletonData.prototype.removeArmatureData = function (armatureData) {
        var index = this._armatureDataList.indexOf(armatureData);
        if (index >= 0) {
            this._armatureDataList.splice(index, 1);
        }
    };

    SkeletonData.prototype.removeArmatureDataByName = function (armatureName) {
        var i = this._armatureDataList.length;
        while (i--) {
            if (this._armatureDataList[i].name == armatureName) {
                this._armatureDataList.splice(i, 1);
            }
        }
    };

    SkeletonData.prototype.getSubTexturePivot = function (subTextureName) {
        return this._subTexturePivots[subTextureName];
    };

    SkeletonData.prototype.addSubTexturePivot = function (x, y, subTextureName) {
        var point = this._subTexturePivots[subTextureName];
        if (point) {
            point.x = x;
            point.y = y;
        } else {
            this._subTexturePivots[subTextureName] = point = new geom.Point(x, y);
        }

        return point;
    };

    SkeletonData.prototype.removeSubTexturePivot = function (subTextureName) {
        if (subTextureName) {
            delete this._subTexturePivots[subTextureName];
        } else {
            for (subTextureName in this._subTexturePivots) {
                delete this._subTexturePivots[subTextureName];
            }
        }
    };
	ns.SkeletonData = SkeletonData;
})();