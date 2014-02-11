define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesBar() {}

	SeriesBar = Utils.extendClass(Series, {
		type:'bar',
		attrMap: {
			'x':'x',
			'y':'y'
		},
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axisInfo = series.getAxisScale(),
				orient = this.chart.opts.chart.orient,
				stack = this.chart.opts.chart.stack;

				this.orient = orient;
				this.stack = stack;

			var x = axisInfo.x,
				y = axisInfo.y,
				barSpace = axisInfo.xSpace * 0.05,
				barWidth = axisInfo.xSpace * 0.6,
				xOffset = - barWidth / 2;

			//多bar时的坐标调整
			var barsSeries = _.where(this.chart.seriesList, {type:'bar'}),
				seriesIndex = _.findIndex(barsSeries, {name:seriesOpts.name}),
				barLength = barsSeries.length;


			if(!stack && barsSeries.length > 1) {
				barWidth = (barWidth - barSpace * (barLength - 1)) / barLength;
				xOffset = xOffset + (barWidth + barSpace) * seriesIndex;
			}

			this.graph = chartContainer.append("g")
				.attr({
					'class':'bar'
				})
				.style({
					'z-index': series.index
				});

			if(orient == 'h') {
				this.graph.selectAll('rect').data(seriesOpts.data)
					.enter()
					.append('rect')
					.attr({
						'x': function(d) {
							return stack ? y(d.value.start) : y(0);
						},
						'y': function(d, i){
							return x(d.name) + xOffset;
						},
						'width': 0,
						'height':barWidth,
						'value': function(d) {
							return stack ? d.value.orig : d.value;
						}
					})
					.transition()
					.attr({
						'width': function(d) {
							return Math.abs(y(stack ? d.value.orig : d.value) - y(0));
						}
					});
				return;
			}

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
						return stack ? d.value.orig : d.value;
					}

				})
				.transition()
				.attr({
					'y': function(d) {
						return y(stack ? d.value.end : d.value);
					},
					//'width':20,
					'height': function(d) {
						return Math.abs(y(stack ? d.value.orig : d.value) - y(0));
					}
				});
		},
		getTooltipEle: function() {
			return this.graph.selectAll('rect');
		},
		/**
		 * param {x:xscale, y:scale, xOffset:10, yOffset:20, width:60, height: 100}
		 */
		reposition: function(params) {
			this.graph.selectAll('rect')
				.transition()
				.attr(params);
		},
		styleSeries: function(styleOpts) {
			var seriesColor = this.getSeriesColor(styleOpts),
				hoverColor = d3.rgb(seriesColor).darker(0.4);

			this.graph.selectAll('rect')
				.style({
					'fill': seriesColor
				})
				.on('mouseover.hover', function() {
					d3.select(this)
						//.style('fill', seriesColor)
						//.transition()
						.style('fill', hoverColor);
				})
				.on('mouseleave.hover', function() {
					d3.select(this)
						//.style('fill', hoverColor)
						//.transition()
						.style('fill', seriesColor);
				})
		},
		customActionForTooltip: function(tooltip, currentSelection, contents, position, color) {
			if(this.orient == 'h'){
				position.x *= 1;
				position.x += currentSelection.attr('width') * 1 + 5;
				position.y *= 1;
				position.y += currentSelection.attr('height') * 1 + 5;
			}

			//tooltip.update(contents, position, color);
			//tooltip.show();
			this.constructor.prototype.customActionForTooltip.apply(this, arguments)
		}
	});

	return SeriesBar;
})