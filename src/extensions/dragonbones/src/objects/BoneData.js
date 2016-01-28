(function(){
	var ns = dragonBones.use("objects");
	var DBTransform = ns.DBTransform;
	
	function BoneData() {
	    this.length = 0;
	    this.global = new DBTransform();
	    this.transform = new DBTransform();
	}
	BoneData.prototype.dispose = function () {
	    this.global = null;
	    this.transform = null;
	};
	ns.BoneData = BoneData;
})();