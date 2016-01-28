var path = require('path');
var gulp = require('gulp');
var stream = require('stream');
var mustache = require('mustache');

function string_src(filename, string) {
    var src = stream.Readable({ objectMode: true });

    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
        this.push(null)
    }
    return src
}

function create_class(){

}

function createObject(){

}

function createFunction(){
  
}

var file_tpl = "KISSY.add(function (S) {\
                    var DOM = S.DOM,\
                        Event = S.Event;\
                    function init(frameGroup) {\
                        {{classPrototype}}\
                        return function (context) {\
                            return {\
                                Hilo: frameGroup.tame({\
                                    {{frameObject}}\
                                })\
                            }\
                        }\
                    }\
                    return init;\
                });";

var class_tpl = "\
function Safe{{className}}(config) {\
    this.inner = new Hilo.{{className}}(el, config);\
}\
frameGroup.markCtor(Safe{{className}});\
{{#prototype}}\
Safe#ClassName.prototype.{{funcName}} = function () {\
    this.inner.{{funcName}}();\
};\
frameGroup.grantMethod(Safe{{className}}, '{{funcName}}');\
{{/prototype}}"

var frameObject = [];

// img 压缩
gulp.task('build', function() {
    var config = require('./config.json');
    return string_src("tmp.js", config)
      .pipe(gulp.dest('../assets/hilo/'))
});

//注册一个默认任务
gulp.task('default', ['build']);
