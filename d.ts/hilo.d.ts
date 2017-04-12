
/*
 * Copyright 2017 Alibaba Group Holding Limited
 */

declare interface ElementRect{
    left: number,
    top: number,
    width: number,
    height: number
}

/**
 * Hilo的基础核心方法集合。
 */
declare namespace Hilo{

    /**
     * 获取DOM元素在页面中的内容显示区域。
     * @param elem 获取DOM元素在页面中的内容显示区域。
     * @returns DOM元素的可视区域。格式为：{left:0, top:0, width:100, height:100}。
     */
    function getElementRect(elem: HTMLElement): ElementRect;

    /**
     * 创建一个DOM元素。可指定属性和样式。
     * @param type 要创建的DOM元素的类型。比如：'div'。
     * @param properties 指定DOM元素的属性和样式。
     * @returns 一个DOM元素。
     */
    function createElement(type: string, properties: object): HTMLElement;

    /**
     * 为指定的可视对象生成一个包含路径的字符串表示形式。如Stage1.Container2.Bitmap3。
     * @param view 指定的可视对象。
     * @returns 可视对象的字符串表示形式。
     */
    function viewToString(view: View): string;

    /**
     * 获取一个全局唯一的id。如Stage1，Bitmap2等。
     * @param prefix 生成id的前缀。
     * return 全局唯一id。
     */
    function getUid(prefix: string): string;

    /**
     * 根据参数id获取一个DOM元素。此方法等价于document.getElementById(id)。
     * @param id 要获取的DOM元素的id。
     * @returns 一个DOM元素。
     */
    function getElement(id: string): HTMLElement;

    /**
     * 单的浅复制对象。
     * @param target 要复制的目标对象。
     * @param source 要复制的源对象。
     * @param strict 指示是否复制未定义的属性，默认为false，即不复制未定义的属性。
     * @returns 复制后的对象。
     */
    function copy(target: object, source: object, strict: boolean): object;

    /**
     * 生成可视对象的CSS变换样式。
     * @param obj 指定生成CSS变换样式的可视对象。
     * @returns 生成的CSS样式字符串。
     */
    function getTransformCSS(obj: View): BrowserInfos;


    interface BrowserInfos{
        android: boolean,
        chrome: boolean,
        cssVendor: string,
        firefox: boolean,
        ie: false,
        ios: false,
        ipad: false,
        iphone: false,
        ipod: false,
        jsVendor: string,
        opera: boolean,
        safari: boolean,
        supportCanvas: boolean,
        supportDeviceMotion: boolean,
        supportOrientation: boolean,
        supportStorage: boolean,
        supportTouch: boolean,
        supportTransform: boolean,
        supportTransform3D: boolean,
        webkit: boolean
    }

    /**
     * 浏览器特性集合。包括：
     * jsVendor - 浏览器厂商CSS前缀的js值。比如：webkit。
     * cssVendor - 浏览器厂商CSS前缀的css值。比如：-webkit-。
     * supportTransform - 是否支持CSS Transform变换。
     * supportTransform3D - 是否支持CSS Transform 3D变换。
     * supportStorage - 是否支持本地存储localStorage。
     * supportTouch - 是否支持触碰事件。
     * supportCanvas - 是否支持canvas元素。
     */
    let browser: BrowserInfos;

    interface HiloAlign{
        BOTTOM: string,
        BOTTOM_LEFT: string,
        BOTTOM_RIGHT: string,
        CENTER: string,
        LEFT: string,
        RIGHT: string,
        TOP: string,
        TOP_LEFT: string,
        TOP_RIGHT: string
    }

    /**
     * 可视对象对齐方式枚举对象。包括：
     * TOP_LEFT - 左上角对齐。
     * TOP - 顶部居中对齐。
     * TOP_RIGHT - 右上角对齐。
     * LEFT - 左边居中对齐。
     * CENTER - 居中对齐。
     * RIGHT - 右边居中对齐。
     * BOTTOM_LEFT - 左下角对齐。
     * BOTTOM - 底部居中对齐。
     * BOTTOM_RIGHT - 右下角对齐。
     */
    let align: HiloAlign;

    /**
     * Hilo version
     */
    let version: string;

    /**
     * 事件类型枚举对象。包括：
     * POINTER_START - 鼠标或触碰开始事件。对应touchstart或mousedown。
     * POINTER_MOVE - 鼠标或触碰移动事件。对应touchmove或mousemove。
     * POINTER_END - 鼠标或触碰结束事件。对应touchend或mouseup。
     */
    let event: object;

}


declare namespace Hilo{


    /**
     * Class是提供类的创建的辅助工具。 
     */
    class Class{

        /**
         * 根据参数指定的属性和方法创建类。
         * @param properties 要创建的类的相关属性和方法。主要有：
         * Extends - 指定要继承的父类。
         * Mixes - 指定要混入的成员集合对象。
         * Statics - 指定类的静态属性或方法。
         * constructor - 指定类的构造函数。
         * 其他创建类的成员属性或方法。
         * @returns 创建的类
         */
        static create(properties: object): object;

        /**
         * 混入属性或方法。
         * @param target 混入目标对象。
         * @param source 要混入的属性和方法来源。可支持多个来源参数。
         * @returns 混入目标对象。
         */
        static mix(target: object, source: object): object;

    }

    /**
     * EventMixin是一个包含事件相关功能的mixin。可以通过 Class.mix(target, EventMixin) 来为target增加事件功能。
     */
    class EventMixin{

        /**
         * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
         * @param type 要发送的事件类型。
         * @param detail 要发送的事件的具体信息，即事件随带参数。
         * @returns 是否成功调度事件。
         */
        static fire(type: string, detail: object): boolean;

        /**
         * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
         * @param type 要删除监听的事件类型。
         * @param listener 要删除监听的回调函数。
         * @returns 对象本身。链式调用支持。
         */
        static off(type: string, listener: Function): object;

        /**
         * 增加一个事件监听。
         * @param type 要监听的事件类型。
         * @param listener 事件监听回调函数。
         * @param once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
         */
        static on(type: string, listener: Function, once: boolean): object;

    }

    interface StageProperties{

        /**
         * 指定舞台在页面中的父容器元素。它是一个dom容器或id。若不传入此参数且canvas未被加入到dom树，则需要在舞台创建后手动把舞台画布加入到dom树中，否则舞台不会被渲染。
         */
        container?: string|HTMLElement,

        /**
         * 指定渲染方式，canvas|dom|webgl，默认canvas。
         */
        renderType?: string,

        /**
         * 指定舞台所对应的画布元素。它是一个canvas或普通的div，也可以传入元素的id。若为canvas，则使用canvas来渲染所有对象，否则使用dom+css来渲染。
         */
        canvas?: string|HTMLCanvasElement|HTMLElement,

        /**
         * 指定舞台的宽度。默认为canvas的宽度。
         */
        width?: number,

        /**
         * 指定舞台的高度。默认为canvas的高度。
         */
        height?: number,

        /**
         * 指定舞台是否停止渲染。默认为false。s
         */
        paused?: boolean
    }
    
    /**
     * 舞台是可视对象树的根，可视对象只有添加到舞台或其子对象后才会被渲染出来。创建一个hilo应用一般都是从创建一个stage开始的。 
     */
    class Stage{

        /**
         * 
         * @param properties 创建对象的属性参数。可包含此类所有可写属性。
         */
        constructor(properties?: StageProperties);

        /**
         * 添加舞台画布到DOM容器中。注意：此方法覆盖了View.addTo方法。
         */
        public addTo(domElement: HTMLElement): Stage;

        /**
         * 开启/关闭舞台的DOM事件响应。要让舞台上的可视对象响应用户交互，必须先使用此方法开启舞台的相应事件的响应。
         */
        public enableDOMEvent(type: string|Array<object>, enabled: boolean): Stage;

        /**
         * 改变舞台的大小。
         */
        public resize(width: number, height: number, forceResize: boolean):void;

        /**
         * 调用tick会触发舞台的更新和渲染。开发者一般无需使用此方法。
         */
        public tick(delta: number): void;

        /**
         * 更新舞台在页面中的可视区域，即渲染区域。当舞台canvas的样式border、margin、padding等属性更改后，需要调用此方法更新舞台渲染区域。
         */
        public updateViewport(): Object;

        /**
         * 舞台所对应的画布。它可以是一个canvas或一个普通的div。只读属性。
         */
        public canvas: HTMLCanvasElement|HTMLElement;

        /**
         * 指示舞台是否暂停刷新渲染。
         */
        public paused: boolean;

        /**
         * 舞台渲染器。只读属性。
         */
        public renderer: Renderer;

        /**
         * 舞台内容在页面中的渲染区域。包含的属性有：left、top、width、height。只读属性。
         */
        public viewport: object;

    }

    class Renderer{

    }

    /**
     * Container是所有容器类的基类。每个Container都可以添加其他可视对象为子级。
     */
    class Container extends View{

        constructor(properties: object);

        /**
         * 在最上面添加子元素。
         */
        public addChild(child: View);

        /**
         * 在指定索引位置添加子元素。
         */
        public addChildAt(child: View, index: number);

        /**
         * 返回是否包含参数指定的子元素。
         */
        public contains(child: View);

        /**
         * 返回指定索引位置的子元素。
         */
        public getChildAt(index: number);

        /**
         * 返回指定id的子元素。
         */
        public getChildById(id: string);

        /**
         * 返回指定子元素的索引值。
         */
        public getChildIndex(child: View);

        /**
         * 返回容器的子元素的数量。
         */
        public getNumChildren():number;

        /**
         * 返回由x和y指定的点下的对象。
         */
        public getViewAtPoint(x: number, y: number, usePolyCollision: boolean, global: boolean, eventMode: boolean);

        /**
         * 删除所有的子元素。
         */
        public removeAllChildren(): Container;

        /**
         * 删除指定的子元素。
         */
        public removeChild(child: View): View;

        /**
         * 在指定索引位置删除子元素。
         */
        public removeChildAt(index: number): View;

        /**
         * 删除指定id的子元素。
         */
        public removeChildById(id: string): View;

        /**
         * 设置子元素的索引位置。
         */
        public setChildIndex(child: View, index: number);

        /**
         * 根据指定键值或函数对子元素进行排序。
         */
        public sortChildren(keyOrFunction: object);

        /**
         * 交换两个子元素的索引位置。
         */
        public swapChildren(child1: View, child2: View);

        /**
         * 交换两个指定索引位置的子元素。
         */
        public swapChildrenAt(index1: number, index2: number);

        /**
         * 容器的子元素列表。只读。
         */
        public children: Array<object>;

        /**
         * 指示是否裁剪超出容器范围的子元素。默认为false。
         */
        public clipChildren: boolean;

        /**
         * 指示容器的子元素是否能响应用户交互事件。默认为true。
         */
        public pointerChildren: boolean;

    }
    

    /**
     * View类是所有可视对象或组件的基类。
     */
    class View{

        constructor(properties: object);

        /**
         * 添加此对象到父容器。
         */
        public addTo(container: Container, index: number): View;

        /**
         * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
         */
        public fire(type: string, detail: object): boolean;

        /**
         * 获取可视对象在舞台全局坐标系内的外接矩形以及所有顶点坐标。
         */
        public getBounds(): number[];

        /**
         * 返回可视对象缩放后的高度。
         */
        public getScaledHeight(): number;

        /**
         * 返回可视对象缩放后的宽度。
         */
        public getScaledWidth(): number;

        /**
         * 返回可视对象的舞台引用。若对象没有被添加到舞台，则返回null。
         */
        public getStage(): Stage;

        /**
         * 检测object参数指定的对象是否与其相交。
         */
        public hitTestObject(object: View, usePolyCollision: boolean): void;

        /**
         * 检测由x和y参数指定的点是否在其外接矩形之内。
         */
        public hitTestPoint(x: number, y: number, usePolyCollision: boolean): boolean;

        /**
         * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
         */
        public off(type: string, listener: Function): object;
        
        /**
         * 增加一个事件监听。
         */
        public on(type: string, listener: Function, once: boolean): object;

        /**
         * 从父容器里删除此对象。
         */
        public removeFromParent(): View

        /**
         * 可视对象的具体渲染逻辑。子类可通过覆盖此方法实现自己的渲染。
         */
        public render(renderer: Renderer, delta: number);

        /**
         * 返回可视对象的字符串表示。
         */
        public toString(): string;

        /**
         * 可视对象相对于父容器的对齐方式。取值可查看Hilo.align枚举对象。
         */
        public align: string|Function;

        /**
         * 可视对象的透明度。默认值为1。
         */
        public alpha: number;

        /**
         * 可视对象的背景样式。可以是CSS颜色值、canvas的gradient或pattern填充。
         */
        public background: object;

        /**
         * 可视对象的区域顶点数组。格式为：[{x:10, y:10}, {x:20, y:20}]。
         */
        public boundsArea: Array<object>;

        /**
         * 可视对象的深度，也即z轴的序号。只读属性。
         */
        public depth: number;

        /**
         * 可视对象的可绘制对象。供高级开发使用。
         */
        public drawable: Drawable;

        /**
         * 可视对象的高度。默认值为0。
         */
        public height: number;

        /**
         * 可视对象的唯一标识符。
         */
        public id: string;

        /**
         * 可视对象的遮罩图形。
         */
        public mask: Graphics;

        /**
         * 更新可视对象，此方法会在可视对象渲染之前调用。此函数可以返回一个Boolean值。若返回false，则此对象不会渲染。默认值为null。 
         * 限制：如果在此函数中改变了可视对象在其父容器中的层级，当前渲染帧并不会正确渲染，而是在下一渲染帧。可在其父容器的onUpdate方法中来实现。
         * 默认值: null
         */
        public onUpdate: Function;

        /**
         * 可视对象的父容器。只读属性
         */
        public parent: Container;

        /**
         * 可视对象的中心点的x轴坐标。默认值为0。
         */
        public pivotX: number;

        /**
         * 可视对象的中心点的y轴坐标。默认值为0。
         */
        public pivotY: number;

        /**
         * 可视对象是否接受交互事件。默认为接受交互事件，即true。
         */
        public pointerEnabled: boolean;

        /**
         * 可视对象的旋转角度。默认值为0。
         */
        public rotation: number;

        /**
         * 可视对象在x轴上的缩放比例。默认为不缩放，即1。
         */
        public scaleX: number;

        /**
         * 可视对象在y轴上的缩放比例。默认为不缩放，即1。
         */
        public scaleY: number;

        /**
         * 可视对象的附加颜色，默认0xFFFFFF，只支持WebGL模式。
         */
        public tint: number;

        /**
         * 可视对象是否可见。默认为可见，即true。
         */
        public visible: boolean;

        /**
         * 可视对象的宽度。默认值为0。
         */
        public width: number;

        /**
         * 可视对象的x轴坐标。默认值为0。
         */
        public x: number;

        /**
         * 可视对象的y轴坐标。默认值为0。
         */
        public y: number;

    }

    interface BitmapProperties{
        /**
         * 位图所在的图像image。
         */
        image: any;

        /**
         * 位图在图像image中矩形区域。
         */
        rect?: any;
    }

    /**
     * Bitmap类表示位图图像类。 
     */
    class Bitmap extends View{

        constructor(properties: BitmapProperties);

        /**
         * 
         * @param image Image|String — 图片对象或地址。
         * @param rect 指定位图在图片image的矩形区域。
         */
        public setImage(image: HTMLImageElement|string, rect: Array<object>):Bitmap

    }

    /**
     * Drawable是可绘制图像的包装。
     */
    class Drawable{

        /**
         * 
         * 构造函数
         */
        constructor(properties: object);

        /**
         * 初始化可绘制对象。
         */
        public init(properties: object);

        /**
         * 判断参数elem指定的元素是否可包装成Drawable对象。
         * @param elem 要测试的对象。
         * @returns 如果是可包装成Drawable对象则返回true，否则为false。
         */
        static isDrawable(elem: object): boolean;

        /**
         * 要绘制的图像。即可被CanvasRenderingContext2D.drawImage使用的对象类型，可以是HTMLImageElement、HTMLCanvasElement、HTMLVideoElement等对象。
         */
        public image: object;

        /**
         * 要绘制的图像的矩形区域。
         */
        public rect: Array<object>;
    }

    /**
     * Graphics类包含一组创建矢量图形的方法。 
     */
    class Graphics extends View{
        
        /**
         * 创建对象的属性参数。可包含此类所有可写属性。
         */
        constructor(properties:Object);

        /**
         * 开始一个位图填充样式。
         */
        public beginBitmapFill(image: HTMLImageElement, repetition: string): Graphics;

        /**
         * 指定绘制图形的填充样式和透明度。
         */
        public beginFill(fill: string, alpha: number): Graphics;

        /**
         * 指定绘制图形的线性渐变填充样式。
         */
        public beginLinearGradientFill(x0: number, y0: number, x1: number, y1: number, colors: Array<object>, ratios: Array<object>): Graphics;

        /**
         * 开始一个新的路径。
         */
        public beginPath(): Graphics;

        /**
         * 指定绘制图形的放射性渐变填充样式。
         */
        public beginRadialGradientFill(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, colors: Array<object>, ratios: Array<object>): Graphics;

        /**
         * 绘制从当前位置开始到点(x, y)结束的贝塞尔曲线。
         */
        public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphics;

        /**
         * 缓存到图片里。可用来提高渲染效率。
         */
        public cache(forceUpdate: boolean);

        /**
         * 清除所有绘制动作并复原所有初始状态。
         */
        public clear(): Graphics;

        /**
         * 关闭当前的路径。
         */
        public closePath(): Graphics;

        /**
         * 绘制一个圆。
         */
        public drawCircle(x: number, y: number, radius: number): Graphics;

        /**
         * 绘制一个椭圆。
         */
        public drawEllipse(x: number, y: number, width: number, height: number): Graphics;

        /**
         * 绘制一个矩形。
         */
        public drawRect(x: number, y: number, width: number, height: number): Graphics;

        /**
         * 绘制一个圆角矩形。
         */
        public drawRoundRect(x: number, y: number, width: number, height: number, cornerSize: number): Graphics;

        /**
         * 绘制一个复杂的圆角矩形。
         */
        public drawRoundRectComplex(x: number, y: number, width: number, height: number, cornerTL: number, cornerTR: number, cornerBR: number, cornerBL: number): Graphics;

        /**
         * 根据参数指定的SVG数据绘制一条路径。 代码示例:
         * var path = 'M250 150 L150 350 L350 350 Z';
         * var shape = new Hilo.Graphics({width:500, height:500});
         * shape.drawSVGPath(path).beginFill('#0ff').endFill();
         */
        public drawSVGPath(pathData: string): Graphics;

        /**
         * 应用并结束笔画的绘制和图形样式的填充。
         */
        public endFill(): Graphics;

        /**
         * 指定绘制图形的线条样式。
         */
        public lineStyle(thickness: number, lineColor: string, lineAlpha: number, lineCap: string, lineJoin: string, miterLimit: number): Graphics;

        /**
         * 绘制从当前位置开始到点(x, y)结束的直线。
         */
        public lineTo(x: number, y: number): Graphics;

        /**
         * 将当前绘制位置移动到点(x, y)。
         */
        public moveTo(x: number, y: number): Graphics;

        /**
         * 绘制从当前位置开始到点(x, y)结束的二次曲线。
         */
        public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Graphics;

        /**
         * 设置缓存是否dirty
         */
        public setCacheDirty(dirty: boolean);

        /**
         * 更新缓存
         */
        public updateCache();

        /**
         * 内容填充的透明度。默认值为0。只读属性。
         */
        public fillAlpha: number;

        /**
         * 内容填充的样式。默认值为'0'，即黑色。只读属性。
         */
        public fillStyle: string;

        /**
         * 笔画的线条透明度。默认为1。只读属性。
         */
        public lineAlpha: number;

        /**
         * 笔画的线条端部样式。可选值有：butt、round、square等，默认为null。只读属性。
         */
        public lineCap: string;

        /**
         * 笔画的线条连接样式。可选值有：miter、round、bevel等，默认为null。只读属性。
         */
        public lineJoin: string;

        /**
         * 笔画的线条宽度。默认为1。只读属性。s
         */
        public lineWidth: number;   

        /**
         * 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。只读属性。s
         */
        public miterLimit: number;

        /**
         * 笔画边框的样式。默认值为'0'，即黑色。只读属性。
         */
        public strokeStyle: string;

    }

}
