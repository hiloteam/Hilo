(function(){
	var ns = dragonBones.use("events");
	var Event = ns.Event;
	
	function AnimationEvent(type) {
        AnimationEvent.superclass.constructor.call(this, type);
    }
    dragonBones.extends(AnimationEvent, Event);

    AnimationEvent.FADE_IN = "fadeIn";
    AnimationEvent.FADE_OUT = "fadeOut";
    AnimationEvent.START = "start";
    AnimationEvent.COMPLETE = "complete";
    AnimationEvent.LOOP_COMPLETE = "loopComplete";
    AnimationEvent.FADE_IN_COMPLETE = "fadeInComplete";
    AnimationEvent.FADE_OUT_COMPLETE = "fadeOutComplete";
	
	ns.AnimationEvent = AnimationEvent;
})();