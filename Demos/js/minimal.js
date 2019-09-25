var minimalPBI = {}
minimalPBI.environment = {
	'EXPERIMENTAL_FEATURES_ENABLED': false
};

minimalPBI.schema = {
	"fields": {
		"Quote_ID": {
			"label": "Quote ID",
			"parsingFunction": pbi.mapBlankToNA
		},
		"Policy_ID": {
			"label": "Policy ID",
			"parsingFunction": pbi.mapBlankToNA
		},
		"Annual_Premium": {
			"label": "Annual Premium",
			"parsingFunction": pbi.unformatNonnullCurrency,
			"displayFunction": pbi.formatNonnullCurrency
		},
		"Date": {
			"label": "Date",
			"parsingFunction": d3.time.format("%m/%d/%Y").parse,
			"displayFunction": d3.time.format("%m/%d/%y")
		},
		"LOB": {
			"label": "LOB",
			"parsingFunction": pbi.identity
		},
		"Quarter": {
			"label": "Quarter",
			"parsingFunction": pbi.identity
		},
		"Year": {
			"label": "Year",
			"parsingFunction": pbi.parseFastFloat
		}
	},
	"charts": {
		"ch-quote-bar": {
			"chartTitle": "Quotes by Year-Quarter",
			"chartType": "row"
		},
		"ch-quote-pie": {
			"chartTitle": "Quotes by LOB",
			"chartType": "pie"
		},
		"ch-policy-bar": {
			"chartTitle": "Policies by Year-Quarter",
			"chartType": "row"
		},
		"ch-policy-pie": {
			"chartTitle": "Policies by LOB",
			"chartType": "pie"
		},
		"ch-premium-bar": {
			"chartTitle": "Premium by Year-Quarter",
			"chartType": "row"
		},
		"ch-premium-pie": {
			"chartTitle": "Premium by LOB",
			"chartType": "pie"
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
				"pieSliceStrokeWidth": 2,
				"radius": 90
			},
			"row": {
				"barStrokeWidth": 1,
				"barStrokeColor": "gray",
				"chartHeight": 220,
				"elasticX": true,
				"gap": 3,
				"labelOffsetX": 5,
				"labelOffsetY": 12
			},
			"chartHeight": 200,
			"chartTitleHeight": 20,
			"chartMarginBottom": 30,
			"chartMarginLeft": 30,
			"chartMarginRight": 50,
			"chartMarginTop": 0
		}
	},
	"colors": {
		"theme": {
			"Matisse": "#1E5799",
			"Denim": "#1478B9",
			"DarkCerulean": "#0A99D9",
			"Cerulean": "#00BBFA",
			"Gray": "#D7D7D7",
			"Cerulean2": "#009DFA",
			"BrightGreen": "#22FD00",
			"Yellow": "#DBFF00",
			"Orange": "#FF7A00"
		}
	}
};
