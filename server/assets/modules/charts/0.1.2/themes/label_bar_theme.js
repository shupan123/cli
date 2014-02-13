define(function(require) {
	var defaults = {
		"chart":{
			"selector":"#d3chart_custom_hbar",
			"layout":{
				"width":300,
				"height":300,
				"padding":0
			},
			"chartArea": {
				"offset": {
					"top": 40
				}
			},
			"globalStyle": {
				"background":"#fff",
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
		            '#FF9582',
		            '#00AAFF'
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
			"legend":false,
			"tooltip":true,
			"mode":"nodes"
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
				"left": 3,
				"right": 0
			}
		},
		"xAxis":{
			"labels":{
				"align": "left",
				"rotation": 0,
				"display":"none",
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
			"ticks":5
		}
	};
	return defaults;
})