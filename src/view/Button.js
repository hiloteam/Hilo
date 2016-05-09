/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

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
 * @property {Object} upState The property of button 'up' state or collections of its drawable properties.
 * @property {Object} overState The property of button 'over' state or collections of its drawable properties.
 * @property {Object} downState The property of button 'down' state or collections of its drawable properties.
 * @property {Object} disabledState The property of button 'disabled' state or collections of its drawable properties.
 * @property {String} state the state name of button, could be one of Button.UP|OVER|DOWN|DISABLED, readonly!
 * @property {Boolean} enabled Is button enabled. default value is true, readonly!
 * @property {Boolean} useHandCursor If true, cursor over the button will become a pointer cursor, default value is true.
 */
/**
 * @language=zh
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
     * @language=en
     * Set whether the button is enabled.
     * @param {Boolean} enabled Show whether the button is enabled.
     * @returns {Button} Return the button itself.
     */
    /**
     * @language=zh
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
     * @language=en
     * Set the state of the button. Invoke inside the Button and may not be used.
     * @param {String} state New state of the button.
     * @returns {Button} Return the button itself.
     */
    /**
     * @language=zh
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
     * @language=en
     * overwrite
     * @private
     */
    /**
     * @language=zh
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
        /**
         * @language=zh
         * 按钮弹起状态的常量值，即：'up'。
         * @type String
         */
        UP: 'up',
        /**
         * @language=en
         * Statics value of Button's 'over' state.
         * @type String
         */
        /**
         * @language=zh
         * 按钮经过状态的常量值，即：'over'。
         * @type String
         */
        OVER: 'over',
        /**
         * @language=en
         * Statics value of Button's 'down' state.
         * @type String
         */
        /**
         * @language=zh
         * 按钮按下状态的常量值，即：'down'。
         * @type String
         */
        DOWN: 'down',
        /**
         * @language=en
         * Statics value of Button's 'disabled' state.
         * @type String
         */
        /**
         * @language=zh
         * 按钮不可用状态的常量值，即：'disabled'。
         * @type String
         */
        DISABLED: 'disabled'
    }
 });