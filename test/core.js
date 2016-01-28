describe('core', function(){
    describe('Hilo', function(){
        it('getUid', function(){
            Hilo.getUid("View").should.equal('View1');
            Hilo.getUid("as3").should.equal('as3_2');
            Hilo.getUid().should.equal(3);
        });

        it('viewToString', function(){
            var stage = new Hilo.Stage({id:'stage'});
            var container = new Hilo.Container({id:'container'});
            var view = new Hilo.View({id:'view'});

            Hilo.viewToString(view).should.equal('view');

            container.addChild(view);
            Hilo.viewToString(view).should.equal('container.view');

            stage.addChild(container);
            Hilo.viewToString(view).should.equal('stage.container.view');
        });

        it('copy', function(){
            Hilo.copy({a:'a', c:'c'}, {a:'new a', b:'b'}).should.eql({a:'new a', b:'b', c:'c'});
            Hilo.copy({a:'a', c:'c'}, {a:'new a', b:'b'}, true).should.eql({a:'new a', c:'c'});
        });

        it('event', function(){
            if('ontouchstart' in window){
                Hilo.event.POINTER_START.should.equal('touchstart');
                Hilo.event.POINTER_END.should.equal('touchend');
                Hilo.event.POINTER_MOVE.should.equal('touchmove');
            }
            else{
                Hilo.event.POINTER_START.should.equal('mousedown');
                Hilo.event.POINTER_END.should.equal('mouseup');
                Hilo.event.POINTER_MOVE.should.equal('mousemove');
            }
        });

        it('getElementRect', function(){
            var elem = document.createElement('div');
            elem.style.cssText="position:absolute;width:200px;height:100px;left:20px;top:30px";
            elem.innerHTML = '<div id="testRect" style="margin-top:10px;padding-left:20px;width:100px;height:50%"></div>';
            document.body.appendChild(elem);
            Hilo.getElementRect(document.getElementById('testRect')).should.eql({left: 40, top: 40, width: 100, height: 50});
            document.body.removeChild(elem);
        });

        it('createElement', function(){
            var elem = Hilo.createElement('div', {
                className:'test',
                style:{
                    position:'absolute',
                    left:'10px'
                }
            });
            elem.tagName.should.equal('DIV');
            elem.className.should.equal('test');
            elem.style.position.should.equal('absolute');
            elem.style.left.should.equal('10px');
        });

        it('cacheStateIfChanged', function(){
            var obj = {alpha:1, x:2, y:1}, cacheState = {};
            Hilo.cacheStateIfChanged(obj, ['alpha', 'x'], cacheState).should.be.true();
            obj.alpha = .5;
            Hilo.cacheStateIfChanged(obj, ['alpha', 'x'], cacheState).should.be.true();
            obj.y = 3;
            Hilo.cacheStateIfChanged(obj, ['alpha', 'x'], cacheState).should.be.false();
        });
    });

    describe('Class', function(){
        var A;
        it('new', function(){
            A = Hilo.Class.create({
                id:'a',
                getId:function(){
                    return this.id;
                }
            });

            var a = new A;
            a.should.instanceOf(A);
            a.id.should.equal('a');
            a.getId().should.equal('a');
        });

        it('Extends', function(){
            var B = Hilo.Class.create({
                id:'b',
                Extends:A
            });

            var b = new B;
            b.should.instanceOf(A);
            b.should.instanceOf(B);
            B.superclass.should.equal(A.prototype);
            b.id.should.equal('b');
            b.getId().should.equal('b');
        });

        it('Mixes', function(){
            var C = Hilo.Class.create({
                Mixes:[{
                        mixA:'mixA'
                    },{
                        mixB:function(){
                            return 'mixB'
                        }
                    }
                ]
            });

            var c = new C;
            c.mixA.should.equal('mixA');
            c.mixB().should.equal('mixB');
        });

        it('Statics', function(){
            var D = Hilo.Class.create({
                Statics:{
                    hello:function(){
                        return 'hello';
                    }
                }
            });
            D.hello().should.equal('hello');
        });
    });
});