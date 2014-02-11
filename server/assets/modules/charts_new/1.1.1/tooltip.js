define(function(require) {
	/**
	 * [ToolTip description]
	 * @param {[type]} options 
	 * {
	 * 	backgroundColor:'#fff',
	 * 	borderColor:'#666'
	 * 	
	 * }
	 */
	var Utils = require('./tools/chart_utils');

	function ToolTip(options) {
		this.init.apply(this, arguments);
	}

	_.extend(ToolTip.prototype, {
		init: function(chart) {
			var tooltipOpts = chart.opts.tooltip;
			this.chart = chart;
			this.chart.tooltip = this;
			this.chartScale = Utils.getSvgNodeScale(this.chart.bg.node());
			this.labelStyle = _.extend(chart.opts.chart.globalStyle.labels, tooltipOpts.style.labels);
			this.linePadding = 2,
			this.tooltipPadding = 5;
			this.draw(tooltipOpts);
		},
		draw: function(opts) {
			var chartContainer = this.chart.chartContainer;

			this.tooltip = chartContainer.append('g')
				.attr({
					'class':'tooltip'
				});

			this.tooltip
				.append('rect')
				.attr({
					'rx':3,
					'ry':3,
					'x':0,
					'y':0
				})
				.style({
					'stroke-width':1,
					'stroke':opts.style.borderColor,
					'fill':opts.style.backgroundColor,
					'fill-opacity':0.7
				});
		},
		fadeIn: function() {
			this.tooltip
				.style('opacity',0)
				.transition()
				.style('opacity', 1)
				.attr('visibility', '');
		},
		fadeOut: function() {
			this.tooltip
				.style('opacity',1)
				.transition()
				.style('opacity',0)
				.attr('visibility', 'hidden');
		},
		hide: function() {
			this.tooltip
				.style('opacity', 0)
				.attr('visibility', 'hidden');
		},
		show: function() {
			this.tooltip
				.style('opacity', 1)
				.attr('visibility', '');
		},
		getScale: function(text) {
			var w, h;
			if(text.getBBox) {
				w = text.getBBox().width;
				h = text.getBBox().height;
			} else {
				w = text.offsetWidth;
				h = text.offsetHeight;
			}

			return {
				width:w,
				height:h
			}
		},
		update: function(contents, position, color, noTransition) {
			var fontSize = this.labelStyle.fontSize,
				fontFamily = this.labelStyle.fontFamily,
				fontColor = this.labelStyle.fontColor,
				linePadding = this.linePadding,
				tooltipPadding = this.tooltipPadding;

			this.tooltip.select('rect')
				.style({
					'stroke':color
				})

			this.tooltip.select('text').remove();

			this.tooltip
				.append('text')
				.attr({
					//'text-anchor':'middle'
				})
				.style({
					'font-size':fontSize,
					'font-family':fontFamily,
					'fill': fontColor
				})
				.selectAll('tspan').data(contents)
				.enter()
				.append('tspan')
				.text(function(d) {
					return d.text || d;
				})
				.attr({
					'x': tooltipPadding,
					'y':function(d,i) {
						return (fontSize + linePadding) * i + tooltipPadding + fontSize;
					}
				})
				.style({
					'fill': function(d) {
						return d.color || '';
					}
				})


			var textScale = this.getScale(this.tooltip.select('text').node()),
				textRectW = textScale.width + tooltipPadding * 2,
				textRectH = textScale.height + tooltipPadding * 2

			this.tooltip.select('rect')
				.attr({
					'width': textRectW,
					'height': textRectH
				});

			this.styleText();

			this.textPosition(position, textRectW, textRectH, this.chartScale.width, 0);
			positionY = position.y - textRectH;

			if(noTransition) {
				this.tooltip
					.attr('transform', 'translate(' + position.x + ', ' + positionY + ')');

				return;
			}

			this.tooltip
				.transition()
				.attr('transform', 'translate(' + position.x + ', ' + positionY + ')');
		},
		styleText: function() {
			var tooltip = this;
			//this.tooltip.select('text')
				
		},
		textPosition: function(position, width, height, rightBoundary, topBoundary) {
			position.x *= 1;
			position.y *= 1;
			if(position.x + width > rightBoundary) {
				position.x = rightBoundary - width - 2;
			}

			if(position.y - height < topBoundary) {
				position.y = topBoundary + height + 1;
			}
		}
	});

	return ToolTip;
})