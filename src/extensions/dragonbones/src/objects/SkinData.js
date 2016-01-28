(function(){
	var ns = dragonBones.use("objects");
	function SkinData() {
        this._slotDataList = [];
    }
    SkinData.prototype.getSlotDataList = function () {
        return this._slotDataList;
    };

    SkinData.prototype.dispose = function () {
        var i = this._slotDataList.length;
        while (i--) {
            this._slotDataList[i].dispose();
        }
        this._slotDataList.length = 0;
        this._slotDataList = null;
    };

    SkinData.prototype.getSlotData = function (slotName) {
        var i = this._slotDataList.length;
        while (i--) {
            if (this._slotDataList[i].name == slotName) {
                return this._slotDataList[i];
            }
        }
        return null;
    };

    SkinData.prototype.addSlotData = function (slotData) {
        if (!slotData) {
            throw new Error();
        }

        if (this._slotDataList.indexOf(slotData) < 0) {
            this._slotDataList[this._slotDataList.length] = slotData;
        } else {
            throw new Error();
        }
    };
	ns.SkinData = SkinData;
})();