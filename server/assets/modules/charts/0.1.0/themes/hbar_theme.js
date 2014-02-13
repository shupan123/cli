define(function(require) {
	var defaults = {
		"chart":{
			"selector":"#d3chart_hbar",
			"layout":{
				"width":500,
				"height":400,
				"margin":20,
				"padding":20
			},
			"chartArea": {
				"offset": {
					"top": 60
				}
			},
			"globalStyle": {
				"background":"#f7f7f7",
				"labels":{
					"fontColor":"#666",
					"fontSize":11,
					"fontFamily":"'Lucida Grande','Lucida Sans Unicode',Verdana,Arial,Helvetica,sans-serif",
				},
				"lines":{
					"lineColor":"#C0C0C0",
					"lineStyle":"solid",
					"lineWidth":1
				},
				"seriesColors":[
		            '#99c868',
		            '#f7d370',
		            '#ea4242',
		            '#3974d1',
		            '#e18654',
		            '#768e35',
		            '#bf2779',
		            '#6b37d3'
		        ]
			},
			"seriesStyle": {
				"lines":{
					"lineStyle":"solid",
					"lineWidth":2
				},
				"markers":{

				}
			},
			"type":"bar",
			"defaultType": 'line',
			"orient":"h",//vertical:v,horizontal:h
			"zoom":null,
			"reflow":true,
			"stack":false,
			"events":{
			},
			"title":{
				"align":"center",
				"fontColor":"#333",
				"fontSize": 14,
				"style":null,
				"text":"title demo"
			},
			"subtitle":{
				"align":"center",
				"fontColor":"#666",
				"fontSize": 12,
				"style":null,
				"text":"demo"
			},
			"axis":true,
			"legend":true,
			"tooltip":true
		},
		"tooltip": {
			"style": {
				"backgroundColor":"#fff",
				"borderColor":"#aaa",
				"labels":{
					"fontColor":"#333",
					"fontSize":11
				}
			}
		},
		"legend": {
			"width": 16,
			"height": 12,
			"style": {
				"align":"right", //bottom
				"labels":{
					"fontColor":"#333",
					"fontSize":12
				}
			}
		},
		"axis": {
			"offset": {
				"top": 0,
				"bottom": 24,
				"left": 28,
				"right": 0
			}
		},
		"xAxis":{
			"labels":{
				"align": "left",
				"rotation": 0,
				"style": null,
				"formatter": null
			},
			"lines":{
				"lineColor":"#C0C0C0",
				"lineStyle":"solid",
				"lineWidth":1
			},
			"ticks":10
		},
		"yAxis":{
			"labels":{
				"align": "center",
				"rotation": 0,
				"style": null,
				"formatter": null
			},
			"lines":{
				"lineColor":"#C0C0C0",
				"lineStyle":"solid",
				"lineWidth":1
			},
			"ticks":10
		}
	};
	return defaults;
})