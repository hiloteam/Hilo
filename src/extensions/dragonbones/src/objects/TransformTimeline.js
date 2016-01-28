(function(){
	var ns = dragonBones.use("objects");
    var geom = dragonBones.use("geom");
	var Timeline = ns.Timeline;
    var DBTransform = ns.DBTransform;

	function TransformTimeline() {
        TransformTimeline.superclass.constructor.call(this);
        this.originTransform = new DBTransform();
        this.originPivot = new geom.Point();
        this.offset = 0;
        this.transformed = false;
    }
    dragonBones.extends(TransformTimeline, Timeline);
    
    TransformTimeline.prototype.dispose = function () {
        if (this == TransformTimeline.HIDE_TIMELINE) {
            return;
        }
        _super.prototype.dispose.call(this);
        this.originTransform = null;
        this.originPivot = null;
    };
    TransformTimeline.HIDE_TIMELINE = new TransformTimeline();
	ns.TransformTimeline = TransformTimeline;
})();