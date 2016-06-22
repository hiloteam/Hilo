var utils = {
    loadScript:function(arr, callback){
        arr = arr.forEach?arr:[arr];
        var loadNum = arr.length;
        arr.forEach(function(src){
            var scriptElem = document.createElement('script');
            scriptElem.onload = onload;
            scriptElem.src = src;
            document.body.appendChild(scriptElem);
        });

        function onload(){
            loadNum --;
            if(loadNum === 0){
                callback && callback();
            }
        }
    },
    loadRes:function(textureImage, textureJSON, skeletonJSON, callback){
        var that = this;
        var loadNum = 2;
        var onload = function(){
            loadNum --;
            if(loadNum === 0){
                callback && callback(img, textureData, skeletonData);
            }
        };

        var img = new Image;
        img.onload = onload;
        img.src = textureImage;

        this.loadScript([textureJSON, skeletonJSON], onload);
    },
    getUrlKey:function(){
        var that = this;
        if(this.keys){
            return this.keys;
        }

        var search = location.search.slice(1);
        this.keys = {};
        if(search){
            var arr = search.split('&');
            arr.forEach(function(kv){
                var kvs = kv.split('=');
                if(kvs.length === 2){
                    that.keys[kvs[0]] = kvs[1];
                }
            });
        }
        this.keys.anim = this.keys.anim||'dragon';

        return this.keys;
    },
    setUrlKey:function(){
        var search = '?';
        for(var k in this.keys){
            search += k + '=' + this.keys[k] + '&';
        }
        location.search = search.slice(0, -1);
    }
};