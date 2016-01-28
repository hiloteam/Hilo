(function(){
    var display = dragonBones.use("display");
    var textures = dragonBones.use("textures");
    var factorys = dragonBones.use("factorys");

    function HiloDisplayBridge() {
    }
    HiloDisplayBridge.prototype.getVisible = function () {
        return this._display ? this._display.visible : false;
    };
    HiloDisplayBridge.prototype.setVisible = function (value) {
        if (this._display) {
            this._display.visible = value;
        }
    };

    HiloDisplayBridge.prototype.getDisplay = function () {
        return this._display;
    };
    HiloDisplayBridge.prototype.setDisplay = function (value) {
        if (this._display == value) {
            return;
        }
        if (this._display) {
            var parent = this._display.parent;
            if (parent) {
                var index = this._display.parent.getChildIndex(this._display);
            }
            this.removeDisplay();
        }
        this._display = value;
        this.addDisplay(parent, index);
    };

    HiloDisplayBridge.prototype.dispose = function () {
        this._display = null;
    };

    HiloDisplayBridge.prototype.updateTransform = function (matrix, transform) {
        this._display.x = matrix.tx;
        this._display.y = matrix.ty;
        this._display.rotation = transform.skewX * HiloDisplayBridge.RADIAN_TO_ANGLE;
        this._display.skewY = transform.skewY * HiloDisplayBridge.RADIAN_TO_ANGLE;
        this._display.scaleX = transform.scaleX;
        this._display.scaleY = transform.scaleY;

    };

    HiloDisplayBridge.prototype.updateColor = function (aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier) {
        if (this._display) {
            this._display.alpha = aMultiplier;
        }
    };

    HiloDisplayBridge.prototype.addDisplay = function (container, index) {
        var parent = container;
        if (parent && this._display) {
            if (index < 0) {
                parent.addChild(this._display);
            } else {
                parent.addChildAt(this._display, Math.min(index, parent.getNumChildren()));
            }
        }
    };

    HiloDisplayBridge.prototype.removeDisplay = function () {
        if (this._display && this._display.parent) {
            this._display.parent.removeChild(this._display);
        }
    };
    HiloDisplayBridge.RADIAN_TO_ANGLE = 180 / Math.PI;
    display.HiloDisplayBridge = HiloDisplayBridge;


    function HiloTextureAtlas(image, textureAtlasRawData, scale) {
        if (typeof scale === "undefined") { scale = 1; }
        this._regions = {};

        this.image = image;
        this.scale = scale;

        this.parseData(textureAtlasRawData);
    }
    HiloTextureAtlas.prototype.dispose = function () {
        this.image = null;
        this._regions = null;
    };

    HiloTextureAtlas.prototype.getRegion = function (subTextureName) {
        return this._regions[subTextureName];
    };

    HiloTextureAtlas.prototype.parseData = function (textureAtlasRawData) {
        var textureAtlasData = dragonBones.objects.DataParser.parseTextureAtlasData(textureAtlasRawData, this.scale);
        this.name = textureAtlasData.__name;
        delete textureAtlasData.__name;

        for (var subTextureName in textureAtlasData) {
            this._regions[subTextureName] = textureAtlasData[subTextureName];
        }
    };
    textures.HiloTextureAtlas = HiloTextureAtlas;

    function HiloFactory() {
        HiloFactory.superclass.constructor.call(this);
    }
    dragonBones.extends(HiloFactory, factorys.BaseFactory);

    HiloFactory.prototype._generateArmature = function () {
        var armature = new dragonBones.Armature(new Hilo.Container());
        return armature;
    };

    HiloFactory.prototype._generateSlot = function () {
        var slot = new dragonBones.Slot(new display.HiloDisplayBridge());
        return slot;
    };

    HiloFactory.prototype._generateDisplay = function (textureAtlas, fullName, pivotX, pivotY) {
        var rect = textureAtlas.getRegion(fullName);
        if (rect) {
            var bmp = new Hilo.Bitmap({
                image:textureAtlas.image,
                pivotX:pivotX,
                pivotY:pivotY,
                rect:[rect.x, rect.y, rect.width, rect.height],
                scaleX:1 / textureAtlas.scale,
                scaleY:1 / textureAtlas.scale
            })

        }
        return bmp;
    };
    HiloFactory._helpMatrix = new Hilo.Matrix(1, 0, 0, 1, 0, 0);
    factorys.HiloFactory = HiloFactory;
})();