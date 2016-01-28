(function(){
	var ns = dragonBones.use("events");
	var Event = ns.Event;

	function ArmatureEvent(type) {
       ArmatureEvent.superclass.constructor.call(this, type);
    }
    dragonBones.extends(ArmatureEvent, Event);

    ArmatureEvent.Z_ORDER_UPDATED = "zOrderUpdated";
	ns.ArmatureEvent = ArmatureEvent;
})();