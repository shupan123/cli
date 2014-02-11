define(function(require) {
	var defaults = {
		"chart":{
			"selector":"#d3chart_custom_bar",
			"layout":{
				"width":460,
				"height":240,
				"padding":0
			},
			"chartArea": {
				"offset": {
					"top": 80,
					"right": 0
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
		            '#666'
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
			"defaultType": 'line',
			"orient":"v",//vertical:v,horizontal:h
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
			//false或'none':不存在axis, 'hidden':不显示axis, true or 'visibility':显示axis,
			//false or 'none'时axis相关配置无效
			"axis":'hidden',
			"legend":false,
			"tooltip":true,
			"mode":"nodes" //默认为normal
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
			//"normal"(default), "cross", "grid"
			//"type":"normal",
			"offset": {
				"top": 0,
				"bottom": 0,
				"left": 0,
				"right": 0
			}
		},
		"xAxis":{
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
		},
		"yAxis":{
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
		}
	};
	return defaults;
})