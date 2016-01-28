(function(){
	var ns = dragonBones.use("objects");
    var DBTransform = ns.DBTransform;
    
	function DisplayData() {
        this.transform = new DBTransform();
    }
    DisplayData.prototype.dispose = function () {
        this.transform = null;
        this.pivot = null;
    };
    DisplayData.ARMATURE = "armature";
    DisplayData.IMAGE = "image";
	ns.DisplayData = DisplayData;
})();