(function(){
	var ns = dragonBones.use("events");
	var Event = ns.Event;
	
	function SoundEvent(type) {
        SoundEvent.superclass.constructor.call(this, type);
    }
    dragonBones.extends(SoundEvent, Event);

    SoundEvent.SOUND = "sound";
    SoundEvent.BONE_FRAME_EVENT = "boneFrameEvent";
	ns.SoundEvent = SoundEvent;
})();