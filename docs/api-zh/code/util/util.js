/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class 工具方法集合
 * @static
 * @module hilo/util/util
 */
var util = {
    /**
     * 简单的浅复制对象。
     * @param {Object} target 要复制的目标对象。
     * @param {Object} source 要复制的源对象。
     * @param {Boolean} strict 指示是否复制未定义的属性，默认为false，即不复制未定义的属性。
     * @returns {Object} 复制后的对象。
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