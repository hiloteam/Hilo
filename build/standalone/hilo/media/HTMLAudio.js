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