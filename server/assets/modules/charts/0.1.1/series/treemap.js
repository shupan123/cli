define(function(require) {
	var Series = require('../seriesClass');
	var Utils = require('../tools/chart_utils');

	function SeriesTreeMap() {}

	SeriesTreeMap = Utils.extendClass(Series, {
		type: 'treemap',
		getTooltipEle: function() {
			return this.graph.selectAll('.node rect');
		},
		attrMap: {
			'x':'x',
			'y':'y'
		},
		draw: function(seriesOpts, callback) {
			var treemap = this,
				chartContainer = this.chart.chartContainer,
				chartOpts = this.chart.opts.chart;
				offsetTop = chartOpts.chartArea.offset.top,
				treemapWidth = chartOpts.layout.width,
				treemapHeight = chartOpts.layout.height - offsetTop;

			this.offsetTop = offsetTop;

			this.graph = chartContainer.append("g")
				.attr({
					'class':'treemap',
					'transform':'translate(0,' + offsetTop + ')'
				})
				.style({
					'z-index': treemap.index
				});

			var treemap = d3.layout.treemap()
				.size([treemapWidth, treemapHeight])
				.sticky(true)
				.value(function(d) { 
					return d.value; 
				});

			var node = this.graph.datum(seriesOpts.data).selectAll(".node")
				.data(treemap.nodes)
				.enter().append("g")
				.attr({
					'class': 'node'
				});

			_.defer(function() {
				node.append('rect')
				.attr({
					'x': function(d) {
						return d.x;
					},
					'y': function(d) {
						return d.y;
					},
					'width':function(d) { 
						return Math.max(0, d.dx); 
					},
					'height':function(d) {
						return Math.max(0, d.dy); 
					}
				});

				_.defer(function() {
					node.append('text')
						.text(function(d) {
							// console.log(d.name);
							return d.children && d.children.length ? null : d.name;
						})
						.attr({
							'x': function(d) {
								return d.x + 5;
							},
							'y': function(d) {
								return d.y + 12;
							}
						})
						.style({
							'fill':'#fff',
							'opacity': function(d) { 
								d.w = this.getComputedTextLength();
								return d.dx > d.w && d.dy > 12 ? 1 : 0; 
							}
						});
				});

				_.defer(function() {
					node.append('text')
						.text(function(d) {
							return d.children && d.children.length ? null : d.title;
						})
						.attr({
							'x': function(d) {
								return d.x + 5;
							},
							'y': function(d) {
								return d.y + 24;
							}
						}).style({
							'fill':'#fff',
							'opacity': function(d) {
								return d.dy > 24 ? 1 : 0; 
							}
						}).text(function(d) {
							var length = d.title.length,
								w = this.getComputedTextLength(),
								allowLength,
								maxLength = 15,
								fix = 10;

							if (!w || d.dx - fix <= 0) {
								return '';
							}

							allowLength = Math.floor((d.dx - fix) * (length/w));
							allowLength = Math.min(allowLength, maxLength);

							// console.log('name:', d.name, 'rectWidth:', d.dx, 'wordWidth', w, 'wordLength', length, 'word', d.title, 'allowLength', allowLength);

							return d.title.slice(0, allowLength);
						});
				});

				typeof callback == 'function' && callback.apply(this);
			});

		},
		styleSeries: function(styleOpts) {
			var seriesColors = styleOpts.treemap.colors,
      			color = d3.scale.ordinal()
    				.range(seriesColors);

    		this.graph.selectAll('.node rect')
    			.style({
    				'fill': function(d, i) {
    					return Utils.getColorByIPC(d.name);
    					// return d.children && d.children.length ? color(d.name): 'none';
    				},
    				'stroke': '#fff',
    				'shape-rendering': 'crispEdges'
    			});

    		$.publish('treemap:rendered', Utils);
		},
		customActionForTooltip: function(tooltip, currentSelection, contents, position, color, notransition) {
			position.y *= 1;
			position.y += this.offsetTop - 5;
			tooltip.update([contents.name + ': ' + contents.value], position, color, notransition);
			tooltip.show();
		}
	})
	
	return SeriesTreeMap;
})