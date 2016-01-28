/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */
 
//TODO: 超时timeout，失败重连次数maxTries，更多的下载器Loader，队列暂停恢复等。

/**
 * @class LoadQueue是一个队列下载工具。
 * @param {Object} source 要下载的资源。可以是单个资源对象或多个资源的数组。
 * @module hilo/loader/LoadQueue
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/loader/ImageLoader
 * @requires hilo/loader/ScriptLoader
 * @property {Int} maxConnections 同时下载的最大连接数。默认为2。
 */
var LoadQueue = Class.create(/** @lends LoadQueue.prototype */{
    Mixes: EventMixin,
    constructor: function(source){
        this._source = [];
        this.add(source);
    },

    maxConnections: 2, //TODO: 应该是每个host的最大连接数。

    _source: null,
    _loaded: 0,
    _connections: 0,
    _currentIndex: -1,

    /**
     * 增加要下载的资源。可以是单个资源对象或多个资源的数组。
     * @param {Object|Array} source 资源对象或资源对象数组。每个资源对象包含以下属性：
     * <ul>
     * <li><b>id</b> - 资源的唯一标识符。可用于从下载队列获取目标资源。</li>
     * <li><b>src</b> - 资源的地址url。</li>
     * <li><b>type</b> - 指定资源的类型。默认会根据资源文件的后缀来自动判断类型，不同的资源类型会使用不同的加载器来加载资源。</li>
     * <li><b>loader</b> - 指定资源的加载器。默认会根据资源类型来自动选择加载器，若指定loader，则会使用指定的loader来加载资源。</li>
     * <li><b>noCache</b> - 指示加载资源时是否增加时间标签以防止缓存。</li>
     * <li><b>size</b> - 资源对象的预计大小。可用于预估下载进度。</li>
     * </ul>
     * @returns {LoadQueue} 下载队列实例本身。
     */
    add: function(source){
        var me = this;
        if(source){
            source = source instanceof Array ? source : [source];
            me._source = me._source.concat(source);
        }
        return me;
    },

    /**
     * 根据id或src地址获取资源对象。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源对象。
     */
    get: function(id){
        if(id){
            var source = this._source;
            for(var i = 0; i < source.length; i++){
                var item = source[i];
                if(item.id === id || item.src === id){
                    return item;
                }
            }
        }
        return null;
    },

    /**
     * 根据id或src地址获取资源内容。
     * @param {String} id 指定资源的id或src。
     * @returns {Object} 资源内容。
     */
    getContent: function(id){
        var item = this.get(id);
        return item && item.content;
    },

    /**
     * 开始下载队列。
     * @returns {LoadQueue} 下载队列实例本身。
     */
    start: function(){
        var me = this;
        me._loadNext();
        return me;
    },

    /**
     * @private
     */
    _loadNext: function(){
        var me = this, source = me._source, len = source.length;

        //all items loaded
        if(me._loaded >= len){
            me.fire('complete');
            return;
        }

        if(me._currentIndex < len - 1 && me._connections < me.maxConnections){
            var index = ++me._currentIndex;
            var item = source[index];
            var loader = me._getLoader(item);

            if(loader){
                var onLoad = loader.onLoad, onError = loader.onError;

                loader.onLoad = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    var content = onLoad && onLoad.call(loader, e) || e.target;
                    me._onItemLoad(index, content);
                };
                loader.onError = function(e){
                    loader.onLoad = onLoad;
                    loader.onError = onError;
                    onError && onError.call(loader, e);
                    me._onItemError(index, e);
                };
                me._connections++;
            }

            me._loadNext();
            loader && loader.load(item);
        }
    },

    /**
     * @private
     */
    _getLoader: function(item){
        var me = this, loader = item.loader;
        if(loader) return loader;

        var type = item.type || getExtension(item.src);

        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                loader = new ImageLoader();
                break;
            case 'js':
            case 'jsonp':
                loader = new ScriptLoader();
                break;
        }

        return loader;
    },

    /**
     * @private
     */
    _onItemLoad: function(index, content){
        var me = this, item = me._source[index];
        item.loaded = true;
        item.content = content;
        me._connections--;
        me._loaded++;
        me.fire('load', item);
        me._loadNext();
    },

    /**
     * @private
     */
    _onItemError: function(index, e){
        var me = this, item = me._source[index];
        item.error = e;
        me._connections--;
        me._loaded++;
        me.fire('error', item);
        me._loadNext();
    },

    /**
     * 获取全部或已下载的资源的字节大小。
     * @param {Boolean} loaded 指示是已下载的资源还是全部资源。默认为全部。
     * @returns {Number} 指定资源的字节大小。
     */
    getSize: function(loaded){
        var size = 0, source = this._source;
        for(var i = 0; i < source.length; i++){
            var item = source[i];
            size += (loaded ? item.loaded && item.size : item.size) || 0;
        }
        return size;
    },

    /**
     * 获取已下载的资源数量。
     * @returns {Uint} 已下载的资源数量。
     */
    getLoaded: function(){
        return this._loaded;
    },

    /**
     * 获取所有资源的数量。
     * @returns {Uint} 所有资源的数量。
     */
    getTotal: function(){
        return this._source.length;
    }

});

/**
 * @private
 */
function getExtension(src){
    var extRegExp = /\/?[^/]+\.(\w+)(\?\S+)?$/i, match, extension;
    if(match = src.match(extRegExp)){
        extension = match[1].toLowerCase();
    }
    return extension || null;
}