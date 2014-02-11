define(function(require) {

	function Series() {}

	_.extend(Series.prototype, {
		type:'line',
		adjustAxis:false,
		styleMap: {
			'lineColor':'stroke',
			'lineWidth':'stroke-width',
			'fillColor':'fill',
			'radius': 'r',
			'fontFamily':'font-family',
			'fontColor':'font-color'
		},
		attrMap: {
			'x':'cx',
			'y':'cy'
		},
		init: function(chart, userOpts, index) {
			var series = this,
				chartSeries = chart.series,
				axis = chart.axis,
				self = this;

			series.chart = chart;
			series.index = index;
			series.setOptions(userOpts);
			if(this.adjustAxis) {
				this.updateAxis();
			}

			this.chart.$ele.on('TOOLTIP_READY', function() {
				series.enableTooltip();
			});

			series.draw(series.options, function() {
				_.defer(function() {
					series.styleSeries(series.options.style);
				});
				
			});
			

			/*_.defer(function() {
				series.styleSeries(series.options.style);
			});*/
			
		},
		setOptions: function(seriesOpts) {
			var chartOpts = this.chart.getOptions();
			var styleOpts = $.extend(true, chartOpts.chart.globalStyle, chartOpts.chart.seriesStyle);
			seriesOpts.style = styleOpts;

			if(chartOpts.chart.type!='treemap') {
				seriesOpts.data = _.map(seriesOpts.stackData || seriesOpts.data, function(d, i) {
					if(chartOpts.chart.type == 'heatmap' || chartOpts.chart.type == 'piemap') {
						return {name: '', value: d};
					}
					return {name: chartOpts.xAxis.categories[i] || '', value: d};
				});
			}

			var sortType = chartOpts.chart.sort;

			if(sortType) {
				sortType = sortType == 'asc' ? 1 : sortType == 'desc' ? -1 : null;
				seriesOpts.data.sort(function(a,b) {
					return sortType * (a.value - b.value);
				});
				chartOpts.xAxis.categories = _.pluck(seriesOpts.data, 'name');
				this.updateAxis();
			}
			
			this.options = seriesOpts;
			this.name = seriesOpts.name;
			this.color = this.getSeriesColor(styleOpts);
		},
		/*getXTranslator: function() {
			var series = this,
				axisScale = this.chart.axis.axisScale;

			var x = d3.scale.linear()
				.domain(axisScale.xDomain)
			    .range(axisScale.xRange);

			return x;
		},
		getYTranslator: function() {
			var series = this,
				axisScale = this.chart.axis.axisScale;

			var y = d3.scale.linear()
				.domain(axisScale.yDomain)
			    .range(axisScale.yRange);

			return y;
		},*/
		getAxisScale: function() {
			var series = this,
				axisScale = this.chart.axis.axisScale;

			return axisScale;
		},
		getTooltipEle: function() {
			return this.graph.selectAll('.marker');
		},
		updateAxis: function() {
			var axes = this.chart.axis;
			axes.opts = this.chart.opts;
			axes.redraw();
		},
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axisInfo = series.getAxisScale();

			var x = axisInfo.x,
				y = axisInfo.y;

			this.graph = chartContainer.append("g")
				//.attr('transform','transform(10,0)')
				.attr({
					'class':'line'
					//'transform':'translate(' + xOffset + ',' + yOffset + ')'
				})
				.style({
					'z-index': series.index
				});

			//this.graph = seriesContainer;

			//draw line
			var lineStart = d3.svg.line()
			    .x(function(d, i) {
			    	return x(d.name);
			    })
			    .y(function(d) {
			    	return y(0);
			    });

			var lineFinish = d3.svg.line()
			    .x(function(d, i) {
			    	return x(d.name);
			    })
			    .y(function(d) {
			    	return y(d.value);
			    });

			this.graph.append('path')
				.datum(seriesOpts.data)
				.attr("d", lineStart)
				.transition()
				.attr("d", lineFinish);

			//draw marker
			var markerStart = {
				'cx': function(d, i) {
					return x(i);
				},
				'cy': function(d, i) {
					return y(0);
				},
				'r': 0
			}

			var markerFinish = {
				'cx': function(d, i) {
					return x(d.name);
				},
				'cy': function(d, i) {
					return y(d.value);
				},
				'r': 3
			}
			this.graph.selectAll('circle').data(seriesOpts.data)
				.enter()
				.append('circle')
				.attr('class', 'marker')
				.attr(markerStart)
				.transition()
				.attr(markerFinish);

			this.customDraw(seriesOpts, chartContainer, axisInfo);
			
			/*var drawId = setInterval(drawLine, 50);

			var i = 0;

			function drawLine() {
				series.graph
					.datum(seriesOpts.data.slice(0,i))
					.attr("d", line);
				i++;
			}*/
		},
		customDraw: function(seriesOpts, chartContainer, axisInfo) {
			//for custom draw
		},
		parseStyle: function(styleObj) {
			var series = this,
				d3StyleObj = {};

			_.each(styleObj, function(styleValue, styleName) {
				d3StyleObj[series.styleMap[styleName]||styleName] = styleValue;
			});

			return d3StyleObj;
		},
		getSeriesColor: function(styleOpts) {
			var seriesColors = styleOpts.seriesColors,
				color;

			if(!seriesColors) {
				return null;
			}

			color = (seriesColors[this.index])||(seriesColors[this.index - seriesColors.length]);
			return color;
		},
		styleSeries: function(styleOpts) {
			var seriesColor = this.getSeriesColor(styleOpts),
				lineStyle = this.parseStyle(styleOpts.line),
				labelStyle = this.parseStyle(styleOpts.labels);

			lineStyle.stroke = seriesColor;
			lineStyle.fill = 'none';

			var line = this.graph.select('path'),
				markers = this.graph.selectAll('.marker');

			this.graph.style(lineStyle);

			markers.style({'fill': seriesColor});

			this.graph.on('mouseover.hover', function() {
				d3.select(this).style('stroke-width', lineStyle['stroke-width'] + 1);
			});

			this.graph.on('mouseleave.hover', function() {
				d3.select(this).style('stroke-width', lineStyle['stroke-width']);
			});
		},
		enableTooltip: function() {
			var series = this;

			this.getTooltipEle()
				.on('mouseover.tooltip', function(d) {

					var selection = d3.select(this),
						currentX = selection.attr(series.attrMap['x'] || 'x'),
						currentY = selection.attr(series.attrMap['y'] || 'y'),
						currentColor;

					series.customActionForTooltip(
						series.chart.tooltip,
						selection,
						d,
						{x:currentX, y:currentY},
						selection.style('fill') || selection.style('stroke')
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
			var tooltipContents = [contents.label || contents.name, this.name + ': ' + (contents.value.orig || contents.value)];
			if(this.chart.opts.multiple == false){
				tooltipContents = [(contents.label || contents.name) + ': ' + (contents.value.orig || contents.value)];
			}
			position.y -= 5;
			tooltip.update(tooltipContents, position, color, notransition);
			tooltip.show();
		},
		getTransform: function(transformStr) {
			var reg = /\d+(\.)?\d+/g;
			var numbers = transformStr.match(reg);
			return numbers;
		}
	});

	return Series;
})