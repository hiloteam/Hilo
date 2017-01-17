var renderTypeDict = {
     'canvas':'canvas',
     'dom':'dom',
     'webgl':'webgl',
     'forceFlash':'flash'
};

var renderType = location.search.slice(1);
if(!renderTypeDict[renderType]){
    renderType = 'canvas';
}

var winWidth = window.innerWidth || document.documentElement.clientWidth;
var winHeight = window.innerHeight || document.documentElement.clientHeight;

var headerElem = document.getElementsByTagName('header')[0];
if(location.search.indexOf('noHeader') < 0){
    headerElem.style.display = 'block';
    var renderTypeElem = document.createElement('div');
    headerElem.appendChild(renderTypeElem);
    for(var type in renderTypeDict){
        (function(type){
            var typeElem = document.createElement('div');
            typeElem.innerHTML = '<input type="radio" data-type="{type}">{type}</input>'.replace(/{type}/g, renderTypeDict[type]);
            typeElem.setAttribute('data-type', type);
            typeElem.style.cssText = 'display:inline;margin-left:10px;line-height:20px;cursor:pointer;height:40px;';
            typeElem.input = typeElem.children[0];
            renderTypeElem.appendChild(typeElem);
            if(type === renderType){
                typeElem.input.checked = true;
            }
            typeElem.onclick = function(){
                if(renderType !== type){
                    location.search = type;
                }
            }
        })(type);
    }
    renderTypeElem.style.cssText = 'position:absolute;right:5px;top:5px;';
}
else{
    winWidth = 550;
    winHeight = 400;
}

var gameContainer = document.getElementById("game-container");
var stageWidth = window.stageWidth||winWidth;
var stageHeight = window.stageHeight||(winHeight - gameContainer.offsetTop);
gameContainer.style.height = stageHeight + 'px';
gameContainer.style.width = stageWidth + 'px';

window.console = window.console||{log:function(){}};
Array.prototype.forEach = Array.prototype.each = Array.prototype.forEach || function(callback){
    for(var i = 0;i < this.length;i ++){
        callback(this[i], i, this);
    }
};




