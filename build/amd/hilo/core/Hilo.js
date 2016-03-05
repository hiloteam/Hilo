/**
 * Hilo 1.0.0 for amd
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
define('hilo/core/Hilo', function(){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @namespace Hilo The underlying core set of methods.
 * @static
 * @module hilo/core/Hilo
 */
var Hilo = (function(){

var win = window, doc = document, docElem = doc.documentElement,
    uid = 0;

return {
    /**
     * Gets a globally unique id. Such as Stage1, Bitmap2 like.
     * @param {String} prefix Generated prefix id's.
     * @returns {String} Globally unique id.
     */
    getUid: function(prefix){
        var id = ++uid;
        if(prefix){
            var charCode = prefix.charCodeAt(prefix.length - 1);
            if (charCode >= 48 && charCode <= 57) prefix += "_"; // Add an underscore between 0-9
            return prefix + id;
        }
        return id;
    },

    /**
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
     * Simple shallow copy objects.
     * @param {Object} target Target object to copy.
     * @param {Object} source Source object to copy.
     * @param {Boolean} strict Indicates whether replication of undefined property, the default is false, i.e., undefined attributes are not copied.
     * @returns {Object} After copying the object.
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
     * Browser feature set includes:
     * <ul>
     * <li><b>jsVendor</b> - Browser vendors js CSS prefix values. For example: webkit.</li>
     * <li><b>cssVendor</b> - CSS browser vendors CSS prefix values. For example: -webkit-.</li>
     * <li><b>supportTransform</b> - Whether to support CSS Transform transformations.</li>
     * <li><b>supportTransform3D</b> - Whether to support CSS Transform 3D conversion.</li>
     * <li><b>supportStorage</b> - Whether to support the local storage localStorage.</li>
     * <li><b>supportTouch</b> - Whether to support the touch event.</li>
     * <li><b>supportCanvas</b> - Whether to support the canvas element.</li>
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
     * Event type enumeration objects include：
     * <ul>
     * <li><b>POINTER_START</b> - Mouse or touch start event. Correspondence touchstart or mousedown.</li>
     * <li><b>POINTER_MOVE</b> - Mouse or touch move event. Correspondence touchmove or mousemove.</li>
     * <li><b>POINTER_END</b> - Mouse or touch end event. Correspondence touchend or mouseup.</li>
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
     * Visual object alignment enumeration objects include:
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
     * Get DOM element content in the page display area.
     * @param {HTMLElement} elem DOM elements.
     * @returns {Object} Viewable area DOM elements. Format is：{left:0, top:0, width:100, height:100}.
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
     * Create a DOM element. You can specify properties and styles.
     * @param {String} type DOM element type to be created. For example: 'div'.
     * @param {Object} properties Specify properties and styles of the DOM element.
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
     * Gets a DOM element according to the parameter id. This method is equivalent to document.getElementById(id).
     * @param {String} id id to get the DOM element.
     * @returns {HTMLElement} A DOM element.
     */
    getElement: function(id){
        return doc.getElementById(id);
    },

    /**
     * Setting visual object DOM element CSS styles.
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
     * Generates visual object CSS style transformation.
     * @param {View} obj Specifies the CSS style to transform the visual object.
     * @returns {String} Generated CSS style string.
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

return Hilo;

});
