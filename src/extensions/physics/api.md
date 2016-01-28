## Classes
<dl>
<dt><a href="#Physics">Physics</a></dt>
<dd></dd>
<dt><a href="#PhysicsDebugView">PhysicsDebugView</a></dt>
<dd></dd>
</dl>
## Mixins
<dl>
<dt><a href="#PhysicsViewMixin">PhysicsViewMixin</a></dt>
<dd><p>PhysicsViewMixin是一个包含物理相关功能的mixin。可以通过 Class.mix(target, PhysicsViewMixin) 来为target增加物理功能。</p>
</dd>
</dl>
<a name="Physics"></a>
## Physics
**Kind**: global class  

* [Physics](#Physics)
  * [new Physics(gravity, cfg)](#new_Physics_new)
  * _instance_
    * [.bindView(view, cfg)](#Physics#bindView)
    * [.addConstraint(joint)](#Physics#addConstraint) ⇒ <code>Joint</code>
    * [.removeConstraint(joint)](#Physics#removeConstraint) ⇒ <code>Joint</code>
    * [.unbindView(view, isDelView)](#Physics#unbindView)
    * [.addCollisionListener(typeA, typeB, listenerConfig)](#Physics#addCollisionListener)
    * [.createBounds(width, height)](#Physics#createBounds)
  * _inner_
    * [~collisionCallback](#Physics..collisionCallback) : <code>function</code>

<a name="new_Physics_new"></a>
### new Physics(gravity, cfg)
物理世界


| Param | Type | Description |
| --- | --- | --- |
| gravity | <code>Object</code> | 重力加速度 |
| gravity.x | <code>Number</code> | 重力加速度x |
| gravity.y | <code>Number</code> | 重力加速度y |
| cfg | <code>Object</code> | 世界属性配置 |

<a name="Physics#bindView"></a>
### physics.bindView(view, cfg)
绑定物理刚体

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| view | <code>View</code> | 要绑定的view |
| cfg | <code>Object</code> | 物理参数 |
| cfg.type | <code>String</code> | 形状类型，SHAPE_RECT|SHAPE_CIRCLE|SHAPE_POLYGEN , 默认矩形 |
| cfg.restitution | <code>Number</code> | 弹力，默认0.4 |
| cfg.friction | <code>Number</code> | 摩擦力，默认1 |
| cfg.collisionType | <code>Number</code> | 碰撞类型，默认1 |
| cfg.width | <code>Number</code> | 宽，type为SHAPE_RECT时有效，默认为view宽 |
| cfg.height | <code>Number</code> | 高，type为SHAPE_RECT时有效，默认为view高 |
| cfg.radius | <code>Number</code> | 半径，type为SHAPE_CIRCLE时有效，默认为view宽的一半 |
| cfg.boundsArea | <code>Array</code> | 顶点数组，type为SHAPE_POLYGEN时有效, 顶点顺序必须逆时针，[{x:0, y:0}, {x:100, y:0}, {x:50, y:50}] |

<a name="Physics#addConstraint"></a>
### physics.addConstraint(joint) ⇒ <code>Joint</code>
增加关节

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| joint | <code>Joint</code> | 关节 |

<a name="Physics#removeConstraint"></a>
### physics.removeConstraint(joint) ⇒ <code>Joint</code>
移除关节

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| joint | <code>Joint</code> | 关节 |

<a name="Physics#unbindView"></a>
### physics.unbindView(view, isDelView)
解绑物理刚体

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| view | <code>View</code> | 要解绑的view |
| isDelView | <code>Boolean</code> | 是否删除view，默认不删除 |

<a name="Physics#addCollisionListener"></a>
### physics.addCollisionListener(typeA, typeB, listenerConfig)
添加碰撞监听

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| typeA | <code>Number</code> | 碰撞类型A |
| typeB | <code>Number</code> | 碰撞类型B |
| listenerConfig | <code>Object</code> | 回调函数配置 |
| listenerConfig.begin | <code>[collisionCallback](#Physics..collisionCallback)</code> | 开始接触回调 |
| listenerConfig.preSolve | <code>[collisionCallback](#Physics..collisionCallback)</code> | 处理前碰撞回调 |
| listenerConfig.postSolve | <code>[collisionCallback](#Physics..collisionCallback)</code> | 处理后碰撞回调 |
| listenerConfig.separate | <code>[collisionCallback](#Physics..collisionCallback)</code> | 分离回调 |

<a name="Physics#createBounds"></a>
### physics.createBounds(width, height)
添加边框

**Kind**: instance method of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| width | <code>Number</code> | 宽 |
| height | <code>Number</code> | 高 |

<a name="Physics..collisionCallback"></a>
### Physics~collisionCallback : <code>function</code>
碰撞回调函数格式

**Kind**: inner typedef of <code>[Physics](#Physics)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arbiter | <code>Object</code> | 回调数据 |
| arbiter.a | <code>Shape</code> | 碰撞a形状 |
| arbiter.b | <code>Shape</code> | 碰撞b形状 |

<a name="PhysicsDebugView"></a>
## PhysicsDebugView
**Kind**: global class  
<a name="new_PhysicsDebugView_new"></a>
### new PhysicsDebugView(properties)
调试显示对象


| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | 属性 |
| properties.world | <code>[Physics](#Physics)</code> | 物理世界 |
| properties.showShapes | <code>Boolean</code> | 是否显示shape，默认true |
| properties.showConstraints | <code>Boolean</code> | 是否显示constraint，默认true |

<a name="PhysicsViewMixin"></a>
## PhysicsViewMixin
PhysicsViewMixin是一个包含物理相关功能的mixin。可以通过 Class.mix(target, PhysicsViewMixin) 来为target增加物理功能。

**Kind**: global mixin  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| body | <code>cpBody</code> | view绑定的物理对象，可直接操作改变物理属性 |


* [PhysicsViewMixin](#PhysicsViewMixin)
  * [.applyImpulse(impulse, pos)](#PhysicsViewMixin.applyImpulse)
  * [.applyForce(force, pos)](#PhysicsViewMixin.applyForce)
  * [.setPosition(x, y)](#PhysicsViewMixin.setPosition)
  * [.setRotation(rotation)](#PhysicsViewMixin.setRotation)

<a name="PhysicsViewMixin.applyImpulse"></a>
### PhysicsViewMixin.applyImpulse(impulse, pos)
施加冲量

**Kind**: static method of <code>[PhysicsViewMixin](#PhysicsViewMixin)</code>  

| Param | Type | Description |
| --- | --- | --- |
| impulse | <code>Object</code> | 冲量，格式：{x:0, y:0} |
| pos | <code>Object</code> | 施力位置离重心相对偏移量，默认0，格式：{x:0, y:0} |

<a name="PhysicsViewMixin.applyForce"></a>
### PhysicsViewMixin.applyForce(force, pos)
施加力

**Kind**: static method of <code>[PhysicsViewMixin](#PhysicsViewMixin)</code>  

| Param | Type | Description |
| --- | --- | --- |
| force | <code>Object</code> | 力，格式：{x:0, y:0} |
| pos | <code>Object</code> | 施力位置离重心相对偏移量，默认0，格式：{x:0, y:0} |

<a name="PhysicsViewMixin.setPosition"></a>
### PhysicsViewMixin.setPosition(x, y)
设置位置

**Kind**: static method of <code>[PhysicsViewMixin](#PhysicsViewMixin)</code>  

| Param | Type |
| --- | --- |
| x | <code>Number</code> | 
| y | <code>Number</code> | 

<a name="PhysicsViewMixin.setRotation"></a>
### PhysicsViewMixin.setRotation(rotation)
设置角度

**Kind**: static method of <code>[PhysicsViewMixin](#PhysicsViewMixin)</code>  

| Param | Type | Description |
| --- | --- | --- |
| rotation | <code>Number</code> | 单位角度制 |

