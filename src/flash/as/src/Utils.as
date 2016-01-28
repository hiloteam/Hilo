package
{
	import flash.external.ExternalInterface;

	public class Utils
	{
		static public function log(...rest):void
		{
			if(hilo.debug){
				ExternalInterface.call("console.log", rest);
			}
		}
		
		static public function logs(...rest):void
		{
			ExternalInterface.call("console.log", rest);
		}
		
		public function Utils()
		{
		}
	}
}