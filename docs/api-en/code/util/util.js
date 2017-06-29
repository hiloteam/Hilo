/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class util method set
 * @static
 * @module hilo/util/util
 */
var util = {
    /**
     * Simple shallow copy objects.
     * @param {Object} target Target object to copy to.
     * @param {Object} source Source object to copy.
     * @param {Boolean} strict Indicates whether replication is undefined property, default is false, i.e., undefined attributes are not copied.
     * @returns {Object} Object after copying.
     */
    copy: function(target, source, strict){
        for(var key in source){
            if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
                target[key] = source[key];
            }
        }
        return target;
    }
};