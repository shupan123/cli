define(function(require) {
	var Pie = require('./pie');
	var Utils = require('../tools/chart_utils');

	function SeriesCenterTextPie() {}

	SeriesCenterTextPie = Utils.extendClass(Pie, {
		type: 'centerTextPie',
		customDraw: function(seriesOpts) {
			var pie = this;
			var centerText = this.graph.append('text')
				.attr({
					//'x':pie.center[0],
					//'y':pie.center[1]
					//'transform':'translate(' + pie.center[0] + ',' + pie.center[1] + ')'
				})
				.style({
					'fill':'#666',
					'font-size':'18px',
					'text-anchor':'middle'
				});

			var percentText, valueText;
			percentText = centerText.append('tspan')
				.attr({
					'x':0
				})
				.style({
					'fill':'#00aaff',
					'font-size': '24px'
				})

			valueText = centerText.append('tspan').text(pie.amount)
				.attr({
					'x':0
				});

			this.getTooltipEle()
				.on('mouseover', function(d) {
					percentText
						.attr({
							'visibility':'',
							'y': -10
						})
						.text(d.data.percent);

					valueText.text(d.data.value)
						.attr({
							'visibility':'',
							'y': 10
						})
				})
				.on('mouseleave', function() {
					valueText.text(pie.amount)
						.attr({
							'y':0
						});

					percentText.attr('visibility','hidden');
				});
		}
	});

	return SeriesCenterTextPie;
})