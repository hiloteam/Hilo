var Class = Hilo.Class;
var Container = Hilo.Container;
var Bitmap = Hilo.Bitmap;
var Sprite = Hilo.Sprite;

/**
 * TiledMap
 * @property {Object} data 地图数据
 * @property {Object} getImage 获取图片方法
 */
var TiledMap = Class.create({
    Extends:Container,
    Statics:{
        renderOrder:{
            RIGHT_DOWN:'right_down',
            RIGHT_UP:'right_up',
            LEFT_DOWN:'left_down',
            LEFT_UP:'left_up'
        },
        mapType:{
            ORTHOGONAL:'orthogonal',
            STAGGERED:'staggered',
            HEXAGONAL:'hexagonal'
        },
        layerType:{
            TILELAYER:'tilelayer',
            OBJECTGROUP:'objectgroup',
            IMAGELAYER:'imagelayer'
        }
    },
    constructor:function(properties){
        TiledMap.superclass.constructor.call(this, properties);
        if(this.data){
            this.parseData(this.data);
            console.log('mapData:', this.data);
        }
    },
    data:{},
    orientation:null,
    renderOrder:null,
    col:0,
    row:0,
    tileWidth:0,
    tileHeight:0,
    _tilesetDict:{},
    getImage:function(src){
        return src;
    },
    /**
     * 解析地图数据
     * @param  {Object} data 地图数据
     */
    parseData:function(data){
        this.data = data;
        this.orientation = data.orientation;
        this.renderOrder = data.renderorder;
        this.tileWidth = data.tilewidth;
        this.tileHeight = data.tileheight;
        this.col = data.width;
        this.row = data.height;
        this.width = this.col * data.tilewidth;
        this.height = this.row * data.tileheight;
        this.version = data.version;
        this.background = data.backgroundcolor;

        var tileset = new Tileset(data.tilesets);
        switch(this.orientation){
            case TiledMap.mapType.ORTHOGONAL:
                break;
            default:
                console.error("Hilo TiledMap not support " + this.orientation);
                break;
        }
    }
});

