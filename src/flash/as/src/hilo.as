package
{	
	//import com.demonsters.debugger.MonsterDebugger;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.system.Security;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.utils.Timer;
	
	public class hilo extends Sprite
	{
		static public var debug:Boolean = false;
		private var _command:Command;
		
		public function hilo()
		{
			//MonsterDebugger.initialize(this);
			Security.allowDomain("*");
			Security.allowInsecureDomain("*");
			
			if(stage){
				init();
			}
			else{
				addEventListener(Event.ADDED_TO_STAGE, init);
			}
						
		}
		
		private function init(e:Event = null):void
		{
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			
			if (ExternalInterface.available) {
				ExternalInterface.marshallExceptions = true;
				ExternalInterface.addCallback("executeCommand", executeCommand);
			}
			else {
				return;
			}
			
			_command = new Command(stage);
			var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
			debug = paramObj.debug == 1;
			
			try
			{
				ExternalInterface.call("Hilo.__flashUnlock");
			}
			catch (error:Error)
			{
				var timer:Timer = new Timer(0, 1);
				timer.addEventListener(TimerEvent.TIMER, timerHandler);
				timer.start();
			}
			
			var customMenu:ContextMenu = new ContextMenu();
			customMenu.hideBuiltInItems();
			customMenu.customItems = [
				new ContextMenuItem("build -"+"2014.9.18")
			];
			this.contextMenu = customMenu;
			
			stage.mouseChildren = false;
			stage.addEventListener(MouseEvent.MOUSE_DOWN, onEventHanler);
			stage.addEventListener(MouseEvent.MOUSE_UP, onEventHanler);
			stage.addEventListener(KeyboardEvent.KEY_UP, onEventHanler);
			stage.addEventListener(KeyboardEvent.KEY_DOWN, onEventHanler);
		}
		
		private function onEventHanler(e:Event):void
		{
			var type:String = e.type;
			var key:uint = e.type.indexOf("key") > -1?(e as KeyboardEvent).keyCode:0;
			if(ExternalInterface.available){
				ExternalInterface.call("Hilo.__flashFireEvent", type, key);
			}
		}
		
		private function timerHandler(e:TimerEvent):void
		{
			e.currentTarget.removeEventListener(TimerEvent.TIMER, timerHandler);
			if(ExternalInterface.available){
				ExternalInterface.call("Hilo.__flashUnlock");
			}
		}
		
		public function executeCommand(data:String):void{
			_command.parse(data);
		}		
	}
}