define(function(require) {
	require('d3');
	require('jquery.pubsub');
	require('./d3_style_translator');

	var chartUtils = require('./tools/chart_utils');

	/**
	 * Chart主类
	 * @param {Object} options 图表设置项
	 * @example
	 * new Chart({
	 * 	chart:{
	 * 		"selector":"body",
	 * 		"layout":{
	 * 			"width":null,
	 * 			"height":null,
	 * 			"padding":null//[0,0,0,0]
	 * 		},
	 * 		"globalStyle": {
	 *			"labels":{
	 *				"fontColor":"#666",
	 *				"fontSize":11,
	 *				"fontFamily":"'Lucida Grande','Lucida Sans Unicode',Verdana,Arial,Helvetica,sans-serif",
	 *			},
	 *			"lines":{
	 *				"lineColor":"#C0C0C0",
	 *				"lineStyle":"solid",
	 *				"lineWidth":1
	 *			}
	 *		},
	 * 		"style":null,//css style object
	 * 		"type":"line",//chart type
	 * 		"zoom":null,//x,y,xy
	 * 		"reflow":true,//self-adaption of chart when resize the window
	 * 		"stack":false,
	 * 		"events":{
	 * 		},
	 * 		"title":{
	 * 			"align":"center",
	 * 			"style":null,
	 * 			"text":null
	 * 		},
	 * 		"subtitle":{
	 * 			"align":"center",
	 * 			"style":null,
	 * 			"text":null
	 * 		},
	 * 		"axis":true
	 * 	},
	 * 	xAxis:{
	 * 		categories:[],
	 * 		labels:{
	 * 			align: 'center',
	 * 			rotation: 0,
	 * 			style: null,
	 * 			formatter: null
	 * 		},
	 * 		ticks:10
	 * 	},
	 * 	yAxis:{
	 * 		categories:[],
	 * 		labels:{
	 * 			align: 'center',
	 * 			rotation: 0,
	 * 			style: null,
	 * 			formatter: null
	 * 		},
	 * 		ticks:10
	 * 	},
	 * 	series:[{
	 * 		"type":"line",
	 * 		"name":null,//series name
	 * 		"data":[],
	 * 		"style": {
	 *			"labels":{
	 *				"fontColor":"#666",
	 *				"fontSize":11,
	 *				"fontFamily":"'Lucida Grande','Lucida Sans Unicode',Verdana,Arial,Helvetica,sans-serif",
	 *			},
	 *			"lines":{
	 *				"lineColor":"#C0C0C0",
	 *				"lineStyle":"solid",
	 *				"lineWidth":1
	 *			}
	 *		}
	 * 	 },
	 * 	 {
	 * 		"type":"column",
	 * 		"name":null,//series name
	 * 		"data":[],
	 * 		"style": {
	 *			"labels":{
	 *				"fontColor":"#666",
	 *				"fontSize":11,
	 *				"fontFamily":"'Lucida Grande','Lucida Sans Unicode',Verdana,Arial,Helvetica,sans-serif",
	 *			},
	 *			"lines":{
	 *				"lineColor":"#C0C0C0",
	 *				"lineStyle":"solid",
	 *				"lineWidth":1
	 *			}
	 *		}
	 * 	 },
	 * 	 {
	 * 		"type":"pie",
	 * 		"name":null,//series name
	 * 		"data":[],
	 * 		"style": {
	 *			"labels":{
	 *				"fontColor":"#666",
	 *				"fontSize":11,
	 *				"fontFamily":"'Lucida Grande','Lucida Sans Unicode',Verdana,Arial,Helvetica,sans-serif",
	 *			},
	 *			"lines":{
	 *				"lineColor":"#C0C0C0",
	 *				"lineStyle":"solid",
	 *				"lineWidth":1
	 *			}
	 *		}
	 * 	 }
	 * 	]
	 * 	}
	 * })
	 */
	function Chart(options) {
		this.init.apply(this, arguments);
	}

	_.extend(Chart.prototype, {
		_stackType:['bar','area'], //stack有效的图表类型
		init: function(userOpts) {
			var chart = this;

			var theme = userOpts.chart.theme || "defaults";
			this.seriesList = []; //图表类型集合

			

			require.async("./themes/" + theme, function(themePackage) {
				chart.opts = {};
				$.extend(true, chart.opts, themePackage, userOpts);

				chart.$ele = $(chart.opts.chart.selector);

				chart.processData(chart.opts);

				var chartOpts = chart.opts.chart;
				//var layout = chartOpts.layout;

				chart.drawSvg(chartOpts.selector, chartOpts);

				chart.$ele.on('SERIES_READY', function() {
					/*setTimeout(fixScale, 1000);

					function fixScale() {
						chart.autoFixScale();
					}*/

					if(chartOpts.tooltip) {
						chart.addToolTip();
					}
					if(chartOpts.legend) {
						chart.addLegend();
					}
				});

				if(!chartOpts.axis) {
					chart.addSeries(chart.opts.series);
					return;
				}

				require.async('./axis', function(Axis) {
					var axis = new Axis();
					axis.init(chart.opts, chart.chartContainer);
					chart.axis = axis;
					//chart.autoFixScale();

					chart.addSeries(chart.opts.series);
				});
			})
		},
		processData: function(data) {
			var chart = this;
			//处理默认类型
			_.each(data.series, function(v, k) {
				v.type = v.type || data.chart.type;
			});

			this.opts.multiple = true;

			if(data.series.length < 2) {
				this.opts.multiple = false;
			}

			//通用处理TODO
			/*if(!data.nodes) {
				this.dataError('data is null!');
			}*/

			//节点数据模式
			if(data.chart.mode == 'nodes') {
				switch(data.chart.type) {
					case 'heatmap':
					case 'piemap':
						this.processMatrix(data);
						break;
					case 'treemap':
						data.series[0].data = data.series[0].nodes;
						break;
					default:
						data.xAxis = data.xAxis || {};
						//data.series = [];
						_.each(data.series, function(d) {
							var xs = _.pluck(d.nodes, 'x'),
								ys = _.pluck(d.nodes, 'y');
							if(data.chart.field.x.sort) {
								chart.sortData(xs, data.chart.field.x.type);
							}
							_.extend(data.xAxis, {categories: xs});
							d.data = ys;
						});
				}
			}

			//处理stack为true
			if(data.chart.stack) {
				this.processStack(data);
			}


			//以下为axis处理的范围，无axis时不用处理
			if(!data.chart.axis) {
				return data;
			}

			this.processDomain(data);

			return data;
		},
		processStack: function(data) {
			_.each(this._stackType, function(stackType) {
				var series = _.where(data.series, {type: stackType});
				_.each(series, function(currentSeries, i) {
					currentSeries.stackData = [];
					if(i == 0) {
						_.each(currentSeries.data, function(d, i) {
							currentSeries.stackData.push({orig:d, start:0, end:d});
						});
						//currentSeries.data = currentSeries.stackData;
						return;
					}

					var dataLength = data.xAxis.categories.length;
					for(var n = 0; n < dataLength; n++) {
						var prevData = series[i - 1].stackData[n];
						currentSeries.stackData.push({orig:currentSeries.data[n], start:prevData.end, end:currentSeries.data[n] + prevData.end});
					}
					//currentSeries.data = currentSeries.stackData;
				});
			});
		},
		processMatrix: function(data) {
			var chart = this;
			data.xAxis = data.xAxis || {};
			data.yAxis = data.yAxis || {};
			//data.series = [];

			_.each(data.series, function(d) {
				_.extend(data.xAxis, {categories: _.uniq(_.pluck(d.nodes, 'x'))});
				_.extend(data.yAxis, {categories: _.uniq(_.pluck(d.nodes, 'y'))});
				d.data = d.nodes;
			});

			_.each(data.chart.field, function(v,k) {
				if(v.sort) {
					chart.sortData(data[k + 'Axis'].categories, v.type);
				}
			});

			if(data.axis.type == 'grid') {
				data.xAxis.categories.push('');
				data.yAxis.categories.push('');
			}

			//data.series.push({data:data.nodes});
		},
		sortData: function(arr, type) {
			if(type == 'number') {
				arr.sort(function(a,b) {
					return a - b;
				});
				return arr;
			}
			return arr.sort();
		},
		processDomain: function(data) {
			var valueDomain = [],
				valueMaxs = [],
				valueMins = [],
				valueMax,
				valueMin;

			_.each(data.series, function(v, k) {
				valueMaxs.push(d3.max(v.stackData ? _.pluck(v.stackData, 'end') : v.data));
				valueMins.push(d3.min(v.data));
			});

			valueMax = d3.max(valueMaxs);
			valueMin = d3.min(valueMaxs);
			valueMin = valueMin > 0 ? 0 : valueMin;
			//valueMax = Math.round(valueMax / data.yAxis.ticks) * 10;

			valueDomain = [valueMin, valueMax];

			data.yAxis.domain = valueDomain;
		},
		getOptions: function() {
			return this.opts;
		},
		setOptions: function(opts) {
			_.extend(this.opts, opts);
			this.redraw();
		},
		destory: function() {
			this.svg.remove();
		},
		drawSvg: function(selector, chartOpts) {
			var layoutOpts = chartOpts.layout;
			var w = layoutOpts.width + layoutOpts.padding * 2, h = layoutOpts.height + layoutOpts.padding * 2;
			var svg = d3.select(selector).append("svg")
			    .attr("width", w)
			    .attr("height", h);
			
			var bg = svg.append('rect')
				.attr({
					'width':w,
					'height':h,
					'class':'bg'
				});

			var chartContainer = svg.append("g")
			    .attr({
			    	"class":"container",
			    	"transform": "translate(" + layoutOpts.padding + "," + layoutOpts.padding + ")"
			    });

			this.svg = svg;
			this.bg = bg;
			this.chartContainer = chartContainer;
			// this.drawHeader();

			this.styleSvg(chartOpts);
		},
		drawHeader: function() {
			var title = this.opts.chart.title,
				subTitle = this.opts.chart.subtitle;

			if(!(title && subTitle)) {
				return;
			}

			var chartHeader = this.chartContainer.append('g')
				.attr({
					'class':'header',
					'transform':'translate(0,0)'
				});

			chartHeader.append('text')
				.attr({
					'class':'title',
					'y': 11
				})
				.text(title.text)
				.style({
					//'text-anchor':'middle',
					'fill':title.fontColor,
					'font-size':title.fontSize + 'px'
				});

			chartHeader.append('text')
				.attr({
					'class':'sub-title',
					'y': 30
				})
				.text(subTitle.text)
				.style({
					//'text-anchor':'middle',
					'fill':subTitle.fontColor,
					'font-size':subTitle.fontSize + 'px'
				});
		},
		setCanvasScale: function(w, h) {
			this.svg
				.attr({
					'width':w,
					'height':h
				});

			this.svg.select('rect.bg')
				.attr({
					'width':w,
					'height':h
				});
		},
		getCanvasScale: function() {
			return chartUtils.getSvgNodeScale(this.svg.node());
		},
		getScale: function() {
			//var layoutOpts = this.opts.chart.layout;
			var chartScale = chartUtils.getSvgNodeScale(this.chartContainer.node());
			return chartScale;
		},
		autoFixScale: function() {
			var layoutOpts = this.opts.chart.layout;
			this.setCanvasScale(this.getScale().width + layoutOpts.padding * 2, this.getScale().height + layoutOpts.padding * 2)
		},
		styleSvg: function(chartOpts) {
			var globalLabelStyle = d3StyleTranslator(chartOpts.globalStyle.labels);
			this.chartContainer.style(globalLabelStyle);

			this.svg.select('rect')
				.style('fill', chartOpts.globalStyle.background);
		},
		redraw: function(data, opts) {
			// body...
		},
		getSeriesClass: function(types, fn, errorFn) {
			var newTypes = _.map(types, function(type) {
				return './series/' + type;
			});
			require.async(newTypes, function() {
				fn(arguments);
			});
		},
		addSeries: function(seriesOpts) {
			var seriesList = this.seriesList,
				drawedSeriesList = _.cloneDeep(this.seriesList),
				chart = this,
				types = [];

			_.each(seriesOpts, function(opts, i) {
				var type = opts.type || chart.opts.chart.type || chart.opts.defaultType;
				opts.name = opts.name || (type + i);
				types.push(type);
			});

			this.getSeriesClass(types, function() {
				_.each(arguments[0], function(Series, index) {
					var currentSeries = new Series();
					seriesList.push({name: seriesOpts[index].name, type:types[index], series: currentSeries});
				});

				_.each(seriesList, function(series, index) {
					series.series.init(chart, seriesOpts[index], index);
				});

				chart.$ele.trigger('SERIES_READY');
			});
		},
		addToolTip: function() {
			var chart = this;
			require.async('./tooltip', function(Tooltip) {
				var tooltip = new Tooltip(chart);
				chart.$ele.trigger('TOOLTIP_READY');
			})
		},
		addLegend: function() {
			var chart = this;
			require.async('./legend', function(Legend) {
				var legend = new Legend(chart);
				chart.$ele.trigger('LEGEND_READY');
			})
		},
		dataError: function(errorMsg) {
			throw new Error(errorMsg);
		},
		reposition: function() {

		},
		exportChart: function() {

		},
		removeSeries: function(names) {

		},
		showSeries: function(names) {

		},
		hideSeries: function(names) {

		}
	});

	return Chart;
})