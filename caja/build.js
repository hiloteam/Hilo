var fs = require('fs');
var mustache = require('mustache');

var file_tpl = "\
KISSY.add(function (S) {\n\
    var DOM = S.DOM,\n\
        Event = S.Event;\n\
   	\n\
    function init(frameGroup) {\n\
{{classPrototype}}\n\
        return function (context) {\n\
            return {\n\
                Hilo: frameGroup.tame({\n\
{{frameObject}}\n\
                })\n\
            }\n\
        }\n\
    }\n\
    return init;\n\
});";

var class_tpl = "\
		function Safe{{className}}(config) {\n\
		    this.inner = new Hilo.{{className}}(config);\n\
		}\n\
		frameGroup.markCtor(Safe{{className}});\n\
		{{#prototype}}\n\
		Safe{{className}}.prototype.{{funcName}} = function () {\n\
		    this.inner.{{funcName}}();\n\
		};\n\
		frameGroup.grantMethod(Safe{{className}}, '{{funcName}}');\n\
		{{/prototype}}\
		\n";

var frame_function_tpl = "\n\
					{{functionName}}: frameGroup.markFunction(function () {\n\
						for(var i = 0, len = arguments.length; i < len; i++ ){\n\
							if(typeof arguments[i] == 'object'){\n\
							    arguments[i] = cajaAFTB.untame(arguments[i]);\n\
							}\n\
						}\n\
					    return Hilo.{{namespaceFunctionName}}.apply(this, arguments);\n\
					})\n";

var frame_class_tpl = "\n\
					{{className}}: frameGroup.markFunction(function () {\n\
						for(var i = 0, len = arguments.length; i < len; i++ ){\n\
							if(typeof arguments[i] == 'object'){\n\
							    arguments[i] = cajaAFTB.untame(arguments[i]);\n\
							}\n\
						}\n\
					    return new Safe{{className}}(arguments);\n\
					})\n";
var frame_stage_tpl = "\n\
					SafeStage: frameGroup.markFunction(function () {\n\
                        var config = arguments[0];\n\
                        if(config.container && typeof config.container == 'string') {\n\
                            config.container = DOM.get('#' + config.container, context.mod);\n\
                        } else if(config.canvas && typeof config.canvas == 'string') {\n\
                            config.canvas = DOM.get('#' + config.canvas, context.mod);\n\
                        } else {\n\
                            console.log('security limited');return false;\n\
                        }\n\
					    return new SafeStage(config);\n\
					})\n";

var frame_object_tpl = "\n\
					{{objectName}} : frameGroup.tame({\n\
						{{functionList}}\
                    })\n"

var frame_sample_object_tpl = "\n\
					{{objectName}} : frameGroup.tame(Hilo.{{objectName}})\n"

var protoList = [];
var frameList = [];
var file_context = '';

var config = require('./config.json');

function render(tpl, data){
	var output = mustache.render(tpl, data);
	return output;
}

function each(obj, func){
	for(var i in obj) {
		if(obj.hasOwnProperty(i)) {
			func(i, obj[i]);
		}
	}
}

function createClass(proto, moduleName){
	var tpl = frame_class_tpl,
		data = {
			"className":moduleName,
			"prototype":[]
		};
	for(var key in proto) {
		if(proto.hasOwnProperty(key) && key != 'constructor') {
			if(typeof proto[key] == 'object') {
				data.prototype.push({
					"funcName":key
				});
			}
		}
	}
	protoList.push(render(class_tpl, data));
	if(moduleName == 'Stage') {
		tpl = frame_stage_tpl;
	}
	frameList.push(render(tpl, data));
}

function createObject(data, moduleName, module){
	var objectCode = render(frame_object_tpl, data);
	frameList.push(objectCode);
}

function createSampleObject(data, moduleName, module){
	var objectCode = render(frame_sample_object_tpl, data);
	frameList.push(objectCode);
}

function createFunction(data, moduleName, module){
	var funcCode = render(frame_function_tpl, data);
	frameList.push(funcCode);
}

each(config, function(moduleName, module){
	if(module == 'function') {
		var data = {
			"functionName" : moduleName,
			"namespaceFunctionName" : moduleName
		}
		createFunction(data, moduleName, module);
	} else if (typeof module == 'object') {

		if(module['proto'] && typeof module['proto'] == 'object') {
			createClass(module['proto'], moduleName);
		} else {
			var isObject = false,
				data = {},
				functionList = [];
			each(module, function(key, item){
				if(item && typeof item == 'object') {
					isObject = true;
					functionList.push(render(frame_function_tpl, {
						"functionName":key,
						"namespaceFunctionName":moduleName+'.'+key
					}));
				}
			});

			data["objectName"] = moduleName;
			if(isObject){
				data["functionList"] = functionList.join('						,');
				createObject(data, moduleName, module);
			} else {
				// data["functionName"] = moduleName;frame_sample_object_tpl
				createSampleObject(data, moduleName, module);
			}
		}
	}
});

file_context = render(file_tpl, {
	"classPrototype" : protoList.join('\n'),
	"frameObject" : frameList.join('					,')
});
file_context = file_context.replace(/&lt;/g, '<');
file_context = file_context.replace(/&amp;/g, "&" );
file_context = file_context.replace(/&#39;/g, "'" );

fs.writeFile('../assets/openjs/hilo/index.js', file_context);
