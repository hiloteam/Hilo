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

var gameContainer = document.getElementById("game-container");
gameContainer.style.height = winWidth - gameContainer.offsetTop + 'px';

var stageWidth = winWidth;
var stageHeight = winHeight - gameContainer.offsetTop;
window.console = window.console||{log:function(){}};
