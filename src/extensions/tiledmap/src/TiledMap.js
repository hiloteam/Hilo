var TiledMap = tiledMap.TiledMap = {
    create:function(mapData){
        return this.parseData(mapData);
    },
    /**
     * 解析地图数据
     * @param  {Object} data 地图数据
     */
    parseData:function(mapData){
        var that = this;
        var map = {};
        map.mapData = mapData;
        map.orientation = mapData.orientation;
        map.renderOrder = mapData.renderorder;
        map.tilewidth = mapData.tilewidth;
        map.tileheight = mapData.tileheight;
        map.col = mapData.width;
        map.row = mapData.height;
        map.width = map.col * mapData.tilewidth;
        map.height = map.row * mapData.tileheight;
        map.version = mapData.version;
        map.background = mapData.backgroundcolor;

        var tileDict = map.tileDict = Tileset.create(mapData.tilesets);
        var layers = map.layers = Layer.create(mapData, tileDict);
        switch(map.orientation){
            case tiledMap.mapType.ORTHOGONAL:
            default:
                layers.forEach(function(layer){
                    if(layer.children){
                        layer.children.forEach(function(child){
                            if(child.col !== undefined && child.row !== undefined){
                                var tileset = child.tileset;
                                child.x = child.col * map.tilewidth;
                                child.y = child.row * map.tileheight + map.tileheight - tileset.tileheight;

                                child.x += tileset.tilewidth * .5;
                                child.y += tileset.tileheight * .5;
                            }
                        });
                    }
                });
                break;
        }
        return map;
    }
};