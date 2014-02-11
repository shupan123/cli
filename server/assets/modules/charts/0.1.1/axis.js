define(function(require) {

	function Axis() {}

	_.extend(Axis.prototype, {
		fullAxisTypes: ['area'],
		_devideArray : function(arr, num, full) {
			var newArr = [];
			var max = d3.max(arr),
				min = d3.min(arr),
				space = (max - min)/num,
				xOffset = space/2;

				if(full) {
					space = (max - min)/(num - 1);
					xOffset = 0;
				}
				
				//this.axisScale.nameAxisSpace = space;
				for(var i = 0; i < num; i++) {
					newArr.push(space * i + xOffset + min);
				}

				if(arr[0] > arr[1]) {
					newArr.reverse();
				}

			return {position: newArr, space: space};
		},
		init: function(opts,chartContainer) {
			this.axisScale = {}; //坐标系统综合信息储存域
			this.chartOptions = opts.chart;
			this.opts = opts;
			this.container = chartContainer;
			this.drawAxis(opts,chartContainer);
			/*if(!opts.chart.axis) {
				this.hide();
			}*/
		},
		redraw: function() {
			this.drawAxis(this.opts, this.container);
		},
		getAxisScale: function(axisOpts, range, full) {
			var axisData;
			if(axisOpts.categories && axisOpts.categories.length) {
				var axisInfo = this._devideArray(range, axisOpts.categories.length, full);
				range = axisInfo.position;
				//this.axisScale.nameAxisSpace = range[1] - range[0];
				//axisOpts.categories.push('');
				axisData = d3.scale.ordinal()
					.domain(axisOpts.categories)
					.range(range);

				return {scale: axisData, space: axisInfo.space};
			}
			if(axisOpts.domain) {
				axisData = d3.scale.linear()
					.domain(axisOpts.domain)
					.range(range);

				return {scale: axisData};
			}
		},
		gridProcessor: function() {
			var axis = this;
			this.axes.xAxis.selectAll('text')
				.attr({
					'x': function() {
						return d3.select(this).attr('x') * 1 + axis.axisScale.xSpace / 2;
					}
				});

			this.axes.yAxis.selectAll('text')
				.attr({
					'y': function() {
						return d3.select(this).attr('y') - axis.axisScale.ySpace / 2;
					}
				});
		},
		drawAxis: function(opts,chartContainer) {
			var chartWidth = opts.chart.layout.width;
			var chartHeight = opts.chart.layout.height;
			var _this = this;

			var axisOpts = opts.axis,
				axisType = axisOpts.type || 'normal',
				topOffset = axisOpts.offset.top * 1 + (opts.chart.chartArea.offset.top || 0) * 1,
				bottomOffset = axisOpts.offset.bottom,
				leftOffset = axisOpts.offset.left,
				rightOffset = axisOpts.offset.right * 1 + (opts.chart.chartArea.offset.right || 0) * 1;

			var xOrient = "bottom",
				yOrient = "left",
				xRange = [leftOffset, chartWidth - rightOffset],
				yRange = [chartHeight - bottomOffset, topOffset],
				xTransform = "translate(0," + (chartHeight - bottomOffset) + ")",
				yTransform = "translate(" + (chartWidth - rightOffset) + ", 0)",
				xSize = (axisType == 'grid' || axisType == 'cross') ? topOffset + bottomOffset - chartHeight : 3,
				ySize = chartWidth - rightOffset - leftOffset,
				xTicks = opts.xAxis.ticks || 10,
				yTicks = opts.yAxis.ticks || 10,
				xTickPadding = 5,
				yTickPadding = 8;

			if(opts.chart.orient == 'h') {
				xOrient = "left";
				yOrient = "bottom";
				xRange = [chartHeight - bottomOffset, topOffset];
				yRange = [leftOffset, chartWidth - rightOffset];
				xTransform = "translate(" + leftOffset + ", 0)";
				yTransform = "translate(0," + topOffset +")";
				xSize = (axisType == 'grid' || axisType == 'cross') ? leftOffset + rightOffset - chartWidth : 3;
				ySize = chartHeight - topOffset - bottomOffset;
			}

			var axisScale = this.axisScale;

			var fullAxis = (this.fullAxisTypes.indexOf(opts.chart.type) != -1 || axisType == 'grid') ? true : false;
			var xInfo = _this.getAxisScale(opts.xAxis, xRange, fullAxis),
				yInfo = _this.getAxisScale(opts.yAxis, yRange, true);

			_.extend(axisScale, {
				x: xInfo.scale,
				y: yInfo.scale,
				xSpace: xInfo.space,
				ySpace: yInfo.space,
				offset: {
					top : topOffset,
					bottom : bottomOffset,
					left : leftOffset,
					right : rightOffset
				}
			});

			if(opts.chart.axis == 'hidden') {
				return;
			}

			chartContainer.selectAll('.axis').remove();

			if(axisType == 'cross') {
				xTickPadding = xInfo.space / 2 + 2;
			}

			var xAxis = d3.svg.axis()
			    .scale(axisScale.x)
			    .ticks(xTicks)
			    .tickSize(xSize)
			    .tickPadding(xTickPadding)
			    .tickFormat(opts.xAxis.labels.fomatter)
			    .orient(xOrient);

			var yAxis = d3.svg.axis()
			    .scale(axisScale.y)
			    .ticks(yTicks)
			    .tickSize(ySize)
			    .tickPadding(yTickPadding)
			    .tickFormat(opts.yAxis.labels.fomatter)
			    .orient(yOrient);

			var gx = chartContainer.append("g")
			    .attr("class", "x axis")
			    .attr("transform", xTransform)
			    .call(xAxis);

			var gy = chartContainer.append("g")
			    .attr("class", "y axis")
			    .attr("transform", yTransform)
			    .call(yAxis);

			this.axes = {
				xAxis : gx,
				yAxis : gy
			}

			if(axisType == 'grid') {
				this.gridProcessor();
			}

			this.styleAxis(opts);
			/*gy.selectAll("g").filter(function(d) { return d; })
    			.classed("minor", true);*/
		},
		styleAxis: function(opts) {
			var axes = this.axes;
			var gx = axes.xAxis,
				gy = axes.yAxis,
				xOpts = opts.xAxis,
				yOpts = opts.yAxis;

			var globalLabelStyle = opts.chart.globalStyle.labels,
				globalLineStyle = opts.chart.globalStyle.lines;

			var styleMap = {
				x: {
					axis: gx,
					style: xOpts
				},
				y: {
					axis: gy,
					style: yOpts
				}
			}

			gx.select('path').style('display', 'none');
			gy.select('path').style('display', 'none');

			_.each(styleMap, function(v, k) {

				var labelStyle = v.style.labels,
					lineStyle = v.style.lines;

				//label style
				if(labelStyle) {
					var alignMap = {
						'center':'middle',
						'left':'end',
						'right':'start'
					}
					var textAnchor = alignMap[labelStyle.align || 'center'] || 'middle';
					if(labelStyle.align == 'left') {
						textAnchor = 'end';
					}
					var newStyle = {
						"text-anchor": textAnchor,
						"fill":labelStyle.fontColor || globalLabelStyle.fontColor || '#333',
						"font-size": (labelStyle.fontSize || globalLabelStyle.fontSize || 12) + 'px',
						"font-family": labelStyle.fontFamily || globalLabelStyle.fontFamily || 'Arial',
						"visibility":labelStyle.visibility,
						"display":labelStyle.display
					};

					if(labelStyle.style) {
						_.extend(newStyle, labelStyle.style);
					}

					v.axis.selectAll("text")
						.style(newStyle)
						.attr({
							'transform': function() {
								var dthis = d3.select(this);
								return "rotate(" + (labelStyle.rotation || 0) + "," + dthis.attr('x') + "," + dthis.attr('y') + ")";
							}
						});
				}

				if(lineStyle) {
					var strokeDashArray = lineStyle.lineStyle || globalLineStyle.lineStyle || 'solid';
					strokeDashArray = strokeDashArray == "dashed" ? "5,4":"1,0";

					var newStyle = {
						'stroke-dashArray': strokeDashArray,
						'stroke':lineStyle.lineColor || globalLineStyle.lineColor || '#666',
						'stroke-width':lineStyle.lineWidth || globalLineStyle.lineWidth || "#666"
					};

					v.axis.selectAll("line")
						.style(newStyle);
				}
			});
		},
		showOrHide: function(axisStr, show) {
			var axis = this;

			if(!axisStr) {
				this.axes.xAxis
					.attr({
						'visibility': show ? '' : 'hidden'
					});

				this.axes.yAxis
					.attr({
						'visibility': show ? '' : 'hidden'
					});

				return;
			}

			axises = axisStr.split(',');
			_.each(axises, function(axisName) {
				axis.axes[axisName + 'Axis']
					.attr({
						'visibility':  show ? '' : 'hidden'
					});
			});
		},
		show: function(axisStr) {
			this.showOrHide(axisStr, true);
		},
		hide: function(axisStr) {
			this.showOrHide(axisStr, false);
		}
	});

	return Axis;

})