describe('view', function() {
    var stage, ticker;
    var stageElem = document.getElementById('stage');
    beforeEach('init stage', function() {
        stage = new Hilo.Stage({
            container:stageElem,
            width:550,
            height:400
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
        var bmp;
        beforeEach('init bitmap', function(done){
            utils.loadImage('images/btn.png', function(img){
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

        it('transform & alpha', function(done){
            bmp.x = stage.width * .5;
            bmp.y = stage.height * .5;
            bmp.pivotX = bmp.width * .4;
            bmp.pivotY = bmp.height * .6;
            bmp.scaleX = 0.5;
            bmp.scaleY = -2;
            bmp.rotation = 30;
            bmp.alpha = 0.5;
            utils.diffWithScreenshot('Bitmap-transform-alpha', done);
        });

        it('setImage', function(done){
            utils.loadImage('images/fish.png', function(img){
                bmp.setImage(img, [0, 0, 174, 126]);
                utils.diffWithScreenshot('Bitmap-setImage', done);
            });
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
            stage.updateViewport().should.eql({left:10, top:20, width:550, height:400});
            stageElem.style.left = '';
            stageElem.style.marginTop = '';
        });

        it('resize', function(){
            stage.resize(400, 300);
            stage.viewport.should.eql({left:0, top:0, width:400, height:300});
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