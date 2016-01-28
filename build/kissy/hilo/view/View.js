/**
 * Hilo 1.0.0 for kissy
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
KISSY.add('hilo/view/View', function(S, Hilo, Class, EventMixin, Matrix){

/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

/**
 * @class View类是所有可视对象或组件的基类。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/view/View
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/geom/Matrix
 * @property {String} id 可视对象的唯一标识符。
 * @property {Number} x 可视对象的x轴坐标。默认值为0。
 * @property {Number} y 可视对象的y轴坐标。默认值为0。
 * @property {Number} width 可视对象的宽度。默认值为0。
 * @property {Number} height 可视对象的高度。默认值为0。
 * @property {Number} alpha 可视对象的透明度。默认值为1。
 * @property {Number} rotation 可视对象的旋转角度。默认值为0。
 * @property {Boolean} visible 可视对象是否可见。默认为可见，即true。
 * @property {Number} pivotX 可视对象的中心点的x轴坐标。默认值为0。
 * @property {Number} pivotY 可视对象的中心点的y轴坐标。默认值为0。
 * @property {Number} scaleX 可视对象在x轴上的缩放比例。默认为不缩放，即1。
 * @property {Number} scaleY 可视对象在y轴上的缩放比例。默认为不缩放，即1。
 * @property {Boolean} pointerEnabled 可视对象是否接受交互事件。默认为接受交互事件，即true。
 * @property {Object} background 可视对象的背景样式。可以是CSS颜色值、canvas的gradient或pattern填充。
 * @property {Graphics} mask 可视对象的遮罩图形。
 * @property {String|Function} align 可视对象相对于父容器的对齐方式。取值可查看Hilo.align枚举对象。
 * @property {Container} parent 可视对象的父容器。只读属性。
 * @property {Number} depth 可视对象的深度，也即z轴的序号。只读属性。
 * @property {Drawable} drawable 可视对象的可绘制对象。供高级开发使用。
 * @property {Array} boundsArea 可视对象的区域顶点数组。格式为：[{x:10, y:10}, {x:20, y:20}]。
 */
var View = (function(){

return Class.create(/** @lends View.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("View");
        Hilo.copy(this, properties, true);
    },

    id: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    alpha: 1,
    rotation: 0,
    visible: true,
    pivotX: 0,
    pivotY: 0,
    scaleX: 1,
    scaleY: 1,
    pointerEnabled: true,
    background: null,
    mask: null,
    align: null,
    drawable: null,
    boundsArea: null,
    parent: null,
    depth: -1,

    /**
     * 返回可视对象的舞台引用。若对象没有被添加到舞台，则返回null。
     * @returns {Stage} 可视对象的舞台引用。
     */
    getStage: function(){
        var obj = this, parent;
        while(parent = obj.parent) obj = parent;
        //NOTE: don't use `instanceof` to prevent circular module requirement.
        //But it's not a very reliable way to check it's a stage instance.
        if(obj.canvas) return obj;
        return null;
    },

    /**
     * 返回可视对象缩放后的宽度。
     * @returns {Number} 可视对象缩放后的宽度。
     */
    getScaledWidth: function(){
        return this.width * this.scaleX;
    },

    /**
     * 返回可视对象缩放后的高度。
     * @returns {Number} 可视对象缩放后的高度。
     */
    getScaledHeight: function(){
        return this.height * this.scaleY;
    },

    /**
     * 添加此对象到父容器。
     * @param {Container} container 一个容器。
     * @param {Uint} index 要添加到索引位置。
     * @returns {View} 可视对象本身。
     */
    addTo: function(container, index){
        if(typeof index === 'number') container.addChildAt(this, index);
        else container.addChild(this);
        return this;
    },

    /**
     * 从父容器里删除此对象。
     * @returns {View} 可视对象本身。
     */
    removeFromParent: function(){
        var parent = this.parent;
        if(parent) parent.removeChild(this);
        return this;
    },

    /**
     * 获取可视对象在舞台全局坐标系内的外接矩形以及所有顶点坐标。
     * @returns {Array} 可视对象的顶点坐标数组vertexs。另vertexs还包含属性：
     * <ul>
     * <li><b>x</b> - 可视对象的外接矩形x轴坐标。</li>
     * <li><b>y</b> - 可视对象的外接矩形y轴坐标。</li>
     * <li><b>width</b> - 可视对象的外接矩形的宽度。</li>
     * <li><b>height</b> - 可视对象的外接矩形的高度。</li>
     * </ul>
     */
    getBounds: function(){
        var w = this.width, h = this.height,
            mtx = this.getConcatenatedMatrix(),
            poly = this.boundsArea || [{x:0, y:0}, {x:w, y:0}, {x:w, y:h}, {x:0, y:h}],
            vertexs = [], point, x, y, minX, maxX, minY, maxY;

        for(var i = 0, len = poly.length; i < len; i++){
            point = mtx.transformPoint(poly[i], true, true);
            x = point.x;
            y = point.y;

            if(i == 0){
                minX = maxX = x;
                minY = maxY = y;
            }else{
                if(minX > x) minX = x;
                else if(maxX < x) maxX = x;
                if(minY > y) minY = y;
                else if(maxY < y) maxY = y;
            }
            vertexs[i] = point;
        }

        vertexs.x = minX;
        vertexs.y = minY;
        vertexs.width = maxX - minX;
        vertexs.height = maxY - minY;
        return vertexs;
    },

    /**
     * 获取可视对象相对于其某个祖先（默认为最上层容器）的连接矩阵。
     * @param {View} ancestor 可视对象的相对的祖先容器。
     * @private
     */
    getConcatenatedMatrix: function(ancestor){
        var mtx = new Matrix(1, 0, 0, 1, 0, 0);

        for(var o = this; o != ancestor && o.parent; o = o.parent){
            var cos = 1, sin = 0,
                rotation = o.rotation % 360,
                pivotX = o.pivotX, pivotY = o.pivotY,
                scaleX = o.scaleX, scaleY = o.scaleY;

            if(rotation){
                var r = rotation * Math.PI / 180;
                cos = Math.cos(r);
                sin = Math.sin(r);
            }

            if(pivotX != 0) mtx.tx -= pivotX;
            if(pivotY != 0) mtx.ty -= pivotY;
            mtx.concat(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, o.x, o.y);
        }
        return mtx;
    },

    /**
     * 检测由x和y参数指定的点是否在其外接矩形之内。
     * @param {Number} x 要检测的点的x轴坐标。
     * @param {Number} y 要检测的点的y轴坐标。
     * @param {Boolean} usePolyCollision 是否使用多边形碰撞检测。默认为false。
     * @returns {Boolean} 点是否在可视对象之内。
     */
    hitTestPoint: function(x, y, usePolyCollision){
        var bound = this.getBounds(),
            hit = x >= bound.x && x <= bound.x + bound.width &&
                  y >= bound.y && y <= bound.y + bound.height;

        if(hit && usePolyCollision){
            hit = pointInPolygon(x, y, bound);
        }
        return hit;
    },

    /**
     * 检测object参数指定的对象是否与其相交。
     * @param {View} object 要检测的可视对象。
     * @param {Boolean} usePolyCollision 是否使用多边形碰撞检测。默认为false。
     */
    hitTestObject: function(object, usePolyCollision){
        var b1 = this.getBounds(),
            b2 = object.getBounds(),
            hit = b1.x <= b2.x + b2.width && b2.x <= b1.x + b1.width &&
                  b1.y <= b2.y + b2.height && b2.y <= b1.y + b1.height;

        if(hit && usePolyCollision){
            hit = polygonCollision(b1, b2);
        }
        return !!hit;
    },

    /**
     * 可视对象的基本渲染实现，用于框架内部或高级开发使用。通常应该重写render方法。
     * @param {Renderer} renderer 渲染器。
     * @param {Number} delta 渲染时时间偏移量。
     * @protected
     */
    _render: function(renderer, delta){
        if((!this.onUpdate || this.onUpdate(delta) !== false) && renderer.startDraw(this)){
            renderer.transform(this);
            this.render(renderer, delta);
            renderer.endDraw(this);
        }
    },
    /**
     * 冒泡鼠标事件
    */
    _fireMouseEvent:function(e){
        e.eventCurrentTarget = this;
        this.fire(e);

        //处理mouseover事件 mouseover不需要阻止冒泡
        if(e.type == "mousemove"){
            if(!this.__mouseOver){
                this.__mouseOver = true;
                var overEvent = Hilo.copy({}, e);
                overEvent.type = "mouseover";
                this.fire(overEvent);
            }
        }
        else if(e.type == "mouseout"){
            this.__mouseOver = false;
        }

        //向上冒泡
        var parent = this.parent;
        if(!e._stopped && !e._stopPropagationed && parent){
            if(e.type == "mouseout" || e.type == "touchout"){
                if(!parent.hitTestPoint(e.stageX, e.stageY, true)){
                    parent._fireMouseEvent(e);
                }
            }
            else{
                parent._fireMouseEvent(e);
            }
        }
    },

    /**
     * 更新可视对象，此方法会在可视对象渲染之前调用。此函数可以返回一个Boolean值。若返回false，则此对象不会渲染。默认值为null。
     * 限制：如果在此函数中改变了可视对象在其父容器中的层级，当前渲染帧并不会正确渲染，而是在下一渲染帧。可在其父容器的onUpdate方法中来实现。
     * @type Function
     * @default null
     */
    onUpdate: null,

    /**
     * 可视对象的具体渲染逻辑。子类可通过覆盖此方法实现自己的渲染。
     * @param {Renderer} renderer 渲染器。
     * @param {Number} delta 渲染时时间偏移量。
     */
    render: function(renderer, delta){
        renderer.draw(this);
    },

    /**
     * 返回可视对象的字符串表示。
     * @returns {String} 可视对象的字符串表示。
     */
    toString: function(){
        return Hilo.viewToString(this);
    }
});

/**
 * @private
 */
function pointInPolygon(x, y, poly){
    var cross = 0, onBorder = false, minX, maxX, minY, maxY;

    for(var i = 0, len = poly.length; i < len; i++){
        var p1 = poly[i], p2 = poly[(i+1)%len];

        if(p1.y == p2.y && y == p1.y){
            p1.x > p2.x ? (minX = p2.x, maxX = p1.x) : (minX = p1.x, maxX = p2.x);
            if(x >= minX && x <= maxX){
                onBorder = true;
                continue;
            }
        }

        p1.y > p2.y ? (minY = p2.y, maxY = p1.y) : (minY = p1.y, maxY = p2.y);
        if(y < minY || y > maxY) continue;

        var nx = (y - p1.y)*(p2.x - p1.x) / (p2.y - p1.y) + p1.x;
        if(nx > x) cross++;
        else if(nx == x) onBorder = true;

        //当射线和多边形相交
        if(p1.x > x && p1.y == y){
            var p0 = poly[(len+i-1)%len];
            //当交点的两边在射线两旁
            if(p0.y < y && p2.y > y || p0.y > y && p2.y < y){
                cross ++;
            }
        }
    }

    return onBorder || (cross % 2 == 1);
}

/**
 * @private
 */
function polygonCollision(poly1, poly2){
    var result = doSATCheck(poly1, poly2, {overlap:-Infinity, normal:{x:0, y:0}});
    if(result) return doSATCheck(poly2, poly1, result);
    return false;
}

/**
 * @private
 */
function doSATCheck(poly1, poly2, result){
    var len1 = poly1.length, len2 = poly2.length,
        currentPoint, nextPoint, distance,
        min1, max1, min2, max2, dot, overlap, normal = {x:0, y:0};

    for(var i = 0; i < len1; i++){
        currentPoint = poly1[i];
        nextPoint = poly1[(i < len1-1 ? i+1 : 0)];

        normal.x = currentPoint.y - nextPoint.y;
        normal.y = nextPoint.x - currentPoint.x;

        distance = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= distance;
        normal.y /= distance;

        min1 = max1 = poly1[0].x * normal.x + poly1[0].y * normal.y;
        for(var j = 1; j < len1; j++){
            dot = poly1[j].x * normal.x + poly1[j].y * normal.y;
            if(dot > max1) max1 = dot;
            else if(dot < min1) min1 = dot;
        }

        min2 = max2 = poly2[0].x * normal.x + poly2[0].y * normal.y;
        for(j = 1; j < len2; j++){
            dot = poly2[j].x * normal.x + poly2[j].y * normal.y;
            if(dot > max2) max2 = dot;
            else if(dot < min2) min2 = dot;
        }

        if(min1 < min2){
            overlap = min2 - max1;
            normal.x = -normal.x;
            normal.y = -normal.y;
        }else{
            overlap = min1 - max2;
        }

        if(overlap >= 0){
            return false;
        }else if(overlap > result.overlap){
            result.overlap = overlap;
            result.normal.x = normal.x;
            result.normal.y = normal.y;
        }
    }

    return result;
}

})();

return View;

}, {
    requires: ['hilo/core/Hilo', 'hilo/core/Class', 'hilo/event/EventMixin', 'hilo/geom/Matrix']
});