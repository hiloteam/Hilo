(function(){
	var ns = dragonBones.use("objects");
	function Frame() {
        this.position = 0;
        this.duration = 0;
    }
    Frame.prototype.dispose = function () {
    };
	ns.Frame = Frame;
})();