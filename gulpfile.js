var gulp = require('gulp');
var del = require('del');
var merge = require('merge-stream');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var replace = require('gulp-replace');
var header = require('gulp-header');
var footer = require('gulp-footer');
var zip = require('gulp-zip');
var shell = require('gulp-shell');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var transformModule = require('gulp-transform-module');

var pkg = require('./package.json');

var isWatch = false;
var licenseCommentReg = /\/\*\*[\d\D]+?alibaba.com[\d\D]+?Licensed under the MIT License[\s]+?\*\//g;
var apiCommentReg = /(\/\*\*[\s]+?\*[\s]+?@language=en[\d\D]+?\*\/)[\s]+(\/\*\*[\s]+?\*[\s]+?@language=zh[\d\D]+?\*\/)/g;

//format
var getFileInfo = function(variant){
    variant = variant ? (' for ' + variant) : '';
    var info = '/**\n';
    info += ' * ' + pkg.name + ' ' + pkg.version + variant + '\n';
    info += ' * Copyright 2016 alibaba.com\n';
    info += ' * Licensed under the MIT License\n';
    info += ' */\n';
    return info;
};

var createBuildFormatTask = function(type){
    var cleanTask = type + '-clean';
    var formatTask = type + '-format';
    var uglifyTask = type + '-uglify';
    var zipTask = type + '-zip';

    var destPath = 'build/' + type;

    var notConcat = ['commonjs'].indexOf(type) > -1;

    //clean dir
    gulp.task(cleanTask, function(cb){
        del(destPath, cb);
    });

    //format
    gulp.task(formatTask, [cleanTask], function(){
        var stream = gulp.src(pkg.sources.files, {
            cwd:pkg.sources.dir,
            base:pkg.sources.dir
        })
        .pipe(replace(licenseCommentReg, ''))
        .pipe(replace(apiCommentReg, '$1'))
        .pipe(transformModule(type))
        .pipe(header(getFileInfo(type)))

        if(notConcat){
             return stream.pipe(gulp.dest(destPath))
        }
        else{
            return stream.pipe(gulp.dest(destPath + '/hilo'))
                .pipe(concat('hilo-' + type + '.js'))
                .pipe(gulp.dest(destPath));
        }
    });

    //uglify
    gulp.task(uglifyTask, [formatTask], function(){
        return gulp.src(destPath + '/**/*.js')
        .pipe(gulpif(!isWatch, uglify()))
        .pipe(header(getFileInfo(type)))
        .pipe(rename({extname:".min.js"}))
        .pipe(gulp.dest(destPath))
    });

    //zip
    gulp.task(zipTask, [uglifyTask], function(){
        return gulp.src(destPath + '/**/*.js')
        .pipe(gulpif(!isWatch, zip('hilo-' + type + '.zip')))
        .pipe(gulp.dest(destPath));
    });

    gulp.task(type, [isWatch?uglifyTask:zipTask]);
}


var moduleTypes = ['standalone', 'amd', 'commonjs', 'kissy', 'cmd'];
transformModule.add('standalone', function(metadata){
    var head = '(function(window){\n';
    var tail = '\n})(window);';

    var module = metadata.moduleName;
    var requireModules = metadata.requireClasses;

    if(module === 'Hilo'){
        tail = '\nwindow.Hilo = Hilo;' + tail;
    }
    else{
        tail =  '\nHilo.' + module + ' = ' + module + ';' + tail;

        head += 'var Hilo = window.Hilo;\n';
        requireModules.forEach(function(requireModule){
            if(requireModule !== 'Hilo'){
                head += 'var ' + requireModule + ' = Hilo.' + requireModule + ';\n';
            }
        });
    }

    return {
        head:head,
        tail:tail
    };
});

moduleTypes.forEach(function(moduleType){
    createBuildFormatTask(moduleType);
});

gulp.task('format', moduleTypes);

//flash
gulp.task('flash-clean', function(cb){
    del('build/flash', cb);
});
gulp.task('flash', ['flash-clean'], function(){
    var js = gulp.src(['src/flash/FlashRenderer.js', 'src/flash/FlashAdaptor.js'])
    .pipe(concat('hilo-flash.js'))
    .pipe(header('(function(){\n'))
    .pipe(header(getFileInfo('flashAdaptor')))
    .pipe(footer('})();\n'))
    .pipe(gulp.dest('build/flash'))
    .pipe(gulpif(!isWatch, uglify()))
    .pipe(rename({extname:'.min.js'}))
    .pipe(header(getFileInfo('flashAdaptor')))
    .pipe(gulp.dest('build/flash'));

    var swf = gulp.src(['src/flash/as/bin/hilo.swf'])
    .pipe(gulp.dest('build/flash/'));

    return merge(js, swf);
});

//extensions
gulp.task('extensions', function(){
    var streams = merge();
    for(var extensionName in pkg.extensions){
        var extensionPathData = pkg.extensions[extensionName];

        var src = extensionPathData.files.map(function(src, i, arr){
            return 'src/extensions/' + extensionPathData.dir + src;
        });

        var dest = 'build/' + extensionName;

        var stream = gulp.src(src)
            .pipe(concat(extensionName + '.js'))
            .pipe(header(getFileInfo(extensionName)))
            .pipe(gulp.dest(dest))
            .pipe(gulpif(!isWatch, uglify()))
            .pipe(rename({extname:'.min.js'}))
            .pipe(header(getFileInfo(extensionName)))
            .pipe(gulp.dest(dest));
        streams.add(stream);
    }
    return streams;
});

//docs
var createDocTask = function(languages){
    languages.forEach(function(language, i){
        var cleanTask = 'doc-clean-' + language;
        var commentTask = 'doc-comment-' + language;
        var buildTask = 'doc-' + language;

        var codeSrc = 'docs/api-' + language + '/code/';

        gulp.task(cleanTask, function(cb){
            del('docs/api-' + language, cb);
        });

        gulp.task(commentTask, [cleanTask], function(){
            return gulp.src(pkg.sources.files, {
                cwd:pkg.sources.dir,
                base:pkg.sources.dir
            })
            .pipe(replace(apiCommentReg, '$' + (i+1)))
            .pipe(gulp.dest(codeSrc));
        });

        gulp.task(buildTask, [commentTask], (function(){
            var files = pkg.sources.files.map(function(src){
                return codeSrc + src;
            });

            var cmd = 'java ' + [
                '-jar',
                'tools/jsdoc-toolkit-2.4.0/jsrun.jar',
                'tools/jsdoc-toolkit-2.4.0/app/run.js',
                codeSrc,
                '-d=docs/api-' + language + '/',
                '-t=docs/api_template/',
                '-r=5',
                '-x=js',
                // '-q',
                '-E=FilesLoad.js',
                '-D="ver:' + pkg.version + '"',
                '-lang=' + language
            ].join(' ');
            return shell.task(cmd);
        })());
    });
};

createDocTask(['en', 'zh']);
gulp.task('doc', ['doc-en', 'doc-zh']);

//watch
gulp.task('setIsWatch', function(cb){
    isWatch = true;
    cb();
});

gulp.task('watch', ['setIsWatch', 'standalone', 'flash', 'extensions'], function(){
    gulp.watch('src/**/*.js', ['standalone', 'flash']);
    gulp.watch('src/extensions/**/*.js', ['extensions']);
});

//test
gulp.task('test', ['setIsWatch', 'standalone', 'flash'], function () {
    return gulp
        .src('test/html/index.html')
        .pipe(mochaPhantomJS({
            reporter:'spec',
            phantomjs: {
                viewportSize: {
                    width: 550,
                    height: 400
                },
                useColors:true
            }
        }));
});

gulp.task('default', ['format', 'flash']);