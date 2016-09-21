var tiledMap = window.tiledMap = {
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
        IMAGELAYER:'imagelayer',
    },
    flag:{
        FLIP_X: 0x80000000,
        FLIP_Y: 0x40000000,
        ROTATION: 0x20000000,
        CLEAR: ~0xE0000000
    },
    merge:function(from, to){
        for(var key in to){
            from[key] = to[key];
        }
    }
};