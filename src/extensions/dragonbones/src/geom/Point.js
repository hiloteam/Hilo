(function(){
    var ns = dragonBones.use("geom");

    function Point(x, y) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        this.x = x;
        this.y = y;
    }

    Point.prototype.toString = function () {
        return "[Point (x=" + this.x + " y=" + this.y + ")]";
    };

    ns.Point = Point;
})();
