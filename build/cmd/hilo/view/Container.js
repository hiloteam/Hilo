/**
 * Hilo 1.0.0 for cmd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define(function(require, exports, module){

var Hilo = require('hilo/core/Hilo');
var Class = require('hilo/core/Class');
var View = require('hilo/view/View');

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Container是所有容器类的基类。每个Container都可以添加其他可视对象为子级。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Container
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @property {Array} children 容器的子元素列表。只读。
 * @property {Boolean} pointerChildren 指示容器的子元素是否能响应用户交互事件。默认为true。
 * @property {Boolean} clipChildren 指示是否裁剪超出容器范围的子元素。默认为false。
 */
var Container = Class.create(/** @lends Container.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Container");
        Container.superclass.constructor.call(this, properties);

        if(this.children) this._updateChildren();
        else this.children = [];
    },

    children: null,
    pointerChildren: true,
    clipChildren: false,

    /**
     * 返回容器的子元素的数量。
     * @returns {Uint} 容器的子元素的数量。
     */
    getNumChildren: function(){
        return this.children.length;
    },

    /**
     * 在指定索引位置添加子元素。
     * @param {View} child 要添加的子元素。
     * @param {Number} index 指定的索引位置，从0开始。
     */
    addChildAt: function(child, index){
        var children = this.children,
            len = children.length,
            parent = child.parent;

        index = index < 0 ? 0 : index > len ? len : index;
        var childIndex = this.getChildIndex(child);
        if(childIndex == index){
            return this;
        }else if(childIndex >= 0){
            children.splice(childIndex, 1);
            index = index == len ? len - 1 : index;
        }else if(parent){
            parent.removeChild(child);
        }

        children.splice(index, 0, child);

        //直接插入，影响插入位置之后的深度
        if(childIndex < 0){
            this._updateChildren(index);
        }
        //只是移动时影响中间段的深度
        else{
            var startIndex = childIndex < index ? childIndex : index;
            var endIndex = childIndex < index ? index : childIndex;;
            this._updateChildren(startIndex, endIndex + 1);
        }

        return this;
    },

    /**
     * 在最上面添加子元素。
     * @param {View} child 要添加的子元素。
     */
    addChild: function(child){
        var total = this.children.length,
            args = arguments;

        for(var i = 0, len = args.length; i < len; i++){
            this.addChildAt(args[i], total + i);
        }
        return this;
    },

    /**
     * 在指定索引位置删除子元素。
     * @param {Int} index 指定删除元素的索引位置，从0开始。
     * @returns {View} 被删除的对象。
     */
    removeChildAt: function(index){
        var children = this.children;
        if(index < 0 || index >= children.length) return null;

        var child = children[index];
        if(child){
            //NOTE: use `__renderer` for fixing child removal (DOMRenderer and FlashRenderer only).
            //Do `not` use it in any other case.
            if(!child.__renderer){
                var obj = child;
                while(obj = obj.parent){
                    //obj is stage
                    if(obj.renderer){
                        child.__renderer = obj.renderer;
                        break;
                    }
                    else if(obj.__renderer){
                        child.__renderer = obj.__renderer;
                        break;
                    }
                }
            }

            if(child.__renderer){
                child.__renderer.remove(child);
            }

            child.parent = null;
            child.depth = -1;
        }

        children.splice(index, 1);
        this._updateChildren(index);

        return child;
    },

    /**
     * 删除指定的子元素。
     * @param {View} child 指定要删除的子元素。
     * @returns {View} 被删除的对象。
     */
    removeChild: function(child){
        return this.removeChildAt(this.getChildIndex(child));
    },

    /**
     * 删除指定id的子元素。
     * @param {String} id 指定要删除的子元素的id。
     * @returns {View} 被删除的对象。
     */
    removeChildById: function(id){
        var children = this.children, child;
        for(var i = 0, len = children.length; i < len; i++){
            child = children[i];
            if(child.id === id){
                this.removeChildAt(i);
                return child;
            }
        }
        return null;
    },

    /**
     * 删除所有的子元素。
     * @returns {Container} 容器本身。
     */
    removeAllChildren: function(){
        while(this.children.length) this.removeChildAt(0);
        return this;
    },

    /**
     * 返回指定索引位置的子元素。
     * @param {Number} index 指定要返回的子元素的索引值，从0开始。
     */
    getChildAt: function(index){
        var children = this.children;
        if(index < 0 || index >= children.length) return null;
        return children[index];
    },

    /**
     * 返回指定id的子元素。
     * @param {String} id 指定要返回的子元素的id。
     */
    getChildById: function(id){
        var children = this.children, child;
        for(var i = 0, len = children.length; i < len; i++){
            child = children[i];
            if(child.id === id) return child;
        }
        return null;
    },

    /**
     * 返回指定子元素的索引值。
     * @param {View} child 指定要返回索引值的子元素。
     */
    getChildIndex: function(child){
        return this.children.indexOf(child);
    },

    /**
     * 设置子元素的索引位置。
     * @param {View} child 指定要设置的子元素。
     * @param {Number} index 指定要设置的索引值。
     */
    setChildIndex: function(child, index){
        var children = this.children,
            oldIndex = children.indexOf(child);

        if(oldIndex >= 0 && oldIndex != index){
            var len = children.length;
            index = index < 0 ? 0 : index >= len ? len - 1 : index;
            children.splice(oldIndex, 1);
            children.splice(index, 0, child);
            this._updateChildren();
        }
        return this;
    },

    /**
     * 交换两个子元素的索引位置。
     * @param {View} child1 指定要交换的子元素A。
     * @param {View} child2 指定要交换的子元素B。
     */
    swapChildren: function(child1, child2){
        var children = this.children,
            index1 = this.getChildIndex(child1),
            index2 = this.getChildIndex(child2);

        child1.depth = index2;
        children[index2] = child1;
        child2.depth = index1;
        children[index1] = child2;
    },

    /**
     * 交换两个指定索引位置的子元素。
     * @param {Number} index1 指定要交换的索引位置A。
     * @param {Number} index2 指定要交换的索引位置B。
     */
    swapChildrenAt: function(index1, index2){
        var children = this.children,
            child1 = this.getChildAt(index1),
            child2 = this.getChildAt(index2);

        child1.depth = index2;
        children[index2] = child1;
        child2.depth = index1;
        children[index1] = child2;
    },

    /**
     * 根据指定键值或函数对子元素进行排序。
     * @param {Object} keyOrFunction 如果此参数为String时，则根据子元素的某个属性值进行排序；如果此参数为Function时，则根据此函数进行排序。
     */
    sortChildren: function(keyOrFunction){
        var fn = keyOrFunction,
            children = this.children;
        if(typeof fn == "string"){
            var key = fn;
            fn = function(a, b){
                return b[key] - a[key];
            };
        }
        children.sort(fn);
        this._updateChildren();
    },

    /**
     * 更新子元素。
     * @private
     */
    _updateChildren: function(start, end){
        var children = this.children, child,
            start = start || 0,
            end = end || children.length;
        for(var i = start; i < end; i++){
            child = children[i];
            child.depth = i + 1;
            child.parent = this;
        }
    },

    /**
     * 返回是否包含参数指定的子元素。
     * @param {View} child 指定要测试的子元素。
     */
    contains: function(child){
        while(child = child.parent){
            if(child === this){
                return true;
            }
        }
        return false;
    },

    /**
     * 返回由x和y指定的点下的对象。
     * @param {Number} x 指定点的x轴坐标。
     * @param {Number} y 指定点的y轴坐标。
     * @param {Boolean} usePolyCollision 指定是否使用多边形碰撞检测。默认为false。
     * @param {Boolean} global 使用此标志表明将查找所有符合的对象，而不仅仅是第一个，即全局匹配。默认为false。
     * @param {Boolean} eventMode 使用此标志表明将在事件模式下查找对象。默认为false。
     */
    getViewAtPoint: function(x, y, usePolyCollision, global, eventMode){
        var result = global ? [] : null,
            children = this.children, child, obj;

        for(var i = children.length - 1; i >= 0; i--){
            child = children[i];
            //skip child which is not shown or pointer enabled
            if(!child || !child.visible || child.alpha <= 0 || (eventMode && !child.pointerEnabled)) continue;
            //find child recursively
            if(child.children && child.children.length && !(eventMode && !child.pointerChildren)){
                obj = child.getViewAtPoint(x, y, usePolyCollision, global, eventMode);
            }

            if(obj){
                if(!global) return obj;
                else if(obj.length) result = result.concat(obj);
            }else if(child.hitTestPoint(x, y, usePolyCollision)){
                if(!global) return child;
                else result.push(child);
            }
        }

        return global && result.length ? result : null;
    },

    /**
     * 覆盖渲染方法。
     * @private
     */
    render: function(renderer, delta){
        Container.superclass.render.call(this, renderer, delta);

        var children = this.children.slice(0), i, len, child;
        for(i = 0, len = children.length; i < len; i++){
            child = children[i];
            //NOTE: the child could remove or change it's parent
            if(child.parent === this) child._render(renderer, delta);
        }
    }

});

return Container;

});