(function(){
    var Class = Hilo.Class;
    var EventMixin = Hilo.EventMixin;
    var View = Hilo.View;

    var DEG2RAD = Math.PI/180;
    var RAD2DEG = 1/DEG2RAD;

    /**
     * PhysicsViewMixin是一个包含物理相关功能的mixin。可以通过 Class.mix(target, PhysicsViewMixin) 来为target增加物理功能。
     * @property {cpBody} body view绑定的物理对象，可直接操作改变物理属性
     * @mixin PhysicsViewMixin
     */
    var PhysicsViewMixin = {
        body:null,
        /**
         * 施加冲量
         * @memberOf PhysicsViewMixin
         * @param  {Object} impulse 冲量，格式：{x:0, y:0}
         * @param  {Object} pos 施力位置离重心相对偏移量，默认0，格式：{x:0, y:0}
         */
        applyImpulse:function(impulse, pos){
            pos = pos||{x:0,y:0};
            this.body.applyImpulse(cp.v(impulse.x, impulse.y), cp.v(pos.x, pos.y));
        },
        /**
         * 施加力
         * @memberOf PhysicsViewMixin
         * @param  {Object} force 力，格式：{x:0, y:0}
         * @param  {Object} pos 施力位置离重心相对偏移量，默认0，格式：{x:0, y:0}
         */
        applyForce:function(force, pos){
            pos = pos||{x:0,y:0};
            this.body.applyForce(cp.v(force.x, force.y), cp.v(pos.x, pos.y));
        },
        /**
         * 设置位置
         * @memberOf PhysicsViewMixin
         * @param {Number} x
         * @param {Number} y
         */
        setPosition:function(x, y){
            this.body.setPos(new cp.Vect(x, y));
        },
        /**
         * 设置角度
         * @memberOf PhysicsViewMixin
         * @param {Number} rotation 单位角度制
         */
        setRotation:function(rotation){
            this.body.setAngle(rotation * DEG2RAD);
        },
        /**
         * 重写render
         * @memberOf PhysicsViewMixin
         * @private
         * @param  {Renderer} renderer 渲染器
         * @param  {Number} delta    间隔时间
         */
        render:function(renderer, delta){
            this._physicsRender();
            this._viewRender.call(this, renderer, delta);
        },
        /**
         * 物理属性渲染
         * @memberOf PhysicsViewMixin
         * @private
         */
        _physicsRender: function() {
            this.x = this.body.p.x;
            this.y = this.body.p.y;
            this.rotation = this.body.a * RAD2DEG;
        }
    };

    /**
     * 物理世界
     * @class  Physics
     * @param  {Object} gravity 重力加速度
     * @param  {Number} gravity.x 重力加速度x
     * @param  {Number} gravity.y 重力加速度y
     * @param  {Object} cfg     世界属性配置
     * @return {Physic}
     */
    var Physics = Class.create(/** @lends Physics.prototype */{
        Mixes:EventMixin,
        Statics:{
            SHAPE_RECT:"rect",
            SHAPE_CIRCLE:"circle",
            SHAPE_POLYGEN:"polygen"
        },
        /**
         * @private
        */
        constructor:function(gravity, cfg){
            this._init(gravity, cfg);
        },
        /**
         * @private
         */
        _init:function(gravity, cfg){
            var world = new cp.Space();
            world.iterations = 20;
            world.gravity = new cp.Vect(gravity.x, gravity.y);
            world.sleepTimeThreshold = 0.5;
            world.collisionSlop = 0.5;
            world.sleepTimeThreshold = 0.5;

            if(cfg){
                for(var i in cfg){
                    world[i] = cfg[i];
                }
            }

            this.space = world;
            this.staticBody = world.staticBody;

            this._deleteBodies = [];
        },
        /**
         * tick方法，供Hilo.Ticker调用
         * @private
         * @param  {Number} dt 间隔
         */
        tick:function(dt){
            var world = this.space;
            dt = dt > 32?16:dt;

            world.step(dt * .001);

            //delete bodies and shapes
            for(var i = this._deleteBodies.length - 1;i >= 0;i --){
                var body = this._deleteBodies[i];
                var shapeList = body.shapeList;
                for(var j = shapeList.length - 1;j >= 0;j --){
                    world.removeShape(shapeList[j]);
                }
                world.removeBody(body);
            }
        },
        /**
         * 绑定物理刚体
         * @param  {View} view 要绑定的view
         * @param  {Object} cfg  物理参数
         * @param  {String} cfg.type  形状类型，SHAPE_RECT|SHAPE_CIRCLE|SHAPE_POLYGEN , 默认矩形
         * @param  {Number} cfg.restitution  弹力，默认0.4
         * @param  {Number} cfg.friction  摩擦力，默认1
         * @param  {Number} cfg.collisionType  碰撞类型，默认1
         * @param  {Number} cfg.width  宽，type为SHAPE_RECT时有效，默认为view宽
         * @param  {Number} cfg.height  高，type为SHAPE_RECT时有效，默认为view高
         * @param  {Number} cfg.radius  半径，type为SHAPE_CIRCLE时有效，默认为view宽的一半
         * @param  {Array} cfg.boundsArea  顶点数组，type为SHAPE_POLYGEN时有效, 顶点顺序必须逆时针，[{x:0, y:0}, {x:100, y:0}, {x:50, y:50}]
         */
        bindView:function(view, cfg){
            if(view.body){
                this.unbindView(view);
            }

            var cfg = cfg||{};
            var mass = cfg.mass || 1;
            var type = cfg.type || Physics.SHAPE_RECT;
            var width = view.width * view.scaleX;
            var height = view.height * view.scaleY;

            var body, shape;
            if(type === Physics.SHAPE_POLYGEN && !(view.boundsArea||cfg.boundsArea)){
                type = Physics.SHAPE_RECT;
            }

            switch(type){
                case Physics.SHAPE_RECT:
                    width = cfg.width||width;
                    height = cfg.height||height;
                    body = new cp.Body(mass, cp.momentForBox(mass, width, height));
                    shape = new cp.BoxShape(body, width, height);
                    break;
                case Physics.SHAPE_CIRCLE:
                    radius = cfg.radius||width*.5;
                    body = new cp.Body(mass, cp.momentForCircle(mass, 0, radius, new cp.Vect(0, 0)));
                    shape = new cp.CircleShape(body, radius, new cp.Vect(0, 0));
                    break;
                case Physics.SHAPE_POLYGEN:
                    var boundsArea = cfg.boundsArea||view.boundsArea;
                    verts = [];
                    boundsArea.forEach(function(point){
                        verts.push(point.x);
                        verts.push(point.y);
                    });
                    view.boundsArea = boundsArea;
                    body = new cp.Body(mass, cp.momentForPoly(mass, verts, new cp.Vect(0, 0)));
                    shape = new cp.PolyShape(body, verts, new cp.Vect(0, 0));
                    break;
                default:
                    break;
            }

            body.setAngle(view.rotation * DEG2RAD);
            body.setPos(new cp.Vect(view.x, view.y));

            shape.setElasticity(cfg.restitution||.4);
            shape.setFriction(cfg.friction||1);
            shape.setCollisionType(cfg.collisionType||1);

            view._viewRender = view.render;
            Class.mix(view, PhysicsViewMixin);


            view.body = body;
            view.shape = shape;
            body.view = view;

	       //物理对象中心点必须在中心
            view.pivotX = view.width * .5;
            view.pivotY = view.height * .5;

            this.space.addBody(body);
            this.space.addShape(shape);


            view._physicsRender();
        },
        /**
         * 增加关节
         * @param {Joint} joint 关节
         * @return {Joint}
         */
        addConstraint:function(joint){
            return this.space.addConstraint(joint);
        },
        /**
         * 移除关节
         * @param  {Joint} joint 关节
         * @return {Joint}
         */
        removeConstraint:function(joint){
            return this.space.removeConstraint(joint);
        },
        /**
         * 解绑物理刚体
         * @param  {View}  view 要解绑的view
         * @param  {Boolean} isDelView 是否删除view，默认不删除
         */
        unbindView:function(view, isDelView){
            var body = view.body;
            if(body){
                view.body = null;
                body.view = null;

                //延迟删除
                if(this._deleteBodies.indexOf(body) < 0){
                    this._deleteBodies.push(body);
                }
            }

            for(var prop in PhysicsViewMixin){
                view[prop] = null;
            }

            if(view._viewRender){
                view.render = view._viewRender;
            }

            if(isDelView){
                view.removeFromParent();
            }
        },
        /**
         * 添加碰撞监听
         * @param {Number} typeA 碰撞类型A
         * @param {Number} typeB 碰撞类型B
         * @param {Object} listenerConfig 回调函数配置
         * @param {Physics~collisionCallback} listenerConfig.begin 开始接触回调
         * @param {Physics~collisionCallback} listenerConfig.preSolve 处理前碰撞回调
         * @param {Physics~collisionCallback} listenerConfig.postSolve 处理后碰撞回调
         * @param {Physics~collisionCallback} listenerConfig.separate 分离回调
         */
        addCollisionListener:function(typeA, typeB, listenerConfig){
            var begin = listenerConfig.begin||function(arbiter){
                return true;
            };

            var preSolve = listenerConfig.preSolve||function(arbiter){
                return true;
            };

            var postSolve = listenerConfig.postSolve||function(arbiter){

            };

            var separate = listenerConfig.separate||function(arbiter){

            };

            this.space.addCollisionHandler(typeA, typeB, begin, preSolve, postSolve, separate);
        },
        /**
         * 添加边框
         * @param  {Number} width  宽
         * @param  {Number} height 高
         */
        createBounds:function(width, height){
            this._createBound({x:0, y:height}, {x:width, y:height}, 1);
            this._createBound({x:0, y:0}, {x:0, y:height}, 1);
            this._createBound({x:width, y:0}, {x:width, y:height}, 1);
        },
        _createBound: function(p0, p1, height) {
            var floor = this.space.addShape(new cp.SegmentShape(this.staticBody, cp.v(p0.x, p0.y), cp.v(p1.x, p1.y), height));
            floor.setElasticity(1);
            floor.setFriction(1);
        },
    });

    /**
     * 调试显示对象
     * @class  PhysicsDebugView
     * @param {Object} properties 属性
     * @param {Physics} properties.world 物理世界
     * @param {Boolean} properties.showShapes 是否显示shape，默认true
     * @param {Boolean} properties.showConstraints 是否显示constraint，默认true
     */
    var PhysicsDebugView = Class.create( /** @lends PhysicsDebugView.prototype */ {
        Extends: View,
        constructor: function(properties) {
            properties = properties || {};
            this.id = this.id || properties.id || Hilo.getUid('PhysicsDebugView');
            this.showShapes = true;
            this.showConstraints = true;
            PhysicsDebugView.superclass.constructor.call(this, properties);

            this.space = properties.world.space;
            this.pointerEnabled = false;
            this.pointerChildren = false;

            this.initDebugDraw();
        },
        render: function(renderer, delta) {
            var me = this,
                canvas = renderer.canvas,
                ctx = renderer.context;

            if (canvas.getContext && ctx) {
                this.showShapes && this.space.eachShape(function(shape){
                    if(!shape.hideDebugView){
                        ctx.fillStyle = shape.style();
                        shape.draw(ctx);
                    }
                });

                this.showConstraints && this.space.eachConstraint(function(c) {
                    if(!c.hideDebugView && c.draw){
                        c.draw(ctx);
                    }
                });
            }
        },
        initDebugDraw: function() {
            if (!this._isInit) {
                this._isInit = true;
                //draw shapes and constraints, copy from https://github.com/josephg/Chipmunk-js/blob/master/cp.extra.js
                var v = cp.v;var drawCircle = function(ctx, c, radius, isFill) {ctx.beginPath(); ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI, false); if (isFill === undefined) {isFill = true; } isFill && ctx.fill(); ctx.stroke(); }; var drawLine = function(ctx, a, b) {ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }; var springPoints = [v(0.00, 0.0), v(0.20, 0.0), v(0.25, 0.5), v(0.30, -1.0), v(0.35, 1.0), v(0.40, -1.0), v(0.45, 1.0), v(0.50, -1.0), v(0.55, 1.0), v(0.60, -1.0), v(0.65, 1.0), v(0.70, -1.0), v(0.75, 0.5), v(0.80, 0.0), v(1.00, 0.0) ]; var drawSpring = function(ctx, a, b, width) {if (width == null) width = 6; ctx.beginPath(); ctx.moveTo(a.x, a.y); var delta = v.sub(b, a); var len = v.len(delta); var rot = v.mult(delta, 1 / len); for (var i = 1; i < springPoints.length; i++) {var p = v.add(a, v.rotate(v(springPoints[i].x * len, springPoints[i].y * width), rot)); ctx.lineTo(p.x, p.y); } ctx.stroke(); }; cp.PolyShape.prototype.draw = function(ctx) {ctx.beginPath(); var verts = this.tVerts; var len = verts.length; var lastPoint = new cp.Vect(verts[len - 2], verts[len - 1]); ctx.moveTo(lastPoint.x, lastPoint.y); for (var i = 0; i < len; i += 2) {var p = new cp.Vect(verts[i], verts[i + 1]); ctx.lineTo(p.x, p.y); } ctx.fill(); ctx.stroke(); };cp.SegmentShape.prototype.draw = function(ctx) {var oldLineWidth = ctx.lineWidth; ctx.lineWidth = Math.max(1, this.r * 2); drawLine(ctx, this.ta, this.tb); ctx.lineWidth = oldLineWidth; }; cp.CircleShape.prototype.draw = function(ctx) {drawCircle(ctx, this.tc, this.r); drawLine(ctx, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc)); }; cp.PinJoint.prototype.draw = function(ctx) {var a = this.a.local2World(this.anchr1); var b = this.b.local2World(this.anchr2); ctx.lineWidth = 2; ctx.strokeStyle = "grey"; drawLine(ctx, a, b); }; cp.SlideJoint.prototype.draw = function(ctx) {var a = this.a.local2World(this.anchr1); var b = this.b.local2World(this.anchr2); var midpoint = v.add(a, v.clamp(v.sub(b, a), this.min)); ctx.lineWidth = 2; ctx.strokeStyle = "grey"; drawLine(ctx, a, b); ctx.strokeStyle = "red"; drawLine(ctx, a, midpoint); }; cp.PivotJoint.prototype.draw = function(ctx) {var a = this.a.local2World(this.anchr1); var b = this.b.local2World(this.anchr2); ctx.strokeStyle = "grey"; ctx.fillStyle = "grey"; drawCircle(ctx, a, 2); drawCircle(ctx, b, 2); }; cp.GrooveJoint.prototype.draw = function(ctx) {var a = this.a.local2World(this.grv_a); var b = this.a.local2World(this.grv_b); var c = this.b.local2World(this.anchr2); ctx.strokeStyle = "grey"; drawLine(ctx, a, b); drawCircle(ctx, c, 3); }; cp.DampedSpring.prototype.draw = function(ctx) {var a = this.a.local2World(this.anchr1); var b = this.b.local2World(this.anchr2); ctx.strokeStyle = "grey"; drawSpring(ctx, a, b); }; cp.SimpleMotor.prototype.draw = function(ctx) {ctx.save(); ctx.strokeStyle = "#aa0000"; ctx.lineWidth = 0.5; drawCircle(ctx, this.a.p, 7, false); drawCircle(ctx, this.b.p, 7, false); ctx.restore(); };var randColor = function() {return Math.floor(Math.random() * 256); }; var styles = []; for (var i = 0; i < 100; i++) {styles.push("rgb(" + randColor() + ", " + randColor() + ", " + randColor() + ")"); } cp.Shape.prototype.style = function() {var body; if (this.sensor) {return "rgba(255,255,255,0)"; } else {body = this.body; if (body.isSleeping()) {return "rgb(50,50,50)"; } else if (body.nodeIdleTime > this.space.sleepTimeThreshold) {return "rgb(170,170,170)"; } else {return styles[this.hashid % styles.length]; } } };
            }
        }
    });

    Hilo.Physics = Physics;
    Hilo.PhysicsDebugView = PhysicsDebugView;
})();

/**
 * 碰撞回调函数格式
 * @callback Physics~collisionCallback
 * @param {Object} arbiter 回调数据
 * @param {Shape} arbiter.a 碰撞a形状
 * @param {Shape} arbiter.b 碰撞b形状
 */