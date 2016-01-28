(function(){
	var ns = dragonBones.use("animation");
	function WorldClock() {
        this.timeScale = 1;
        this.time = new Date().getTime() * 0.001;
        this._animatableList = [];
    }
    WorldClock.prototype.contains = function (animatable) {
        return this._animatableList.indexOf(animatable) >= 0;
    };

    WorldClock.prototype.add = function (animatable) {
        if (animatable && this._animatableList.indexOf(animatable) == -1) {
            this._animatableList.push(animatable);
        }
    };

    WorldClock.prototype.remove = function (animatable) {
        var index = this._animatableList.indexOf(animatable);
        if (index >= 0) {
            this._animatableList[index] = null;
        }
    };

    WorldClock.prototype.clear = function () {
        this._animatableList.length = 0;
    };

    WorldClock.prototype.advanceTime = function (passedTime) {
        if (passedTime < 0) {
            var currentTime = new Date().getTime() * 0.001;
            passedTime = currentTime - this.time;
            this.time = currentTime;
        }

        passedTime *= this.timeScale;

        var length = this._animatableList.length;
        if (length == 0) {
            return;
        }
        var currentIndex = 0;

        for (var i = 0; i < length; i++) {
            var animatable = this._animatableList[i];
            if (animatable) {
                if (currentIndex != i) {
                    this._animatableList[currentIndex] = animatable;
                    this._animatableList[i] = null;
                }
                animatable.advanceTime(passedTime);
                currentIndex++;
            }
        }

        if (currentIndex != i) {
            length = this._animatableList.length;
            while (i < length) {
                this._animatableList[currentIndex++] = this._animatableList[i++];
            }
            this._animatableList.length = currentIndex;
        }
    };
    WorldClock.clock = new WorldClock();
	ns.WorldClock = WorldClock;
})();