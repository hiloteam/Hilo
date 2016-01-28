describe('geom', function(){
    var matrix;
    beforeEach('init matrix', function(){
        matrix = new Hilo.Matrix(1, 2, 3, 4, 5, 6, 7);
    });

    describe('Matrix', function(){
        it('concat', function(){
            var a = new Hilo.Matrix(1, 0, 0, 1, 2, 5);
            var b = new Hilo.Matrix(3, 2, 1, 5, 8, 9);
            a.concat(b).should.eql({a: 3, b: 2, c: 1, d: 5, tx:19, ty:38});
        });

        it('rotate', function(){
            matrix.rotate(Math.PI/6).should.eql({a: -0.13397459621556118, b: 2.232050807568877, c: 0.5980762113533162, d: 4.964101615137754, tx: 1.330127018922194, ty: 7.696152422706632 });
        });

        it('scale', function(){
            matrix.scale(0.5, -2).should.eql({ a: 0.5, b: -4, c: 1.5, d: -8, tx: 2.5, ty: -12 });
        });

        it('translate', function(){
            matrix.translate(5, -9).should.eql({ a: 1, b: 2, c: 3, d: 4, tx: 10, ty: -3 });
        });

        it('identity', function(){
            matrix.identity().should.eql({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
        });

        it('invert', function(){
            matrix.invert().should.eql({ a: -2, b: 1, c: 1.5, d: -0.5, tx: 1, ty: -2 });
        });

        it('transformPoint', function(){
            matrix.transformPoint({x:12, y:-3}).should.eql({ x: 8, y: 18 });
        });
    });
});

