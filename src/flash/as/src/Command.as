package
{
	import flash.display.DisplayObject;
	import flash.display.Stage;
	
	import view.Graphics;
	import view.Image;
	import view.Text;

	public class Command
	{
		private var _input:CommandArray;
		private var _pool:Object = {};
		private var _stage:Stage;
		
		public function Command(stage:Stage)
		{
			_stage = stage;
		}
		
		private function loadImage():void{
			var src:String = _input.readString();
			ImageLoader.jsLoad(src);
		}
		
		public function parse(data:String):void
		{
			if(!_input || _input.position >= _input.length){
				_input = new CommandArray(data);
			}
			else{
				_input.concat(data);
			}
			while(_input.position < _input.length){
				var cmd:String = _input.readString();
				this[cmd]();
			}
		}
		
		public function resize():void
		{
			var w:int = _input.readInt();
			var h:int = _input.readInt();
			_stage.stageWidth = w;
			_stage.stageHeight = h;
		}
		
		public function removeChild():void{
			var pid:String = _input.readString();
			var cid:String = _input.readString();

			_pool[pid].remove(_pool[cid]);
		}
		
		public function addChild():void{
			var pid:String = _input.readString();
			var cid:String = _input.readString();
			var index:int = _input.readInt();
			
			_pool[pid].add(_pool[cid]);
			_pool[cid].depth = index;
		}
		
		public function stageRemoveChild():void
		{
			var id:String = _input.readString();
			_stage.removeChild(_pool[id]);
		}
		
		public function stageAddChild():void
		{
			var id:String = _input.readString();
			_stage.addChild(_pool[id]);
		}
		
		public function create():void
		{
			var id:String = _input.readString();
			var type:String = _input.readString();
			
			var obj:DisplayObject;
			switch(type){
				case "Text":
					obj = new Text(id); 
					break;
				case "Graphics":
					obj = new Graphics(id);
					break;
				default:
					obj = new Image(id);
					break;
			}
			_pool[id] = obj;
		}
		
		public function setImage():void
		{
			var id:String = _input.readString();
			var src:String = _input.readString();
			
			_pool[id].src = src;
		}
		
		public function setProp():void
		{
			var id:String = _input.readString()
			var prop:String = _input.readString();
			var value:* = _input.readValue();

			if(value === "false" || value === "true"){
				value = value === "true";
			}

			_pool[id][prop] = value;
		}
		
		public function setFps():void
		{
			var fps:Number = _input.readFloat();
			_stage.frameRate = fps;
		}
		
		public function audio():void
		{
			Audio.executeCommand(_input);
		}
		
		public function graphicsDraw():void
		{
			var fid:String = _input.readString();
			var commands:String = _input.readString();
			_pool[fid].draw(commands);
		}
		
		public function release():void
		{
			var fid:String = _input.readString();
			if(_pool[fid]){
				if(_pool[fid].parent){
					_pool[fid].parent.removeChild(_pool[fid]);
				}
				delete _pool[fid];
			}
		}
	}
}