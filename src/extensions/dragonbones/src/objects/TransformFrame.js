(function(){
	var ns = dragonBones.use("objects");
	var geom = dragonBones.use("geom");
	var Frame = ns.Frame;
	var DBTransform = ns.DBTransform;

	function TransformFrame() {
	    TransformFrame.superclass.constructor.call(this);

	    this.tweenEasing = 0;
	    this.tweenRotate = 0;
	    this.displayIndex = 0;
	    this.zOrder = NaN;
	    this.visible = true;

	    this.global = new DBTransform();
	    this.transform = new DBTransform();
	    this.pivot = new geom.Point();
	}
	dragonBones.extends(TransformFrame, Frame);

	TransformFrame.prototype.dispose = function () {
	    _super.prototype.dispose.call(this);
	    this.global = null;
	    this.transform = null;

	    this.pivot = null;
	    this.color = null;
	};
	ns.TransformFrame = TransformFrame;
})();