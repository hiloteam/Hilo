(function(){
	var ns = dragonBones.use("objects");
	function SlotData() {
        this._displayDataList = [];
        this.zOrder = 0;
    }
    SlotData.prototype.getDisplayDataList = function () {
        return this._displayDataList;
    };

    SlotData.prototype.dispose = function () {
        var i = this._displayDataList.length;
        while (i--) {
            this._displayDataList[i].dispose();
        }
        this._displayDataList.length = 0;
        this._displayDataList = null;
    };

    SlotData.prototype.addDisplayData = function (displayData) {
        if (!displayData) {
            throw new Error();
        }
        if (this._displayDataList.indexOf(displayData) < 0) {
            this._displayDataList[this._displayDataList.length] = displayData;
        } else {
            throw new Error();
        }
    };

    SlotData.prototype.getDisplayData = function (displayName) {
        var i = this._displayDataList.length;
        while (i--) {
            if (this._displayDataList[i].name == displayName) {
                return this._displayDataList[i];
            }
        }

        return null;
    };
	ns.SlotData = SlotData;
})();