/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var HTMLAudio = window.Hilo.HTMLAudio;
var WebAudio = window.Hilo.WebAudio;
var util = window.Hilo.util;


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
 * @requires hilo/media/HTMLAudio
 * @requires hilo/media/WebAudio
 * @requires hilo/util/util
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
     * Get audio element. Default use WebAudio if supported.
     * @param {String|Object} source If String, it's the source of the audio; If Object, it should contains a src property.
     * @param {Boolean} [preferWebAudio=true] Whether or not to use WebAudio first, default is true.
     * @returns {WebAudio|HTMLAudio} Audio playing instance.
     */
    getAudio: function(source, preferWebAudio){
        if(preferWebAudio === undefined){
            preferWebAudio = true;
        }

        source = this._normalizeSource(source);
        var audio = this._audios[source.src];
        if(!audio){
            if(preferWebAudio && WebAudio.isSupported){
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
        else util.copy(result, source);
        return result;
    }

};
window.Hilo.WebSound = WebSound;
})(window);