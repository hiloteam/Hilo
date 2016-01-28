(function(){
	var ns = dragonBones.use("events");
	function Event(type) {
        this.type = type;
    }
	ns.Event = Event;
})();