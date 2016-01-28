package
{
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundLoaderContext;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	import flash.media.SoundTransform;

	public class Audio
	{
		public static var cache:Dictionary = new Dictionary();
		
		private var _fid:String;
		private var _src:String;
		private var _sound:Sound;
		private var _channel:SoundChannel;

		private var _position:Number = 0;
		private var _isPlay:Boolean = false;
		private var _volume:Number = 1;
		private var _muted:Boolean = false;
		private var _loaded:Boolean = false;
		private var _isLoop:Boolean = false;
		
		public function Audio(fid:String, src:String){
			_fid = fid;
			_src = src;
		}
		
		public function play(position:Number = 0):void{
			if(!_loaded){
				load();
			}
			if(_channel){
				_channel.stop();
			}
			_position = position;
			_channel = _sound.play(_position, _isLoop?int.MAX_VALUE:0);
			setSoundVolume(_muted?0:_volume);
			_isPlay = true;
		}
		
		public function stop(isPause:Boolean = false):void{
			if(_isPlay && _channel){
				_position = isPause?_channel.position:0;
				_channel.stop();
				_isPlay = false;
			}
		}
		
		public function pause():void{
			stop(true);
		}
		
		public function resume():void{
			play(_position);
		}
		
		public function load():void{
			if(!_loaded){
				_sound = new Sound(new URLRequest(_src), new SoundLoaderContext());
				_loaded = true;
			}
		}
		
		public function release():void{
			if(_loaded){
				stop();
				_sound.close();
			}
		}
		
		public function set volume(value:Number):void{
			if(_volume != value && _channel){
				_volume = value;
				setSoundVolume(value);
			}	
		}
		
		public function setSoundVolume(volume:Number):void{
			if(_channel && _channel.soundTransform.volume != volume){
				var st:SoundTransform = _channel.soundTransform;
				st.volume = volume;
				_channel.soundTransform = st;
			}
		}
		
		public function set muted(muted:Boolean):void{
			if(_muted != muted && _channel){
				_muted = muted;
				if(muted){
					_volume = _channel.soundTransform.volume;
					setSoundVolume(0);
				}
				else{
					setSoundVolume(_volume);
				}				
			}
		}
		
		public function set isLoop(value:Boolean):void
		{
			_isLoop = value;
		}
		
		
		public static function create(fid:String, src:String):void{
			var audio:Audio = new Audio(fid, src);
			cache[fid] = audio;
		}
		
		public static function release(fid:String):void{
			if(cache[fid]){
				cache[fid].release();
				delete cache[fid];
			}
		}
		
		public static function getAudio(fid:String):Audio{
			return cache[fid];
		}
		
		public static function executeCommand(input:CommandArray):void{
			var cmd:String = input.readString();
			var fid:String = input.readString();
			var sound:Audio = Audio.getAudio(fid);
			
			switch(cmd){
				case "create":
					var src:String = input.readString();
					Audio.create(fid, src);
					break;
				case "load":
					sound.load();
					break;
				case "play":
					var isLoop:int = input.readInt();
					sound.isLoop = isLoop == 1;
					sound.play();
					break;
				case "pause":
					sound.pause();
					break;
				case "stop":
					sound.stop();
					break;
				case "resume":
					sound.resume();
					break;
				case "setVolume":
					var volume:Number = input.readFloat();
					sound.volume = volume;
					break;
				case "setMute":
					var muted:int = input.readInt();
					sound.muted = muted == 1;
					break;
				case "release":
					Audio.release(fid);
					break;
			}
		}
	}
}