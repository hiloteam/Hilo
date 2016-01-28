package view
{
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.Sprite;
	
	public class View extends Sprite
	{
		private var _id:String = "";
		protected var _content:DisplayObject;
		protected var _container:Sprite;
		protected var _depth:int = 0;
		protected var _width:Number = 0;
		protected var _height:Number = 0;
		protected var _pivotX:Number = 0;
		protected var _pivotY:Number = 0;
		protected var _background:String = "undefined";
		
		public function View(id:String = "")
		{
			super();
			_id = id;
			mouseChildren = mouseEnabled = false;		
		}
		
		public static function sortDepth(parent:DisplayObjectContainer, child:View):void
		{
			for(var i:int = 0, l:int = parent.numChildren;i < l;i ++){
				var c:View = parent.getChildAt(i) as View;
				if(c.depth > child.depth){
					parent.setChildIndex(child, i);
					return;
				}
			}
			parent.setChildIndex(child, parent.numChildren - 1);
		}
		
		public function add(child:View):DisplayObject
		{
			if(!container){
				container = new Sprite();
			}
			
			_container.addChild(child);
			sortDepth(_container, child);
			return this;
		}
		
		public function remove(child:DisplayObject):DisplayObject
		{
			return _container && _container.removeChild(child);
		}
		
		private function _renderBackground():void
		{
			graphics.clear();
			if(_background != "undefined"){
				var cssColor:CSSColor = CSSColor.toHex(_background);
				graphics.beginFill(cssColor.color, cssColor.alpha);
				graphics.drawRect(-_pivotX, -_pivotY, _width, _height);
				graphics.endFill();
			}
		}
		
		/* getter setter*/
		
		public function set depth(value:int):void
		{
			if(_depth != value){
				_depth = value;
				if(this.parent){
					sortDepth(this.parent, this);
				}
			}
		}
		
		public function get depth():int
		{
			return _depth;
		}
		
		public function set pivotX(value:Number):void
		{			
			if(_pivotX != value){
				_pivotX = value;
				if(_content){
					_content.x = -_pivotX;
				}
				if(_container){
					_container.x = -_pivotX;
				}
				
				_renderBackground();
			}
		}
		
		public function set pivotY(value:Number):void
		{
			if(_pivotY != value){
				_pivotY = value;
				if(_content){
					_content.y = -_pivotY;
				}
				if(_container){
					_container.y = -_pivotY;
				}
				
				_renderBackground();
			}
		}
		
		public function set container(value:Sprite):void
		{
			if(!_container){
				_container = value;
				_container.mouseChildren = _container.mouseEnabled = false;
				_container.x = -_pivotX;
				_container.y = -_pivotY;
				addChildAt(_container, 0);
			}
		}
		
		public function get container():Sprite
		{
			return _container;
		}
		
		public function set content(value:DisplayObject):void
		{
			if(_content && _content.parent){
				_content.parent.removeChild(_content);
			}
			_content = value;
			_content.x = -_pivotX;
			_content.y = -_pivotY;
			addChild(_content);
		}
		
		public function get content():DisplayObject
		{
			return _content;
		}
		
		public function set background(value:String):void
		{
			if(_background != value){
				_background = value;
				_renderBackground();
			}
		}
		
		public override function set width(value:Number):void
		{
			_width = value;
			_renderBackground();
		}
		
		public override function set height(value:Number):void
		{
			_height = value;
			_renderBackground();
		}
		
		public override function get width():Number
		{
			return _width;
		}
		
		public override function get height():Number
		{
			return _height;
		}
		
		public function get id():String
		{
			return _id;
		}
	}
}