var renderTypes = {
     'canvas':1,
     'dom':1,
     'webgl':1
};

var renderType = location.search.slice(1);
if(!renderTypes[renderType]){
    renderType = 'canvas';
}

var winWidth = window.innerWidth || document.documentElement.clientWidth;
var winHeight = window.innerHeight || document.documentElement.clientHeight;

var headerElem = document.getElementsByTagName('header')[0];
if(location.search.indexOf('noHeader') < 0){
    headerElem.style.display = 'block';
    var renderTypeElem = document.createElement('div');
    headerElem.appendChild(renderTypeElem);
    var renderTypes = ['canvas', 'dom', 'webgl'];
    renderTypes.forEach(function(type){
        var typeElem = document.createElement('div');
        typeElem.innerHTML = '<input type="radio" data-type="{type}">{type}</input>'.replace(/{type}/g, type);
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
    });
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




