define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesPie() {}

	SeriesPie = Utils.extendClass(Series, {
		type: 'pie',
		_getArcSlope: function(startAngle, endAngle) {
			var centerAngle = (endAngle - startAngle) / 2 + startAngle;
				ratioX = Math.sin(centerAngle),
				ratioY = Math.cos(centerAngle);

			return {
				x: ratioX,
				y: ratioY,
				angle: centerAngle
			}
		},
		getTooltipEle: function() {
			return this.graph.selectAll('.arc path');
		},
		draw: function(seriesOpts) {
			var pie = this,
				chartContainer = pie.chart.chartContainer,
				chartOpts = pie.chart.opts.chart,
				layoutOpts = chartOpts.layout,
				offsetTop = chartOpts.chartArea.offset.top,
				chartWidth = layoutOpts.width,
				chartHeight = layoutOpts.height - offsetTop,
				seriesStyle = seriesOpts.style,
				pieStyle = seriesStyle.pie || {},
				pieCenter = pieStyle.center || [chartWidth / 2, (chartHeight / 2 + offsetTop)],
				amount = d3.sum(_.pluck(seriesOpts.data, 'value'));

			var fontSize = seriesStyle.labels.fontSize,
      			labelColor = seriesStyle.labels.fontColor;

			if(pieStyle) {
				pieStyle.outerRadius = pieStyle.outerRadius || Math.min(chartWidth, chartHeight) / 3;
				pieStyle.innerRadius = pieStyle.innerRadius || 0;
			}

      		this.labelFontSize = fontSize;
			this.pieR = pieStyle.outerRadius;
			this.center = pieCenter;
			this.amount = amount;

			this.graph = chartContainer.append("g")
				//.attr('transform','transform(10,0)')
				.attr({
					'class':'pie',
					'transform':'translate(' + pieCenter[0] + ',' + pieCenter[1] + ')'
				})
				.style({
					'z-index': pie.index
				});

			var pieCreator = d3.layout.pie()
				.sort(null)
			    .value(function(d) {
			    	return d.value;
			    });

			var arc = d3.svg.arc()
			    .outerRadius(pieStyle.outerRadius)
			    .innerRadius(pieStyle.innerRadius);

			var pieDatas = this.processPieData(pieCreator(seriesOpts.data));

			var g = this.graph.selectAll(".arc")
		    	.data(pieDatas)
		    	.enter().append("g")
		    	.attr("class", "arc");

		    g.append("path")
      			.attr("d", function(d) {
      				var newD = _.cloneDeep(d);
      				newD.endAngle = newD.startAngle;
      				return arc(newD);
      			})
      			.transition()
      			//.duration(200)
      			.delay(function(d, i) {
      				return i * 100;
      			})
      			.attr("d", function(d) {
      				return arc(d);
      			});

      		this.customDraw(seriesOpts, chartContainer);

      		var labelContents = pieStyle.labelContents;
      		if(!labelContents && labelContents.length == 0) {
      			return;
      		}

      		var label = g.append('text')
      			.attr({
      				'transform': function(d) {
      					return 'translate(' + d.labelX + ', ' + d.labelY + ')';
      				},
      				'dy': function(d) {
      					if(d.quadrant == 2 || d.quadrant == 3) {
      						return fontSize - 2;
      					}
      					return 0;
      				}
      			})
      			.style({
      				'text-anchor': function(d) {
      					if(d.quadrant == 1 || d.quadrant == 2) {
      						return;
      					}
      					return 'end';
      				},
      				'font-size': fontSize + 'px',
      				'fill': labelColor
      			});

      		if(labelContents.indexOf('name')!=-1) {
	      		label.append('tspan')
	      			.text(function(d) {
	      				return d.data.name + (labelContents.length > 1 ? ': ':'');
	      			})
	      			.style({
	      				'font-weight':'bold'
	      			});
      		}

      		if(labelContents.indexOf('value')!=-1 || labelContents.indexOf('percent')!=-1) {
	      			label.append('tspan')
		      			.text(function(d) {
		      				if(labelContents.indexOf('value') == -1) {
		      					return d.data.percent;
		      				}
		      				if(labelContents.indexOf('percent') == -1) {
		      					return d.data.value;
		      				}
		      				return d.data.value + ', ' + d.data.percent;
		      			});
      		}

      		g.append('line')
      			.attr({
      				'transform': function(d) {
      					return 'translate(' + d.lineStartX + ', ' + d.lineStartY + ')';
      				},
      				'x2': function(d) {
      					return d.lineEndX - d.lineStartX;
      				},
      				'y2': function(d) {
      					return d.lineEndY - d.lineStartY;
      				}
      			})
      			.style({
      				'stroke':d3.rgb(labelColor).brighter(1.6),
      				'stroke-width':1
      			});
      	},
      	processPieData: function(pieDatas) {
			var pie = this,
				pieR = this.pieR,
				labelSize = this.labelFontSize;

			//文字及引线设置
      		var labelDistance = pieR / 5,
      			lineDistance = 2;

			_.each(pieDatas, function(d, i) {
  				var slope = pie._getArcSlope(d.startAngle, d.endAngle);

				//计算arc中心线所在象限
				var quadrant;

				if(slope.angle > 0 && slope.angle <= Math.PI / 2) {
					quadrant = 1;
				} else if(slope.angle > Math.PI / 2 && slope.angle <= Math.PI) {
					quadrant = 2;
				} else if(slope.angle > Math.PI && slope.angle <= Math.PI * 3 / 2) {
					quadrant = 3;
				} else {
					quadrant = 4;
				}

				d.quadrant = quadrant;

  				//写入label坐标数据
				d.labelX = (pieR + labelDistance) * slope.x;
				d.labelY = (pieR + labelDistance) * ( - slope.y);

				//处理可能的重叠
				if(i != 0) {
					var deltaY = Math.abs(pieDatas[i - 1].labelY - d.labelY);
					if(pieDatas[i - 1].quadrant == quadrant && deltaY < labelSize + 2) {
						switch(quadrant) {
							case 1:
								d.labelX += labelSize;
							case 2:
								d.labelY += labelSize;
								break;
							case 3:
								d.labelX -= labelSize
							case 4:
								d.labelY -= labelSize;
						}

					}
				}

				d.lineStartX = (pieR + lineDistance) * slope.x;
				d.lineStartY = (pieR + lineDistance) * ( - slope.y);
				d.lineEndX = d.labelX - (lineDistance * slope.x);
				d.lineEndY = d.labelY + (lineDistance * slope.y);

				d.data.percent = ((d.endAngle - d.startAngle) * 100 / (2 * Math.PI)).toFixed(1) + '%';
			});

			return pieDatas;
		},
      	styleSeries: function(styleOpts) {
      		var pie = this,
      			seriesColors = styleOpts.pie.colors,
      			color = d3.scale.ordinal()
    				.range(seriesColors);

    		var hoverDistance = 5;

    		this.graph.selectAll('.arc')
    			.style({
    				'fill': function(d, i) {
    					return color(i);
    				}
    			})
    			.on('mouseover.hover', function(d) {
    				d3.select(this)
    					.attr('transform', 'translate(0, 0)')
    					.transition()
    					.attr({
		    				'transform': function(d) {
		    					var slope = pie._getArcSlope(d.startAngle, d.endAngle);
		    					return 'translate(' + slope.x * hoverDistance + ',' +  (- slope.y * hoverDistance) + ')';
		    				}
		    			})
    			})
    			.on('mouseleave.hover', function(d) {
    				d3.select(this)
    					.attr({
		    				'transform': function(d) {
		    					var slope = pie._getArcSlope(d.startAngle, d.endAngle);
		    					return 'translate(' + slope.x * hoverDistance + ',' + (- slope.y * hoverDistance) + ')';
		    				}
		    			})
    					.transition()
    					.attr('transform', 'translate(0, 0)');
    			})
      	},
      	enableTooltip: function() {
			var series = this;

			this.getTooltipEle()
				.on('mousemove.tooltip', function(d) {

					var selection = d3.select(this),
						currentPosition = d3.mouse(series.chart.chartContainer.node()), //selection.attr(series.attrMap['x'] || 'x'),
						//currentY = //d3.event.clientY, //selection.attr(series.attrMap['y'] || 'y'),
						currentX = currentPosition[0],
						currentY = currentPosition[1],
						currentColor;

						//console.log(currentX, currentY, ';' , d3.mouse(series.chart.chartContainer.node()));

					series.customActionForTooltip(
						series.chart.tooltip,
						selection,
						[d.data.name + ': ' + d.value],
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
		customActionForTooltip: function(tooltip, currentSelection, contents, position, color) {
			position.x *= 1;
			position.x += 20;
			//position.y -= 10;
			tooltip.update(contents, position, color, true);
			tooltip.show();
		}
	});

	return SeriesPie;
})