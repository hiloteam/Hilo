/**
 * Hilo
 * Copyright 2015 alibaba.com
 * Licensed under the MIT License
 */

(function(){

/**
 * 显示舞台上所有可视对象的外接矩形，即显示区域。可用于调试。
 */
Hilo.Stage.prototype.showDrawRect = function(show, lineColor){
    show = show !== false;
    lineColor = lineColor || '#f00';
    if(!this._oldRender) this._oldRender = this._render;

    if(show){
        this._render = function(renderer, delta){
            this._oldRender.call(this, renderer, delta);

            var ctx = renderer.context;
            if(ctx){
                ctx.save();
                ctx.lineWidth = 1;
                ctx.strokeStyle = lineColor;
            }
            drawRect(this, ctx, lineColor);
            if(ctx) ctx.restore();
        }
    }else{
        this._render = this._oldRender;
    }
};

function drawRect(stage, context, lineColor){
    for(var i = 0, len = stage.children.length; i < len; i++){
        var child = stage.children[i];
        if(child.children){
            drawRect(child, context);
        }else{
            if(context){
                var bounds = child.getBounds();

                context.beginPath();
                var p0 = bounds[0];
                context.moveTo((p0.x>>0)-0.5, (p0.y>>0)-0.5);
                for(var j = 1; j < bounds.length; j++){
                    var p = bounds[j];
                    context.lineTo((p.x>>0)-0.5, (p.y>>0)-0.5);
                }
                context.lineTo((p0.x>>0)-0.5, (p0.y>>0)-0.5);
                context.stroke();
                context.closePath();

                context.globalAlpha = 0.5;
                context.beginPath();
                context.rect((bounds.x>>0)-0.5, (bounds.y>>0)-0.5, bounds.width>>0, bounds.height>>0);
                context.stroke();
                context.closePath();
            }else{
                var domElem = child.drawable && child.drawable.domElement;
                if(domElem){
                    domElem.style.border = '1px solid ' + lineColor;
                }
            }
        }
    }
}

/**
 * 重写console.log方法，便于在移动端查看log日志。
 * 可通过选择器`.hilo-log`来设置日志div容器的样式。
 */
var console = window.console || {log:function(){}};
var oldLog = console.log;
console.log = function(){
    var args = [].slice.call(arguments);
    try{
        oldLog && oldLog.apply(console, args);
    }
    catch(e){
        oldLog && oldLog(args);
    }


    var msg = '';
    for(var i = 0, obj, len = args.length; i < len; i++){
        obj = args[i];
        if(typeof obj === 'string'){
            obj = obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        if(i == 0) msg = obj;
        else msg += ' ' + obj;
    }

    var logContainer = this._logContainer || (this._logContainer = getLogContainer());
    logContainer.innerHTML += '> ' + msg + '<br/>';
    logContainer.scrollTop = logContainer.scrollHeight - logContainer.clientHeight;
};

function getLogContainer(){
    var elem = new Hilo.createElement('div', {
        className: 'hilo-log',
        style: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            maxHeight: 200 + 'px',
            boxSizing: 'border-box',
            font: '12px Courier New',
            backgroundColor: Hilo.browser.supportCanvas?'rgba(0,0,0,0.2)':'#666',
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            overflowY: 'scroll',
            padding: '5px',
            zIndex: 1e6
        }
    });
    document.documentElement.appendChild(elem);

    return elem;
}

})();