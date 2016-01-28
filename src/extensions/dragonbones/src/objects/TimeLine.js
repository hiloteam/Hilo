(function(){
	var ns = dragonBones.use("objects");
	function Timeline() {
        this._frameList = [];
        this.duration = 0;
        this.scale = 1;
    }
    Timeline.prototype.getFrameList = function () {
        return this._frameList;
    };

    Timeline.prototype.dispose = function () {
        var i = this._frameList.length;
        while (i--) {
            this._frameList[i].dispose();
        }
        this._frameList.length = 0;
        this._frameList = null;
    };

    Timeline.prototype.addFrame = function (frame) {
        if (!frame) {
            throw new Error();
        }

        if (this._frameList.indexOf(frame) < 0) {
            this._frameList[this._frameList.length] = frame;
        } else {
            throw new Error();
        }
    };
	ns.Timeline = Timeline;
})();