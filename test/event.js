describe('event', function(){
    describe('EventMixin', function(){
        var eventTarget;
        beforeEach('init eventTarget', function(){
            eventTarget = Hilo.copy({}, Hilo.EventMixin);
        });

        it('on & fire', function(){
            var firedNum = 0;
            eventTarget.on('hello', function(e){
                e.type.should.equal('hello');
                e.detail.should.eql({data:'world'});
                firedNum ++;
            });
            eventTarget.fire('hello', {data:'world'});
            firedNum.should.equal(1);
            eventTarget.fire('hello', {data:'world'});
            firedNum.should.equal(2);
        });

        it('on once', function(){
            var firedNum = 0;
            eventTarget.on('hello', function(e){});
            eventTarget.on('hello', function(e){
                firedNum ++;
            }, true);
            eventTarget.fire('hello');
            firedNum.should.equal(1);
            eventTarget.fire('hello');
            firedNum.should.equal(1);
        });

        it('off', function(){
            var firedNum1, firedNum2;
            var eventListener1 = function(){
                firedNum1++;
            };

            var eventListener2 = function(){
                firedNum2++;
            };

            var reset = function(){
                firedNum1 = firedNum2 = 0;
                eventTarget = Hilo.copy({}, Hilo.EventMixin);
                eventTarget.on('hello1', eventListener1);
                eventTarget.on('hello2', eventListener2);
            };

            //off all
            reset();
            eventTarget.off();
            eventTarget.fire('hello1');
            eventTarget.fire('hello2');
            firedNum1.should.equal(0);
            firedNum2.should.equal(0);

            //off type
            reset();
            eventTarget.off('hello1');
            eventTarget.fire('hello1');
            eventTarget.fire('hello2');
            firedNum1.should.equal(0);
            firedNum2.should.equal(1);

            //off listener
            reset();
            eventTarget.on('hello', eventListener1);
            eventTarget.on('hello', eventListener2);
            eventTarget.off('hello', eventListener1);
            eventTarget.fire('hello');
            firedNum1.should.equal(0);
            firedNum2.should.equal(1);
        });

        it('stopImmediatePropagation', function(){
            var isFired = false;

            var eventTargetTemp = Hilo.copy({}, Hilo.EventMixin);
            eventTargetTemp.on('hello', function(e){
                isFired = true;
            });

            eventTarget.on('hello', function(e){
                e.stopImmediatePropagation();
                eventTargetTemp.fire(e);
            });

            eventTarget.fire('hello');
            isFired.should.be.false();
        });

    });
});