(function(){
    var objects = dragonBones.use("objects");
    var geom = dragonBones.use("geom");

    function DBObject() {
        this.global = new objects.DBTransform();
        this.origin = new objects.DBTransform();
        this.offset = new objects.DBTransform();
        this.tween = new objects.DBTransform();
        this.tween.scaleX = this.tween.scaleY = 0;

        this._globalTransformMatrix = new geom.Matrix();

        this._visible = true;
        this._isColorChanged = false;
        this._isDisplayOnStage = false;
        this._scaleType = 0;

        this.fixedRotation = false;
    }
    DBObject.prototype.getVisible = function () {
        return this._visible;
    };
    DBObject.prototype.setVisible = function (value) {
        this._visible = value;
    };

    DBObject.prototype._setParent = function (value) {
        this.parent = value;
    };

    DBObject.prototype._setArmature = function (value) {
        if (this.armature) {
            this.armature._removeDBObject(this);
        }
        this.armature = value;
        if (this.armature) {
            this.armature._addDBObject(this);
        }
    };

    DBObject.prototype.dispose = function () {
        this.parent = null;
        this.armature = null;
        this.global = null;
        this.origin = null;
        this.offset = null;
        this.tween = null;
        this._globalTransformMatrix = null;
    };

    DBObject.prototype._update = function () {
        this.global.scaleX = (this.origin.scaleX + this.tween.scaleX) * this.offset.scaleX;
        this.global.scaleY = (this.origin.scaleY + this.tween.scaleY) * this.offset.scaleY;

        if (this.parent) {
            var x = this.origin.x + this.offset.x + this.tween.x;
            var y = this.origin.y + this.offset.y + this.tween.y;
            var parentMatrix = this.parent._globalTransformMatrix;

            this._globalTransformMatrix.tx = this.global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
            this._globalTransformMatrix.ty = this.global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;

            if (this.fixedRotation) {
                this.global.skewX = this.origin.skewX + this.offset.skewX + this.tween.skewX;
                this.global.skewY = this.origin.skewY + this.offset.skewY + this.tween.skewY;
            } else {
                this.global.skewX = this.origin.skewX + this.offset.skewX + this.tween.skewX + this.parent.global.skewX;
                this.global.skewY = this.origin.skewY + this.offset.skewY + this.tween.skewY + this.parent.global.skewY;
            }

            if (this.parent.scaleMode >= this._scaleType) {
                this.global.scaleX *= this.parent.global.scaleX;
                this.global.scaleY *= this.parent.global.scaleY;
            }
        } else {
            this._globalTransformMatrix.tx = this.global.x = this.origin.x + this.offset.x + this.tween.x;
            this._globalTransformMatrix.ty = this.global.y = this.origin.y + this.offset.y + this.tween.y;

            this.global.skewX = this.origin.skewX + this.offset.skewX + this.tween.skewX;
            this.global.skewY = this.origin.skewY + this.offset.skewY + this.tween.skewY;
        }
        this._globalTransformMatrix.a = this.global.scaleX * Math.cos(this.global.skewY);
        this._globalTransformMatrix.b = this.global.scaleX * Math.sin(this.global.skewY);
        this._globalTransformMatrix.c = -this.global.scaleY * Math.sin(this.global.skewX);
        this._globalTransformMatrix.d = this.global.scaleY * Math.cos(this.global.skewX);
    };
    
    dragonBones.DBObject = DBObject;
})();