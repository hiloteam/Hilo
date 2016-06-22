var demo = {
    init:function(animName){
        var that = this;
        utils.loadRes(
            './data/' + animName + '/texture.png',
            './data/' + animName + '/texture.js',
            './data/' + animName + '/skeleton.js',
            function(textureImage, textureData, skeletonData){
                var width = 1200;
                var height = 900;
                var scale = 0.7;
                that.initArmature(textureImage, textureData, skeletonData);
                that.initForHilo(width, height, scale);
            }
        );
    },
    initArmature:function(textureImage, textureData, skeletonData){
        var dragonbonesFactory = this.dragonbonesFactory = new dragonBones.HiloFactory();
        dragonbonesFactory.addTextureAtlas(new dragonBones.TextureAtlas(textureImage, textureData));
        dragonbonesFactory.addDragonBonesData(dragonBones.DataParser.parseDragonBonesData(skeletonData));

        var armature = this.armature = dragonbonesFactory.buildArmature(skeletonData.armature[0].name);
        var armatureDisplay = this.armatureDisplay = armature.getDisplay();
        armatureDisplay.x = demo.pos[0];
        armatureDisplay.y = demo.pos[1];

        dragonBones.WorldClock.clock.add(armature);
        this.play();
    },
    initForHilo:function(gameWidth, gameHeight, scale){
        console.log('initForHilo');
        var stage = this.stage = new Hilo.Stage({
            renderType:'webgl',
            width:gameWidth,
            height:gameHeight,
            scaleX:scale,
            scaleY:scale,
            container:'animContainer'
        });

        stage.addChild(this.armatureDisplay);

        var ticker = new Hilo.Ticker(60);
        ticker.addTick(stage);
        ticker.addTick(dragonBones);
        ticker.start();
    },
    play:function(){
        this.armature.animation.gotoAndPlay(this.getNextAnimationName(), -1, -1, 0);
    },
    bindEvent:function(){
        var that = this;
        window.onclick = window.ontouchstart = function(){
            if(that.armature.animation._animationList.length > 1){
                that.play();
            }
        };
    },
    getNextAnimationName:function(){
        this._index = this._index||0;
        var list = this.armature.animation._animationList;
        return list[(this._index++)%list.length];
    }
};

demo.bindEvent();