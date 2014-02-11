define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesHeatmap() {}

	SeriesHeatmap = Utils.extendClass(Series, {
		type:'heatmap',
		getTooltipEle: function() {
			return this.graph.selectAll('rect');
		},
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axisInfo = series.getAxisScale();

			var x = axisInfo.x,
				y = axisInfo.y,
				rectW = axisInfo.xSpace,
				rectH = axisInfo.ySpace;

			this.graph = chartContainer.append("g")
				.attr({
					'class':'heatmap'
				})
				.style({
					'z-index': series.index
				});

			this.graph.selectAll('rect').data(seriesOpts.data)
				.enter()
				.append('rect')
				.attr({
					'x': function(d) {
						return x(d.value.x);
					},
					'y': function(d) {
						return y(d.value.y) - rectH;
					},
					'width': rectW,
					'height': rectH
					/*'value': function(d) {
						return d.value.c;
					}*/
				});
		},
		drawLegend: function(colors, colorScale, x, y) {

			var legendOpts = this.chart.opts.legend;
			colors.reverse();

			var legendLineHeight = legendOpts.iconHeight * 1 + 4;
			var quantiles = colorScale.quantiles().reverse();

			var legend = this.chart.chartContainer.append('g')
				.attr({
					'class':'legend',
					'transform':'translate(' + x + ',' + y + ')'
				});

			var legendEles = legend.selectAll('g').data(colors)
					.enter()
					.append('g')
					.attr({
						'transform': function(d, i) {
							return 'translate(0, ' + i * legendLineHeight + ')';
						}
					})

			legendEles.append('rect')
				.attr({
					'width':legendOpts.iconWidth,
					'height':legendOpts.iconHeight
				})
				.style({
					'fill': function(d) {
						return d;
					}
				});

			legendEles.append('text')
				.text(function(d, i) {
					return '≥' + Math.round(quantiles[i] || 0);
				});

			this.styleLegend(legendOpts);
			this.chart.autoFixScale();
		},
		styleSeries: function(styleOpts) {
			var max = d3.max(this.options.data, function(d) {
				return d.value.c;
			});
			var colors = styleOpts.heatmapColors,
				colorScale = d3.scale.quantile()
					.domain([0, max])
					.range(colors);

			this.graph.selectAll('rect')
				.style({
					'fill': function(d) {
						return colorScale(d.value.c);
					}
				});

			var axisInfo = this.getAxisScale();
			var legendX = this.chart.opts.chart.layout.width + 20;
			var legendY = axisInfo.offset.top;

			this.drawLegend(colors, colorScale, legendX, legendY);
		},
		styleLegend: function(legendOpts) {
			this.chart.chartContainer.select('.legend')
				.selectAll('text')
				.attr({
					'x': legendOpts.iconWidth * 1 + 5,
					'y': legendOpts.style.labels.fontSize - 2
				})
				.style(d3StyleTranslator(legendOpts.style.labels));
		},
		enableTooltip: function() {
			var series = this;

			this.getTooltipEle()
				.on('mouseover.tooltip', function(d) {

					var selection = d3.select(this),
						currentX = selection.attr('x'),
						currentY = selection.attr('y'),
						currentColor;

					series.customActionForTooltip(
						series.chart.tooltip,
						selection,
						d.value,
						{x:currentX, y:currentY},
						'#666'//selection.style('fill') || selection.style('stroke')
					);
				});

			this.chart.svg
				.on('mouseenter.tooltip', function() {
					//series.chart.tooltip.show();
				})
				.on('mouseleave.tooltip', function() {
					series.chart.tooltip.hide();
				});
			//this.chart.tooltip.update()
		},
		customActionForTooltip: function(tooltip, currentSelection, contents, position, color, notransition) {
			position.y -= 5;
			tooltip.update(['x:' + contents.x, 'y:' + contents.y, contents.c], position, color, notransition);
			tooltip.show();
		}
	});

	return SeriesHeatmap;
})