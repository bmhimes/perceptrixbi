// Define PerceptrixBI namespace.
(function(pbi, dc, $, undefined) {

var pbi = pbi || {};

// Define environment.

pbi.environment = {};

// Define schema.

pbi.schema = {};

// Define experimental feature flag.

// TODO move to environment js
pbi.environment.EXPERIMENTAL_FEATURES_ENABLED = false;
pbi.environment.EVENT_NAMESPACE = "pbi";
pbi.environment.CHART_EVENT_NAMESPACE = pbi.environment.EVENT_NAMESPACE + "Chart";
pbi.environment.DC_EVENT_DELAY = 80;

// Load platform defaults.

// Define default constants.
pbi.constants = {};
pbi.constants.CHART_ELEMENT_DROP_SHADOW_FILTER_ID_FRAGMENT = "-drop-shadow";
pbi.constants.UNDEFINED_VALUE = "_PBI_UNDEFINED_VALUE";
pbi.constants.UNDEFINED_SETTING = "_PBI_UNDEFINED_SETTING";

// Chart type classes.
pbi.constants.chartTypeClass = {};
pbi.constants.chartTypeClass.DIMENSION_DATA_COUNT = "pbi-data-count";




pbi.buildEventNamespace = function (eventName) {
	return eventName
		+ "." + pbi.environment.EVENT_NAMESPACE;
}
pbi.buildChartEventNamespace = function (eventName) {
	return pbi.buildEventNamespace(eventName) + "." + pbi.environment.CHART_EVENT_NAMESPACE;
}
pbi.buildChartComponentEvent = function (eventName, chartComponentName) {
	componentName = pbi.capitalizeString(chartComponentName);
	eventNamespace = pbi.capitalizeString(eventName)
	componentEvent = pbi.environment.CHART_EVENT_NAMESPACE + eventNamespace + componentName;
	return componentEvent;
}
pbi.buildChartComponentEventNamespace = function (eventName, chartComponentName) {
	componentEventNamespace = pbi.buildChartEventNamespace(eventName) 
		+ "." + pbi.buildChartComponentEvent(eventName, chartComponentName);
	return componentEventNamespace;
} 



// Settings functions.

pbi.configureDC = function () {
	dc.constants.EVENT_DELAY = pbi.environment.DC_EVENT_DELAY;
}

pbi.realizeUndefinedSettings = function (settings) {
	for (setting in Object.keys(settings)) {
		if (typeof settings[setting] == "object") {
			pbi.realizeUndefinedSettings(setting);
		} else {
			if (settings[setting] == pbi.constants.UNDEFINED_SETTING) {
				settings[setting] = undefined;
			}
		}
	}
}

pbi.extendSettings = function(currentSettings, updatedSettings) {
	// Update settings in place.
	$.extend(currentSettings, updatedSettings);

	// Convert undefined settings into actual undefined values.
	pbi.realizeUndefinedSettings(currentSettings);
}

// settings: Map of schema and environment settings.
// settings.schema: Map of schemas, tied to hierarchy keys.
// settings.environment: Array of environments, processed FIFO.
pbi.initialize = function (settings) {

	console.log("Initializing PerceptrixBI.")

	var settingHierarchy = ["platform", "product", "customer", "project", "application"];

	if (settings.hasOwnProperty("schema")) {
		var schemaSet = settings["schema"];

		for (settingIndex = 0; settingIndex < settingHierarchy.length; settingIndex++) {
			var settingLevel = settingHierarchy[settingIndex]
			console.log("Checking for " + settingLevel + " schema.")
			if (schemaSet.hasOwnProperty(settingLevel)) {
				console.log("Loading " + settingLevel + " schema.");
				pbi.extendSettings(pbi.schema, schemaSet[settingLevel])
			}
		}
	}

	if (settings.hasOwnProperty("environment")) {
		var environmentList = settings["environment"]

		for (environmentIndex = 0; environmentIndex < environmentList.length; environmentIndex++) {
			console.log("Loading environment " + environmentIndex + ".")
			pbi.extendSettings(pbi.environment, environmentList[environmentIndex])
		}
	}

	// Configure dc.js.
	pbi.configureDC();

	pbi.generateFieldDefinitions()

	console.log("Finished initialization.")

}

// Define chart control builders.

// controlText: button text.
// controlName: string to use in ID and as main class.
// glyphiconClass: class of glyphicon
// clickFunction: function to add to "click" event listener on button.
// opts: additional options
// opts["additional classes"]: class string added to button.
// opts["glyphicon class"]: class of glyphicon to prepend to button text.  Leaving this option
//  undefined prevents the glyphicon from being added.
pbi.chartControlBuilder = function (controlText, controlName, clickFunction, opts) {

	return function (chart) {

		anchorID = chart.anchorName();

		control = $("<a></a>").appendTo("#" + anchorID)
			.attr("id", anchorID + "-" + controlName)
			.addClass(controlName)
			.text(controlText)
			.click(clickFunction);

		if (opts["additional classes"] != undefined) {
			control.addClass(opts["additional classes"]);
		}

		if (opts["initial style"] != undefined) {
			var initialStyle = opts["initial style"];

			for (property in initialStyle) {
				control.css(property, initialStyle[property])
			}
		}

		if (opts["glyphiconClass"] != undefined) {
			control.prepend("<span class='glyphicon " + opts["glyphiconClass"] + "' aria-hidden='true'></span>")
		}

		if (opts["alt text"] != undefined) {
			control.attr("title", opts["alt text"]);
		}

		return control;
	};
};

// Chart utility functions.

pbi.chartUtils = pbi.chartUtils || {};

// Returns an unattached filter element.
pbi.chartUtils.buildShadow = function (argOpts) {
	if (argOpts == undefined) {
		argOpts = {};
	}

	// Shadow offset.
	var dx = pbi.coalesce([argOpts.dx, 0]);
	var dy = pbi.coalesce([argOpts.dy, 0]);
	// Gaussian blur standard deviation.
	var std = pbi.coalesce([argOpts.std, 1]);
	// Filter area size.
	var height = pbi.coalesce([argOpts.height, "120%"]);
	var width = pbi.coalesce([argOpts.width, "120%"]);
	// Filter area offset.
	var x = pbi.coalesce([argOpts.x, "-10%"]);
	var y = pbi.coalesce([argOpts.y, "-10%"]);
	// Filter bounding box basis.
	var primitiveUnits = pbi.coalesce([argOpts.primitiveUnits, "userSpaceOnUse"]);

	var svg = d3.select(document.body).append("svg");
	var filterSelection = svg.append("filter");
	var filter = filterSelection.node();
		
	filterSelection
		.attr("height", height)
		.attr("width", width)
		.attr("x", x)
		.attr("y", y)
		.attr("primitiveUnits", primitiveUnits);

	if (argOpts.filterID != undefined) {
		filterSelection.attr("id", argOpts.filterID);
	}

	filterSelection.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", std)
		.attr("result", "blur");

	filterSelection.append("feOffset")
		.attr("in", "blur")
		.attr("dx", dx)
		.attr("dy", dy)
		.attr("result", "offsetBlur");

	var feMerge = filterSelection.append("feMerge");

	feMerge.append("feMergeNode")
		.attr("in", "offsetBlur");
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	filter.remove();
	svg.remove();
	return filter;
}

// DOM manipulation functions.

// DOM manipulation: creation and destruction.

// Remove element ID, clear inner HTML, and finally remove element.
// This immediately frees up the ID to be used again.
pbi.denatureElement = function (element) {
	var node = element;

	if (element != undefined) {
		// Get node from jQuery selection.
		if ($ != undefined && Object.getPrototypeOf(element) == $.prototype) {
			node = element[0];
		}
		// Get node from d3 selection.
		if (Object.getPrototypeOf(element) == d3.selection.prototype) {
			node = element[0][0];
		}

		if (node != undefined) {
			node.removeAttribute("id");
			node.innerHTML = "";
			node.remove();
		}
	}
};

// parentSelection: a d3 selection or element.
// name: tag name.
// elementID: (optional) ID of element to replace or create.
pbi.replaceOrCreate = function (parent, name, elementID) {
	var element;
	var newElement;
	var parentSelection;

	// Convert a parent element into a d3 selection.
	if (parent.select == undefined) {
		parentSelection = d3.select(parent);
	} else {
		parentSelection = parent;
	}

	// Look for element.
	if (elementID != undefined) {
		element = parentSelection.select("#" + elementID);
	} else {
		element = parentSelection.select(name);
	};

	// Remove ID and detach element.
	if (!element.empty()) {
		pbi.denatureElement(element);
	};
	
	// Create new element.
	newElement = parentSelection.append(name);
	if (elementID != undefined) {
		newElement.attr("id", elementID);
	};

	return newElement;
};

// DOM manipulation: class functions.

pbi.removeMatchingClasses = function (obj, regex) {
	// Get array of classes.
	classes = obj.attr("class").split(" ");

	// Iterate through classes.
	classes.forEach(function (sClass) {
		var completeMatchFound = false;

		// Check to see if class matches regex.
		var matches = regex.exec(sClass);

		// If matches are found, matches var will be an array.
		if (matches != undefined) {
			matches.forEach(function (match) {
				if (completeMatchFound == false && match.length == sClass.length) {
					completeMatchFound = true;
				}
			})
		}

		if (completeMatchFound == true) {
			$(obj).removeClass(sClass);
		}
	});
};

// glyphicon: a jQuery collection with a single element.
// This function removes all classes with the following pattern: glyphicon-* .
pbi.removeGlyphiconImageClasses = function (glyphicon) {
	var regex = /(glyphicon-)[a-zA-Z0-9\-]+/i;

	pbi.removeMatchingClasses(glyphicon, regex);
};

// DOM manipulation: SVG.

pbi.getTranslation = function (element) {

	// Acquire the transform list.
	var transformList = element.transform.baseVal;

	// Determine count of transformations.
	var transformationCount = transformList.numberOfItems;

	// Determine the translation item.
	var translationIndex = 0;
	for (transformationIndex = 0; transformationCount - 1; transformationIndex++) {
		// Test item types for match to "translation".
		if (transformList[transformationIndex].type == transformList[transformationIndex].SVG_TRANSFORM_TRANSLATE) {
			translationIndex = transformationIndex;
		}
	}

	// Return found transformation.
	return transformList[translationIndex];

};

pbi.makeTranslationString = function (x, y) {
	return "translate(" + x + ", " + y + ")";
};

pbi.translateSVG = function (element, x, y) {

	// Acquire translation.
	var translation = pbi.getTranslation(element);

	// Apply the translation to the transformation matrix.
	var translatedMatrix = translation.matrix.translate(x, y);

	// Set the new translation.
	var newX = translatedMatrix.e;
	var newY = translatedMatrix.f;
	translation.setTranslate(newX, newY);

	return element;
};



// Dimension functions.

pbi.getDimDistinctValues = function (dim) {
	var output = [];
	var grouping = dim.group().all();
	for (valueIndex = 0; valueIndex < grouping.length; valueIndex++) {
		output[valueIndex] = grouping[valueIndex].key;
	}
	return output;
};

pbi.generateFieldDefinitions = function () {
	console.log("Generating field definitions.");

	pbi.f = pbi.f || {};

	fieldNames = Object.keys(pbi.schema.fields);

	fieldNames.forEach(function (fieldName) {

		fieldVariableName = pbi.stringToVariable(fieldName);

		pbi["f"][fieldVariableName] = function (d) {
			return d[fieldName];
		}
	})

}

// Expression functions.

pbi.agg = pbi.agg || {};

pbi.agg.countDistinct = function (field, nullValue) {
	var fn = {
		"initial": function () {
			return new pbi.DistinctCounter();
		}
	};
	if (nullValue == undefined) {
		fn.add = function (p, v, nf) {
			p.add(v[field]);
			return p;
		}
		fn.remove = function (p, v, nf) {
			p.subtract(v[field]);
			return p;
		}
	} else {
		fn.add = function (p, v, nf) {
			if (v[field] != nullValue) {
				p.add(v[field]);
			}
			return p;
		}
		fn.remove = function (p, v, nf) {
			if (v[field] != nullValue) {
				p.subtract(v[field]);
			}
			return p;
		}
	}
	// return [fn.add, fn.remove, fn.initial];
	return fn;
}

pbi.agg.countNonnull = function (field, nullValue) {
	return {
		"add": function(p, v, nf) {
			if (v[field] != nullValue) {
				return p + 1;
			} else {
				return p;
			}
		},
		"remove": function(p, v, nf) {
			if (v[field] != nullValue) {
				return p - 1;
			} else {
				return p;
			}
		},
		"initial": function() {return 0;}
	}
};

pbi.agg.removeEmptyBins = function (unfilteredGroup) {
	return {
		"all": function () {
			return unfilteredGroup.all().filter(function (d) {
				return d.value != 0;
			});
		}
	};
}

pbi.agg.removeEmptyBinsAccessor = function (unfilteredGroup, accessorFn) {
	return {
		"all": function () {
			return unfilteredGroup.all().filter(function (d) {
				return accessorFn(d) != 0;
			});
		}
	};
}

pbi.agg.sumRatio = function (numeratorField, denomenatorField, numeratorNullValue, denomenatorNullValue) {
	numeratorNullValue = pbi.coalesce([numeratorNullValue, "NaN"]);
	denomenatorNullValue = pbi.coalesce([denomenatorNullValue, "NaN"]);
	return {
		"add": function (p, v, nf) {
			if (v[numeratorField] !=  numeratorNullValue) {
				p.numeratorSum += v[numeratorField];
			}

			if (v[denomenatorField] !=  denomenatorNullValue) {
				p.denomenatorSum += v[denomenatorField];
			}

			// Prevent division by 0.
			if (p.denomenatorSum == 0) {
				p.sumRatio = 0;
			} else {
				p.sumRatio = p.numeratorSum / p.denomenatorSum;
			}
			return p;
		},
		"remove": function (p, v, nf) {
			if (v[numeratorField] !=  numeratorNullValue) {
				p.numeratorSum -= v[numeratorField];
			}

			if (v[denomenatorField] !=  denomenatorNullValue) {
				p.denomenatorSum -= v[denomenatorField];
			}

			// Prevent division by 0.
			if (p.denomenatorSum == 0) {
				p.sumRatio = 0;
			} else {
				p.sumRatio = p.numeratorSum / p.denomenatorSum;
			}
			return p;
		},
		"initial": function () {
			return {
				"numeratorSum": 0,
				"denomenatorSum": 0,
				"sumRatio": 0
			};
		}
	};
};

// Data processing functions.

pbi.convertQuarterToNumber = function (val, formatString) {
	if (formatString == undefined) {
		formatString = "Q#";
	}
	if (pbi.charCount(formatString, '#') == 0) {
		throw new pbi.FormatStringError("No quarter number symbol (#).")
	}
	if (pbi.charCount(formatString, '#') > 1) {
		throw new pbi.FormatStringError("Too many quarter number symbols (#).")
	}

	formatParts = formatString.split('#')
	for (formatPartIndex == 0; formatPartIndex < formatParts.length; formatPartIndex++) {
		if (formatParts[formatPartIndex] != "") {
			formatParts[formatPartIndex] = "(" + formatParts[formatPartIndex] + ")"
		}
	}
	regex = new RegExp("^" + formatParts.join("[1-4]{1}") + "$", "i");
	match = regex.exec(val);
	output = null;
	if (matches != null) {
		output = parseInt(matches[0]);
	}

	return output;
};

pbi.convertYearFractionToQuarter = function (yearFraction) {
	var output = "";
	if (yearFraction >= 0 && yearFraction < 0.25) {
		output = "Q1";
	} else if (yearFraction >= 0.25 && yearFraction < 0.5) {
		output = "Q2";
	} else if (yearFraction >= 0.5 && yearFraction < 0.75) {
		output = "Q3";
	} else if (yearFraction >= 0.75 && yearFraction < 1.0) {
		output = "Q4";
	}
	return output;
};

pbi.convertYearDecimalToYearQuarter = function (yearDecimal) {
	var year = Math.trunc(yearDecimal);
	var quarter = pbi.convertYearFractionToQuarter(yearDecimal - year);
	return year + quarter;
};

pbi.formatNonnullCurrency = function (sourceValue) {
	var output = "";
	if (sourceValue != "") {
		output = accounting.formatMoney(sourceValue);
	}
	return output;
};

pbi.identity = function (d) {
	return d;
};

pbi.parseInt = function (d) {
	return parseInt(d);
};

pbi.mapBlank = function (sourceString, targetString) {
	var outputString = sourceString;
	if (sourceString == "") {
		outputString = targetString
	};
	return outputString;
};

pbi.mapBlankToNA = function (sourceString) {
	return pbi.mapBlank(sourceString, "N/A");
};

pbi.parseFastFloat = function (sourceString) {
	return +sourceString;
};

pbi.parseRow = function (dataRow) {
	for (fieldName in pbi.schema.fields) {
		dataRow[fieldName] = pbi.schema.fields[fieldName].parsingFunction(dataRow[fieldName]);
	}
};

pbi.unformatNonnullCurrency = function (sourceString) {
	var output = "";
	if (sourceString != "") {
		output = accounting.unformat(sourceString);
	};
	return output;
};

// Ordering functions.

pbi.ordering = pbi.ordering || {};
pbi.ordering.valueAsc = function (d) {
	return d.value
};
pbi.ordering.valueDesc = function (d) {
	return -d.value;
};

// Gradient functions.

pbi.gradient = pbi.gradient || {}
// donut chart radial gradient builder
// bubble chart linear gradient builder
// bar chart linear gradient builder
// row chart linear gradient builder
// line chart linear gradient builder






pbi.ChartListener = function () {
	// Array of period-delimited events.
	this.events = [];
	// Numeric priority.  A larger priority means more important.
	this._priority = null;
	// Name of the listener, equivalent to an ID.
	this._name = null;
	// Actual listener function.
	this._fn = function () {};
}

pbi.ChartListener.prototype = {
	"name": function (_) {
		if (!arguments.length) { 
			return this._name;
		}
		this._name = _;
		return this;
	},
	"priority": function (_) {
		if (!arguments.length) { 
			return this._priority;
		}
		this._priority = _;
		return this;
	},
	"addEvent": function (newEvent) {
		this.events.push(newEvent);
		return this;
	},
	"removeEvent": function (targetEvent) {
		var eventIndex = this.events.findIndex(targetEvent);
		if (eventIndex != -1) {
			this.events.splice(eventIndex, 1);
		}
		return this;
	},
	"fn": function (_) {
		if (!arguments.length) { 
			return this._fn;
		}
		this._fn = _;
		return this;
	}
}






// General functions.

pbi.capitalizeString = function (string) {
	var words = string.split(" ");
	var uppercaseWords = $.map(
		words,
		function (word, wordIndex) {
			word[0] = word[0].toLocaleUpperCase();
		}
	)
	var uppercaseString = uppercaseWords.join(" ");
	return uppercaseString;
}

pbi.charCount = function (val, searchChar, caseSensitive) {
	if (caseSensitive == undefined) {
		caseSensitive = true;
	}
	if (caseSensitive == false) {
		val = val.toLocaleLowerCase();
		searchChar = searchChar.toLocaleLowerCase();
	}
	var count = 0;
	for (charIndex = 0; charIndex < val.length; charIndex++) {
		if (val.charAt(charIndex) == searchChar) {
			count += 1;
		}
	}
	return count;
}

// Returns the first value that is not null or undefined.
pbi.coalesce = function (values) {
	var output = values[0];
	for (valueIndex = 0; valueIndex < values.length; valueIndex++) {
		if (values[valueIndex] != undefined) {
			output = values[valueIndex];
			break;
		}
	}
	return output;
};

// Returns a new string that does not contain any of the characters in purgeString.
pbi.purgeChar = function (val, purgeString) {
	// Create array of characters.
	var purgeChars = purgeString.split("");
	purgeChars.forEach(function (currentChar) {
		val = val.replace(currentChar, "");
	})
	return val;
}

// Returns a new stirng stripped of all non-alphanumeiric characters.
pbi.stringToVariable = function (val) {
	return val.replace(/[^a-zA-Z\d\u00C0-\u00FF]/g, "");
}

// Returns a new lowercase string, with all non-alphanumeric characters (except hypens) replaced with underscores.
pbi.valueToID = function (val) {
	return val
		.toString()
		.replace(/[^a-zA-Z\d\u00C0-\u00FF-]/g, "_")
		.toLocaleLowerCase();
};

// Errors.

pbi.error = pbi.error || {};
pbi.FormatStringError = function (message) {
	this.message = message;
	this.name = "FormatStringError"
}

}(window.pbi = window.pbi || {}, dc, jQuery));

// Helper objects.

pbi.DistinctCounter = function () {
	// Map to track value counts.
	this._map = d3.map();
};

pbi.DistinctCounter.prototype = {
	"add": function (val) {
		if (this._map.has(val)) {
			this._map.set(val, this._map.get(val) + 1);
		} else {
			this._map.set(val, 1);
		}
		return this;
	},
	"subtract": function (val) {
		if (this._map.has(val)) {
			var count = this._map.get(val);
			if (count > 1) {
				this._map.set(val, count - 1);
			} else {
				this._map.remove(val);
			}
		}
		return this;
	},
	"size": function (val) {
		return this._map.size();
	}
};

// Enhance dc chart registry.
(function (dc, d3, crossfilter, undefined) {

// Retrieve chart object by specifying its anchor element ID.
dc.chartRegistry.getChartByAnchorName = function (anchorName) {
	var chartList = dc.chartRegistry.list();
	for (chartIndex = 0; chartIndex < chartList.length; chartIndex++) {
		chart = chartList[chartIndex];
		if (chart.anchorName() == anchorName) {
			return chart;
		}
	}
}

// Detect if a chart is registered via its anchor element ID.
dc.chartRegistry.hasWithAnchorName = function (anchorName) {
	var output = false;
	var chartList = dc.chartRegistry.list();
	for (chartIndex = 0; chartIndex < chartList.length; chartIndex++) {
		chart = chartList[chartIndex];
		if (chart.anchorName() == anchorName) {
			output = true;
			break;
		}
	}
	return output;
}

// Convenience function for dc.chartRegistry.getChartByAnchorName.
dc.getChartByAnchorName = function (anchorName) {
	return dc.chartRegistry.getChartByAnchorName(anchorName);
}

// Convenience function for dc.chartRegistry.hasWithAnchorName.
dc.hasChartWithAnchorName = function (anchorName) {
	return dc.chartRegistry.hasWithAnchorName(anchorName);
}

}(dc, d3, crossfilter));

// Enhance dc charts.

// TODO remove my custom renderlets
// TODO add listener registry (function, id, name?)

(function (dc, d3, crossfilter, $, undefined) {
dc.override(dc, "baseChart", function (_chart) {

	_chart = this._baseChart(_chart);

	_chart.getLargestDimension = function () {
		return d3.max([_chart.width(), _chart.height()]);
	};
	_chart.getSmallestDimension = function () {
		return d3.min([_chart.width(), _chart.height()]);
	};
	_chart.getLargestInnerDimension = function () {
		var width;
		var height;
		if (_chart.hasOwnProperty("margins")) {
			width = _chart.width() - _chart.margins().left - _chart.margins().right;
			height = _chart.height() - _chart.margins().top - _chart.margins().bottom;
		} else {
			width = _chart.width();
			height = _chart.height();
		}
		return d3.max([width, height]);
	};
	_chart.getSmallestInnerDimension = function () {
		var width;
		var height;
		if (_chart.hasOwnProperty("margins")) {
			width = _chart.width() - _chart.margins().left - _chart.margins().right;
			height = _chart.height() - _chart.margins().top - _chart.margins().bottom;
		} else {
			width = _chart.width();
			height = _chart.height();
		}
		return d3.min([width, height]);
	};

	// Add property for chart components.
	_chart.componentRegistry = function () {
		var _componentMap = {};

		return {
			// This function is NOT chainable.
			has: function (componentName) {
				var output = false;
				if (_componentMap[componentName] != undefined) {
					output = true;
				}
				return output;
			},
			clear: function () {
				for (var componentKey in _componentMap) {
					pbi.denatureElement(_componentMap[componentName].node);
				};
				_componentMap = {};
				return _chart;
			},
			set: function (componentName, component) {
				_componentMap[componentName] = component;
				return _chart;
			},
			register: function (componentName, component) {
				if (_componentMap[componentName] != undefined) {
					throw "Attempting to overwrite existing component " + componentName + " on chart[#" + _chart.anchorName() + "] with register."
				}
				_componentMap[componentName] = component;
				return _chart;
			},
			remove: function (componentName) {
				console.log(componentName)
				pbi.denatureElement(_componentMap[componentName].node);
				_componentMap[componentName] = undefined;
				return _chart;
			},
			// This function is NOT chainable.
			list: function () {
				return _componentMap;
			},
			get: function (componentName) {
				return _componentMap[componentName];
			}
		};
	}();

	// Convenience functions for chart components.
	_chart.hasComponent = function (componentName) {
		return _chart.componentRegistry.has(componentName);
	}
	_chart.clearComponents = function () {
		return _chart.componentRegistry.clear();
	}
	_chart.setComponent = function (componentName, component) {
		return _chart.componentRegistry.set(componentName, component);
	}
	_chart.registerComponent = function (componentName, component) {
		return _chart.componentRegistry.register(componentName, component);
	}
	_chart.removeComponent = function (componentName) {
		return _chart.componentRegistry.remove(componentName);
	}
	_chart.componentList = function () {
		return _chart.componentRegistry.list();
	}
	_chart.getComponent = function (componentName) {
		return _chart.componentRegistry.get(componentName);
	}

	// Reset all components on full render.
	// FIXME not working?
	// _chart.on("preRender", _chart.clearComponents);

	_chart.resetChart = function () {
		_chart.filterAll();
		dc.redrawAll(_chart.chartGroup());
		return _chart;
	}

	var _chartImageDownloadFilename = function () {
		return _chart.anchorName();
	}
	_chart.ImageDownloadFilename = function (newName) {
		if (!arguments) {
			return _chartImageDownloadFilename();
		}
		_chartImageDownloadFilename = function (chart) {
			return newName(chart);
		}
		return _chart;
	}
	_chart.promptImageDownload = function() {
		var previousBackgroundColor = _chart.select("svg").style("background-color");
		_chart.select("svg").style("background-color", "#FFFFFF");;
		Pablo("#" + _chart.anchorName() + " svg").download("png", _chartImageDownloadFilename() + ".png")
		_chart.select("svg").style("background-color", previousBackgroundColor);
	}

	_chartControlFadeInTime = 500;
	_chart.chartControlFadeInTime =  function (_) {
		if (!arguments.lenth) {
			return _chartControlFadeInTime;
		}
		_chartControlFadeInTime = _;
		return _chart;
	}

	_chartControlFadeOutTime = 500;
	_chart.chartControlFadeOutTime =  function (_) {
		if (!arguments.lenth) {
			return _chartControlFadeOutTime;
		}
		_chartControlFadeOutTime = _;
		return _chart;
	}

	_chart._postrenderRenderlets = [];
	_chart.runAllPostrenderRenderlets = function (chart) {
		// console.log("run all postrender")
		for (var i = 0; i < _chart._postrenderRenderlets.length; i++) {
			// console.log("postrender " + i)
			_chart._postrenderRenderlets[i](chart);
		}
	}
	_chart.postrenderRenderlets = function (_) {
		_chart._postrenderRenderlets.push(_);
		return _chart;
	}
	// _chart.on("postRender", _chart.runAllPostrenderRenderlets);

	_chart.positionComponent = function (componentName) {
		// console.log("componentName = " + componentName);
		var component = _chart.getComponent(componentName);
		var element = component.node;
		var opts = component.positionOpts();
		$(element).position(opts);
		return _chart;
	}
	_chart.positionAllComponents = function () {
		return _chart;
	}

	_chart._renderChartResetButton = true;
	_chart._renderChartDownloadImageButton = true;
	_chart._renderChartDownloadCSVButton = false;

	var _chartResetButtonComponentName = "chart reset button";
	var _chartDownloadImageButtonComponentName = "chart download image button";
	var _chartDownloadCSVButtonComponentName = "chart download csv button";

	var _chartResetButtonName = "chart-reset";
	var _chartDownloadImageButtonName = "chart-img-dl";
	var _chartDownloadCSVButtonName = "chart-csv-dl";

	var _chartResetButtonText = "Reset";
	var _chartDownloadImageButtonText = "";
	var _chartDownloadCSVButtonText = "Excel";

	var _chartResetButtonGlyphicon = "glyphicon-remove-circle";
	var _chartDownloadImageButtonGlyphicon = "glyphicon-picture";
	var _chartDownloadCSVButtonGlyphicon = "glyphicon-download-alt";

	var _chartResetButtonAdditionalClasses = "btn btn-danger disabled";
	var _chartDownloadImageButtonAdditionalClasses = "btn btn-primary";
	var _chartDownloadCSVAdditionalClasses = "btn btn-primary";

	var _chartResetButtonPositionOpts = function () {
		return {
			"my": "right top",
			"at": "right top",
			"of": $(_chart.root()[0][0]),
			"collision": "none"
		};
	};
	var _chartDownloadImageButtonPositionOpts = function () {
		return {
			"my": "right top",
			"at": "right top+24px",
			"of": $(_chart.root()[0][0]),
			"collision": "none"
		};
	}
	var _chartDownloadCSVButtonOpts;

	var _chartResetButtonInitialStyle = {
		"opacity": 0
	};
	var _chartDownloadImageButtonInitialStyle = {
		"opacity": 0
	};

	var _chartResetButtonBuilder = pbi.chartControlBuilder(

		_chartResetButtonText,
		_chartResetButtonName, 
		_chart.resetChart,
		{
			"additional classes": _chartResetButtonAdditionalClasses,
			"glyphiconClass": _chartResetButtonGlyphicon,
			"initial style": _chartResetButtonInitialStyle
		}
	)
	var _addChartResetButton = function () {
		if (_chart.hasComponent(_chartResetButtonName)) {
			_chart.removeComponent(_chartResetButtonName);
		}
		
		component = _chartResetButtonBuilder(_chart);

		_chart.registerComponent(_chartResetButtonComponentName, {
			"type": "control",
			"name": _chartResetButtonComponentName,
			"node": component[0],
			"positionOpts": _chartResetButtonPositionOpts
		});

		// // Register hover effects.
		// $(_chart.anchor()).on(
		//     pbi.buildChartComponentEventNamespace("mouseenter", _chartResetButtonComponentName),
		//     function () {
		//         var element = $(_chart.chartResetButton().node);
		//         if (element.hasClass("disabled")) {
		//             element.finish().fadeTo(_chartControlFadeInTime, 0.25);
		//         } else {
		//             element.finish().fadeTo(_chartControlFadeInTime, 1);
		//         }
				
		//     }
		// );
		// $(_chart.anchor()).on(
		//     pbi.buildChartComponentEventNamespace("mouseleave", _chartResetButtonComponentName),

		//     function () {
		//         var element = $(_chart.chartResetButton().node);
		//         if (element.hasClass("disabled")) {
		//             element.finish().fadeTo(_chartControlFadeOutTime, 0);
		//         }
				
		//     }
		// );

	}

	_chart.renderChartResetButton = function (newState) {
		if (!arguments.length) {
			return _chart._renderChartResetButton;
		}

		if (newState == true) {
			if (_chart._renderChartResetButton == false) {
				_addChartResetButton()
			}
		} else {
			if (_chart.hasComponent(_chartResetButtonName)) {
				_chart.removeComponent(_chartResetButtonName);
			}
		}
		_chart._renderChartResetButton = newState;
		return _chart;

	}
	var _toggleChartResetButton = function () {
		if (_chart.hasComponent("chart reset button")) {
			if (_chart.hasFilter()) {
			
			}
		}
	}

	var _chartDownloadImageButtonBuilder = pbi.chartControlBuilder(

		_chartDownloadImageButtonText,
		_chartDownloadImageButtonName, 
		_chart.promptImageDownload,
		{
			"additional classes": _chartDownloadImageButtonAdditionalClasses,
			"glyphiconClass": _chartDownloadImageButtonGlyphicon,
			"initial style": _chartDownloadImageButtonInitialStyle,
			"alt text": "Download Image"
		}
	)
	var _addChartDownloadImageButton = function () {
		// console.log("add download image")
		if (_chart.hasComponent(_chartDownloadImageButtonName)) {
			_chart.removeComponent(_chartDownloadImageButtonName);
		}
		
		component = _chartDownloadImageButtonBuilder(_chart);

		// component.position({
		//     "my": "right top",
		//     "at": "right top+24px",
		//     "of": $(_chart.root()[0][0]),
		//     "collision": "none"
		// })

		_chart.registerComponent(_chartDownloadImageButtonComponentName, {
			"type": "control",
			"name": _chartDownloadImageButtonComponentName,
			"node": component[0],
			"positionOpts": _chartDownloadImageButtonPositionOpts
		});

		// Register hover effects.
		$(_chart.anchor()).on(
			pbi.buildChartComponentEventNamespace("mouseenter", _chartDownloadImageButtonComponentName),
			function () {
				$(_chart.chartDownloadImageButton().node).finish().fadeTo(_chartControlFadeInTime, 1);
			}
		);
		$(_chart.anchor()).on(
			pbi.buildChartComponentEventNamespace("mouseleave", _chartDownloadImageButtonComponentName),
			function () {
				$(_chart.chartDownloadImageButton().node).finish().fadeTo(_chartControlFadeOutTime, 0);
			}
		);
	}
	_chart.renderChartDownloadImageButton = function (newState) {
		if (!arguments.length) {
			return _chart._renderChartDownloadImageButton;
		}
		if (newState == true) {
			if (_chart._renderChartDownloadImageButton == false) {
				_addChartDownloadImageButton()
			}
		} else {
			if (_chart.hasComponent(_chartDownloadImageButtonComponentName)) {
				_chart.removeComponent(_chartDownloadImageButtonComponentName);
			}
			$(_chart.anchor()).off(pbi.buildChartComponentEvent("mouseenter", _chartDownloadImageButtonComponentName));
			$(_chart.anchor()).off(pbi.buildChartComponentEvent("mouseleave", _chartDownloadImageButtonComponentName));
		}
		_chart._renderChartDownloadImageButton = newState;
		return _chart;
	}

	_chart.renderChartDownloadCSVButton = function (newState) {
		if (!arguments.length) {
			return _chart._renderChartDownloadCSVButton;
		}
		_chart._renderChartDownloadCSVButton = newState;
		return _chart;
	}

	// This function is NOT chainable.
	_chart.chartResetButton = function () {
		return _chart.getComponent(_chartResetButtonComponentName);
	}

	// This function is NOT chainable.
	_chart.chartDownloadImageButton = function () {
		return _chart.getComponent(_chartDownloadImageButtonComponentName);
	}

	// This function is NOT chainable.
	_chart.chartDownloadCSVButton = function () {
		return _chart.getComponent("chart csv download");
	}

	// Add rendering for components.

	// Chart reset button.
	var _toggleChartResetButtonFunction = function (chart) {
		if (_chart._renderChartResetButton) {
			var chartResetButtonToggleAnimationDuration = 500;
			var element = d3.select(_chart.chartResetButton().node);

			var show = function () {
				element.style("opacity", 1);
			};
			var hide = function () {
				element.style("opacity", 0).classed("disabled", true);
			};

			var ease = d3.ease("poly", 2);

			if (_chart.hasFilter()) {
				if (element.style("opacity") != 1) {

					element
						// Remove disabled class.
						.classed("disabled", false)

						// Name the transition to prevent interruptions by other transitions.
						.transition("toggleChartResetButton")

						// Gradually control opacity.
						.tween("toggleChartResetButton", function () {
							return function (t) {
								element.style("opacity", ease(t));
							};
						})
						

						// Ensure that the button is visible.
						.each("interrupt", show)
						.each("end", show)
						.duration(chartResetButtonToggleAnimationDuration);
					
				}
			} else {
				
				if (element.style("opacity") != 0) {
					element

						// Name the transition to prevent interruptions by other transitions.
						.transition("toggleChartResetButton")

						// Gradually control opacity
						.tween("toggleChartResetButton", function () {
							return function (t) {
								d3.select(this).style("opacity", ease(1 - t));
							};
						})

						// Ensure that the button is hidden.
						.each("interrupt", hide)
						.each("end", hide)
						.duration(chartResetButtonToggleAnimationDuration);
				}
			}
		}
	}
	_chart.toggleChartResetButtonFunction = function (newFunction) {
		if (!arguments.length) { 
			return _toggleChartResetButton;
		}
		_toggleChartResetButton = newFunction;
		return _chart;
	} 
	

	var _renderChartResetButtonFunction = function (chart) {
		// console.log("render reset fn")
		// console.log("_chart._renderChartResetButton = " + _chart._renderChartResetButton)
		if (_chart._renderChartResetButton) {

			if (!_chart.hasComponent(_chartResetButtonComponentName)) {
				_addChartResetButton()
			}
			_chart.positionChartResetButton();
		}
	};
	_chart.renderChartResetButtonFunction = function (newFunction) {
		if (!arguments.length) { 
			return _chart._renderChartResetButtonFunction;
		}
		_chart._renderChartResetButtonFunction = newFunction;
		return _chart;
	};
	_chart.positionChartResetButton = function () {
		_chart.positionComponent(_chartResetButtonComponentName);
		return _chart;
	};
	//DEBUG
	_chart.renderlet(_renderChartResetButtonFunction);
	_chart.renderlet(_toggleChartResetButtonFunction)



	// Chart download CSV button.
	var _renderChartDownloadCSVButtonFunction = function () {};
	_chart.renderChartDownloadCSVButton = function (newFunction) {
		if (!arguments.length) { 
			return _chart._renderChartDownloadCSVButtonFunction;
		}
		_chart._renderChartDownloadCSVButtonFunction = newFunction;
		return _chart;
	}
	// _chart.renderlet(positionChartDownloadCSVButton)

	// Chart download image button.
	var _renderChartDownloadImageButtonFunction = function (chart) {
		// console.log("render image download fn")
		if (_chart._renderChartDownloadImageButton) {
			if (!_chart.hasComponent(_chartDownloadImageButtonComponentName)) {
				_addChartDownloadImageButton()
			}
			_chart.positionChartDownloadImageButton();
		}
	};
	_chart.renderChartDownloadImageButtonFunction = function (newFunction) {
		if (!arguments.length) { 
			return _renderChartDownloadImageButtonFunction;
		}
		_renderChartDownloadImageButtonFunction = newFunction;
		return _chart;
	}
	_chart.positionChartDownloadImageButton = function () {
		_chart.positionComponent(_chartDownloadImageButtonComponentName);
		return _chart;
	};
	_chart.renderlet(_renderChartDownloadImageButtonFunction);

	// Chart title.

	var _chartTitle

	// Define chart title text.
	_chart.chartTitle = function (newTitle) {
		if (!arguments.length) { 
			return _chartTitle;
		}
		_chartTitle = newTitle;
		_renderChartTitle = true;
		return _chart;
	}

	// Define chart title rendering status.
	var _renderChartTitle = false;

	// Get and set chart title rendering status.
	_chart.renderChartTitle = function (newState) {
		if (!arguments.length) { 
			return _renderChartTitle;
		}
		_renderChartTitle = newState;
	}

	// Chart positioning.
	var _chartPositionDefaultOptions = function () {
		return {
			"of": "#" + _chart.anchorName()
		};
	}
	var _chartPositionOptions = {};

	_chart.positionOptions = function (opts) {
		if (!arguments.length) {
			return $.extend({}, _chartPositionDefaultOptions(), _chartPositionOptions);
		}
		$.extend(_chartPositionOptions, opts);
		return _chart;
	}
	_chart.position = function () {
		$(_chart.anchor()).position($.extend({}, _chartPositionDefaultOptions(), _chartPositionOptions));
		return _chart;
	}

	// Filter management.
	_chart.clearFilterList = function () {
		while (_chart.filters().pop()) {};
		return _chart;
	};

	_chart.addToFilterList = function (filters) {
		if (Object.getPrototypeOf(filters) == Array.prototype) {
			var filtersCopy = filters.slice(0);
			var p;
			while (p = filtersCopy.pop()) {
				_chart.filters().push(p);
			}
		} else {
			_chart.filters().push(filters.toString())
		}
		return _chart;
	};

	_chart.applyFilterList = function () {
		_chart.filterHandler()(_chart.dimension(), _chart.filters())
		return _chart;
	};

	_chart.filterListEquals = function (filters) {
		var equal = false;
		if (_chart.filters().length == filters.length) {
			if (filters.every(function (val) {return _chart.filters().includes(val);})) {
				equal = true;
			}
		}
		return equal;
	};

	// SVG filters.
	_chart.addShadowFilter = function (filterID, shadowBuilderOpts) {
		if (shadowBuilderOpts == undefined) {
			shadowBuilderOpts = {};
		}

		shadowBuilderOpts.filterID = filterID;

		var shadowRenderlet = function () {
			pbi.denatureElement(document.getElementById(filterID));
			var defs = dc.utils.appendOrSelect(_chart.svg(), "defs");
			defs.node().append(pbi.chartUtils.buildShadow(shadowBuilderOpts));
		};

		_chart.renderlet(shadowRenderlet);

		return _chart;
	};

	_chart.addElementDropShadow = function (elementSelectors, shadowBuilderOpts, name) {
		if (shadowBuilderOpts == undefined) {
			shadowBuilderOpts = {};
		}
		shadowBuilderOpts.dx = pbi.coalesce([shadowBuilderOpts.dx, 1]);
		shadowBuilderOpts.dy = pbi.coalesce([shadowBuilderOpts.dy, 1]);
		shadowBuilderOpts.std = pbi.coalesce([shadowBuilderOpts.std, 1]);

		var nameID = "";
		if (name != undefined) {
			nameID = "-" + pbi.valueToID(name);
		}
		var filterID = _chart.anchorName() + pbi.constants.CHART_ELEMENT_DROP_SHADOW_FILTER_ID_FRAGMENT + nameID;
		shadowBuilderOpts.filterID = filterID;

		_chart.addShadowFilter(filterID, shadowBuilderOpts);

		if (Object.getPrototypeOf(elementSelectors) == String.prototype) {
			elementSelectors = [elementSelectors];
		}

		var elementDropShadowRenderlet = function () {
			elementSelectors.forEach(function (selector) {
				_chart.selectAll(selector).style("filter", "url(#" + filterID + ")");
			});
		};

		_chart.renderlet(elementDropShadowRenderlet);

		return _chart;

	}

	return _chart;
})

dc.override(dc, "dataCount", function (parent, chartGroup) {
	_chart = dc._dataCount(parent, chartGroup);

	// Prevent chart reset button from rendering on non-dimensional chart.
	_chart.renderChartResetButton(false);

	// Prevent download image button from rendering on non-SVG chart.
	_chart.renderChartDownloadImageButton(false);

	return _chart;
})

}(dc, d3, crossfilter, jQuery));







pbi.chart = pbi.chart || {};

// Enhance row chart.
(function(pbi, dc, d3, crossfilter, undefined) {

	pbi.chart.rowChart = function (parent, chartGroup) {
		_chart = dc.rowChart(parent, chartGroup);

		var _centerRowLabelsVerticallyOn = true;
		var _centerRowLabelsVerticallyTransitionDuration = 500;


		// Accessors.


		/**
		#### .centerRowLabelsVerticallyOn(boolean)
		Turn on/off vertical label centering within rows.

		**/
		_chart.centerRowLabelsVerticallyOn = function (_) {
			if (!arguments.length) return _centerRowLabelsVerticallyOn;
			_centerRowLabelsVerticallyOn = _;
			return _chart;
		};

		/**
		#### .centerRowLabelsVertically([centerRowLabelsVerticallyFunction])
		Set or get the vertical label centering function.

		**/
		_chart.centerRowLabelsVertically = function (_) {
			if (!arguments.length) return _centerRowLabelsVertically;
			_centerRowLabelsVertically = _;
			_centerRowLabelsVerticallyOn = true;
			return _chart;
		};
		/**
		#### .centerRowLabelsVerticallyTransitionDuration(time)
		Set or get the transition duration for centerRowLabelsVertically function.

		**/
		_chart.centerRowLabelsVerticallyTransitionDuration = function (_) {
			if (!arguments.length) return _centerRowLabelsVerticallyTransitionDuration;
			_centerRowLabelsVerticallyTransitionDuration = _;
			return _chart;
		};



		// Rendering.

		function _centerRowLabelsVertically () {
			_chart.selectAll("g.row text").each(function () {
				var parentG = this.parentNode;
				var siblingRect = parentG.getElementsByTagName("rect")[0];
				var rectHeight = siblingRect.getBoundingClientRect().height;
				var y = rectHeight / 2 + 4;
				_chart.labelOffsetY(y);
				d3.select(this).transition()
					.duration(_centerRowLabelsVerticallyTransitionDuration)
					.attr("y", y)
			})
		}

		function _centerRowLabelsVerticallyRenderlet () {
			if (_centerRowLabelsVerticallyOn) {
				_centerRowLabelsVertically();
			}
		}

		_chart.renderlet(_centerRowLabelsVerticallyRenderlet);

		return _chart;
	}


	// Create enhanced data count chart.
	pbi.chart.dimensionDataCount = function(parent, chartGroup) {
		var _formatNumber = d3.format(",d");
		var _chart = dc.baseChart({});

		// Add chart type class.
		d3.select(parent).classed(pbi.constants.chartTypeClass.DIMENSION_DATA_COUNT, true);

		// Prevent chart reset button from rendering on non-dimensional chart.
		_chart.renderChartResetButton(false);

		// Prevent download image button from rendering on non-SVG chart.
		_chart.renderChartDownloadImageButton(false);

		_chart.doRender = function() {
			_chart.selectAll(".total-count").text(_formatNumber(_chart.dimension().size()));
			_chart.selectAll(".filter-count").text(_formatNumber(_chart.valueAccessor()(_chart.group().value())));

			return _chart;
		};

		_chart.doRedraw = function(){
			return _chart.doRender();
		};

		return _chart.anchor(parent, chartGroup);
	};

}(window.pbi = window.pbi || {}, dc, d3, crossfilter));

// Enhance d3 color class.

d3.hsl.prototype.saturate = function (k) {
	k = Math.pow(.7, arguments.length ? k : 1);
	return new d3.hsl(this.h, this.s / k, this.l);
};

d3.hsl.prototype.desaturate = function (k) {
	k = Math.pow(.7, arguments.length ? k : 1);
	return new d3.hsl(this.h, k * this.s, this.l);
};

