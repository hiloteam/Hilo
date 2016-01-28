package view
{
	import flash.text.TextField;
	import flash.text.TextFormat;

	public class Text extends View
	{
		private var _textField:TextField;
		private var _text:String = "";
		private var _color:uint = 0xffffff;
		private var _alpha:Number = 1;
		private var _font:String;
		private var _format:TextFormat = new TextFormat();
		public function Text(id:String)
		{
			super(id);
			content = _textField = new TextField();
			_textField.wordWrap = true;
			_textField.defaultTextFormat = _format;
		}
		
		public function set text(value:String):void
		{
			_text = value;
			_textField.text = value;
		}
		
		public function set color(value:String):void
		{
			var color:Object = CSSColor.toHex(value);
			_color = color.color;
			_alpha = color.alpha;
			
			_textField.alpha = _alpha;
			_textField.textColor = _color;
		}
		
		public function set textAlign(value:String):void
		{
			_format.align = value;
			_textField.setTextFormat(_format);
		}
		
		public function set outline(value:String):void
		{
			
		}
		
		public function set lineSpacing(value:Number):void
		{
			_format.leading = value;
			_textField.setTextFormat(_format);
		}
		
		public function set font(value:String):void
		{
			_format.size = parseFloat(value.match(/[\d]+px(\/[\d]+(px)*)?/)[0]);
			_format.font = value.match(/([\d]+)px(\/[\d]+(px)*)?\s+([\s\S]+)/)[4].replace(/["']/g, "");
			
			_textField.setTextFormat(_format);
		}
		
		public override function set width(value:Number):void
		{
			_textField.width = value;
		}
		
		public override function set height(value:Number):void
		{
			_textField.height = value;
		}
		
		public function render():void
		{
			_textField.text = _text;
		}	
	}
}