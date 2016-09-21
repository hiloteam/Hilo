var Tileset = tiledMap.Tileset = {
    /**
     * 生成地图块集合tileDict
     * 地图块tileset格式：{
     *      type:'tileset',
     *      gid:gid,
     *      image:image,
     *      rect:[x, y, w, h'],
     *      animation:[
     *          {image:image1, duration:1000, rect:[0, 0, w, h]},
     *          {image:image2, duration:1000, rect:[0, 0, w, h]}
     *      ],
     *      tileheight:h,
     *      tilewidth:w,
     *      properties:{
     *         eg1:'eg1'
     *      }
     * }
     * @param  {Array} tilesets 地图块数据
     * @return {Object} tileDict 地图块集合
     */
    create:function(tilesets){
        var that = this;
        var tileDict = {};
        tilesets.forEach(function(tilesetData){
            if(tilesetData.image){
                that._parseTilesetImage(tilesetData, tileDict);
            }
            else{
                that._parseImageCollection(tilesetData, tileDict);
            }
        });
        return tileDict;
    },
    /**
     * 解析图块集合
     * @param  {Object} tilesetData
     * @param  {Object} tileDict
     */
    _parseTilesetImage:function(tilesetData, tileDict){
        var that = this;

        var w = tilesetData.tilewidth;
        var h = tilesetData.tileheight;
        var col = tilesetData.imagewidth / w;
        var row = tilesetData.imageheight / h;
        var firstgid = tilesetData.firstgid;
        var image = tilesetData.image;

        for(var i = 0;i < row;i ++){
            for(var j = 0;j < col;j ++){
                var id = (i * col) + j;
                var gid = that.getGid(firstgid, id);
                tileDict[gid] = {
                    type:'tileset',
                    gid:gid,
                    image:image,
                    rect:[j * w, i * h, w, h],
                    animation:false,
                    tileheight:h,
                    tilewidth:w
                };
            }
        }

        that._addTileProperties(firstgid, tilesetData.tileproperties, tileDict);
        that._addTiles(firstgid, tilesetData.tiles, tileDict);
    },
    /**
     * 解析图像集合
     * @param  {Object} tilesetData
     * @param  {Object} tileDict
     */
    _parseImageCollection:function(tilesetData, tileDict){
        var that = this;

        var w = tilesetData.tilewidth;
        var h = tilesetData.tileheight;
        var firstgid = tilesetData.firstgid;

        var tiles = tilesetData.tiles;
        if(tiles){
            for(var id in tiles){
                var tilesetData = tiles[id];
                var image = tilesetData.image;
                if(image){
                    var gid = that.getGid(firstgid, id);
                    tileDict[gid] = {
                        type:'image',
                        gid:gid,
                        image:image,
                        animation:false,
                        tileheight:h,
                        tilewidth:w
                    };
                }
            }
        }

        that._addTileProperties(firstgid, tilesetData.tileproperties, tileDict);
        that._addTiles(firstgid, tilesetData.tiles, tileDict);
    },
    /**
     * 图块属性解析
     * @param {Number} firstgid
     * @param {Array} tiles
     * @param {Object} tileDict
     */
    _addTiles:function(firstgid, tiles, tileDict){
        var that = this;
        if(tiles){
            for(var id in tiles){
                var gid = that.getGid(firstgid, id);
                var tileset = tileDict[gid];
                if(tileset){
                    var tilesetData = tiles[id];
                    if(tilesetData.animation){
                        tileset.animation = [];
                        tilesetData.animation.forEach(function(frame){
                            var frameTile = tileDict[that.getGid(firstgid, frame.tileid)];
                            if(frameTile){
                                tileset.animation.push({
                                    image:frameTile.image,
                                    rect:frameTile.rect,
                                    dutation:frame.duration
                                });
                            }
                        });
                    }
                }
            }
        }
    },
    /**
     * 图块自定义属性解析
     * @param {Number} firstgid
     * @param {Object} properties
     * @param {Object} tileDict
     */
    _addTileProperties:function(firstgid, properties, tileDict){
        var that = this;
        if(properties){
            for(var id in properties){
                var tileset = tileDict[that.getGid(firstgid, id)];
                if(tileset){
                    tileset.properties = properties[id];
                }
            }
        }
    },
    getGid:function(firstgid, id){
        return parseInt(firstgid) + parseInt(id);
    }
};