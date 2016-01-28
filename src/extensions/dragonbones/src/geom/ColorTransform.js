(function(){
    var ns = dragonBones.use("geom");
    function ColorTransform() {
        this.alphaMultiplier = 0;
        this.alphaOffset = 0;
        this.blueMultiplier = 0;
        this.blueOffset = 0;
        this.greenMultiplier = 0;
        this.greenOffset = 0;
        this.redMultiplier = 0;
        this.redOffset = 0;
    }
    ns.ColorTransform = ColorTransform;
})();