describe('loader', function(){
    describe('ImageLoader', function(){
        it('load', function(done){
            var imageLoader = new Hilo.ImageLoader();
            var onLoad = imageLoader.onLoad;
            var isDone = false;

            var timeoutId = setTimeout(function(){
                isDone = true;
                done(new Error('onLoad not work'));
            }, 50);

            imageLoader.onLoad = function(img){
                if(isDone) return;
                clearTimeout(timeoutId);
                onLoad(img);
                try{
                    img.width.should.equal(256);
                    img.height.should.equal(128);
                    done();
                }
                catch(e){
                    done(e);
                }
            };
            imageLoader.load({
                src:'images/btn.png'
            });
        });
    });

    describe('ScriptLoader', function(){
        var scriptLoader, timeoutId, isDone;
        beforeEach(function(){
            isDone = false;
            scriptLoader = new Hilo.ScriptLoader();
        });

        afterEach(function(){
            isDone = true;
            clearTimeout(timeoutId);
        });

        it('load jsonp', function(done){
            var onLoad = scriptLoader.onLoad;
            timeoutId = setTimeout(function(){
                done(new Error('onLoad not work'));
            }, 5000);

            scriptLoader.onLoad = function(data){
                !isDone && done();
            };

            scriptLoader.load({
                src:'http://t.alicdn.com/t/gettime',
                type:'jsonp'
            });
        });

        it('load script', function(done){
            var onLoad = scriptLoader.onLoad;
            timeoutId = setTimeout(function(){
                done(new Error('onLoad not work'));
            }, 100);
            scriptLoader.onLoad = function(data){
                !isDone && done();
            };
            scriptLoader.load({
                src:'utils.js'
            });
        });
    });

    describe('LoadQueue', function(){
        it('start', function(done){
            var queue = new Hilo.LoadQueue();
            queue.maxConnections = 1;
            queue.add([
                {id:'btn', noCache:true, src:'images/btn.png', size:12},
                {id:'data', type:'jsonp', callback:'weekJSONP', src:'http://t.alicdn.com/t/gettime', size:13}
            ]);

            var loadedNum = 0;
            queue.getSize().should.equal(25);
            queue.getTotal().should.equal(2);

            queue.on('load', function(e){
                loadedNum ++;
                try{
                    queue.getLoaded().should.equal(loadedNum);
                }
                catch(e){
                    done(e);
                }
            }).on('complete', function(e){
                try{
                    queue.getContent('btn').should.instanceOf(Image);
                    queue.getContent('btn').width.should.equal(256);
                    queue.getContent('btn').height.should.equal(128);
                    done();
                }
                catch(e){
                    done(e);
                }
            });
            queue.start();
        });
    });
});