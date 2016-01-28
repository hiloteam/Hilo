package view
{
	import flash.display.GradientType;
	import flash.display.Shape;
	import flash.geom.Matrix;
	import flash.geom.Point;
	
	public class Graphics extends View
	{
		private var startPoint:Point = new Point();
		private var currentPoint:Point = new Point();
		private var _shape:Shape;
		
		public function Graphics(id:String)
		{
			super(id);
			content = _shape = new Shape();
		}
		
		public function draw(commandStr:String):void
		{
			_shape.graphics.clear();
			var commands:Array = commandStr.split(";");
			for(var i:int = 0, l:int = commands.length;i < l;i ++){
				var arr:Array = commands[i].split("!");
				var funcName:String = arr[0];
				var args:Array = arr.slice(1);
				switch(funcName){
					case "lineStyle":
						_shape.graphics.lineStyle(args[0]*.5, CSSColor.toHex(args[1]).color);
						break;
					case "beginFill":
						_shape.graphics.beginFill(CSSColor.toHex(args[0]).color, args[1]||1);
						break;
					case "endFill":
						_shape.graphics.endFill();
						break;
					case "beginRadialGradientFill":
						this.beginRadialGradientFill(args);
						break;
					case "beginLinearGradientFill":
						this.beginLinearGradientFill(args);
						break;
					case "beginBitmapFill":
						break;
					case "beginPath":
						setStartPoint(0, 0);
						break;
					case "closePath":
						if(!startPoint.equals(currentPoint)){
							_shape.graphics.lineTo(startPoint.x, startPoint.y);
						}
						break;
					case "moveTo":
						setStartPoint(args[0], args[1]);
						break;
					case "lineTo":
						_shape.graphics.lineTo(args[0], args[1]);
						currentPoint.setTo(args[0], args[1]);
						break;
					case "quadraticCurveTo":
						_shape.graphics.curveTo(args[0], args[1], args[2], args[3]);
						currentPoint.setTo(args[2], args[3]);
						break;
					case "bezierCurveTo":
						_shape.graphics.cubicCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
						currentPoint.setTo(args[4], args[5]);
						break;
					case "drawRect":
						_shape.graphics.drawRect(args[0], args[1], args[2], args[3]);
						setStartPoint(args[0], args[1]);
						break;
					case "drawRoundRectComplex":
						_shape.graphics.drawRoundRectComplex(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
						setStartPoint(args[0] + args[2], args[1] + args[3]);
						break;
					case "drawRoundRect":
						var x:Number = args[0];
						var y:Number = args[1];
						var w:Number = args[2];
						var h:Number = args[3];
						
						_shape.graphics.drawRoundRect(x, y, w, h, args[4]*2);
						setStartPoint(x, y);
						break;
					case "drawCircle":
						var x:Number = args[0];
						var y:Number = args[1];
						var r:Number = args[2];
						_shape.graphics.drawCircle(x + r, y + r, r);
						setStartPoint(x + 2 * r, y + r);
						break;
					case "drawEllipse":
						var x:Number = args[0];
						var y:Number = args[1];
						var w:Number = args[2];
						var h:Number = args[3];
						
						_shape.graphics.drawEllipse(x, y, w, h);
						setStartPoint(x + w, y + h * .5);
						break;
					case "clear":
						_shape.graphics.clear();
						setStartPoint(0, 0);
						break;
					default:
						break;
				}
			}			
		}
		
		private function setStartPoint(x:Number, y:Number):void{
			startPoint.setTo(x, y);
			currentPoint.setTo(x, y);
			_shape.graphics.moveTo(x, y);
		}
		
		private function beginLinearGradientFill(args:Array):void{
			var x0:Number = args[0];
			var y0:Number = args[1];
			var x1:Number = args[2];
			var y1:Number = args[3];
			
			if (x0 == x1 && y0 == y1){
				return;
			}
			
			var dx:Number = x1 - x0;
			var dy:Number = y1 - y0;
			var cx:Number = (x0 + x1) / 2;
			var cy:Number = (y0 + y1) / 2;
			
			var  d:Number = Math.sqrt(dx * dx + dy * dy);
			var tx:Number = cx - d / 2; 
			var ty:Number = cy - d / 2;
			
			var rotation:Number = Math.atan2(dy, dx);
			
			var matrix:Matrix = new Matrix();
			matrix.createGradientBox(d, d, rotation, tx, ty);
			
			var colors:Array = args[4].split(":");
			var radios:Array = args[5].split(":");
			var alphas:Array = [];
			
			for(var ci:int = 0, cl:int = radios.length;ci < cl;ci ++){
				var color:CSSColor = CSSColor.toHex(colors[ci]);
				colors[ci] = color.color;
				alphas[ci] = color.alpha;
				radios[ci] = radios[ci]*255;
			}
			
			_shape.graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, radios, matrix);
		}
		
		private function beginRadialGradientFill(args:Array):void{
			var x0:Number = args[0];
			var y0:Number = args[1];
			var r0:Number = args[2];
			var x1:Number = args[3];
			var y1:Number = args[4];
			var r1:Number = args[5];
			// If x0 = x1 and y0 = y1 and r0 = r1, then the radial gradient
			// must paint nothing.
			if (x0 == x1 && y0 == y1 && r0 == r1){
				return;
			}
			
			// find which radius is longer, that will be outer ring
			var tx:Number, ty:Number, d:Number, dx:Number, dy:Number, minRatio:Number, focalPointRatio:Number, gradientStartFrom:Number;
			
			if (r0 > r1)
			{
				tx = x0 - r0;
				ty = y0 - r0;
				d  = r0 * 2;
				dx = x1 - x0;
				dy = y1 - y0;
			}
			else
			{
				tx = x1 - r1;
				ty = y1 - r1;
				d  = r1 * 2;
				dx = x0 - x1;
				dy = y0 - y1;
			}
			
			var rotation:Number = Math.atan2(dy, dx);
			var matrix:Matrix = new Matrix();
			matrix.createGradientBox(d, d, rotation, tx, ty);
			
			var colors:Array = args[6].split(":");
			var radios:Array = args[7].split(":");
			var alphas:Array = [];
			
			for(var i:int = 0, l:int = radios.length;i < l;i ++){
				var color:CSSColor = CSSColor.toHex(colors[i]);
				colors[i] = color.color;
				alphas[i] = color.alpha;
				radios[i] = radios[i]*255;
			}
			
			_shape.graphics.beginGradientFill(GradientType.RADIAL, colors, alphas, radios, matrix);
		}
	}
}