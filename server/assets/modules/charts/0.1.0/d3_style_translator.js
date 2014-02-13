define(function(require) {
	var styleMap = {
		'fontFamily':'font-family',
		'fontColor':'fill',
		'fontSize':'font-size',
		'background':'fill',
		'lineColor':'stroke',
		'lineWidth':'stroke-width'
	};

	var d3StyleTranslator = function(oriStyle) {
		var newStyle = {};
		_.each(oriStyle, function(style, name) {
			var styleName = styleMap[name] || name;
			newStyle[styleName] = style;
		});

		if(newStyle['font-size']) {
			var matches = (newStyle['font-size'] + '').match(/px&/);
			if(!matches) {
				newStyle['font-size'] = newStyle['font-size'] + 'px';
			}
		}

		return newStyle;
	};

	window.d3StyleTranslator = d3StyleTranslator;
})