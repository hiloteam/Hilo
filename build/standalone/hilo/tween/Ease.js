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