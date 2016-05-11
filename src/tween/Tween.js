/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

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
/**
 * @language=zh
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
     * @language=en
     * Set beginning properties and ending properties of tweening object.
     * @param {Object} fromProps Beginning properties of target tweening object.
     * @param {Object} toProps Ending properties of target tweening object.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
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
     * @language=en
     * Starting the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
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
     * @language=en
     * Stop the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
     * 停止缓动动画的播放。
     * @returns {Tween} Tween变换本身。可用于链式调用。
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
    /**
     * @language=zh
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
     * @language=en
     * Continue to play the tweening.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
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
     * @language=en
     * Tween jumps to some point.
     * @param {Number} time The time to jump to, range from 0 to duration.
     * @param {Boolean} pause Is paused.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
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
     * @language=en
     * Link next Tween. The beginning time of next Tween depends on the delay value. If delay is a string that begins with '+' or '-', next Tween will begin at (delay) ms after or before the current tween is ended. If delay is out of previous situation, next Tween will begin at (delay) ms after the beginning point of current Tween.
     * @param {Tween} tween Tween to link.
     * @returns {Tween} Current Tween, for chain calls.
     */
    /**
     * @language=zh
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
     * @language=en
     * Private render method inside Tween class.
     * @private
     */
    /**
     * @language=zh
     * Tween类的内部渲染方法。
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
    /**
     * @language=zh
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
         * @language=en
         * @private
         */
        /**
         * @language=zh
         * @private
         */
        _tweens: [],

        /**
         * @language=en
         * Update all Tween instances.
         * @returns {Object} Tween。
         */
        /**
         * @language=zh
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
         * @language=en
         * Add a Tween instance.
         * @param {Tween} tween Tween object to add.
         * @returns {Object} Tween。
         */
        /**
         * @language=zh
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
         * @language=en
         * Remove one Tween target.
         * @param {Tween|Object|Array} tweenOrTarget Tween object, target object or an array of object to remove
         * @returns {Object} Tween。
         */
        /**
         * @language=zh
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
         * @language=en
         * Remove all Tween instances.
         * @returns {Object} Tween。
         */
        /**
         * @language=zh
         * 删除所有Tween实例。
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
        /**
         * @language=zh
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
         * @language=en
         * Create a tween, make target object easing from current properties to ending properties.
         * @param {Object|Array} target Tweening target or tweening target array.
         * @param toProps Ending properties of target tweening object.
         * @param params Tweening parameters.
         * @returns {Tween|Array} An tween instance or an array of tween instance.
         */
        /**
         * @language=zh
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
         * @language=en
         * Create a tween, make target object easing from beginning properties to current properties.
         * @param {Object|Array} target Tweening target or tweening target array.
         * @param fromProps Beginning properties of target tweening object.
         * @param params Tweening parameters.
         * @returns {Tween|Array} An tween instance or an array of tween instance.
         */
        /**
         * @language=zh
         * 创建一个缓动动画，让目标对象从指定的起始属性变换到当前属性。
         * @param {Object|Array} target 缓动目标对象或缓动目标数组。
         * @param fromProps 缓动目标对象的初始属性。
         * @param params 缓动动画的参数。
         * @returns {Tween|Array} 一个Tween实例对象或Tween实例数组。
         */
        from: function(target, fromProps, params){
            return Tween.fromTo(target, fromProps, null, params);
        }
    }

});

})();
