var Class = Hilo.Class;
var Tileset =  Class.create({
    tileDict:{},
    constructor:function(tilesets){
        var that = this;
        that.tileDict = {};
        tilesets.forEach(function(tilesetData){
            if(tilesetData.image){
                that._parseTilesetImage(tilesetData);
            }
            else{
                that._parseImageCollection(tilesetData);
            }
        });
    },
    /**
     * 解析图块集合
     * @param  {[type]} tilesetData [description]
     * @return {[type]}             [description]
     */
    _parseTilesetImage:function(tilesetData){
        var that = this;
        var tileDict = that.tileDict;

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

        that._addTileProperties(firstgid, tilesetData.tileproperties);
        that._addTiles(firstgid, tilesetData.tiles);
    },
    /**
     * 解析图像集合
     * @param  {[type]} tilesetData [description]
     * @return {[type]}             [description]
     */
    _parseImageCollection:function(tilesetData){
        var that = this;
        var tileDict = that.tileDict;

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
                        gid:gid,
                        image:image,
                        animation:false,
                        tileheight:h,
                        tilewidth:w
                    };
                }
            }
        }

        that._addTileProperties(firstgid, tilesetData.tileproperties);
        that._addTiles(firstgid, tilesetData.tiles);
    },
    /**
     * 图块属性解析
     * @param {Number} firstgid
     * @param {Array} tiles
     */
    _addTiles:function(firstgid, tiles){
        var that = this;
        var tileDict = that.tileDict;
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
     */
    _addTileProperties:function(firstgid, properties){
        var that = this;
        var tileDict = this.tileDict;
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
});