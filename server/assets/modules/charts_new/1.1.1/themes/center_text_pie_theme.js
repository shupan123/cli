define(function(require) {
	var defaults = {
		"chart":{
			"selector":"#d3chart_custom_pie",
			"layout":{
				"width":300,
				"height":280,
				"padding":0
			},
			"chartArea": {
				"offset": {
					"top": 0
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
				"colors":["#8fc125", "#56a212", "#b7d732", "#2a8900", "#ffff4a", "#e7ce27"]
			},
			"seriesStyle": {
				"pie": {
					"outerRadius": 95, //auto
					"innerRadius": 60,
					"labelContents":["name"],
					"colors":["#8fc125", "#56a212", "#b7d732", "#2a8900", "#ffff4a", "#e7ce27"]
				}
			},
			"type":"pie",
			"defaultType": 'line',
			"orient":"v",//vertical:v,horizontal:h
			"zoom":null,
			"reflow":true,
			"events":{
			},
			"title":{
				"align": "center",
				"fontColor": "#333",
				"fontSize": 14,
				"style": null,
				"text": "title demo"
			},
			"subtitle":{
				"align": "center",
				"fontColor": "#666",
				"fontSize": 12,
				"style": null,
				"text": "demo"
			},
			"axis": false, 
			"legend": false,
			"tooltip": false
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
		}
	};
	return defaults;
})