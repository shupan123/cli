define(function(require){


	return {
		extendClass : function(parent, members) {
			var o = function () {};
			o.prototype = new parent();
			this.extend(o.prototype, members);
			return o;
		},
		extend: function(a, b) {
			var n;
			if (!a) {
				a = {};
			}
			for (n in b) {
				a[n] = b[n];
			}
			return a;
		},
		getSvgNodeScale : function(svgNode) {
			var w, h;
			if(svgNode.getBBox) {
				return svgNode.getBBox();
			}
			return {
				width: svgNode.offsetWidth,
				height: svgNode.offsetHeight
			}
		},
		renderTpl: function() {
			
		},
		getColorByIPC: function(strIPC) {
			var reg = /(\w)(\d{1,2})?(\w)?([^\/]+)?(\/\d+)?/,
				arrayIPC = _.compact(strIPC.match(reg).slice(1)),
				color = '',
				self = this,
				funcs = ['getFirst', 'getSecond', 'getThird', 'getFourth', 'getFifth'],
				rootColors = {
					"A" : "#609900",
					"B" : "#479A8F",
					"C" : "#8E60AB",
					"D" : "#9D9071",
					"E" : "#A97148",
					"F" : "#2267AD",
					"G" : "#4F4F4F",
					"H" : "#CC6161"
				};

			this.arrayIPC = arrayIPC;

			funcs = _.map(funcs, function(value, key) {
				return _.bind(self[value], self);
			});

			funcs = _.compact(funcs.slice(0, arrayIPC.length)).reverse();

			color = _.compose.apply(null, funcs)(rootColors[arrayIPC[0].toUpperCase()]);

			return color;
		},
		getFirst: function first(rootColor) {
			return rootColor;
		},
		getSecond: function second(color) {
			var second = this.arrayIPC[1],
				hsl = d3.hsl(color),
				newHSL;

			if (second == 99) {
				return '#888888';
			} else {
				fixH = _.last(second.split('')) * 4 - 20;
				newHSL = d3.hsl(hsl.h + fixH, hsl.s, hsl.l);
				return newHSL.toString();
			}
		},
		getThird: function third(color) {
			var third = this.arrayIPC[2].toUpperCase(),
				hsl = d3.hsl(color),
				newHSL,
				dict = {
					A: 10,
				  	B: 9,
				  	C: 8,
				  	D: 7,
				  	E: 6,
				  	F: 5,
				  	G: 4,
				  	H: 3,
				  	I: 2,
				  	J: 1,
				  	K: 0,
				  	L: -1,
				  	M: -2,
				  	N: -3,
				  	O: -4,
				  	P: -5,
				  	Q: -6,
				  	R: -7,
				  	S: -8,
				  	T: -9,
				  	U: -10,
				  	V: -11,
				  	W: -12,
				  	X: -13,
				  	Y: -14
				};
			if (color == '#888888' || third == 'Z') {
				return '#888888';
			} else {
				fixL = dict[third] / 100;
				newHSL = d3.hsl(hsl.h, hsl.s, hsl.l + fixL);
				return newHSL.toString();
			}
		},
		getFourth: function fourth(color) {
			var fourth = this.arrayIPC[3],
				hsl = d3.hsl(color),
				newHSL;

			fixL = _.last(fourth.split('')) * 3 - 20;
			fixL = fixL / 100;
			newHSL = d3.hsl(hsl.h, hsl.s, hsl.l + fixL);

			return newHSL.toString();
		},
		getFifth: function fifth(color) {
			var fifth = this.arrayIPC[4],
				hsl = d3.hsl(color),
				newHSL;

			fixL = _.last(fifth.split('')) * 3 - 20;
			fixL = fixL / 100;
			newHSL = d3.hsl(hsl.h, hsl.s, hsl.l + fixL);
			
			return newHSL.toString();
		}
	}
})