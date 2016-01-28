(function(){
	var ns = dragonBones.use("utils");
    var geom = dragonBones.use("geom");
    
	function TransformUtil() {
    }
    TransformUtil.transformPointWithParent = function (transform, parent) {
        var helpMatrix = TransformUtil._helpMatrix;
        TransformUtil.transformToMatrix(parent, helpMatrix);
        helpMatrix.invert();

        var x = transform.x;
        var y = transform.y;

        transform.x = helpMatrix.a * x + helpMatrix.c * y + helpMatrix.tx;
        transform.y = helpMatrix.d * y + helpMatrix.b * x + helpMatrix.ty;

        transform.skewX = TransformUtil.formatRadian(transform.skewX - parent.skewX);
        transform.skewY = TransformUtil.formatRadian(transform.skewY - parent.skewY);
    };

    TransformUtil.transformToMatrix = function (transform, matrix) {
        matrix.a = transform.scaleX * Math.cos(transform.skewY);
        matrix.b = transform.scaleX * Math.sin(transform.skewY);
        matrix.c = -transform.scaleY * Math.sin(transform.skewX);
        matrix.d = transform.scaleY * Math.cos(transform.skewX);
        matrix.tx = transform.x;
        matrix.ty = transform.y;
    };

    TransformUtil.formatRadian = function (radian) {
        radian %= TransformUtil.DOUBLE_PI;
        if (radian > Math.PI) {
            radian -= TransformUtil.DOUBLE_PI;
        }
        if (radian < -Math.PI) {
            radian += TransformUtil.DOUBLE_PI;
        }
        return radian;
    };
    TransformUtil.DOUBLE_PI = Math.PI * 2;
    TransformUtil._helpMatrix = new geom.Matrix();
	ns.TransformUtil = TransformUtil;
})();