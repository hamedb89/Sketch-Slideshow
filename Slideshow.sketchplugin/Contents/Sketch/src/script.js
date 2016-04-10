var Mustache = require('Mustache'),
	_ = require('underscore');

// _ : nsarray

var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };

_.mixin({
	nsmap: function(obj, iteratee, context){
		iteratee = cb(iteratee, context);

		var keys = obj.allKeys,
			length = obj.count(),
			results = Array(length);

		for(var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			results[index] = iteratee(obj[currentKey], currentKey, obj);
		}

		return results;
	}
})


var loadTemplate = function(path){
	return (NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, false)) + '';
}

var render = function(template,variables){
	return Mustache.render(template, variables);
}

var saveFile = function(filePath, content) {
	var save = NSSavePanel.savePanel();
	save.setNameFieldStringValue("index.html");
	var result = save.runModal();

	if (result == NSOKButton) {
		NSFileManager.defaultManager().createFileAtPath_contents_attributes(save.URL().path(), content, null);
	}
}

__globals.onRun = function(context) {
	print('running');

	var pluginBundle = NSBundle.bundleWithURL(context.plugin.url());
	var path = pluginBundle.bundlePath()+'/Contents/Sketch/src/template.html';
	var templateHtml = loadTemplate(path);

	var variables = {};
	var doc = context.document;
	var artboards = doc.artboards();

	variables.artboards = _.nsmap(artboards, function(artboard){
		var artboardhtml = {
			name: artboard.name()
		};

		print(artboard.hasBackgroundColor());

		if (artboard.hasBackgroundColor()) {
			var hex = artboard.backgroundColorGeneric().hexValue();
			artboardhtml.background = hex;
		}

		var layers = artboard.layers();

		print('artboard.layers');
		artboardhtml.layers = _.nsmap(layers.array(), function(l){
			return {
				name: l.name(),
				value: l.stringValue(),
				style: l.CSSAttributeString()
			}
		});

		return artboardhtml;
	});

	var html = render(templateHtml, variables);
	print(html);
	saveFile('/Users/hamedbahrami/Desktop/index.html', html);

};
