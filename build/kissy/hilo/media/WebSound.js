/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/media/WebSound', function(S, Hilo, HTMLAudio, WebAudio){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
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
 * @class 声音播放管理器。
 * @static
 * @module hilo/media/WebSound
 * @requires hilo/core/Hilo
 * @requires hilo/media/HTMLAudio
 * @requires hilo/media/WebAudio
 */
var WebSound = {
    _audios: {},

    /**
     * 激活音频功能。注意：需用户事件触发此方法才有效。目前仅对WebAudio有效。
     */
    enableAudio: function(){
        if(WebAudio.isSupported){
            WebAudio.enable();
        }
    },

    /**
     * 获取音频对象。优先使用WebAudio。
     * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
     * @returns {WebAudio|HTMLAudio} 音频播放对象实例。
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
     * 删除音频对象。
     * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
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
     * @private
     */
    _normalizeSource: function(source){
        var result = {};
        if(typeof source === 'string') result = {src:source};
        else Hilo.copy(result, source);
        return result;
    }

};

return WebSound;

}, {
    requires: ['hilo/core/Hilo', 'hilo/media/HTMLAudio', 'hilo/media/WebAudio']
});