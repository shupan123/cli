define(function(require) {
	var Bar = require('./bar');
	var Utils = require('../tools/chart_utils');

	function SeriesLabelBar() {}

	SeriesLabelBar = Utils.extendClass(Bar, {
		type: 'labelBar'
	});

	return SeriesLabelBar;
})