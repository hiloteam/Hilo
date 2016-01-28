# Hilo.Physics
对chipmunk二次封装，简化使用方法

## example
* [demo](http://groups.demo.taobao.net/Hilo/hilo/src/extensions/physics/demo/)
* [joints](http://groups.demo.taobao.net/Hilo/hilo/src/extensions/physics/demo/joints.html)

## 使用说明

1. 生成物理世界 [详细api](./api.md#new_Physics_new)

	```
	//生成一个物理世界
	var world = new Hilo.Physics({
	    x:0,
	    y:1000
	});
	ticker.addTick(world);//加到hilo的ticker中才会执行
	```
1. 建立世界边界 [详细api](./api.md#Physics#createBounds)

   ```
   world.createBounds(gameWidth, gameHeight);
   ```
1. 绑定可视对象 [详细api](./api.md#Physics#bindView)

   ```
   world.bindView(view, {
       type:Hilo.Physics.SHAPE_CIRCLE,
       restitution:.9
   });
   ```
1. 操作物理对象，施加力, 冲量，改变位置，角度 [详细api](./api.md#PhysicsViewMixin)

   ```
   view.applyImpulse({x:0,y:-500});
   view.applyForce({x:0,y:-500});
   view.setRotation(90);
   view.setPosition(50， 20);
   ```
1. 不想使用物理属性时可以解绑 [详细api](./api.md#Physics#unbindView)

   ```
   world.unbindView(view, true);
   ```

1. 添加碰撞检测 [详细api](./api.md#Physics#addCollisionListener)

    ```
    world.addCollisionListener(1, 1, {
        begin:function(arb){
            arb.a.body.view.background = beginColor;
            arb.b.body.view.background = beginColor;
            return true;
        },
        separate:function(arb){
            arb.a.body.view.background = separateColor;
            arb.b.body.view.background = separateColor;
        }
    });
  ```

1. 添加关节 [详细api](./api.md#Physics#addConstraint)

    ```
    world.addConstraint(new cp.SimpleMotor(view1.body, view2.body, Math.PI*2)
    ```

1. 用PhysicsDebugView可以显示debug渲染模式，方便调试
    ```
    var debugView = new Hilo.PhysicsDebugView({
        world:world,
        showShapes:true,
        showConstraints:true
    });
    stage.addChild(debugView);
    ```

## 详细文档
* [完整api](./api.md)
* [chipmunk中文手册](https://github.com/iTyran/ChipmunkDocsCN/blob/master/Chipmunk2D.md)