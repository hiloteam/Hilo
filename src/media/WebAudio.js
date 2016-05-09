/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @language=en
 * @class WebAudio audio playing module. It provides a better way to play and control audio, use on iOS6+ platform.
 * Compatibility：iOS6+、Chrome33+、Firefox28+ supported，but all Android browsers do not support.
 * @param {Object} properties create object properties, include all writable properties of this class.
 * @module hilo/media/WebAudio
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
 * @class WebAudio声音播放模块。它具有更好的声音播放和控制能力，适合在iOS6+平台使用。
 * 兼容情况：iOS6+、Chrome33+、Firefox28+支持，但Android浏览器均不支持。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/media/WebAudio
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
var WebAudio = (function(){

var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = AudioContext ? new AudioContext() : null;

return Class.create(/** @lends WebAudio.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        Hilo.copy(this, properties, true);

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
    /**
     * @language=zh
     * @private 初始化
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
    /**
     * @language=zh
     * 加载音频文件。注意：我们使用XMLHttpRequest进行加载，因此需要注意跨域问题。
     */
    load: function(){
        if(!this._buffer){
            var request = new XMLHttpRequest();
            request.src = this.src;
            request.open('GET', this.src, true);
            request.responseType = 'arraybuffer';
            request.onload = this._onAudioEvent;
            request.onprogress = this._onAudioEvent;
            request.onerror = this._onAudioEvent;
            request.send();
            this._buffer = true;
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
     * @language=en
     * @private
     */
    /**
     * @language=zh
     * @private
     */
    _onDecodeComplete: function(audioBuffer){
        this._buffer = audioBuffer;
        this.loaded = true;
        this.duration = audioBuffer.duration;
        // console.log('onDecodeComplete:', audioBuffer.duration);
        this.fire('load');
        if(this.autoPlay) this._doPlay();
    },

    /**
     * @language=en
     * @private
     */
    /**
     * @language=zh
     * @private
     */
    _onDecodeError: function(){
        this.fire('error');
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
     * @language=en
     * @private
     */
    /**
     * @language=zh
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
    /**
     * @language=zh
     * 播放音频。如果正在播放，则会重新开始。
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
    /**
     * @language=zh
     * 暂停音频。
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
    /**
     * @language=zh
     * 设置音量。
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
    /**
     * @language=zh
     * 设置是否静音。
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
        /**
         * @language=zh
         * 浏览器是否支持WebAudio。
         */
        isSupported: AudioContext != null,

        /**
         * @language=en
         * Does browser activate WebAudio already.
         */
        /**
         * @language=zh
         * 浏览器是否已激活WebAudio。
         */
        enabled: false,

        /**
         * @language=en
         * Activate WebAudio. Note: Require user action events to activate. Once activated, can play audio without user action events.
         */
        /**
         * @language=zh
         * 激活WebAudio。注意：需用户事件触发此方法才有效。激活后，无需用户事件也可播放音频。
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
        }
    }
});

})();