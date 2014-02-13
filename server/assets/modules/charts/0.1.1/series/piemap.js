define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesPiemap() {}

	SeriesPiemap = Utils.extendClass(Series, {
		type:'heatmap',
		getTooltipEle: function() {
			return this.graph.selectAll('g.pie');
		},
		draw: function(seriesOpts) {
			var series = this,
				chartContainer = this.chart.chartContainer,
				axisInfo = series.getAxisScale();

			var x = axisInfo.x,
				y = axisInfo.y,
				maxR = Math.min(axisInfo.xSpace, axisInfo.ySpace) / 2,
				minR = maxR / 3;
				//rectW = axisInfo.xSpace,
				//rectH = axisInfo.ySpace;

			var newData = this.pieMap(_.pluck(seriesOpts.data, 'value'));

			this.graph = chartContainer.append("g")
				.attr({
					'class':'piemap'
				})
				.style({
					'z-index': series.index
				});

			var pies = this.graph.selectAll('g').data(newData)
				.enter()
				.append('g')
				.attr({
					'class':'pie',
					'transform': function(d) {
						return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
					},
					'value': function(d) {
						return d.amount;
					}
				});
				

		    /*pies
		    	.style({
		    		'opacity':0
		    	});
				.transition()
				.delay(function(d, i) {
					return i * 24;
				})
		    	.style({
		    		'opacity': 1
		    	});*/

			var pieCreator = d3.layout.pie()
				.sort(null)
			    .value(function(d) {
			    	return d.value;
			    });

			var arc = d3.svg.arc()
			    .outerRadius(function(d) {
			    	return d.data.rRatio * (maxR - minR) + minR;
			    });

			//var pieDatas = this.processPieData(pieCreator(seriesOpts.data));

			var pieArc = pies.selectAll("g")
		    	.data(function(d) {
		    		return pieCreator(d.zData);
		    	})
		    	.enter().append("g")
		    	.attr("class", "arc");

		    pieArc.append("path")
		    	/*.attr("d", function(d) {
      				var newD = _.cloneDeep(d);
      				newD.endAngle = newD.startAngle;
      				return arc(newD);
      			})
      			.transition()
      			//.duration(200)
      			.delay(function(d, i) {
      				return i * 100;
      			})*/
      			.attr("d", function(d) {
      				return arc(d);
      			});
		},
		pieMap: function(data) {
			var pieMapDatas = [];
			var xCategories = this.chart.opts.xAxis.categories,
				yCategories = this.chart.opts.yAxis.categories;

			_.each(xCategories, function(xName, i) {
				_.each(yCategories, function(yName, j) {
					var groupDatas = _.where(data, {x: xName, y: yName});
					if(!groupDatas.length) return true;
					var pieMapData = {
						x: xName,
						y: yName,
						amount: 0,
						zData: []
					}
					_.each(groupDatas, function(d, n) {
						//TODO:可能有重复数据需要处理
						pieMapData.zData.push({name:d.z, value:d.c});
						pieMapData.amount += d.c;
					});
					_.each(pieMapData.zData, function(d) {
						d.amount = pieMapData.amount;
					});
					pieMapDatas.push(pieMapData);
				});
			});

			return this.arcData(pieMapDatas);
		},
		arcData: function(data) {
			var maxAmount = d3.max(_.pluck(data, 'amount'));
			_.each(data, function(d) {
				_.each(d.zData, function(z) {
					z.rRatio = d.amount / maxAmount;
				});
			});

			return data;
		},
		drawLegend: function(datas, colorScale, x, y) {
			var legendOpts = this.chart.opts.legend;

			//colors.reverse();

			var legendLineHeight = legendOpts.iconHeight * 1 + 5;
			//var quantiles = colorScale.quantiles().reverse();

			var legend = this.chart.chartContainer.append('g')
				.attr({
					'class':'legend',
					'transform':'translate(' + x + ',' + y + ')'
				});

			var legendEles = legend.selectAll('g').data(datas)
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
						return colorScale(d);
					}
				});

			legendEles.append('text')
				.text(function(d, i) {
					return d;
				});

			this.styleLegend(legendOpts);

			this.chart.autoFixScale();
		},
		styleSeries: function(styleOpts) {
			var zDatas = _.uniq(_.pluck(_.map(this.options.data, function(d) { return d.value; }), 'z')).sort();
			var colors = styleOpts.seriesColors,
				colorScale = d3.scale.ordinal()
					.domain(zDatas)
					.range(colors);

			var pie = this.graph.selectAll('g.pie');
			pie.selectAll('g.arc')
				.style({
					'fill': function(d) {
						return colorScale(d.data.name);
					}
				});

			var axisInfo = this.getAxisScale();
			var legendX = this.chart.opts.chart.layout.width + 20;
			var legendY = axisInfo.offset.top;

			this.drawLegend(zDatas, colorScale, legendX, legendY);
		},
		styleLegend: function(legendOpts) {
			this.chart.chartContainer.select('.legend')
				.selectAll('text')
				.attr({
					'x': legendOpts.iconWidth * 1 + 4,
					'y': legendOpts.style.labels.fontSize - 1
				})
				.style(d3StyleTranslator(legendOpts.style.labels));
		},
		enableTooltip: function() {
			var series = this;

			this.getTooltipEle()
				.on('mouseover.tooltip', function(d) {

					var selection = d3.select(this);

					var currentCoordinate = series.getTransform(selection.attr('transform')),
						currentX = currentCoordinate[0],
						currentY = currentCoordinate[1],
						currentColor = '#666';//selection.style('fill') || selection.style('stroke')

					var arcs = selection.selectAll('g.arc'),
						contents = [];

					arcs.each(function(d) {
						contents.push(d.data.name + ': ' + d.data.value);
					});

					series.customActionForTooltip(
						series.chart.tooltip,
						selection,
						contents,//[d.name, series.name + ': ' + (d.value.orig || d.value)],
						{x:currentX, y:currentY},
						currentColor
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
			tooltip.update(contents, position, color, notransition);
			tooltip.show();
		}
	});

	return SeriesPiemap;
})