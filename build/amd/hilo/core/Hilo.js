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

return Hilo;

});