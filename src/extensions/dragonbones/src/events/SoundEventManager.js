(function(){
	var ns = dragonBones.use("events");
    
	function SoundEventManager() {
        SoundEventManager.superclass.constructor.call(this);
        if (SoundEventManager._instance) {
            throw new Error("Singleton already constructed!");
        }
    }
    dragonBones.extends(SoundEventManager, dragonBones.events.EventDispatcher);

    SoundEventManager.getInstance = function () {
        if (!SoundEventManager._instance) {
            SoundEventManager._instance = new SoundEventManager();
        }
        return SoundEventManager._instance;
    };
	ns.SoundEventManager = SoundEventManager;
})();