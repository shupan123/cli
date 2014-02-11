define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesArea() {}

	SeriesArea = Utils.extendClass(Series, {
		type:'area',
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axisInfo = series.getAxisScale(),
				stack = this.chart.opts.chart.stack;

			this.stack = stack;

			var x = axisInfo.x,
				y = axisInfo.y;

			this.graph = chartContainer.append("g")
				.attr({
					'class':'area'
					//'transform':'translate(' + xOffset + ',' + yOffset + ')'
				})
				.style({
					'z-index': series.index
				});

			var line = d3.svg.line()
				.x(function(d, i) {
					return x(d.name);
				})
				.y(function(d) {
					return y(d.value.end || d.value);
				});


			var area = d3.svg.area()
				.x(function(d, i) {
					return x(d.name);
				})
				.y0(function(d) {
					return y(d.value.start || 0);
				})
				.y1(function(d) {
					return y(d.value.end || d.value);
				});

			var marker = {
				'cx': function(d, i) {
					return x(d.name);
				},
				'cy': function(d, i) {
					return y(d.value.end || d.value);
				},
				'r': 20
			}

			this.graph.append('path')
				.datum(seriesOpts.data)
				.attr({
					'd': line,
					'class': 'line'
				});

			this.graph.append('path')
				.datum(seriesOpts.data)
				.attr({
					'd': area,
					'class': 'area'
				});

			this.graph.selectAll('circle').data(seriesOpts.data)
				.enter()
				.append('circle')
				.attr('class', 'marker')
				.attr(marker)
				.style({
					'opacity':0
				});

		
			if(stack) {
				series.stackTip(seriesOpts);
			}
		},
		stackTip: function(seriesOpts) {

			var areaSeries = _.where(this.chart.seriesList, {type:'area'}),
				area = this,
				axisInfo = area.getAxisScale(),
				name = _.last(areaSeries).name;

			var x = axisInfo.x,
				y = axisInfo.y;

			//取消默认tip
			/*this.enableTooltip = function() {
				return;
			}*/

			//stack组图最后一项画tip
			if(this.name == name) {
				var y1 = y(area.chart.getOptions().yAxis.domain[1]),
					y2 = y(0) - y1;

				var areaTips = this.chart.chartContainer.append('g')
					.attr({
						'class': 'area-tips'
					});

				var tipLine = areaTips
					.append('line').datum(seriesOpts.data[0])
					.attr({
						'class': function(d) {
							return d.name;
						},
						'transform': function(d) {
							return 'translate(' + x(d.name) + ', ' + y1 + ')';
						},
						'x2': 0,
						'y2': y2
					})
					.style({
						'stroke': '#aaa',
						'stroke-width': 1,
						'opacity':0
					});
				
				this.enableTooltip = function() {
					area.chart.chartContainer
						.on('mousemove.tooltip' + this.index, function() {
							area.getTooltipEle().each(function(d) {
								if(Math.abs(d3.mouse(this)[0] - x(d.name)) < axisInfo.xSpace * 0.3) {

									var tooltipEle = d3.select(this),
										currentName = tooltipEle.datum().name,
										currentX = tooltipEle.attr(area.attrMap['x'] || 'x') * 1 + 5,
										currentY,
										currentYs = [],// = tooltipEle.attr(area.attrMap['y'] || 'y'),
										tooltipContents = [];

									_.each(areaSeries, function(tarea) {
										var currentData = _.find(tarea.series.getTooltipEle().data(), {name: currentName});
										tooltipContents.push({text: tarea.series.name + ': ' + currentData.value.orig, color: tarea.series.color});
										currentYs.push(y(currentData.value.end));
									});

									currentY = d3.mean(currentYs);
									tooltipContents.reverse();
									tooltipContents.unshift(d.name + ': ' + tooltipEle.datum().value.end);

									area.customActionForTooltip(
										area.chart.tooltip,
										tooltipEle,
										tooltipContents,
										{x:currentX, y:currentY},
										"#555",
										true
									);

									tipLine
										.style({
											'opacity': 1
										})
										//.transition()
										.attr({
											'transform': function(d) {
												return 'translate(' + x(currentName) + ', ' + y1 + ')';
											}
										})
								}
							});
						});

					this.chart.svg
						.on('mouseenter.tooltip', function() {
							//series.chart.tooltip.show();
						})
						.on('mouseleave.tooltip', function() {
							area.chart.tooltip.hide();
							tipLine
								.style({
									'opacity': 0
								})
						});
					//this.chart.tooltip.update()
				}

				this.customActionForTooltip = function(tooltip, currentSelection, contents, position, color, notransition) {
					position.y -= 5;
					tooltip.update(contents, position, color, notransition);
					tooltip.show();
				}
			}
		},
		styleSeries: function(styleOpts) {
			var seriesColor = this.getSeriesColor(styleOpts);
			this.graph.style({
				'stroke': seriesColor,
				'stroke-width': 2,
				'fill': seriesColor
			});

			this.graph.select('path.area').style({
				//'stroke': seriesColor,
				'stroke-width': 0,
				'fill-opacity': 0.7
			});

			this.graph.selectAll('path.line').style({'fill': 'none'});
		}/*,
		enableTooltip: function() {
			var series = this;

			var axisInfo = series.getAxisScale();

			var x = axisInfo.x,
				y = axisInfo.y;

			this.chart.chartContainer
				.on('mousemove.tooltip' + this.index, function() {
					series.getTooltipEle().each(function(d) {

						if(Math.abs(d3.mouse(this)[0] - x(d.name)) < 20) {
							var tooltipEle = d3.select(this),
								currentX = tooltipEle.attr(series.attrMap['x'] || 'x'),
								currentY = tooltipEle.attr(series.attrMap['y'] || 'y');

							series.customActionForTooltip(
								series.chart.tooltip,
								tooltipEle,
								[d.name, series.name + ': ' + d.value.orig || d.value],
								{x:currentX, y:currentY},
								tooltipEle.style('fill') || tooltipEle.style('stroke')
							);
						}
					});
				})

			this.chart.svg
				.on('mouseenter.tooltip', function() {
					//series.chart.tooltip.show();
				})
				.on('mouseleave.tooltip', function() {
					series.chart.tooltip.hide();
				});
			//this.chart.tooltip.update()
		},
		customActionForTooltip: function(tooltip, currentSelection, contents, position, color) {
			position.y -= 5;
			tooltip.update(contents, position, color);
			tooltip.show();
		}*/
	});

	return SeriesArea;
})