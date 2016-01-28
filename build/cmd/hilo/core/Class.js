/**
 * Hilo 1.0.0 for cmd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define(function(require, exports, module){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */ 

/**
 * 创建类示例：
 * <pre>
 * var Bird = Hilo.Class.create({
 *     Extends: Animal,
 *     Mixes: EventMixin,
 *     constructor: function(name){
 *         this.name = name;
 *     },
 *     fly: function(){
 *         console.log('I am flying');
 *     },
 *     Statics: {
 *         isBird: function(bird){
 *             return bird instanceof Bird;
 *         }
 *     }
 * });
 *
 * var swallow = new Bird('swallow');
 * swallow.fly();
 * Bird.isBird(swallow);
 * </pre>
 * @namespace Class是提供类的创建的辅助工具。
 * @static
 * @module hilo/core/Class
 */
var Class = (function(){

/**
 * 根据参数指定的属性和方法创建类。
 * @param {Object} properties 要创建的类的相关属性和方法。主要有：
 * <ul>
 * <li><b>Extends</b> - 指定要继承的父类。</li>
 * <li><b>Mixes</b> - 指定要混入的成员集合对象。</li>
 * <li><b>Statics</b> - 指定类的静态属性或方法。</li>
 * <li><b>constructor</b> - 指定类的构造函数。</li>
 * <li>其他创建类的成员属性或方法。</li>
 * </ul>
 * @returns {Object} 创建的类。
 */
var create = function(properties){
    properties = properties || {};
    var clazz = properties.hasOwnProperty('constructor') ? properties.constructor : function(){};
    implement.call(clazz, properties);
    return clazz;
}

/**
 * @private
 */
var implement = function(properties){
    var proto = {}, key, value;
    for(key in properties){
        value = properties[key];
        if(classMutators.hasOwnProperty(key)){
            classMutators[key].call(this, value);
        }else{
            proto[key] = value;
        }
    }

    mix(this.prototype, proto);
};

var classMutators = /** @ignore */{
    Extends: function(parent){
        var existed = this.prototype, proto = createProto(parent.prototype);
        //inherit static properites
        mix(this, parent);
        //keep existed properties
        mix(proto, existed);
        //correct constructor
        proto.constructor = this;
        //prototype chaining
        this.prototype = proto;
        //shortcut to parent's prototype
        this.superclass = parent.prototype;
    },

    Mixes: function(items){
        items instanceof Array || (items = [items]);
        var proto = this.prototype, item;

        while(item = items.shift()){
            mix(proto, item.prototype || item);
        }
    },

    Statics: function(properties){
        mix(this, properties);
    }
};

/**
 * @private
 */
var createProto = (function(){
    if(Object.__proto__){
        return function(proto){
            return {__proto__: proto};
        }
    }else{
        var Ctor = function(){};
        return function(proto){
            Ctor.prototype = proto;
            return new Ctor();
        }
    }
})();

/**
 * 混入属性或方法。
 * @param {Object} target 混入目标对象。
 * @param {Object} source 要混入的属性和方法来源。可支持多个来源参数。
 * @returns {Object} 混入目标对象。
 */
var mix = function(target){
    for(var i = 1, len = arguments.length; i < len; i++){
        var source  = arguments[i], defineProps;
        for(var key in source){
            var prop = source[key];
            if(prop && typeof prop === 'object'){
                if(prop.value !== undefined || typeof prop.get === 'function' || typeof prop.set === 'function'){
                    defineProps = defineProps || {};
                    defineProps[key] = prop;
                    continue;
                }
            }
            target[key] = prop;
        }
        if(defineProps) defineProperties(target, defineProps);
    }

    return target;
};

try{
    var defineProperty = Object.defineProperty,
        defineProperties = Object.defineProperties;
    defineProperty({}, '$', {value:0});
}catch(e){
    if('__defineGetter__' in Object){
        defineProperty = function(obj, prop, desc){
            if('value' in desc) obj[prop] = desc.value;
            if('get' in desc) obj.__defineGetter__(prop, desc.get);
            if('set' in desc) obj.__defineSetter__(prop, desc.set);
            return obj;
        };
        defineProperties = function(obj, props){
            for(var prop in props){
                if(props.hasOwnProperty(prop)){
                    defineProperty(obj, prop, props[prop]);
                }
            }
            return obj;
        };
    }
}

return {create:create, mix:mix};

})();


return Class;

});