(function(){
	var ns = dragonBones.use("objects");
	function DBTransform() {
        this.x = 0;
        this.y = 0;
        this.skewX = 0;
        this.skewY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }
    DBTransform.prototype.getRotation = function () {
        return this.skewX;
    };
    DBTransform.prototype.setRotation = function (value) {
        this.skewX = this.skewY = value;
    };

    DBTransform.prototype.copy = function (transform) {
        this.x = transform.x;
        this.y = transform.y;
        this.skewX = transform.skewX;
        this.skewY = transform.skewY;
        this.scaleX = transform.scaleX;
        this.scaleY = transform.scaleY;
    };

    DBTransform.prototype.toString = function () {
        return "[DBTransform (x=" + this.x + " y=" + this.y + " skewX=" + this.skewX + " skewY=" + this.skewY + " scaleX=" + this.scaleX + " scaleY=" + this.scaleY + ")]";
    };
	ns.DBTransform = DBTransform;
})();