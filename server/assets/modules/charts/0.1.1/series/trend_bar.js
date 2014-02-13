define(function(require) {
	var Bar = require('./bar');
	var Utils = require('../tools/chart_utils');

	function SeriesTrendBar() {}

	SeriesTrendBar = Utils.extendClass(Bar, {
		type:'trendBar',
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axes = this.chart.axis;

			if(seriesOpts.data.length > 40) {
				var xAxis = this.chart.opts.xAxis,
					yAxis = this.chart.opts.yAxis;

				var newData = [];
				_.each(seriesOpts.data, function(d, i){
					if(i%2) {
						var prev = seriesOpts.data[i - 1];
						prev.value += d.value;
						prev.label = prev.name + '-' + d.name;
						newData.push(prev);
					}
				});
				seriesOpts.data = newData;
				xAxis.categories = _.pluck(seriesOpts.data, 'name');
				yAxis.domain = [0, d3.max(_.pluck(seriesOpts.data, 'value'))];

				axes.opts = this.chart.opts;
				axes.redraw();
			}
			
			var axisInfo = series.getAxisScale();

			var x = axisInfo.x,
				y = axisInfo.y,
				barSpace = axisInfo.xSpace * 0.05,
				barWidth = axisInfo.xSpace * 0.7,
				xOffset = - barWidth / 2;

			var bgContainer = chartContainer.append('g')
				.attr({
					'class':'axis-bg'
				});

			this.graph = chartContainer.append("g")
				.attr({
					'class':'bar'
				})
				.style({
					'z-index': series.index
				});

			this.graph.selectAll('rect').data(seriesOpts.data)
				.enter()
				.append('rect')
				//.sort(function(d))
				.attr({
					'x': function(d){
						return x(d.name) + xOffset;
					},
					'y': function(d) {
						return y(0);
					},
					'width':barWidth,
					'height': 0,
					'value': function(d) {
						return d.value;
					}

				})
				.transition()
				.attr({
					'y': function(d) {
						return y(d.value);
					},
					//'width':20,
					'height': function(d) {
						return Math.abs(y(d.value) - y(0));
					}
				});

			this.customDraw(seriesOpts, bgContainer, axisInfo, axisInfo.xSpace / 2);
		},
		customDraw: function(seriesOpts, container, axisInfo, xOffset) {
			var x = axisInfo.x,
				y = axisInfo.y,
				xAxis = this.chart.opts.xAxis.categories,
				xMin = xAxis[0],
				yMax = this.chart.opts.yAxis.domain[1],
				textHeight = 40,
				bgWidth = x(xMin + 10) - x(xMin),
				bgHeight = y(0) - y(yMax) + textHeight;

			var bgData = [], bgN = (_.last(xAxis) - _.first(xAxis)) / 10;
			for(var i = 0; i < bgN; i++) {
				var startYear = xMin * 1 + i * 10;
				bgData.push({start: startYear, label: (startYear + '').substr(2,2) + 's'});
			}

			var bgs = container
				.selectAll('g').data(bgData)
				.enter()
				.append('g')
				.attr({
					'transform': function(d) {
						return 'translate(' + (x(d.start) - xOffset) + ',' + (y(yMax) - textHeight) + ')';
					}
				});

			bgs.append('rect')
				.attr({
					'width': function() {
						return bgWidth;
					},
					'height': function() {
						return bgHeight;
					}
				})
				.style({
					'fill': function(d, i) {
						return i % 2 == 0 ? '#f1f1f1':'#fff';
					}
				});

			bgs.append('text')
				.text(function(d) {
					return d.label;
				})
				.attr({
					'x': bgWidth / 2 - 14,
					'y': 30
				})
				.style({
					'fill': '#aaa',
					'font-size':'24px',
					'font-family':'Arial'
				})
		}
	});

	return SeriesTrendBar;
})