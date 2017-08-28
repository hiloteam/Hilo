/**
 * Hilo 1.1.2 for standalone
 * Copyright 2016 alibaba.com
 * Licensed under the MIT License
 */
(function(window){
if(!window.Hilo) window.Hilo = {};
var Hilo = window.Hilo;var Class = window.Hilo.Class;
var EventMixin = window.Hilo.EventMixin;
var Matrix = window.Hilo.Matrix;
var util = window.Hilo.util;


/**
 * @language=en
 * @class View View is the base class of all display objects
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @param {Object} properties The properties to create a view object, contains all writeable props of this class
 * @module hilo/view/View
 * @requires hilo/core/Hilo
 * @requires hilo/core/Class
 * @requires hilo/event/EventMixin
 * @requires hilo/geom/Matrix
 * @requires hilo/util/util
 * @property {String} id The identifier for the view.
 * @property {Number} x The position of the view on the x axis relative to the local coordinates of the parent, default value is 0.
 * @property {Number} y The position of the view on the y axis relative to the local coordinates of the parent, default value is 0.
 * @property {Number} width The width of the view, default value is 0.
 * @property {Number} height The height of the view, default value is 0.
 * @property {Number} alpha The opacity of the view, default value is 1.
 * @property {Number} rotation The rotation of the view in angles, default value is 0.
 * @property {Boolean} visible The visibility of the view. If false the vew will not be drawn, default value is true.
 * @property {Number} pivotX Position of the center point on the x axis of the view, default value is 0.
 * @property {Number} pivotY Position of the center point on the y axis of the view, default value is 0.
 * @property {Number} scaleX The x axis scale factor of the view, default value is 1.
 * @property {Number} scaleY The y axis scale factor of the view, default value is 1.
 * @property {Boolean} pointerEnabled Is the view can receive DOM events, default value is true.
 * @property {Object} background The background style to fill the view, can be css color, gradient or pattern of canvas
 * @property {Graphics} mask Sets a mask for the view. A mask is an object that limits the visibility of an object to the shape of the mask applied to it. A regular mask must be a Hilo.Graphics object. This allows for much faster masking in canvas as it utilises shape clipping. To remove a mask, set this property to null.
 * @property {Number} tint The tint applied to the view，default is 0xFFFFFF.Only support in WebGL mode.
 * @property {String|Function} align The alignment of the view, the value must be one of Hilo.align enum.
 * @property {Container} parent The parent view of this view, readonly!
 * @property {Number} depth The z index of the view, readonly!
 * @property {Drawable} drawable The drawable object of the view. Only for advanced develop.
 * @property {Array} boundsArea The vertex points of the view, the points are relative to the center point. This is a example: [{x:10, y:10}, {x:20, y:20}].
 */
var View = (function(){

return Class.create(/** @lends View.prototype */{
    Mixes: EventMixin,
    constructor: function(properties){
        properties = properties || {};
        this.id = this.id || properties.id || Hilo.getUid("View");
        util.copy(this, properties, true);
    },

    tint:0xffffff,
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
    blendMode:'source-over',

    /**
     * @language=en
     * Get the stage object of the view. If the view doesn't add to any stage, null will be returned.
     * @returns {Stage} The stage object of the view.
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
     * @language=en
     * Get the scaled width of the view.
     * @returns {Number} scaled width of the view.
     */
    getScaledWidth: function(){
        return this.width * this.scaleX;
    },

    /**
     * @language=en
     * Get the scaled height of the view.
     * @returns {Number} scaled height of the view.
     */
    getScaledHeight: function(){
        return this.height * this.scaleY;
    },

    /**
     * @language=en
     * Add current view to a Contaner.
     * @param {Container} container Container object.
     * @param {Uint} index The index of the view in container.
     * @returns {View} Current view.
     */
    addTo: function(container, index){
        if(typeof index === 'number') container.addChildAt(this, index);
        else container.addChild(this);
        return this;
    },

    /**
     * @language=en
     * Remove current view from it's parent container
     * @returns {View} Current view.
     */
    removeFromParent: function(){
        var parent = this.parent;
        if(parent) parent.removeChild(this);
        return this;
    },

    /**
     * @language=en
     * Get the bounds of the view as a circumscribed rectangle and all vertex points relative to the coordinates of the stage.
     * @returns {Array} The vertex points array, and the array contains the following properties:
     * <ul>
     * <li><b>x</b> - The position of the view on the x axis relative to the coordinates of the stage.</li>
     * <li><b>y</b> - The position of the view on the y axis relative to the coordinates of the stage.</li>
     * <li><b>width</b> - The width of circumscribed rectangle of the view.</li>
     * <li><b>height</b> - The height of circumscribed rectangle of the view</li>
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
     * @language=en
     * Get the matrix that can transform points from current view coordinates to the ancestor container coordinates.
     * @param {View} ancestor The ancestor of current view, default value is the top container.
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
     * @language=en
     * Determining whether a point is in the circumscribed rectangle of current view.
     * @param {Number} x The x axis relative to the stage coordinates.
     * @param {Number} y The y axis relative to the stage coordinates.
     * @param {Boolean} usePolyCollision Is use polygon collision, default value is false.
     * @returns {Boolean} the point is in the circumscribed rectangle of current view.
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
     * @language=en
     * Determining whether an object is in the circumscribed rectangle of current view.
     * @param {View} object The object need to determining.
     * @param {Boolean} usePolyCollision Is use polygon collision, default value is false.
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
     * @language=en
     * The method to render current display object. Only for advanced develop.
     * @param {Renderer} renderer Renderer object.
     * @param {Number} delta The delta time of render.
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
     * @language=en
     * Mouse event
    */
    _fireMouseEvent:function(e){
        e.eventCurrentTarget = this;
        this.fire(e);

        // 处理mouseover事件 mouseover不需要阻止冒泡
        // handle mouseover event, mouseover needn't stop propagation.
        if(e.type == "mousemove"){
            if(!this.__mouseOver){
                this.__mouseOver = true;
                var overEvent = util.copy({}, e);
                overEvent.type = "mouseover";
                this.fire(overEvent);
            }
        }
        else if(e.type == "mouseout"){
            this.__mouseOver = false;
        }

        // 向上冒泡
        // handle event propagation
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
     * @language=en
     * This method will call while the view need update(usually caused by ticker update). This method can return a Boolean value, if return false, the view will not be drawn.
     * Limit: If you change the index in it's parent, it will not be drawn correct in current frame but next frame is correct.
     * @type Function
     * @default null
     */
    onUpdate: null,

    /**
     * @language=en
     * The render method of current view. The subclass can implement it's own render logic by rewrite this function.
     * @param {Renderer} renderer Renderer object.
     * @param {Number} delta The delta time of render.
     */
    render: function(renderer, delta){
        renderer.draw(this);
    },

    /**
     * @language=en
     * Get a string representing current view.
     * @returns {String} string representing current view.
     */
    toString: function(){
        return Hilo.viewToString(this);
    }
});

/**
 * @language=en
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
 * @language=en
 * @private
 */
function polygonCollision(poly1, poly2){
    var result = doSATCheck(poly1, poly2, {overlap:-Infinity, normal:{x:0, y:0}});
    if(result) return doSATCheck(poly2, poly1, result);
    return false;
}

/**
 * @language=en
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
window.Hilo.View = View;
})(window);