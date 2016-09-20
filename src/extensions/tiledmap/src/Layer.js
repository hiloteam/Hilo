var Class = Hilo.Class;
var Layer =  Class.create({
    layers:[],
    tileset:null,
    Statics:{
        TILELAYER:'tilelayer',
        OBJECTGROUP:'objectgroup',
        IMAGELAYER:'imagelayer'
    },
    constructor:function(layers, tileset){
        var that = this;
        that.layers = [];
        that.tileset = tileset;
        layers.forEach(function(layerData){
            var layer;
            switch(layerData.type){
                case Layer.TILELAYER:
                    layer = that._parseTileLayer(layerData);
                    break;
                case Layer.IMAGELAYER:
                    layer = that._parseImageLayer(layerData);
                    break;
                case Layer.OBJECTGROUP:
                    layer = that._parseObjectGroup(layerData);
                    break;
            }
            if(layer){
                that.layers.push(layer);
            }
        });
    },
    _parseTileLayer:function(layerData){
        var that = this;
        var w = that.tileWidth;
        var h = that.tileHeight;
        var col = that.col;
        var row = that.row;

        var layer = that._createLayer(layerData);
        layer.children = [];

        var tileDict = that.tileset.tileDict;
        var children = layer.children;
        layerData.data.forEach(function(tileGid, index){
            if(tileGid !== 0){
                var tileData = tileDict[tileGid];
                if(tileData){
                    tileData.col = index%col;
                    tileData.row = Math.floor(index/col);
                    children.push(tileData);
                }
            }
        });
        return layer;
    },
    _parseImageLayer:function(layerData){
        var layer = this._createLayer(layerData);
        layer.image = layerData.image;
        return layer;
    },
    _parseObjectGroup:function(layerData){
        var layer = this._createLayer(layerData);
    },
    _createLayer:function(layerData){
        var layer = {
            type:layerData.type,
            alpha:layerData.opacity,
            visible:layerData.visible,
            offsetx:layerData.offsetx,
            offsety:layerData.offsety,
            name:layerData.name
        };

        if(layerData.properties){
            layer.properties = layerData.properties;
        }

        return layer;
    }
});