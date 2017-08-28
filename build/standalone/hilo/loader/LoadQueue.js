/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Class = window.Hilo.Class;
var EventMixin = window.Hilo.EventMixin;
var ImageLoader = window.Hilo.ImageLoader;
var ScriptLoader = window.Hilo.ScriptLoader;


//TODO: 超时timeout，失败重连次数maxTries，更多的下载器Loader，队列暂停恢复等。

/**
 * @language=en
 * @class LoadQueue is a queue-like loader.
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @param {Object} source resource that need to be loaded,could be a single object or array resource.
 * @module hilo/loader/LoadQueue
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/loader/ImageLoader
 * @requires hilo/loader/ScriptLoader
 * @property {Int} maxConnections the limited concurrent connections. default value  2.
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
     * @language=en
     * Add desired resource,could be a single object or array resource.
     * @param {Object|Array} source ,a single object or array resource. Each resource contains properties like below:
     * <ul>
     * <li><b>id</b> - resource identifier</li>
     * <li><b>src</b> - resource url</li>
     * <li><b>type</b> - resource type. By default, we automatically identify resource by file suffix and choose the relevant loader for you</li>
     * <li><b>loader</b> - specified resource loader. If you specify this,we abandon choosing loader inside</li>
     * <li><b>noCache</b> - a tag that set on or off to prevent cache,implemented by adding timestamp inside</li>
     * <li><b>size</b> - predicted resource size, help calculating loading progress</li>
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
     * @language=en
     * get resource object by id or src
     * @param {String}  specified id or src
     * @returns {Object} resource object
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
     * @language=en
     * get resource object content  by id or src
     * @param {String} specified id or src
     * @returns {Object} resource object content
     */
    getContent: function(id){
        var item = this.get(id);
        return item && item.content;
    },

    /**
     * @language=en
     * start loading
     * @returns {LoadQueue} the loading instance
     */
    start: function(){
        var me = this;
        me._loadNext();
        return me;
    },

    /**
     * @language=en
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
     * @language=en
     * @private
     */
    _getLoader: function(item){
        var loader = item.loader;
        if(loader) return loader;

        var type = item.type || getExtension(item.src);

        switch(type){
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
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
     * @language=en
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
     * @language=en
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
     * @language=en
     *  get resource size, loaded or all.
     * @param {Boolean} identify loaded or all resource. default is false, return all resource size. when set true, return loaded resource size.
     * @returns {Number} resource size.
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
     * @language=en
     * get loaded resource count
     * @returns {Uint} loaded resource count
     */
    getLoaded: function(){
        return this._loaded;
    },

    /**
     * @language=en
     * get all resource count
     * @returns {Uint} all resource count
     */
    getTotal: function(){
        return this._source.length;
    }

});

/**
 * @language=en
 * @private
 */
function getExtension(src){
    var extRegExp = /\/?[^/]+\.(\w+)(\?\S+)?$/i, match, extension;
    if(match = src.match(extRegExp)){
        extension = match[1].toLowerCase();
    }
    return extension || null;
}
window.Hilo.LoadQueue = LoadQueue;
})(window);