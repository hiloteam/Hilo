var Layer = tiledMap.Layer = {
    /**
     * 生成地图层数组 layers
     * @param  {Object} mapData  地图数据
     * @param  {Object} tileDict 图块集合
     * @return {Array}  layers 地图层数组
     */
    create:function(mapData, tileDict){
        var that = this;
        var layers = [];
        var col = mapData.width;
        var row = mapData.height;
        mapData.layers.forEach(function(layerData){
            var layer;
            switch(layerData.type){
                case tiledMap.layerType.TILELAYER:
                    layer = that._parseTileLayer(layerData, tileDict, col, row);
                    break;
                case tiledMap.layerType.IMAGELAYER:
                    layer = that._parseImageLayer(layerData);
                    break;
                case tiledMap.layerType.OBJECTGROUP:
                    layer = that._parseObjectGroup(layerData, tileDict);
                    break;
            }
            if(layer){
                layers.push(layer);
            }
        });

        return layers;
    },
    /**
     * 解析地图块层
     * @param  {Object}
     * @param  {Object} tileDict
     * @param  {Number} col
     * @param  {Number} row
     * @return {Layer}
     */
    _parseTileLayer:function(layerData, tileDict, col, row){
        var that = this;

        var layer = that._createLayer(layerData);
        var children = layer.children = [];

        layerData.data.forEach(function(tileGid, index){
            if(tileGid !== 0){
                var tileData = that._getTileData(tileGid, tileDict);
                if(tileData){
                    tileData.col = index%col;
                    tileData.row = Math.floor(index/col);
                    children.push(tileData);
                }
            }
        });
        return layer;
    },
    /**
     * 解析图片图层
     * @param  {Object} layerData
     * @return {Layer}
     */
    _parseImageLayer:function(layerData){
        var layer = this._createLayer(layerData);
        tiledMap.merge(layer, {
            image:layerData.image
        });
        return layer;
    },
    /**
     * 解析对象层
     * @param  {Object} layerData
     * @param  {Object} tileDict
     * @return {Layer}
     */
    _parseObjectGroup:function(layerData, tileDict){
        var that = this;
        var layer = that._createLayer(layerData);
        var children = layer.children = [];
        layerData.objects.forEach(function(objectData){
            var tileData = that._getTileData(objectData.gid, tileDict);
            if(tileData){
                tiledMap.merge(tileData, {
                    x:objectData.x,
                    y:objectData.y,
                    pivotX:0,
                    pivotY:objectData.height,
                    rotation:objectData.rotation,
                    width:objectData.width,
                    height:objectData.height,
                    visible:objectData.visible,
                    type:objectData.type,
                    properties:objectData.properties,
                    name:objectData.name
                });
                children.push(tileData);
            }
        });
        return layer;
    },
    /**
     * 生成图层数据
     * @param  {Object} layerData
     * @return {Layer}
     */
    _createLayer:function(layerData){
        var layer = {
            type:layerData.type,
            alpha:layerData.opacity,
            visible:layerData.visible,
            x:layerData.offsetx||0,
            y:layerData.offsety||0,
            name:layerData.name
        };

        if(layerData.properties){
            layer.properties = layerData.properties;
        }

        return layer;
    },
    /**
     * 获取地图块数据
     * @param  {Nubmer} gid 地图块gid
     * @param  {Object} tileDict
     * @return {Object}
     */
    _getTileData:function(gid, tileDict){
        var tilesetData = tileDict[gid & tiledMap.flag.CLEAR]
        if(tilesetData){
            var tileData = {
                tileset:tilesetData
            };
            if (gid & tiledMap.flag.FLIP_X) {
                tileData.scaleX = -1;
                tileData.scaleY = 1;
            } else if (gid & tiledMap.flag.FLIP_Y) {
                tileData.scaleX = 1;
                tileData.scaleY = -1;
            } else {
                tileData.scaleX = 1;
                tileData.scaleY = 1;
            }

            if(gid & tiledMap.flag.ROTATION){
                tileData.rotation = 90;
            }
            else{
                tileData.rotation = 0;
            }

            tileData.pivotX = tilesetData.tilewidth * 0.5;
            tileData.pivotY = tilesetData.tileheight * 0.5;
            return tileData;
        }
    }
};

/*
tileData(TileLayer){
    tileset:tilesetData,
    col:col,
    row:row,
    x:x,
    y:y,
    scaleX:scaleX,
    scaleY:scaleY,
    pivotX:pivotX,
    pivotY:pivotY,
    rotation:rotation,
    properties:properties,
    visible:visible,
    type:type,
    name:name,
}

tileData(ObjectGroup){
    tileset:tilesetData,
    col:col,
    row:row,
    x:x,
    y:y,
    scaleX:scaleX,
    scaleY:scaleY,
    pivotX:pivotX,
    pivotY:pivotY,
    rotation:rotation,
    properties:properties,
    visible:visible,
    type:type,
    name:name,
}
 */