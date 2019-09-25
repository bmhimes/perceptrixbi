var onlineMarketingPBI = {};
onlineMarketingPBI.environment = {
	'EXPERIMENTAL_FEATURES_ENABLED': true,
	"DC_EVENT_DELAY": 160
};
onlineMarketingPBI.schema = {
	"fields": {
		"id": {
			"label": "ID",
			"parsingFunction": pbi.parseInt
		},
		"cid": {
			"label": "Campaign ID",
			"parsingFunction": pbi.mapBlankToNA
		},
		"g": {
			"label": "Gender",
			"parsingFunction": pbi.mapBlankToNA
		},
		"a": {
			"label": "Age Group",
			"parsingFunction": pbi.mapBlankToNA
		},
		"d": {
			"label": "Day",
			"parsingFunction": pbi.parseInt
		},
		"i": {
			"label": "Impressions",
			"parsingFunction": pbi.parseInt
		},
		"cl": {
			"label": "Clicks",
			"parsingFunction": pbi.parseInt
		}

	},
	"charts": {
		"ch-trend": {
			"chartTitle": "Impressions Trending",
			"chartType": "line",
			"chartMarginLeft": 50,
			"chartTransitionDuration": 500
		},
		"ch-gender": {
			"chartTitle": "Impressions by Gender",
			"chartType": "pie"
		},
		"ch-age": {
			"chartTitle": "Impressions by Age",
			"chartType": "pie"
		},
		"ch-campaign": {
			"chartTitle": "CTR by Campaign",
			"chartType": "row"
		}
	},
	"defaultSettings": {
		"chart": {
			"pie": {
				"chartHeight": 220,
				"innerRadius": 50,
				"pieSliceDeselectedStrokeWidth": 1,
				"pieSliceSelectedStrokeWidth": 3,
				"pieSliceStrokeColor": "gray",
				"pieSliceStrokeWidth": 1,
				"radius": 90
			},
			"row": {
				"barStrokeWidth": 1,
				"barStrokeColor": "gray",
				"chartHeight": 220,
				"elasticX": true,
				"gap": 3,
				"labelOffsetX": 5,
				"labelOffsetY": 13
			},
			"chartHeight": 330,
			"chartTitleHeight": 20,
			"chartMarginBottom": 30,
			"chartMarginLeft": 30,
			"chartMarginRight": 50,
			"chartMarginTop": 0,
			"chartTransitionDuration": 1500
		}
	},
	"colors": {
		"theme": {
			"DarkRed": "#96141e",
			"Red": "#d52330",
			"Pink": "#ef6a74",
			"PinkGray": "#cf9da1",
			"LightGray": "#909090",
			"Gray": "#424242",
			"DarkGray": "#212121"
		}
	}
};