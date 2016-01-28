(function(){
	var ns = dragonBones.use("events");
	var Event = ns.Event;
	
	function FrameEvent(type) {
        FrameEvent.superclass.constructor.call(this, type);
    }
    dragonBones.extends(FrameEvent, Event);

    FrameEvent.ANIMATION_FRAME_EVENT = "animationFrameEvent";
    FrameEvent.BONE_FRAME_EVENT = "boneFrameEvent";
	
	ns.FrameEvent = FrameEvent;
})();