var utils = {
    /**
     * 触发点击事件
     * @param  {Element} elem dom元素
     */
    click:function(elem){
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
            "click",
            true /* bubble */, true /* cancelable */,
            window, null,
            0, 0, 0, 0, /* coordinates */
            false, false, false, false, /* modifier keys */
            0 /*left*/, null
        );
        elem.dispatchEvent(ev);
    },
    /**
     * 与截图对比差异
     * @param  {[type]}   name  对比图名字
     * @param  {Function} done
     * @param  {Object} tolerantCfg 容错配置
     * @param  {Number} tolerantCfg.value 允许颜色最大的差值 默认为5
     * @param  {Number} tolerantCfg.num 允许错误像素点数量 默认为10
     * */
    diffWithScreenshot:function(name, done, tolerantCfg){
        var that = this;
        that.takeScreenshot(name, function(screenshotImg){
            if(screenshotImg){
                utils.loadImage('../expectScreenshot/' + name + '.png', function(specImg){
                    if(specImg){
                        var isSame = utils.diffImage(screenshotImg, specImg, tolerantCfg);
                        if(isSame){
                            done();
                        }
                        else{
                            done(new Error('diff image error:' + name));
                        }
                    }
                    else{
                        done();
                    }
                });
            }
            else{
                setTimeout(function(){
                    done();
                }, 100);
            }
        });
    },
    /**
     * 截屏
     * @param  {String} name 图片名
     * @param  {Function} callback 回调
     */
    takeScreenshot:function(name, callback) {
        var that = this;
        setTimeout(function(){
            _macaca_uitest.screenshot(name + '.png', function() {
              if (callback) {
                that.loadImage('../screenshot/' + name + '.png', callback);
              }
            });
        }, window._IS_TRAVIS?1000:100);
    },
    /**
     * 加载图片
     * @param  {String} src 图片地址
     * @param  {Function} callback 加载回调，成功会传image参数，失败传null
     */
    loadImage:function(src, callback){
        var img = new Image();
        img.onerror = function(){
            callback && callback(null);
        };
        img.onload = function(){
            callback && callback(img);
        };
        img.src = src;
    },
    /**
     * 对比图像是否相同
     * @param  {Image|String} img0
     * @param  {Image|String} img1
     * @param  {Object} tolerantCfg 容错配置
     * @param  {Number} tolerantCfg.value 允许颜色最大的差值 默认为5
     * @param  {Number} tolerantCfg.num 允许错误像素点数量 默认为10
     * @return {Boolean} 是否相同
     */
    diffImage:function(img0, img1, tolerantCfg){
        if(img0.width !== img1.width || img0.height !== img1.height){
            return false;
        }
        else{
            var imgData0 = this.getImageData(img0);
            var imgData1 = this.getImageData(img1);
            return this.diffImageData(imgData0, imgData1, tolerantCfg);
        }
    },
    /**
     * 对比图像数据是否相同
     * @param  {Array} imgData0
     * @param  {Array} imgData1
     * @param  {Object} tolerantCfg 容错配置
     * @param  {Number} tolerantCfg.value 允许颜色最大的差值 默认为5
     * @param  {Number} tolerantCfg.num 允许错误像素点数量 默认为10
     * @return {Boolean} 是否相同
     */
    diffImageData:function(imgData0, imgData1, tolerantCfg){
        tolerantCfg = tolerantCfg||{};
        var tolerantValue = tolerantCfg.value || 20;
        var tolerantNum = tolerantCfg.num || 20;

        var num = 0;
        for(var i = 0, l = imgData0.length;i < l;i += 4){
            for(var j = 0;j < 4;j ++){
                if(Math.abs(imgData0[i + j] - imgData1[i + j]) > tolerantValue){
                    num ++;
                    if(num > tolerantNum){
                        return false;
                    }
                    break;
                }
            }
        }
        return true;
    },
    /**
     * 获取图片数据
     * @param  {Image} img 图片
     * @return {Array} imageData
     */
    getImageData:function(img){
        this._cacheCanvas = this._cacheCanvas||document.createElement('canvas');
        var canvas = this._cacheCanvas;
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, img.width, img.height).data;
        return data;
    }
};

