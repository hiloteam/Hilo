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