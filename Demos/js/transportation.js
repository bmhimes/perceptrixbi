var transportationPBI = {};
transportationPBI.environment = {
	'EXPERIMENTAL_FEATURES_ENABLED': true,
	"DC_EVENT_DELAY": 160
};
transportationPBI.schema = {
	"fields": {
		"id": {
			"label": "ID",
			"parsingFunction": pbi.parseInt
		},
		"cid": {
			"label": "Claim ID",
			"parsingFunction": pbi.mapBlankToNA
		},
		"amt": {
			"label": "Severity",
			"parsingFunction": pbi.unformatNonnullCurrency
		},
		"did": {
			"label": "Driver ID",
			"parsingFunction": pbi.parseInt
		},
		"dr": {
			"label": "Driver Region",
			"parsingFunction": pbi.identity
		},
		"dst": {
			"label": "Safety Tech",
			"parsingFunction": pbi.identity
		},
		"dss": {
			"label": "Simulator Score",
			"parsingFunction": pbi.parseInt
		},
		"risk": {
			"label": "PercetrixML Risk",
			"parsingFunction": pbi.parseFastFloat
		},
		"rid": {
			"label": "Route ID",
			"parsingFunction": pbi.identity
		},
		"rr": {
			"label": "Route Region",
			"parsingFunction": pbi.identity
		},
		"qtr": {
			"label": "Quarter",
			"parsingFunction": pbi.identity
		},
		"rw": {
			"label": "Weather",
			"parsingFunction": pbi.identity
		},
		"yr": {
			"label": "Year",
			"parsingFunction": pbi.parseInt
		}

	},
	"charts": {
		"ch-regions": {
			"chartTitle": "Claim Experience, Driver Home Region vs. Route",
			"chartType": "bubble",
			"chartTransitionDuration": 2000
		},
		"ch-safety-tech": {
			"chartTitle": "Risk Reduction by Safety Technology",
			"chartType": "bar",
			"chartMarginBottom": 40,
			"chartMarginLeft": 60
		},
		"ch-simulator-score": {
			"chartTitle": "Claims per 1K Routes by Simulator Score",
			"chartType": "row",
			"chartTransitionDuration": 1000
		},
		"ch-weather": {
			"chartTitle": "Claim Severity by Weather Conditions",
			"chartType": "pie"
		},
		"ch-trend": {
			"chartTitle": "Quarterly Claim Count Trending",
			"chartType": "line",
			"chartMarginLeft": 50,
			"chartTransitionDuration": 500
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
				"elasticX": true,
				"gap": 3,
				"labelOffsetX": 5,
				"labelOffsetY": 13
			},
			"chartHeight": 220,
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
			"Purple": "#644977",
			"Green": "#738a00",
			"Blue": "#42547b",
			"Gray": "#7c828d",
			"Gold": "#ffd200",
			"Purple2": "#453a68"
		}
	}
};