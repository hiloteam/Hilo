/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class HTMLAudio is an audio playing module, which uses HTMLAudioElement to play audio.
 * Limits: iOS platform requires user action events to start playing, and many Android browser can only play one audio at a time.
 * @param {Object} properties create object properties, include all writable properties of this class.
 * @module hilo/media/HTMLAudio
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
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
/**
 * @language=zh
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
     * @language=en
     * Load audio file.
     */
    /**
     * @language=zh
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
     * @language=en
     * @private
     */
    /**
     * @language=zh
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
    /**
     * @language=zh
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
    /**
     * @language=zh
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
     * @language=en
     * Pause (halt) the currently playing audio.
     */
    /**
     * @language=zh
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
     * @language=en
     * Continue to play the audio.
     */
    /**
     * @language=zh
     * 恢复音频播放。
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
    /**
     * @language=zh
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
     * @language=en
     * Set the volume. Note: iOS devices cannot set volume.
     */
    /**
     * @language=zh
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
     * @language=en
     * Set mute mode. Note: iOS devices cannot set mute mode.
     */
    /**
     * @language=zh
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
         * @language=en
         * Does the browser supports HTMLAudio.
         */
        /**
         * @language=zh
         * 浏览器是否支持HTMLAudio。
         */
        isSupported: window.Audio !== null
    }

});