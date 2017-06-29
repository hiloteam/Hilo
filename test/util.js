describe('util', function(){
    describe('Ticker', function(){
        var ticker, tickObj;
        beforeEach('init Ticker', function(){
            ticker = new Hilo.Ticker(60);
            tickObj = {
                tickNum:0,
                tick:function(){
                    this.tickNum ++;
                }
            };
        });

        afterEach('destroy Ticker', function(){
            ticker.stop();
        });

        it('addTick & removeTick', function(){
            ticker._tick();
            tickObj.tickNum.should.equal(0);

            //addTick
            ticker.addTick(tickObj);
            ticker._tick();
            tickObj.tickNum.should.equal(1);
            ticker._tick();
            tickObj.tickNum.should.equal(2);

            //removeTick
            ticker.removeTick(tickObj);
            ticker._tick();
            tickObj.tickNum.should.equal(2);
        });

        it('tick time', function(done){
            var startTime;
            ticker.addTick({
                tick:function(){
                    if(!startTime){
                        startTime = Date.now();
                    }
                    else{
                        try{
                            (Date.now() - startTime).should.be.within(11, 21);
                            done();
                        }
                        catch(e){
                            done(e);
                        }
                    }
                }
            });
            ticker.start();
        });
    });

    describe('TextureAtlas', function(){
        var fishImage;
        beforeEach('load image', function(done){
            utils.loadImage('images/fish.png', function(img){
                fishImage = img;
                done();
            });
        });

        it('new', function(){
            var texture = new Hilo.TextureAtlas({
                image: fishImage,
                width: 174,
                height: 1512,
                frames: {
                    frameWidth: 174,
                    frameHeight: 126,
                    numFrames: 12
                },
                sprites: {
                    fish: {from:0, to:7}
                }
            });

            var spriteFrames = texture.getSprite('fish');
            spriteFrames.length.should.equal(8);
            var firstFrame = spriteFrames[0], endFrame = spriteFrames[7];
            firstFrame.rect[1].should.equal(0);
            endFrame.rect[1].should.equal(882);
        });

        it('createSpriteFrames', function(){
            var spriteFrames = Hilo.TextureAtlas.createSpriteFrames("swim", "0-7", fishImage, 174, 126, true);

            spriteFrames.length.should.equal(8);
            var firstFrame = spriteFrames[0], endFrame = spriteFrames[7];
            firstFrame.name.should.equal('swim');
            endFrame.next.should.equal('swim');
            firstFrame.rect[1].should.equal(0);
            endFrame.rect[1].should.equal(882);
        });
    });

    describe('browser', function(){
        it('jsVendor', function(){
            Hilo.browser.jsVendor.should.be.String();
        });

        it('cssVendor', function(){
            Hilo.browser.cssVendor.should.be.String();
        });
    });

    describe('util', function(){
        it('copy', function(){
            Hilo.util.copy({a:'a', c:'c'}, {a:'new a', b:'b'}).should.eql({a:'new a', b:'b', c:'c'});
            Hilo.util.copy({a:'a', c:'c'}, {a:'new a', b:'b'}, true).should.eql({a:'new a', c:'c'});
        });
    });
});