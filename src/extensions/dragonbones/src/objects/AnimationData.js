(function(){
	var ns = dragonBones.use("objects");
	var Timeline = ns.Timeline;
	function AnimationData() {
        AnimationData.superclass.constructor.call(this);
        this.frameRate = 0;
        this.loop = 0;
        this.tweenEasing = NaN;
        this.fadeInTime = 0;

        this._timelines = {};
    }

    dragonBones.extends(AnimationData, Timeline);
    AnimationData.prototype.getTimelines = function () {
        return this._timelines;
    };

    AnimationData.prototype.dispose = function () {
        this.constructor.superclass.prototype.dispose.call(this);

        for (var timelineName in this._timelines) {
            (this._timelines[timelineName]).dispose();
        }
        this._timelines = null;
    };

    AnimationData.prototype.getTimeline = function (timelineName) {
        return this._timelines[timelineName];
    };

    AnimationData.prototype.addTimeline = function (timeline, timelineName) {
        if (!timeline) {
            throw new Error();
        }

        this._timelines[timelineName] = timeline;
    };
	ns.AnimationData = AnimationData;
})();