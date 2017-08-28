/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;


/**
 * @language=en
 * @class Container is the base class to all container classes. Each Container can add other view object as children.
 * @augments View
 * @param {Object} properties Properties parameters of the object to create. Contains all writable properties of this class.
 * @module hilo/view/Container
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @property {Array} children List of children elements of the container, readonly!
 * @property {Boolean} pointerChildren Whether children elements of the container can response to user interactive events, default value is true.
 * @property {Boolean} clipChildren Whether clip children elements which are out of the container, default value is false.
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
     * @language=en
     * Return the amount of the children elements of the container.
     * @returns {Uint} The amount of the children elements of the container.
     */
    getNumChildren: function(){
        return this.children.length;
    },

    /**
     * @language=en
     * Add child element at given index.
     * @param {View} child Element to add.
     * @param {Number} index The given index position, range from 0.
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
        //Insert directly, this will affect depth of elements after the index.
        if(childIndex < 0){
            this._updateChildren(index);
        }
        //只是移动时影响中间段的深度
        //Will affect depth of elements in the middle during moving
        else{
            var startIndex = childIndex < index ? childIndex : index;
            var endIndex = childIndex < index ? index : childIndex;
            this._updateChildren(startIndex, endIndex + 1);
        }

        return this;
    },

    /**
     * @language=en
     * Add child element at the top.
     * @param {View} child Elements to add.
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
     * @language=en
     * Remove element at the index.
     * @param {Int} index Index of the element to remove, range from 0.
     * @returns {View} Element had been removed.
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
     * @language=en
     * Remove the given child element.
     * @param {View} child The child element to remove.
     * @returns {View} Element had been removed.
     */
    removeChild: function(child){
        return this.removeChildAt(this.getChildIndex(child));
    },

    /**
     * @language=en
     * Remove child element by its id.
     * @param {String} id The id of element to remove.
     * @returns {View} Element had been removed.
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
     * @language=en
     * Remove all children elements.
     * @returns {Container} Container itself.
     */
    removeAllChildren: function(){
        while(this.children.length) this.removeChildAt(0);
        return this;
    },

    /**
     * @language=en
     * Return child element at the given index.
     * @param {Number} index The index of the element, range from 0.
     */
    getChildAt: function(index){
        var children = this.children;
        if(index < 0 || index >= children.length) return null;
        return children[index];
    },

    /**
     * @language=en
     * Return child element at the given id.
     * @param {String} id The id of child element to return.
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
     * @language=en
     * Return index value of the given child element.
     * @param {View} child The child element need to get its index.
     */
    getChildIndex: function(child){
        return this.children.indexOf(child);
    },

    /**
     * @language=en
     * Set the index of child element.
     * @param {View} child The child element need to set index.
     * @param {Number} index The index to set to the element.
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
     * @language=en
     * Swap index between two child elements.
     * @param {View} child1 Child element A.
     * @param {View} child2 Child element B.
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
     * @language=en
     * Swap two children elements at given indexes.
     * @param {Number} index1 Given index A.
     * @param {Number} index2 Given index B.
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
     * @language=en
     * Sort children elements by the given key or function.
     * @param {Object} keyOrFunction If is String, sort children elements by the given property string; If is Function, sort by the function.
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
     * @language=en
     * Update children elements.
     * @private
     */
    _updateChildren: function(start, end){
        var children = this.children, child;
        start = start || 0;
        end = end || children.length;
        for(var i = start; i < end; i++){
            child = children[i];
            child.depth = i + 1;
            child.parent = this;
        }
    },

    /**
     * @language=en
     * Return whether this container contains the parameter described child element.
     * @param {View} child The child element to test.
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
     * @language=en
     * Return object at the point positioned by given values on x axis and y axis.
     * @param {Number} x The point's value on the coordinate's x axis.
     * @param {Number} y The point's value on the coordinate's y asix.
     * @param {Boolean} usePolyCollision Whether use polygon collision detection, default value is false.
     * @param {Boolean} global Whether return all elements that match the condition, default value is false.
     * @param {Boolean} eventMode Whether find elements under event mode, default value is false.
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
     * @language=en
     * Rewrite render method.
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

window.Hilo.Container = Container;
})(window);