(function(){
    var ns = dragonBones.use("geom");
    function Rectangle(x, y, width, height) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        if (typeof width === "undefined") { width = 0; }
        if (typeof height === "undefined") { height = 0; }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    ns.Rectangle = Rectangle;
})();