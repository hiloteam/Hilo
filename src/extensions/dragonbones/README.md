# DragonBones for Hilo
* This a Hilo version of [DragonBones](http://www.egret.com/products/dragonbones.html).

## DEMO
* [demos](http://hiloteam.github.io/Hilo/src/extensions/dragonbones/demo/index.html)
* [dragon](http://hiloteam.github.io/Hilo/src/extensions/dragonbones/demo/dragon.html)

## Usage
```
//create factory
var dragonbonesFactory = new dragonBones.HiloFactory();

/**
 * add texture data and skeleton data
 * textureImg is a load completed Image
 * textureData is texture json data
 * skeletonData is skeleton json data
 */
dragonbonesFactory.addTextureAtlas(new dragonBones.TextureAtlas(textureImg, textureData));
dragonbonesFactory.addDragonBonesData(dragonBones.DataParser.parseDragonBonesData(skeletonData));

//create armature
var armature = dragonbonesFactory.buildArmature(skeletonData.armature[0].name);

//play
armature.animation.gotoAndPlay('walk');

//add armature to clock
dragonBones.WorldClock.clock.add(armature);

//you need to run dragonBones.WorldClock like this to run the armature
var ticker = new Hilo.Ticker(60);
ticker.addTick(dragonbones);

//init stage
var stage = new Hilo.Stage({
    container:document.body,
    width:innerWidth,
    height:innerHeight
});
ticker.addTick(stage);

stage.addChild(armature.getDisplay());
```

* Check out [dragon demo](http://hiloteam.github.io/Hilo/src/extensions/dragonbones/demo/dragon.html) for a complete example.
* Check [official tutorial](http://edn.egret.com/cn/docs/page/392) for more info.