/**
 * Hilo 1.0.0 for amd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define('hilo/event/EventMixin', ['hilo/core/Class'], function(Class){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class EventMixin Mixin is an event that contains related functions. You can increase the functionality of the event target by Class.mix(target, EventMixin).
 * @mixin
 * @static
 * @module hilo/event/EventMixin
 * @requires hilo/core/Class
 */
var EventMixin = {
    _listeners: null,

    /**
     * Add an event listener.
     * @param {String} type Type of event to monitor.
     * @param {Function} listener Event listener callback.
     * @param {Boolean} once Whether it is a one-time listener.
     * @returns {Object} Object itself.
     */
    on: function(type, listener, once){
        var listeners = (this._listeners = this._listeners || {});
        var eventListeners = (listeners[type] = listeners[type] || []);
        for(var i = 0, len = eventListeners.length; i < len; i++){
            var el = eventListeners[i];
            if(el.listener === listener) return;
        }
        eventListeners.push({listener:listener, once:once});
        return this;
    },

    /**
     * Remove an event listener. If you do not pass any parameters, then delete all event listeners.
     * If you do not pass the second parameter then delete all events of the specified type.
     * @param {String} type Type of listening event to delete.
     * @param {Function} listener Listener callback function to remove.
     * @returns {Object} Object itself. meh
     */
    off: function(type, listener){
        //remove all event listeners
        if(arguments.length == 0){
            this._listeners = null;
            return this;
        }

        var eventListeners = this._listeners && this._listeners[type];
        if(eventListeners){
            //remove event listeners by specified type
            if(arguments.length == 1){
                delete this._listeners[type];
                return this;
            }

            for(var i = 0, len = eventListeners.length; i < len; i++){
                var el = eventListeners[i];
                if(el.listener === listener){
                    eventListeners.splice(i, 1);
                    if(eventListeners.length === 0) delete this._listeners[type];
                    break;
                }
            }
        }
        return this;
    },

    /**
     * Send event. When the first argument of type Object, put the event as a while object.
     * @param {String} type The type of event you want to send.
     * @param {Object} detail Specific event information to be transmitted.
     * @returns {Boolean} Whether the event was successfully dispatched.
     */
    fire: function(type, detail){
        var event, eventType;
        if(typeof type === 'string'){
            eventType = type;
        }else{
            event = type;
            eventType = type.type;
        }

        var listeners = this._listeners;
        if(!listeners) return false;

        var eventListeners = listeners[eventType];
        if(eventListeners){
            eventListeners = eventListeners.slice(0);
            event = event || new EventObject(eventType, this, detail);
            if(event._stopped) return false;

            for(var i = 0; i < eventListeners.length; i++){
                var el = eventListeners[i];
                el.listener.call(this, event);
                if(el.once) eventListeners.splice(i--, 1);
            }

            if(eventListeners.length == 0) delete listeners[eventType];
            return true;
        }
        return false;
    }
};

/**
 * Event object class.
 * Currently only inner class.
 * Independent class may be considered if demanded.
 */
var EventObject = Class.create({
    constructor: function EventObject(type, target, detail){
        this.type = type;
        this.target = target;
        this.detail = detail;
        this.timeStamp = +new Date();
    },

    type: null,
    target: null,
    detail: null,
    timeStamp: 0,

    stopImmediatePropagation: function(){
        this._stopped = true;
    }
});

//Trick: `stopImmediatePropagation` compatibility
var RawEvent = window.Event;
if(RawEvent){
    var proto = RawEvent.prototype,
        stop = proto.stopImmediatePropagation;
    proto.stopImmediatePropagation = function(){
        stop && stop.call(this);
        this._stopped = true;
    }
}


return EventMixin;

});
