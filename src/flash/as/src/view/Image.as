package view
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.geom.Matrix;
	
	public class Image extends View
	{
		private var _bmd:BitmapData;
		private var _bmp:Bitmap;
		
		private var _src:String;
		public var _rect:String;
		
		public function Image(id:String)
		{
			super(id);		
		}
		
		public function set rect(rect:String):void
		{
			_rect = rect;
			_render();
		}
		
		public function set src(value:String):void
		{
			if(value && _src !== value){
				_src = value;
				_bmd = ImageLoader.getBitmapdata(_src);
				if(_bmd){
					_render();
				}
				else{
					ImageLoader.load(_src, function(src:String, bmd:BitmapData):void{
						if(src == _src){
							_bmd = bmd;
							_render();
						}
					});
				}
			}
		}
		
		private function _render():void
		{
			if(_bmd){
				if(!_bmp){
					content = _bmp = new Bitmap();
				}
				
				var bmd:BitmapData;
				if(_rect){
					var arr:Array = _rect.split(",");
					bmd = new BitmapData(arr[2], arr[3], true, 0x00000000);
					bmd.draw(_bmd, new Matrix(1, 0, 0, 1, -arr[0], -arr[1]), null, null, null, true);
				}
				else{
					bmd = _bmd;
				}
				_bmp.bitmapData = bmd;
				_bmp.smoothing = true;
			}
		}
		
	}
}