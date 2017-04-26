var needTestRenderTypes = window._IS_TRAVIS?['canvas']:['canvas', 'webgl'];
needTestRenderTypes.forEach(function(stageRenderType){

describe('view:' + stageRenderType, function() {
    var stage, ticker;
    var stageElem = document.getElementById('stage');
    beforeEach('init stage', function() {
        stage = new Hilo.Stage({
            container:stageElem,
            renderType:stageRenderType,
            width:600,
            height:480
        });
        ticker = new Hilo.Ticker(60);
        ticker.addTick(stage);
        ticker.start();
    });

    afterEach('destroy stage', function() {
        ticker.removeTick(stage);
        ticker.stop();
        if(stage.drawable && stage.drawable.domElement && stage.drawable.domElement.parentNode){
            stage.drawable.domElement.parentNode.removeChild(stage.drawable.domElement);
        }
        else if(stage.canvas && stage.canvas.parentNode){
            stage.canvas.parentNode.removeChild(stage.canvas);
        }
        stage = null;
        ticker = null;
    });

    describe('Bitmap', function() {
        var bmp, btnImage;
        beforeEach('init bitmap', function(done){
            utils.loadImage('images/btn.png', function(img){
                btnImage = img;
                bmp = new Hilo.Bitmap({
                    image: img,
                    rect:[0, 64, 64, 64]
                }).addTo(stage);
                done();
            });
        });

        it('new', function(done){
            utils.diffWithScreenshot('Bitmap-new', done);
        });

        it('transform', function(done){
            bmp.x = stage.width * .5;
            bmp.y = stage.height * .5;
            bmp.pivotX = bmp.width * .4;
            bmp.pivotY = bmp.height * .6;
            bmp.scaleX = 0.5;
            bmp.scaleY = -2;
            bmp.rotation = 30;
            if(stageRenderType === 'dom'){
                utils.diffWithScreenshot('Bitmap-transform-dom', done);
            }
            else{
                utils.diffWithScreenshot('Bitmap-transform', done);
            }
        });

        it('alpha', function(done){
            bmp.x = stage.width * .5;
            bmp.y = stage.height * .5;
            bmp.alpha = 0.5;
            utils.diffWithScreenshot('Bitmap-alpha', done);
        });

        it('setImage', function(done){
            utils.loadImage('images/fish.png', function(img){
                bmp.setImage(img, [0, 0, 174, 126]);
                utils.diffWithScreenshot('Bitmap-setImage', done);
            });
        });

        it('new Bitmap and setImage', function(){
            var bmp = new Hilo.Bitmap();
            bmp.setImage(btnImage);
            bmp.width.should.equal(256);
            bmp.height.should.equal(128);
        });
    });

    describe('BitmapText', function() {
        var text;
        beforeEach('init bitmapText', function(done){
            utils.loadImage('images/num.png', function(textImage){
                text = new Hilo.BitmapText({
                    glyphs:Hilo.BitmapText.createGlyphs("0123456789 ", textImage),
                    y:0,
                    x:stage.width * .5,
                    letterSpacing:10
                });
                text.setText('967542 2');
                stage.addChild(text);
                done();
            });
        });

        it('setText', function(done){
            text.setText('1234567');
            utils.diffWithScreenshot('BitmapText-new', done);
        });

        it('textAlign center', function(done){
            text.setTextAlign('center');
            utils.diffWithScreenshot('BitmapText-center', done);
        });

        it('textAlign left', function(done){
            text.setTextAlign('left');
            utils.diffWithScreenshot('BitmapText-left', done);
        });

        it('textAlign right', function(done){
            text.setTextAlign('right');
            utils.diffWithScreenshot('BitmapText-right', done);
        });
    });

    describe('Button', function() {
        var button;
        beforeEach('init button', function(){
            button = new Hilo.Button({
                image: 'images/btn.png',
                width: 64,
                height: 64,
                upState: {rect:[0, 0, 64, 64]},
                overState: {rect:[64, 0, 64, 64]},
                downState: {rect:[128, 0, 64, 64]},
                disabledState: {rect:[192, 0, 64, 64]},
            }).addTo(stage);
        });

        it('upState', function(done){
            button.fire('mouseout');
            button.state.should.equal(Hilo.Button.UP);
            utils.diffWithScreenshot('Button-upState', done);
        });

        it('overState', function(done){
            button.fire('mouseover');
            button.state.should.equal(Hilo.Button.OVER);
            utils.diffWithScreenshot('Button-overState', done);
        });

        it('downState', function(done){
            button.fire('mousedown');
            button.state.should.equal(Hilo.Button.DOWN);
            utils.diffWithScreenshot('Button-downState', done);
        });

        it('disabledState', function(done){
            button.setEnabled(false);
            button.state.should.equal(Hilo.Button.DISABLED);
            button.pointerEnabled.should.be.false();
            utils.diffWithScreenshot('Button-disabledState', done);
        });
    });

    describe('Container', function() {
        var container;
        beforeEach('init container', function(){
            container = new Hilo.Container();
        });

        it('getNumChildren', function(){
            container.getNumChildren().should.equal(0);
            container.addChild(new Hilo.View);
            container.getNumChildren().should.equal(1);
        });

        it('addChildAt & removeChildAt & setChildIndex & getChildIndex', function(){
            var v1 = new Hilo.View;
            var v2 = new Hilo.View;
            var v3 = new Hilo.View;

            //container:v1
            container.addChildAt(v1, 0);
            container.getChildIndex(v1).should.equal(0);

            //container:v1 v2
            container.addChildAt(v2, 1);
            container.getChildIndex(v2).should.equal(1);

            //container:v1 v3 v2
            container.addChildAt(v3, 1);
            container.getChildIndex(v3).should.equal(1);

            //container:v3 v2 v1
            container.setChildIndex(v1, 2);
            container.getChildIndex(v1).should.equal(2);

            //container:v1 v3 v2
            container.setChildIndex(v1, 0);
            container.getChildIndex(v1).should.equal(0);

            //container:v1 v2
            container.removeChildAt(1);
            (v3.parent == null).should.be.true();

            //container:v2
            container.removeChildAt(0);
            (v1.parent == null).should.be.true();

            //container
            container.removeChildAt(0);
            (v2.parent == null).should.be.true();
        });

        it('removeAllChildren', function(){
            container.addChild(new Hilo.View);
            container.addChild(new Hilo.View);
            container.addChild(new Hilo.View);

            container.getNumChildren().should.equal(3);
            container.removeAllChildren();
            container.getNumChildren().should.equal(0);
        });

        it('getChildById & removeChildById', function(){
            var v = new Hilo.View({id:'view1'});
            container.addChild(v);
            container.getChildById('view1').should.equal(v);
            container.removeChildById('view1');
            (v.parent == null).should.be.true();
        });

        it('swapChildren & swapChildrenAt & sortChildren', function(){
            container.addChild(new Hilo.View({id:'v1', x:3}));
            container.addChild(new Hilo.View({id:'v2', x:2}));
            container.addChild(new Hilo.View({id:'v3', x:1}));

            //container:v3 v2 v1
            container.swapChildren(container.getChildById('v1'), container.getChildById('v3'));
            container.children[0].id.should.equal('v3');
            container.children[2].id.should.equal('v1');

            //container:v2 v3 v3
            container.swapChildrenAt(0, 1);
            container.children[0].id.should.equal('v2');
            container.children[1].id.should.equal('v3');

            //container:v1 v2 v3
            container.sortChildren('x');
            container.children[0].id.should.equal('v1');
            container.children[1].id.should.equal('v2');
            container.children[2].id.should.equal('v3');

        });

        it('contains', function(){
            var v = new Hilo.View;
            container.contains(v).should.be.false();
            container.addChild(v);
            container.contains(v).should.be.true();
        });

        it('getViewAtPoint', function(){
            var view  = new Hilo.View({
                x:10,
                y:20,
                width:200,
                height:200,
                pointerEnabled:false
            });
            container.addChild(view);

            container.getViewAtPoint(15, 20).should.equal(view);
            (container.getViewAtPoint(15, 20, false, false, true) == null).should.be.true();
        });
    });

    describe('DOMElement', function() {
        it('new', function(done){
            var yellowRect = new Hilo.DOMElement({
                id: 'yellowRect',
                element: Hilo.createElement('div', {
                    style: {
                        backgroundColor: '#ff0',
                        position: 'absolute'
                    }
                }),
                width: 100,
                height: 100,
                x: 80,
                y: 100
            }).addTo(stage);

            utils.diffWithScreenshot('DOMElement-new', function(){
                yellowRect.removeFromParent();
                done();
            });
        });
    });

    describe('Drawable', function() {
        it('isDrawable', function(){
            Hilo.Drawable.isDrawable(new Image).should.be.true();
            Hilo.Drawable.isDrawable(document.createElement('canvas')).should.be.true();
            Hilo.Drawable.isDrawable(document.createElement('video')).should.be.true();
            Hilo.Drawable.isDrawable(document.createElement('div')).should.be.false();
        });

        var btnImg;
        before('load image', function(done){
            utils.loadImage('images/btn.png', function(img){
                btnImg = img;
                done();
            });
        });
        it('drawable rect should equal image rect', function(){
            var drawable = new Hilo.Drawable(btnImg);
            drawable.rect.should.eql([0, 0, 256, 128]);

            drawable = new Hilo.Drawable({
                image:btnImg
            });
            drawable.rect.should.eql([0, 0, 256, 128]);
        });

        it('when image is string should load image', function(done){
            var drawable = new Hilo.Drawable({
                image:'images/btn.png'
            });
            //hack for load image callback
            setTimeout(function(){
                try{
                    drawable.rect.should.eql([0, 0, 256, 128]);
                    done();
                }
                catch(e){
                    done(e);
                }
            }, 500);
        });
    });

    describe('Graphics', function() {
        var graphics;
        beforeEach('init graphics', function() {
            graphics = new Hilo.Graphics({
                width:stage.width,
                height:stage.height
            });
            stage.addChild(graphics);
        });

        it('drawRect', function(done){
            graphics.lineStyle(1, "#009898").beginFill("#0ff").drawRect(0.5, 0.5, 99, 99).endFill();
            utils.diffWithScreenshot('Graphics-drawRect', done);
        });

        it('drawRoundRect', function(done){
            graphics.lineStyle(10, "#009898").beginFill("#0ff").drawRoundRect(5, 5, 90, 90, 20).endFill();
            utils.diffWithScreenshot('Graphics-drawRoundRect', done);
        });

        it('drawCircle & beginRadialGradientFill', function(done){
            graphics.lineStyle(2, "#009898").beginRadialGradientFill(50, 50, 0, 50, 50, 50, ["#fff", "#4ffcfc"], [0, 1]).drawCircle(2, 2, 48).endFill();
            utils.diffWithScreenshot('Graphics-circle-beginRadialGradientFill', done);
        });

        it('drawEllipse', function(done){
            graphics.lineStyle(5, "#009898").beginFill("#0ff").drawEllipse(5, 5, 90, 50).endFill();
            utils.diffWithScreenshot('Graphics-drawEllipse', done);
        });

        it('drawRect & beginLinearGradientFill', function(done){
            graphics.lineStyle(2, "#009898").beginLinearGradientFill(0, 0, 60, 0, ["#fff", "#4ffcfc"], [0.3, 1]).drawRect(2, 2, 66, 86).endFill();
            utils.diffWithScreenshot('Graphics-drawRect-beginLinearGradientFill', done);
        });

        it('drawSVGPath', function(done){
            var svgPath = "M53 84 C53 84 51 84 51 84 C51 89 53 94 56 94 C64 94 71 89 71 84 C71 72 64 64 56 64 C42 64 31 72 31 84 C31 100 42 114 56 114 C75 114 91 100 91 84 C91 61 75 44 56 44 C31 44 11 61 11 84 C11 111 31 134 56 134 C86 134 111 111 111 84 C111 50 86 24 56 24";
            graphics.lineStyle(4, "#02d1d1").drawSVGPath(svgPath).closePath().endFill();
            utils.diffWithScreenshot('Graphics-drawSVGPath', done);
        });

        !window._IS_TRAVIS && it('drawSVGPath2', function(done){
            var svgPaths = ['M357.5,249.9c-1.8 -2.4-9,-7.5-18.7,3.9c-9.7,11.3-2.6,17.2-2.6,17.2s6.2,5.4,17-2.7 C364.1,260.2,359.3,252.3,357.5,249.9z M83.2,324.8l69.8-6.9c6.8-0.6,37.5,0.5,44.2,1.6l16.2,2.8l8.9-17.6c-80.7,8.4-145.2,0-145.2,0 C79.5,309.2,82,316.2,83.2,324.8zM347.6,183.9c0,0-27.5-0.3-58.4,17.5c-7.9,4.6-14.4,11.2-19.2,18.9 c-17.5,28.8-64.6,108.4-80.5,158.4c-19.7,61.9,53.4,30,74.1,21.6c0,0-74.5,29.5-44.5-39.4s63.3-135.5,83.4-150.9 S337.4,187.3,347.6,183.9zM96.2,216c0,0,36.2,4.4,66-3.4l1.9,4.5c0,0-104.8,176.9-106.6,190.8c0,0-14.6-3.9-36.4,8.2 c0,0,63.1-81.6,104.8-170c0,0,13.1-23.9-5.7-22.8c0,0-5.3,0-21.6,0.5L96.2,216z M453.5,365.4c0,0-135.6,114.4-51.9-38.7l17.1-26.6c0,0,166.2-114.7,147.7-184.6c0,0-15.4-8.1-46.8,15.2c-14.5,10.8-26.8,24.2-36.8,39.3c-25.5,38.7-92.2,140.9-118.8,192.4c0,0-131.1,114.1-39-38.3 c0,0,5.9-25.1-16,0c-21.9,25.1-33.8,52-37.5,66.4c-3.8,14.4,8.3,60,88.5-16.2c0,0-17.1,33.4,2.7,40.3c30.2,6.7,48.8,3.4,83.8-35.3 c0,0-10,24.4-0.6,31.9s40.6,16.2,80.6-60.6S478.5,324.1,453.5,365.4z M545.3,128.5c0,0,24.4,55.6-123.1,159.4 C422.2,287.9,506,134.1,545.3,128.5z M488.5,397.2c-5.6,4.5-11.8,6.7-16.6,7.8c-4.3,0.9-8.4-2.5-8-6.9c4.7-52.2,37.7-70,51.8-75.2 c3.1-1.1,6.2,1.4,5.8,4.6C517.8,360.5,503.3,385.3,488.5,397.2z', 'M10 10 H 90 V 90 H 10 L 10 10', 'M10 10 H 90 V 90 H 10Z', 'M10 10 h 80 v 80 h -80 Z', 'M10 10 C 20 20, 40 20, 50 10', 'M70 10 C 70 20, 120 20, 120 10', 'M130 10 C 120 20, 180 20, 170 10', 'M10 60 C 20 80, 40 80, 50 60', 'M70 60 C 70 80, 110 80, 110 60', 'M130 60 C 120 80, 180 80, 170 60', 'M10 110 C 20 140, 40 140, 50 110', 'M70 110 C 70 140, 110 140, 110 110', 'M130 110 C 120 140, 180 140, 170 110', 'M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80', 'M10 80 Q 95 10 180 80', 'M10 80 Q 52.5 10, 95 80 T 180 80'];
            var w = 100;
            var h = 40;
            svgPaths.forEach(function(svgPath, index){
                var x = (index-1) % 3 * w;
                var y = Math.floor((index-1) / 3) * h;
                var g = new Hilo.Graphics({width:300, height:300, x:x, y:y});
                if(index === 0){
                    g.width = 600;
                    g.height = 600;
                    g.x = g.y = 0;
                    g.beginFill("#eb6057", 1);
                }
                else{
                    g.lineStyle(3, "#69f");
                }
                g.drawSVGPath(svgPath).endFill().addTo(stage);
            });
            utils.diffWithScreenshot('Graphics-drawSVGPath2', done);
        });
    });

    describe('Sprite', function() {
        var atlas, sprite;
        beforeEach('init atlas', function(done){
            utils.loadImage('images/fish.png', function(img){
                atlas = new Hilo.TextureAtlas({
                    image: img,
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
                sprite = new Hilo.Sprite({
                    frames: atlas.getSprite('fish')
                });
                stage.addChild(sprite);
                done();
            });
        });

        it('goto frame 1 should work', function(done){
            sprite.goto(1, true);
            utils.diffWithScreenshot('Sprite-goto-frame1', done);
        });

        it('goto frame 7 should work', function(done){
            sprite.goto(7, true);
            utils.diffWithScreenshot('Sprite-goto-frame7', done);
        });
    });

    describe('Stage', function() {
        it('enableDOMEvent', function(done){
            stage.enableDOMEvent('click');

            var timeoutId = setTimeout(function(){
                done(new Error('stage.enableDOMEvent not work'));
            }, 100);

            stage.on('click', function(){
                clearTimeout(timeoutId);
                done();
            });
            utils.click(stage.canvas);
        });

        it('updateViewport', function(){
            stageElem.style.left = '10px';
            stageElem.style.marginTop = '20px';
            stage.updateViewport().should.eql({left:10, top:20, width:600, height:480});
            stageElem.style.left = '';
            stageElem.style.marginTop = '';
        });

        it('resize', function(){
            if(stageRenderType !== 'dom'){
                stage.canvas.width.should.equal(600);
                stage.canvas.height.should.equal(480);
                stage.canvas.style.width.should.equal('600px');
                stage.canvas.style.height.should.equal('480px');
                stage.viewport.should.eql({left:0, top:0, width:600, height:480});

                stage.resize(400, 300);
                stage.canvas.width.should.equal(400);
                stage.canvas.height.should.equal(300);
                stage.canvas.style.width.should.equal('400px');
                stage.canvas.style.height.should.equal('300px');
                stage.viewport.should.eql({left:0, top:0, width:400, height:300});

                stage.scaleX = 0.5;
                stage.scaleY = 2;
                stage.tick(0);
                stage.canvas.width.should.equal(400);
                stage.canvas.height.should.equal(300);
                stage.canvas.style.width.should.equal('200px');
                stage.canvas.style.height.should.equal('600px');
                stage.viewport.should.eql({left:0, top:0, width:200, height:600});

                stage.resize(300, 200);
                stage.canvas.width.should.equal(300);
                stage.canvas.height.should.equal(200);
                stage.canvas.style.width.should.equal('150px');
                stage.canvas.style.height.should.equal('400px');
                stage.viewport.should.eql({left:0, top:0, width:150, height:400});
            }
        });

        it('canvasRenderer', function(){
            var stage = new Hilo.Stage({
                container:document.body,
                renderType:'canvas'
            });
            stage.renderer.should.instanceOf(Hilo.CanvasRenderer);

            var stage = new Hilo.Stage({
                container:document.body,
                canvas:document.createElement('canvas')
            });
            stage.renderer.should.instanceOf(Hilo.CanvasRenderer);
        });

        it('domRenderer', function(){
            var stage = new Hilo.Stage({
                container:document.body,
                renderType:'dom'
            });
            stage.renderer.should.instanceOf(Hilo.DOMRenderer);

            var stage = new Hilo.Stage({
                container:document.body,
                canvas:document.createElement('div')
            });
            stage.renderer.should.instanceOf(Hilo.DOMRenderer);
        });

        it('webglRender', function(){
            var stage = new Hilo.Stage({
                container:document.createElement('div'),
                renderType:'webgl'
            });

            if(Hilo.WebGLRenderer.isSupport()){
                stage.renderer.should.instanceOf(Hilo.WebGLRenderer);
            }
            else{
                stage.renderer.should.instanceOf(Hilo.CanvasRenderer);
            }

            var stage = new Hilo.Stage({
                container:document.createElement('div'),
                renderType:'webgl'
            });

            if(Hilo.WebGLRenderer.isSupport()){
                stage.renderer.should.instanceOf(Hilo.WebGLRenderer);
            }
            else{
                stage.renderer.should.instanceOf(Hilo.CanvasRenderer);
            }
        });
    });

    describe('Text', function() {
        it('new', function(){
            var text = new Hilo.Text({
                font: '14px arial',
                text: 'hello world!',
                lineSpacing: 0,
                width: 250,
                height: 100,
                x: 40,
                y: 50
            }).addTo(stage);
            // utils.diffWithScreenshot('Text-new', done);
        });
    });

    describe('View', function() {
        var view;
        beforeEach(function() {
            view = new Hilo.View({
                width:600,
                height:300,
                scaleX:0.5,
                scaleY:0.2
            });
        });

        it('getStage', function() {
            stage.addChild(view);
            view.getStage().should.equal(stage);

            var container = new Hilo.Container();
            stage.addChild(container);
            container.addChild(view);
            view.getStage().should.equal(stage);

            view.removeFromParent();
            (view.getStage() === null).should.be.true();
        });

        it('getScaledWidth & getScaledHeight', function() {
            view.getScaledWidth().should.equal(300);
            view.getScaledHeight().should.equal(60);
        });

        it('addTo & removeFromParent', function(){
            var container = new Hilo.Container();
            for(var i = 0;i < 5;i ++){
                container.addChild(new Hilo.View);
            }

            view.addTo(container, 3);
            container.getChildIndex(view).should.equal(3);

            view.removeFromParent();
            container.getChildIndex(view).should.equal(-1);

            view.addTo(container);
            container.getChildIndex(view).should.equal(5);
        });

        it('getBounds', function(){
            stage.addChild(view);
            view.rotation = 30;
            var res = [{x:0, y:0},{x:260, y:150},{x:230, y:202},{x:-29, y:52}];
            res.width = 289;
            res.height = 202;
            res.x = -29;
            res.y = 0;
            view.getBounds().should.eql(res);

            view.rotation = -80;
            res = [{"x":0,"y":0},{"x":52,"y":-294},{"x":111,"y":-284},{"x":59,"y":10}];
            res.width = 111;
            res.height = 304;
            res.x = 0;
            res.y = -294;
            view.getBounds().should.eql(res);
        });

        it('getConcatenatedMatrix', function(){
            var container1 = new Hilo.Container({
                rotation:30,
                scaleX:0.5,
                scaleY:0.2,
                x:400,
                y:-100
            });

            var container2 = new Hilo.Container({
                rotation:60,
                scaleX:2,
                scaleY:-3,
                x:-200,
                y:300
            });

            view.rotation = -90;

            stage.addChild(container1);
            container1.addChild(container2);
            container2.addChild(view);

            view.getConcatenatedMatrix(container1).should.eql({"a":-1.299038105676658,"b":0.7500000000000002,"c":0.2000000000000001,"d":0.34641016151377546,"tx":-200,"ty":300});
            view.getConcatenatedMatrix(container2).should.eql({"a":3.061616997868383e-17,"b":-0.5,"c":0.2,"d":1.2246467991473533e-17,"tx":0,"ty":0});
            view.getConcatenatedMatrix(stage).should.eql({"a":-0.6375,"b":-0.19485571585149858,"c":0.05196152422706636,"d":0.11000000000000003,"tx":283.3974596215561,"ty":-98.03847577293367});
            view.getConcatenatedMatrix(stage).should.eql(view.getConcatenatedMatrix());
        });

        it('hitTestPoint', function(){

        });

        it('hitTestObject', function(){

        });
    });
});

});