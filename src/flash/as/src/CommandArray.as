/*
* https://code.google.com/p/flashcanvas/source/browse/trunk/src/CommandArray.as
*/

package
{
	public class CommandArray
	{
		private var array:Array;
		public  var length:uint;
		public  var position:uint;
		
		public function CommandArray(data:String)
		{
			array    = data.split("√");
			length   = array.length;
			position = 0;
		}
		
		public function concat(data:String):void
		{
			array = array.concat(data.split("√"));
			length = array.length;
		}
		
		public function readValue():*
		{
			return array[position++];
		}
		
		public function readBoolean():Boolean
		{
			return array[position++] != "true";
		}
		
		public function readFloat():Number
		{
			return parseFloat(array[position++]);
		}
		
		public function readInt():int
		{
			return parseInt(array[position++]);
		}
		
		public function readString():String
		{
			return array[position++];
		}
	}
}
