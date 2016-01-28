(function(){
	var dragonBones = {
		use: function(name) {
			var parts = name.split("."), obj = this;
			for(var i = 0; i < parts.length; i++)
			{
				var p = parts[i];
				obj = obj[p] || (obj[p] = {});
			}
			return obj;
		},
		extends: function(child, parent) {
			var f = function(){
			};
			f.prototype = parent.prototype;

			child.prototype = new f;
			child.prototype.constructor = child;
			child.superclass = parent.prototype;
		}
	};
	window.dragonBones = dragonBones;
})();