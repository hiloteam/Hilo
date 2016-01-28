package
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display.LoaderInfo;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLRequest;
	import flash.system.LoaderContext;
	import flash.utils.Dictionary;

	public class ImageLoader
	{
		static private var _imgPool:Object = {};
		static private var _srcDict:Dictionary = new Dictionary;
		static private var _callbackDict:Object = {};
		static private var _flashCallbackDict:Object = {};
		
		public function ImageLoader()
		{
			
		}
		
		static public function load(src:String, successCallback:Function, errorCallback:Function = null):void
		{
			if(_imgPool[src]){
				successCallback(src, _imgPool[src]);
				return;
			}

			if(_callbackDict[src]){
				(_callbackDict[src] as Vector.<Object>).push({
					success:successCallback,
					error:errorCallback
				});
				return;
			}

			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onCompleteHandler, false, 0, true);
			loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onErrorHandler, false, 0, true);

			_callbackDict[src] = new Vector.<Object>();

			(_callbackDict[src] as Vector.<Object>).push({
				success:successCallback,
				error:errorCallback
			});
			_srcDict[loader] = src;

			loader.load(new URLRequest(src), new LoaderContext(true));
		}
		
		static public function jsLoad(src:String):void
		{
			if(!_flashCallbackDict[src]){
				_flashCallbackDict[src] = true;
				load(src, onFlashLoadSuccess, onFlashLoadError)
			}
		}
		
		static public function getBitmapdata(src:String):BitmapData
		{
			return _imgPool[src];
		}
		
		static private function onCompleteHandler(e:Event):void
		{
			var info:LoaderInfo = e.currentTarget as LoaderInfo;
			var src:String = _srcDict[info.loader];
			delete _srcDict[info.loader];

			var bmp:Bitmap = info.loader.content as Bitmap;
			_imgPool[src] = bmp.bitmapData;
			
			
			var callbacks:Vector.<Object> = _callbackDict[src];
			delete _callbackDict[src];

			for(var i:int = 0, l:int = callbacks.length;i < l;i ++){
				callbacks[i].success(src, bmp.bitmapData);
			}
		}
				
		static private function onErrorHandler(e:Event):void
		{
			var info:LoaderInfo = e.currentTarget as LoaderInfo;
			var src:String = _srcDict[info.loader];
			delete _srcDict[info.loader];

			var callbacks:Vector.<Object> = _callbackDict[src];
			delete _callbackDict[src];

			for(var i:int = 0, l:int = callbacks.length;i < l;i ++){
				callbacks[i].error && callbacks[i].error(src);
			}
		}
		
		static public function onFlashLoadSuccess(src:String, bmd:BitmapData):void
		{
			ExternalInterface.available && ExternalInterface.call("Hilo.__flashImageCallBack", src, 0, bmd.width, bmd.height);
		}
		
		static public function onFlashLoadError(src:String):void
		{
			ExternalInterface.available && ExternalInterface.call("Hilo.__flashImageCallBack", src, 1);
		}
	}
}