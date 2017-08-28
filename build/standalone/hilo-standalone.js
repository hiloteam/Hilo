/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};


/**
 * @language=en
 * @class Browser feature set
 * @static
 * @module hilo/util/browser
 */
var browser = (function(){
    var ua = navigator.userAgent;
    var doc = document;
    var win = window;
    var docElem = doc.documentElement;

    var data = /** @lends browser */ {
        /**
         * 是否是iphone
         * @type {Boolean}
         */
        iphone: /iphone/i.test(ua),

        /**
         * 是否是ipad
         * @type {Boolean}
         */
        ipad: /ipad/i.test(ua),

        /**
         * 是否是ipod
         * @type {Boolean}
         */
        ipod: /ipod/i.test(ua),

        /**
         * 是否是ios
         * @type {Boolean}
         */
        ios: /iphone|ipad|ipod/i.test(ua),

        /**
         * 是否是android
         * @type {Boolean}
         */
        android: /android/i.test(ua),

        /**
         * 是否是webkit
         * @type {Boolean}
         */
        webkit: /webkit/i.test(ua),

        /**
         * 是否是chrome
         * @type {Boolean}
         */
        chrome: /chrome/i.test(ua),

        /**
         * 是否是safari
         * @type {Boolean}
         */
        safari: /safari/i.test(ua),

        /**
         * 是否是firefox
         * @type {Boolean}
         */
        firefox: /firefox/i.test(ua),

        /**
         * 是否是ie
         * @type {Boolean}
         */
        ie: /msie/i.test(ua),

        /**
         * 是否是opera
         * @type {Boolean}
         */
        opera: /opera/i.test(ua),
        /**
         * 是否支持触碰事件。
         * @type {String}
         */
        supportTouch: 'ontouchstart' in win,

        /**
         * 是否支持canvas元素。
         * @type {Boolean}
         */
        supportCanvas: doc.createElement('canvas').getContext != null,
        /**
         * 是否支持本地存储localStorage。
         * @type {Boolean}
         */
        supportStorage: false,

        /**
         * 是否支持检测设备方向orientation。
         * @type {Boolean}
         */
        supportOrientation: 'orientation' in win || 'orientation' in win.screen,

        /**
         * 是否支持检测加速度devicemotion。
         * @type {Boolean}
         */
        supportDeviceMotion: 'ondevicemotion' in win
    };

    //`localStorage` is null or `localStorage.setItem` throws error in some cases (e.g. localStorage is disabled)
    try{
        var value = 'hilo';
        localStorage.setItem(value, value);
        localStorage.removeItem(value);
        data.supportStorage = true;
    }catch(e){}

    /**
     * 浏览器厂商CSS前缀的js值。比如：webkit。
     * @type {String}
     */
    var jsVendor = data.jsVendor = data.webkit ? 'webkit' : data.firefox ? 'webkit' : data.opera ? 'o' : data.ie ? 'ms' : '';
    /**
     * 浏览器厂商CSS前缀的css值。比如：-webkit-。
     * @type {String}
     */
    var cssVendor = data.cssVendor = '-' + jsVendor + '-';

    //css transform/3d feature dectection
    var testElem = doc.createElement('div'), style = testElem.style;
    /**
     * 是否支持CSS Transform变换。
     * @type {Boolean}
     */
    var supportTransform = style[jsVendor + 'Transform'] != undefined;

    /**
     * 是否支持CSS Transform 3D变换。
     * @type {Boolean}
     */
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
    }
    data.supportTransform = supportTransform;
    data.supportTransform3D = supportTransform3D;

    return data;
})();
window.Hilo.browser = browser;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};


/**
 * @language=en
 * @class util method set
 * @static
 * @module hilo/util/util
 */
var util = {
    /**
     * @language=en
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
window.Hilo.util = util;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var browser = window.Hilo.browser;
var util = window.Hilo.util;


var win = window, doc = document, docElem = doc.documentElement,
    uid = 0;

var hasWarnedDict = {};

/**
 * @language=en
 * @namespace Hilo The underlying core set of methods.
 * @static
 * @module hilo/core/Hilo
 * @requires hilo/util/browser
 * @requires hilo/util/util
 */
var Hilo = {
    /**
     * Hilo version
     * @type String
     */
    version:'1.1.2',
    /**
     * @language=en
     * Gets a globally unique id. Such as Stage1, Bitmap2 etc.
     * @param {String} prefix Generated id's prefix.
     * @returns {String} Globally unique id.
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
     * @language=en
     * Generates a string representation that contains a path to the specified visual object. Such as Stage1.Container2.Bitmap3.
     * @param {View} view Specified visual object.
     * @returns {String} String representation of the visual object.
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
     * @language=en
     * Simple shallow copy objects.
     * @deprecated use Hilo.util.copy instead
     * @param {Object} target Target object to copy to.
     * @param {Object} source Source object to copy.
     * @param {Boolean} strict Indicates whether replication is undefined property, default is false, i.e., undefined attributes are not copied.
     * @returns {Object} Object after copying.
     */
    copy: function(target, source, strict){
        util.copy(target, source, strict);
        if(!hasWarnedDict.copy){
            hasWarnedDict.copy = true;
            console.warn('Hilo.copy has been Deprecated! Use Hilo.util.copy instead.');
        }
        return target;
    },

    /**
     * @language=en
     * Browser feature set includes:
     * @see browser
     */
    browser: browser,

    /**
     * @language=en
     * Event enumeration objects include:
     * <ul>
     * <li><b>POINTER_START</b> - Mouse or touch start event. Corresponds to touchstart or mousedown.</li>
     * <li><b>POINTER_MOVE</b> - Mouse or touch move event. Corresponds to touchmove or mousemove.</li>
     * <li><b>POINTER_END</b> - Mouse or touch end event. Corresponds to touchend or mouseup.</li>
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
     * @language=en
     * Visual object alinment enumeration objects include:
     * <ul>
     * <li><b>TOP_LEFT</b> - Align the top left corner.</li>
     * <li><b>TOP</b> - Top center alignment.</li>
     * <li><b>TOP_RIGHT</b> - Align the top right corner.</li>
     * <li><b>LEFT</b> - Left center alignment.</li>
     * <li><b>CENTER</b> - Align center.</li>
     * <li><b>RIGHT</b> - Right center alignment.</li>
     * <li><b>BOTTOM_LEFT</b> - Align the bottom left corner.</li>
     * <li><b>BOTTOM</b> - Bottom center alignment.</li>
     * <li><b>BOTTOM_RIGHT</b> - Align the bottom right corner.</li>
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
     * @language=en
     * Get DOM element content in the page display area.
     * @param {HTMLElement} elem DOM elements.
     * @returns {Object} Viewable area DOM elements. Format is: {left:0, top:0, width:100, height:100}.
     */
    getElementRect: function(elem){
        var bounds;
        try{
            //this fails if it's a disconnected DOM node
            bounds = elem.getBoundingClientRect();
        }catch(e){
            bounds = {top:elem.offsetTop, left:elem.offsetLeft, right:elem.offsetLeft + elem.offsetWidth, bottom:elem.offsetTop + elem.offsetHeight};
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
        var right = bounds.right || 0;
        var bottom = bounds.bottom || 0;

        return {
            left: left + offsetX + padLeft,
            top: top + offsetY + padTop,
            width: right - padRight - left - padLeft,
            height: bottom - padBottom - top - padTop
        };
    },

    /**
     * @language=en
     * Create a DOM element. You can specify properties and styles.
     * @param {String} type DOM element type to be created. Such as: 'div'.
     * @param {Object} properties Properties and styles for DOM element.
     * @returns {HTMLElement} A DOM element.
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
     * @language=en
     * Gets a DOM element according to the parameter id. This method is equivalent to document.getElementById(id).
     * @param {String} id id of the DOM element you want to get.
     * @returns {HTMLElement} A DOM element.
     */
    getElement: function(id){
        return doc.getElementById(id);
    },

    /**
     * @language=en
     * Set visual object DOM element CSS style.
     * @param {View} obj Specifies the CSS style to set the visual object.
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
     * @language=en
     * Generated visual object CSS style transformation.
     * @param {View} obj Specifies visual object whose CSS style must be got.
     * @returns {String} String representation of the CSS style.
     */
    getTransformCSS: function(obj){
        var use3d = this.browser.supportTransform3D,
            str3d = use3d ? '3d' : '';

        return 'translate' + str3d + '(' + (obj.x - obj.pivotX) + 'px, ' + (obj.y - obj.pivotY) + (use3d ? 'px, 0px)' : 'px)')
             + 'rotate' + str3d + (use3d ? '(0, 0, 1, ' : '(') + obj.rotation + 'deg)'
             + 'scale' + str3d + '(' + obj.scaleX + ', ' + obj.scaleY + (use3d ? ', 1)' : ')');
    }
};
for(var i in Hilo){window.Hilo[i] = Hilo[i];}
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};


/**
 * @language=en
 * Create Example Class:
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
 * @namespace Class Class is created to aid the developer.
 * @static
 * @module hilo/core/Class
 */
var Class = (function(){

/**
 * @language=en
 * Create a class based on the parameters, properties and methods specified.
 * @param {Object} properties Properties and methods to create the class.
 * <ul>
 * <li><b>Extends</b> - Designed to inherit the parent class.</li>
 * <li><b>Mixes</b> - Specifies mixed member collection object.</li>
 * <li><b>Statics</b> - Static property or method specified class.</li>
 * <li><b>constructor</b> -  The constructor of specified class.</li>
 * <li>Other members of the property or method to create the class.</li>
 * </ul>
 * @returns {Object} Create classes.
 */
var create = function(properties){
    properties = properties || {};
    var clazz = properties.hasOwnProperty('constructor') ? properties.constructor : function(){};
    implement.call(clazz, properties);
    return clazz;
};

/**
 * @language=en
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
 * @language=en
 * @private
 */
var createProto = (function(){
    if(Object.__proto__){
        return function(proto){
            return {__proto__: proto};
        };
    }else{
        var Ctor = function(){};
        return function(proto){
            Ctor.prototype = proto;
            return new Ctor();
        };
    }
})();

/**
 * @language=en
 * Mixed property or method.
 * @param {Object} target Mixed audiences.
 * @param {Object} source The source whose methods and properties are to be mixed. It can support multiple source parameters.
 * @returns {Object} Mixed audiences.
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

var defineProperty, defineProperties;
try{
    defineProperty = Object.defineProperty;
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

window.Hilo.Class = Class;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
 * @class Matrix class is a transforming matrix, which declare how points in one coordinate maped to another coordinate.
 * @param {Number} a The value affects pixel positioning alongside the x axis when Scale or rotate images.
 * @param {Number} b The value affects pixel positioning alongside the y axis when rotate or skew images.
 * @param {Number} c The value affects pixel positioning alongside the x axis when rotate or skew images.
 * @param {Number} d The value affects pixel positioning alongside the y axis when Scale or rotate images.
 * @param {Number} tx The distance to move every point alongside the x axis.
 * @param {Number} ty The distance to move every point alongside the y axis.
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
     * @language=en
     * Link a Matrix to current Matrix, in order to make geometry effects on these two composed more effective.
     * @param {Matrix} mtx Matrix that link to the source matrix.
     * @returns {Matrix} A Matrix Object.
     */
    concat: function(mtx){
        var args = arguments,
            a = this.a, b = this.b, c = this.c, d = this.d,
            tx = this.tx, ty = this.ty;

        var ma, mb, mc, md, mx, my;
        if(args.length >= 6){
            ma = args[0];
            mb = args[1];
            mc = args[2];
            md = args[3];
            mx = args[4];
            my = args[5];
        }
        else{
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
     * @language=en
     * Rotate the Matrix Object.
     * @param {Number} angle The angle to rotate.
     * @returns {Matrix} A Matrix object.
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
     * @language=en
     * Scale the Matrix.
     * @param {Number} sx The value to multiply those object scale alongside the x axis.
     * @param {Number} sy The value to multiply those object scale alongside the y axis.
     * @returns {Matrix} A Matrix object.
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
     * @language=en
     * Translate the Matrix alongside x axis and y axis by dx and dy.
     * @param {Number} dx Translate Matrix alongside the x axis to the right (measured in px).
     * @param {Number} dy Translate Matrix alongside the y axis to the right (measured in px).
     * @returns {Matrix} A Matrix object.
     */
    translate: function(dx, dy){
        this.tx += dx;
        this.ty += dy;
        return this;
    },

    /**
     * @language=en
     * Set each Matrix property a value to trigger null transform. The Matrix after applying identity matrix transformation will be exactly the same as original.
     * @returns {Matrix} A Matrix object.
     */
    identity: function(){
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    },

    /**
     * @language=en
     * Apply an invert transformation of original Matrix. Using this invert transformation, you can reset a Matrix to a state before it had been apply some Matrix.
     * @returns {Matrix} A Matrix object.
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
     * @language=en
     * Return the result after apply a Matrix displaying transform on the point.
     * @param {Object} point Point need to transform.
     * @param {Boolean} round Whether ceil the coordinate values of the point.
     * @param {Boolean} returnNew Whether return a new point.
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

window.Hilo.Matrix = Matrix;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
 * @class EventMixin is a mixin on event related functions. Use Class.mix(target, EventMixin) to add event function onto target.
 * @static
 * @mixin
 * @module hilo/event/EventMixin
 * @requires hilo/core/Class
 */
var EventMixin = /** @lends EventMixin# */{
    _listeners: null,

    /**
     * @language=en
     * Add an event listenser.
     * @param {String} type Event type to listen.
     * @param {Function} listener Callback function of event listening.
     * @param {Boolean} once Listen on event only once and no more response after the first response?
     * @returns {Object} The Event itself. Functions chain call supported.
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
     * @language=en
     * Remove one event listener. Remove all event listeners if no parameter provided, and remove all event listeners on one type which is provided as the only parameter.
     * @param {String} type The type of event listener that want to remove.
     * @param {Function} listener Event listener callback function to be removed.
     * @returns {Object} The Event itself. Functions chain call supported.
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
     * @language=en
     * Send events. If the first parameter is an Object, take it  as an Event Object.
     * @param {String} type Event type to send.
     * @param {Object} detail The detail (parameters go with the event) of Event to send.
     * @returns {Boolean} Whether Event call successfully.
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
            var eventListenersCopy = eventListeners.slice(0);
            event = event || new EventObject(eventType, this, detail);
            if(event._stopped) return false;

            for(var i = 0; i < eventListenersCopy.length; i++){
                var el = eventListenersCopy[i];
                el.listener.call(this, event);
                if(el.once) {
                    var index = eventListeners.indexOf(el);
                    if(index > -1){
                        eventListeners.splice(index, 1);
                    }
                }
            }

            if(eventListeners.length == 0) delete listeners[eventType];
            return true;
        }
        return false;
    }
};

/**
 * @language=en
 * Event Object class. It's an private class now, but maybe will become a public class if needed.
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
    };
}

window.Hilo.EventMixin = EventMixin;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Drawable is a wrapper of drawable images.
 * @param {Object} properties create Objects properties, contains all writable properties.
 * @module hilo/view/Drawable
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Object} image Image to be drawed, can used by CanvasRenderingContext2D.drawImage，like HTMLImageElement、HTMLCanvasElement、HTMLVideoElement。
 * @property {array} rect The retangle area that image will be drawed.
 */
var Drawable = Class.create(/** @lends Drawable.prototype */{
    constructor: function(properties){
        this.init(properties);
    },

    image: null,
    rect: null,

    /**
     * @language=en
     * Initialize drawable elements.
     * @param {Object} properties Properties need to be initialized.
     */
    init: function(properties){
        var me = this, oldImage = me.image;
        if(Drawable.isDrawable(properties)){
            me.image = properties;
        }else{
            util.copy(me, properties, true);
        }

        var image = me.image;
        if(typeof image === 'string'){
            if(oldImage && image === oldImage.getAttribute('src')){
                image = me.image = oldImage;
            }else{
                me.image = null;
                //load image dynamically
                var img = new Image();
                if(properties.crossOrigin){
                    img.crossOrigin = properties.crossOrigin;
                }
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
         * @language=en
         * Check whether the given 'elem' and be wrapped into Drawable object.
         * @param {Object} elem Element to be tested.
         * @return {Boolean} Return true if element can be wrapped into Drawable element, otherwises return false.
         */
        isDrawable: function(elem){
            if(!elem || !elem.tagName) return false;
            var tagName = elem.tagName.toLowerCase();
            return tagName === "img" || tagName === "canvas" || tagName === "video";
        }
    }
});
window.Hilo.Drawable = Drawable;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Renderer Renderer is the base class of renderer.
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
 * @module hilo/renderer/Renderer
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Object} canvas The canvas of renderer. It can be a dom element, such as a div element, or a canvas element. readonly.
 * @property {Object} stage The stage of renderer, readonly.
 * @property {String} renderType The render type of renderer, readonly.
 */
var Renderer = Class.create(/** @lends Renderer.prototype */{
    constructor: function(properties){
        properties = properties || {};
        util.copy(this, properties, true);
    },

    renderType:null,
    canvas: null,
    stage: null,
    blendMode:'source-over',

    /**
     * @language=en
     * Prepare for draw visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    startDraw: function(target){ },

    /**
     * @language=en
     * Draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    draw: function(target){ },

    /**
     * @language=en
     * The handling method after draw the visual object. The subclass need to implement it.
     * @param {View} target The visual target to draw.
     */
    endDraw: function(target){ },

    /**
     * @language=en
     * Transfrom the visual object. The subclass need to implement it.
     */
    transform: function(){ },

    /**
     * @language=en
     * Hide the visual object. The subclass need to implement it.
     */
    hide: function(){ },

    /**
     * @language=en
     * Remove the visual object from canvas. Notice that it dosen't remove the object from stage. The subclass need to implement it.
     * @param {View} target The visual target to remove.
     */
    remove: function(target){ },

    /**
     * @language=en
     * Clear the given region of canvas. The subclass need to implement it.
     * @param {Number} x The position on the x axis of the given region.
     * @param {Number} y The position on the y axis of the given region.
     * @param {Number} width The width of the given region.
     * @param {Number} height The height of the given region.
     */
    clear: function(x, y, width, height){ },

    /**
     * @language=en
     * Resize the renderer's canvas.
     * @param {Number} width The width of renderer's canvas.
     * @param {Number} height The height of the renderer's canvas.
     */
    resize: function(width, height){ }

});
window.Hilo.Renderer = Renderer;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var Hilo = window.Hilo;var Renderer = window.Hilo.Renderer;


/**
 * @language=en
 * @class CanvasRenderer CanvasRenderer, all the visual object is drawing on the canvas element.The stage will create different renderer depend on the canvas and renderType properties, developer need not use this class directly.
 * @augments Renderer
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
 * @module hilo/renderer/CanvasRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @property {CanvasRenderingContext2D} context The context of the canvas element, readonly.
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
            if(target.blendMode !== this.blendMode){
                this.context.globalCompositeOperation = this.blendMode = target.blendMode;
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
            //ie9+浏览器宽高为0时会报错 fixed ie9 bug.
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
                oldScaleY = target._scaleY,
                isStyleChange = false;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
                isStyleChange = true;
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
                isStyleChange = true;
            }
            if(isStyleChange){
                target.updateViewport();
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
        var canvas = this.canvas;
        var stage = this.stage;
        var style = canvas.style;

        canvas.width = width;
        canvas.height = height;

        style.width = stage.width * stage.scaleX + 'px';
        style.height = stage.height * stage.scaleY + 'px';
    }

});
window.Hilo.CanvasRenderer = CanvasRenderer;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var Hilo = window.Hilo;var Renderer = window.Hilo.Renderer;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * @class DomRenderer The DomRenderer, all the visual object is drawing using dom element.The stage will create different renderer depend on the canvas and renderType properties, developer need not use this class directly.
 * @augments Renderer
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
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
 * @language=en
 * Create a dom element, you can set the tagName property，such as canvas and div.
 * @param {Object} view A visual object.
 * @param {Object} imageObj The image object to render, include the image propertiy and other associated properties, such as rect.
 * @return {HTMLElement} The created dom element.
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

window.Hilo.DOMRenderer = DOMRenderer;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var Hilo = window.Hilo;var Renderer = window.Hilo.Renderer;
var Matrix = window.Hilo.Matrix;


/**
 * Heavily inspired by PIXI's SpriteRenderer:
 * https://github.com/pixijs/pixi.js/blob/v3.0.9/src/core/sprites/webgl/SpriteRenderer.js
 */

var DEG2RAD = Math.PI / 180;
/**
 * @language=en
 * @class WebGLRenderer The WebGLRenderer, all the visual object is drawing on the canvas using WebGL.The stage will create different renderer depend on the canvas and renderType properties, developer need not use this class directly.
 * @augments Renderer
 * @param {Object} properties The properties to create a renderer, contains all writeable props of this class.
 * @module hilo/renderer/WebGLRenderer
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/renderer/Renderer
 * @requires  hilo/geom/Matrix
 * @property {WebGLRenderingContext} gl The WebGL context of the renderer, readonly.
 */
var WebGLRenderer = Class.create(/** @lends WebGLRenderer.prototype */{
    Extends: Renderer,
    Statics:/** @lends WebGLRenderer */{
        /**
         * @language=en
         * The max num of batch draw, default is 2000.
         * @type {Number}
         */
        MAX_BATCH_NUM:2000,
        /**
         * @language=en
         * The num of vertex attributes, readonly.
         * @type {Number}
         */
        ATTRIBUTE_NUM:5,
        /**
         * @language=en
         * is WebGL supported, readonly.
         * @type {Boolean}
         */
        isSupport:function(){
            if(this._isSupported == undefined){
                var canvas = document.createElement('canvas');
                if(canvas.getContext && (canvas.getContext('webgl')||canvas.getContext('experimental-webgl'))){
                    this._isSupported = true;
                }
                else{
                    this._isSupported = false;
                }
            }
            return this._isSupported;
        }
    },
    renderType:'webgl',
    gl:null,
    _isContextLost:false,
    _cacheTexture:{},
    constructor: function(properties){
        WebGLRenderer.superclass.constructor.call(this, properties);
        var that = this;
        this.gl = this.canvas.getContext("webgl")||this.canvas.getContext('experimental-webgl');

        this.maxBatchNum = WebGLRenderer.MAX_BATCH_NUM;
        this.positionStride = WebGLRenderer.ATTRIBUTE_NUM * 4;
        var vertexNum = this.maxBatchNum * WebGLRenderer.ATTRIBUTE_NUM * 4;
        var indexNum = this.maxBatchNum * 6;
        this.arrayBuffer = new ArrayBuffer(vertexNum * 4);
        this.float32Array = new Float32Array(this.arrayBuffer);
        this.uint32Array = new Uint32Array(this.arrayBuffer);
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

        this.canvas.addEventListener('webglcontextlost', function(e){
            that._isContextLost = true;
            e.preventDefault();
        }, false);

        this.canvas.addEventListener('webglcontextrestored', function(e){
            that._isContextLost = false;
            that.setupWebGLStateAndResource();
        }, false);

        this.setupWebGLStateAndResource();
    },
    setupWebGLStateAndResource:function(){
        var gl = this.gl;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);

        this._cacheTexture = {};
        this._initShaders();
        this.defaultShader.active();

        this.positionBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexs, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.arrayBuffer, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, this.positionStride, 0);//x, y
        gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, this.positionStride, 2 * 4);//x, y
        gl.vertexAttribPointer(this.a_tint, 4, gl.UNSIGNED_BYTE, true, this.positionStride, 4 * 4);//alpha
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
        var w = target.width,
            h = target.height;

        //TODO:draw background
        var bg = target.background; // jshint ignore:line

        //draw image
        var drawable = target.drawable, image = drawable && drawable.image;
        if(image){
            var rect = drawable.rect, sw = rect[2], sh = rect[3];
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
            var float32Array = this.float32Array;
            var uint32Array = this.uint32Array;

            var tint = (target.tint >> 16) + (target.tint & 0xff00) + ((target.tint & 0xff) << 16) + (target.__webglRenderAlpha * 255 << 24);

            float32Array[index + 0] = vertexs[0];//x
            float32Array[index + 1] = vertexs[1];//y
            float32Array[index + 2] = vertexs[2];//uvx
            float32Array[index + 3] = vertexs[3];//uvy
            uint32Array[index + 4] = tint;//tint

            float32Array[index + 5] = vertexs[4];
            float32Array[index + 6] = vertexs[5];
            float32Array[index + 7] = vertexs[6];
            float32Array[index + 8] = vertexs[7];
            uint32Array[index + 9] = tint;

            float32Array[index + 10] = vertexs[8];
            float32Array[index + 11] = vertexs[9];
            float32Array[index + 12] = vertexs[10];
            float32Array[index + 13] = vertexs[11];
            uint32Array[index + 14] = tint;

            float32Array[index + 15] = vertexs[12];
            float32Array[index + 16] = vertexs[13];
            float32Array[index + 17] = vertexs[14];
            float32Array[index + 18] = vertexs[15];
            uint32Array[index + 19] = tint;

            var matrix = target.__webglWorldMatrix;
            for(var i = 0;i < 4;i ++){
                var x = float32Array[index + i*5];
                var y = float32Array[index + i*5 + 1];

                float32Array[index + i*5] = matrix.a*x + matrix.c*y + matrix.tx;
                float32Array[index + i*5 + 1] = matrix.b*x + matrix.d*y + matrix.ty;
            }

            target.__textureImage = image;
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

        var scaleX = target.scaleX,
            scaleY = target.scaleY;

        if(target === this.stage){
            var style = this.canvas.style,
                oldScaleX = target._scaleX,
                oldScaleY = target._scaleY,
                isStyleChange = false;

            if((!oldScaleX && scaleX != 1) || (oldScaleX && oldScaleX != scaleX)){
                target._scaleX = scaleX;
                style.width = scaleX * target.width + "px";
                isStyleChange = true;
            }
            if((!oldScaleY && scaleY != 1) || (oldScaleY && oldScaleY != scaleY)){
                target._scaleY = scaleY;
                style.height = scaleY * target.height + "px";
                isStyleChange = true;
            }
            if(isStyleChange){
                target.updateViewport();
            }
            target.__webglWorldMatrix = target.__webglWorldMatrix||new Matrix(1, 0, 0, 1, 0, 0);
        }
        else if(target.parent){
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
            var canvas = this.canvas;
            var stage = this.stage;
            var style = canvas.style;

            this.width = canvas.width = width;
            this.height = canvas.height = height;

            style.width = stage.width * stage.scaleX + 'px';
            style.height = stage.height * stage.scaleY + 'px';

            this.gl.viewport(0, 0, width, height);

            this.canvasHalfWidth = width * .5;
            this.canvasHalfHeight = height * .5;

            this._uploadProjectionTransform(true);
        }
    },
    _renderBatches:function(){
        var gl = this.gl;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uint32Array.subarray(0, this.batchIndex * this.positionStride));
        var startIndex = 0;
        var batchNum = 0;
        var preTextureImage = null;
        for(var i = 0;i < this.batchIndex;i ++){
            var sprite = this.sprites[i];
            if(preTextureImage && preTextureImage !== sprite.__textureImage){
                this._renderBatch(startIndex, i);
                startIndex = i;
                batchNum = 1;
            }
            preTextureImage = sprite.__textureImage;
        }
        this._renderBatch(startIndex, this.batchIndex);
        this.batchIndex = 0;
    },
    _renderBatch:function(start, end){
        var gl = this.gl;
        var num = end - start;
        if(num > 0){
            gl.bindTexture(gl.TEXTURE_2D, this._getTexture(this.sprites[start]));
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
            attribute vec4 a_tint;\n\
            uniform mat3 u_projectionTransform;\n\
            varying vec2 v_TexCoord;\n\
            varying vec4 v_tint;\n\
            void main(){\n\
                gl_Position =  vec4((u_projectionTransform * vec3(a_position, 1.0)).xy, 1.0, 1.0);\n\
                v_TexCoord = a_TexCoord;\n\
                v_tint = vec4(a_tint.rgb * a_tint.a, a_tint.a);\n\
            }\n\
        ';

        var FSHADER_SOURCE = '\n\
            precision mediump float;\n\
            uniform sampler2D u_Sampler;\n\
            varying vec2 v_TexCoord;\n\
            varying vec4 v_tint;\n\
            void main(){\n\
                gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_tint;\n\
            }\n\
        ';

        this.defaultShader = new Shader(this, {
            v:VSHADER_SOURCE,
            f:FSHADER_SOURCE
        },{
            attributes:["a_position", "a_TexCoord", "a_tint"],
            uniforms:["u_projectionTransform", "u_Sampler"]
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
    },
    _getTexture:function(sprite){
        var image = sprite.__textureImage;
        var texture = this._cacheTexture[image.src];
        if(!texture){
            texture = this.activeShader.uploadTexture(image);
        }
        return texture;
    }
});

/**
 * @language=en
 * shader
 * @param {WebGLRenderer} renderer [description]
 * @param {Object} source
 * @param {String} source.v 顶点shader
 * @param {String} source.f 片段shader
 * @param {Object} attr
 * @param {Array} attr.attributes attribute数组
 * @param {Array} attr.uniforms uniform数组
 */
var Shader = function(renderer, source, attr){
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.program = this._createProgram(this.gl, source.v, source.f);

    attr = attr||{};
    this.attributes = attr.attributes||[];
    this.uniforms = attr.uniforms||[];
};

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

        this.renderer._cacheTexture[image.src] = texture;
        return texture;
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
window.Hilo.WebGLRenderer = WebGLRenderer;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var EventMixin = window.Hilo.EventMixin;
var Matrix = window.Hilo.Matrix;
var util = window.Hilo.util;


/**
 * @language=en
 * @class View View is the base class of all display objects
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @param {Object} properties The properties to create a view object, contains all writeable props of this class
 * @module hilo/view/View
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/geom/Matrix
 * @requires hilo/util/util
 * @property {String} id The identifier for the view.
 * @property {Number} x The position of the view on the x axis relative to the local coordinates of the parent, default value is 0.
 * @property {Number} y The position of the view on the y axis relative to the local coordinates of the parent, default value is 0.
 * @property {Number} width The width of the view, default value is 0.
 * @property {Number} height The height of the view, default value is 0.
 * @property {Number} alpha The opacity of the view, default value is 1.
 * @property {Number} rotation The rotation of the view in angles, default value is 0.
 * @property {Boolean} visible The visibility of the view. If false the vew will not be drawn, default value is true.
 * @property {Number} pivotX Position of the center point on the x axis of the view, default value is 0.
 * @property {Number} pivotY Position of the center point on the y axis of the view, default value is 0.
 * @property {Number} scaleX The x axis scale factor of the view, default value is 1.
 * @property {Number} scaleY The y axis scale factor of the view, default value is 1.
 * @property {Boolean} pointerEnabled Is the view can receive DOM events, default value is true.
 * @property {Object} background The background style to fill the view, can be css color, gradient or pattern of canvas
 * @property {Graphics} mask Sets a mask for the view. A mask is an object that limits the visibility of an object to the shape of the mask applied to it. A regular mask must be a Hilo.Graphics object. This allows for much faster masking in canvas as it utilises shape clipping. To remove a mask, set this property to null.
 * @property {Number} tint The tint applied to the view，default is 0xFFFFFF.Only support in WebGL mode.
 * @property {String|Function} align The alignment of the view, the value must be one of Hilo.align enum.
 * @property {Container} parent The parent view of this view, readonly!
 * @property {Number} depth The z index of the view, readonly!
 * @property {Drawable} drawable The drawable object of the view. Only for advanced develop.
 * @property {Array} boundsArea The vertex points of the view, the points are relative to the center point. This is a example: [{x:10, y:10}, {x:20, y:20}].
 */
var View = (function(){

return Class.create(/** @lends View.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("View");
        util.copy(this, properties, true);
    },

    tint:0xffffff,
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
    blendMode:'source-over',

    /**
     * @language=en
     * Get the stage object of the view. If the view doesn't add to any stage, null will be returned.
     * @returns {Stage} The stage object of the view.
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
     * @language=en
     * Get the scaled width of the view.
     * @returns {Number} scaled width of the view.
     */
    getScaledWidth: function(){
        return this.width * this.scaleX;
    },

    /**
     * @language=en
     * Get the scaled height of the view.
     * @returns {Number} scaled height of the view.
     */
    getScaledHeight: function(){
        return this.height * this.scaleY;
    },

    /**
     * @language=en
     * Add current view to a Contaner.
     * @param {Container} container Container object.
     * @param {Uint} index The index of the view in container.
     * @returns {View} Current view.
     */
    addTo: function(container, index){
        if(typeof index === 'number') container.addChildAt(this, index);
        else container.addChild(this);
        return this;
    },

    /**
     * @language=en
     * Remove current view from it's parent container
     * @returns {View} Current view.
     */
    removeFromParent: function(){
        var parent = this.parent;
        if(parent) parent.removeChild(this);
        return this;
    },

    /**
     * @language=en
     * Get the bounds of the view as a circumscribed rectangle and all vertex points relative to the coordinates of the stage.
     * @returns {Array} The vertex points array, and the array contains the following properties:
     * <ul>
     * <li><b>x</b> - The position of the view on the x axis relative to the coordinates of the stage.</li>
     * <li><b>y</b> - The position of the view on the y axis relative to the coordinates of the stage.</li>
     * <li><b>width</b> - The width of circumscribed rectangle of the view.</li>
     * <li><b>height</b> - The height of circumscribed rectangle of the view</li>
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
     * @language=en
     * Get the matrix that can transform points from current view coordinates to the ancestor container coordinates.
     * @param {View} ancestor The ancestor of current view, default value is the top container.
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
     * @language=en
     * Determining whether a point is in the circumscribed rectangle of current view.
     * @param {Number} x The x axis relative to the stage coordinates.
     * @param {Number} y The y axis relative to the stage coordinates.
     * @param {Boolean} usePolyCollision Is use polygon collision, default value is false.
     * @returns {Boolean} the point is in the circumscribed rectangle of current view.
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
     * @language=en
     * Determining whether an object is in the circumscribed rectangle of current view.
     * @param {View} object The object need to determining.
     * @param {Boolean} usePolyCollision Is use polygon collision, default value is false.
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
     * @language=en
     * The method to render current display object. Only for advanced develop.
     * @param {Renderer} renderer Renderer object.
     * @param {Number} delta The delta time of render.
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
     * @language=en
     * Mouse event
    */
    _fireMouseEvent:function(e){
        e.eventCurrentTarget = this;
        this.fire(e);

        // 处理mouseover事件 mouseover不需要阻止冒泡
        // handle mouseover event, mouseover needn't stop propagation.
        if(e.type == "mousemove"){
            if(!this.__mouseOver){
                this.__mouseOver = true;
                var overEvent = util.copy({}, e);
                overEvent.type = "mouseover";
                this.fire(overEvent);
            }
        }
        else if(e.type == "mouseout"){
            this.__mouseOver = false;
        }

        // 向上冒泡
        // handle event propagation
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
     * @language=en
     * This method will call while the view need update(usually caused by ticker update). This method can return a Boolean value, if return false, the view will not be drawn.
     * Limit: If you change the index in it's parent, it will not be drawn correct in current frame but next frame is correct.
     * @type Function
     * @default null
     */
    onUpdate: null,

    /**
     * @language=en
     * The render method of current view. The subclass can implement it's own render logic by rewrite this function.
     * @param {Renderer} renderer Renderer object.
     * @param {Number} delta The delta time of render.
     */
    render: function(renderer, delta){
        renderer.draw(this);
    },

    /**
     * @language=en
     * Get a string representing current view.
     * @returns {String} string representing current view.
     */
    toString: function(){
        return Hilo.viewToString(this);
    }
});

/**
 * @language=en
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
 * @language=en
 * @private
 */
function polygonCollision(poly1, poly2){
    var result = doSATCheck(poly1, poly2, {overlap:-Infinity, normal:{x:0, y:0}});
    if(result) return doSATCheck(poly2, poly1, result);
    return false;
}

/**
 * @language=en
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
window.Hilo.View = View;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Drawable = window.Hilo.Drawable;
var browser = window.Hilo.browser;


var _cacheCanvas, _cacheContext;
/**
 * @language=en
 * @class CacheMixin A mixin that contains cache method.You can mix cache method to the target by use Class.mix(target, CacheMixin).
 * @static
 * @mixin
 * @module hilo/view/CacheMixin
 * @requires hilo/view/Drawable
 * @requires hilo/util/browser
 */
var CacheMixin = /** @lends CacheMixin# */ {
    _cacheDirty:true,
    /**
     * @language=en
     * Cache the view.
     * @param {Boolean} forceUpdate is force update cache.
     */
    cache: function(forceUpdate){
        if(forceUpdate || this._cacheDirty || !this.drawable){
            this.updateCache();
        }
    },
    /**
     * @language=en
     * Update the cache.
     */
    updateCache:function(){
        if(browser.supportCanvas){
            if(!_cacheCanvas){
                _cacheCanvas = document.createElement('canvas');
                _cacheContext = _cacheCanvas.getContext('2d');
            }

            //TODO:width, height自动判断
            _cacheCanvas.width = this.width;
            _cacheCanvas.height = this.height;
            this._draw(_cacheContext);
            this.drawable = this.drawable||new Drawable();
            this.drawable.init({
                image:_cacheCanvas.toDataURL()
            });
            this._cacheDirty = false;
        }
    },
    /**
     * @language=en
     * set the cache state diry.
     * @param {Boolean} dirty is cache dirty
     */
    setCacheDirty:function(dirty){
        this._cacheDirty = dirty;
    }
};
window.Hilo.CacheMixin = CacheMixin;
})(window);
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
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var Container = window.Hilo.Container;
var CanvasRenderer = window.Hilo.CanvasRenderer;
var DOMRenderer = window.Hilo.DOMRenderer;
var WebGLRenderer = window.Hilo.WebGLRenderer;
var browser = window.Hilo.browser;
var util = window.Hilo.util;


/**
 * @language=en
 * Demo:
 * <pre>
 * var stage = new Hilo.Stage({
 *     renderType:'canvas',
 *     container: containerElement,
 *     width: 320,
 *     height: 480
 * });
 * </pre>
 * @class Stage is the root of all visual object tree, any visual object will be render only after being added to Stage or any children elements of Stage. Normally, every hilo application start with an stage instance.
 * @augments Container
 * @param {Object} properties Properties parameters for the object. Includes all writable properties of this class. Some important like:
 * <ul>
 * <li><b>container</b>:String|HTMLElement - Assign the parent container element of the Stage in the page. It should be a dom container or an id. If this parameter is not given and canvas isn't in the dom tree, you should add the stage vanvas into the dom tree yourself, otherwise Stage will not render. optional.</li>
 * <li><b>renderType</b>:String - Renering way: canvas|dom|webgl，default value is canvas, optional.</li>
 * <li><b>canvas</b>:String|HTMLCanvasElement|HTMLElement - 指定舞台所对应的画布元素。它是一个canvas或普通的div，也可以传入元素的id。若为canvas，则使用canvas来渲染所有对象，否则使用dom+css来渲染。可选。</li>
 * <li><b>width</b>:Number</li> - The width of the Stage, default value is the width of canvas, optional.
 * <li><b>height</b>:Number</li> - The height of the Stage, default value is the height of canvas, optional.
 * <li><b>paused</b>:Boolean</li> - Whether stop rendering the Stage, default value is false, optional.
 * </ul>
 * @module hilo/view/Stage
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/Container
 * @requires hilo/renderer/CanvasRenderer
 * @requires hilo/renderer/DOMRenderer
 * @requires hilo/renderer/WebGLRenderer
 * @requires hilo/util/browser
 * @requires hilo/util/util
 * @property {HTMLCanvasElement|HTMLElement} canvas The canvas the Stage is related to. It can be a canvas or a div element, readonly!
 * @property {Renderer} renderer Stage renderer, readonly!
 * @property {Boolean} paused Paused Stage rendering.
 * @property {Object} viewport Rendering area of the Stage. Including properties like: left, top, width, height. readonly!
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
     * @language=en
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
	        /* falls through */
            default:
                this.renderer = new CanvasRenderer(props);
                break;
        }
    },

    /**
     * @language=en
     * Add Stage canvas to DOM container. Note: this function overwrite View.addTo function.
     * @param {HTMLElement} domElement An dom element.
     * @returns {Stage} The Stage Object, chained call supported.
     */
    addTo: function(domElement){
        var canvas = this.canvas;
        if(canvas.parentNode !== domElement){
            domElement.appendChild(canvas);
        }
        return this;
    },

    /**
     * @language=en
     * Invoke tick function and Stage will update and render. Developer may not need to use this funciton.
     * @param {Number} delta The time had pass between this tick invoke and last tick invoke.
     */
    tick: function(delta){
        if(!this.paused){
            this._render(this.renderer, delta);
        }
    },

    /**
     * @language=en
     * Turn on/off Stage response to DOM event. To make visual objects on the Stage interactive, use this function to turn on Stage's responses to events.
     * @param {String|Array} type The event name or array that need to turn on/off.
     * @param {Boolean} enabled Whether turn on or off the response method of stage DOM event. If not provided, default value is true.
     * @returns {Stage} The Stage Object, chained call supported.
     */
    enableDOMEvent: function(types, enabled){
        var me = this,
            canvas = me.canvas,
            handler = me._domListener || (me._domListener = function(e){me._onDOMEvent(e);});

        types = typeof types === 'string' ? [types] : types;
        enabled = enabled !== false;

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
     * @language=en
     * DOM events handler function. This funciton will invoke events onto the visual object, which is on the position of the coordinate where the events is invoked.
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

        //鼠标事件需要阻止冒泡方法 Prevent bubbling on mouse events.
        event.stopPropagation = function(){
            this._stopPropagationed = true;
        };

        var obj = this.getViewAtPoint(x, y, true, false, true)||this,
            canvas = this.canvas, target = this._eventTarget;

        //fire mouseout/touchout event for last event target
        var leave = type === 'mouseout';
        //当obj和target不同 且obj不是target的子元素时才触发out事件 fire out event when obj and target isn't the same as well as obj is not a child element to target.
        if(target && (target != obj && (!target.contains || !target.contains(obj))|| leave)){
            var out = (type === 'touchmove') ? 'touchout' :
                      (type === 'mousemove' || leave || !obj) ? 'mouseout' : null;
            if(out) {
                var outEvent = util.copy({}, event);
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
        if(browser.android && type === 'touchmove'){
            e.preventDefault();
        }
    },

    /**
     * @language=en
     * Update the viewport (rendering area) which Stage show on the page. Invoke this function to update viewport when Stage canvas changes border, margin or padding properties.
     * @returns {Object} The visible area of the Stage (the viewport property).
     */
    updateViewport: function(){
        var canvas = this.canvas, viewport = null;
        if(canvas.parentNode){
            viewport = this.viewport = Hilo.getElementRect(canvas);
        }
        return viewport;
    },

    /**
     * @language=en
     * Resize the Stage.
     * @param {Number} width The width of the new Stage.
     * @param {Number} height The height of the new Stage.
     * @param {Boolean} forceResize Whether forced to resize the Stage, means no matter the size of the Stage, force to change the size to keep Stage, canvas and window act at the same time.
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

window.Hilo.Stage = Stage;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * <iframe src='../../../examples/Bitmap.html?noHeader' width = '300' height = '200' scrolling='no'></iframe>
 * <br/>
 * Example:
 * <pre>
 * var bmp = new Hilo.Bitmap({image:imgElem, rect:[0, 0, 100, 100]});
 * stage.addChild(bmp);
 * </pre>
 * @class Bitmap
 * @augments View
 * @param {Object} properties the options of create Instance.It can contains all writable property and Moreover：
 * <ul>
 * <li><b>image</b> - the image of bitmap which contained。required。</li>
 * <li><b>rect</b> - the range of bitmap in the image。option</li>
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
     * @language=en
     * set the image。
     * @param {Image|String} Image Object or URL。
     * @param {Array} rect the range of bitmap in the image。
     * @returns {Bitmap} self。
     */
    setImage: function(image, rect){
        this.drawable.init({image:image, rect:rect});
        if(rect){
            this.width = rect[2];
            this.height = rect[3];
        }
        else if(!this.width && !this.height){
            rect = this.drawable.rect;
            if(rect){
                this.width = rect[2];
                this.height = rect[3];
            }
        }
        return this;
    }
 });

window.Hilo.Bitmap = Bitmap;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * <iframe src='../../../examples/Sprite.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Sprite animation class.
 * @augments View
 * @module hilo/view/Sprite
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @param properties Properties parameters for creating object, include all writable properties of this class, also include:
 * <ul>
 * <li><b>frames</b> - Sprite animation frames data object.</li>
 * </ul>
 * @property {number} currentFrame Current showing frame index, range from 0, readoly!
 * @property {boolean} paused Is sprite paused, default value is false.
 * @property {boolean} loop Is sprite play in loop, default value is false.
 * @property {boolean} timeBased Is sprite animate base on time, default value is false (base on frame).
 * @property {number} interval Interval between sprite animation frames. If timeBased is true, measured in ms, otherwise, measured in frames.
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

    _frames: null, //所有帧的集合 Collection of all frames
    _frameNames: null, //带名字name的帧的集合 Collection of frames that with name
    _frameElapsed: 0, //当前帧持续的时间或帧数 Elapsed time of current frame.
    _firstRender: true, //标记是否是第一次渲染 Is the first render.

    paused: false,
    loop: true,
    timeBased: false,
    interval: 1,
    currentFrame: 0, //当前帧的索引 Index of current frame

    /**
     * @language=en
     * Return the total amount of sprite animation frames.
     * @returns {Uint} The total amount of frames.
     */
    getNumFrames: function(){
        return this._frames ? this._frames.length : 0;
    },

    /**
     * @language=en
     * Add frame into sprite.
     * @param {Object} frame Frames to add into.
     * @param {Int} startIndex The index to start adding frame, if is not given, add at the end of sprite.
     * @returns {Sprite} Sprite itself.
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
     * @language=en
     * Set the frame on the given index.
     * @param {Object} frame The frame data to set on that index.
     * @param {Int} index Index of the frame to set.
     * @returns {Sprite} Sprite itself.
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
     * @language=en
     * Get the frame of given parameter from sprite.
     * @param {Object} indexOrName The index or name of the frame.
     * @returns {Object} The sprite object.
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
     * @language=en
     * Get frame index from sprite.
     * @param {Object} frameValue Index or name of the frame.
     * @returns {Object} Sprite frame object.
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
     * @language=en
     * Play sprite.
     * @returns {Sprite} The Sprite object.
     */
    play: function(){
        this.paused = false;
        return this;
    },

    /**
     * @language=en
     * Pause playing sprite.
     * @returns {Sprite} The Sprite object.
     */
    stop: function(){
        this.paused = true;
        return this;
    },

    /**
     * @language=en
     * Jump to an assigned frame.
     * @param {Object} indexOrName Index or name of an frame to jump to.
     * @param {Boolean} pause Does pause after jumping to the new index.
     * @returns {Sprite} The Sprite object.
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
     * @language=en
     * Render function.
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
     * @language=en
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
     * @language=en
     * Set a callback on an assigned frame. Every time assigned frame is played, invoke the callback function. If callback is empty, callback function will be removed.
     * @param {Int|String} frame Index or name of the assigned frame.
     * @param {Function} callback Callback function.
     * @returns {Sprite} The Sprite object.
     */
    setFrameCallback: function(frame, callback){
        frame = this.getFrame(frame);
        if(frame) frame.callback = callback;
        return this;
    },

    /**
     * @language=en
     * Callback function on when sprite enter a new frame. default value is null. Note: this function is obsolete, use addFrameCallback funciton instead.
     * @type Function
     * @deprecated
     */
    onEnterFrame: null

});

window.Hilo.Sprite = Sprite;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;


/**
 * @language=en
 * <iframe src='../../../examples/DOMElement.html?noHeader' width = '330' height = '250' scrolling='no'></iframe>
 * <br/>
 * demo:
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
 * @class DOMElement is a wrapper of dom element.
 * @augments View
 * @param {Object} properties create Objects properties. Contains all writable properties in this class. Special properties include:
 * <ul>
 * <li><b>element</b> - dom element to wrap, required! </li>
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

        if(this.pointerEnabled){
            elem.style.pointerEvents = 'visible';
        }
    },

    /**
     * @language=en
     * Overwrite render method.
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
     * @language=en
     * Overwrite render method.
     * @private
     */
    render: function(renderer, delta){
        if(renderer.renderType !== 'dom'){
            var canvas = renderer.canvas;
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
window.Hilo.DOMElement = DOMElement;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var CacheMixin = window.Hilo.CacheMixin;


/**
 * @language=en
 * <iframe src='../../../examples/Graphics.html?noHeader' width = '320' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class Graphics class contains a group of functions for creating vector graphics.
 * @augments View
 * @mixes CacheMixin
 * @borrows CacheMixin#cache as #cache
 * @borrows CacheMixin#updateCache as #updateCache
 * @borrows CacheMixin#setCacheDirty as #setCacheDirty
 * @param {Object} properties Properties parameters of the object to create. Contains all writable properties of this class.
 * @module hilo/view/Graphics
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {Number} lineWidth The thickness of lines in space units, default value is 1, readonly!
 * @property {Number} lineAlpha The alpha value (transparency) of line, default value is 1, readonly!
 * @property {String} lineCap The style of how every end point of line are drawn, value options: butt, round, square. default value is null, readonly!
 * @property {String} lineJoin The joint style of two lines. value options: miter, round, bevel. default value is null, readonly!
 * @property {Number} miterLimit The miter limit ratio in space units, works only when lineJoin value is miter. default value is 10, readonly!
 * @property {String} strokeStyle The color or style to use for lines around shapes, default value is 0 (the black color), readonly!
 * @property {String} fillStyle The color or style to use inside shapes, default value is 0 (the black color), readonly!
 * @property {Number} fillAlpha The transparency of color or style inside shapes, default value is 0, readonly!
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
     * @language=en
     * Set the lines style for drawing shapes.
     * @param {Number} thickness The thickness of lines, default value is 1.
     * @param {String} lineColor The CSS color value of lines, default value is 0 (the black color).
     * @param {Number} lineAlpha The transparency of lines, default value is 1 (fully opaque).
     * @param {String} lineCap The style of how every end point of line are drawn, value options: butt, round, square. default value is null.
     * @param {String} lineJoin The joint style of two lines. value options: miter, round, bevel. default value is null.
     * @param {Number} miterLimit The miter limit ratio in space units, works only when lineJoin value is miter. default value is 10.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Set how to fill shapes and the transparency.
     * @param {String} fill Filling style. this can be color, gradient or pattern.
     * @param {Number} alpha Transparency.
     * @returns {Graphics} The Graphics Object.
     */
    beginFill: function(fill, alpha){
        var me = this, addAction = me._addAction;

        addAction.call(me, ['fillStyle', (me.fillStyle = fill)]);
        addAction.call(me, ['fillAlpha', (me.fillAlpha = alpha || 1)]);
        me.hasFill = true;
        return me;
    },

    /**
     * @language=en
     * Apply and end lines-drawing and shapes-filling.
     * @returns {Graphics} The Graphics Object.
     */
    endFill: function(){
        var me = this, addAction = me._addAction;

        if(me.hasStroke) addAction.call(me, ['stroke']);
        if(me.hasFill) addAction.call(me, ['fill']);
        me.setCacheDirty(true);
        return me;
    },

    /**
     * @language=en
     * Set linear gradient filling style to draw shapes.
     * @param {Number} x0 The x-coordinate value of the linear gradient start point.
     * @param {Number} y0 The y-coordinate value of the linear gradient start point.
     * @param {Number} x1 The x-coordinate value of the linear gradient end point.
     * @param {Number} y1 The y-coordinate value of the linear gradient end point.
     * @param {Array} colors An array of CSS colors used in the linear gradient.
     * @param {Array} ratios An array of position between start point and end point, should be one-to-one to colors in the colors array. each value range between 0.0 to 1.0.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Set radial gradient filling style to draw shapes.
     * @param {Number} x0 The x-coordinate value of the radial gradient start circle.
     * @param {Number} y0 The y-coordinate value of the radial gradient start circle.
     * @param {Number} r0 The diameter of the radial gradient start circle.
     * @param {Number} x1 The x-coordinate value of the radial gradient end circle.
     * @param {Number} y1 The y-coordinate value of the radial gradient end circle.
     * @param {Number} r1 The radius of the radial gradient end circle.
     * @param {Array} colors An array of CSS colors used in the radial gradient.
     * @param {Array} ratios An array of position between start circle and end circle, should be one-to-one to colors in the colors array. each value range between 0.0 to 1.0.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Begin an image filling pattern.
     * @param {HTMLImageElement} image The Image to fill.
     * @param {String} repetition The fill repetition style, can be one of valus:repeat, repeat-x, repeat-y, no-repeat. default valus is ''.
     * @returns {Graphics} The Graphics Object.
     */
    beginBitmapFill: function(image, repetition){
        var me = this, pattern = helpContext.createPattern(image, repetition || '');
        me.hasFill = true;
        return me._addAction(['fillStyle', (me.fillStyle = pattern)]);
    },

    /**
     * @language=en
     * Begin a new path.
     * @returns {Graphics} The Graphics Object.
     */
    beginPath: function(){
        return this._addAction(['beginPath']);
    },

    /**
     * @language=en
     * Close current path.
     * @returns {Graphics} The Graphics Object.
     */
    closePath: function(){
        return this._addAction(['closePath']);
    },

    /**
     * @language=en
     * Move current drawing point to a new point on coordinate values (x, y).
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    moveTo: function(x, y){
        return this._addAction(['moveTo', x, y]);
    },

    /**
     * @language=en
     * Draw a line from current point to the point on the coordinate value (x, y).
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    lineTo: function(x, y){
        return this._addAction(['lineTo', x, y]);
    },

    /**
     * @language=en
     * Draw a quadratic Bézier curve from current point to the point on coordinate (x, y).
     * @param {Number} cpx The x-coordinate value of the Bézier curve control point cp.
     * @param {Number} cpy The y-coordinate value of the Bézier curve control point cp.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    quadraticCurveTo: function(cpx, cpy, x, y){
        return this._addAction(['quadraticCurveTo', cpx, cpy, x, y]);
    },

    /**
     * @language=en
     * Draw a Bézier curve from current point to the point on coordinate (x, y).
     * @param {Number} cp1x The x-coordinate value of the Bézier curve control point cp1.
     * @param {Number} cp1y The y-coordinate value of the Bézier curve control point cp1.
     * @param {Number} cp2x The x-coordinate value of the Bézier curve control point cp2.
     * @param {Number} cp2y The y-coordinate value of the Bézier curve control point cp2.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @returns {Graphics} The Graphics Object.
     */
    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y){
        return this._addAction(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
    },

    /**
     * @language=en
     * Draw a rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of the rectangle.
     * @param {Number} height The height of the rectangle.
     * @returns {Graphics} The Graphics Object.
     */
    drawRect: function(x, y, width, height){
        return this._addAction(['rect', x, y, width, height]);
    },

    /**
     * @language=en
     * Draw a complex rounded rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of rounded rectangle.
     * @param {Number} height The height of rounded rectangle.
     * @param {Number} cornerTL The size of the rounded corner on the top-left of the rounded rectangle.
     * @param {Number} cornerTR The size of the rounded corner on the top-right of the rounded rectangle.
     * @param {Number} cornerBR The size of the rounded corner on the bottom-left of the rounded rectangle.
     * @param {Number} cornerBL The size of the rounded corner on the bottom-right of the rounded rectangle.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Draw a rounded rectangle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of rounded rectangle.
     * @param {Number} height The height of rounded rectangle.
     * @param {Number} cornerSize The size of all rounded corners.
     * @returns {Graphics} The Graphics Object.
     */
    drawRoundRect: function(x, y, width, height, cornerSize){
        return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
    },

    /**
     * @language=en
     * Draw a circle.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} radius The radius of the circle.
     * @returns {Graphics} The Graphics Object.
     */
    drawCircle: function(x, y, radius){
        return this._addAction(['arc', x + radius, y + radius, radius, 0, Math.PI * 2, 0]);
    },

    /**
     * @language=en
     * Draw an ellipse.
     * @param {Number} x The x-coordinate value.
     * @param {Number} y The y-coordinate value.
     * @param {Number} width The width of the ellipse.
     * @param {Number} height The height of the ellipse.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Draw a path from the SVG data given by parameters. Not support Arcs.
     * Demo:
     * <p>var path = 'M250 150 L150 350 L350 350 Z';</p>
     * <p>var shape = new Hilo.Graphics({width:500, height:500});</p>
     * <p>shape.drawSVGPath(path).beginFill('#0ff').endFill();</p>
     * @param {String} pathData The SVG path data to draw.
     * @returns {Graphics} The Graphics Object.
     */
    drawSVGPath: function(pathData){
        var me = this, addAction = me._addAction,
            path = pathData.replace(/,/g, ' ').replace(/-/g, ' -').split(/(?=[a-zA-Z])/);
        addAction.call(me, ['beginPath']);
        var currentPoint = {x:0, y:0};
        var lastControlPoint = {x:0, y:0};
        var lastCmd;
        for(var i = 0, len = path.length; i < len; i++){
            var str = path[i];
            if(!str.length){
                continue;
            }
            var realCmd = str[0];
            var cmd = realCmd.toUpperCase();
            var p = this._getSVGParams(str);
            var useRelative = cmd !== realCmd;

            switch(cmd){
                case 'M':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['moveTo', p[0], p[1]]);
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;
                case 'L':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['lineTo', p[0], p[1]]);
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;
                case 'H':
                    if(useRelative){
                        p[0] += currentPoint.x;
                    }
                    addAction.call(me, ['lineTo', p[0], currentPoint.y]);
                    currentPoint.x = p[0];
                    break;
                case 'V':
                    if(useRelative){
                        p[0] += currentPoint.y;
                    }
                    addAction.call(me, ['lineTo', currentPoint.x, p[0]]);
                    currentPoint.y = p[0];
                    break;
                case 'Z':
                    addAction.call(me, ['closePath']);
                    break;
                case 'C':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['bezierCurveTo', p[0], p[1], p[2], p[3], p[4], p[5]]);
                    lastControlPoint.x = p[2];
                    lastControlPoint.y = p[3];
                    this._setCurrentPoint(currentPoint, p[4], p[5]);
                    break;
                case 'S':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    if(lastCmd === 'C' || lastCmd === 'S'){
                        controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                    }
                    else{
                        controlPoint = currentPoint;
                    }
                    addAction.call(me, ['bezierCurveTo', controlPoint.x, controlPoint.y, p[0], p[1], p[2], p[3]]);
                    lastControlPoint.x = p[0];
                    lastControlPoint.y = p[1];
                    this._setCurrentPoint(currentPoint, p[2], p[3]);
                    break;
                case 'Q':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    addAction.call(me, ['quadraticCurveTo', p[0], p[1], p[2], p[3]]);
                    lastControlPoint.x = p[0];
                    lastControlPoint.y = p[1];
                    this._setCurrentPoint(currentPoint, p[2], p[3]);
                    break;
                case 'T':
                    if(useRelative){
                        this._convertToAbsolute(currentPoint, p);
                    }
                    var controlPoint;
                    if(lastCmd === 'Q' || lastCmd === 'T'){
                        controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                    }
                    else{
                        controlPoint = currentPoint;
                    }
                    addAction.call(me, ['quadraticCurveTo', controlPoint.x, controlPoint.y, p[0], p[1]]);
                    lastControlPoint = controlPoint;
                    this._setCurrentPoint(currentPoint, p[0], p[1]);
                    break;                
            }
            lastCmd = cmd;
            
        }
        return me;
    },
    _getSVGParams:function(str){
        var p = str.substring(1).replace(/[\s]+$|^[\s]+/g, '').split(/[\s]+/);
        if(p[0].length == 0) {
            p.shift();
        }
        for(var i = 0, l = p.length;i < l;i ++){
            p[i] = parseFloat(p[i]);
        }
        return p;
    },
    _convertToAbsolute:function(currentPoint, data){
        for(var i = 0, l = data.length;i < l;i ++){
            if(i%2 === 0){
                data[i] += currentPoint.x;
            }
            else{
                data[i] += currentPoint.y;
            }
        }
    },
    _setCurrentPoint:function(currentPoint, x, y){
        currentPoint.x = x;
        currentPoint.y = y;
    },
    _getReflectionPoint:function(centerPoint, point){
        return {
            x:centerPoint.x * 2 - point.x,
            y:centerPoint.y * 2 - point.y
        };
    },

    /**
     * @language=en
     * Apply all draw actions. private function.
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
     * @language=en
     * Overwrite render function.
     * @private
     */
    render: function(renderer, delta){
        var me = this;
        if(renderer.renderType === 'canvas'){
            me._draw(renderer.context);
        }else{
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * @language=en
     * Clear all draw actions and reset to the initial state.
     * @returns {Graphics} The Graphics Object.
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
     * @language=en
     * Add a draw action, this is a private function.
     * @private
     */
    _addAction: function(action){
        var me = this;
        me._actions.push(action);
        return me;
    }

});

})();

window.Hilo.Graphics = Graphics;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var Hilo = window.Hilo;var View = window.Hilo.View;
var CacheMixin = window.Hilo.CacheMixin;


/**
 * @language=en
 * <iframe src='../../../examples/Text.html?noHeader' width = '320' height = '240' scrolling='no'></iframe>
 * <br/>
 * @class Text class provide basic text-display function, use DOMElement for complex text-display.
 * @augments View
 * @mixes CacheMixin
 * @borrows CacheMixin#cache as #cache
 * @borrows CacheMixin#updateCache as #updateCache
 * @borrows CacheMixin#setCacheDirty as #setCacheDirty
 * @param {Object} properties Properties parameters for the object. Includes all writable properties.
 * @module hilo/view/Text
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/View
 * @requires hilo/view/CacheMixin
 * @property {String} text Text to display.
 * @property {String} color Color of the text.
 * @property {String} textAlign Horizontal alignment way of the text. May be one of the following value:'start', 'end', 'left', 'right', and 'center'. Note:Need to specify the width property of the text to take effect
 * @property {String} textVAlign Vertical alignment way of the text. May be one of the following value:'top', 'middle', 'bottom'. Note:Need to specify the height property of the text to take effect.
 * @property {Boolean} outline Draw the outline of the text or fill the text.
 * @property {Number} lineSpacing The spacing between lines. Measured in px, default value is 0.
 * @property {Number} maxWidth The max length of the text, default value is 200.
 * @property {String} font Text's CSS font style, readonly! Use setFont function to set text font.
 * @property {Number} textWidth Width of the text, readonly! Works only on canvas mode.
 * @property {Number} textHeight Height of the text, readonly! Works only on canvas mode.
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
     * @language=en
     * Set text CSS font style.
     * @param {String} font Text CSS font style to set.
     * @returns {Text} the Text object, chained call supported.
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
     * @language=en
     * Overwrite render function.
     * @private
     */
    render: function(renderer, delta){
        var me = this;

        if(renderer.renderType === 'canvas'){
            if(this.drawable){
                renderer.draw(me);
            }
            else{
                me._draw(renderer.context);
            }
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
            //TODO:自动更新cache  TODO:auto update cache
            me.cache();
            renderer.draw(me);
        }
    },

    /**
     * @language=en
     * Draw text under the assigned render context.
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
        var i, line, w, len, wlen;
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
        for(i = 0; i < drawLines.length; i++){
            line = drawLines[i];
            me._drawTextLine(context, line.text, startY + line.y);
        }
    },

    /**
     * @language=en
     * Draw a line of text under the assigned render context.
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
        }

        if(me.outline) context.strokeText(text, x, y);
        else context.fillText(text, x, y);
    },

    Statics: /** @lends Text */{
        /**
         * @language=en
         * Measure the line height of the assigned text font style.
         * @param {String} font Font style to measure.
         * @return {Number} Return line height of the assigned font style.
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

window.Hilo.Text = Text;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var Hilo = window.Hilo;var Container = window.Hilo.Container;
var Bitmap = window.Hilo.Bitmap;


/**
 * @language=en
 * <iframe src='../../../examples/BitmapText.html?noHeader' width = '550' height = '80' scrolling='no'></iframe>
 * <br/>
 * @class BitmapText  support bitmap text function ,but only support single-line text
 * @augments Container
 * @param {Object} properties the options of create Instance.It can contains all writable property
 * @module hilo/view/BitmapText
 * @requires hilo/core/Class
 * @requires hilo/core/Hilo
 * @requires hilo/view/Container
 * @requires hilo/view/Bitmap
 * @property {Object} glyphs font glyph set of bitmap. format:{letter:{image:img, rect:[0,0,100,100]}}
 * @property {Number} letterSpacing spacing of letter. default:0
 * @property {String} text content of bitmap text. Not writable,set this value by 'setText'
 * @property {String} textAlign property values:left、center、right, default:left,Not writable,set this property by 'setTextAlign'
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
     * @language=en
     * set the content of bitmap text
     * @param {String} text content
     * @returns {BitmapText} BitmapText Instance,support chained calls
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
      * @language=en
      * set the textAlign of text。
     * @param textAlign value of textAlign:left、center、right
     * @returns {BitmapText} itmapText Instance,support chained calls
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
                /* falls through */
            default:
                this.pivotX = 0;
                break;
        }
        return this;
    },

    /**
     * @language=en
     * detect whether can display the string by the currently assigned font provided
     * @param {String} str to detect string
     * @returns {Boolean} whether can display the string
     */
    hasGlyphs: function(str){
        var glyphs = this.glyphs;
        if(!glyphs) return false;

        str = str.toString();
        var len = str.length, i;
        for(i = 0; i < len; i++){
            if(!glyphs[str.charAt(i)]) return false;
        }
        return true;
    },

    Statics:/** @lends BitmapText */{
        _pool:[],
        /**
         * @language=en
         * easy way to generate a collection of glyphs
         * @static
         * @param {String} text character text.
         * @param {Image} image character image.
         * @param {Number} col default:the length of string
         * @param {Number} row default:1
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
                var charStr = str.charAt(i);
                glyphs[charStr] = {
                    image:image,
                    rect:[w * (i % col), h * Math.floor(i / col), w, h]
                };
            }
            return glyphs;
        }
    }

});

window.Hilo.BitmapText = BitmapText;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Drawable = window.Hilo.Drawable;
var util = window.Hilo.util;


/**
 * @language=en
 * <iframe src='../../../examples/Button.html?noHeader' width = '320' height = '170' scrolling='no'></iframe>
 * <br/>
 * demo:
 * <pre>
 * var btn = new Hilo.Button({
 *     image: buttonImage,
 *     upState: {rect:[0, 0, 64, 64]},
 *     overState: {rect:[64, 0, 64, 64]},
 *     downState: {rect:[128, 0, 64, 64]},
 *     disabledState: {rect:[192, 0, 64, 64]}
 * });
 * </pre>
 * @class Button class is a simple button class, contains four kinds of state: 'up', 'over', 'down', 'disabled'
 * @augments View
 * @param {Object} properties create object properties. Contains all writable properties. Also contains:
 * <ul>
 * <li><b>image</b> - the image element that button image is in</li>
 * </ul>
 * @module hilo/view/Button
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Drawable
 * @requires hilo/util/util
 * @property {Object} upState The property of button 'up' state or collections of its drawable properties.
 * @property {Object} overState The property of button 'over' state or collections of its drawable properties.
 * @property {Object} downState The property of button 'down' state or collections of its drawable properties.
 * @property {Object} disabledState The property of button 'disabled' state or collections of its drawable properties.
 * @property {String} state the state name of button, could be one of Button.UP|OVER|DOWN|DISABLED, readonly!
 * @property {Boolean} enabled Is button enabled. default value is true, readonly!
 * @property {Boolean} useHandCursor If true, cursor over the button will become a pointer cursor, default value is true.
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
     * @language=en
     * Set whether the button is enabled.
     * @param {Boolean} enabled Show whether the button is enabled.
     * @returns {Button} Return the button itself.
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
     * @language=en
     * Set the state of the button. Invoke inside the Button and may not be used.
     * @param {String} state New state of the button.
     * @returns {Button} Return the button itself.
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
                util.copy(this, stateObj, true);
            }
        }

        return this;
    },

    /**
     * @language=en
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
         * @language=en
         * Statics value of Button's 'up' state.
         * @type String
         */
        UP: 'up',
        /**
         * @language=en
         * Statics value of Button's 'over' state.
         * @type String
         */
        OVER: 'over',
        /**
         * @language=en
         * Statics value of Button's 'down' state.
         * @type String
         */
        DOWN: 'down',
        /**
         * @language=en
         * Statics value of Button's 'disabled' state.
         * @type String
         */
        DISABLED: 'disabled'
    }
 });
window.Hilo.Button = Button;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
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
     * @language=en
     * 获取指定索引位置index的帧数据。
     * @param {Int} index 要获取帧的索引位置。
     * @returns {Object} 帧数据。
     */
    getFrame: function(index){
        var frames = this._frames;
        return frames && frames[index];
    },

    /**
     * @language=en
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
         * @language=en
         * Shorthand method to create spirte frames
         * @param {String|Array} name Name of one animation|a group of animation
         * @param {String} frames Frames message, eg:"0-5" means frame 0 to frame 5.
         * @param {Number} w The width of each frame.
         * @param {Number} h The height of each frame.
         * @param {Bollean} loop Is play in loop.
         * @param {Number} duration The time between each frame. default value is 1 (Frame), but if timeBased is true, default value will be duration(milli-second).
         * @example
         *  //demo1 make one animation
         *  createSpriteFrames("walk", "0-5,8,9", meImg, 55, 88, true, 1);
         *  //demo2 make a group of animation
         *  createSpriteFrames([
         *    ["walk", "0-5,8,9", meImg, 55, 88, true, 1],
         *    ["jump", "0-5", meImg, 55, 88, false, 1]
         *  ]);
        */
        createSpriteFrames:function(name, frames, img, w, h, loop, duration){
            var i, l;
            if(Object.prototype.toString.call(name) === "[object Array]"){
                var res = [];
                for(i = 0, l = name.length;i < l;i ++){
                    res = res.concat(this.createSpriteFrames.apply(this, name[i]));
                }
                return res;
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
                            for(i = parseInt(temp[0]), l = parseInt(temp[1]);i <= l;i ++){
                                frames.push(i);
                            }
                        }
                    }
                }

                var col = Math.floor(img.width/w);
                for(i = 0;i < frames.length;i ++){
                    var n = frames[i];
                    frames[i] = {
                        rect:[w*(n%col), h*Math.floor(n/col), w, h],
                        image:img,
                        duration:duration
                    };
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
 * @language=en
 * Parse texture frames
 * @private
 */
function parseTextureFrames(atlasData){
    var i, len;
    var frameData = atlasData.frames;
    if(!frameData) return null;

    var frames = [], obj;

    if(frameData instanceof Array){ //frames by array
        for(i = 0, len = frameData.length; i < len; i++){
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
        for(i = 0; i < numFrames; i++){
            frames[i] = {
                image: atlasData.image,
                rect: [i%cols*frameWidth, (i/cols|0)*frameHeight, frameWidth, frameHeight]
            };
        }
    }

    return frames;
}

/**
 * @language=en
 * Parse texture sprites
 * @private
 */
function parseTextureSprites(atlasData, frames){
    var i, len;
    var spriteData = atlasData.sprites;
    if(!spriteData) return null;

    var sprites = {}, sprite, spriteFrames, spriteFrame;

    for(var s in spriteData){
        sprite = spriteData[s];
        if(isNumber(sprite)){ //single frame
            spriteFrames = translateSpriteFrame(frames[sprite]);
        }else if(sprite instanceof Array){ //frames by array
            spriteFrames = [];
            for(i = 0, len = sprite.length; i < len; i++){
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
            for(i = sprite.from; i <= sprite.to; i++){
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
window.Hilo.TextureAtlas = TextureAtlas;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var browser = window.Hilo.browser;


/**
 * @language=en
 * @class Ticker is a Timer. It can run the code at specified framerate.
 * @param {Number} fps The fps of ticker.
 * @module hilo/util/Ticker
 * @requires hilo/core/Class
 * @requires hilo/util/browser
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
     * @language=en
     * Start the ticker.
     * @param {Boolean} userRAF Whether or not use requestAnimationFrame, default is not.
     */
    start: function(useRAF){
        if(this._intervalId) return;
        this._lastTime = +new Date();

        var self = this, interval = this._interval,
            raf = window.requestAnimationFrame ||
                  window[browser.jsVendor + 'RequestAnimationFrame'];

        var runLoop;
        if(useRAF && raf && interval < 17){
            this._useRAF = true;
            runLoop = function(){
                self._intervalId = raf(runLoop);
                self._tick();
            };
        }else{
            runLoop = function(){
                self._intervalId = setTimeout(runLoop, interval);
                self._tick();
            };
        }

        this._paused = false;
        runLoop();
    },

    /**
     * @language=en
     * Stop the ticker.
     */
    stop: function(){
        if(this._useRAF){
            var cancelRAF = window.cancelAnimationFrame ||
                  window[browser.jsVendor + 'CancelAnimationFrame'];
            cancelRAF(this._intervalId);
        }
        else{
            clearTimeout(this._intervalId);
        }
        this._intervalId = null;
        this._lastTime = 0;
        this._paused = true;
    },

    /**
     * @language=en
     * Pause the ticker.
     */
    pause: function(){
        this._paused = true;
    },

    /**
     * @language=en
     * Resume the ticker.
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

        var tickersCopy = tickers.slice(0);
        for(var i = 0, len = tickersCopy.length; i < len; i++){
            tickersCopy[i].tick(deltaTime);
        }
    },

    /**
     * @language=en
     * Get the fps.
     */
    getMeasuredFPS: function(){
        return Math.min(this._measuredFPS, this._targetFPS);
    },

    /**
     * @language=en
     * Add tickObject. The tickObject must implement the tick method.
     * @param {Object} tickObject The tickObject to add.It must implement the tick method.
     */
    addTick: function(tickObject){
        if(!tickObject || typeof(tickObject.tick) != 'function'){
            throw new Error('Ticker: The tick object must implement the tick method.');
        }
        this._tickers.push(tickObject);
    },

    /**
     * @language=en
     * Remove the tickObject
     * @param {Object} tickObject The tickObject to remove.
     */
    removeTick: function(tickObject){
        var tickers = this._tickers,
            index = tickers.indexOf(tickObject);
        if(index >= 0){
            tickers.splice(index, 1);
        }
    },
    /**
     * 下次tick时回调
     * @param  {Function} callback
     * @return {tickObj}
     */
    nextTick:function(callback){
        var that = this;
        var tickObj = {
            tick:function(dt){
                that.removeTick(tickObj);
                callback();
            }
        };

        that.addTick(tickObj);
        return tickObj;
    },
    /**
     * 延迟指定的时间后调用回调, 类似setTimeout
     * @param  {Function} callback
     * @param  {Number}   duration 延迟的毫秒数
     * @return {tickObj}
     */
    timeout:function(callback, duration){
        var that = this;
        var targetTime = new Date().getTime() + duration;
        var tickObj = {
            tick:function(){
                var nowTime = new Date().getTime();
                var dt = nowTime - targetTime;
                if(dt >= 0){
                    that.removeTick(tickObj);
                    callback();
                }
            }
        };
        that.addTick(tickObj);
        return tickObj;
    },
    /**
     * 指定的时间周期来调用函数, 类似setInterval
     * @param  {Function} callback
     * @param  {Number}   duration 时间周期，单位毫秒
     * @return {tickObj}
     */
    interval:function(callback, duration){
        var that = this;
        var targetTime = new Date().getTime() + duration;
        var tickObj = {
            tick:function(){
                var nowTime = new Date().getTime();
                var dt = nowTime - targetTime;
                if(dt >= 0){
                    if(dt < duration){
                        nowTime -= dt;
                    }
                    targetTime = nowTime + duration;
                    callback();
                }
            }
        };
        that.addTick(tickObj);
        return tickObj;
    }
});
window.Hilo.Ticker = Ticker;
})(window);
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
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;

/**
 * @language=en
 * <iframe src='../../../examples/drag.html?noHeader' width = '550' height = '250' scrolling='no'></iframe>
 * <br/>
 * example:
 * <pre>
 * var bmp = new Bitmap({image:img});
 * Hilo.util.copy(bmp, Hilo.drag);
 * bmp.startDrag([0, 0, 550, 400]);
 * </pre>
 * @class drag A mixin that contains drag method.You can mix drag method to the visual target by use Class.mix(target, drag) or Hilo.util.copy(target, drag).
 * @mixin
 * @static
 * @module hilo/util/drag
 * @requires hilo/core/Hilo
 */
var drag = {
    _isDragStart:false,
    /**
     * @language=en
     * start drag.
      * @param {Array} bounds The bounds area that the view can move, relative to the coordinates of the view's parent, [x, y, width, height]， default is no limit.
    */
    startDrag:function(bounds){
        if(this._isDragStart){
            this.stopDrag();
        }
        this._isDragStart = true;

        var that = this;
        var stage;
        bounds = bounds||[-Infinity, -Infinity, Infinity, Infinity];
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


            that.__dragX = that.x - mouse.x;
            that.__dragY = that.y - mouse.y;

            if(!stage){
                stage = this.getStage();
            }
            stage.on(Hilo.event.POINTER_MOVE, onMove);
            document.addEventListener(Hilo.event.POINTER_END, onStop);
            that.fire("dragStart", mouse);
        }

        function onStop(e){
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);

            that.on(Hilo.event.POINTER_START, onStart);
            that.fire("dragEnd", mouse);
        }

        function onMove(e){
            updateMouse(e);

            var x = mouse.x + that.__dragX;
            var y = mouse.y + that.__dragY;

            that.x = Math.max(minX, Math.min(maxX, x));
            that.y = Math.max(minY, Math.min(maxY, y));
            
            that.fire("dragMove", mouse);
        }

        function updateMouse(e){
            mouse.preX = mouse.x;
            mouse.preY = mouse.y;
            mouse.x = e.stageX;
            mouse.y = e.stageY;
        }

        function stopDrag(){
            this._isDragStart = false;
            document.removeEventListener(Hilo.event.POINTER_END, onStop);
            stage && stage.off(Hilo.event.POINTER_MOVE, onMove);
            that.off(Hilo.event.POINTER_START, onStart);
        }
        that.on(Hilo.event.POINTER_START, onStart);

        that.stopDrag = stopDrag;
    },
    /**
     * @language=en
     * stop drag.
    */
    stopDrag:function(){
        this._isDragStart = false;
    }
};
window.Hilo.drag = drag;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
 * <iframe src='../../../examples/Tween.html?noHeader' width = '550' height = '130' scrolling='no'></iframe>
 * <br/>
 * Demo:
 * <pre>
 * ticker.addTick(Hilo.Tween);//Tween works after being added to ticker
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
 * @class Tween class makes tweening (easing, slow motion).
 * @param {Object} target Tween target object.
 * @param {Object} fromProps Beginning properties of target tweening object.
 * @param {Object} toProps Ending properties of target tweening object.
 * @param {Object} params Tweening parameters, include all writable Tween class properties.
 * @module hilo/tween/Tween
 * @requires hilo/core/Class
 * @property {Object} target Tween target object, readonly!
 * @property {Int} duration Tweening duration, measure in ms.
 * @property {Int} delay Tweenning delay time, measure in ms.
 * @property {Boolean} paused Is tweening paused, default value is false.
 * @property {Boolean} loop Does tweening loop, default value is false.
 * @property {Boolean} reverse Does tweening reverse, default value is false.
 * @property {Int} repeat Repeat times of tweening, default value is 0.
 * @property {Int} repeatDelay Delay time of repeating tweening, measure in ms.
 * @property {Function} ease Tweening transform function, default value is null.
 * @property {Int} time Time that tweening taken, measure in ms, readonly!
 * @property {Function} onStart Function invoked on the beginning of tweening. Require 1 parameter: tween. default value is null.
 * @property {Function} onUpdate Function invoked on tweening update. Require 2 parameters: ratio, tween.  default value is null.
 * @property {Function} onComplete Function invoked on the end of tweening. Require 1 parameter: tween.  default value is null.
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
    duration: 1000,
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
     * @language=en
     * Set beginning properties and ending properties of tweening object.
     * @param {Object} fromProps Beginning properties of target tweening object.
     * @param {Object} toProps Ending properties of target tweening object.
     * @returns {Tween} Current Tween, for chain calls.
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
     * @language=en
     * Starting the tweening.
     * @returns {Tween} Current Tween, for chain calls.
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
     * @language=en
     * Stop the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    stop: function(){
        Tween.remove(this);
        return this;
    },

    /**
     * @language=en
     * Pause the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    pause: function(){
        var me = this;
        me.paused = true;
        me._pausedStartTime = now();
        return me;
    },

    /**
     * @language=en
     * Continue to play the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    resume: function(){
        var me = this;
        me.paused = false;
        if(me._pausedStartTime) me._pausedTime += now() - me._pausedStartTime;
        me._pausedStartTime = 0;
        return me;
    },

    /**
     * @language=en
     * Tween jumps to some point.
     * @param {Number} time The time to jump to, range from 0 to duration.
     * @param {Boolean} pause Is paused.
     * @returns {Tween} Current Tween, for chain calls.
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
     * @language=en
     * Link next Tween. The beginning time of next Tween depends on the delay value. If delay is a string that begins with '+' or '-', next Tween will begin at (delay) ms after or before the current tween is ended. If delay is out of previous situation, next Tween will begin at (delay) ms after the beginning point of current Tween.
     * @param {Tween} tween Tween to link.
     * @returns {Tween} Current Tween, for chain calls.
     */
    link: function(tween){
        var me = this, delay = tween.delay, startTime = me._startTime;

        var plus, minus;
        if(typeof delay === 'string'){
            plus = delay.indexOf('+') == 0;
            minus = delay.indexOf('-') == 0;
            delay = plus || minus ? Number(delay.substr(1)) * (plus ? 1 : -1) : Number(delay);
        }
        tween.delay = delay;
        tween._startTime = plus || minus ? startTime + me.duration + delay : startTime + delay;

        me._next = tween;
        Tween.remove(tween);
        return me;
    },

    /**
     * @language=en
     * Private render method inside Tween class.
     * @private
     */
    _render: function(ratio){
        var me = this, target = me.target, fromProps = me._fromProps, p;
        for(p in fromProps) target[p] = fromProps[p] + (me._toProps[p] - fromProps[p]) * ratio;
    },

    /**
     * @language=en
     * Private update method inside Tween class.
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
        ratio = ratio <= 0 ? 0 : ratio >= 1 ? 1 : ratio;
        var easeRatio = me.ease ? me.ease(ratio) : ratio;

        if(me.reverse){
            //backward
            if(me._reverseFlag < 0) {
                ratio = 1 - ratio;
                easeRatio = 1 - easeRatio;
            }
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
        me._render(easeRatio);
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
         * @language=en
         * @private
         */
        _tweens: [],

        /**
         * @language=en
         * Update all Tween instances.
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
         * @language=en
         * Add a Tween instance.
         * @param {Tween} tween Tween object to add.
         * @returns {Object} Tween。
         */
        add: function(tween){
            var tweens = Tween._tweens;
            if(tweens.indexOf(tween) == -1) tweens.push(tween);
            return Tween;
        },

        /**
         * @language=en
         * Remove one Tween target.
         * @param {Tween|Object|Array} tweenOrTarget Tween object, target object or an array of object to remove
         * @returns {Object} Tween。
         */
        remove: function(tweenOrTarget){
            var i, l;
            if(tweenOrTarget instanceof Array){
                for(i = 0, l = tweenOrTarget.length;i < l;i ++){
                    Tween.remove(tweenOrTarget[i]);
                }
                return Tween;
            }

            var tweens = Tween._tweens;
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
         * @language=en
         * Remove all Tween instances.
         * @returns {Object} Tween。
         */
        removeAll: function(){
            Tween._tweens.length = 0;
            return Tween;
        },

        /**
         * @language=en
         * Create a tween, make target object easing from beginning properties to ending properties.
         * @param {Object|Array} target Tweening target or tweening target array.
         * @param fromProps Beginning properties of target tweening object.
         * @param toProps Ending properties of target tweening object.
         * @param params Tweening parameters.
         * @returns {Tween|Array} An tween instance or an array of tween instance.
         */
        fromTo: function(target, fromProps, toProps, params){
            params = params || {};
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
         * @language=en
         * Create a tween, make target object easing from current properties to ending properties.
         * @param {Object|Array} target Tweening target or tweening target array.
         * @param toProps Ending properties of target tweening object.
         * @param params Tweening parameters.
         * @returns {Tween|Array} An tween instance or an array of tween instance.
         */
        to: function(target, toProps, params){
            return Tween.fromTo(target, null, toProps, params);
        },

        /**
         * @language=en
         * Create a tween, make target object easing from beginning properties to current properties.
         * @param {Object|Array} target Tweening target or tweening target array.
         * @param fromProps Beginning properties of target tweening object.
         * @param params Tweening parameters.
         * @returns {Tween|Array} An tween instance or an array of tween instance.
         */
        from: function(target, fromProps, params){
            return Tween.fromTo(target, fromProps, null, params);
        }
    }

});

})();

window.Hilo.Tween = Tween;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};


/**
 * @language=en
 * @class Ease class provides multiple easing functions for Tween.
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
 * @language=en
 * Linear easing function.Include EaseNone.
 */
var Linear = createEase(null, null, null, null, function(k){
    return k;
});

/**
 * @language=en
 * Quad easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Cubic easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Quart easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Quint easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Sine easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Expo easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Circ easing function.Include EaseIn, EaseOut, EaseInOut.
 */
var Circ = createEase(null,
    function(k){
        return -(sqrt(1 - k * k) - 1);
    },

    function(k){
        return sqrt(1 - (--k * k));
    },

    function(k){
        if((k /= 0.5) < 1) return - 0.5 * (sqrt(1 - k * k) - 1);
        return 0.5 * (sqrt(1 - (k -= 2) * k) + 1);
    }
);

/**
 * @language=en
 * Elastic easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Back easing function.Include EaseIn, EaseOut, EaseInOut.
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
 * @language=en
 * Bounce easing function.Include EaseIn, EaseOut, EaseInOut.
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
};

})();
window.Hilo.Ease = Ease;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
 * @private
 * @class image resources loader.
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

        image.onload = function(){
            me.onLoad(image);
        };
        image.onerror = image.onabort = me.onError.bind(image);
        image.src = data.src + (data.noCache ? (data.src.indexOf('?') == -1 ? '?' : '&') + 't=' + (+new Date()) : '');
    },

    onLoad: function(image){
        image.onload = image.onerror = image.onabort = null;
        return image;
    },

    onError: function(e){
        var image = e.target;
        image.onload = image.onerror = image.onabort = null;
        return e;
    }

});
window.Hilo.ImageLoader = ImageLoader;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;


/**
 * @language=en
 * @private
 * @class javascript or JSONP loader
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
                };
            }

            src += (src.indexOf('?') == -1 ? '?' : '&') + callbackName + '=' + callback;
        }

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
window.Hilo.ScriptLoader = ScriptLoader;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var EventMixin = window.Hilo.EventMixin;
var ImageLoader = window.Hilo.ImageLoader;
var ScriptLoader = window.Hilo.ScriptLoader;


//TODO: 超时timeout，失败重连次数maxTries，更多的下载器Loader，队列暂停恢复等。

/**
 * @language=en
 * @class LoadQueue is a queue-like loader.
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @param {Object} source resource that need to be loaded,could be a single object or array resource.
 * @module hilo/loader/LoadQueue
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/loader/ImageLoader
 * @requires hilo/loader/ScriptLoader
 * @property {Int} maxConnections the limited concurrent connections. default value  2.
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
     * @language=en
     * Add desired resource,could be a single object or array resource.
     * @param {Object|Array} source ,a single object or array resource. Each resource contains properties like below:
     * <ul>
     * <li><b>id</b> - resource identifier</li>
     * <li><b>src</b> - resource url</li>
     * <li><b>type</b> - resource type. By default, we automatically identify resource by file suffix and choose the relevant loader for you</li>
     * <li><b>loader</b> - specified resource loader. If you specify this,we abandon choosing loader inside</li>
     * <li><b>noCache</b> - a tag that set on or off to prevent cache,implemented by adding timestamp inside</li>
     * <li><b>size</b> - predicted resource size, help calculating loading progress</li>
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
     * @language=en
     * get resource object by id or src
     * @param {String}  specified id or src
     * @returns {Object} resource object
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
     * @language=en
     * get resource object content  by id or src
     * @param {String} specified id or src
     * @returns {Object} resource object content
     */
    getContent: function(id){
        var item = this.get(id);
        return item && item.content;
    },

    /**
     * @language=en
     * start loading
     * @returns {LoadQueue} the loading instance
     */
    start: function(){
        var me = this;
        me._loadNext();
        return me;
    },

    /**
     * @language=en
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
     * @language=en
     * @private
     */
    _getLoader: function(item){
        var loader = item.loader;
        if(loader) return loader;

        var type = item.type || getExtension(item.src);

        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
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
     * @language=en
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
     * @language=en
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
     * @language=en
     *  get resource size, loaded or all.
     * @param {Boolean} identify loaded or all resource. default is false, return all resource size. when set true, return loaded resource size.
     * @returns {Number} resource size.
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
     * @language=en
     * get loaded resource count
     * @returns {Uint} loaded resource count
     */
    getLoaded: function(){
        return this._loaded;
    },

    /**
     * @language=en
     * get all resource count
     * @returns {Uint} all resource count
     */
    getTotal: function(){
        return this._source.length;
    }

});

/**
 * @language=en
 * @private
 */
function getExtension(src){
    var extRegExp = /\/?[^/]+\.(\w+)(\?\S+)?$/i, match, extension;
    if(match = src.match(extRegExp)){
        extension = match[1].toLowerCase();
    }
    return extension || null;
}
window.Hilo.LoadQueue = LoadQueue;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;
var EventMixin = window.Hilo.EventMixin;


/**
 * @language=en
 * @class HTMLAudio is an audio playing module, which uses HTMLAudioElement to play audio.
 * Limits: iOS platform requires user action events to start playing, and many Android browser can only play one audio at a time.
 * @param {Object} properties create object properties, include all writable properties of this class.
 * @module hilo/media/HTMLAudio
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @requires hilo/event/EventMixin
 * @property {String} src The source of the playing audio.
 * @property {Boolean} loop Is loop playback, default value is false.
 * @property {Boolean} autoPlay Is the audio autoplay, default value is false.
 * @property {Boolean} loaded Is the audio resource loaded, readonly!
 * @property {Boolean} playing Is the audio playing, readonly!
 * @property {Number} duration The duration of the audio, readonly!
 * @property {Number} volume The volume of the audio, value between 0 to 1.
 * @property {Boolean} muted Is the audio muted, default value is false.
 */
var HTMLAudio = Class.create(/** @lends HTMLAudio.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        util.copy(this, properties, true);

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
     * @language=en
     * Load audio file.
     */
    load: function(){
        if(!this._element){
            var elem;
            try{
                elem = this._element = new Audio();
                elem.addEventListener('canplaythrough', this._onAudioEvent, false);
                elem.addEventListener('ended', this._onAudioEvent, false);
                elem.addEventListener('error', this._onAudioEvent, false);
                elem.src = this.src;
                elem.volume = this.volume;
                elem.load();
            }
            catch(err){
                //ie9 某些版本有Audio对象，但是执行play,pause会报错！
                elem = this._element = {};
                elem.play = elem.pause = function(){

                };
            }
        }
        return this;
    },

    /**
     * @language=en
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
     * @language=en
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
     * @language=en
     * Start playing the audio. And play the audio from the beginning if the audio is already playing.
     * Note: To prevent failing to play at the first time, play when the audio is loaded.
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
     * @language=en
     * Pause (halt) the currently playing audio.
     */
    pause: function(){
        if(this.playing){
            this._element.pause();
            this.playing = false;
        }
        return this;
    },

    /**
     * @language=en
     * Continue to play the audio.
     */
    resume: function(){
        if(!this.playing){
            this._doPlay();
        }
        return this;
    },

    /**
     * @language=en
     * Stop playing the audio.
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
     * @language=en
     * Set the volume. Note: iOS devices cannot set volume.
     */
    setVolume: function(volume){
        if(this.volume != volume){
            this.volume = volume;
            this._element.volume = volume;
        }
        return this;
    },

    /**
     * @language=en
     * Set mute mode. Note: iOS devices cannot set mute mode.
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
         * @language=en
         * Does the browser supports HTMLAudio.
         */
        isSupported: window.Audio !== null
    }

});
window.Hilo.HTMLAudio = HTMLAudio;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;
var EventMixin = window.Hilo.EventMixin;


/**
 * @language=en
 * @class WebAudio audio playing module. It provides a better way to play and control audio, use on iOS6+ platform.
 * Compatibility：iOS6+、Chrome33+、Firefox28+ supported，but all Android browsers do not support.
 * @param {Object} properties create object properties, include all writable properties of this class.
 * @module hilo/media/WebAudio
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @requires hilo/event/EventMixin
 * @property {String} src The source of the playing audio.
 * @property {Boolean} loop Is loop playback, default value is false.
 * @property {Boolean} autoPlay Is the audio autoplay, default value is false.
 * @property {Boolean} loaded Is the audio resource loaded, readonly!
 * @property {Boolean} playing Is the audio playing, readonly!
 * @property {Number} duration The duration of the audio, readonly!
 * @property {Number} volume The volume of the audio, value between 0 to 1.
 * @property {Boolean} muted Is the audio muted, default value is false.
 */
var WebAudio = (function(){

var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = AudioContext ? new AudioContext() : null;

return Class.create(/** @lends WebAudio.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        util.copy(this, properties, true);

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

    _context: null, //WebAudio上下文 the WebAudio Context
    _gainNode: null, //音量控制器 the volume controller
    _buffer: null, //音频缓冲文件 the audio file buffer
    _audioNode: null, //音频播放器 the audio playing node
    _startTime: 0, //开始播放时间戳 the start time to play the audio
    _offset: 0, //播放偏移量 the offset of current playing audio

    /**
     * @language=en
     * @private Initialize.
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
     * @language=en
     * Load audio file. Note: use XMLHttpRequest to load the audio, should pay attention to cross-origin problem.
     */
    load: function(){
        if(!this._buffer){
            var buffer = WebAudio._bufferCache[this.src];
            if(buffer){
                this._onDecodeComplete(buffer);
            }
            else{
                var request = new XMLHttpRequest();
                request.src = this.src;
                request.open('GET', this.src, true);
                request.responseType = 'arraybuffer';
                request.onload = this._onAudioEvent;
                request.onprogress = this._onAudioEvent;
                request.onerror = this._onAudioEvent;
                request.send();
            }
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
        if(!WebAudio._bufferCache[this.src]){
            WebAudio._bufferCache[this.src] = audioBuffer;
        }

        this._buffer = audioBuffer;
        this.loaded = true;
        this.duration = audioBuffer.duration;

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
     * @language=en
     * Play the audio. Restart playing the audio from the beginning if already playing.
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
     * @language=en
     * Pause (halt) playing the audio.
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
     * @language=en
     * Continue to play the audio.
     */
    resume: function(){
        if(!this.playing){
            this._doPlay();
        }
        return this;
    },

    /**
     * @language=en
     * Stop playing the audio.
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
     * @language=en
     * Set the volume.
     */
    setVolume: function(volume){
        if(this.volume != volume){
            this.volume = volume;
            this._gainNode.gain.value = volume;
        }
        return this;
    },

    /**
     * @language=en
     * Set mute mode.
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
         * @language=en
         * Does the browser support WebAudio.
         */
        isSupported: AudioContext != null,

        /**
         * @language=en
         * Does browser activate WebAudio already.
         */
        enabled: false,

        /**
         * @language=en
         * Activate WebAudio. Note: Require user action events to activate. Once activated, can play audio without user action events.
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
        },
        /**
         * The audio buffer caches.
         * @private
         * @type {Object}
         */
        _bufferCache:{},
        /**
         * @language=en
         * Clear the audio buffer cache.
         * @param  {String} url audio's url. if url is none, it will clear all buffer.
         */
        clearBufferCache:function(url){
            if(url){
                this._bufferCache[url] = null;
            }
            else{
                this._bufferCache = {};
            }
        }
    }
});

})();
window.Hilo.WebAudio = WebAudio;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var HTMLAudio = window.Hilo.HTMLAudio;
var WebAudio = window.Hilo.WebAudio;
var util = window.Hilo.util;


/**
 * @language=en
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * demo:
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
 * @class Audio playing manager.
 * @static
 * @module hilo/media/WebSound
 * @requires hilo/media/HTMLAudio
 * @requires hilo/media/WebAudio
 * @requires hilo/util/util
 */
var WebSound = {
    _audios: {},

    /**
     * @language=en
     * Activate audio function. Note: Require user action events to activate. Currently support WebAudio.
     */
    enableAudio: function(){
        if(WebAudio.isSupported){
            WebAudio.enable();
        }
    },

    /**
     * @language=en
     * Get audio element. Default use WebAudio if supported.
     * @param {String|Object} source If String, it's the source of the audio; If Object, it should contains a src property.
     * @param {Boolean} [preferWebAudio=true] Whether or not to use WebAudio first, default is true.
     * @returns {WebAudio|HTMLAudio} Audio playing instance.
     */
    getAudio: function(source, preferWebAudio){
        if(preferWebAudio === undefined){
            preferWebAudio = true;
        }

        source = this._normalizeSource(source);
        var audio = this._audios[source.src];
        if(!audio){
            if(preferWebAudio && WebAudio.isSupported){
                audio = new WebAudio(source);
            }else if(HTMLAudio.isSupported){
                audio = new HTMLAudio(source);
            }
            this._audios[source.src] = audio;
        }

        return audio;
    },

    /**
     * @language=en
     * Remove audio element.
     * @param {String|Object} source If String, it's the source of the audio; If Object, it should contains a src property.
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
     * @language=en
     * @private
     */
    _normalizeSource: function(source){
        var result = {};
        if(typeof source === 'string') result = {src:source};
        else util.copy(result, source);
        return result;
    }

};
window.Hilo.WebSound = WebSound;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Camera.
 * @param {Object} properties The properties to create a view object, contains all writeable props of this class
 * @module hilo/game/Camera
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Number} width The width of the camera.
 * @property {Number} height The height of the camera.
 * @property {Object} scroll The scrolling value of the camera {x:0, y:0}.
 * @property {View} target The target that the camera follow.
 * @property {Array} bounds The rect area where camera is allowed to move [x, y, width, height].
 * @property {Array} deadzone The rect area where camera isn't allowed to move[ x, y, width, height].
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

        util.copy(this, properties);
    },
    /**
     * @language=en
     * update.
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
     * @language=en
     * Follow the target.
     * @param {Object} target The target that the camera follow. It must has x and y properties.
     * @param {Array} deadzone The rect area where camera isn't allowed to move[ x, y, width, height].
    */
    follow:function(target, deadzone){
        this.target = target;
        if(deadzone !== undefined){
            this.deadzone = deadzone;
        }
        this.tick();
    }
});

window.Hilo.Camera = Camera;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var util = window.Hilo.util;


/**
 * @language=en
 * @class Camera3d is a pseudo-3d camera.
 * @module hilo/game/Camera3d
 * @requires hilo/core/Class
 * @requires hilo/util/util
 * @property {Number} fv The distance of the fov(The distance between eyes and the Z plane，it determines the scale ratio of the 3d object).
 * @property {Number} fx The x position of the screen viewpoint(The distance between the screen viewpoint and the screen left top corner on the x axis).
 * @property {Number} fy The y position of the screen viewpoint(The distance between the screen viewpoint and the screen left top corner on the y axis).
 * @property {Object} stage The 3d object's container, it can be stage or container.It is required if you need to sort the 3d object by z axis.
 * @property {Number} x The x position.
 * @property {Number} y The y position.
 * @property {Number} z The z position.
 * @property {Number} rotationX The x rotation.
 * @property {Number} rotationY The y rotation.
 * @property {Number} rotationZ The z rotation.
 */
var Camera3d = (function(){

	var degtorad = Math.PI / 180;

	//Rotate the axis.
	function rotateX(x, y, z, ca, sa) {//rotate x
		return {
			x: x,
			y: y * ca - z * sa,
			z: y * sa + z * ca
		};
	}
	function rotateY(x, y, z, ca, sa) {//rotate y
		return {
			x: x * ca - z * sa,
			y: y,
			z: x * sa + z * ca
		};
	}
	function rotateZ(x, y, z, ca, sa) {//rotate z
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

        	util.copy(this, properties);
		},

	    /**
         * @language=en
         * Translate the camera，used for Zoomin/out feature.
	     * @param {Number} x The x position.
	     * @param {Number} y The y position.
	     * @param {Number} z The z position.
	     */
		translate : function(x,y,z){
			this.tx = x;
			this.ty = y;
			this.tz = z;
		},

	    /**
         * @language=en
         * Rotate by the x axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateX : function(angle){
			this.rotationX = angle;
		},

	    /**
         * @language=en
         * Rotate by the y axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateY : function(angle){
			this.rotationY = angle;
		},

	    /**
         * @language=en
         * Rotate by the z axis.
	     * @param {Number} angle The rotate degree.
	     */
		rotateZ : function(angle){
			this.rotationZ = angle;
		},

	    /**
         * @language=en
         * Project the 3d point to 2d point.
	     * @param {object} vector3D The 3d position, it must have x, y and z properties.
	     * @param {View} view The view related to the 3d position.It'll be auto translated by the 3d position.
         * @returns {Object} The 2d object include z and scale properties, e.g.:{x:x, y:y, z:z, scale}
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
				dz = vector3D.z - this.z;

			// 旋转矩阵变换
			var vector = rotateZ(dx, dy, dz, cosZ, sinZ);
			vector = rotateY(vector.x, vector.y, vector.z, cosY, sinY);
			vector = rotateX(vector.x, vector.y, vector.z, cosX, sinX);

			// 最后的仿射矩阵变换
			if(this.tx) vector.x -= this.tx;
			if(this.ty) vector.y -= this.ty;
			if(this.tz) vector.z -= this.tz;

			var	perspective = this.fv / (this.fv + vector.z),
				_x = vector.x * perspective,
				_y = -vector.y * perspective;

            var result = {
                x : _x + this.fx,
                y : _y + this.fy,
                z : -vector.z,
                scale : perspective
            };

			if(view){
                view.x = result.x;
                view.y = result.y;
                view.z = result.z;
                view.scaleX = result.scale;
                view.scaleY = result.scale;
			}

            return result;
		},

	    /**
         * @language=en
         * Sort by z axis.
	     */
		sortZ : function(){
			this.stage.children.sort(function(view_a, view_b){
                return view_a.z > view_b.z;
            });
		},

	    /**
         * @language=en
         * Used for the ticker.
	     */
		tick : function(){
			this.sortZ();
		}

	});

	return Camera3d;

})();
window.Hilo.Camera3d = Camera3d;
})(window);
/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var View = window.Hilo.View;
var Container = window.Hilo.Container;
var Drawable = window.Hilo.Drawable;
var util = window.Hilo.util;


/**
 * @language=en
 * <iframe src='../../../examples/ParticleSystem.html?noHeader' width = '550' height = '400' scrolling='no'></iframe>
 * <br/>
 * @class ParticleSystem A particle system.
 * @augments Container
 * @module hilo/game/ParticleSystem
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/view/View
 * @requires hilo/view/Container
 * @requires hilo/view/Drawable
 * @requires hilo/util/util
 * @property {Number} [emitTime=0.2] Emit time interval(in second).
 * @property {Number} [emitTimeVar=0] Emit time interval variances.
 * @property {Number} [emitNum=10] Emit number.
 * @property {Number} [emitNumVar=0] Emit number variances.
 * @property {Number} [emitterX=0] The emitter x position.
 * @property {Number} [emitterY=0] The emitter y position.
 * @property {Number} [totalTime=Infinity] Total time.
 * @property {Number} [gx=0] The gravity x value.
 * @property {Number} [gy=0] The gravity y value.
 * @param {Object} properties properties The properties to create a view object, contains all writeable props of this class
 * @param {Object} properties.particle The config of particle.
 * @param {Number} [properties.particle.x=0] The x position.
 * @param {Number} [properties.particle.y=0] The y position
 * @param {Number} [properties.particle.vx=0] The x velocity.
 * @param {Number} [properties.particle.vy=0] The y velocity.
 * @param {Number} [properties.particle.ax=0] The x acceleration.
 * @param {Number} [properties.particle.ay=0] The y acceleration.
 * @param {Number} [properties.particle.life=1] The time particle lives(in second).
 * @param {Number} [properties.particle.alpha=1] The alpha.
 * @param {Number} [properties.particle.alphaV=0] The alpha decline rate.
 * @param {Number} [properties.particle.scale=1] The scale.
 * @param {Number} [properties.particle.scaleV=0] The scale decline rate.
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
        constructor:function(properties){
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
         * @language=en
         * Reset the properties.
         * @param {Object} cfg
        */
        reset: function(cfg) {
            util.copy(this, cfg);
            this.particle.system = this;
            if(this.totalTime <= 0){
                this.totalTime = Infinity;
            }
        },
        /**
         * @language=en
         * 更新
         * @param {Number} dt delta time(in milliseconds)
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
         * @language=en
         * Emit particles.
        */
        _emit: function() {
            var num = getRandomValue(this.emitNum, this.emitNumVar)>>0;
            for (var i = 0; i < num; i++) {
                this.addChild(Particle.create(this.particle));
            }
        },
        /**
         * @language=en
         * Start emit particles.
        */
        start: function() {
            this.stop(true);
            this._currentRunTime = 0;
            this._totalRunTime = 0;
            this._isRun = true;
            this._emitTime = getRandomValue(this.emitTime, this.emitTimeVar);
        },
        /**
         * @language=en
         * Stop emit particles.
         * @param {Boolean} clear Whether or not clear all the particles.
        */
        stop: function(clear) {
            this._isRun = false;
            if (clear) {
                for (var i = this.children.length - 1; i >= 0; i--) {
                    this.children[i].destroy();
                }
            }
        }
    });

    /**
     * @language=en
     * @class 粒子
     * @inner
     * @param {Number} vx The x velocity.
     * @param {Number} vy The y velocity.
     * @param {Number} ax The x acceleration.
     * @param {Number} ay The y acceleration.
     * @param {Number} scaleV The scale decline rate.
     * @param {Number} alphaV The alpha decline rate.
     * @param {Number} rotationV The rotate speed.
     * @param {Number} life The time particle lives(in seconds)
    */
    var Particle = Class.create({
        Extends:View,
        constructor:function(properties){
            this.id = this.id || properties.id || Hilo.getUid("Particle");
            Particle.superclass.constructor.call(this, properties);
            this.init(properties);
        },
        /**
         * @language=en
         * Update the particle.
        */
        onUpdate: function(dt) {
            dt *= .001;
            if(this._died){
                return false;
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
            if (this._time >= this.life || this.alpha <= 0) {
                this.destroy();
                return false;
            }
        },
        /**
         * @language=en
         * Set the image of particle.
        */
        setImage: function(img, frame) {
            this.drawable = this.drawable||new Drawable();
            frame = frame || [0, 0, img.width, img.height];

            this.width = frame[2];
            this.height = frame[3];
            this.drawable.rect = frame;
            this.drawable.image = img;
        },
        /**
         * @language=en
         * Destroy the particle.
        */
        destroy: function() {
            this._died = true;
            this.alpha = 0;
            this.removeFromParent();
            diedParticles.push(this);
        },
        /**
         * @language=en
         * Init the particle.
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
             * @language=en
             * Create the particle.
             * @param {Object} cfg The config of particle.
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

    /**
     * Get the random value.
     * @private
     * @param  {Number} value     The value.
     * @param  {Number} variances The variances.
     * @return {Number}
     */
    function getRandomValue(value, variances){
        return variances ? value + (Math.random() - .5) * 2 * variances : value;
    }

    return ParticleSystem;
})();
window.Hilo.ParticleSystem = ParticleSystem;
})(window);