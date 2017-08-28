/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};


var arrayProto = Array.prototype,
    slice = arrayProto.slice;

//polyfiil for Array.prototype.indexOf
if (!arrayProto.indexOf) {
    arrayProto.indexOf = function(elem, fromIndex){
        fromIndex = fromIndex || 0;
        var len = this.length, i;
        if(len == 0 || fromIndex >= len) return -1;
        if(fromIndex < 0) fromIndex = len + fromIndex;
        for(i = fromIndex; i < len; i++){
            if(this[i] === elem) return i;
        }
        return -1;
    };
}

var fnProto = Function.prototype;

//polyfill for Function.prototype.bind
if (!fnProto.bind) {
    fnProto.bind = function(thisArg){
        var target = this,
            boundArgs = slice.call(arguments, 1),
            F = function(){};

        function bound(){
            var args = boundArgs.concat(slice.call(arguments));
            return target.apply(this instanceof bound ? this : thisArg, args);
        }

        F.prototype = target.prototype;
        bound.prototype = new F();

        return bound;
    };
}
window.Hilo.undefined = undefined;
})(window);