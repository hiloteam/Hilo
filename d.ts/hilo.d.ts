
/*
 * Copyright 2017 Alibaba Group Holding Limited
 */

export = Hilo;
export as namespace Hilo;

/**
 * Hilo的基础核心方法集合。
 */
declare namespace Hilo {

  interface IElementRect {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  /**
   * 获取DOM元素在页面中的内容显示区域。
   * @param elem 获取DOM元素在页面中的内容显示区域。
   * @returns DOM元素的可视区域。格式为：{left:0, top:0, width:100, height:100}。
   */
  function getElementRect(elem: HTMLElement): IElementRect;

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
  function copy(target: object, source: object, strict?: boolean): object;

  /**
   * 生成可视对象的CSS变换样式。
   * @param obj 指定生成CSS变换样式的可视对象。
   * @returns 生成的CSS样式字符串。
   */
  function getTransformCSS(obj: View): IBrowserInfos;


  interface IBrowserInfos {
    android: boolean;
    chrome: boolean;
    cssVendor: string;
    firefox: boolean;
    ie: false;
    ios: false;
    ipad: false;
    iphone: false;
    ipod: false;
    jsVendor: string;
    opera: boolean;
    safari: boolean,
    supportCanvas: boolean;
    supportDeviceMotion: boolean;
    supportOrientation: boolean;
    supportStorage: boolean;
    supportTouch: boolean;
    supportTransform: boolean;
    supportTransform3D: boolean;
    webkit: boolean;
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
  let browser: IBrowserInfos;

  interface IHiloAlign {
    BOTTOM: string;
    BOTTOM_LEFT: string;
    BOTTOM_RIGHT: string;
    CENTER: string;
    LEFT: string;
    RIGHT: string;
    TOP: string;
    TOP_LEFT: string;
    TOP_RIGHT: string;
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
  let align: IHiloAlign;

  /**
   * Hilo version
   */
  let version: string;

  interface EventType {
    POINTER_START: string;
    POINTER_MOVE: string;
    POINTER_END: string
  }
  /**
   * 事件类型枚举对象。包括：
   * POINTER_START - 鼠标或触碰开始事件。对应touchstart或mousedown。
   * POINTER_MOVE - 鼠标或触碰移动事件。对应touchmove或mousemove。
   * POINTER_END - 鼠标或触碰结束事件。对应touchend或mouseup。
   */
  let event: object;

  /**
 * EventMixin是一个包含事件相关功能的mixin。可以通过 Class.mix(target, EventMixin) 来为target增加事件功能。
 */
  interface EventMixin {

    /**
     * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
     * @param type 要发送的事件类型。
     * @param detail 要发送的事件的具体信息，即事件随带参数。
     * @returns 是否成功调度事件。
     */
    fire: (type: string, detail: object) => boolean;

    /**
     * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
     * @param type 要删除监听的事件类型。
     * @param listener 要删除监听的回调函数。
     * @returns 对象本身。链式调用支持。
     */
    off: (type: string, listener?: Function) => object;

    /**
     * 增加一个事件监听。
     * @param type 要监听的事件类型。
     * @param listener 事件监听回调函数。
     * @param once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
     */
    on: (type: string, listener: Function, once?: boolean) => object;

  }

  class EventClass implements EventMixin {
    /**
    * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
    * @param type 要发送的事件类型。
    * @param detail 要发送的事件的具体信息，即事件随带参数。
    * @returns 是否成功调度事件。
    */
    fire: (type: string, detail: object) => boolean;

    /**
     * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
     * @param type 要删除监听的事件类型。
     * @param listener 要删除监听的回调函数。
     * @returns 对象本身。链式调用支持。
     */
    off: (type: string, listener?: Function) => object;

    /**
     * 增加一个事件监听。
     * @param type 要监听的事件类型。
     * @param listener 事件监听回调函数。
     * @param once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
     */
    on: (type: string, listener: Function, once?: boolean) => object;
  }

  /**
   * Class是提供类的创建的辅助工具。 
   */
  class Class {

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
   * Camera类表示摄像机。
   */
  class Camera {

    /**
     * 
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * 摄像机移动边界的矩形区域 [x, y, width, height]
     */
    bounds: number[];

    /**
     * 摄像机不移动的矩形区域 [ x, y, width, height]
     */
    deadzone: number[];

    /**
     * 镜头宽
     */
    width: number;

    /**
     * 镜头高
     */
    height: number;

    /**
     * 滚动值 {x:0, y:0}
     */
    scroll: { x: number, y: number };

    /**
     * 摄像机跟随的目标
     */
    target: View;

    /**
     * 跟随目标
     * @param target 跟随的目标，必须是有x,y属性的对象
     * @param deadzone 摄像机不移动的矩形区域 [ x, y, width, height]
     */
    follow(target: object, deadzone?: number[]): void;

    /**
     * @param deltaTime 
     * 
     */
    tick(deltaTime?: number): void;
  }

  interface IVector3D {
    x: number;
    y: number;
    z: number;
  }

  /**
   * Camera3d 伪3D虚拟摄像机。
   */
  class Camera3d {

    constructor(properties?: object);

    /**
     * 将三维坐标转换投影为二维坐标。
     * @param vector3D 三维坐标对象，必须含有x, y, z属性。
     * @param view 
     * @returns 二维坐标对象，包括缩放和z属性，例子:{x:x, y:y, z:z, scale}
     */
    project(vector3D: IVector3D, view?: View): object;

    /**
     * 旋转X轴方向角度，相当于欧拉角系统的 beta。
     */
    rotateX(angle: number): void;

    /**
     * 旋转Y轴方向角度，相当于欧拉角系统的 gamma。
     */
    rotateY(angle: number): void;

    /**
     * 旋转Z轴方向角度，相当于欧拉角系统的 alpha。
     */
    rotateZ(angle: number): void;

    /**
     * Z深度排序。
     */
    sortZ(): void;

    /**
     * Ticker 轮询使用。
     */
    tick(): void;

    /**
     * 仿射矩阵位移变换，不同于直接修改Camera3d.x/y/z.
     * 是在Camera3d依次做坐标位移 - 旋转变换 后，再加上一个位移变换。主要功能可以做Zoomin/out 功能
     */
    translate(x: number, y: number, z?: number): void;

    /**
     * 镜头视点距离（屏幕视点相对眼睛距离，绝对了坐标缩放比例）。
     */
    fv: number;

    /**
     * 镜头视点X（屏幕视点相对屏幕左上角X距离）。
     */
    fx: number;

    /**
     * 镜头视点Y（屏幕视点相对屏幕左上角Y距离）。
     */
    fy: number;

    /**
     * X轴旋转角度。
     */
    rotationX: number;

    /**
     * Y轴旋转角度。
     */
    rotationY: number;

    /**
     * Z轴旋转角度。
     */
    rotationZ: number;

    /**
     * 3D对象所在容器，可以是stage或container，结合ticker时是必须参数，用来Z深度排序。
     */
    stage: Stage | Container;

    /**
     * 镜头三维坐标x。
     */
    x: number;

    /**
     * 镜头三维坐标y。
     */
    y: number;

    /**
     * 镜头三维坐标z。
     */
    z: number;

  }

  /**
   * 粒子系统 
   */
  class ParticleSystem extends Container {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     * properties.particle:Object — 粒子属性配置
     * properties.particle.x:Number Optional, Default: 0 — x位置
     * properties.particle.y:Number Optional, Default: 0 — y位置
     * properties.particle.vx:Number Optional, Default: 0 — x速度
     * properties.particle.vy:Number Optional, Default: 0 — y速度
     * properties.particle.ax:Number Optional, Default: 0 — x加速度
     * properties.particle.ay:Number Optional, Default: 0 — y加速度
     * properties.particle.life:Number Optional, Default: 1 — 粒子存活时间，单位s
     * properties.particle.alpha:Number Optional, Default: 1 — 透明度
     * properties.particle.alphaV:Number Optional, Default: 0 — 透明度变化
     * properties.particle.scale:Number Optional, Default: 1 — 缩放
     * properties.particle.scaleV:Number Optional, Default: 0 — 缩放变化速度
     */
    constructor(properties?: object);

    /**
     * 重置属性
     * @param cfg 
     */
    reset(cfg: object): void;

    /**
     * 开始发射粒子
     */
    start(): void;

    /**
     * 停止发射粒子
     * @param clear 是否清除所有粒子
     */
    stop(clear?: boolean): void;

    /**
     * 每次发射数量
     */
    emitNum: number;

    /**
     * 每次发射数量变化量
     */
    emitNumVar: number;

    /**
     * 发射器位置x
     */
    emitterX: number;

    /**
     * 发射器位置y
     */
    emitterY: number;

    /**
     * 发射间隔
     */
    emitTime: number;

    /**
     * 发射间隔变化量
     */
    emitTimeVar: number;

    /**
     * 重力加速度x
     */
    gx: number;

    /**
     * 重力加速度y
     */
    gy: number;

    /**
     * 总时间
     */
    totalTime: number;

  }

  /**
   * Matrix类表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。
   */
  class Matrix {

    /**
     * 
     * @param a 缩放或旋转图像时影响像素沿 x 轴定位的值。
     * @param b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     * @param c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     * @param d 缩放或旋转图像时影响像素沿 y 轴定位的值。
     * @param tx 沿 x 轴平移每个点的距离。
     * @param ty 沿 y 轴平移每个点的距离。
     */
    constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);

    /**
     * 将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * @param mtx 要连接到源矩阵的矩阵。
     * @returns 一个Matrix对象
     */
    concat(mtx: Matrix): Matrix;

    /**
     * 为每个矩阵属性设置一个值，该值将导致 null 转换。通过应用恒等矩阵转换的对象将与原始对象完全相同。
     * @returns 一个Matrix对象
     */
    identity(): Matrix;

    /**
     * 执行原始矩阵的逆转换。您可以将一个逆矩阵应用于对象来撤消在应用原始矩阵时执行的转换。
     * @returns 一个Matrix对象
     */
    invert(): Matrix;

    /**
     * 对 Matrix 对象应用旋转转换。
     * @param angle 旋转的角度。
     * @returns 一个Matrix对象
     */
    rotate(angle: number): Matrix;

    /**
     * 对矩阵应用缩放转换。
     * @param sx 用于沿 x 轴缩放对象的乘数。
     * @param sy 用于沿 y 轴缩放对象的乘数。
     * @returns 一个Matrix对象
     */
    scale(sx: number, sy: number): Matrix;

    /**
     * 返回将 Matrix 对象表示的几何转换应用于指定点所产生的结果。
     * @param point 想要获得其矩阵转换结果的点。
     * @param round 是否对点的坐标进行向上取整。
     * @param returnNew 是否返回一个新的点。
     */
    transformPoint(point: object, round?: boolean, returnNew?: boolean): object;

    /**
     * 沿 x 和 y 轴平移矩阵，由 dx 和 dy 参数指定。
     * @param dx 沿 x 轴向右移动的量（以像素为单位）。
     * @param dy 沿 y 轴向右移动的量（以像素为单位）。
     * @param returnNew 是否返回一个新的点。
     */
    translate(dx: number, dy: number): Matrix;

  }

  interface ILoadSource {
    id: any;
    src: string;
    type: string;
    loader: any;
    noCache: boolean;
    size: number;
  }

  /**
   * LoadQueue是一个队列下载工具。
   */
  class LoadQueue extends EventClass {

    /**
     * @param source 要下载的资源。可以是单个资源对象或多个资源的数组。
     */
    constructor(source?: ILoadSource);

    /**
     * 增加要下载的资源。可以是单个资源对象或多个资源的数组。
     * @param source 资源对象或资源对象数组。每个资源对象包含以下属性
     */
    add(source?: ILoadSource | ILoadSource[]): LoadQueue;

    /**
     * 根据id或src地址获取资源对象。
     * @param id 指定资源的id或src。
     * @return 资源对象。
     */
    get(id: string): ILoadSource;

    /**
     * 根据id或src地址获取资源内容。
     * @param id 指定资源的id或src。
     * @return 资源内容。
     */
    getContent(id: string): object;

    /**
     * 获取已下载的资源数量。
     */
    getLoaded(): number;

    /**
     * 获取全部或已下载的资源的字节大小。
     * @param loaded 指示是已下载的资源还是全部资源。默认为全部。
     * @returns 指定资源的字节大小。
     */
    getSize(loaded?: boolean): number;

    /**
     * 获取所有资源的数量。
     * @returns 所有资源的数量。
     */
    getTotal(): number;

    /**
     * 开始下载队列。
     */
    start(): LoadQueue;

    /**
     * 同时下载的最大连接数。默认为2。
     */
    maxConnections: number;
  }

  /**
   * HTMLAudio声音播放模块。此模块使用HTMLAudioElement播放音频。 使用限制：iOS平台需用户事件触发才能播放，很多Android浏览器仅能同时播放一个音频。
   */
  class HTMLAudio extends EventClass {

    /**
     * 创建对象的属性参数。可包含此类所有可写属性。
     * @param properties 
     */
    constructor(properties?: Object);

    /**
     * 加载音频文件。
     */
    load(): void;

    /**
     * 暂停音频。
     */
    pause(): void;

    /**
     * 播放音频。如果正在播放，则会重新开始。 注意：为了避免第一次播放不成功，建议在load音频后再播放。
     */
    play(): void;

    /**
     * 恢复音频播放。
     */
    resume(): void;

    /**
     * 设置静音模式。注意: iOS设备无法设置静音模式。
     * @param muted 
     */
    setMute(muted: boolean): void;

    /**
     * 设置音量。注意: iOS设备无法设置音量。
     * @param volume 
     */
    setVolume(volume: number): void;

    /**
     * 停止音频播放。
     */
    stop(): void;

    /**
     * 是否自动播放。默认为false。
     */
    autoPlay: boolean;

    /**
     * 音频的时长。只读属性。
     */
    duration: number;

    /**
     * 浏览器是否支持HTMLAudio。
     */
    static isSupported: boolean;

    /**
     * 音频资源是否已加载完成。只读属性。
     */
    loaded: boolean;

    /**
     * 是否循环播放。默认为false。
     */
    loop: boolean;

    /**
     * 是否静音。默认为false。
     */
    muted: boolean;

    /**
     * 是否正在播放音频。只读属性。
     */
    playing: boolean;

    /**
     * 播放的音频的资源地址。
     */
    src: string;

    /**
     * 音量的大小。取值范围：0-1。
     */
    volume: number;
  }

  /**
   * WebAudio声音播放模块。它具有更好的声音播放和控制能力，适合在iOS6+平台使用。 兼容情况：iOS6+、Chrome33+、Firefox28+支持，但Android浏览器均不支持。
   */
  class WebAudio extends EventClass {

    /**
     * 创建对象的属性参数。可包含此类所有可写属性。
     * @param properties 
     */
    constructor(properties?: Object);

    /**
     * 加载音频文件。注意：我们使用XMLHttpRequest进行加载，因此需要注意跨域问题。
     */
    load(): void;

    /**
     * 暂停音频。
     */
    pause(): void;

    /**
     * 播放音频。如果正在播放，则会重新开始。
     */
    play(): void;

    /**
     * 恢复音频播放。
     */
    resume(): void;

    /**
     * 设置静音模式。
     * @param muted 
     */
    setMute(muted: boolean): void;

    /**
     * 设置音量。注意: iOS设备无法设置音量。
     * @param volume 
     */
    setVolume(volume: number): void;

    /**
     * 停止音频播放。
     */
    stop(): void;

    /**
     * 激活WebAudio。注意：需用户事件触发此方法才有效。激活后，无需用户事件也可播放音频。
     */
    static enable(): void;

    /**
     * 清除audio buffer 缓存。
     * @param url audio的网址，默认清除所有的缓存
     */
    static clearBufferCache(url: string);

    /**
    * 是否自动播放。默认为false。
    */
    autoPlay: boolean;

    /**
     * 音频的时长。只读属性。
     */
    duration: number;

    /**
     * 音频资源是否已加载完成。只读属性。
     */
    loaded: boolean;

    /**
     * 是否循环播放。默认为false。
     */
    loop: boolean;

    /**
     * 是否静音。默认为false。
     */
    muted: boolean;

    /**
     * 是否正在播放音频。只读属性。
     */
    playing: boolean;

    /**
     * 播放的音频的资源地址。
     */
    src: string;

    /**
     * 音量的大小。取值范围：0-1。
     */
    volume: number;

    /**
     * 浏览器是否支持WebAudio。
     */
    static isSupported: boolean;

    /**
     * 浏览器是否已激活WebAudio。
     */
    static enabled: boolean;

  }

  /**
   * 声音播放管理器。 
   */
  class WebSound {

    /**
     * 激活音频功能。注意：需用户事件触发此方法才有效。目前仅对WebAudio有效。
     */
    static enableAudio(): void;

    /**
     * 获取音频对象。优先使用WebAudio。
     * @param source 若source为String，则为音频src地址；若为Object，则需包含src属性。
     */
    static getAudio(source: string | object): WebAudio | HTMLAudio;

    /**
     * 删除音频对象。
     * @param source 若source为String，则为音频src地址；若为Object，则需包含src属性。
     */
    static removeAudio(source: string | object): void;

  }

  /**
   * canvas画布渲染器。所有可视对象将渲染在canvas画布上。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
   */
  class CanvasRenderer extends Renderer {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * canvas画布的上下文。只读属性。
     */
    context: CanvasRenderingContext2D;

  }

  /**
   * DOM+CSS3渲染器。将可视对象以DOM元素方式渲染出来。舞台Stage会根据参数canvas选择不同的渲染器，开发者无需直接使用此类。
   */
  class DOMRenderer extends Renderer {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

  }


  /**
   * 渲染器抽象基类。
   */
  class Renderer {

    /**
     * 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * 清除画布指定区域。需要子类来实现。
     * @param x 指定区域的x轴坐标。
     * @param y 指定区域的y轴坐标。
     * @param width 指定区域的宽度。
     * @param height 指定区域的高度。
     */
    clear(x: number, y: number, width: number, height: number): void;

    /**
     * 绘制可视对象。需要子类来实现。
     * @param target 要绘制的可视对象。
     */
    draw(target: View): void;

    /**
     * 结束绘制可视对象后的后续处理方法。需要子类来实现。
     * @param target 要绘制的可视对象。
     */
    endDraw(target: View): void;

    /**
     * 隐藏可视对象。需要子类来实现。
     */
    hide(): void;

    /**
     * 从画布中删除可视对象。注意：不是从stage中删除对象。需要子类来实现。
     * @param target 要删除的可视对象。
     */
    remove(target: View): void;

    /**
     * 改变渲染器的画布大小。
     * @param width 指定渲染画布新的宽度。
     * @param height 指定渲染画布新的高度。
     */
    resize(width: number, height: number): void;

    /**
     * 为开始绘制可视对象做准备。需要子类来实现。
     * @param target 要绘制的可视对象。
     */
    startDraw(target: View): void;

    /**
     * 对可视对象进行变换。需要子类来实现。
     */
    transform(): void;

    /**
     * 渲染器对应的画布。它可能是一个普通的DOM元素，比如div，也可以是一个canvas画布元素。只读属性。
     */
    canvas: object;

    /**
     * 渲染方式。只读属性。
     */
    renderType: string;

    /**
     * 渲染器对应的舞台。只读属性。
     */
    stage: object;

  }

  /**
   * webgl画布渲染器。所有可视对象将渲染在canvas画布上。
   */
  class WebGLRenderer {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * 是否支持WebGL。只读属性。
     */
    static isSupport(): boolean;

    /**
     * 顶点属性数。只读属性。
     */
    static ATTRIBUTE_NUM: number;

    /**
     * webgl上下文。只读属性。
     */
    gl: WebGLRenderingContext;

    /**
     * 最大批渲染数量。
     */
    static MAX_BATCH_NUM: number;

  }

  /**
   * Ease类包含为Tween类提供各种缓动功能的函数。
   */
  class Ease {

    /**
     * 向后缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Back: object;

    /**
     * 弹跳缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Bounce: object;

    /**
     * 圆形缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Circ: object;

    /**
     * 三次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Cubic: object;

    /**
     * 弹性缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Elastic: object;

    /**
     * 指数缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Expo: object;

    /**
     * 线性匀速缓动函数。包含EaseNone函数。
     */
    static Linear: object;

    /**
     * 二次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Quad: object;

    /**
     * 四次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Quart: object;

    /**
     * 五次缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Quint: object;

    /**
     * 正弦缓动函数。包含EaseIn、EaseOut、EaseInOut三个函数。
     */
    static Sine: object;

  }

  /**
   * Tween类提供缓动功能。 
   */
  class Tween {

    /**
     * @param target 缓动对象。
     * @param fromProps 对象缓动的起始属性集合。
     * @param toProps 对象缓动的目标属性集合。
     * @param params 缓动参数。可包含Tween类所有可写属性。
     */
    constructor(target: Object, fromProps: Object, toProps: Object, params: Object);

    /**
     * 连接下一个Tween变换。其开始时间根据delay值不同而不同。当delay值为字符串且以'+'或'-'开始时，Tween的开始时间从当前变换结束点计算，否则以当前变换起始点计算。
     * @param tween 要连接的Tween变换。
     */
    link(tween: Tween): Tween;

    /**
     * 暂停缓动动画的播放。
     */
    pause(): Tween;

    /**
     * 恢复缓动动画的播放。
     */
    resume(): Tween;

    /**
     * 跳转Tween到指定的时间。
     * @param time 指定要跳转的时间。取值范围为：0 - duraion。
     * @param pause 是否暂停。
     */
    seek(time: number, pause: boolean): Tween;

    /**
     * 设置缓动对象的初始和目标属性。
     * @param fromProps 缓动对象的初始属性。
     * @param toProps 缓动对象的目标属性。
     */
    setProps(fromProps: object, toProps: object): Tween;

    /**
     * 启动缓动动画的播放。
     */
    start(): Tween;

    /**
     * 停止缓动动画的播放。
     */
    stop(): Tween;

    /**
     * 更新所有Tween实例。
     */
    static tick(): object;

    /**
     * 添加Tween实例。
     * @param tween 要添加的Tween对象。
     * @returns Tween
     */
    static add(tween: Tween): object;

    /**
     * 删除Tween实例。
     * @param tweenOrTarget 
     */
    static remove(tweenOrTarget: Tween | object | any[]): object;

    /**
     * 删除所有Tween实例。
     */
    static removeAll(): object;

    /**
     * 创建一个缓动动画，让目标对象从开始属性变换到目标属性。
     * @param target 缓动目标对象或缓动目标数组。
     * @param fromProps 缓动目标对象的开始属性。
     * @param toProps 缓动目标对象的目标属性。
     * @param params 缓动动画的参数。
     */
    static fromTo(target: object | any[], fromProps, toProps, params): Tween | any[];

    /**
     * 创建一个缓动动画，让目标对象从当前属性变换到目标属性。
     * @param target 缓动目标对象或缓动目标数组。
     * @param toProps 缓动目标对象的目标属性。
     * @param params 缓动动画的参数。
     */
    static to(target: object | any[], toProps, params): Tween | any[];

    /**
     * 创建一个缓动动画，让目标对象从指定的起始属性变换到当前属性。
     * @param target 缓动目标对象或缓动目标数组。
     * @param toProps 缓动目标对象的目标属性。
     * @param params 缓动动画的参数。
     */
    static from(target: Object | any[], fromProps, params): Tween | any[];

    /**
     * 缓动延迟时间。单位毫秒。
     */
    delay: number;

    /**
     * 缓动总时长。单位毫秒。
     */
    duration: number;

    /**
     * 缓动变化函数。默认为null。
     */
    ease: Function;

    /**
     * 缓动是否循环。默认为false。
     */
    loop: boolean;

    /**
     * 缓动结束回调函数。它接受1个参数：tween。默认值为null。
     */
    onComplete: Function;

    /**
     * 缓动开始回调函数。它接受1个参数：tween。默认值为null。
     */
    onStart: Function;

    /**
     * 缓动更新回调函数。它接受2个参数：ratio和tween。默认值为null。
     */
    onUpdate: Function;

    /**
     * 缓动是否暂停。默认为false。
     */
    paused: boolean;

    /**
     * 缓动重复的次数。默认为0。
     */
    repeat: number;

    /**
     * 缓动重复的延迟时长。单位为毫秒。
     */
    repeatDelay: number;

    /**
     * 缓动是否反转播放。默认为false。
     */
    reverse: boolean;

    /**
     * 缓动目标。只读属性。
     */
    target: object;

    /**
     * 缓动已进行的时长。单位毫秒。只读属性。
     */
    time: number;

  }

  /**
   * TextureAtlas纹理集是将许多小的纹理图片整合到一起的一张大图。这个类可根据一个纹理集数据读取纹理小图、精灵动画等。
   */
  class TextureAtlas {

    /**
     * 
     * @param atlasData 
     */
    constructor(atlasData?: Object);

    /**
     * 获取指定索引位置index的帧数据。
     * @param index 要获取帧的索引位置。
     * @returns 帧数据。
     */
    getFrame(index: number): object;

    /**
     * 获取指定id的精灵数据。
     * @param id 要获取精灵的id。
     * @returns 精灵数据。
     */
    getSprite(id: string): object;

    /**
     * 
     * @param name 动画名称|一组动画数据 
     * @param frames 帧数据 eg:"0-5"代表第0到第5帧
     * @param w 每帧的宽
     * @param h 每帧的高
     * @param loop 是否循环
     * @param duration 每帧间隔 默认单位帧, 如果sprite的timeBased为true则单位是毫秒，默认一帧
     */
    static createSpriteFrames(name: string | object[], frames: string, w: number, h: number, loop: boolean, duration: number): void;
  }

  /**
   * Ticker是一个定时器类。它可以按指定帧率重复运行，从而按计划执行代码。
   */
  class Ticker {

    /**
     * @param fps 指定定时器的运行帧率。
     */
    constructor(fps?: number);

    /**
     * 添加定时器对象。定时器对象必须实现 tick 方法。
     * @param tickObject 要添加的定时器对象。此对象必须包含 tick 方法。
     */
    addTick(tickObject: object): void;

    /**
     * 获得测定的运行时帧率。
     */
    getMeasuredFPS(): number;

    /**
     * 指定的时间周期来调用函数, 类似setInterval
     */
    interval(callback: Function, duration: number): object;

    /**
     * 下次tick时回调
     */
    nextTick(callback: Function): object;

    /**
     * 暂停定时器。
     */
    pause();

    /**
     * 删除定时器对象。
     * @param tickObject 要添加的定时器对象。此对象必须包含 tick 方法。
     */
    removeTick(tickObject: object);

    /**
     * 恢复定时器。
     */
    resume(): void;

    /**
     * 启动定时器。
     */
    start(userRAF?: boolean): void;

    /**
     * 停止定时器。
     */
    stop(): void;

    /**
     * 延迟指定的时间后调用回调, 类似setTimeout
     */
    timeout(callback: Function, duration: number): object;

  }

  /**
   * drag是一个包含拖拽功能的mixin。可以通过 Class.mix(view, drag)或Hilo.copy(view, drag)来为view增加拖拽功能。 
   */
  class drag {

    /**
     * @param bounds 拖拽范围，基于父容器坐标系，[x, y, width, height]， 默认无限制
     */
    static startDrag(bounds: number[]): void;

    /**
     * 停止拖拽。
     */
    static stopDrag(): void;
  }


  interface IBitmapProperties {
    /**
     * 位图所在的图像image。
     */
    image: any;

    /**
     * 位图在图像image中矩形区域。
     */
    rect?: any;
  }

  interface util {
    copy?: (target: object, source: object, strict?: boolean) => object,
  }

  /**
   * Bitmap类表示位图图像类。 
   */
  class Bitmap extends View {

    constructor(properties?: IBitmapProperties);

    /**
     * 
     * @param image Image|String — 图片对象或地址。
     * @param rect 指定位图在图片image的矩形区域。
     * @returns 位图本身。
     */
    setImage(image: HTMLImageElement | string, rect?: number[]): Bitmap

  }

  /**
   * BitmapText类提供使用位图文本的功能。当前仅支持单行文本。 
   */
  class BitmapText extends Container {

    /**
     * 位图字体的字形集合。格式为：{letter:{image:img, rect:[0,0,100,100]}}。
     */
    glyphs: object;

    /**
     * 字距，即字符间的间隔。默认值为0。
     */
    letterSpacing: number;

    /**
     * 位图文本的文本内容。只读属性。设置文本请使用setText方法。
     */
    text: string;

    /**
     * 文本对齐方式，值为left、center、right, 默认left。只读属性。设置文本对齐方式请使用setTextAlign方法。
     */
    textAlign: string;

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * 返回能否使用当前指定的字体显示提供的字符串。
     * @param str 要检测的字符串。
     * @returns 是否能使用指定字体。
     */
    hasGlyphs(str: string): boolean;

    /**
     * 设置位图文本的文本内容。
     * @param text 要设置的文本内容。
     * @returns BitmapText对象本身。链式调用支持。
     */
    setText(text: string): BitmapText;

    /**
     * 设置位图文本的对齐方式。
     * @param textAlign 文本对齐方式，值为left、center、right
     * @returns BitmapText对象本身。链式调用支持。
     */
    setTextAlign(textAlign?: string): BitmapText;

    /**
     * 简易方式生成字形集合。
     * @param text 字符文本。
     * @param image 字符图片。
     * @param col 列数 默认和文本字数一样
     * @param row 行数 默认1行
     * @returns BitmapText对象本身。链式调用支持。
     */
    static createGlyphs(text: string, image: HTMLImageElement, col?: number, row?: number): BitmapText;

  }

  /**
   * Button类表示简单按钮类。它有弹起、经过、按下和不可用等四种状态。 
   */
  class Button extends View {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：
     * image - 按钮图片所在的image对象。
     */
    constructor(properties?: object);

    /**
     * 设置按钮是否可用。
     * @param enabled 指示按钮是否可用。
     * @returns 按钮本身。
     */
    setEnabled(enabled?: boolean): Button;

    /**
     * 设置按钮的状态。此方法由Button内部调用，一般无需使用此方法。
     * @param state 按钮的新的状态。
     * @returns 按钮本身。
     */
    setState(state?: string): Button;

    /**
     * 按钮不可用状态的属性或其drawable的属性的集合。
     */
    disabledState: object;

    /**
     * 按钮按下状态的属性或其drawable的属性的集合。
     */
    downState: object;

    /**
     * 指示按钮是否可用。默认为true。只读属性。
     */
    enabled: boolean;

    /**
     * 按钮经过状态的属性或其drawable的属性的集合。
     */
    overState: object;

    /**
     * 按钮的状态名称。它是 Button.UP|OVER|DOWN|DISABLED 之一。 只读属性。
     */
    state: string;

    /**
     * 按钮弹起状态的属性或其drawable的属性的集合。
     */
    upState: object;

    /**
     * 当设置为true时，表示指针滑过按钮上方时是否显示手形光标。默认为true。
     */
    useHandCursor: boolean;

    /**
     * 按钮弹起状态的常量值，即：'up'。
     */
    static UP: string;

    /**
     * 按钮经过状态的常量值，即：'over'。
     */
    static OVER: string;

    /**
     * 按钮按下状态的常量值，即：'down'。
     */
    static DOWN: string;

    /**
     * 按钮不可用状态的常量值，即：'disabled'。
     */
    static DISABLED: string;

  }

  /**
   * CacheMixin是一个包含cache功能的mixin。可以通过 Class.mix(target, CacheMixin) 来为target增加cache功能。
   */
  interface CacheMixin {

    /**
     * 缓存到图片里。可用来提高渲染效率。
     * @param forceUpdate 是否强制更新缓存
     */
    cache(forceUpdate?: boolean): void;

    /**
     * 设置缓存是否dirty
     * @param dirty 是否dirty
     */
    setCacheDirty(dirty: boolean): void;

    /**
     * 更新缓存
     */
    updateCache(): void;

  }

  /**
   * Container是所有容器类的基类。每个Container都可以添加其他可视对象为子级。
   */
  class Container extends View {

    constructor(properties?: object);

    /**
     * 在最上面添加子元素。
     */
    addChild(child: View);

    /**
     * 在指定索引位置添加子元素。
     */
    addChildAt(child: View, index: number);

    /**
     * 返回是否包含参数指定的子元素。
     */
    contains(child: View);

    /**
     * 返回指定索引位置的子元素。
     */
    getChildAt(index: number);

    /**
     * 返回指定id的子元素。
     */
    getChildById(id: string);

    /**
     * 返回指定子元素的索引值。
     */
    getChildIndex(child: View);

    /**
     * 返回容器的子元素的数量。
     */
    getNumChildren(): number;

    /**
     * 返回由x和y指定的点下的对象。
     */
    getViewAtPoint(x: number, y: number, usePolyCollision: boolean, global?: boolean, eventMode?: boolean);

    /**
     * 删除所有的子元素。
     */
    removeAllChildren(): Container;

    /**
     * 删除指定的子元素。
     */
    removeChild(child: View): View;

    /**
     * 在指定索引位置删除子元素。
     */
    removeChildAt(index: number): View;

    /**
     * 删除指定id的子元素。
     */
    removeChildById(id: string): View;

    /**
     * 设置子元素的索引位置。
     */
    setChildIndex(child: View, index: number);

    /**
     * 根据指定键值或函数对子元素进行排序。
     */
    sortChildren(keyOrFunction: object);

    /**
     * 交换两个子元素的索引位置。
     */
    swapChildren(child1: View, child2: View);

    /**
     * 交换两个指定索引位置的子元素。
     */
    swapChildrenAt(index1: number, index2: number);

    /**
     * 容器的子元素列表。只读。
     */
    children: object[];

    /**
     * 指示是否裁剪超出容器范围的子元素。默认为false。
     */
    clipChildren: boolean;

    /**
     * 指示容器的子元素是否能响应用户交互事件。默认为true。
     */
    pointerChildren: boolean;

  }

  /**
   * DOMElement是dom元素的包装。 
   */
  class DOMElement extends View {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。特殊属性有：
     * element - 要包装的dom元素。必需。
     */
    constructor(properties?: object);
  }


  /**
   * Drawable是可绘制图像的包装。
   */
  class Drawable {

    /**
     * 
     * 构造函数
     */
    constructor(properties: object);

    /**
     * 初始化可绘制对象。
     */
    init(properties: object);

    /**
     * 判断参数elem指定的元素是否可包装成Drawable对象。
     * @param elem 要测试的对象。
     * @returns 如果是可包装成Drawable对象则返回true，否则为false。
     */
    static isDrawable(elem: object): boolean;

    /**
     * 要绘制的图像。即可被CanvasRenderingContext2D.drawImage使用的对象类型，可以是HTMLImageElement、HTMLCanvasElement、HTMLVideoElement等对象。
     */
    image: object;

    /**
     * 要绘制的图像的矩形区域。
     */
    rect: number[];
  }
  class CacheMixinView extends View implements CacheMixin {
    /**
     * 缓存到图片里。可用来提高渲染效率。
     * @param forceUpdate 是否强制更新缓存
    */
    cache(forceUpdate?: boolean): void;

    /**
     * 设置缓存是否dirty
     * @param dirty 是否dirty
     */
    setCacheDirty(dirty: boolean): void;

    /**
     * 更新缓存
     */
    updateCache(): void;
  }
  /**
   * Graphics类包含一组创建矢量图形的方法。 
   */
  class Graphics extends CacheMixinView {

    /**
     * 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: Object);

    /**
     * 开始一个位图填充样式。
     */
    beginBitmapFill(image: HTMLImageElement, repetition: string): Graphics;

    /**
     * 指定绘制图形的填充样式和透明度。
     */
    beginFill(fill: string, alpha?: number): Graphics;

    /**
     * 指定绘制图形的线性渐变填充样式。
     */
    beginLinearGradientFill(x0: number, y0: number, x1: number, y1: number, colors: Array<object>, ratios: Array<object>): Graphics;

    /**
     * 开始一个新的路径。
     */
    beginPath(): Graphics;

    /**
     * 指定绘制图形的放射性渐变填充样式。
     */
    beginRadialGradientFill(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, colors: Array<object>, ratios: Array<object>): Graphics;

    /**
     * 绘制从当前位置开始到点(x, y)结束的贝塞尔曲线。
     */
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphics;

    /**
     * 清除所有绘制动作并复原所有初始状态。
     */
    clear(): Graphics;

    /**
     * 关闭当前的路径。
     */
    closePath(): Graphics;

    /**
     * 绘制一个圆。
     */
    drawCircle(x: number, y: number, radius: number): Graphics;

    /**
     * 绘制一个椭圆。
     */
    drawEllipse(x: number, y: number, width: number, height: number): Graphics;

    /**
     * 绘制一个矩形。
     */
    drawRect(x: number, y: number, width: number, height: number): Graphics;

    /**
     * 绘制一个圆角矩形。
     */
    drawRoundRect(x: number, y: number, width: number, height: number, cornerSize: number): Graphics;

    /**
     * 绘制一个复杂的圆角矩形。
     */
    drawRoundRectComplex(x: number, y: number, width: number, height: number, cornerTL: number, cornerTR: number, cornerBR: number, cornerBL: number): Graphics;

    /**
     * 根据参数指定的SVG数据绘制一条路径。 代码示例:
     * var path = 'M250 150 L150 350 L350 350 Z';
     * var shape = new Hilo.Graphics({width:500, height:500});
     * shape.drawSVGPath(path).beginFill('#0ff').endFill();
     */
    drawSVGPath(pathData: string): Graphics;

    /**
     * 应用并结束笔画的绘制和图形样式的填充。
     */
    endFill(): Graphics;

    /**
     * 指定绘制图形的线条样式。
     */
    lineStyle(thickness: number, lineColor?: string, lineAlpha?: number, lineCap?: string, lineJoin?: string, miterLimit?: number): Graphics;

    /**
     * 绘制从当前位置开始到点(x, y)结束的直线。
     */
    lineTo(x: number, y: number): Graphics;

    /**
     * 将当前绘制位置移动到点(x, y)。
     */
    moveTo(x: number, y: number): Graphics;

    /**
     * 绘制从当前位置开始到点(x, y)结束的二次曲线。
     */
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Graphics;

    /**
     * 内容填充的透明度。默认值为0。只读属性。
     */
    fillAlpha: number;

    /**
     * 内容填充的样式。默认值为'0'，即黑色。只读属性。
     */
    fillStyle: string;

    /**
     * 笔画的线条透明度。默认为1。只读属性。
     */
    lineAlpha: number;

    /**
     * 笔画的线条端部样式。可选值有：butt、round、square等，默认为null。只读属性。
     */
    lineCap: string;

    /**
     * 笔画的线条连接样式。可选值有：miter、round、bevel等，默认为null。只读属性。
     */
    lineJoin: string;

    /**
     * 笔画的线条宽度。默认为1。只读属性。s
     */
    lineWidth: number;

    /**
     * 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效。默认值为10。只读属性。s
     */
    miterLimit: number;

    /**
     * 笔画边框的样式。默认值为'0'，即黑色。只读属性。
     */
    strokeStyle: string;

  }

  /**
   * 动画精灵类。 
   */
  class Sprite extends View {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。此外还包括：精灵动画的帧数据对象。
     */
    constructor(properties?: object);

    /**
     * 往精灵动画序列中增加帧。
     * @param frame 要增加的精灵动画帧数据。
     * @param startIndex 开始增加帧的索引位置。若不设置，默认为在末尾添加。
     * @returns Sprite对象本身。
     */
    addFrame(frame: object, startIndex?: number): Sprite;

    /**
     * 获取精灵动画序列中指定的帧。
     * @param indexOrName 要获取的帧的索引位置或别名。
     * @returns 精灵帧对象。
     */
    getFrame(indexOrName: object): object;

    /**
     * 获取精灵动画序列中指定帧的索引位置。
     * @param frameValue 要获取的帧的索引位置或别名。
     * @returns 精灵帧对象。
     */
    getFrameIndex(frameValue: object): object;

    /**
     * 返回精灵动画的总帧数。
     */
    getNumFrames(): number;

    /**
     * 跳转精灵动画到指定的帧。
     * @param indexOrName 要跳转的帧的索引位置或别名。
     * @param pause 指示跳转后是否暂停播放。
     * @returns Sprite对象本身。
     */
    goto(indexOrName: object, pause?: boolean): Sprite;

    /**
     * 播放精灵动画。
     * @returns Sprite对象本身。
     */
    play(): Sprite;

    /**
     * 设置精灵动画序列指定索引位置的帧。
     * @param frame 要设置的精灵动画帧数据。
     * @param index 要设置的索引位置。
     * @returns Sprite对象本身。
     */
    setFrame(frame: object, index: number): Sprite;

    /**
     * 设置指定帧的回调函数。即每当播放头进入指定帧时调用callback函数。若callback为空，则会删除回调函数。
     * @param frame 要指定的帧的索引位置或别名。
     * @param callback 指定回调函数。
     */
    setFrameCallback(frame: number | string, callback: Function): Sprite

    /**
     * 暂停播放精灵动画。
     */
    stop(): void;

    /**
     * 当前播放帧的索引。从0开始。只读属性。
     */
    currentFrame: number;

    /**
     * 精灵动画的帧间隔。如果timeBased为true，则单位为毫秒，否则为帧数。
     */
    interval: number;

    /**
     * 判断精灵是否可以循环播放。默认为true。
     */
    loop: boolean;

    /**
     * 精灵动画的播放头进入新帧时的回调方法。默认值为null。此方法已废弃，请使用addFrameCallback方法。
     */
    onEnterFrame: Function;

    /**
     * 判断精灵是否暂停。默认为false。
     */
    paused: boolean;

    /**
     * 指定精灵动画是否是以时间为基准。默认为false，即以帧为基准。
     */
    timeBased: boolean;

  }

  interface IStageProperties {

    /**
     * 指定舞台在页面中的父容器元素。它是一个dom容器或id。若不传入此参数且canvas未被加入到dom树，则需要在舞台创建后手动把舞台画布加入到dom树中，否则舞台不会被渲染。
     */
    container?: string | HTMLElement;

    /**
     * 指定渲染方式，canvas|dom|webgl，默认canvas。
     */
    renderType?: string;

    /**
     * 指定舞台所对应的画布元素。它是一个canvas或普通的div，也可以传入元素的id。若为canvas，则使用canvas来渲染所有对象，否则使用dom+css来渲染。
     */
    canvas?: string | HTMLCanvasElement | HTMLElement;

    /**
     * 指定舞台的宽度。默认为canvas的宽度。
     */
    width?: number;

    /**
     * 指定舞台的高度。默认为canvas的高度。
     */
    height?: number;

    /**
     * 指定舞台是否停止渲染。默认为false。s
     */
    paused?: boolean;

    /**
     * 指定舞台实际大小，X轴缩放，高清自适应使用。
     */
    scaleX?: number;

    /**
     * 同上， Y 轴缩放,
     */
    scaleY?: number;
  }

  /**
   * 舞台是可视对象树的根，可视对象只有添加到舞台或其子对象后才会被渲染出来。创建一个hilo应用一般都是从创建一个stage开始的。 
   */
  class Stage extends Container {

    /**
     * 
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: IStageProperties);

    /**
     * 开启/关闭舞台的DOM事件响应。要让舞台上的可视对象响应用户交互，必须先使用此方法开启舞台的相应事件的响应。
     */
    enableDOMEvent(type: string | Array<object>, enabled?: boolean): Stage;

    /**
     * 改变舞台的大小。
     */
    resize(width: number, height: number, forceResize?: boolean): void;

    /**
     * 调用tick会触发舞台的更新和渲染。开发者一般无需使用此方法。
     */
    tick(delta: number): void;

    /**
     * 更新舞台在页面中的可视区域，即渲染区域。当舞台canvas的样式border、margin、padding等属性更改后，需要调用此方法更新舞台渲染区域。
     */
    updateViewport(): object;

    /**
     * 舞台所对应的画布。它可以是一个canvas或一个普通的div。只读属性。
     */
    canvas: HTMLCanvasElement | HTMLElement;

    /**
     * 指示舞台是否暂停刷新渲染。
     */
    paused: boolean;

    /**
     * 舞台渲染器。只读属性。
     */
    renderer: Renderer;

    /**
     * 舞台内容在页面中的渲染区域。包含的属性有：left、top、width、height。只读属性。
     */
    viewport: object;

  }


  interface IHiloPoint {
    x: number;
    y: number;
  }

  class Text extends CacheMixinView {

    /**
     * @param properties 创建对象的属性参数。可包含此类所有可写属性。
     */
    constructor(properties?: object);

    /**
     * 缓存到图片里。可用来提高渲染效率。
     * @param forceUpdate 是否强制更新缓存
     */
    cache(forceUpdate: boolean): void;

    /**
     * 设置缓存是否dirty
     * @param dirty 是否dirty
     */
    setCacheDirty(dirty: boolean): void;

    /**
     * 设置文本的字体CSS样式。
     * @param font 指定要测算的字体样式。
     */
    setFont(font: string): Text;

    /**
     * 更新缓存
     */
    updateCache(): void;

    /**
     * 测算指定字体样式的行高。
     * @param font 要设置的字体CSS样式。
     */
    static measureFontHeight(font: string): number;

    /**
     * 指定使用的字体颜色。
     */
    color: string;

    /**
     * 文本的字体CSS样式。只读属性。设置字体样式请用setFont方法。
     */
    font: string;

    /**
     * 指定文本的行距。单位为像素。默认值为0。
     */
    lineSpacing: number;

    /**
     * 指定文本的最大宽度。默认值为200。
     */
    maxWidth: number;

    /**
     * 指定文本是绘制边框还是填充。
     */
    outline: boolean;

    /**
     * 指定要显示的文本内容。
     */
    text: string;

    /**
     * 指定文本的对齐方式。可以是以下任意一个值：'start', 'end', 'left', 'right', and 'center'。注意：必须设置文本的 width 属性才能生效。
     */
    textAlign: string;

    /**
     * 指示文本内容的高度，只读属性。仅在canvas模式下有效。
     */
    textHeight: number;

    /**
     * 指定文本的垂直对齐方式。可以是以下任意一个值：'top', 'middle', 'bottom'。注意：必须设置文本的 height 属性才能生效。
     */
    textVAlign: string;

    /**
     * 指示文本内容的宽度，只读属性。仅在canvas模式下有效。
     */
    textWidth: number;

  }


  /**
   * View类是所有可视对象或组件的基类。
   */
  class View extends EventClass {

    constructor(properties?: object);

    /**
     * 添加此对象到父容器。
     */
    addTo(container: Container | HTMLElement, index?: number): View;

    /**
     * 获取可视对象在舞台全局坐标系内的外接矩形以及所有顶点坐标。
     */
    getBounds(): number[];

    /**
     * 返回可视对象缩放后的高度。
     */
    getScaledHeight(): number;

    /**
     * 返回可视对象缩放后的宽度。
     */
    getScaledWidth(): number;

    /**
     * 返回可视对象的舞台引用。若对象没有被添加到舞台，则返回null。
     */
    getStage(): Stage;

    /**
     * 检测object参数指定的对象是否与其相交。
     */
    hitTestObject(object: View, usePolyCollision?: boolean): void;

    /**
     * 检测由x和y参数指定的点是否在其外接矩形之内。
     */
    hitTestPoint(x: number, y: number, usePolyCollision?: boolean): boolean;

    /**
     * 从父容器里删除此对象。
     */
    removeFromParent(): View

    /**
     * 可视对象的具体渲染逻辑。子类可通过覆盖此方法实现自己的渲染。
     */
    render(renderer: Renderer, delta: number);

    /**
     * 返回可视对象的字符串表示。
     */
    toString(): string;

    /**
     * 可视对象相对于父容器的对齐方式。取值可查看Hilo.align枚举对象。
     */
    align: string | Function;

    /**
     * 可视对象的透明度。默认值为1。
     */
    alpha: number;

    /**
     * 可视对象的背景样式。可以是CSS颜色值、canvas的gradient或pattern填充。
     */
    background: object;

    /**
     * 可视对象的区域顶点数组。格式为：[{x:10, y:10}, {x:20, y:20}]。
     */
    boundsArea: Array<IHiloPoint>;

    /**
     * 可视对象的深度，也即z轴的序号。只读属性。
     */
    depth: number;

    /**
     * 可视对象的可绘制对象。供高级开发使用。
     */
    drawable: Drawable;

    /**
     * 可视对象的高度。默认值为0。
     */
    height: number;

    /**
     * 可视对象的唯一标识符。
     */
    id: string;

    /**
     * 可视对象的遮罩图形。
     */
    mask: Graphics;

    /**
     * 更新可视对象，此方法会在可视对象渲染之前调用。此函数可以返回一个Boolean值。若返回false，则此对象不会渲染。默认值为null。 
     * 限制：如果在此函数中改变了可视对象在其父容器中的层级，当前渲染帧并不会正确渲染，而是在下一渲染帧。可在其父容器的onUpdate方法中来实现。
     * 默认值: null
     * @param dt 
     */
    onUpdate: (dt?: number) => void | boolean;

    /**
     * 可视对象的父容器。只读属性
     */
    parent: Container;

    /**
     * 可视对象的中心点的x轴坐标。默认值为0。
     */
    pivotX: number;

    /**
     * 可视对象的中心点的y轴坐标。默认值为0。
     */
    pivotY: number;

    /**
     * 可视对象是否接受交互事件。默认为接受交互事件，即true。
     */
    pointerEnabled: boolean;

    /**
     * 可视对象的旋转角度。默认值为0。
     */
    rotation: number;

    /**
     * 可视对象在x轴上的缩放比例。默认为不缩放，即1。
     */
    scaleX: number;

    /**
     * 可视对象在y轴上的缩放比例。默认为不缩放，即1。
     */
    scaleY: number;

    /**
     * 可视对象的附加颜色，默认0xFFFFFF，只支持WebGL模式。
     */
    tint: number;

    /**
     * 可视对象是否可见。默认为可见，即true。
     */
    visible: boolean;

    /**
     * 可视对象的宽度。默认值为0。
     */
    width: number;

    /**
     * 可视对象的x轴坐标。默认值为0。
     */
    x: number;

    /**
     * 可视对象的y轴坐标。默认值为0。
     */
    y: number;

  }

}
