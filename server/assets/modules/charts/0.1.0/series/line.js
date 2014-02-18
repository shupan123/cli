define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');
	var DataAdapter = require('../data_adapter');

	function SeriesLine() {}

	SeriesLine = Utils.extendClass(Series, {
		type:'line'
	})

	return SeriesLine;
})