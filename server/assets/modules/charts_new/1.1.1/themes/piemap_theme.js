define(function(require) {
	var heatmapTheme = {
		"chart":{
			"selector":"#d3chart_piemap",
			"layout":{
				"width":500,
				"height":500,
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
					"lineColor":"#fff",
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
		        ],
		        "heatmapColors":[
		        	'#fbfeff',
                    '#dcfdff',
                    '#aefaff',
                    '#86eefb',
                    '#76d3e2',
                    '#7aadba',
                    '#897d87',
                    '#9c4b51',
                    '#ae1f21',
                    '#b90303'
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
			"type":"piemap",
			//"defaultType": 'line',
			"zoom":null,
			"reflow":true,
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
			"tooltip":true,
			"axisGrid":false,
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
			"iconWidth": 16,
			"iconHeight": 12,
			"style": {
				"align":"right",
				"labels":{
					"fontColor":"#555",
					"fontSize":11
				}
			}
		},
		"axis": {
			"type": "cross", 
			"offset": {
				"top": 0,
				"bottom": 24,
				"left": 36,
				"right": 0
			}
		},
		"xAxis":{
			"labels":{
				"align": "right",
				"rotation": 90,
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
			"ticks":8
		}
	};
	return heatmapTheme;
})