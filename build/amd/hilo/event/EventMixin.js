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
 * @class EventMixin是一个包含事件相关功能的mixin。可以通过 Class.mix(target, EventMixin) 来为target增加事件功能。
 * @mixin
 * @static
 * @module hilo/event/EventMixin
 * @requires hilo/core/Class
 */
var EventMixin = {
    _listeners: null,

    /**
     * 增加一个事件监听。
     * @param {String} type 要监听的事件类型。
     * @param {Function} listener 事件监听回调函数。
     * @param {Boolean} once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
     * @returns {Object} 对象本身。链式调用支持。
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
     * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
     * @param {String} type 要删除监听的事件类型。
     * @param {Function} listener 要删除监听的回调函数。
     * @returns {Object} 对象本身。链式调用支持。
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
     * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
     * @param {String} type 要发送的事件类型。
     * @param {Object} detail 要发送的事件的具体信息，即事件随带参数。
     * @returns {Boolean} 是否成功调度事件。
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
 * 事件对象类。当前仅为内部类，以后有需求的话可能会考虑独立为公开类。
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