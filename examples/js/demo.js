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

var headerElems = document.getElementsByTagName('header');
if(headerElems[0] && location.search.indexOf('noHeader') < 0){
    headerElems[0].style.display = 'block';
}
else{
    winWidth = 550;
    winHeight = 400;
}

var gameContainer = document.getElementById("game-container");
gameContainer.style.height = winHeight - gameContainer.offsetTop + 'px';

var stageWidth = winWidth;
var stageHeight = winHeight - gameContainer.offsetTop;
window.console = window.console||{log:function(){}};




