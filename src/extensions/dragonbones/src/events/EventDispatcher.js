(function(){
	var ns = dragonBones.use("events");
	function EventDispatcher() {
    }
    EventDispatcher.prototype.hasEventListener = function (type) {
        if (this._listenersMap && this._listenersMap[type]) {
            return true;
        }
        return false;
    };

    EventDispatcher.prototype.addEventListener = function (type, listener) {
        if (type && listener) {
            if (!this._listenersMap) {
                this._listenersMap = {};
            }
            var listeners = this._listenersMap[type];
            if (listeners) {
                this.removeEventListener(type, listener);
            }
            if (listeners) {
                listeners.push(listener);
            } else {
                this._listenersMap[type] = [listener];
            }
        }
    };

    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        if (!this._listenersMap || !type || !listener) {
            return;
        }
        var listeners = this._listenersMap[type];
        if (listeners) {
            var length = listeners.length;
            for (var i = 0; i < length; i++) {
                if (listeners[i] == listener) {
                    if (length == 1) {
                        listeners.length = 0;
                        delete this._listenersMap[type];
                    } else {
                        listeners.splice(i, 1);
                    }
                }
            }
        }
    };

    EventDispatcher.prototype.removeAllEventListeners = function (type) {
        if (type) {
            delete this._listenersMap[type];
        } else {
            this._listenersMap = null;
        }
    };

    EventDispatcher.prototype.dispatchEvent = function (event) {
        if (event) {
            var listeners = this._listenersMap[event.type];
            if (listeners) {
                event.target = this;
                var listenersCopy = listeners.concat();
                var length = listeners.length;
                for (var i = 0; i < length; i++) {
                    listenersCopy[i](event);
                }
            }
        }
    };
	ns.EventDispatcher = EventDispatcher;
})();