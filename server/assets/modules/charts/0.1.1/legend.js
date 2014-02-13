define(function(require) {
	var chartUtils = require('./tools/chart_utils');

	function Legend(options) {
		this.init.apply(this, arguments);
	}

	_.extend(Legend.prototype, {
		init: function(chart) {
			this.chart = chart;
			this.graphicWidth = chart.opts.legend.width || 28;
			this.lineHeight = chart.opts.legend.height || 16;
			this.style = chart.opts.legend.style;
			this.series = chart.seriesList;
			this.x = chart.opts.chart.layout.width - (chart.opts.chart.chartArea.offset.right || 0) + 10;
			this.y = chart.opts.chart.layout.height;

			this.draw();
			//this.type = series.type;
			//this.color = series.color;
			//this.name = series.name;
		},
		draw: function() {
			var self = this;
			this.chart.legend = this.legend = this.chart.chartContainer.append('g')
				.attr({
					"class":"legend"
				})

			var legends = this.legend.selectAll('g').data(this.series)
				.enter()
				.append('g')
				.attr({
					'class': function(d) {
						return d.type;
					},
					'id': function(d) {
						return d.name;
					}
				});

			//画图例
			legends.each(function(d) {
				var d3this = d3.select(this);
				if(d.type == 'line') {
					self.drawLineGraphic(d3this, self.graphicWidth, self.lineHeight, d.series.color);
					return;
				}
				self.drawGraphic(d3this, self.graphicWidth, self.lineHeight, d.series.color);
			});

			this.appendTexts(legends);

			//各图示位置调整
			legends.attr({
				'transform': function(d, i) {
					/*var node = d3.select(this).node();
					var tWidth, tHeight;
					if(node.getBBox()) {
						tWidth = node.getBBox().width;
						tHeight = node.getBBox().height;
					} else {
						tWidth = node.offsetWidth;
						tHeight = node.offsetHeight;
					}*/
					var dy = i * (self.lineHeight + 10);
					return 'translate(' + 0 + ', ' + dy + ')';
				}
			});

			//legend总容器位置调整
			this.legend.attr({
				'transform': function() {
					var node = d3.select(this).node();
					var tWidth, tHeight;
					if(node.getBBox()) {
						tWidth = node.getBBox().width;
						tHeight = node.getBBox().height;
					} else {
						tWidth = node.offsetWidth;
						tHeight = node.offsetHeight;
					}
					//var dy = i * (self.height + 5);
					return 'translate(' + self.x + ', ' + (self.chart.getCanvasScale().height / 2 - tHeight / 2) + ')';
				}
			});


			//svg画布大小调整
			setTimeout(fixScale, 300);

			function fixScale() {
				self.chart.autoFixScale();
			}

		},
		drawLineGraphic: function(legend, width, height, color) {
			var strokeWidth = 2, pointR = 4;
			var lineGraphic = legend.append('g')
				.attr({
					'class':'line-graphic',
					'transform':'translate(' + 0 + ', ' + height / 2 + ')'
				});

			lineGraphic.append('line')
				.attr({
					'x2': width,
					'y2': 0
				})
				.style({
					'stroke': color,
					'stroke-width': strokeWidth
				})

			lineGraphic.append('circle')
				.attr({
					'cx': width / 2,
					'cy': 0,
					'r': pointR
				})
				.style({
					'fill': color
				})

			return lineGraphic;
		},
		drawGraphic: function(legend, width, height, color) {
			var lineGraphic = legend.append('rect')
				.attr({
					'class':'graphic',
					'rx':2,
					'ry':2,
					'width':width,
					'height':height
				})
				.style({
					'fill':color
				})
		},
		appendTexts: function(legends) {
			var self = this;
			var fontSize = this.style.labels.fontSize;
			legends.append('text')
				.attr({
					'x': self.graphicWidth + 5,
					'y': function(d, i) {
						return fontSize / 2 + self.lineHeight / 2 - 2;
					}
				})
				.style({
					'font-size': fontSize + 'px'
				})
				.text(function(d) {
					return d.name;
				});
		}
	});

	return Legend;
})