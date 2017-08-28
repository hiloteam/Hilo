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