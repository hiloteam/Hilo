/**
 * Hilo 1.0.2 for commonjs
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
var Hilo = require('..\core\Hilo');
var HTMLAudio = require('./HTMLAudio');
var WebAudio = require('./WebAudio');



/**
 * @language=en
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * demo:
 * <pre>
 * var audio = WebSound.getAudio({
 *     src: 'test.mp3',
 *     loop: false,
 *     volume: 1
 * }).on('load', function(e){
 *     console.log('load');
 * }).on('end', function(e){
 *     console.log('end');
 * }).play();
 * </pre>
 * @class Audio playing manager.
 * @static
 * @module hilo/media/WebSound
 * @requires hilo/core/Hilo
 * @requires hilo/media/HTMLAudio
 * @requires hilo/media/WebAudio
 */
var WebSound = {
    _audios: {},

    /**
     * @language=en
     * Activate audio function. Note: Require user action events to activate. Currently support WebAudio.
     */
    enableAudio: function(){
        if(WebAudio.isSupported){
            WebAudio.enable();
        }
    },

    /**
     * @language=en
     * Get audio element. Use WebAudio if supported.
     * @param {String|Object} source If String, it's the source of the audio; If Object, it should contains a src property.
     * @returns {WebAudio|HTMLAudio} Audio playing instance.
     */
    getAudio: function(source){
        source = this._normalizeSource(source);
        var audio = this._audios[source.src];
        if(!audio){
            if(WebAudio.isSupported){
                audio = new WebAudio(source);
            }else if(HTMLAudio.isSupported){
                audio = new HTMLAudio(source);
            }
            this._audios[source.src] = audio;
        }

        return audio;
    },

    /**
     * @language=en
     * Remove audio element.
     * @param {String|Object} source If String, it's the source of the audio; If Object, it should contains a src property.
     */
    removeAudio: function(source){
        var src = typeof source === 'string' ? source : source.src;
        var audio = this._audios[src];
        if(audio){
            audio.stop();
            audio.off();
            this._audios[src] = null;
            delete this._audios[src];
        }
    },

    /**
     * @language=en
     * @private
     */
    _normalizeSource: function(source){
        var result = {};
        if(typeof source === 'string') result = {src:source};
        else Hilo.copy(result, source);
        return result;
    }

};

module.exports = WebSound;