#### Hilo Caja 适配代码自动化构建脚本

* config.json: Hilo API 配置列表
    * json中每一个key，代表Hilo中的一个字段、对象、函数、类:
    	* "string" : 字符串 Caja忽略；
    	* "number", "boolean" : 这些基本类型Caja都无需适配，忽略；
    	* "object" : 简单对象，Caja需要适配；
    	* {} : 复杂对象，即某一个命名空间，比如 browser、Class、EventMixin 等，需适配；
    	* "function" : 函数，无参。需适配；
    	* [] : 函数，有参，数组中为参数定义，需适配；
    	* "proto" : 原型方法，包含proto自动都未类。比如：Stage、Sprite、Ticker 等，适配；

    * Caja只关注 Function、Object 类型的属性；
    
    * 因为Caja对Object、原型方法的兼容存在冲突，所以Hilo中的部分类将不能使用静态方法，比如Hilo.Tween。只能用new的写法，而不能使用静态方法 Tween.to 来创建；
    
    * 如果Hilo版本升级，则比较更新config.json相应配置；

* Build 
	* 使用Node.js + Mustache模板来生成代码，统一使用KISSY，测试流程和ISV引入规范参见 [Balcony 文档](http://gitlab.alibaba-inc.com/shop/balcony/wikis/how_to_use_caja.markdown)

	* `npm install`
	  `node build.js`

