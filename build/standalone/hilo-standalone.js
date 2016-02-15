/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @namespace Hilo的基础核心方法集合。
 * @static
 * @module hilo/core/Hilo
 */
var Hilo = (function(){

var win = window, doc = document, docElem = doc.documentElement,
    uid = 0;

return {
    /**
     * 获取一个全局唯一的id。如Stage1，Bitmap2等。
     * @param {String} prefix 生成id的前缀。
     * @returns {String} 全局唯一id。
     */
    getUid: function(prefix){
        var id = ++uid;
        if(prefix){
            var charCode = prefix.charCodeAt(prefix.length - 1);
            if (charCode >= 48 && charCode <= 57) prefix += "_"; //0至9之间添加下划线
            return prefix + id;
        }
        return id;
    },

    /**
     * 为指定的可视对象生成一个包含路径的字符串表示形式。如Stage1.Container2.Bitmap3。
     * @param {View} view 指定的可视对象。
     * @returns {String} 可视对象的字符串表示形式。
     */
    viewToString: function(view){
        var result, obj = view;
        while(obj){
            result = result ? (obj.id + '.' + result) : obj.id;
            obj = obj.parent;
        }
        return result;
    },

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
    },

    /**
     * 浏览器特性集合。包括：
     * <ul>
     * <li><b>jsVendor</b> - 浏览器厂商CSS前缀的js值。比如：webkit。</li>
     * <li><b>cssVendor</b> - 浏览器厂商CSS前缀的css值。比如：-webkit-。</li>
     * <li><b>supportTransform</b> - 是否支持CSS Transform变换。</li>
     * <li><b>supportTransform3D</b> - 是否支持CSS Transform 3D变换。</li>
     * <li><b>supportStorage</b> - 是否支持本地存储localStorage。</li>
     * <li><b>supportTouch</b> - 是否支持触碰事件。</li>
     * <li><b>supportCanvas</b> - 是否支持canvas元素。</li>
     * </ul>
     */
    browser: (function(){
        var ua = navigator.userAgent;
        var data = {
            iphone: /iphone/i.test(ua),
            ipad: /ipad/i.test(ua),
            ipod: /ipod/i.test(ua),
            ios: /iphone|ipad|ipod/i.test(ua),
            android: /android/i.test(ua),
            webkit: /webkit/i.test(ua),
            chrome: /chrome/i.test(ua),
            safari: /safari/i.test(ua),
            firefox: /firefox/i.test(ua),
            ie: /msie/i.test(ua),
            opera: /opera/i.test(ua),
            supportTouch: 'ontouchstart' in win,
            supportCanvas: doc.createElement('canvas').getContext != null,
            supportStorage: false,
            supportOrientation: 'orientation' in win,
            supportDeviceMotion: 'ondevicemotion' in win
        };

        //`localStorage` is null or `localStorage.setItem` throws error in some cases (e.g. localStorage is disabled)
        try{
            var value = 'hilo';
            localStorage.setItem(value, value);
            localStorage.removeItem(value);
            data.supportStorage = true;
        }catch(e){ };

        //vendro prefix
        var jsVendor = data.jsVendor = data.webkit ? 'webkit' : data.firefox ? 'Moz' : data.opera ? 'O' : data.ie ? 'ms' : '';
        var cssVendor = data.cssVendor = '-' + jsVendor + '-';

        //css transform/3d feature dectection
        var testElem = doc.createElement('div'), style = testElem.style;
        var supportTransform = style[jsVendor + 'Transform'] != undefined;
        var supportTransform3D = style[jsVendor + 'Perspective'] != undefined;
        if(supportTransform3D){
            testElem.id = 'test3d';
            style = doc.createElement('style');
            style.textContent = '@media ('+ cssVendor +'transform-3d){#test3d{height:3px}}';
            doc.head.appendChild(style);

            docElem.appendChild(testElem);
            supportTransform3D = testElem.offsetHeight == 3;
            doc.head.removeChild(style);
            docElem.removeChild(testElem);
        };
        data.supportTransform = supportTransform;
        data.supportTransform3D = supportTransform3D;

        return data;
    })(),

    /**
     * 事件类型枚举对象。包括：
     * <ul>
     * <li><b>POINTER_START</b> - 鼠标或触碰开始事件。对应touchstart或mousedown。</li>
     * <li><b>POINTER_MOVE</b> - 鼠标或触碰移动事件。对应touchmove或mousemove。</li>
     * <li><b>POINTER_END</b> - 鼠标或触碰结束事件。对应touchend或mouseup。</li>
     * </ul>
     */
    event: (function(){
        var supportTouch = 'ontouchstart' in win;
        return {
            POINTER_START: supportTouch ? 'touchstart' : 'mousedown',
            POINTER_MOVE: supportTouch ? 'touchmove' : 'mousemove',
            POINTER_END: supportTouch ? 'touchend' : 'mouseup'
        };
    })(),

    /**
     * 可视对象对齐方式枚举对象。包括：
     * <ul>
     * <li><b>TOP_LEFT</b> - 左上角对齐。</li>
     * <li><b>TOP</b> - 顶部居中对齐。</li>
     * <li><b>TOP_RIGHT</b> - 右上角对齐。</li>
     * <li><b>LEFT</b> - 左边居中对齐。</li>
     * <li><b>CENTER</b> - 居中对齐。</li>
     * <li><b>RIGHT</b> - 右边居中对齐。</li>
     * <li><b>BOTTOM_LEFT</b> - 左下角对齐。</li>
     * <li><b>BOTTOM</b> - 底部居中对齐。</li>
     * <li><b>BOTTOM_RIGHT</b> - 右下角对齐。</li>
     * </ul>
     */
    align: {
        TOP_LEFT: 'TL', //top & left
        TOP: 'T', //top & center
        TOP_RIGHT: 'TR', //top & right
        LEFT: 'L', //left & center
        CENTER: 'C', //center
        RIGHT: 'R', //right & center
        BOTTOM_LEFT: 'BL', //bottom & left
        BOTTOM: 'B', //bottom & center
        BOTTOM_RIGHT: 'BR' //bottom & right
    },

    /**
     * 获取DOM元素在页面中的内容显示区域。
     * @param {HTMLElement} elem DOM元素。
     * @returns {Object} DOM元素的可视区域。格式为：{left:0, top:0, width:100, height:100}。
     */
    getElementRect: function(elem){
        try{
            //this fails if it's a disconnected DOM node
            var bounds = elem.getBoundingClientRect();
        }catch(e){
            bounds = {top:elem.offsetTop, left:elem.offsetLeft, width:elem.offsetWidth, height:elem.offsetHeight};
        }

        var offsetX = ((win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)) || 0;
        var offsetY = ((win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0)) || 0;
        var styles = win.getComputedStyle ? getComputedStyle(elem) : elem.currentStyle;
        var parseIntFn = parseInt;

        var padLeft = (parseIntFn(styles.paddingLeft) + parseIntFn(styles.borderLeftWidth)) || 0;
        var padTop = (parseIntFn(styles.paddingTop) + parseIntFn(styles.borderTopWidth)) || 0;
        var padRight = (parseIntFn(styles.paddingRight) + parseIntFn(styles.borderRightWidth)) || 0;
        var padBottom = (parseIntFn(styles.paddingBottom) + parseIntFn(styles.borderBottomWidth)) || 0;
        var top = bounds.top || 0;
        var left = bounds.left || 0;

        return {
            left: left + offsetX + padLeft,
            top: top + offsetY + padTop,
            width: bounds.right - padRight - left - padLeft,
            height: bounds.bottom - padBottom - top - padTop
        };
    },

    /**
     * 创建一个DOM元素。可指定属性和样式。
     * @param {String} type 要创建的DOM元素的类型。比如：'div'。
     * @param {Object} properties 指定DOM元素的属性和样式。
     * @returns {HTMLElement} 一个DOM元素。
     */
    createElement: function(type, properties){
        var elem = doc.createElement(type), p, val, s;
        for(p in properties){
            val = properties[p];
            if(p === 'style'){
                for(s in val) elem.style[s] = val[s];
            }else{
                elem[p] = val;
            }
        }
        return elem;
    },

    /**
     * 根据参数id获取一个DOM元素。此方法等价于document.getElementById(id)。
     * @param {String} id 要获取的DOM元素的id。
     * @returns {HTMLElement} 一个DOM元素。
     */
    getElement: function(id){
        return doc.getElementById(id);
    },

    /**
     * 设置可视对象DOM元素的CSS样式。
     * @param {View} obj 指定要设置CSS样式的可视对象。
     * @private
     */
    setElementStyleByView: function(obj){
        var drawable = obj.drawable,
            style = drawable.domElement.style,
            stateCache = obj._stateCache || (obj._stateCache = {}),
            prefix = Hilo.browser.jsVendor, px = 'px', flag = false;

        if(this.cacheStateIfChanged(obj, ['visible'], stateCache)){
            style.display = !obj.visible ? 'none' : '';
        }
        if(this.cacheStateIfChanged(obj, ['alpha'], stateCache)){
            style.opacity = obj.alpha;
        }
        if(!obj.visible || obj.alpha <= 0) return;

        if(this.cacheStateIfChanged(obj, ['width'], stateCache)){
            style.width = obj.width + px;
        }
        if(this.cacheStateIfChanged(obj, ['height'], stateCache)){
            style.height = obj.height + px;
        }
        if(this.cacheStateIfChanged(obj, ['depth'], stateCache)){
            style.zIndex = obj.depth + 1;
        }
        if(flag = this.cacheStateIfChanged(obj, ['pivotX', 'pivotY'], stateCache)){
            style[prefix + 'TransformOrigin'] = obj.pivotX + px + ' ' + obj.pivotY + px;
        }
        if(this.cacheStateIfChanged(obj, ['x', 'y', 'rotation', 'scaleX', 'scaleY'], stateCache) || flag){
            style[prefix + 'Transform'] = this.getTransformCSS(obj);
        }
        if(this.cacheStateIfChanged(obj, ['background'], stateCache)){
            style.backgroundColor = obj.background;
        }
        if(!style.pointerEvents){
            style.pointerEvents = 'none';
        }

        //render image as background
        var image = drawable.image;
        if(image){
            var src = image.src;
            if(src !== stateCache.image){
                stateCache.image = src;
                style.backgroundImage = 'url(' + src + ')';
            }

            var rect = drawable.rect;
            if(rect){
                var sx = rect[0], sy = rect[1];
                if(sx !== stateCache.sx){
                    stateCache.sx = sx;
                    style.backgroundPositionX = -sx + px;
                }
                if(sy !== stateCache.sy){
                    stateCache.sy = sy;
                    style.backgroundPositionY = -sy + px;
                }
            }
        }

        //render mask
        var mask = obj.mask;
        if(mask){
            var maskImage = mask.drawable.domElement.style.backgroundImage;
            if(maskImage !== stateCache.maskImage){
                stateCache.maskImage = maskImage;
                style[prefix + 'MaskImage'] = maskImage;
                style[prefix + 'MaskRepeat'] = 'no-repeat';
            }

            var maskX = mask.x, maskY = mask.y;
            if(maskX !== stateCache.maskX || maskY !== stateCache.maskY){
                stateCache.maskX = maskX;
                stateCache.maskY = maskY;
                style[prefix + 'MaskPosition'] = maskX + px + ' ' + maskY + px;
            }
        }
    },

    /**
     * @private
     */
    cacheStateIfChanged: function(obj, propNames, stateCache){
        var i, len, name, value, changed = false;
        for(i = 0, len = propNames.length; i < len; i++){
            name = propNames[i];
            value = obj[name];
            if(value != stateCache[name]){
                stateCache[name] = value;
                changed = true;
            }
        }
        return changed;
    },

    /**
     * 生成可视对象的CSS变换样式。
     * @param {View} obj 指定生成CSS变换样式的可视对象。
     * @returns {String} 生成的CSS样式字符串。
     */
    getTransformCSS: function(obj){
        var use3d = this.browser.supportTransform3D,
            str3d = use3d ? '3d' : '';

        return 'translate' + str3d + '(' + (obj.x - obj.pivotX) + 'px, ' + (obj.y - obj.pivotY) + (use3d ? 'px, 0px)' : 'px)')
             + 'rotate' + str3d + (use3d ? '(0, 0, 1, ' : '(') + obj.rotation + 'deg)'
             + 'scale' + str3d + '(' + obj.scaleX + ', ' + obj.scaleY + (use3d ? ', 1)' : ')');
    }
};

})();
window.Hilo = Hilo;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
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

Hilo.Class = Class;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Matrix类表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。
 * @param {Number} a 缩放或旋转图像时影响像素沿 x 轴定位的值。
 * @param {Number} b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
 * @param {Number} c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
 * @param {Number} d 缩放或旋转图像时影响像素沿 y 轴定位的值。
 * @param {Number} tx 沿 x 轴平移每个点的距离。
 * @param {Number} ty 沿 y 轴平移每个点的距离。
 * @module hilo/geom/Matrix
 * @requires hilo/core/Class
 */
var Matrix = Class.create(/** @lends Matrix.prototype */{
    constructor: function(a, b, c, d, tx, ty){
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * 将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * @param {Matrix} mtx 要连接到源矩阵的矩阵。
     * @returns {Matrix} 一个Matrix对象。
     */
    concat: function(mtx){
        var args = arguments,
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        if(args.length >= 6){
            var ma = args[0], mb = args[1], mc = args[2],
                md = args[3], mx = args[4], my = args[5];
        }else{
            ma = mtx.a;
            mb = mtx.b;
            mc = mtx.c;
            md = mtx.d;
            mx = mtx.tx;
            my = mtx.ty;
        }

        this.a = a * ma + b * mc;
        this.b = a * mb + b * md;
        this.c = c * ma + d * mc;
        this.d = c * mb + d * md;
        this.tx = tx * ma + ty * mc + mx;
        this.ty = tx * mb + ty * md + my;
        return this;
    },

    /**
     * 对 Matrix 对象应用旋转转换。
     * @param {Number} angle 旋转的角度。
     * @returns {Matrix} 一个Matrix对象。
     */
    rotate: function(angle){
        var sin = Math.sin(angle), cos = Math.cos(angle),
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        this.a = a * cos - b * sin;
        this.b = a * sin + b * cos;
        this.c = c * cos - d * sin;
        this.d = c * sin + d * cos;
        this.tx = tx * cos - ty * sin;
        this.ty = tx * sin + ty * cos;
        return this;
    },

    /**
     * 对矩阵应用缩放转换。
     * @param {Number} sx 用于沿 x 轴缩放对象的乘数。
     * @param {Number} sy 用于沿 y 轴缩放对象的乘数。
     * @returns {Matrix} 一个Matrix对象。
     */
    scale: function(sx, sy){
        this.a *= sx;
        this.d *= sy;
        this.c *= sx;
        this.b *= sy;
        this.tx *= sx;
        this.ty *= sy;
        return this;
    },

    /**
     * 沿 x 和 y 轴平移矩阵，由 dx 和 dy 参数指定。
     * @param {Number} dx 沿 x 轴向右移动的量（以像素为单位）。
     * @param {Number} dy 沿 y 轴向右移动的量（以像素为单位）。
     * @returns {Matrix} 一个Matrix对象。
     */
    translate: function(dx, dy){
        this.tx += dx;
        this.ty += dy;
        return this;
    },

    /**
     * 为每个矩阵属性设置一个值，该值将导致 null 转换。通过应用恒等矩阵转换的对象将与原始对象完全相同。
     * @returns {Matrix} 一个Matrix对象。
     */
    identity: function(){
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    },

    /**
     * 执行原始矩阵的逆转换。您可以将一个逆矩阵应用于对象来撤消在应用原始矩阵时执行的转换。
     * @returns {Matrix} 一个Matrix对象。
     */
    invert: function(){
        var a = this.a;
        var b = this.b;
        var c = this.c;
        var d = this.d;
        var tx = this.tx;
        var i = a * d - b * c;

        this.a = d / i;
        this.b = -b / i;
        this.c = -c / i;
        this.d = a / i;
        this.tx = (c * this.ty - d * tx) / i;
        this.ty = -(a * this.ty - b * tx) / i;
        return this;
    },

    /**
     * 返回将 Matrix 对象表示的几何转换应用于指定点所产生的结果。
     * @param {Object} point 想要获得其矩阵转换结果的点。
     * @param {Boolean} round 是否对点的坐标进行向上取整。
     * @param {Boolean} returnNew 是否返回一个新的点。
     * @returns {Object} 由应用矩阵转换所产生的点。
     */
    transformPoint: function(point, round, returnNew){
        var x = point.x * this.a + point.y * this.c + this.tx,
            y = point.x * this.b + point.y * this.d + this.ty;

        if(round){
            x = x + 0.5 >> 0;
            y = y + 0.5 >> 0;
        }
        if(returnNew) return {x:x, y:y};
        point.x = x;
        point.y = y;
        return point;
    }

});
Hilo.Matrix = Matrix;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
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

Hilo.EventMixin = EventMixin;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Drawable是可绘制图像的包装。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Drawable
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} image 要绘制的图像。即可被CanvasRenderingContext2D.drawImage使用的对象类型，可以是HTMLImageElement、HTMLCanvasElement、HTMLVideoElement等对象。
 * @property {array} rect 要绘制的图像的矩形区域。
 */
var Drawable = Class.create(/** @lends Drawable.prototype */{
    constructor: function(properties){
        this.init(properties);
    },

    image: null,
    rect: null,

    /**
     * 初始化可绘制对象。
     * @param {Object} properties 要初始化的属性。
     */
    init: function(properties){
        var me = this, oldImage = me.image;
        if(Drawable.isDrawable(properties)){
            me.image = properties;
        }else{
            Hilo.copy(me, properties, true);
        }

        var image = me.image;
        if(typeof image === 'string'){
            if(oldImage && image === oldImage.getAttribute('src')){
                image = me.image = oldImage;
            }else{
                me.image = null;
                //load image dynamically
                var img = new Image();
                img.onload = function(){
                    img.onload = null;
                    me.init(img);
                };
                img.src = image;
                return;
            }
        }

        if(image && !me.rect) me.rect = [0, 0, image.width, image.height];
    },

    Statics: /** @lends Drawable */{
        /**
         * 判断参数elem指定的元素是否可包装成Drawable对象。
         * @param {Object} elem 要测试的对象。
         * @return {Boolean} 如果是可包装成Drawable对象则返回true，否则为false。
         */
        isDrawable: function(elem){
            if(!elem || !elem.tagName) return false;
            var tagName = elem.tagName.toLowerCase();
            return tagName === "img" || tagName === "canvas" || tagName === "video";
        }
    }
});
Hilo.Drawable = Drawable;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class 渲染器抽象基类。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Object} canvas 渲染器对应的画布。它可能是一个普通的DOM元素，比如div，也可以是一个canvas画布元素。只读属性。
 * @property {Object} stage 渲染器对应的舞台。只读属性。
 * @property {String} renderType 渲染方式。只读属性。
 */
var Renderer = Class.create(/** @lends Renderer.prototype */{
    constructor: function(properties){
        properties = properties || {};
        Hilo.copy(this, properties, true);
    },

    renderType:null,
    canvas: null,
    stage: null,

    /**
     * 为开始绘制可视对象做准备。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    startDraw: function(target){ },

    /**
     * 绘制可视对象。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    draw: function(target){ },

    /**
     * 结束绘制可视对象后的后续处理方法。需要子类来实现。
     * @param {View} target 要绘制的可视对象。
     */
    endDraw: function(target){ },

    /**
     * 对可视对象进行变换。需要子类来实现。
     */
    transform: function(){ },

    /**
     * 隐藏可视对象。需要子类来实现。
     */
    hide: function(){ },

    /**
     * 从画布中删除可视对象。注意：不是从stage中删除对象。需要子类来实现。
     * @param {View} target 要删除的可视对象。
     */
    remove: function(target){ },

    /**
     * 清除画布指定区域。需要子类来实现。
     * @param {Number} x 指定区域的x轴坐标。
     * @param {Number} y 指定区域的y轴坐标。
     * @param {Number} width 指定区域的宽度。
     * @param {Number} height 指定区域的高度。
     */
    clear: function(x, y, width, height){ },

    /**
     * 改变渲染器的画布大小。
     * @param {Number} width 指定渲染画布新的宽度。
     * @param {Number} height 指定渲染画布新的高度。
     */
    resize: function(width, height){ }

});
Hilo.Renderer = Renderer;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Renderer = Hilo.Renderer;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class canvas画布渲染器。所有可视对象将渲染在canvas画布上。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/CanvasRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @property {CanvasRenderingContext2D} context canvas画布的上下文。只读属性。
 */
var CanvasRenderer = Class.create(/** @lends CanvasRenderer.prototype */{
    Extends: Renderer,
    constructor: function(properties){
        CanvasRenderer.superclass.constructor.call(this, properties);

        this.context = this.canvas.getContext("2d");
    },
    renderType:'canvas',
    context: null,

    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        if(target.visible && target.alpha > 0){
            if(target === this.stage){
                this.context.clearRect(0, 0, target.width, target.height);
            }
            this.context.save();
            return true;
        }
        return false;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var ctx = this.context, w = target.width, h = target.height;

        //draw background
        var bg = target.background;
        if(bg){
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);
        }

        //draw image
        var drawable = target.drawable, image = drawable && drawable.image;
        if(image){
            var rect = drawable.rect, sw = rect[2], sh = rect[3], offsetX = rect[4], offsetY = rect[5];
            //ie9+浏览器宽高为0时会报错
            if(!sw || !sh){
                return;
            }
            if(!w && !h){
                //fix width/height TODO: how to get rid of this?
                w = target.width = sw;
                h = target.height = sh;
            }
            //the pivot is the center of frame if has offset, otherwise is (0, 0)
            if(offsetX || offsetY) ctx.translate(offsetX - sw * 0.5, offsetY - sh * 0.5);
            ctx.drawImage(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
        }
    },

    /**
     * @private
     * @see Renderer#endDraw
     */
    endDraw: function(target){
        this.context.restore();
    },

    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        var drawable = target.drawable;
        if(drawable && drawable.domElement){
            Hilo.setElementStyleByView(target);
            return;
        }

        var ctx = this.context,
            scaleX = target.scaleX,
            scaleY = target.scaleY;

        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
        }else{
            var x = target.x,
                y = target.y,
                pivotX = target.pivotX,
                pivotY = target.pivotY,
                rotation = target.rotation % 360,
                mask = target.mask;

            if(mask){
                mask._render(this);
                ctx.clip();
            }

            //alignment
            var align = target.align;
            if(align){
                if(typeof align === 'function'){
                    target.align();
                }else{
                    var parent = target.parent;
                    if(parent){
                        var w = target.width, h = target.height,
                            pw = parent.width, ph = parent.height;
                        switch(align){
                            case 'TL':
                                x = 0;
                                y = 0;
                                break;
                            case 'T':
                                x = pw - w >> 1;
                                y = 0;
                                break;
                            case 'TR':
                                x = pw - w;
                                y = 0;
                                break;
                            case 'L':
                                x = 0;
                                y = ph - h >> 1;
                                break;
                            case 'C':
                                x = pw - w >> 1;
                                y = ph - h >> 1;
                                break;
                            case 'R':
                                x = pw - w;
                                y = ph - h >> 1;
                                break;
                            case 'BL':
                                x = 0;
                                y = ph - h;
                                break;
                            case 'B':
                                x = pw - w >> 1;
                                y = ph - h;
                                break;
                            case 'BR':
                                x = pw - w;
                                y = ph - h;
                                break;
                        }
                    }
                }
            }

            if(x != 0 || y != 0) ctx.translate(x, y);
            if(rotation != 0) ctx.rotate(rotation * Math.PI / 180);
            if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
            if(pivotX != 0 || pivotY != 0) ctx.translate(-pivotX, -pivotY);
        }

        if(target.alpha > 0) ctx.globalAlpha *= target.alpha;
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var drawable = target.drawable;
        var elem = drawable && drawable.domElement;

        if(elem){
            var parentElem = elem.parentNode;
            if(parentElem){
                parentElem.removeChild(elem);
            }
        }
    },

    /**
     * @private
     * @see Renderer#clear
     */
    clear: function(x, y, width, height){
        this.context.clearRect(x, y, width, height);
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
    }

});
Hilo.CanvasRenderer = CanvasRenderer;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Renderer = Hilo.Renderer;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class DOM+CSS3渲染器。将可视对象以DOM元素方式渲染出来。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/DOMRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @requires hilo/view/Drawable
 */
var DOMRenderer = (function(){

return Class.create({
    Extends: Renderer,
    constructor: function(properties){
        DOMRenderer.superclass.constructor.call(this, properties);
    },
    renderType:'dom',
    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        //prepare drawable
        var drawable = (target.drawable = target.drawable || new Drawable());
        drawable.domElement = drawable.domElement || createDOMDrawable(target, drawable);
        return true;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var parent = target.parent,
            targetElem = target.drawable.domElement,
            currentParent = targetElem.parentNode;

        if(parent){
            var parentElem = parent.drawable.domElement;
            if(parentElem != currentParent){
                parentElem.appendChild(targetElem);
            }
            //fix image load bug
            if(!target.width && !target.height){
                var rect = target.drawable.rect;
                if(rect && (rect[2] || rect[3])){
                    target.width = rect[2];
                    target.height = rect[3];
                }
            }
        }
        else if(target === this.stage && !currentParent){
            targetElem.style.overflow = 'hidden';
            this.canvas.appendChild(targetElem);
        }
    },

    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        Hilo.setElementStyleByView(target);
        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY,
                scaleX = target.scaleX,
                scaleY = target.scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
        }
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var drawable = target.drawable;
        var elem = drawable && drawable.domElement;

        if(elem){
            var parentElem = elem.parentNode;
            if(parentElem){
                parentElem.removeChild(elem);
            }
        }
    },

    /**
     * @private
     * @see Renderer#hide
     */
    hide: function(target){
        var elem = target.drawable && target.drawable.domElement;
        if(elem) elem.style.display = 'none';
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        var style = this.canvas.style;
        style.width = width + 'px';
        style.height = height + 'px';
        if(style.position != "absolute") {
          style.position = "relative";
        }
    }
});

/**
 * 创建一个可渲染的DOM，可指定tagName，如canvas或div。
 * @param {Object} view 一个可视对象或类似的对象。
 * @param {Object} imageObj 指定渲染的image及相关设置，如绘制区域rect。
 * @return {HTMLElement} 新创建的DOM对象。
 * @private
 */
function createDOMDrawable(view, imageObj){
    var tag = view.tagName || "div",
        img = imageObj.image,
        w = view.width || (img && img.width),
        h =  view.height || (img && img.height),
        elem = Hilo.createElement(tag), style = elem.style;

    if(view.id) elem.id = view.id;
    style.position = "absolute";
    style.left = (view.left || 0) + "px";
    style.top = (view.top || 0) + "px";
    style.width = w + "px";
    style.height = h + "px";

    if(tag == "canvas"){
        elem.width = w;
        elem.height = h;
        if(img){
            var ctx = elem.getContext("2d");
            var rect = imageObj.rect || [0, 0, w, h];
            ctx.drawImage(img, rect[0], rect[1], rect[2], rect[3],
                         (view.x || 0), (view.y || 0),
                         (view.width || rect[2]),
                         (view.height || rect[3]));
        }
    }else{
        style.opacity = view.alpha != undefined ? view.alpha : 1;
        if(view === this.stage || view.clipChildren) style.overflow = "hidden";
        if(img && img.src){
            style.backgroundImage = "url(" + img.src + ")";
            var bgX = view.rectX || 0, bgY = view.rectY || 0;
            style.backgroundPosition = (-bgX) + "px " + (-bgY) + "px";
        }
    }
    return elem;
}

})();

Hilo.DOMRenderer = DOMRenderer;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Renderer = Hilo.Renderer;
var Matrix = Hilo.Matrix;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * Heavily inspired by PIXI's SpriteRenderer:
 * https://github.com/pixijs/pixi.js/blob/v3.0.9/src/core/sprites/webgl/SpriteRenderer.js
 */

var DEG2RAD = Math.PI / 180;
/**
 * @class webgl画布渲染器。所有可视对象将渲染在canvas画布上。
 * @augments Renderer
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/renderer/WebGLRenderer
 * @requires hilo/core/Class
 * @requires hilo/renderer/Renderer
 * @requires  hilo/geom/Matrix
 * @property {WebGLRenderingContext} gl webgl上下文。只读属性。
 */
var WebGLRenderer = Class.create(/** @lends WebGLRenderer.prototype */{
    Extends: Renderer,
    Statics:/** @lends WebGLRenderer */{
        /**
         * 最大批渲染数量。
         * @type {Number}
         */
        MAX_BATCH_NUM:2000,
        /**
         * 顶点属性数。只读属性。
         * @type {Number}
         */
        ATTRIBUTE_NUM:5,
        /**
         * 是否支持WebGL。只读属性。
         * @type {Boolean}
         */
        isSupport:null
    },
    renderType:'webgl',
    gl:null,
    constructor: function(properties){
        window.__render = this;
        WebGLRenderer.superclass.constructor.call(this, properties);
        var gl = this.gl = this.canvas.getContext("webgl")||this.canvas.getContext('experimental-webgl');

        this.maxBatchNum = WebGLRenderer.MAX_BATCH_NUM;
        this.positionStride = WebGLRenderer.ATTRIBUTE_NUM * 4;
        var vertexNum = this.maxBatchNum * WebGLRenderer.ATTRIBUTE_NUM * 4;
        var indexNum = this.maxBatchNum * 6;
        this.positions = new Float32Array(vertexNum);
        this.indexs = new Uint16Array(indexNum);
        for (var i=0, j=0; i < indexNum; i += 6, j += 4)
        {
            this.indexs[i + 0] = j + 0;
            this.indexs[i + 1] = j + 1;
            this.indexs[i + 2] = j + 2;
            this.indexs[i + 3] = j + 1;
            this.indexs[i + 4] = j + 2;
            this.indexs[i + 5] = j + 3;
        }
        this.batchIndex = 0;
        this.sprites = [];

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);

        this._initShaders();
        this.defaultShader.active();

        this.positionBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexs, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, this.positionStride, 0);//x, y
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, this.positionStride, 2 * 4);//x, y
        gl.vertexAttribPointer(this.a_alpha, 1, gl.FLOAT, false, this.positionStride, 4 * 4);//alpha
    },

    context: null,

    /**
     * @private
     * @see Renderer#startDraw
     */
    startDraw: function(target){
        if(target.visible && target.alpha > 0){
            if(target === this.stage){
                this.clear();
            }
            return true;
        }
        return false;
    },

    /**
     * @private
     * @see Renderer#draw
     */
    draw: function(target){
        var ctx = this.context, w = target.width, h = target.height;

        //TODO:draw background
        var bg = target.background;

        //draw image
        var drawable = target.drawable, image = drawable && drawable.image;
        if(image){
            var gl = this.gl;
            if(!image.texture){
                this.activeShader.uploadTexture(image);
            }

            var rect = drawable.rect, sw = rect[2], sh = rect[3], offsetX = rect[4], offsetY = rect[5];
            if(!w && !h){
                //fix width/height TODO: how to get rid of this?
                w = target.width = sw;
                h = target.height = sh;
            }

            if(this.batchIndex >= this.maxBatchNum){
                this._renderBatches();
            }

            var vertexs = this._createVertexs(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
            var index = this.batchIndex * this.positionStride;
            var positions = this.positions;
            var alpha = target.__webglRenderAlpha;
            positions[index + 0] = vertexs[0];//x
            positions[index + 1] = vertexs[1];//y
            positions[index + 2] = vertexs[2];//uvx
            positions[index + 3] = vertexs[3];//uvy
            positions[index + 4] = alpha;//alpha

            positions[index + 5] = vertexs[4];
            positions[index + 6] = vertexs[5];
            positions[index + 7] = vertexs[6];
            positions[index + 8] = vertexs[7];
            positions[index + 9] = alpha;

            positions[index + 10] = vertexs[8]
            positions[index + 11] = vertexs[9]
            positions[index + 12] = vertexs[10]
            positions[index + 13] = vertexs[11]
            positions[index + 14] = alpha;

            positions[index + 15] = vertexs[12]
            positions[index + 16] = vertexs[13]
            positions[index + 17] = vertexs[14]
            positions[index + 18] = vertexs[15]
            positions[index + 19] = alpha;

            var matrix = target.__webglWorldMatrix;
            for(var i = 0;i < 4;i ++){
                var x = positions[index + i*5];
                var y = positions[index + i*5 + 1];

                positions[index + i*5] = matrix.a*x+matrix.c*y + matrix.tx;
                positions[index + i*5 + 1] = matrix.b*x+matrix.d*y + matrix.ty;
            }

            target.texture = image.texture;
            this.sprites[this.batchIndex++] = target;
        }
    },

    /**
     * @private
     * @see Renderer#endDraw
     */
    endDraw: function(target){
        if(target === this.stage){
            this._renderBatches();
        }
    },
    /**
     * @private
     * @see Renderer#transform
     */
    transform: function(target){
        var drawable = target.drawable;
        if(drawable && drawable.domElement){
            Hilo.setElementStyleByView(target);
            return;
        }

        var ctx = this.context,
            scaleX = target.scaleX,
            scaleY = target.scaleY;

        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
            }
            target.__webglWorldMatrix = target.__webglWorldMatrix||new Matrix(1, 0, 0, 1, 0, 0);
        }else{
            target.__webglWorldMatrix = target.__webglWorldMatrix||new Matrix(1, 0, 0, 1, 0, 0);
            this._setConcatenatedMatrix(target, target.parent);
        }

        if(target.alpha > 0) {
            if(target.parent && target.parent.__webglRenderAlpha){
                target.__webglRenderAlpha = target.alpha * target.parent.__webglRenderAlpha;
            }
            else{
                target.__webglRenderAlpha = target.alpha;
            }
        }
    },

    /**
     * @private
     * @see Renderer#remove
     */
    remove: function(target){
        var drawable = target.drawable;
        var elem = drawable && drawable.domElement;

        if(elem){
            var parentElem = elem.parentNode;
            if(parentElem){
                parentElem.removeChild(elem);
            }
        }
    },

    /**
     * @private
     * @see Renderer#clear
     */
    clear: function(x, y, width, height){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    },

    /**
     * @private
     * @see Renderer#resize
     */
    resize: function(width, height){
        if(this.width !== width || this.height !== height){
            this.width = this.canvas.width = width;
            this.height = this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);

            this.canvasHalfWidth = width * .5;
            this.canvasHalfHeight = height * .5;

            this._uploadProjectionTransform(true);
        }
    },
    _renderBatches:function(){
        var gl = this.gl;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions.subarray(0, this.batchIndex * this.positionStride));
        var startIndex = 0;
        var batchNum = 0;
        var preTexture = null;
        for(var i = 0;i < this.batchIndex;i ++){
            var sprite = this.sprites[i];
            if(preTexture && preTexture !== sprite.texture){
                this._renderBatch(startIndex, i);
                startIndex = i;
                batchNum = 1;
            }
            preTexture = sprite.texture;
        }
        this._renderBatch(startIndex, this.batchIndex);
        this.batchIndex = 0;
    },
    _renderBatch:function(start, end){
        var gl = this.gl;
        var num = end - start;
        if(num > 0){
            gl.bindTexture(gl.TEXTURE_2D, this.sprites[start].texture);
            gl.drawElements(gl.TRIANGLES, num * 6, gl.UNSIGNED_SHORT, start * 6 * 2);
        }
    },
    _uploadProjectionTransform:function(force){
        if(!this._projectionTransformElements||force){
            this._projectionTransformElements = new Float32Array([
                1/this.canvasHalfWidth, 0, 0,
                0, -1/this.canvasHalfHeight, 0,
                -1, 1, 1,
            ]);
        }

        this.gl.uniformMatrix3fv(this.u_projectionTransform, false, this._projectionTransformElements);
    },
    _initShaders:function(){
        var VSHADER_SOURCE ='\
            attribute vec2 a_position;\n\
            attribute vec2 a_TexCoord;\n\
            attribute float a_alpha;\n\
            uniform mat3 u_projectionTransform;\n\
            varying vec2 v_TexCoord;\n\
            varying float v_alpha;\n\
            void main(){\n\
                gl_Position =  vec4((u_projectionTransform * vec3(a_position, 1.0)).xy, 1.0, 1.0);\n\
                v_TexCoord = a_TexCoord;\n\
                v_alpha = a_alpha;\n\
            }\n\
        ';

        var FSHADER_SOURCE = '\n\
            precision mediump float;\n\
            uniform sampler2D u_Sampler;\n\
            varying vec2 v_TexCoord;\n\
            varying float v_alpha;\n\
            void main(){\n\
                gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_alpha;\n\
            }\n\
        ';

        this.defaultShader = new Shader(this, {
            v:VSHADER_SOURCE,
            f:FSHADER_SOURCE
        },{
            attributes:["a_position", "a_TexCoord", "a_alpha"],
            uniforms:["u_projectionTransform", "u_Alpha", "u_Sampler"]
        });
    },
    _createVertexs:function(img, tx, ty, tw, th, x, y, w, h){
        var tempVertexs = this.__tempVertexs||[];
        var width = img.width;
        var height = img.height;

        tw = tw/width;
        th = th/height;
        tx = tx/width;
        ty = ty/height;

        w = w;
        h = h;
        x = x;
        y = y;

        if(tw + tx > 1){
            tw = 1 - tx;
        }

        if(th + ty > 1){
            th = 1 - ty;
        }

        var index = 0;
        tempVertexs[index++] = x; tempVertexs[index++] = y; tempVertexs[index++] = tx; tempVertexs[index++] = ty;
        tempVertexs[index++] = x+w;tempVertexs[index++] = y; tempVertexs[index++] = tx+tw; tempVertexs[index++] = ty;
        tempVertexs[index++] = x; tempVertexs[index++] = y+h; tempVertexs[index++] = tx;tempVertexs[index++] = ty+th;
        tempVertexs[index++] = x+w;tempVertexs[index++] = y+h;tempVertexs[index++] = tx+tw;tempVertexs[index++] = ty+th;

        return tempVertexs;
    },
    _setConcatenatedMatrix:function(view, ancestor){
        var mtx = view.__webglWorldMatrix;
        var cos = 1, sin = 0,
            rotation = view.rotation % 360,
            pivotX = view.pivotX, pivotY = view.pivotY,
            scaleX = view.scaleX, scaleY = view.scaleY;

        if(rotation){
            var r = rotation * DEG2RAD;
            cos = Math.cos(r);
            sin = Math.sin(r);
        }

        mtx.a = cos*scaleX;
        mtx.b = sin*scaleX;
        mtx.c = -sin*scaleY;
        mtx.d = cos*scaleY;
        mtx.tx =  view.x - mtx.a * pivotX - mtx.c * pivotY;
        mtx.ty =  view.y - mtx.b * pivotX - mtx.d * pivotY;

        mtx.concat(ancestor.__webglWorldMatrix);
    }
});

/**
 * shader
 * @param {WebGLRenderer} renderer [description]
 * @param {Object} source
 * @param {String} source.v 顶点shader
 * @param {String} source.f 片段shader
 * @param {Object} attr
 * @param {Array} attr.attributes attribute数组
 * @param {Array} attr.uniforms uniform数组
 */
var _cacheTexture = {};
var Shader = function(renderer, source, attr){
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.program = this._createProgram(this.gl, source.v, source.f);

    attr = attr||{};
    this.attributes = attr.attributes||[];
    this.uniforms = attr.uniforms||[];
}

Shader.prototype = {
    active:function(){
        var that = this;
        var renderer = that.renderer;
        var gl = that.gl;
        var program = that.program;

        if(program && gl){
            renderer.activeShader = that;
            gl.useProgram(program);
            that.attributes.forEach(function(attribute){
                renderer[attribute] = gl.getAttribLocation(program, attribute);
                gl.enableVertexAttribArray(renderer[attribute]);
            });

            that.uniforms.forEach(function(uniform){
                renderer[uniform] = gl.getUniformLocation(program, uniform);
            });

            if(that.width !== renderer.width || that.height !== renderer.height){
                that.width = renderer.width;
                that.height = renderer.height;
                renderer._uploadProjectionTransform();
            }
        }
    },
    uploadTexture:function(image){
        var gl = this.gl;
        var renderer = this.renderer;
        if(_cacheTexture[image.src]){
            image.texture = _cacheTexture[image.src];
        }
        else{
            var texture = gl.createTexture();
            var u_Sampler = renderer.u_Sampler;


            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.uniform1i(u_Sampler, 0);
            gl.bindTexture(gl.TEXTURE_2D, null);

            image.texture = texture;
            _cacheTexture[image.src] = texture;
        }
    },
    _createProgram:function(gl, vshader, fshader){
        var vertexShader = this._createShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = this._createShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        var program = gl.createProgram();
        if (program) {
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);

            gl.linkProgram(program);

            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!linked) {
                var error = gl.getProgramInfoLog(program);
                console.log('Failed to link program: ' + error);
                gl.deleteProgram(program);
                return null;
            }
        }
        return program;
    },
    _createShader:function(gl, type, source){
        var shader = gl.createShader(type);
        if(shader){
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiled) {
                var error = gl.getShaderInfoLog(shader);
                console.log('Failed to compile shader: ' + error);
                gl.deleteShader(shader);
                return null;
            }
        }
        return shader;
    }
};

WebGLRenderer.isSupport = function(){
    if(this._isSupport !== undefined){
        return this._isSupport;
    }
    else{
        var canvas = document.createElement('canvas');
        if(canvas.getContext && (canvas.getContext('webgl')||canvas.getContext('experimental-webgl'))){
            this._isSupport = true;
        }
        else{
            this._isSupport = false;
        }
        return this._isSupport;
    }
};
Hilo.WebGLRenderer = WebGLRenderer;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var EventMixin = Hilo.EventMixin;
var Matrix = Hilo.Matrix;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class View类是所有可视对象或组件的基类。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/View
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/geom/Matrix
 * @property {String} id 可视对象的唯一标识符。
 * @property {Number} x 可视对象的x轴坐标。默认值为0。
 * @property {Number} y 可视对象的y轴坐标。默认值为0。
 * @property {Number} width 可视对象的宽度。默认值为0。
 * @property {Number} height 可视对象的高度。默认值为0。
 * @property {Number} alpha 可视对象的透明度。默认值为1。
 * @property {Number} rotation 可视对象的旋转角度。默认值为0。
 * @property {Boolean} visible 可视对象是否可见。默认为可见，即true。
 * @property {Number} pivotX 可视对象的中心点的x轴坐标。默认值为0。
 * @property {Number} pivotY 可视对象的中心点的y轴坐标。默认值为0。
 * @property {Number} scaleX 可视对象在x轴上的缩放比例。默认为不缩放，即1。
 * @property {Number} scaleY 可视对象在y轴上的缩放比例。默认为不缩放，即1。
 * @property {Boolean} pointerEnabled 可视对象是否接受交互事件。默认为接受交互事件，即true。
 * @property {Object} background 可视对象的背景样式。可以是CSS颜色值、canvas的gradient或pattern填充。
 * @property {Graphics} mask 可视对象的遮罩图形。
 * @property {String|Function} align 可视对象相对于父容器的对齐方式。取值可查看Hilo.align枚举对象。
 * @property {Container} parent 可视对象的父容器。只读属性。
 * @property {Number} depth 可视对象的深度，也即z轴的序号。只读属性。
 * @property {Drawable} drawable 可视对象的可绘制对象。供高级开发使用。
 * @property {Array} boundsArea 可视对象的区域顶点数组。格式为：[{x:10, y:10}, {x:20, y:20}]。
 */
var View = (function(){

return Class.create(/** @lends View.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("View");
        Hilo.copy(this, properties, true);
    },

    id: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    alpha: 1,
    rotation: 0,
    visible: true,
    pivotX: 0,
    pivotY: 0,
    scaleX: 1,
    scaleY: 1,
    pointerEnabled: true,
    background: null,
    mask: null,
    align: null,
    drawable: null,
    boundsArea: null,
    parent: null,
    depth: -1,

    /**
     * 返回可视对象的舞台引用。若对象没有被添加到舞台，则返回null。
     * @returns {Stage} 可视对象的舞台引用。
     */
    getStage: function(){
        var obj = this, parent;
        while(parent = obj.parent) obj = parent;
        //NOTE: don't use `instanceof` to prevent circular module requirement.
        //But it's not a very reliable way to check it's a stage instance.
        if(obj.canvas) return obj;
        return null;
    },

    /**
     * 返回可视对象缩放后的宽度。
     * @returns {Number} 可视对象缩放后的宽度。
     */
    getScaledWidth: function(){
        return this.width * this.scaleX;
    },

    /**
     * 返回可视对象缩放后的高度。
     * @returns {Number} 可视对象缩放后的高度。
     */
    getScaledHeight: function(){
        return this.height * this.scaleY;
    },

    /**
     * 添加此对象到父容器。
     * @param {Container} container 一个容器。
     * @param {Uint} index 要添加到索引位置。
     * @returns {View} 可视对象本身。
     */
    addTo: function(container, index){
        if(typeof index === 'number') container.addChildAt(this, index);
        else container.addChild(this);
        return this;
    },

    /**
     * 从父容器里删除此对象。
     * @returns {View} 可视对象本身。
     */
    removeFromParent: function(){
        var parent = this.parent;
        if(parent) parent.removeChild(this);
        return this;
    },

    /**
     * 获取可视对象在舞台全局坐标系内的外接矩形以及所有顶点坐标。
     * @returns {Array} 可视对象的顶点坐标数组vertexs。另vertexs还包含属性：
     * <ul>
     * <li><b>x</b> - 可视对象的外接矩形x轴坐标。</li>
     * <li><b>y</b> - 可视对象的外接矩形y轴坐标。</li>
     * <li><b>width</b> - 可视对象的外接矩形的宽度。</li>
     * <li><b>height</b> - 可视对象的外接矩形的高度。</li>
     * </ul>
     */
    getBounds: function(){
        var w = this.width, h = this.height,
            mtx = this.getConcatenatedMatrix(),
            poly = this.boundsArea || [{x:0, y:0}, {x:w, y:0}, {x:w, y:h}, {x:0, y:h}],
            vertexs = [], point, x, y, minX, maxX, minY, maxY;

        for(var i = 0, len = poly.length; i < len; i++){
            point = mtx.transformPoint(poly[i], true, true);
            x = point.x;
            y = point.y;

            if(i == 0){
                minX = maxX = x;
                minY = maxY = y;
            }else{
                if(minX > x) minX = x;
                else if(maxX < x) maxX = x;
                if(minY > y) minY = y;
                else if(maxY < y) maxY = y;
            }
            vertexs[i] = point;
        }

        vertexs.x = minX;
        vertexs.y = minY;
        vertexs.width = maxX - minX;
        vertexs.height = maxY - minY;
        return vertexs;
    },

    /**
     * 获取可视对象相对于其某个祖先（默认为最上层容器）的连接矩阵。
     * @param {View} ancestor 可视对象的相对的祖先容器。
     * @private
     */
    getConcatenatedMatrix: function(ancestor){
        var mtx = new Matrix(1, 0, 0, 1, 0, 0);

        for(var o = this; o != ancestor && o.parent; o = o.parent){
            var cos = 1, sin = 0,
                rotation = o.rotation % 360,
                pivotX = o.pivotX, pivotY = o.pivotY,
                scaleX = o.scaleX, scaleY = o.scaleY;

            if(rotation){
                var r = rotation * Math.PI / 180;
                cos = Math.cos(r);
                sin = Math.sin(r);
            }

            if(pivotX != 0) mtx.tx -= pivotX;
            if(pivotY != 0) mtx.ty -= pivotY;
            mtx.concat(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, o.x, o.y);
        }
        return mtx;
    },

    /**
     * 检测由x和y参数指定的点是否在其外接矩形之内。
     * @param {Number} x 要检测的点的x轴坐标。
     * @param {Number} y 要检测的点的y轴坐标。
     * @param {Boolean} usePolyCollision 是否使用多边形碰撞检测。默认为false。
     * @returns {Boolean} 点是否在可视对象之内。
     */
    hitTestPoint: function(x, y, usePolyCollision){
        var bound = this.getBounds(),
            hit = x >= bound.x && x <= bound.x + bound.width &&
                  y >= bound.y && y <= bound.y + bound.height;

        if(hit && usePolyCollision){
            hit = pointInPolygon(x, y, bound);
        }
        return hit;
    },

    /**
     * 检测object参数指定的对象是否与其相交。
     * @param {View} object 要检测的可视对象。
     * @param {Boolean} usePolyCollision 是否使用多边形碰撞检测。默认为false。
     */
    hitTestObject: function(object, usePolyCollision){
        var b1 = this.getBounds(),
            b2 = object.getBounds(),
            hit = b1.x <= b2.x + b2.width && b2.x <= b1.x + b1.width &&
                  b1.y <= b2.y + b2.height && b2.y <= b1.y + b1.height;

        if(hit && usePolyCollision){
            hit = polygonCollision(b1, b2);
        }
        return !!hit;
    },

    /**
     * 可视对象的基本渲染实现，用于框架内部或高级开发使用。通常应该重写render方法。
     * @param {Renderer} renderer 渲染器。
     * @param {Number} delta 渲染时时间偏移量。
     * @protected
     */
    _render: function(renderer, delta){
        if((!this.onUpdate || this.onUpdate(delta) !== false) && renderer.startDraw(this)){
            renderer.transform(this);
            this.render(renderer, delta);
            renderer.endDraw(this);
        }
    },
    /**
     * 冒泡鼠标事件
    */
    _fireMouseEvent:function(e){
        e.eventCurrentTarget = this;
        this.fire(e);

        //处理mouseover事件 mouseover不需要阻止冒泡
        if(e.type == "mousemove"){
            if(!this.__mouseOver){
                this.__mouseOver = true;
                var overEvent = Hilo.copy({}, e);
                overEvent.type = "mouseover";
                this.fire(overEvent);
            }
        }
        else if(e.type == "mouseout"){
            this.__mouseOver = false;
        }

        //向上冒泡
        var parent = this.parent;
        if(!e._stopped && !e._stopPropagationed && parent){
            if(e.type == "mouseout" || e.type == "touchout"){
                if(!parent.hitTestPoint(e.stageX, e.stageY, true)){
                    parent._fireMouseEvent(e);
                }
            }
            else{
                parent._fireMouseEvent(e);
            }
        }
    },

    /**
     * 更新可视对象，此方法会在可视对象渲染之前调用。此函数可以返回一个Boolean值。若返回false，则此对象不会渲染。默认值为null。
     * 限制：如果在此函数中改变了可视对象在其父容器中的层级，当前渲染帧并不会正确渲染，而是在下一渲染帧。可在其父容器的onUpdate方法中来实现。
     * @type Function
     * @default null
     */
    onUpdate: null,

    /**
     * 可视对象的具体渲染逻辑。子类可通过覆盖此方法实现自己的渲染。
     * @param {Renderer} renderer 渲染器。
     * @param {Number} delta 渲染时时间偏移量。
     */
    render: function(renderer, delta){
        renderer.draw(this);
    },

    /**
     * 返回可视对象的字符串表示。
     * @returns {String} 可视对象的字符串表示。
     */
    toString: function(){
        return Hilo.viewToString(this);
    }
});

/**
 * @private
 */
function pointInPolygon(x, y, poly){
    var cross = 0, onBorder = false, minX, maxX, minY, maxY;

    for(var i = 0, len = poly.length; i < len; i++){
        var p1 = poly[i], p2 = poly[(i+1)%len];

        if(p1.y == p2.y && y == p1.y){
            p1.x > p2.x ? (minX = p2.x, maxX = p1.x) : (minX = p1.x, maxX = p2.x);
            if(x >= minX && x <= maxX){
                onBorder = true;
                continue;
            }
        }

        p1.y > p2.y ? (minY = p2.y, maxY = p1.y) : (minY = p1.y, maxY = p2.y);
        if(y < minY || y > maxY) continue;

        var nx = (y - p1.y)*(p2.x - p1.x) / (p2.y - p1.y) + p1.x;
        if(nx > x) cross++;
        else if(nx == x) onBorder = true;

        //当射线和多边形相交
        if(p1.x > x && p1.y == y){
            var p0 = poly[(len+i-1)%len];
            //当交点的两边在射线两旁
            if(p0.y < y && p2.y > y || p0.y > y && p2.y < y){
                cross ++;
            }
        }
    }

    return onBorder || (cross % 2 == 1);
}

/**
 * @private
 */
function polygonCollision(poly1, poly2){
    var result = doSATCheck(poly1, poly2, {overlap:-Infinity, normal:{x:0, y:0}});
    if(result) return doSATCheck(poly2, poly1, result);
    return false;
}

/**
 * @private
 */
function doSATCheck(poly1, poly2, result){
    var len1 = poly1.length, len2 = poly2.length,
        currentPoint, nextPoint, distance,
        min1, max1, min2, max2, dot, overlap, normal = {x:0, y:0};

    for(var i = 0; i < len1; i++){
        currentPoint = poly1[i];
        nextPoint = poly1[(i < len1-1 ? i+1 : 0)];

        normal.x = currentPoint.y - nextPoint.y;
        normal.y = nextPoint.x - currentPoint.x;

        distance = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= distance;
        normal.y /= distance;

        min1 = max1 = poly1[0].x * normal.x + poly1[0].y * normal.y;
        for(var j = 1; j < len1; j++){
            dot = poly1[j].x * normal.x + poly1[j].y * normal.y;
            if(dot > max1) max1 = dot;
            else if(dot < min1) min1 = dot;
        }

        min2 = max2 = poly2[0].x * normal.x + poly2[0].y * normal.y;
        for(j = 1; j < len2; j++){
            dot = poly2[j].x * normal.x + poly2[j].y * normal.y;
            if(dot > max2) max2 = dot;
            else if(dot < min2) min2 = dot;
        }

        if(min1 < min2){
            overlap = min2 - max1;
            normal.x = -normal.x;
            normal.y = -normal.y;
        }else{
            overlap = min1 - max2;
        }

        if(overlap >= 0){
            return false;
        }else if(overlap > result.overlap){
            result.overlap = overlap;
            result.normal.x = normal.x;
            result.normal.y = normal.y;
        }
    }

    return result;
}

})();
Hilo.View = View;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

var _cacheCanvas = Hilo.createElement('canvas');
var _cacheContext = _cacheCanvas.getContext('2d');
/**
 * @class CacheMixin是一个包含cache功能的mixin。可以通过 Class.mix(target, CacheMixin) 来为target增加cache功能。
 * @mixin
 * @static
 * @module hilo/view/CacheMixin
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/Drawable
 */
var CacheMixin = {
    _cacheDirty:true,
    /**
     * 缓存到图片里。可用来提高渲染效率。
     * @param {Boolean} forceUpdate 是否强制更新缓存
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this._cacheImage){
            this.updateCache();
        }
    },
    /**
     * 更新缓存
     */
    updateCache:function(){
        //TODO:width, height自动判断
        _cacheCanvas.width = this.width;
        _cacheCanvas.height = this.height;
        this._draw(_cacheContext);
        this._cacheImage = new Image();
        this._cacheImage.src = _cacheCanvas.toDataURL();
        this.drawable = this.drawable||new Drawable();
        this.drawable.init(this._cacheImage);
        this._cacheDirty = false;
    },
    /**
     * 设置缓存是否dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};
Hilo.CacheMixin = CacheMixin;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
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
Hilo.Container = Container;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Container = Hilo.Container;
var CanvasRenderer = Hilo.CanvasRenderer;
var DOMRenderer = Hilo.DOMRenderer;
var WebGLRenderer = Hilo.WebGLRenderer;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * 示例:
 * <pre>
 * var stage = new Hilo.Stage({
 *     renderType:'canvas',
 *     container: containerElement,
 *     width: 320,
 *     height: 480
 * });
 * </pre>
 * @class 舞台是可视对象树的根，可视对象只有添加到舞台或其子对象后才会被渲染出来。创建一个hilo应用一般都是从创建一个stage开始的。
 * @augments Container
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。主要有：
 * <ul>
 * <li><b>container</b>:String|HTMLElement - 指定舞台在页面中的父容器元素。它是一个dom容器或id。若不传入此参数且canvas未被加入到dom树，则需要在舞台创建后手动把舞台画布加入到dom树中，否则舞台不会被渲染。可选。</li>
 * <li><b>renderType</b>:String - 指定渲染方式，canvas|dom|webgl，默认canvas。可选。</li>
 * <li><b>canvas</b>:String|HTMLCanvasElement|HTMLElement - 指定舞台所对应的画布元素。它是一个canvas或普通的div，也可以传入元素的id。若为canvas，则使用canvas来渲染所有对象，否则使用dom+css来渲染。可选。</li>
 * <li><b>width</b>:Number</li> - 指定舞台的宽度。默认为canvas的宽度。可选。
 * <li><b>height</b>:Number</li> - 指定舞台的高度。默认为canvas的高度。可选。
 * <li><b>paused</b>:Boolean</li> - 指定舞台是否停止渲染。默认为false。可选。
 * </ul>
 * @module hilo/view/Stage
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/Container
 * @requires hilo/renderer/CanvasRenderer
 * @requires hilo/renderer/DOMRenderer
 * @requires hilo/renderer/WebGLRenderer
 * @property {HTMLCanvasElement|HTMLElement} canvas 舞台所对应的画布。它可以是一个canvas或一个普通的div。只读属性。
 * @property {Renderer} renderer 舞台渲染器。只读属性。
 * @property {Boolean} paused 指示舞台是否暂停刷新渲染。
 * @property {Object} viewport 舞台内容在页面中的渲染区域。包含的属性有：left、top、width、height。只读属性。
 */
var Stage = Class.create(/** @lends Stage.prototype */{
    Extends: Container,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Stage');
        Stage.superclass.constructor.call(this, properties);

        this._initRenderer(properties);

        //init size
        var width = this.width, height = this.height,
            viewport = this.updateViewport();
        if(!properties.width) width = (viewport && viewport.width) || 320;
        if(!properties.height) height = (viewport && viewport.height) || 480;
        this.resize(width, height, true);
    },

    canvas: null,
    renderer: null,
    paused: false,
    viewport: null,

    /**
     * @private
     */
    _initRenderer: function(properties){
        var canvas = properties.canvas;
        var container = properties.container;
        var renderType = properties.renderType||'canvas';

        if(typeof canvas === 'string') canvas = Hilo.getElement(canvas);
        if(typeof container === 'string') container = Hilo.getElement(container);

        if(!canvas){
            var canvasTagName = renderType === 'dom'?'div':'canvas';
            canvas = Hilo.createElement(canvasTagName, {
                style: {
                    position: 'absolute'
                }
            });
        }
        else if(!canvas.getContext){
            renderType = 'dom';
        }

        this.canvas = canvas;
        if(container) container.appendChild(canvas);

        var props = {canvas:canvas, stage:this};
        switch(renderType){
            case 'dom':
                this.renderer = new DOMRenderer(props);
                break;
            case 'webgl':
                if(WebGLRenderer.isSupport()){
                    this.renderer = new WebGLRenderer(props);
                }
                else{
                    this.renderer = new CanvasRenderer(props);
                }
                break;
            case 'canvas':
            default:
                this.renderer = new CanvasRenderer(props);
                break;
        }
    },

    /**
     * 添加舞台画布到DOM容器中。注意：此方法覆盖了View.addTo方法。
     * @param {HTMLElement} domElement 一个dom元素。
     * @returns {Stage} 舞台本身，可用于链式调用。
     */
    addTo: function(domElement){
        var canvas = this.canvas;
        if(canvas.parentNode !== domElement){
            domElement.appendChild(canvas);
        }
        return this;
    },

    /**
     * 调用tick会触发舞台的更新和渲染。开发者一般无需使用此方法。
     * @param {Number} delta 调度器当前调度与上次调度tick之间的时间差。
     */
    tick: function(delta){
        if(!this.paused){
            this._render(this.renderer, delta);
        }
    },

    /**
     * 开启/关闭舞台的DOM事件响应。要让舞台上的可视对象响应用户交互，必须先使用此方法开启舞台的相应事件的响应。
     * @param {String|Array} type 要开启/关闭的事件名称或数组。
     * @param {Boolean} enabled 指定开启还是关闭。如果不传此参数，则默认为开启。
     * @returns {Stage} 舞台本身。链式调用支持。
     */
    enableDOMEvent: function(type, enabled){
        var me = this,
            canvas = me.canvas,
            types = typeof type === 'string' ? [type] : type,
            enabled = enabled !== false,
            handler = me._domListener || (me._domListener = function(e){me._onDOMEvent(e)});

        for(var i = 0; i < types.length; i++){
            var type = types[i];

            if(enabled){
                canvas.addEventListener(type, handler, false);
            }else{
                canvas.removeEventListener(type, handler);
            }
        }

        return me;
    },

    /**
     * DOM事件处理函数。此方法会把事件调度到事件的坐标点所对应的可视对象。
     * @private
     */
    _onDOMEvent: function(e){
        var type = e.type, event = e, isTouch = type.indexOf('touch') == 0;

        //calculate stageX/stageY
        var posObj = e;
        if(isTouch){
            var touches = e.touches, changedTouches = e.changedTouches;
            posObj = (touches && touches.length) ? touches[0] :
                     (changedTouches && changedTouches.length) ? changedTouches[0] : null;
        }

        var x = posObj.pageX || posObj.clientX, y = posObj.pageY || posObj.clientY,
            viewport = this.viewport || this.updateViewport();

        event.stageX = x = (x - viewport.left) / this.scaleX;
        event.stageY = y = (y - viewport.top) / this.scaleY;

        //鼠标事件需要阻止冒泡方法
        event.stopPropagation = function(){
            this._stopPropagationed = true;
        };

        var obj = this.getViewAtPoint(x, y, true, false, true)||this,
            canvas = this.canvas, target = this._eventTarget;

        //fire mouseout/touchout event for last event target
        var leave = type === 'mouseout';
        //当obj和target不同 且obj不是target的子元素时才触发out事件
        if(target && (target != obj && (!target.contains || !target.contains(obj))|| leave)){
            var out = (type === 'touchmove') ? 'touchout' :
                      (type === 'mousemove' || leave || !obj) ? 'mouseout' : null;
            if(out) {
                var outEvent = Hilo.copy({}, event);
                outEvent.type = out;
                outEvent.eventTarget = target;
                target._fireMouseEvent(outEvent);
            }
            event.lastEventTarget = target;
            this._eventTarget = null;
        }

        //fire event for current view
        if(obj && obj.pointerEnabled && type !== 'mouseout'){
            event.eventTarget = this._eventTarget = obj;
            obj._fireMouseEvent(event);
        }

        //set cursor for current view
        if(!isTouch){
            var cursor = (obj && obj.pointerEnabled && obj.useHandCursor) ? 'pointer' : '';
            canvas.style.cursor = cursor;
        }

        //fix android: `touchmove` fires only once
        if(Hilo.browser.android && type === 'touchmove'){
            e.preventDefault();
        }
    },

    /**
     * 更新舞台在页面中的可视区域，即渲染区域。当舞台canvas的样式border、margin、padding等属性更改后，需要调用此方法更新舞台渲染区域。
     * @returns {Object} 舞台的可视区域。即viewport属性。
     */
    updateViewport: function(){
        var canvas = this.canvas, viewport = null;
        if(canvas.parentNode){
            viewport = this.viewport = Hilo.getElementRect(canvas);
        }
        return viewport;
    },

    /**
     * 改变舞台的大小。
     * @param {Number} width 指定舞台新的宽度。
     * @param {Number} height 指定舞台新的高度。
     * @param {Boolean} forceResize 指定是否强制改变舞台大小，即不管舞台大小是否相同，仍然强制执行改变动作，可确保舞台、画布以及视窗之间的尺寸同步。
     */
    resize: function(width, height, forceResize){
        if(forceResize || this.width !== width || this.height !== height){
            this.width = width;
            this.height = height;
            this.renderer.resize(width, height);
            this.updateViewport();
        }
    }

});

Hilo.Stage = Stage;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Bitmap.html?noHeader' width = '300' height = '200' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var bmp = new Hilo.Bitmap({image:imgElem, rect:[0, 0, 100, 100]});
 * stage.addChild(bmp);
 * </pre>
 * @class Bitmap类表示位图图像类。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
 * <ul>
 * <li><b>image</b> - 位图所在的图像image。必需。</li>
 * <li><b>rect</b> - 位图在图像image中矩形区域。</li>
 * </ul>
 * @module hilo/view/Bitmap
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 */
 var Bitmap = Class.create(/** @lends Bitmap.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Bitmap");
        Bitmap.superclass.constructor.call(this, properties);

        this.drawable = new Drawable(properties);

        //init width and height
        if(!this.width || !this.height){
            var rect = this.drawable.rect;
            if(rect){
                this.width = rect[2];
                this.height = rect[3];
            }
        }
    },

    /**
     * 设置位图的图片。
     * @param {Image|String} image 图片对象或地址。
     * @param {Array} rect 指定位图在图片image的矩形区域。
     * @returns {Bitmap} 位图本身。
     */
    setImage: function(image, rect){
        this.drawable.init({image:image, rect:rect});
        if(rect){
            this.width = rect[2];
            this.height = rect[3];
        }
        return this;
    }
 });
Hilo.Bitmap = Bitmap;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Sprite.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class 动画精灵类。
 * @augments View
 * @module hilo/view/Sprite
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @param properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
 * <ul>
 * <li><b>frames</b> - 精灵动画的帧数据对象。</li>
 * </ul>
 * @property {number} currentFrame 当前播放帧的索引。从0开始。只读属性。
 * @property {boolean} paused 判断精灵是否暂停。默认为false。
 * @property {boolean} loop 判断精灵是否可以循环播放。默认为true。
 * @property {boolean} timeBased 指定精灵动画是否是以时间为基准。默认为false，即以帧为基准。
 * @property {number} interval 精灵动画的帧间隔。如果timeBased为true，则单位为毫秒，否则为帧数。
 */
var Sprite = Class.create(/** @lends Sprite.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Sprite");
        Sprite.superclass.constructor.call(this, properties);

        this._frames = [];
        this._frameNames = {};
        this.drawable = new Drawable();
        if(properties.frames) this.addFrame(properties.frames);
    },

    _frames: null, //所有帧的集合
    _frameNames: null, //带名字name的帧的集合
    _frameElapsed: 0, //当前帧持续的时间或帧数
    _firstRender: true, //标记是否是第一次渲染

    paused: false,
    loop: true,
    timeBased: false,
    interval: 1,
    currentFrame: 0, //当前帧的索引

    /**
     * 返回精灵动画的总帧数。
     * @returns {Uint} 精灵动画的总帧数。
     */
    getNumFrames: function(){
        return this._frames ? this._frames.length : 0;
    },

    /**
     * 往精灵动画序列中增加帧。
     * @param {Object} frame 要增加的精灵动画帧数据。
     * @param {Int} startIndex 开始增加帧的索引位置。若不设置，默认为在末尾添加。
     * @returns {Sprite} Sprite对象本身。
     */
    addFrame: function(frame, startIndex){
        var start = startIndex != null ? startIndex : this._frames.length;
        if(frame instanceof Array){
            for(var i = 0, len = frame.length; i < len; i++){
                this.setFrame(frame[i], start + i);
            }
        }else{
            this.setFrame(frame, start);
        }
        return this;
    },

    /**
     * 设置精灵动画序列指定索引位置的帧。
     * @param {Object} frame 要设置的精灵动画帧数据。
     * @param {Int} index 要设置的索引位置。
     * @returns {Sprite} Sprite对象本身。
     */
    setFrame: function(frame, index){
        var frames = this._frames,
            total = frames.length;
        index = index < 0 ? 0 : index > total ? total : index;
        frames[index] = frame;
        if(frame.name) this._frameNames[frame.name] = frame;
        if(index == 0 && !this.width || !this.height){
            this.width = frame.rect[2];
            this.height = frame.rect[3];
        }
        return this;
    },

    /**
     * 获取精灵动画序列中指定的帧。
     * @param {Object} indexOrName 要获取的帧的索引位置或别名。
     * @returns {Object} 精灵帧对象。
     */
    getFrame: function(indexOrName){
        if(typeof indexOrName === 'number'){
            var frames = this._frames;
            if(indexOrName < 0 || indexOrName >= frames.length) return null;
            return frames[indexOrName];
        }
        return this._frameNames[indexOrName];
    },

    /**
     * 获取精灵动画序列中指定帧的索引位置。
     * @param {Object} frameValue 要获取的帧的索引位置或别名。
     * @returns {Object} 精灵帧对象。
     */
    getFrameIndex: function(frameValue){
        var frames = this._frames,
            total = frames.length,
            index = -1;
        if(typeof frameValue === 'number'){
            index = frameValue;
        }else{
            var frame = typeof frameValue === 'string' ? this._frameNames[frameValue] : frameValue;
            if(frame){
                for(var i = 0; i < total; i++){
                    if(frame === frames[i]){
                        index = i;
                        break;
                    }
                }
            }
        }
        return index;
    },

    /**
     * 播放精灵动画。
     * @returns {Sprite} Sprite对象本身。
     */
    play: function(){
        this.paused = false;
        return this;
    },

    /**
     * 暂停播放精灵动画。
     * @returns {Sprite} Sprite对象本身。
     */
    stop: function(){
        this.paused = true;
        return this;
    },

    /**
     * 跳转精灵动画到指定的帧。
     * @param {Object} indexOrName 要跳转的帧的索引位置或别名。
     * @param {Boolean} pause 指示跳转后是否暂停播放。
     * @returns {Sprite} Sprite对象本身。
     */
    goto: function(indexOrName, pause){
        var total = this._frames.length,
            index = this.getFrameIndex(indexOrName);

        this.currentFrame = index < 0 ? 0 : index >= total ? total - 1 : index;
        this.paused = pause;
        this._firstRender = true;
        return this;
    },

    /**
     * 渲染方法。
     * @private
     */
    _render: function(renderer, delta){
        var lastFrameIndex = this.currentFrame, frameIndex;

        if(this._firstRender){
            frameIndex = lastFrameIndex;
            this._firstRender = false;
        }else{
            frameIndex = this._nextFrame(delta);
        }

        if(frameIndex != lastFrameIndex){
            this.currentFrame = frameIndex;
            var callback = this._frames[frameIndex].callback;
            callback && callback.call(this);
        }

        //NOTE: it will be deprecated, don't use it.
        if(this.onEnterFrame) this.onEnterFrame(frameIndex);

        this.drawable.init(this._frames[frameIndex]);
        Sprite.superclass._render.call(this, renderer, delta);
    },

    /**
     * @private
     */
    _nextFrame: function(delta){
        var frames = this._frames,
            total = frames.length,
            frameIndex = this.currentFrame,
            frame = frames[frameIndex],
            duration = frame.duration || this.interval,
            elapsed = this._frameElapsed;

        //calculate the current frame elapsed frames/time
        var value = (frameIndex == 0 && !this.drawable) ? 0 : elapsed + (this.timeBased ? delta : 1);
        elapsed = this._frameElapsed = value < duration ? value : 0;

        if(frame.stop || !this.loop && frameIndex >= total - 1){
            this.stop();
        }

        if(!this.paused && elapsed == 0){
            if(frame.next != null){
                //jump to the specified frame
                frameIndex = this.getFrameIndex(frame.next);
            }else if(frameIndex >= total - 1){
                //at the end of the frames, go back to first frame
                frameIndex = 0;
            }else if(this.drawable){
                //normal go forward to next frame
                frameIndex++;
            }
        }

        return frameIndex;
    },

    /**
     * 设置指定帧的回调函数。即每当播放头进入指定帧时调用callback函数。若callback为空，则会删除回调函数。
     * @param {Int|String} frame 要指定的帧的索引位置或别名。
     * @param {Function} callback 指定回调函数。
     * @returns {Sprite} 精灵本身。
     */
    setFrameCallback: function(frame, callback){
        frame = this.getFrame(frame);
        if(frame) frame.callback = callback;
        return this;
    },

    /**
     * 精灵动画的播放头进入新帧时的回调方法。默认值为null。此方法已废弃，请使用addFrameCallback方法。
     * @type Function
     * @deprecated
     */
    onEnterFrame: null

});
Hilo.Sprite = Sprite;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/DOMElement.html?noHeader' width = '330' height = '250' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var domView = new Hilo.DOMElement({
 *     element: Hilo.createElement('div', {
 *         style: {
 *             backgroundColor: '#004eff',
 *             position: 'absolute'
 *         }
 *     }),
 *     width: 100,
 *     height: 100,
 *     x: 50,
 *     y: 70
 * }).addTo(stage);
 * </pre>
 * @name DOMElement
 * @class DOMElement是dom元素的包装。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。特殊属性有：
 * <ul>
 * <li><b>element</b> - 要包装的dom元素。必需。</li>
 * </ul>
 * @module hilo/view/DOMElement
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 */
var DOMElement = Class.create(/** @lends DOMElement.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("DOMElement");
        DOMElement.superclass.constructor.call(this, properties);

        this.drawable = new Drawable();
        var elem = this.drawable.domElement = properties.element || Hilo.createElement('div');
        elem.id = this.id;
    },

    /**
     * 覆盖渲染方法。
     * @private
     */
    _render: function(renderer, delta){
        if(!this.onUpdate || this.onUpdate(delta) !== false){
            renderer.transform(this);
            if(this.visible && this.alpha > 0){
                this.render(renderer, delta);
            }
        }
    },

    /**
     * 覆盖渲染方法。
     * @private
     */
    render: function(renderer, delta){
        var canvas = renderer.canvas;
        if(canvas.getContext){
            var elem = this.drawable.domElement, depth = this.depth,
                nextElement = canvas.nextSibling, nextDepth;
            if(elem.parentNode) return;

            //draw dom element just after stage canvas
            while(nextElement && nextElement.nodeType != 3){
                nextDepth = parseInt(nextElement.style.zIndex) || 0;
                if(nextDepth <= 0 || nextDepth > depth){
                    break;
                }
                nextElement = nextElement.nextSibling;
            }
            canvas.parentNode.insertBefore(this.drawable.domElement, nextElement);
        }else{
            renderer.draw(this);
        }
    }
});
Hilo.DOMElement = DOMElement;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var CacheMixin = Hilo.CacheMixin;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Graphics.html?noHeader' width = '320' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Graphics类包含一组创建矢量图形的方法。
 * @augments View
 * @mixes CacheMixin
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Graphics
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {Number} lineWidth 笔画的线条宽度。默认为1。只读属性。
 * @property {Number} lineAlpha 笔画的线条透明度。默认为1。只读属性。
 * @property {String} lineCap 笔画的线条端部样式。可选值有：butt、round、square等，默认为null。只读属性。
 * @property {String} lineJoin 笔画的线条连接样式。可选值有：miter、round、bevel等，默认为null。只读属性。
 * @property {Number} miterLimit 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。只读属性。
 * @property {String} strokeStyle 笔画边框的样式。默认值为'0'，即黑色。只读属性。
 * @property {String} fillStyle 内容填充的样式。默认值为'0'，即黑色。只读属性。
 * @property {Number} fillAlpha 内容填充的透明度。默认值为0。只读属性。
 */
var Graphics = (function(){

var canvas = document.createElement('canvas');
var helpContext = canvas.getContext && canvas.getContext('2d');

return Class.create(/** @lends Graphics.prototype */{
    Extends: View,
    Mixes:CacheMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Graphics');
        Graphics.superclass.constructor.call(this, properties);

        this._actions = [];
    },

    lineWidth: 1,
    lineAlpha: 1,
    lineCap: null, //'butt', 'round', 'square'
    lineJoin: null, //'miter', 'round', 'bevel'
    miterLimit: 10,
    hasStroke: false,
    strokeStyle: '0',
    hasFill: false,
    fillStyle: '0',
    fillAlpha: 0,

    /**
     * 指定绘制图形的线条样式。
     * @param {Number} thickness 线条的粗细值。默认为1。
     * @param {String} lineColor 线条的CSS颜色值。默认为黑色，即'0'。
     * @param {Number} lineAlpha 线条的透明度值。默认为不透明，即1。
     * @param {String} lineCap 线条的端部样式。可选值有：butt、round、square等，默认值为null。
     * @param {String} lineJoin 线条的连接样式。可选值有：miter、round、bevel等，默认值为null。
     * @param {Number} miterLimit 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。
     * @returns {Graphics} Graphics对象本身。
     */
    lineStyle: function(thickness, lineColor, lineAlpha, lineCap, lineJoin, miterLimit){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['lineWidth', (me.lineWidth = thickness || 1)]);
        addAction.call(me, ['strokeStyle', (me.strokeStyle = lineColor || '0')]);
        addAction.call(me, ['lineAlpha', (me.lineAlpha = lineAlpha || 1)]);
        if(lineCap != undefined) addAction.call(me, ['lineCap', (me.lineCap = lineCap)]);
        if(lineJoin != undefined) addAction.call(me, ['lineJoin', (me.lineJoin = lineJoin)]);
        if(miterLimit != undefined) addAction.call(me, ['miterLimit', (me.miterLimit = miterLimit)]);
        me.hasStroke = true;
        return me;
    },

    /**
     * 指定绘制图形的填充样式和透明度。
     * @param {String} fill 填充样式。可以是color、gradient或pattern。
     * @param {Number} alpha 透明度。
     * @returns {Graphics} Graphics对象本身。
     */
    beginFill: function(fill, alpha){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['fillStyle', (me.fillStyle = fill)]);
        addAction.call(me, ['fillAlpha', (me.fillAlpha = alpha || 1)]);
        me.hasFill = true;
        return me;
    },

    /**
     * 应用并结束笔画的绘制和图形样式的填充。
     * @returns {Graphics} Graphics对象本身。
     */
    endFill: function(){
        var me = this, addAction = me._addAction;

        if(me.hasStroke) addAction.call(me, ['stroke']);
        if(me.hasFill) addAction.call(me, ['fill']);
        me.setCacheDirty(true);
        return me;
    },

    /**
     * 指定绘制图形的线性渐变填充样式。
     * @param {Number} x0 渐变的起始点的x轴坐标。
     * @param {Number} y0 渐变的起始点的y轴坐标。
     * @param {Number} x1 渐变的结束点的x轴坐标。
     * @param {Number} y1 渐变的结束点的y轴坐标。
     * @param {Array} colors 渐变中使用的CSS颜色值数组。
     * @param {Array} ratois 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值。
     * @returns {Graphics} Graphics对象本身。
     */
    beginLinearGradientFill: function(x0, y0, x1, y1, colors, ratios){
        var me = this, gradient = helpContext.createLinearGradient(x0, y0, x1, y1);

        for (var i = 0, len = colors.length; i < len; i++){
            gradient.addColorStop(ratios[i], colors[i]);
        }
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = gradient)]);
    },

    /**
     * 指定绘制图形的放射性渐变填充样式。
     * @param {Number} x0 渐变的起始圆的x轴坐标。
     * @param {Number} y0 渐变的起始圆的y轴坐标。
     * @param {Number} r0 渐变的起始圆的半径。
     * @param {Number} x1 渐变的结束圆的x轴坐标。
     * @param {Number} y1 渐变的结束圆的y轴坐标。
     * @param {Number} r1 渐变的结束圆的半径。
     * @param {Array} colors 渐变中使用的CSS颜色值数组。
     * @param {Array} ratois 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值。
     * @returns {Graphics} Graphics对象本身。
     */
    beginRadialGradientFill: function(x0, y0, r0, x1, y1, r1, colors, ratios){
        var me = this, gradient = helpContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
        for (var i = 0, len = colors.length; i < len; i++)
        {
            gradient.addColorStop(ratios[i], colors[i]);
        }
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = gradient)]);
    },

    /**
     * 开始一个位图填充样式。
     * @param {HTMLImageElement} image 指定填充的Image对象。
     * @param {String} repetition 指定填充的重复设置参数。它可以是以下任意一个值：repeat, repeat-x, repeat-y, no-repeat。默认为''。
     * @returns {Graphics} Graphics对象本身。
     */
    beginBitmapFill: function(image, repetition){
        var me = this, pattern = helpContext.createPattern(image, repetition || '');
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = pattern)]);
    },

    /**
     * 开始一个新的路径。
     * @returns {Graphics} Graphics对象本身。
     */
    beginPath: function(){
        return this._addAction(['beginPath']);
    },

    /**
     * 关闭当前的路径。
     * @returns {Graphics} Graphics对象本身。
     */
    closePath: function(){
        return this._addAction(['closePath']);
    },

    /**
     * 将当前绘制位置移动到点(x, y)。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    moveTo: function(x, y){
        return this._addAction(['moveTo', x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的直线。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    lineTo: function(x, y){
        return this._addAction(['lineTo', x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的二次曲线。
     * @param {Number} cpx 控制点cp的x轴坐标。
     * @param {Number} cpy 控制点cp的y轴坐标。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    quadraticCurveTo: function(cpx, cpy, x, y){
        return this._addAction(['quadraticCurveTo', cpx, cpy, x, y]);
    },

    /**
     * 绘制从当前位置开始到点(x, y)结束的贝塞尔曲线。
     * @param {Number} cp1x 控制点cp1的x轴坐标。
     * @param {Number} cp1y 控制点cp1的y轴坐标。
     * @param {Number} cp2x 控制点cp2的x轴坐标。
     * @param {Number} cp2y 控制点cp2的y轴坐标。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @returns {Graphics} Graphics对象本身。
     */
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y){
        return this._addAction(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
    },

    /**
     * 绘制一个矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 矩形的宽度。
     * @param {Number} height 矩形的高度。
     * @returns {Graphics} Graphics对象本身。
     */
    drawRect: function(x, y, width, height){
        return this._addAction(['rect', x, y, width, height]);
    },

    /**
     * 绘制一个复杂的圆角矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 圆角矩形的宽度。
     * @param {Number} height 圆角矩形的高度。
     * @param {Number} cornerTL 圆角矩形的左上圆角大小。
     * @param {Number} cornerTR 圆角矩形的右上圆角大小。
     * @param {Number} cornerBR 圆角矩形的右下圆角大小。
     * @param {Number} cornerBL 圆角矩形的左下圆角大小。
     * @returns {Graphics} Graphics对象本身。
     */
    drawRoundRectComplex: function(x, y, width, height, cornerTL, cornerTR, cornerBR, cornerBL){
        var me = this, addAction = me._addAction;
        addAction.call(me, ['moveTo', x + cornerTL, y]);
        addAction.call(me, ['lineTo', x + width - cornerTR, y]);
        addAction.call(me, ['arc', x + width - cornerTR, y + cornerTR, cornerTR, -Math.PI/2, 0, false]);
        addAction.call(me, ['lineTo', x + width, y + height - cornerBR]);
        addAction.call(me, ['arc', x + width - cornerBR, y + height - cornerBR, cornerBR, 0, Math.PI/2, false]);
        addAction.call(me, ['lineTo', x + cornerBL, y + height]);
        addAction.call(me, ['arc', x + cornerBL, y + height - cornerBL, cornerBL, Math.PI/2, Math.PI, false]);
        addAction.call(me, ['lineTo', x, y + cornerTL]);
        addAction.call(me, ['arc', x + cornerTL, y + cornerTL, cornerTL, Math.PI, Math.PI*3/2, false]);
        return me;
    },

    /**
     * 绘制一个圆角矩形。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 圆角矩形的宽度。
     * @param {Number} height 圆角矩形的高度。
     * @param {Number} cornerSize 圆角矩形的圆角大小。
     * @returns {Graphics} Graphics对象本身。
     */
    drawRoundRect: function(x, y, width, height, cornerSize){
        return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
    },

    /**
     * 绘制一个圆。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} radius 圆的半径。
     * @returns {Graphics} Graphics对象本身。
     */
    drawCircle: function(x, y, radius){
        return this._addAction(['arc', x + radius, y + radius, radius, 0, Math.PI * 2, 0]);
    },

    /**
     * 绘制一个椭圆。
     * @param {Number} x x轴坐标。
     * @param {Number} y y轴坐标。
     * @param {Number} width 椭圆的宽度。
     * @param {Number} height 椭圆的高度。
     * @returns {Graphics} Graphics对象本身。
     */
    drawEllipse: function(x, y, width, height){
        var me = this;
        if(width == height) return me.drawCircle(x, y, width);

        var addAction = me._addAction;
        var w = width / 2, h = height / 2, C = 0.5522847498307933, cx = C * w, cy = C * h;
        x = x + w;
        y = y + h;

        addAction.call(me, ['moveTo', x + w, y]);
        addAction.call(me, ['bezierCurveTo', x + w, y - cy, x + cx, y - h, x, y - h]);
        addAction.call(me, ['bezierCurveTo', x - cx, y - h, x - w, y - cy, x - w, y]);
        addAction.call(me, ['bezierCurveTo', x - w, y + cy, x - cx, y + h, x, y + h]);
        addAction.call(me, ['bezierCurveTo', x + cx, y + h, x + w, y + cy, x + w, y]);
        return me;
    },

    /**
     * 根据参数指定的SVG数据绘制一条路径。
     * 代码示例:
     * <p>var path = 'M250 150 L150 350 L350 350 Z';</p>
     * <p>var shape = new Hilo.Graphics({width:500, height:500});</p>
     * <p>shape.drawSVGPath(path).beginFill('#0ff').endFill();</p>
     * @param {String} pathData 要绘制的SVG路径数据。
     * @returns {Graphics} Graphics对象本身。
     */
    drawSVGPath: function(pathData){
        var me = this, addAction = me._addAction,
            path = pathData.split(/,| (?=[a-zA-Z])/);

        addAction.call(me, ['beginPath']);
        for(var i = 0, len = path.length; i < len; i++){
            var str = path[i], cmd = str[0].toUpperCase(), p = str.substring(1).split(/,| /);
            if(p[0].length == 0) p.shift();

            switch(cmd){
                case 'M':
                    addAction.call(me, ['moveTo', p[0], p[1]]);
                    break;
                case 'L':
                    addAction.call(me, ['lineTo', p[0], p[1]]);
                    break;
                case 'C':
                    addAction.call(me, ['bezierCurveTo', p[0], p[1], p[2], p[3], p[4], p[5]]);
                    break;
                case 'Z':
                    addAction.call(me, ['closePath']);
                    break;
            }
        }
        return me;
    },

    /**
     * 执行全部绘制动作。内部私有方法。
     * @private
     */
    _draw: function(context){
        var me = this, actions = me._actions, len = actions.length, i;

        context.beginPath();
        for(i = 0; i < len; i++){
            var action = actions[i],
                f = action[0],
                args = action.length > 1 ? action.slice(1) : null;

            if(typeof(context[f]) == 'function') context[f].apply(context, args);
            else context[f] = action[1];
        }
    },

    /**
     * 重写渲染实现。
     * @private
     */
    render: function(renderer, delta){
        var me = this, canvas = renderer.canvas;
        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }else{
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * 清除所有绘制动作并复原所有初始状态。
     * @returns {Graphics} Graphics对象本身。
     */
    clear: function(){
        var me = this;

        me._actions.length = 0;
        me.lineWidth = 1;
        me.lineAlpha = 1;
        me.lineCap = null;
        me.lineJoin = null;
        me.miterLimit = 10;
        me.hasStroke = false;
        me.strokeStyle = '0';
        me.hasFill = false;
        me.fillStyle = '0';
        me.fillAlpha = 1;

        me.setCacheDirty(true);
        return me;
    },

    /**
     * 添加一个绘制动作。内部私有方法。
     * @private
     */
    _addAction: function(action){
        var me = this;
        me._actions.push(action);
        return me;
    }

});

})();
Hilo.Graphics = Graphics;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var CacheMixin = Hilo.CacheMixin;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Text.html?noHeader' width = '320' height = '240' scrolling='no'></iframe>
 * <br/>
 * @class Text类提供简单的文字显示功能。复杂的文本功能可以使用DOMElement。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/Text
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {String} text 指定要显示的文本内容。
 * @property {String} color 指定使用的字体颜色。
 * @property {String} textAlign 指定文本的对齐方式。可以是以下任意一个值：'start', 'end', 'left', 'right', and 'center'。
 * @property {String} textVAlign 指定文本的垂直对齐方式。可以是以下任意一个值：'top', 'middle', 'bottom'。
 * @property {Boolean} outline 指定文本是绘制边框还是填充。
 * @property {Number} lineSpacing 指定文本的行距。单位为像素。默认值为0。
 * @property {Number} maxWidth 指定文本的最大宽度。默认值为200。
 * @property {String} font 文本的字体CSS样式。只读属性。设置字体样式请用setFont方法。
 * @property {Number} textWidth 指示文本内容的宽度，只读属性。仅在canvas模式下有效。
 * @property {Number} textHeight 指示文本内容的高度，只读属性。仅在canvas模式下有效。
 */
var Text = Class.create(/** @lends Text.prototype */{
    Extends: View,
    Mixes:CacheMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('Text');
        Text.superclass.constructor.call(this, properties);

        // if(!properties.width) this.width = 200; //default width
        if(!properties.font) this.font = '12px arial'; //default font style
        this._fontHeight = Text.measureFontHeight(this.font);
    },

    text: null,
    color: '#000',
    textAlign: null,
    textVAlign: null,
    outline: false,
    lineSpacing: 0,
    maxWidth: 200,
    font: null, //ready-only
    textWidth: 0, //read-only
    textHeight: 0, //read-only

    /**
     * 设置文本的字体CSS样式。
     * @param {String} font 要设置的字体CSS样式。
     * @returns {Text} Text对象本身。链式调用支持。
     */
    setFont: function(font){
        var me = this;
        if(me.font !== font){
            me.font = font;
            me._fontHeight = Text.measureFontHeight(font);
        }

        return me;
    },

    /**
     * 覆盖渲染方法。
     * @private
     */
    render: function(renderer, delta){
        var me = this, canvas = renderer.canvas;

        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }
        else if(renderer.renderType === 'dom'){
            var drawable = me.drawable;
            var domElement = drawable.domElement;
            var style = domElement.style;

            style.font = me.font;
            style.textAlign = me.textAlign;
            style.color = me.color;
            style.width = me.width + 'px';
            style.height = me.height + 'px';
            style.lineHeight = (me._fontHeight + me.lineSpacing) + 'px';

            domElement.innerHTML = me.text;
            renderer.draw(this);
        }
        else{
            //TODO:自动更新cache
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * 在指定的渲染上下文上绘制文本。
     * @private
     */
    _draw: function(context){
        var me = this, text = me.text.toString();
        if(!text) return;

        //set drawing style
        context.font = me.font;
        context.textAlign = me.textAlign;
        context.textBaseline = 'top';

        //find and draw all explicit lines
        var lines = text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
        var width = 0, height = 0;
        var lineHeight = me._fontHeight + me.lineSpacing;
        var i, line, w;
        var drawLines = [];

        for(i = 0, len = lines.length; i < len; i++){
            line = lines[i];
            w = context.measureText(line).width;

            //check if the line need to split
            if(w <= me.maxWidth){
                drawLines.push({text:line, y:height});
                // me._drawTextLine(context, line, height);
                if(width < w) width = w;
                height += lineHeight;
                continue;
            }

            var str = '', oldWidth = 0, newWidth, j, word;

            for(j = 0, wlen = line.length; j < wlen; j++){
                word = line[j];
                newWidth = context.measureText(str + word).width;

                if(newWidth > me.maxWidth){
                    drawLines.push({text:str, y:height});
                    // me._drawTextLine(context, str, height);
                    if(width < oldWidth) width = oldWidth;
                    height += lineHeight;
                    str = word;
                }else{
                    oldWidth = newWidth;
                    str += word;
                }

                if(j == wlen - 1){
                    drawLines.push({text:str, y:height});
                    // me._drawTextLine(context, str, height);
                    if(str !== word && width < newWidth) width = newWidth;
                    height += lineHeight;
                }
            }
        }

        me.textWidth = width;
        me.textHeight = height;
        if(!me.width) me.width = width;
        if(!me.height) me.height = height;

        //vertical alignment
        var startY = 0;
        switch(me.textVAlign){
            case 'middle':
                startY = me.height - me.textHeight >> 1;
                break;
            case 'bottom':
                startY = me.height - me.textHeight;
                break;
        }

        //draw background
        var bg = me.background;
        if(bg){
            context.fillStyle = bg;
            context.fillRect(0, 0, me.width, me.height);
        }

        if(me.outline) context.strokeStyle = me.color;
        else context.fillStyle = me.color;

        //draw text lines
        for(var i = 0; i < drawLines.length; i++){
            var line = drawLines[i];
            me._drawTextLine(context, line.text, startY + line.y);
        }
    },

    /**
     * 在指定的渲染上下文上绘制一行文本。
     * @private
     */
    _drawTextLine: function(context, text, y){
        var me = this, x = 0, width = me.width;

        switch(me.textAlign){
            case 'center':
                x = width >> 1;
                break;
            case 'right':
            case 'end':
                x = width;
                break;
        };

        if(me.outline) context.strokeText(text, x, y);
        else context.fillText(text, x, y);
    },

    Statics: /** @lends Text */{
        /**
         * 测算指定字体样式的行高。
         * @param {String} font 指定要测算的字体样式。
         * @return {Number} 返回指定字体的行高。
         */
        measureFontHeight: function(font){
            var docElement = document.documentElement, fontHeight;
            var elem = Hilo.createElement('div', {style:{font:font, position:'absolute'}, innerHTML:'M'});

            docElement.appendChild(elem);
            fontHeight = elem.offsetHeight;
            docElement.removeChild(elem);
            return fontHeight;
        }
    }

});
Hilo.Text = Text;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var Container = Hilo.Container;
var Bitmap = Hilo.Bitmap;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/BitmapText.html?noHeader' width = '550' height = '80' scrolling='no'></iframe>
 * <br/>
 * @class BitmapText类提供使用位图文本的功能。当前仅支持单行文本。
 * @augments Container
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/BitmapText
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/Container
 * @requires hilo/view/Bitmap
 * @property {Object} glyphs 位图字体的字形集合。格式为：{letter:{image:img, rect:[0,0,100,100]}}。
 * @property {Number} letterSpacing 字距，即字符间的间隔。默认值为0。
 * @property {String} text 位图文本的文本内容。只读属性。设置文本请使用setFont方法。
 * @property {String} textAlign 文本对齐方式，值为left、center、right, 默认left。只读属性。设置文本请使用setTextAlign方法。
 */
var BitmapText = Class.create(/** @lends BitmapText.prototype */{
    Extends: Container,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid('BitmapText');
        BitmapText.superclass.constructor.call(this, properties);

        var text = properties.text + '';
        if(text){
            this.text = '';
            this.setText(text);
        }

        this.pointerChildren = false; //disable user events for single letters
    },

    glyphs: null,
    letterSpacing: 0,
    text: '',
    textAlign:'left',

    /**
     * 设置位图文本的文本内容。
     * @param {String} text 要设置的文本内容。
     * @returns {BitmapText} BitmapText对象本身。链式调用支持。
     */
    setText: function(text){
        var me = this, str = text.toString(), len = str.length;
        if(me.text == str) return;
        me.text = str;

        var i, charStr, charGlyph, charObj, width = 0, height = 0, left = 0;
        for(i = 0; i < len; i++){
            charStr = str.charAt(i);
            charGlyph = me.glyphs[charStr];
            if(charGlyph){
                left = width + (width > 0 ? me.letterSpacing : 0);
                if(me.children[i]){
                    charObj = me.children[i];
                    charObj.setImage(charGlyph.image, charGlyph.rect);
                }
                else{
                    charObj = me._createBitmap(charGlyph);
                    me.addChild(charObj);
                }
                charObj.x = left;
                width = left + charGlyph.rect[2];
                height = Math.max(height, charGlyph.rect[3]);
            }
        }

        for(i = me.children.length - 1;i >= len;i --){
            me._releaseBitmap(me.children[i]);
            me.children[i].removeFromParent();
        }

        me.width = width;
        me.height = height;
        this.setTextAlign();
        return me;
    },
    _createBitmap:function(cfg){
        var bmp;
        if(BitmapText._pool.length){
            bmp = BitmapText._pool.pop();
            bmp.setImage(cfg.image, cfg.rect);
        }
        else{
            bmp = new Bitmap({
                image:cfg.image,
                rect:cfg.rect
            });
        }
        return bmp;
    },
    _releaseBitmap:function(bmp){
        BitmapText._pool.push(bmp);
    },

     /**
     * 设置位图文本的对齐方式。
     * @param textAlign 文本对齐方式，值为left、center、right
     * @returns {BitmapText} BitmapText对象本身。链式调用支持。
     */
    setTextAlign:function(textAlign){
        this.textAlign = textAlign||this.textAlign;
        switch(this.textAlign){
            case "center":
                this.pivotX = this.width * .5;
                break;
            case "right":
                this.pivotX = this.width;
                break;
            case "left":
            default:
                this.pivotX = 0;
                break;
        }
        return this;
    },

    /**
     * 返回能否使用当前指定的字体显示提供的字符串。
     * @param {String} str 要检测的字符串。
     * @returns {Boolean} 是否能使用指定字体。
     */
    hasGlyphs: function(str){
        var glyphs = this.glyphs;
        if(!glyphs) return false;

        var str = str.toString(), len = str.length, i;
        for(i = 0; i < len; i++){
            if(!glyphs[str.charAt(i)]) return false;
        }
        return true;
    },

    Statics:/** @lends BitmapText */{
        _pool:[],
        /**
         * 简易方式生成字形集合。
         * @static
         * @param {String} text 字符文本。
         * @param {Image} image 字符图片。
         * @param {Number} col 列数  默认和文本字数一样
         * @param {Number} row 行数 默认1行
         * @returns {BitmapText} BitmapText对象本身。链式调用支持。
         */
        createGlyphs:function(text, image, col, row){
            var str = text.toString();
            col = col||str.length;
            row = row||1;
            var w = image.width/col;
            var h = image.height/row;
            var glyphs = {};
            for(var i = 0, l = text.length;i < l;i ++){
                charStr = str.charAt(i);
                glyphs[charStr] = {
                    image:image,
                    rect:[w * (i % col), h * Math.floor(i / col), w, h]
                }
            }
            return glyphs;
        }
    }

});
Hilo.BitmapText = BitmapText;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Button.html?noHeader' width = '320' height = '170' scrolling='no'></iframe>
 * <br/>
 * 示例:
 * <pre>
 * var btn = new Hilo.Button({
 *     image: buttonImage,
 *     upState: {rect:[0, 0, 64, 64]},
 *     overState: {rect:[64, 0, 64, 64]},
 *     downState: {rect:[128, 0, 64, 64]},
 *     disabledState: {rect:[192, 0, 64, 64]}
 * });
 * </pre>
 * @class Button类表示简单按钮类。它有弹起、经过、按下和不可用等四种状态。
 * @augments View
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
 * <ul>
 * <li><b>image</b> - 按钮图片所在的image对象。</li>
 * </ul>
 * @module hilo/view/Button
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @property {Object} upState 按钮弹起状态的属性或其drawable的属性的集合。
 * @property {Object} overState 按钮经过状态的属性或其drawable的属性的集合。
 * @property {Object} downState 按钮按下状态的属性或其drawable的属性的集合。
 * @property {Object} disabledState 按钮不可用状态的属性或其drawable的属性的集合。
 * @property {String} state 按钮的状态名称。它是 Button.UP|OVER|DOWN|DISABLED 之一。 只读属性。
 * @property {Boolean} enabled 指示按钮是否可用。默认为true。只读属性。
 * @property {Boolean} useHandCursor 当设置为true时，表示指针滑过按钮上方时是否显示手形光标。默认为true。
 */
 var Button = Class.create(/** @lends Button.prototype */{
    Extends: View,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("Button");
        Button.superclass.constructor.call(this, properties);

        this.drawable = new Drawable(properties);
        this.setState(Button.UP);
    },

    upState: null,
    overState: null,
    downState: null,
    disabledState: null,

    state: null,
    enabled: true,
    useHandCursor: true,

    /**
     * 设置按钮是否可用。
     * @param {Boolean} enabled 指示按钮是否可用。
     * @returns {Button} 按钮本身。
     */
    setEnabled: function(enabled){
        if(this.enabled != enabled){
            if(!enabled){
                this.setState(Button.DISABLED);
            }else{
                this.setState(Button.UP);
            }
        }
        return this;
    },

    /**
     * 设置按钮的状态。此方法由Button内部调用，一般无需使用此方法。
     * @param {String} state 按钮的新的状态。
     * @returns {Button} 按钮本身。
     */
    setState: function(state){
        if(this.state !== state){
            this.state = state;
            this.pointerEnabled = this.enabled = state !== Button.DISABLED;

            var stateObj;
            switch(state){
                case Button.UP:
                    stateObj = this.upState;
                    break;
                case Button.OVER:
                    stateObj = this.overState;
                    break;
                case Button.DOWN:
                    stateObj = this.downState;
                    break;
                case Button.DISABLED:
                    stateObj = this.disabledState;
                    break;
            }

            if(stateObj){
                this.drawable.init(stateObj);
                Hilo.copy(this, stateObj, true);
            }
        }

        return this;
    },

    /**
     * overwrite
     * @private
     */
    fire: function(type, detail){
        if(!this.enabled) return;

        var evtType = typeof type === 'string' ? type : type.type;
        switch(evtType){
            case 'mousedown':
            case 'touchstart':
            case 'touchmove':
                this.setState(Button.DOWN);
                break;
            case "mouseover":
                this.setState(Button.OVER);
                break;
            case 'mouseup':
                if(this.overState) this.setState(Button.OVER);
                else if(this.upState) this.setState(Button.UP);
                break;
            case 'touchend':
            case 'touchout':
            case 'mouseout':
                this.setState(Button.UP);
                break;
        }

        return Button.superclass.fire.call(this, type, detail);
    },

    Statics: /** @lends Button */ {
        /**
         * 按钮弹起状态的常量值，即：'up'。
         * @type String
         */
        UP: 'up',
        /**
         * 按钮经过状态的常量值，即：'over'。
         * @type String
         */
        OVER: 'over',
        /**
         * 按钮按下状态的常量值，即：'down'。
         * @type String
         */
        DOWN: 'down',
        /**
         * 按钮不可用状态的常量值，即：'disabled'。
         * @type String
         */
        DISABLED: 'disabled'
    }
 });
Hilo.Button = Button;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class TextureAtlas纹理集是将许多小的纹理图片整合到一起的一张大图。这个类可根据一个纹理集数据读取纹理小图、精灵动画等。
 * @param {Object} atlasData 纹理集数据。它可包含如下数据：
 * <ul>
 * <li><b>image</b> - 纹理集图片。必需。</li>
 * <li><b>width</b> - 纹理集图片宽度。若frames数据为Object时，此属性必需。</li>
 * <li><b>height</b> - 纹理集图片高度。若frames数据为Object时，此属性必需。</li>
 * <li><b>frames</b> - 纹理集帧数据，可以是Array或Object。必需。
 * <ul>
 * <li>若为Array，则每项均为一个纹理图片帧数据，如：[[0, 0, 50, 50], [0, 50, 50, 50]。</li>
 * <li>若为Object，则需包含frameWidth(帧宽)、frameHeight(帧高)、numFrames(帧数) 属性。</li>
 * </ul>
 * </li>
 * <li><b>sprites</b> - 纹理集精灵动画定义，其每个值均定义一个精灵。为Object对象。可选。
 * <ul>
 * <li>若为Number，即此精灵只包含一帧，此帧为帧数据中索引为当前值的帧。如：sprites:{'foo':1}。</li>
 * <li>若为Array，则每项均为一个帧的索引值。如：sprites:{'foo':[0, 1, 2, 3]}。</li>
 * <li>若为Object，则需包含from(起始帧索引值)、to(末帧索引值) 属性。</li>
 * </ul>
 * </li>
 * </ul>
 * @module hilo/util/TextureAtlas
 * @requires hilo/core/Class
 */
var TextureAtlas = (function(){

return Class.create(/** @lends TextureAtlas.prototype */{
    constructor: function(atlasData){
        this._frames = parseTextureFrames(atlasData);
        this._sprites = parseTextureSprites(atlasData, this._frames);
    },

    _frames: null,
    _sprites: null,

    /**
     * 获取指定索引位置index的帧数据。
     * @param {Int} index 要获取帧的索引位置。
     * @returns {Object} 帧数据。
     */
    getFrame: function(index){
        var frames = this._frames;
        return frames && frames[index];
    },

    /**
     * 获取指定id的精灵数据。
     * @param {String} id 要获取精灵的id。
     * @returns {Object} 精灵数据。
     */
    getSprite: function(id){
        var sprites = this._sprites;
        return sprites && sprites[id];
    },

    Statics: /** @lends TextureAtlas */ {
        /**
         * 创建精灵帧数据的快捷方法。
         * @param {String|Array} name 动画名称|一组动画数据
         * @param {String} frames 帧数据 eg:"0-5"代表第0到第5帧
         * @param {Number} w 每帧的宽
         * @param {Number} h 每帧的高
         * @param {Bollean} loop 是否循环
         * @param {Number} duration 每帧间隔 默认单位帧, 如果sprite的timeBased为true则单位是毫秒，默认一帧
         * @example
         *  //方式一 单个动画
         *  createSpriteFrames("walk", "0-5,8,9", meImg, 55, 88, true, 1);
         *  //方式二 多组动画
         *  createSpriteFrames([
         *    ["walk", "0-5,8,9", meImg, 55, 88, true, 1],
         *    ["jump", "0-5", meImg, 55, 88, false, 1]
         *  ]);
        */
        createSpriteFrames:function(name, frames, img, w, h, loop, duration){
            if(Object.prototype.toString.call(name) === "[object Array]"){
                var frames = [];
                for(var i = 0, l = name.length;i < l;i ++){
                    frames = frames.concat(this.createSpriteFrames.apply(this, name[i]));
                }
                return frames;
            }
            else{
                if(typeof(frames) === "string"){
                    var all = frames.split(",");
                    frames = [];
                    for(var j = 0, jl = all.length;j < jl;j ++){
                        var temp = all[j].split("-");
                        if(temp.length == 1){
                            frames.push(parseInt(temp[0]));
                        }
                        else{
                            for(var i = parseInt(temp[0]), l = parseInt(temp[1]);i <= l;i ++){
                                frames.push(i);
                            }
                        }
                    }
                }

                var col = Math.floor(img.width/w);
                for(var i = 0;i < frames.length;i ++){
                    var n = frames[i];
                    frames[i] = {
                        rect:[w*(n%col), h*Math.floor(n/col), w, h],
                        image:img,
                        duration:duration
                    }
                }
                frames[0].name = name;
                if(loop){
                    frames[frames.length-1].next = name;
                }
                else{
                    frames[frames.length-1].stop = true;
                }
                return frames;
            }
        }
    }
});

/**
 * 解析纹理集帧数据。
 * @private
 */
function parseTextureFrames(atlasData){
    var frameData = atlasData.frames;
    if(!frameData) return null;

    var frames = [], obj;

    if(frameData instanceof Array){ //frames by array
        for(var i = 0, len = frameData.length; i < len; i++){
            obj = frameData[i];
            frames[i] = {
                image: atlasData.image,
                rect: obj
            };
        }
    }else{ //frames by object
        var frameWidth = frameData.frameWidth;
        var frameHeight = frameData.frameHeight;
        var cols = atlasData.width / frameWidth | 0;
        var rows = atlasData.height / frameHeight | 0;
        var numFrames = frameData.numFrames || cols * rows;
        for(var i = 0; i < numFrames; i++){
            frames[i] = {
                image: atlasData.image,
                rect: [i%cols*frameWidth, (i/cols|0)*frameHeight, frameWidth, frameHeight]
            }
        }
    }

    return frames;
}

/**
 * 解析精灵数据。
 * @private
 */
function parseTextureSprites(atlasData, frames){
    var spriteData = atlasData.sprites;
    if(!spriteData) return null;

    var sprites = {}, sprite, spriteFrames, spriteFrame;

    for(var s in spriteData){
        sprite = spriteData[s];
        if(isNumber(sprite)){ //single frame
            spriteFrames = translateSpriteFrame(frames[sprite]);
        }else if(sprite instanceof Array){ //frames by array
            spriteFrames = [];
            for(var i = 0, len = sprite.length; i < len; i++){
                var spriteObj = sprite[i], frameObj;
                if(isNumber(spriteObj)){
                    spriteFrame = translateSpriteFrame(frames[spriteObj]);
                }else{
                    frameObj = spriteObj.rect;
                    if(isNumber(frameObj)) frameObj = frames[spriteObj.rect];
                    spriteFrame = translateSpriteFrame(frameObj, spriteObj);
                }
                spriteFrames[i] = spriteFrame;
            }
        }else{ //frames by object
            spriteFrames = [];
            for(var i = sprite.from; i <= sprite.to; i++){
                spriteFrames[i - sprite.from] = translateSpriteFrame(frames[i], sprite[i]);
            }
        }
        sprites[s] = spriteFrames;
    }

    return sprites;
}

function translateSpriteFrame(frameObj, spriteObj){
    var spriteFrame = {
        image: frameObj.image,
        rect: frameObj.rect
    };

    if(spriteObj){
        spriteFrame.name = spriteObj.name || null;
        spriteFrame.duration = spriteObj.duration || 0;
        spriteFrame.stop = !!spriteObj.stop;
        spriteFrame.next = spriteObj.next || null;
    }

    return spriteFrame;
}

function isNumber(value){
    return typeof value === 'number';
}

})();
Hilo.TextureAtlas = TextureAtlas;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Ticker是一个定时器类。它可以按指定帧率重复运行，从而按计划执行代码。
 * @param {Number} fps 指定定时器的运行帧率。
 * @module hilo/util/Ticker
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 */
var Ticker = Class.create(/** @lends Ticker.prototype */{
    constructor: function(fps){
        this._targetFPS = fps || 30;
        this._interval = 1000 / this._targetFPS;
        this._tickers = [];
    },

    _paused: false,
    _targetFPS: 0,
    _interval: 0,
    _intervalId: null,
    _tickers: null,
    _lastTime: 0,
    _tickCount: 0,
    _tickTime: 0,
    _measuredFPS: 0,

    /**
     * 启动定时器。
     * @param {Boolean} userRAF 是否使用requestAnimationFrame，默认为false。
     */
    start: function(useRAF){
        if(this._intervalId) return;
        this._lastTime = +new Date();

        var self = this, interval = this._interval,
            raf = window.requestAnimationFrame ||
                  window[Hilo.browser.jsVendor + 'RequestAnimationFrame'];

        if(useRAF && raf){
            var tick = function(){
                self._tick();
            }
            var runLoop = function(){
                self._intervalId = setTimeout(runLoop, interval);
                raf(tick);
            };
        }else{
            runLoop = function(){
                self._intervalId = setTimeout(runLoop, interval);
                self._tick();
            };
        }

        runLoop();
    },

    /**
     * 停止定时器。
     */
    stop: function(){
        clearTimeout(this._intervalId);
        this._intervalId = null;
        this._lastTime = 0;
    },

    /**
     * 暂停定时器。
     */
    pause: function(){
        this._paused = true;
    },

    /**
     * 恢复定时器。
     */
    resume: function(){
        this._paused = false;
    },

    /**
     * @private
     */
    _tick: function(){
        if(this._paused) return;
        var startTime = +new Date(),
            deltaTime = startTime - this._lastTime,
            tickers = this._tickers;

        //calculates the real fps
        if(++this._tickCount >= this._targetFPS){
            this._measuredFPS = 1000 / (this._tickTime / this._tickCount) + 0.5 >> 0;
            this._tickCount = 0;
            this._tickTime = 0;
        }else{
            this._tickTime += startTime - this._lastTime;
        }
        this._lastTime = startTime;

        for(var i = 0, len = tickers.length; i < len; i++){
            tickers[i].tick(deltaTime);
        }
    },

    /**
     * 获得测定的运行时帧率。
     */
    getMeasuredFPS: function(){
        return this._measuredFPS;
    },

    /**
     * 添加定时器对象。定时器对象必须实现 tick 方法。
     * @param {Object} tickObject 要添加的定时器对象。此对象必须包含 tick 方法。
     */
    addTick: function(tickObject){
        if(!tickObject || typeof(tickObject.tick) != 'function'){
            throw new Error('Ticker: The tick object must implement the tick method.');
        }
        this._tickers.push(tickObject);
    },

    /**
     * 删除定时器对象。
     * @param {Object} tickObject 要删除的定时器对象。
     */
    removeTick: function(tickObject){
        var tickers = this._tickers,
            index = tickers.indexOf(tickObject);
        if(index >= 0){
            tickers.splice(index, 1);
        }
    }

});
Hilo.Ticker = Ticker;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

var arrayProto = Array.prototype,
    slice = arrayProto.slice;

//polyfiil for Array.prototype.indexOf
arrayProto.indexOf = arrayProto.indexOf || function(elem, fromIndex){
    fromIndex = fromIndex || 0;
    var len = this.length, i;
    if(len == 0 || fromIndex >= len) return -1;
    if(fromIndex < 0) fromIndex = len + fromIndex;
    for(i = fromIndex; i < len; i++){
        if(this[i] === elem) return i;
    }
    return -1;
};

var fnProto = Function.prototype;

//polyfill for Function.prototype.bind
fnProto.bind = fnProto.bind || function(thisArg){
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
Hilo.undefined = undefined;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/drag.html?noHeader' width = '550' height = '250' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var bmp = new Bitmap({image:img});
 * Hilo.copy(bmp, Hilo.drag);
 * bmp.startDrag([0, 0, 550, 400]);
 * </pre>
 * @class drag是一个包含拖拽功能的mixin。可以通过 Class.mix(view, drag)或Hilo.copy(view, drag)来为view增加拖拽功能。
 * @mixin
 * @static
 * @module hilo/util/drag
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 */
var drag = {
    /**
      * 开始拖拽
      * @param {Array} bounds 拖拽范围，基于父容器坐标系，[x, y, width, height]， 默认无限制
    */
    startDrag:function(bounds){
        var that = this;
        var stage;
        var bounds = bounds||[-Infinity, -Infinity, Infinity, Infinity];
        var mouse = {
            x:0,
            y:0,
            preX:0,
            preY:0
        };
        var minX = bounds[0];
        var minY = bounds[1];
        var maxX = bounds[2] == Infinity?Infinity:minX + bounds[2];
        var maxY = bounds[3] == Infinity?Infinity:minY + bounds[3];

        function onStart(e){
            e.stopPropagation();
            updateMouse(e);
            that.off(Hilo.event.POINTER_START, onStart);

            that.fire("dragStart", mouse);

            that.__dragX = that.x - mouse.x;
            that.__dragY = that.y - mouse.y;

            if(!stage){
                stage = this.getStage();
            }
            stage.on(Hilo.event.POINTER_MOVE, onMove);
            document.addEventListener(Hilo.event.POINTER_END, onStop);
        }

        function onStop(e){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);

            that.fire("dragEnd", mouse);
            that.on(Hilo.event.POINTER_START, onStart);
        }

        function onMove(e){
            updateMouse(e);

            that.fire("dragMove", mouse);

            var x = mouse.x + that.__dragX;
            var y = mouse.y + that.__dragY;

            that.x = Math.max(minX, Math.min(maxX, x));
            that.y = Math.max(minY, Math.min(maxY, y));
        }

        function updateMouse(e){
            mouse.preX = mouse.x;
            mouse.preY = mouse.y;
            mouse.x = e.stageX;
            mouse.y = e.stageY;
        }

        function stopDrag(){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);
            that.off(Hilo.event.POINTER_START, onStart);
        }
        that.on(Hilo.event.POINTER_START, onStart);

        that.stopDrag = stopDrag;
    },
    /**
      * 停止拖拽
    */
    stopDrag:function(){

    }
};
Hilo.drag = drag;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/Tween.html?noHeader' width = '550' height = '130' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * ticker.addTick(Hilo.Tween);//需要把Tween加到ticker里才能使用
 *
 * var view = new View({x:5, y:10});
 * Hilo.Tween.to(view, {
 *     x:100,
 *     y:20,
 *     alpha:0
 * }, {
 *     duration:1000,
 *     delay:500,
 *     ease:Hilo.Ease.Quad.EaseIn,
 *     onComplete:function(){
 *         console.log('complete');
 *     }
 * });
 * </pre>
 * @class Tween类提供缓动功能。
 * @param {Object} target 缓动对象。
 * @param {Object} fromProps 对象缓动的起始属性集合。
 * @param {Object} toProps 对象缓动的目标属性集合。
 * @param {Object} params 缓动参数。可包含Tween类所有可写属性。
 * @module hilo/tween/Tween
 * @requires hilo/core/Class
 * @property {Object} target 缓动目标。只读属性。
 * @property {Int} duration 缓动总时长。单位毫秒。
 * @property {Int} delay 缓动延迟时间。单位毫秒。
 * @property {Boolean} paused 缓动是否暂停。默认为false。
 * @property {Boolean} loop 缓动是否循环。默认为false。
 * @property {Boolean} reverse 缓动是否反转播放。默认为false。
 * @property {Int} repeat 缓动重复的次数。默认为0。
 * @property {Int} repeatDelay 缓动重复的延迟时长。单位为毫秒。
 * @property {Function} ease 缓动变化函数。默认为null。
 * @property {Int} time 缓动已进行的时长。单位毫秒。只读属性。
 * @property {Function} onStart 缓动开始回调函数。它接受1个参数：tween。默认值为null。
 * @property {Function} onUpdate 缓动更新回调函数。它接受2个参数：ratio和tween。默认值为null。
 * @property {Function} onComplete 缓动结束回调函数。它接受1个参数：tween。默认值为null。
 */
var Tween = (function(){

function now(){
    return +new Date();
}

return Class.create(/** @lends Tween.prototype */{
    constructor: function(target, fromProps, toProps, params){
        var me = this;

        me.target = target;
        me._startTime = 0;
        me._seekTime = 0;
        me._pausedTime = 0;
        me._pausedStartTime = 0;
        me._reverseFlag = 1;
        me._repeatCount = 0;

        //no fromProps if pass 3 arguments
        if(arguments.length == 3){
            params = toProps;
            toProps = fromProps;
            fromProps = null;
        }

        for(var p in params) me[p] = params[p];
        me.setProps(fromProps, toProps);

        //for old version compatiblity
        if(!params.duration && params.time){
            me.duration = params.time || 0;
            me.time = 0;
        }
    },

    target: null,
    duration: 0,
    delay: 0,
    paused: false,
    loop: false,
    reverse: false,
    repeat: 0,
    repeatDelay: 0,
    ease: null,
    time: 0, //ready only

    onStart: null,
    onUpdate: null,
    onComplete: null,

    /**
     * 设置缓动对象的初始和目标属性。
     * @param {Object} fromProps 缓动对象的初始属性。
     * @param {Object} toProps 缓动对象的目标属性。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    setProps: function(fromProps, toProps){
        var me = this, target = me.target,
            propNames = fromProps || toProps,
            from = me._fromProps = {}, to = me._toProps = {};

        fromProps = fromProps || target;
        toProps = toProps || target;

        for(var p in propNames){
            to[p] = toProps[p] || 0;
            target[p] = from[p] = fromProps[p] || 0;
        }
        return me;
    },

    /**
     * 启动缓动动画的播放。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    start: function(){
        var me = this;
        me._startTime = now() + me.delay;
        me._seekTime = 0;
        me._pausedTime = 0;
        me.paused = false;
        Tween.add(me);
        return me;
    },

    /**
     * 停止缓动动画的播放。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    stop: function(){
        Tween.remove(this);
        return this;
    },

    /**
     * 暂停缓动动画的播放。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    pause: function(){
        var me = this;
        me.paused = true;
        me._pausedStartTime = now();
        return me;
    },

    /**
     * 恢复缓动动画的播放。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    resume: function(){
        var me = this;
        me.paused = false;
        if(me._pausedStartTime) me._pausedTime += now() - me._pausedStartTime;
        me._pausedStartTime = 0;
        return me;
    },

    /**
     * 跳转Tween到指定的时间。
     * @param {Number} time 指定要跳转的时间。取值范围为：0 - duraion。
     * @param {Boolean} pause 是否暂停。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    seek: function(time, pause){
        var me = this, current = now();
        me._startTime = current;
        me._seekTime = time;
        me._pausedTime = 0;
        if(pause !== undefined) me.paused = pause;
        me._update(current, true);
        Tween.add(me);
        return me;
    },

    /**
     * 连接下一个Tween变换。其开始时间根据delay值不同而不同。当delay值为字符串且以'+'或'-'开始时，Tween的开始时间从当前变换结束点计算，否则以当前变换起始点计算。
     * @param {Tween} tween 要连接的Tween变换。
     * @returns {Tween} Tween变换本身。可用于链式调用。
     */
    link: function(tween){
        var me = this, delay = tween.delay, startTime = me._startTime;

        if(typeof delay === 'string'){
            var plus = delay.indexOf('+') == 0, minus = delay.indexOf('-') == 0;
            delay = plus || minus ? Number(delay.substr(1)) * (plus ? 1 : -1) : Number(delay);
        }
        tween.delay = delay;
        tween._startTime = plus || minus ? startTime + me.duration + delay : startTime + delay;

        me._next = tween;
        Tween.remove(tween);
        return me;
    },

    /**
     * Tween类的内部渲染方法。
     * @private
     */
    _render: function(ratio){
        var me = this, target = me.target, fromProps = me._fromProps, p;
        for(p in fromProps) target[p] = fromProps[p] + (me._toProps[p] - fromProps[p]) * ratio;
    },

    /**
     * Tween类的内部更新方法。
     * @private
     */
    _update: function(time, forceUpdate){
        var me = this;
        if(me.paused && !forceUpdate) return;

        //elapsed time
        var elapsed = time - me._startTime - me._pausedTime + me._seekTime;
        if(elapsed < 0) return;

        //elapsed ratio
        var ratio = elapsed / me.duration, complete = false, callback;
        ratio = ratio <= 0 ? 0 : ratio >= 1 ? 1 : me.ease ? me.ease(ratio) : ratio;

        if(me.reverse){
            //backward
            if(me._reverseFlag < 0) ratio = 1 - ratio;
            //forward
            if(ratio < 1e-7){
                //repeat complete or not loop
                if((me.repeat > 0 && me._repeatCount++ >= me.repeat) || (me.repeat == 0 && !me.loop)){
                    complete = true;
                }else{
                    me._startTime = now();
                    me._pausedTime = 0;
                    me._reverseFlag *= -1;
                }
            }
        }

        //start callback
        if(me.time == 0 && (callback = me.onStart)) callback.call(me, me);
        me.time = elapsed;

        //render & update callback
        me._render(ratio);
        (callback = me.onUpdate) && callback.call(me, ratio, me);

        //check if complete
        if(ratio >= 1){
            if(me.reverse){
                me._startTime = now();
                me._pausedTime = 0;
                me._reverseFlag *= -1;
            }else if(me.loop || me.repeat > 0 && me._repeatCount++ < me.repeat){
                me._startTime = now() + me.repeatDelay;
                me._pausedTime = 0;
            }else{
                complete = true;
            }
        }

        //next tween
        var next = me._next;
        if(next && next.time <= 0){
            var nextStartTime = next._startTime;
            if(nextStartTime > 0 && nextStartTime <= time){
                //parallel tween
                next._render(ratio);
                next.time = elapsed;
                Tween.add(next);
            }else if(complete && (nextStartTime < 0 || nextStartTime > time)){
                //next tween
                next.start();
            }
        }

        //complete
        if(complete){
            (callback = me.onComplete) && callback.call(me, me);
            return true;
        }
    },

    Statics: /** @lends Tween */ {
        /**
         * @private
         */
        _tweens: [],

        /**
         * 更新所有Tween实例。
         * @returns {Object} Tween。
         */
        tick: function(){
            var tweens = Tween._tweens, tween, i, len = tweens.length;

            for(i = 0; i < len; i++){
                tween = tweens[i];
                if(tween && tween._update(now())){
                    tweens.splice(i, 1);
                    i--;
                }
            }
            return Tween;
        },

        /**
         * 添加Tween实例。
         * @param {Tween} tween 要添加的Tween对象。
         * @returns {Object} Tween。
         */
        add: function(tween){
            var tweens = Tween._tweens;
            if(tweens.indexOf(tween) == -1) tweens.push(tween);
            return Tween;
        },

        /**
         * 删除Tween实例。
         * @param {Tween|Object|Array} tweenOrTarget 要删除的Tween对象或target对象或要删除的一组对象。
         * @returns {Object} Tween。
         */
        remove: function(tweenOrTarget){
            if(tweenOrTarget instanceof Array){
                for(var i = 0, l = tweenOrTarget.length;i < l;i ++){
                    Tween.remove(tweenOrTarget[i]);
                }
                return Tween;
            }

            var tweens = Tween._tweens, i;
            if(tweenOrTarget instanceof Tween){
                i = tweens.indexOf(tweenOrTarget);
                if(i > -1) tweens.splice(i, 1);
            }else{
                for(i = 0; i < tweens.length; i++){
                    if(tweens[i].target === tweenOrTarget){
                        tweens.splice(i, 1);
                        i--;
                    }
                }
            }

            return Tween;
        },

        /**
         * 删除所有Tween实例。
         * @returns {Object} Tween。
         */
        removeAll: function(){
            Tween._tweens.length = 0;
            return Tween;
        },

        /**
         * 创建一个缓动动画，让目标对象从开始属性变换到目标属性。
         * @param {Object|Array} target 缓动目标对象或缓动目标数组。
         * @param fromProps 缓动目标对象的开始属性。
         * @param toProps 缓动目标对象的目标属性。
         * @param params 缓动动画的参数。
         * @returns {Tween|Array} 一个Tween实例对象或Tween实例数组。
         */
        fromTo: function(target, fromProps, toProps, params){
            var isArray = target instanceof Array;
            target = isArray ? target : [target];

            var tween, i, stagger = params.stagger, tweens = [];
            for(i = 0; i < target.length; i++){
                tween = new Tween(target[i], fromProps, toProps, params);
                if(stagger) tween.delay = (params.delay || 0) + (i * stagger || 0);
                tween.start();
                tweens.push(tween);
            }

            return isArray?tweens:tween;
        },

        /**
         * 创建一个缓动动画，让目标对象从当前属性变换到目标属性。
         * @param {Object|Array} target 缓动目标对象或缓动目标数组。
         * @param toProps 缓动目标对象的目标属性。
         * @param params 缓动动画的参数。
         * @returns {Tween|Array} 一个Tween实例对象或Tween实例数组。
         */
        to: function(target, toProps, params){
            return Tween.fromTo(target, null, toProps, params);
        },

        /**
         * 创建一个缓动动画，让目标对象从指定的起始属性变换到当前属性。
         * @param {Object|Array} target 缓动目标对象或缓动目标数组。
         * @param fromProps 缓动目标对象的目标属性。
         * @param params 缓动动画的参数。
         * @returns {Tween|Array} 一个Tween实例对象或Tween实例数组。
         */
        from: function(target, fromProps, params){
            return Tween.fromTo(target, fromProps, null, params);
        }
    }

});

})();
Hilo.Tween = Tween;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Ease类包含为Tween类提供各种缓动功能的函数。
 * @module hilo/tween/Ease
 * @static
 */
var Ease = (function(){

function createEase(obj, easeInFn, easeOutFn, easeInOutFn, easeNoneFn){
    obj = obj || {};
    easeInFn && (obj.EaseIn = easeInFn);
    easeOutFn && (obj.EaseOut = easeOutFn);
    easeInOutFn && (obj.EaseInOut = easeInOutFn);
    easeNoneFn && (obj.EaseNone = easeNoneFn);
    return obj;
}

/**
 * 线性匀速缓动函数。包含EaseNone函数。
 */
var Linear = createEase(null, null, null, null, function(k){
    return k;
});

/**
 * 二次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Quad = createEase(null,
    function(k){
        return k * k;
    },

    function(k){
        return - k * (k - 2);
    },

    function(k){
        return ((k *= 2) < 1) ? 0.5 * k * k : -0.5 * (--k * (k - 2) - 1);
    }
);

/**
 * 三次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Cubic = createEase(null,
    function(k){
        return k * k * k;
    },

    function(k){
        return --k * k * k + 1;
    },

    function(k){
        return ((k *= 2) < 1) ? 0.5 * k * k * k : 0.5 * ((k -= 2) * k * k + 2);
    }
);

/**
 * 四次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Quart = createEase(null,
    function(k){
        return k * k * k * k;
    },

    function(k){
        return -(--k * k * k * k - 1);
    },

    function(k){
        return ((k *= 2) < 1) ? 0.5 * k * k * k * k : - 0.5 * ((k -= 2) * k * k * k - 2);
    }
);

/**
 * 五次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Quint = createEase(null,
    function(k){
        return k * k * k * k * k;
    },

    function(k){
        return (k = k - 1) * k * k * k * k + 1;
    },

    function(k){
        return ((k *= 2) < 1) ? 0.5 * k * k * k * k * k : 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
);

var math = Math,
    PI = math.PI, HALF_PI = PI * 0.5,
    sin = math.sin, cos = math.cos,
    pow = math.pow, sqrt = math.sqrt;

/**
 * 正弦缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Sine = createEase(null,
    function(k){
        return -cos(k * HALF_PI) + 1;
    },

    function(k){
        return sin(k * HALF_PI);
    },

    function(k){
        return -0.5 * (cos(PI * k) - 1);
    }
);

/**
 * 指数缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Expo = createEase(null,
    function(k){
        return k == 0 ? 0 : pow(2, 10 * (k - 1));
    },

    function(k){
        return k == 1 ? 1 : -pow(2, -10 * k) + 1;
    },

    function(k){
        if(k == 0 || k == 1) return k;
        if((k *= 2) < 1) return 0.5 * pow(2, 10 * (k - 1));
        return 0.5 * (-pow(2, - 10 * (k - 1)) + 2);
    }
);

/**
 * 圆形缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Circ = createEase(null,
    function(k){
        return -(sqrt(1 - k * k) - 1);
    },

    function(k){
        return sqrt(1 - --k * k);
    },

    function(k){
        if((k /= 0.5) < 1) return - 0.5 * (sqrt(1 - k * k) - 1);
        return 0.5 * (sqrt(1 - (k -= 2) * k) + 1);
    }
);

/**
 * 弹性缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Elastic = createEase(
    {
        a: 1,
        p: 0.4,
        s: 0.1,

        config: function(amplitude, period){
            Elastic.a = amplitude;
            Elastic.p = period;
            Elastic.s = period / (2 * PI) * Math.asin(1 / amplitude) || 0;
        }
    },

    function(k){
        return -(Elastic.a * pow(2, 10 * (k -= 1)) * sin((k - Elastic.s) * (2 * PI) / Elastic.p));
    },

    function(k){
        return (Elastic.a * pow(2, -10 * k) * sin((k - Elastic.s) * (2 * PI) / Elastic.p) + 1);
    },

    function(k){
        return ((k *= 2) < 1) ? -0.5 * (Elastic.a * pow(2, 10 * (k -= 1)) * sin((k - Elastic.s) * (2 * PI) / Elastic.p)) :
               Elastic.a * pow(2, -10 * (k -= 1)) * sin((k - Elastic.s) * (2 * PI) / Elastic.p) * 0.5 + 1;
    }
);

/**
 * 向后缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Back = createEase(
    {
        o: 1.70158,
        s: 2.59491,

        config: function(overshoot){
            Back.o = overshoot;
            Back.s = overshoot * 1.525;
        }
    },

    function(k){
        return k * k * ((Back.o + 1) * k - Back.o);
    },

    function(k){
        return (k = k - 1) * k * ((Back.o + 1) * k + Back.o) + 1;
    },

    function(k){
        return ((k *= 2) < 1) ? 0.5 * (k * k * ((Back.s + 1) * k - Back.s)) : 0.5 * ((k -= 2) * k * ((Back.s + 1) * k + Back.s) + 2);
    }
);

/**
 * 弹跳缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
 */
var Bounce = createEase(null,
    function(k){
        return 1 - Bounce.EaseOut(1 - k);
    },

    function(k){
        if((k /= 1) < 0.36364){
            return 7.5625 * k * k;
        }else if(k < 0.72727){
            return 7.5625 * (k -= 0.54545) * k + 0.75;
        }else if(k < 0.90909){
            return 7.5625 * (k -= 0.81818) * k + 0.9375;
        }else{
            return 7.5625 * (k -= 0.95455) * k + 0.984375;
        }
    },

    function(k){
        return k < 0.5 ? Bounce.EaseIn(k * 2) * 0.5 : Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;
    }
);

return {
    Linear: Linear,
    Quad: Quad,
    Cubic: Cubic,
    Quart: Quart,
    Quint: Quint,
    Sine: Sine,
    Expo: Expo,
    Circ: Circ,
    Elastic: Elastic,
    Back: Back,
    Bounce: Bounce
}

})();
Hilo.Ease = Ease;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @private
 * @class 图片资源加载器。
 * @module hilo/loader/ImageLoader
 * @requires hilo/core/Class
 */
var ImageLoader = Class.create({
    load: function(data){
        var me = this;

        var image = new Image();
        if(data.crossOrigin){
            image.crossOrigin = data.crossOrigin;
        }

        image.onload = //me.onLoad.bind(image);
        function(){
            me.onLoad(image)
        };
        image.onerror = image.onabort = me.onError.bind(image);
        image.src = data.src + (data.noCache ? (data.src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date) : '');
    },

    onLoad: function(e){
        e = e||window.event;
        var image = e//e.target;
        image.onload = image.onerror = image.onabort = null;
        return image;
    },

    onError: function(e){
        var image = e.target;
        image.onload = image.onerror = image.onabort = null;
        return e;
    }

});
Hilo.ImageLoader = ImageLoader;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @private
 * @class javascript或JSONP加载器。
 * @module hilo/loader/ScriptLoader
 * @requires hilo/core/Class
 */
var ScriptLoader = Class.create({
    load: function(data){
        var me = this, src = data.src, isJSONP = data.type == 'jsonp';

        if(isJSONP){
            var callbackName = data.callbackName || 'callback';
            var callback = data.callback || 'jsonp' + (++ScriptLoader._count);
            var win = window;

            if(!win[callback]){
                win[callback] = function(result){
                    delete win[callback];
                }
            }
        }

        if(isJSONP) src += (src.indexOf('?') == -1 ? '?' : '&') + callbackName + '=' + callback;
        if(data.noCache) src += (src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date());

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = me.onLoad.bind(me);
        script.onerror = me.onError.bind(me);
        script.src = src;
        if(data.id) script.id = data.id;
        document.getElementsByTagName('head')[0].appendChild(script);
    },

    onLoad: function(e){
        var script = e.target;
        script.onload = script.onerror = null;
        return script;
    },

    onError: function(e){
        var script = e.target;
        script.onload = script.onerror = null;
        return e;
    },

    Statics: {
        _count: 0
    }

});
Hilo.ScriptLoader = ScriptLoader;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var EventMixin = Hilo.EventMixin;
var ImageLoader = Hilo.ImageLoader;
var ScriptLoader = Hilo.ScriptLoader;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */
 
//TODO: 超时timeout，失败重连次数maxTries，更多的下载器Loader，队列暂停恢复等。

/**
 * @class LoadQueue是一个队列下载工具。
 * @param {Object} source 要下载的资源。可以是单个资源对象或多个资源的数组。
 * @module hilo/loader/LoadQueue
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/loader/ImageLoader
 * @requires hilo/loader/ScriptLoader
 * @property {Int} maxConnections 同时下载的最大连接数。默认为2。
 */
var LoadQueue = Class.create(/** @lends LoadQueue.prototype */{
    Mixes: EventMixin,
    constructor: function(source){
        this._source = [];
        this.add(source);
    },

    maxConnections: 2, //TODO: 应该是每个host的最大连接数。

    _source: null,
    _loaded: 0,
    _connections: 0,
    _currentIndex: -1,

    /**
     * 增加要下载的资源。可以是单个资源对象或多个资源的数组。
     * @param {Object|Array} source 资源对象或资源对象数组。每个资源对象包含以下属性：
     * <ul>
     * <li><b>id</b> - 资源的唯一标识符。可用于从下载队列获取目标资源。</li>
     * <li><b>src</b> - 资源的地址url。</li>
     * <li><b>type</b> - 指定资源的类型。默认会根据资源文件的后缀来自动判断类型，不同的资源类型会使用不同的加载器来加载资源。</li>
     * <li><b>loader</b> - 指定资源的加载器。默认会根据资源类型来自动选择加载器，若指定loader，则会使用指定的loader来加载资源。</li>
     * <li><b>noCache</b> - 指示加载资源时是否增加时间标签以防止缓存。</li>
     * <li><b>size</b> - 资源对象的预计大小。可用于预估下载进度。</li>
     * </ul>
     * @returns {LoadQueue} 下载队列实例本身。
     */
    add: function(source){
        var me = this;
        if(source){
            source = source instanceof Array ? source : [source];
            me._source = me._source.concat(source);
        }
        return me;
    },

    /**
     * 根据id或src地址获取资源对象。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源对象。
     */
    get: function(id){
        if(id){
            var source = this._source;
            for(var i = 0; i < source.length; i++){
                var item = source[i];
                if(item.id === id || item.src === id){
                    return item;
                }
            }
        }
        return null;
    },

    /**
     * 根据id或src地址获取资源内容。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源内容。
     */
    getContent: function(id){
        var item = this.get(id);
        return item && item.content;
    },

    /**
     * 开始下载队列。
     * @returns {LoadQueue} 下载队列实例本身。
     */
    start: function(){
        var me = this;
        me._loadNext();
        return me;
    },

    /**
     * @private
     */
    _loadNext: function(){
        var me = this, source = me._source, len = source.length;

        //all items loaded
        if(me._loaded >= len){
            me.fire('complete');
            return;
        }

        if(me._currentIndex < len - 1 && me._connections < me.maxConnections){
            var index = ++me._currentIndex;
            var item = source[index];
            var loader = me._getLoader(item);

            if(loader){
                var onLoad = loader.onLoad, onError = loader.onError;

                loader.onLoad = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    var content = onLoad && onLoad.call(loader, e) || e.target;
                    me._onItemLoad(index, content);
                };
                loader.onError = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    onError && onError.call(loader, e);
                    me._onItemError(index, e);
                };
                me._connections++;
            }

            me._loadNext();
            loader && loader.load(item);
        }
    },

    /**
     * @private
     */
    _getLoader: function(item){
        var me = this, loader = item.loader;
        if(loader) return loader;

        var type = item.type || getExtension(item.src);

        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                loader = new ImageLoader();
                break;
            case 'js':
            case 'jsonp':
                loader = new ScriptLoader();
                break;
        }

        return loader;
    },

    /**
     * @private
     */
    _onItemLoad: function(index, content){
        var me = this, item = me._source[index];
        item.loaded = true;
        item.content = content;
        me._connections--;
        me._loaded++;
        me.fire('load', item);
        me._loadNext();
    },

    /**
     * @private
     */
    _onItemError: function(index, e){
        var me = this, item = me._source[index];
        item.error = e;
        me._connections--;
        me._loaded++;
        me.fire('error', item);
        me._loadNext();
    },

    /**
     * 获取全部或已下载的资源的字节大小。
     * @param {Boolean} loaded 指示是已下载的资源还是全部资源。默认为全部。
     * @returns {Number} 指定资源的字节大小。
     */
    getSize: function(loaded){
        var size = 0, source = this._source;
        for(var i = 0; i < source.length; i++){
            var item = source[i];
            size += (loaded ? item.loaded && item.size : item.size) || 0;
        }
        return size;
    },

    /**
     * 获取已下载的资源数量。
     * @returns {Uint} 已下载的资源数量。
     */
    getLoaded: function(){
        return this._loaded;
    },

    /**
     * 获取所有资源的数量。
     * @returns {Uint} 所有资源的数量。
     */
    getTotal: function(){
        return this._source.length;
    }

});

/**
 * @private
 */
function getExtension(src){
    var extRegExp = /\/?[^/]+\.(\w+)(\?\S+)?$/i, match, extension;
    if(match = src.match(extRegExp)){
        extension = match[1].toLowerCase();
    }
    return extension || null;
}
Hilo.LoadQueue = LoadQueue;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var EventMixin = Hilo.EventMixin;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class HTMLAudio声音播放模块。此模块使用HTMLAudioElement播放音频。
 * 使用限制：iOS平台需用户事件触发才能播放，很多Android浏览器仅能同时播放一个音频。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/media/HTMLAudio
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @property {String} src 播放的音频的资源地址。
 * @property {Boolean} loop 是否循环播放。默认为false。
 * @property {Boolean} autoPlay 是否自动播放。默认为false。
 * @property {Boolean} loaded 音频资源是否已加载完成。只读属性。
 * @property {Boolean} playing 是否正在播放音频。只读属性。
 * @property {Number} duration 音频的时长。只读属性。
 * @property {Number} volume 音量的大小。取值范围：0-1。
 * @property {Boolean} muted 是否静音。默认为false。
 */
var HTMLAudio = Class.create(/** @lends HTMLAudio.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        Hilo.copy(this, properties, true);

        this._onAudioEvent = this._onAudioEvent.bind(this);
    },

    src: null,
    loop: false,
    autoPlay: false,
    loaded: false,
    playing: false,
    duration: 0,
    volume: 1,
    muted: false,

    _element: null, //HTMLAudioElement对象

    /**
     * 加载音频文件。
     */
    load: function(){
        if(!this._element){
            try{
                var elem = this._element = new Audio();
                elem.addEventListener('canplaythrough', this._onAudioEvent, false);
                elem.addEventListener('ended', this._onAudioEvent, false);
                elem.addEventListener('error', this._onAudioEvent, false);
                elem.src = this.src;
                elem.volume = this.volume;
                elem.load();
            }
            catch(err){
                //ie9 某些版本有Audio对象，但是执行play,pause会报错！
                var elem = this._element = {};
                elem.play = elem.pause = function(){

                };
            }
        }
        return this;
    },

    /**
     * @private
     */
    _onAudioEvent: function(e){
        // console.log('onAudioEvent:', e.type);
        var type = e.type;

        switch(type){
            case 'canplaythrough':
                e.target.removeEventListener(type, this._onAudioEvent);
                this.loaded = true;
                this.duration = this._element.duration;
                this.fire('load');
                if(this.autoPlay) this._doPlay();
                break;
            case 'ended':
                this.playing = false;
                this.fire('end');
                if(this.loop) this._doPlay();
                break;
            case 'error':
                this.fire('error');
                break;
        }
    },

    /**
     * @private
     */
    _doPlay: function(){
        if(!this.playing){
            this._element.volume = this.muted ? 0 : this.volume;
            this._element.play();
            this.playing = true;
        }
    },

    /**
     * 播放音频。如果正在播放，则会重新开始。
     * 注意：为了避免第一次播放不成功，建议在load音频后再播放。
     */
    play: function(){
        if(this.playing) this.stop();

        if(!this._element){
            this.autoPlay = true;
            this.load();
        }else if(this.loaded){
            this._doPlay();
        }

        return this;
    },

    /**
     * 暂停音频。
     */
    pause: function(){
        if(this.playing){
            this._element.pause();
            this.playing = false;
        }
        return this;
    },

    /**
     * 恢复音频播放。
     */
    resume: function(){
        if(!this.playing){
            this._doPlay();
        }
        return this;
    },

    /**
     * 停止音频播放。
     */
    stop: function(){
        if(this.playing){
            this._element.pause();
            this._element.currentTime = 0;
            this.playing = false;
        }
        return this;
    },

    /**
     * 设置音量。注意: iOS设备无法设置音量。
     */
    setVolume: function(volume){
        if(this.volume != volume){
            this.volume = volume;
            this._element.volume = volume;
        }
        return this;
    },

    /**
     * 设置静音模式。注意: iOS设备无法设置静音模式。
     */
    setMute: function(muted){
        if(this.muted != muted){
            this.muted = muted;
            this._element.volume = muted ? 0 : this.volume;
        }
        return this;
    },

    Statics: /** @lends HTMLAudio */ {
        /**
         * 浏览器是否支持HTMLAudio。
         */
        isSupported: window.Audio !== null
    }

});
Hilo.HTMLAudio = HTMLAudio;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var EventMixin = Hilo.EventMixin;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class WebAudio声音播放模块。它具有更好的声音播放和控制能力，适合在iOS6+平台使用。
 * 兼容情况：iOS6+、Chrome33+、Firefox28+支持，但Android浏览器均不支持。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/media/WebAudio
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @property {String} src 播放的音频的资源地址。
 * @property {Boolean} loop 是否循环播放。默认为false。
 * @property {Boolean} autoPlay 是否自动播放。默认为false。
 * @property {Boolean} loaded 音频资源是否已加载完成。只读属性。
 * @property {Boolean} playing 是否正在播放音频。只读属性。
 * @property {Number} duration 音频的时长。只读属性。
 * @property {Number} volume 音量的大小。取值范围：0-1。
 * @property {Boolean} muted 是否静音。默认为false。
 */
var WebAudio = (function(){

var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = AudioContext ? new AudioContext() : null;

return Class.create(/** @lends WebAudio.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        Hilo.copy(this, properties, true);

        this._init();
    },

    src: null,
    loop: false,
    autoPlay: false,
    loaded: false,
    playing: false,
    duration: 0,
    volume: 1,
    muted: false,

    _context: null, //WebAudio上下文
    _gainNode: null, //音量控制器
    _buffer: null, //音频缓冲文件
    _audioNode: null, //音频播放器
    _startTime: 0, //开始播放时间戳
    _offset: 0, //播放偏移量

    /**
     * @private 初始化
     */
    _init:function(){
        this._context = context;
        this._gainNode = context.createGain ? context.createGain() : context.createGainNode();
        this._gainNode.connect(context.destination);

        this._onAudioEvent = this._onAudioEvent.bind(this);
        this._onDecodeComplete = this._onDecodeComplete.bind(this);
        this._onDecodeError = this._onDecodeError.bind(this);
    },
    /**
     * 加载音频文件。注意：我们使用XMLHttpRequest进行加载，因此需要注意跨域问题。
     */
    load: function(){
        if(!this._buffer){
            var request = new XMLHttpRequest();
            request.src = this.src;
            request.open('GET', this.src, true);
            request.responseType = 'arraybuffer';
            request.onload = this._onAudioEvent;
            request.onprogress = this._onAudioEvent;
            request.onerror = this._onAudioEvent;
            request.send();
            this._buffer = true;
        }
        return this;
    },

    /**
     * @private
     */
    _onAudioEvent: function(e){
        // console.log('onAudioEvent:', e.type);
        var type = e.type;

        switch(type){
            case 'load':
                var request = e.target;
                request.onload = request.onprogress = request.onerror = null;
                this._context.decodeAudioData(request.response, this._onDecodeComplete, this._onDecodeError);
                request = null;
                break;
            case 'ended':
                this.playing = false;
                this.fire('end');
                if(this.loop) this._doPlay();
                break;
            case 'progress':
                this.fire(e);
                break;
            case 'error':
                this.fire(e);
                break;
        }
    },

    /**
     * @private
     */
    _onDecodeComplete: function(audioBuffer){
        this._buffer = audioBuffer;
        this.loaded = true;
        this.duration = audioBuffer.duration;
        // console.log('onDecodeComplete:', audioBuffer.duration);
        this.fire('load');
        if(this.autoPlay) this._doPlay();
    },

    /**
     * @private
     */
    _onDecodeError: function(){
        this.fire('error');
    },

    /**
     * @private
     */
    _doPlay: function(){
        this._clearAudioNode();

        var audioNode = this._context.createBufferSource();

        //some old browser are noteOn/noteOff -> start/stop
        if(!audioNode.start){
            audioNode.start = audioNode.noteOn;
            audioNode.stop = audioNode.noteOff;
        }

        audioNode.buffer = this._buffer;
        audioNode.onended = this._onAudioEvent;
        this._gainNode.gain.value = this.muted ? 0 : this.volume;
        audioNode.connect(this._gainNode);
        audioNode.start(0, this._offset);

        this._audioNode = audioNode;
        this._startTime = this._context.currentTime;
        this.playing = true;
    },

    /**
     * @private
     */
    _clearAudioNode: function(){
        var audioNode = this._audioNode;
        if(audioNode){
            audioNode.onended = null;
            // audioNode.disconnect(this._gainNode);
            audioNode.disconnect(0);
            this._audioNode = null;
        }
    },

    /**
     * 播放音频。如果正在播放，则会重新开始。
     */
    play: function(){
        if(this.playing) this.stop();

        if(this.loaded){
            this._doPlay();
        }else if(!this._buffer){
            this.autoPlay = true;
            this.load();
        }

        return this;
    },

    /**
     * 暂停音频。
     */
    pause: function(){
        if(this.playing){
            this._audioNode.stop(0);
            this._offset += this._context.currentTime - this._startTime;
            this.playing = false;
        }
        return this;
    },

    /**
     * 恢复音频播放。
     */
    resume: function(){
        if(!this.playing){
            this._doPlay();
        }
        return this;
    },

    /**
     * 停止音频播放。
     */
    stop: function(){
        if(this.playing){
            this._audioNode.stop(0);
            this._audioNode.disconnect();
            this._offset = 0;
            this.playing = false;
        }
        return this;
    },

    /**
     * 设置音量。
     */
    setVolume: function(volume){
        if(this.volume != volume){
            this.volume = volume;
            this._gainNode.gain.value = volume;
        }
        return this;
    },

    /**
     * 设置是否静音。
     */
    setMute: function(muted){
        if(this.muted != muted){
            this.muted = muted;
            this._gainNode.gain.value = muted ? 0 : this.volume;
        }
        return this;
    },

    Statics: /** @lends WebAudio */ {
        /**
         * 浏览器是否支持WebAudio。
         */
        isSupported: AudioContext != null,

        /**
         * 浏览器是否已激活WebAudio。
         */
        enabled: false,

        /**
         * 激活WebAudio。注意：需用户事件触发此方法才有效。激活后，无需用户事件也可播放音频。
         */
        enable: function(){
            if(!this.enabled && context){
                var source = context.createBufferSource();
                source.buffer = context.createBuffer(1, 1, 22050);
                source.connect(context.destination);
                source.start ? source.start(0, 0, 0) : source.noteOn(0, 0, 0);
                this.enabled = true;
                return true;
            }
            return this.enabled;
        }
    }
});

})();
Hilo.WebAudio = WebAudio;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var HTMLAudio = Hilo.HTMLAudio;
var WebAudio = Hilo.WebAudio;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var audio = WebSound.getAudio({
 *     src: 'test.mp3',
 *     loop: false,
 *     volume: 1
 * }).on('load', function(e){
 *     console.log('load');
 * }).on('end', function(e){
 *     console.log('end');
 * }).play();
 * </pre>
 * @class 声音播放管理器。
 * @static
 * @module hilo/media/WebSound
 * @requires hilo/core/Hilo
 * @requires hilo/media/HTMLAudio
 * @requires hilo/media/WebAudio
 */
var WebSound = {
    _audios: {},

    /**
     * 激活音频功能。注意：需用户事件触发此方法才有效。目前仅对WebAudio有效。
     */
    enableAudio: function(){
        if(WebAudio.isSupported){
            WebAudio.enable();
        }
    },

    /**
     * 获取音频对象。优先使用WebAudio。
     * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
     * @returns {WebAudio|HTMLAudio} 音频播放对象实例。
     */
    getAudio: function(source){
        source = this._normalizeSource(source);
        var audio = this._audios[source.src];
        if(!audio){
            if(WebAudio.isSupported){
                audio = new WebAudio(source);
            }else if(HTMLAudio.isSupported){
                audio = new HTMLAudio(source);
            }
            this._audios[source.src] = audio;
        }

        return audio;
    },

    /**
     * 删除音频对象。
     * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
     */
    removeAudio: function(source){
        var src = typeof source === 'string' ? source : source.src;
        var audio = this._audios[src];
        if(audio){
            audio.stop();
            audio.off();
            this._audios[src] = null;
            delete this._audios[src];
        }
    },

    /**
     * @private
     */
    _normalizeSource: function(source){
        var result = {};
        if(typeof source === 'string') result = {src:source};
        else Hilo.copy(result, source);
        return result;
    }

};
Hilo.WebSound = WebSound;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera类表示摄像机。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/game/Camera
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} width 镜头宽
 * @property {Number} height 镜头高
 * @property {Object} scroll 滚动值 {x:0, y:0}
 * @property {View} target 摄像机跟随的目标
 * @property {Array} bounds 摄像机移动边界的矩形区域 [x, y, width, height]
 * @property {Array} deadzone 摄像机不移动的矩形区域 [ x, y, width, height]
 */
var Camera = Class.create(/** @lends Camera.prototype */{
    constructor:function(properties){
        this.width = 0;
        this.height = 0;

        this.target = null;
        this.deadzone = null;
        this.bounds = null;

        this.scroll = {
            x:0,
            y:0
        };

        Hilo.copy(this, properties);
    },
    /**
     * 更新
     * @param {Number} deltaTime
    */
    tick:function(deltaTime){
        var target = this.target;
        var scroll = this.scroll;
        var bounds = this.bounds;
        var deadzone = this.deadzone;

        if(target){
            var viewX, viewY;
            if(deadzone){
                viewX = Math.min(Math.max(target.x - scroll.x, deadzone[0]), deadzone[0] + deadzone[2]);
                viewY = Math.min(Math.max(target.y - scroll.y, deadzone[1]), deadzone[1] + deadzone[3]);
            }
            else{
                viewX = this.width * .5;
                viewY = this.height * .5;
            }

            scroll.x = target.x - viewX;
            scroll.y = target.y - viewY;

            if(bounds){
                scroll.x = Math.min(Math.max(scroll.x, bounds[0]), bounds[0] + bounds[2]);
                scroll.y = Math.min(Math.max(scroll.y, bounds[1]), bounds[1] + bounds[3]);
            }
        }
        else{
            scroll.x = 0;
            scroll.y = 0;
        }
    },
    /**
     * 跟随目标
     * @param {Object} target 跟随的目标，必须是有x,y属性的对象
     * @param {Array} deadzone 摄像机不移动的矩形区域 [ x, y, width, height]
    */
    follow:function(target, deadzone){
        this.target = target;
        if(deadzone !== undefined){
            this.deadzone = deadzone;
        }
        this.tick();
    }
});

Hilo.Camera = Camera;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class Camera3d 伪3D虚拟摄像机。
 * @module hilo/game/Camera3d
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @property {Number} fv 镜头视点距离（屏幕视点相对眼睛距离，绝对了坐标缩放比例）
 * @property {Number} fx 镜头视点X（屏幕视点相对屏幕左上角X距离）
 * @property {Number} fy 镜头视点Y（屏幕视点相对屏幕左上角Y距离）
 * @property {Object} stage 3D对象所在容器，可以是stage或container，结合ticker时是必须参数，用来Z深度排序
 * @property {Number} x 镜头三维坐标x
 * @property {Number} y 镜头三维坐标y
 * @property {Number} z 镜头三维坐标z
 * @property {Number} rotationX X轴旋转角度
 * @property {Number} rotationY Y轴旋转角度
 * @property {Number} rotationZ Z轴旋转角度
 */
var Camera3d = (function(){

	var degtorad = Math.PI / 180;

	//向量旋转
	function rotateX(x, y, z, ca, sa) {//绕X轴旋转
		return {
			x: x,
			y: y * ca - z * sa,
			z: y * sa + z * ca
		};
	}
	function rotateY(x, y, z, ca, sa) {//绕Y轴旋转
		return {
			x: x * ca - z * sa,
			y: y,
			z: x * sa + z * ca
		};
	}
	function rotateZ(x, y, z, ca, sa) {//绕Z轴旋转
		return {
			x: x * ca - y * sa,
			y: x * sa + y * ca,
			z: z
		};
	}

	var Camera3d = Class.create(/** @lends Camera3d.prototype */{

		constructor: function(properties){
			properties.x = properties.x || 0;
			properties.y = properties.y || 0;
			properties.z = properties.z || 0;
			properties.rotationX = properties.rotationX || 0;
			properties.rotationY = properties.rotationY || 0;
			properties.rotationZ = properties.rotationZ || 0;

        	Hilo.copy(this, properties);
		},

	    /**
	     * 仿射矩阵位移变换，不同于直接修改Camera3d.x/y/z. 是在Camera3d依次做坐标位移 - 旋转变换 后，再加上一个位移变换。主要功能可以做Zoomin/out 功能
	     * @param {Number} x坐标
	     * @param {Number} y坐标
	     * @param {Number} z坐标
	     */
		translate : function(x,y,z){
			this.tx = x;
			this.ty = y;
			this.tz = z;
		},

	    /**
	     * 旋转X轴方向角度，相当于欧拉角系统的 beta
	     * @param {Number} X旋转角度
	     */
		rotateX : function(angle){
			this.rotationX = angle;
		},

	    /**
	     * 旋转Y轴方向角度，相当于欧拉角系统的 gamma
	     * @param {Number} Y旋转角度
	     */
		rotateY : function(angle){
			this.rotationY = angle;
		},

	    /**
	     * 旋转Z轴方向角度，相当于欧拉角系统的 alpha
	     * @param {Number} Z旋转角度
	     */
		rotateZ : function(angle){
			this.rotationZ = angle;
		},

	    /**
	     * 将三维坐标转换投影为二维坐标，同时返回Z轴深度，和投影显示的缩放比例
	     * @param {object} 三维坐标对象
	     * @param {object} Hilo.View对象，用于自动转换坐标
	     */
		project : function(vector3D, view){

			var rx = this.rotationX * degtorad,
				ry = this.rotationY * degtorad,
				rz = this.rotationZ * degtorad,

				cosX = Math.cos(rx), sinX = Math.sin(rx),
				cosY = Math.cos(ry), sinY = Math.sin(ry),
				cosZ = Math.cos(rz), sinZ = Math.sin(rz),

				// 旋转变换前的 仿射矩阵位移，
				dx = vector3D.x - this.x,
				dy = vector3D.y - this.y,
				dz = vector3D.z - this.z,

			// 旋转矩阵变换
			vector = rotateZ(dx, dy, dz, cosZ, sinZ);
			vector = rotateY(vector.x, vector.y, vector.z, cosY, sinY);
			vector = rotateX(vector.x, vector.y, vector.z, cosX, sinX);

			// 最后的仿射矩阵变换
			if(this.tx) vector.x -= this.tx;
			if(this.ty) vector.y -= this.ty;
			if(this.tz) vector.z -= this.tz;

			var	perspective = this.fv / (this.fv + vector.z),
				_x = vector.x * perspective,
				_y = -vector.y * perspective;

			if(view) {
                view.x = _x + this.fx;
                view.y = _y + this.fy;
                view.z = -vector.z;
                view.scaleX = perspective;
                view.scaleY = perspective;
			} else {
				return {
					x : _x + this.fx,
					y : _y + this.fy,
					z : -vector.z,
					scale : perspective
				};
			}
		},

	    /**
	     * Z深度排序
	     */
		sortZ : function(){
			this.stage.children.sort(function(view_a, view_b){
                return view_a.z > view_b.z;
            });
		},

	    /**
	     * Ticker 轮询使用
	     */
		tick : function(){
			this.sortZ();
		}

	});

	return Camera3d;

})();
Hilo.Camera3d = Camera3d;
})(window);
/**
 * Hilo 1.0.0 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
var Hilo = window.Hilo;
var Class = Hilo.Class;
var View = Hilo.View;
var Container = Hilo.Container;
var Bitmap = Hilo.Bitmap;
var Drawable = Hilo.Drawable;
/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/ParticleSystem.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class 粒子系统
 * @module hilo/game/ParticleSystem
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Container
 * @requires hilo/view/Bitmap
 * @requires hilo/view/Drawable
 * @property {Number} emitTime 发射间隔
 * @property {Number} emitTimeVar 发射间隔变化量
 * @property {Number} emitNum 每次发射数量变化量
 * @property {Number} emitNumVar 每次发射数量
 * @property {Number} emitterX 发射器位置x
 * @property {Number} emitterY 发射器位置y
 * @property {Number} totalTime 总时间
 * @property {Number} gx 重力加速度x
 * @property {Number} gy 重力加速度y
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @param {Object} properties.particle 粒子属性配置
 * @param {Number} properties.particle.x x位置
 * @param {Number} properties.particle.y y位置
 * @param {Number} properties.particle.vx x速度
 * @param {Number} properties.particle.vy y速度
 * @param {Number} properties.particle.ax x加速度
 * @param {Number} properties.particle.ay y加速度
 * @param {Number} properties.particle.life 粒子存活时间 单位s
 * @param {Number} properties.particle.alpha 透明度
 * @param {Number} properties.particle.alphaV 透明度变化
 * @param {Number} properties.particle.scale 缩放
 * @param {Number} properties.particle.scaleV 缩放变化速度
*/
var ParticleSystem = (function(){
    //粒子属性
    var props = ['x', 'y', 'vx', 'vy', 'ax', 'ay', 'rotation', 'rotationV', 'scale', 'scaleV', 'alpha', 'alphaV', 'life'];
    var PROPS = [];
    for(var i = 0, l = props.length;i < l;i ++){
        var p = props[i];
        PROPS.push(p);
        PROPS.push(p + "Var");
    }

    //粒子默认值
    var PROPS_DEFAULT = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        scale:1,
        scaleV:0,
        alpha:1,
        alphaV:0,
        rotation: 0,
        rotationV: 0,
        life: 1
    };

    var diedParticles = [];

    var ParticleSystem = Class.create(/** @lends ParticleSystem.prototype */{
        Extends:Container,
        constructor:function ParticleSystem(properties){
            this.id = this.id || properties.id || Hilo.getUid("ParticleSystem");

            this.emitterX = 0;
            this.emitterY = 0;

            this.gx = 0;
            this.gy = 0;
            this.totalTime = Infinity;

            this.emitNum = 10;
            this.emitNumVar = 0;

            this.emitTime = .2;
            this.emitTimeVar = 0;

            this.particle = {};

            ParticleSystem.superclass.constructor.call(this, properties);

            this.reset(properties);
        },
        Statics:{
            PROPS:PROPS,
            PROPS_DEFAULT:PROPS_DEFAULT,
            diedParticles:diedParticles
        },
        /**
         * 重置属性
         * @param {Object} cfg
        */
        reset: function(cfg) {
            Hilo.copy(this, cfg);
            this.particle.system = this;
            if(this.totalTime <= 0){
                this.totalTime = Infinity;
            }
        },
        /**
         * 更新
         * @param {Number} dt 间隔时间 单位ms
        */
        onUpdate: function(dt) {
            dt *= .001;
            if (this._isRun) {
                this._totalRunTime += dt;
                this._currentRunTime += dt;
                if (this._currentRunTime >= this._emitTime) {
                    this._currentRunTime = 0;
                    this._emitTime = getRandomValue(this.emitTime, this.emitTimeVar);
                    this._emit();
                }

                if (this._totalRunTime >= this.totalTime) {
                    this.stop();
                }
            }
        },
        /**
         * 发射粒子
        */
        _emit: function() {
            var num = getRandomValue(this.emitNum, this.emitNumVar)>>0;
            for (var i = 0; i < num; i++) {
                this.addChild(Particle.create(this.particle));
            }
        },
        /**
         * 开始
        */
        start: function() {
            this.stop(true);
            this._currentRunTime = 0;
            this._totalRunTime = 0;
            this._isRun = true;
            this._emitTime = getRandomValue(this.emitTime, this.emitTimeVar);
        },
        /**
         * 停止
         * @param {Boolean} clear 是否清除所有粒子
        */
        stop: function(clear) {
            this.isRun = false;
            if (clear) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    this.children[i].destroy();
                }
            }
        }
    });

    /**
     * @class 粒子
     * @inner
     * @param {Number} vx x速度
     * @param {Number} vy y速度
     * @param {Number} ax x加速度
     * @param {Number} ay y加速度
     * @param {Number} scaleV 缩放变化速度
     * @param {Number} alphaV 透明度变换速度
     * @param {Number} rotationV 旋转速度
     * @param {Number} life 存活时间
    */
    var Particle = Class.create({
        Extends:View,
        constructor:function Particle(properties){
            this.id = this.id || properties.id || Hilo.getUid("Particle");
            Particle.superclass.constructor.call(this, properties);
            this.init(properties);
        },
        /**
         * 更新
        */
        onUpdate: function(dt) {
            dt *= .001;
            if(this._died){
                return;
            }
            var ax = this.ax + this.system.gx;
            var ay = this.ay + this.system.gy;

            this.vx += ax * dt;
            this.vy += ay * dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.rotation += this.rotationV;

            if (this._time > .1) {
                this.alpha += this.alphaV;
            }

            this.scale += this.scaleV;
            this.scaleX = this.scaleY = this.scale;

            this._time += dt;
            if (this._time >= this.life || this.alpha < 0) {
                this.destroy();
            }
        },
        /**
         * 设置图像
        */
        setImage: function(img, frame) {
            this.drawable = this.drawable||new Drawable();
            var frame = frame || [0, 0, img.width, img.height];

            this.width = frame[2];
            this.height = frame[3];
            this.drawable.rect = frame;
            this.drawable.image = img;
        },
        /**
         * 销毁
        */
        destroy: function() {
            this.died = true;
            this.removeFromParent();
            diedParticles.push(this);
        },
        /**
         * 初始化
        */
        init: function(cfg) {
            this.system = cfg.system;
            this._died = false;
            this._time = 0;
            this.alpha = 1;
            for (var i = 0, l = PROPS.length; i < l; i++) {
                var p = PROPS[i];
                var v = cfg[p] === undefined ? PROPS_DEFAULT[p] : cfg[p];
                this[p] = getRandomValue(v, cfg[p + 'Var']);
            }

            this.x += this.system.emitterX;
            this.y += this.system.emitterY;

            if (cfg.image) {
                var frame = cfg.frame;
                if(frame && frame[0].length){
                    frame = frame[(Math.random() * frame.length) >> 0];
                }
                this.setImage(cfg.image, frame);
                if(cfg.pivotX !== undefined){
                    this.pivotX = cfg.pivotX * frame[2];
                }
                if(cfg.pivotY !== undefined){
                    this.pivotY = cfg.pivotY * frame[3];
                }
            }
        },
        Statics:{
            /**
             * 生成粒子
             * @param {Object} cfg
            */
            create:function(cfg) {
                if (diedParticles.length > 0) {
                    var particle = diedParticles.pop();
                    particle.init(cfg);
                    return particle;
                } else {
                    return new Particle(cfg);
                }
            }
        }

    });

    function getRandomValue(value, variances){
        return variances ? value + (Math.random() - .5) * 2 * variances : value;
    }

    return ParticleSystem;
})();
Hilo.ParticleSystem = ParticleSystem;
})(window);