/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var core_1 = __webpack_require__(1);
	var factories = __webpack_require__(16);
	/**
	 * Make PowerBi available on global object for use in apps without module loading support.
	 * Save class to allow creating an instance of the service.
	 * Create instance of class with default config for normal usage.
	 */
	window.Powerbi = core_1.PowerBi;
	window.powerbi = new core_1.PowerBi(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var embed = __webpack_require__(2);
	var report_1 = __webpack_require__(14);
	var tile_1 = __webpack_require__(15);
	var util_1 = __webpack_require__(3);
	var PowerBi = (function () {
	    function PowerBi(hpmFactory, wpmpFactory, routerFactory, config) {
	        if (config === void 0) { config = {}; }
	        this.hpmFactory = hpmFactory;
	        this.wpmpFactory = wpmpFactory;
	        this.routerFactory = routerFactory;
	        this.embeds = [];
	        window.addEventListener('message', this.onReceiveMessage.bind(this), false);
	        // TODO: Change when Object.assign is available.
	        this.config = util_1.Utils.assign({}, PowerBi.defaultConfig, config);
	        if (this.config.autoEmbedOnContentLoaded) {
	            this.enableAutoEmbed();
	        }
	    }
	    /**
	     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
	     * and automatically attempts to embed a powerbi component based on information from the attributes.
	     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
	     */
	    PowerBi.prototype.init = function (container) {
	        var _this = this;
	        container = (container && container instanceof HTMLElement) ? container : document.body;
	        var elements = Array.prototype.slice.call(container.querySelectorAll("[" + embed.Embed.embedUrlAttribute + "]"));
	        elements.forEach(function (element) { return _this.embed(element); });
	    };
	    /**
	     * Given an html element embed component based on configuration.
	     * If component has already been created and attached to element re-use component instance and existing iframe,
	     * otherwise create a new component instance
	     */
	    PowerBi.prototype.embed = function (element, config) {
	        if (config === void 0) { config = {}; }
	        var component;
	        var powerBiElement = element;
	        if (powerBiElement.powerBiEmbed) {
	            component = this.embedExisting(powerBiElement, config);
	        }
	        else {
	            component = this.embedNew(powerBiElement, config);
	        }
	        return component;
	    };
	    /**
	     * Given an html element embed component base configuration.
	     * Save component instance on element for later lookup.
	     */
	    PowerBi.prototype.embedNew = function (element, config) {
	        var _this = this;
	        var componentType = config.type || element.getAttribute(embed.Embed.typeAttribute);
	        if (!componentType) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + ", but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '" + embed.Embed.typeAttribute + "=\"" + report_1.Report.type.toLowerCase() + "\"'.");
	        }
	        // Save type on configuration so it can be referenced later at known location
	        config.type = componentType;
	        var Component = util_1.Utils.find(function (component) { return componentType === component.type.toLowerCase(); }, PowerBi.components);
	        if (!Component) {
	            throw new Error("Attempted to embed component of type: " + componentType + " but did not find any matching component.  Please verify the type you specified is intended.");
	        }
	        var component = new Component(this.hpmFactory, this.wpmpFactory, this.routerFactory, function () { return _this.accessToken; }, element, config);
	        element.powerBiEmbed = component;
	        this.embeds.push(component);
	        return component;
	    };
	    PowerBi.prototype.embedExisting = function (element, config) {
	        var component = util_1.Utils.find(function (x) { return x.element === element; }, this.embeds);
	        if (!component) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + " which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.");
	        }
	        component.load(config);
	        return component;
	    };
	    /**
	     * Adds event handler for DOMContentLoaded which finds all elements in DOM with attribute powerbi-embed-url
	     * then attempts to initiate the embed process based on data from other powerbi-* attributes.
	     * (This is usually only useful for applications rendered on by the server since all the data needed will be available by the time the handler is called.)
	     */
	    PowerBi.prototype.enableAutoEmbed = function () {
	        var _this = this;
	        window.addEventListener('DOMContentLoaded', function (event) { return _this.init(document.body); }, false);
	    };
	    /**
	     * Returns instance of component associated with element.
	     */
	    PowerBi.prototype.get = function (element) {
	        var powerBiElement = element;
	        if (!powerBiElement.powerBiEmbed) {
	            throw new Error("You attempted to get an instance of powerbi component associated with element: " + element.outerHTML + " but there was no associated instance.");
	        }
	        return powerBiElement.powerBiEmbed;
	    };
	    /**
	     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
	     */
	    PowerBi.prototype.reset = function (element) {
	        var powerBiElement = element;
	        if (!powerBiElement.powerBiEmbed) {
	            return;
	        }
	        /** Remove component from internal list */
	        util_1.Utils.remove(function (x) { return x === powerBiElement.powerBiEmbed; }, this.embeds);
	        /** Delete property from html element */
	        delete powerBiElement.powerBiEmbed;
	        /** Remove iframe from element */
	        var iframe = element.querySelector('iframe');
	        if (iframe) {
	            iframe.remove();
	        }
	    };
	    /**
	     * Handler for window message event.
	     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
	     * to simulate the event bubbling through the two separate windows / DOMs.
	     *
	     * If an error occurs when parsing event.data call error handler provided during configuration.
	     */
	    PowerBi.prototype.onReceiveMessage = function (event) {
	        if (!event) {
	            return;
	        }
	        try {
	            // Only raise the event on the embed that matches the post message origin
	            var embed_1 = util_1.Utils.find(function (embed) { return event.source === embed.iframe.contentWindow; }, this.embeds);
	            if (embed_1) {
	                var messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
	                util_1.Utils.raiseCustomEvent(embed_1.element, PowerBi.eventMap[messageData.event], messageData);
	            }
	        }
	        catch (e) {
	            if (typeof this.config.onError === 'function') {
	                this.config.onError.call(window, e);
	            }
	            else {
	                throw e;
	            }
	        }
	    };
	    /**
	     * List of components this service can embed.
	     */
	    /**
	     * TODO: See if it's possible to remove need for this interface and just use Embed base object as common between Tile and Report
	     * This was only put it to allow both types of components to be in the same list
	     */
	    PowerBi.components = [
	        tile_1.Tile,
	        report_1.Report
	    ];
	    /**
	     * Mapping of event names from iframe postMessage to their name percieved by parent DOM.
	     * Example: User clicks on embeded report which is inside iframe. The iframe code resends
	     * event as postMessage with { event: 'reportClicked', ... } and this name is converted to hyphenated
	     * name and dispatched from the parent element of the iframe to simulate the event bubbling through two
	     * different windows / DOMs
	     */
	    PowerBi.eventMap = {
	        'tileClicked': 'tile-click',
	        'tileLoaded': 'tile-load',
	        'reportPageLoaded': 'report-load'
	    };
	    /**
	     * Default configuration for service.
	     */
	    PowerBi.defaultConfig = {
	        autoEmbedOnContentLoaded: false,
	        onError: function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            return console.log(args[0], args.slice(1));
	        }
	    };
	    return PowerBi;
	}());
	exports.PowerBi = PowerBi;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var util_1 = __webpack_require__(3);
	var protocol = __webpack_require__(4);
	var Embed = (function () {
	    function Embed(hpmFactory, wpmpFactory, routerFactory, getGlobalAccessToken, element, config) {
	        var _this = this;
	        this.element = element;
	        // TODO: Change when Object.assign is available.
	        config.settings = util_1.Utils.assign({}, Embed.defaultSettings, config.settings);
	        this.config = util_1.Utils.assign({}, Embed.defaultDebugOptions, config);
	        this.config.accessToken = this.getAccessToken(getGlobalAccessToken);
	        this.config.embedUrl = this.getEmbedUrl();
	        // TODO: The findIdFromEmbedUrl method is specific to Reports so it should be in the Report class, but it can't be called until
	        // after we have fetched the embedUrl from the attributes
	        /**
	         * This adds backwards compatibility for older config which used the reportId query param to specify report id.
	         * E.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1
	         *
	         * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
	         */
	        var id = Embed.findIdFromEmbedUrl(this.config.embedUrl);
	        if (id) {
	            this.config.id = id;
	        }
	        var iframeHtml = "<iframe style=\"width:100%;height:100%;\" src=\"" + this.config.embedUrl + "\" scrolling=\"no\" allowfullscreen=\"true\"></iframe>";
	        this.element.innerHTML = iframeHtml;
	        this.iframe = this.element.childNodes[0];
	        this.iframe.addEventListener('load', function () { return _this.load(_this.config); }, false);
	        this.wpmp = wpmpFactory(this.iframe.contentWindow, this.config.wpmpName, this.config.logMessages);
	        this.hpm = hpmFactory(this.wpmp);
	        this.router = routerFactory(this.wpmp);
	    }
	    /**
	     * Handler for when the iframe has finished loading the powerbi placeholder page.
	     * This is used to inject configuration data such as id, access token, and settings etc
	     * which allow iframe to load the actual report with authentication.
	     */
	    Embed.prototype.load = function (config) {
	        var errors = protocol.validateLoad(config);
	        if (errors) {
	            throw errors;
	        }
	        return this.hpm.post('/report/load', config)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Get access token from first available location: config, attribute, global.
	     */
	    Embed.prototype.getAccessToken = function (getGlobalAccessToken) {
	        var accessToken = this.config.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || getGlobalAccessToken();
	        if (!accessToken) {
	            throw new Error("No access token was found for element. You must specify an access token directly on the element using attribute '" + Embed.accessTokenAttribute + "' or specify a global token at: powerbi.accessToken.");
	        }
	        return accessToken;
	    };
	    /**
	     * Get embed url from first available location: options, attribute.
	     */
	    Embed.prototype.getEmbedUrl = function () {
	        var embedUrl = this.config.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);
	        if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
	            throw new Error("Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '" + Embed.embedUrlAttribute + "'.");
	        }
	        return embedUrl;
	    };
	    /**
	     * Request the browser to make the component's iframe fullscreen.
	     */
	    Embed.prototype.fullscreen = function () {
	        var requestFullScreen = this.iframe.requestFullscreen || this.iframe.msRequestFullscreen || this.iframe.mozRequestFullScreen || this.iframe.webkitRequestFullscreen;
	        requestFullScreen.call(this.iframe);
	    };
	    /**
	     * Exit fullscreen.
	     */
	    Embed.prototype.exitFullscreen = function () {
	        if (!this.isFullscreen(this.iframe)) {
	            return;
	        }
	        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
	        exitFullscreen.call(document);
	    };
	    Embed.findIdFromEmbedUrl = function (url) {
	        var reportIdRegEx = /reportId="?([^&]+)"?/;
	        var reportIdMatch = url.match(reportIdRegEx);
	        var reportId;
	        if (reportIdMatch) {
	            reportId = reportIdMatch[1];
	        }
	        return reportId;
	    };
	    /**
	     * Return true if iframe is fullscreen,
	     * otherwise return false
	     */
	    Embed.prototype.isFullscreen = function (iframe) {
	        var options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];
	        return options.some(function (option) { return document[option] === iframe; });
	    };
	    Embed.embedUrlAttribute = 'powerbi-embed-url';
	    Embed.accessTokenAttribute = 'powerbi-access-token';
	    Embed.typeAttribute = 'powerbi-type';
	    Embed.defaultSettings = {
	        filterPaneEnabled: true
	    };
	    Embed.defaultDebugOptions = {
	        logMessages: false,
	        wpmpName: 'SdkReportWpmp'
	    };
	    return Embed;
	}());
	exports.Embed = Embed;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Utils = (function () {
	    function Utils() {
	    }
	    Utils.raiseCustomEvent = function (element, eventName, eventData) {
	        var customEvent;
	        if (typeof CustomEvent === 'function') {
	            customEvent = new CustomEvent(eventName, {
	                detail: eventData,
	                bubbles: true,
	                cancelable: true
	            });
	        }
	        else {
	            customEvent = document.createEvent('CustomEvent');
	            customEvent.initCustomEvent(eventName, true, true, eventData);
	        }
	        element.dispatchEvent(customEvent);
	        if (customEvent.defaultPrevented || !customEvent.returnValue) {
	            return;
	        }
	        // TODO: Remove this? Should be better way to handle events than using eval?
	        // What is use case? <div powerbi-type="report" onload="alert('loaded');"></div>
	        var inlineEventAttr = 'on' + eventName.replace('-', '');
	        var inlineScript = element.getAttribute(inlineEventAttr);
	        if (inlineScript) {
	            eval.call(element, inlineScript);
	        }
	    };
	    Utils.findIndex = function (predicate, xs) {
	        if (!Array.isArray(xs)) {
	            throw new Error("You attempted to call find with second parameter that was not an array. You passed: " + xs);
	        }
	        var index;
	        xs.some(function (x, i) {
	            if (predicate(x)) {
	                index = i;
	                return true;
	            }
	        });
	        return index;
	    };
	    Utils.find = function (predicate, xs) {
	        var index = Utils.findIndex(predicate, xs);
	        return xs[index];
	    };
	    Utils.remove = function (predicate, xs) {
	        var index = Utils.findIndex(predicate, xs);
	        xs.splice(index, 1);
	    };
	    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	    // TODO: replace in favor of using polyfill
	    Utils.assign = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        var target = args[0];
	        'use strict';
	        if (target === undefined || target === null) {
	            throw new TypeError('Cannot convert undefined or null to object');
	        }
	        var output = Object(target);
	        for (var index = 1; index < arguments.length; index++) {
	            var source = arguments[index];
	            if (source !== undefined && source !== null) {
	                for (var nextKey in source) {
	                    if (source.hasOwnProperty(nextKey)) {
	                        output[nextKey] = source[nextKey];
	                    }
	                }
	            }
	        }
	        return output;
	    };
	    return Utils;
	}());
	exports.Utils = Utils;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var jsen = __webpack_require__(5);
	function normalizeError(error) {
	    if (!error.message) {
	        error.message = error.path + " is invalid. Not meeting " + error.keyword + " constraint";
	    }
	    delete error.path;
	    delete error.keyword;
	    return error;
	}
	/**
	 * Takes in schema and returns function which can be used to validate the schema with better semantics around exposing errors
	 */
	function validate(schema, options) {
	    return function (x) {
	        var validate = jsen(schema, options);
	        var isValid = validate(x);
	        if (isValid) {
	            return undefined;
	        }
	        else {
	            return validate.errors
	                .map(normalizeError);
	        }
	    };
	}
	exports.validate = validate;
	exports.settingsSchema = {
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "type": "object",
	    "properties": {
	        "filter": {
	            "type": "object"
	        },
	        "filterPaneEnabled": {
	            "type": "boolean",
	            "messages": {
	                "type": "filterPaneEnabled must be a boolean"
	            }
	        },
	        "pageName": {
	            "type": "string",
	            "messages": {
	                "type": "pageName must be a string"
	            }
	        },
	        "pageNavigationEnabled": {
	            "type": "boolean",
	            "messages": {
	                "type": "pageNavigationEnabled must be a boolean"
	            }
	        }
	    }
	};
	exports.validateSettings = validate(exports.settingsSchema);
	exports.loadSchema = {
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "type": "object",
	    "properties": {
	        "accessToken": {
	            "type": "string",
	            "messages": {
	                "type": "accessToken must be a string",
	                "required": "accessToken is required"
	            },
	            "invalidMessage": "accessToken property is invalid"
	        },
	        "id": {
	            "type": "string",
	            "messages": {
	                "type": "id must be a string",
	                "required": "id is required"
	            }
	        },
	        "settings": {
	            "$ref": "#settings"
	        }
	    },
	    "required": [
	        "accessToken",
	        "id"
	    ]
	};
	exports.validateLoad = validate(exports.loadSchema, {
	    schemas: {
	        settings: exports.settingsSchema
	    }
	});
	exports.pageTargetSchema = {
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "type": "object",
	    "properties": {
	        "type": {
	            "type": "string",
	            "enum": [
	                "page"
	            ],
	            "messages": {
	                "type": "type must be a string",
	                "enum": "type must be 'page'",
	                "required": "type is required"
	            }
	        },
	        "name": {
	            "type": "string",
	            "messages": {
	                "type": "name must be a string",
	                "required": "name is required"
	            }
	        }
	    },
	    "required": [
	        "type",
	        "name"
	    ]
	};
	exports.validatePageTarget = validate(exports.pageTargetSchema);
	exports.visualTargetSchema = {
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "type": "object",
	    "properties": {
	        "type": {
	            "type": "string",
	            "enum": [
	                "visual"
	            ],
	            "messages": {
	                "type": "type must be a string",
	                "enum": "type must be 'visual'",
	                "required": "type is required"
	            }
	        },
	        "id": {
	            "type": "string",
	            "messages": {
	                "type": "id must be a string",
	                "required": "id is required"
	            }
	        }
	    },
	    "required": [
	        "type",
	        "id"
	    ]
	};
	exports.validateVisualTarget = validate(exports.visualTargetSchema);
	exports.pageSchema = {
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "type": "object",
	    "properties": {
	        "name": {
	            "type": "string",
	            "messages": {
	                "type": "name must be a string",
	                "required": "name is required"
	            }
	        },
	        "displayName": {
	            "type": "string",
	            "messages": {
	                "type": "displayName must be a string",
	                "required": "displayName is required"
	            }
	        }
	    },
	    "required": [
	        "name",
	        "displayName"
	    ]
	};
	exports.validatePage = validate(exports.pageSchema);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6);

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var PATH_REPLACE_EXPR = /\[.+?\]/g,
	    PATH_PROP_REPLACE_EXPR = /\[?(.*?)?\]/,
	    REGEX_ESCAPE_EXPR = /[\/]/g,
	    VALID_IDENTIFIER_EXPR = /^[a-z_$][0-9a-z]*$/gi,
	    INVALID_SCHEMA = 'jsen: invalid schema object',
	    browser = typeof window === 'object' && !!window.navigator,   // jshint ignore: line
	    nodev0 = typeof process === 'object' && process.version.split('.')[0] === 'v0',
	    func = __webpack_require__(8),
	    equal = __webpack_require__(9),
	    unique = __webpack_require__(10),
	    SchemaResolver = __webpack_require__(11),
	    formats = __webpack_require__(13),
	    types = {},
	    keywords = {};
	
	function inlineRegex(regex) {
	    var str = regex instanceof RegExp ? regex.toString() : new RegExp(regex).toString();
	
	    if (!nodev0) {
	        return str;
	    }
	
	    str = str.substr(1, str.length - 2);
	    str = '/' + str.replace(REGEX_ESCAPE_EXPR, '\\$&') + '/';
	
	    return str;
	}
	
	function appendToPath(path, key) {
	    VALID_IDENTIFIER_EXPR.lastIndex = 0;
	
	    return VALID_IDENTIFIER_EXPR.test(key) ?
	        path + '.' + key :
	        path + '["' + key + '"]';
	}
	
	function type(obj) {
	    var str = Object.prototype.toString.call(obj);
	    return str.substr(8, str.length - 9).toLowerCase();
	}
	
	function isInteger(obj) {
	    return (obj | 0) === obj;   // jshint ignore: line
	}
	
	types['null'] = function (path) {
	    return path + ' === null';
	};
	
	types.boolean = function (path) {
	    return 'typeof ' + path + ' === "boolean"';
	};
	
	types.string = function (path) {
	    return 'typeof ' + path + ' === "string"';
	};
	
	types.number = function (path) {
	    return 'typeof ' + path + ' === "number"';
	};
	
	types.integer = function (path) {
	    return 'typeof ' + path + ' === "number" && !(' + path + ' % 1)';
	};
	
	types.array = function (path) {
	    return path + ' !== undefined && Array.isArray(' + path + ')';
	};
	
	types.object = function (path) {
	    return path + ' !== undefined && typeof ' + path + ' === "object" && ' + path + ' !== null && !Array.isArray(' + path + ')';
	};
	
	types.date = function (path) {
	    return path + ' !== undefined && ' + path + ' instanceof Date';
	};
	
	keywords.type = function (context) {
	    if (!context.schema.type) {
	        return;
	    }
	
	    var specified = Array.isArray(context.schema.type) ? context.schema.type : [context.schema.type],
	        src = specified.map(function mapType(type) {
	            return types[type] ? types[type](context.path) || 'true' : 'true';
	        }).join(' || ');
	
	    if (src) {
	        context.code('if (!(' + src + ')) {');
	
	        context.error('type');
	
	        context.code('}');
	    }
	};
	
	keywords['enum'] = function (context) {
	    var arr = context.schema['enum'],
	        clauses = [],
	        value, enumType, i;
	
	    if (!Array.isArray(arr)) {
	        return;
	    }
	
	    for (i = 0; i < arr.length; i++) {
	        value = arr[i];
	        enumType = typeof value;
	
	        if (value === null || ['boolean', 'number', 'string'].indexOf(enumType) > -1) {
	            // simple equality check for simple data types
	            if (enumType === 'string') {
	                clauses.push(context.path + ' === "' + value + '"');
	            }
	            else {
	                clauses.push(context.path + ' === ' + value);
	            }
	        }
	        else {
	            // deep equality check for complex types or regexes
	            clauses.push('equal(' + context.path + ', ' + JSON.stringify(value) + ')');
	        }
	    }
	
	    context.code('if (!(' + clauses.join(' || ') + ')) {');
	    context.error('enum');
	    context.code('}');
	};
	
	keywords.minimum = function (context) {
	    if (typeof context.schema.minimum === 'number') {
	        context.code('if (' + context.path + ' < ' + context.schema.minimum + ') {');
	        context.error('minimum');
	        context.code('}');
	    }
	};
	
	keywords.exclusiveMinimum = function (context) {
	    if (context.schema.exclusiveMinimum === true && typeof context.schema.minimum === 'number') {
	        context.code('if (' + context.path + ' === ' + context.schema.minimum + ') {');
	        context.error('exclusiveMinimum');
	        context.code('}');
	    }
	};
	
	keywords.maximum = function (context) {
	    if (typeof context.schema.maximum === 'number') {
	        context.code('if (' + context.path + ' > ' + context.schema.maximum + ') {');
	        context.error('maximum');
	        context.code('}');
	    }
	};
	
	keywords.exclusiveMaximum = function (context) {
	    if (context.schema.exclusiveMaximum === true && typeof context.schema.maximum === 'number') {
	        context.code('if (' + context.path + ' === ' + context.schema.maximum + ') {');
	        context.error('exclusiveMaximum');
	        context.code('}');
	    }
	};
	
	keywords.multipleOf = function (context) {
	    if (typeof context.schema.multipleOf === 'number') {
	        var mul = context.schema.multipleOf,
	            decimals = mul.toString().length - mul.toFixed(0).length - 1,
	            pow = decimals > 0 ? Math.pow(10, decimals) : 1,
	            path = context.path;
	
	        if (decimals > 0) {
	            context.code('if (+(Math.round((' + path + ' * ' + pow + ') + "e+" + ' + decimals + ') + "e-" + ' + decimals + ') % ' + (mul * pow) + ' !== 0) {');
	        } else {
	            context.code('if (((' + path + ' * ' + pow + ') % ' + (mul * pow) + ') !== 0) {');
	        }
	
	        context.error('multipleOf');
	        context.code('}');
	    }
	};
	
	keywords.minLength = function (context) {
	    if (isInteger(context.schema.minLength)) {
	        context.code('if (' + context.path + '.length < ' + context.schema.minLength + ') {');
	        context.error('minLength');
	        context.code('}');
	    }
	};
	
	keywords.maxLength = function (context) {
	    if (isInteger(context.schema.maxLength)) {
	        context.code('if (' + context.path + '.length > ' + context.schema.maxLength + ') {');
	        context.error('maxLength');
	        context.code('}');
	    }
	};
	
	keywords.pattern = function (context) {
	    var regex = typeof context.schema.pattern === 'string' ?
	        new RegExp(context.schema.pattern) :
	        context.schema.pattern;
	
	    if (type(regex) === 'regexp') {
	        context.code('if (!(' + inlineRegex(regex) + ').test(' + context.path + ')) {');
	        context.error('pattern');
	        context.code('}');
	    }
	};
	
	keywords.format = function (context) {
	    if (typeof context.schema.format !== 'string' || !formats[context.schema.format]) {
	        return;
	    }
	
	    context.code('if (!(' + formats[context.schema.format] + ').test(' + context.path + ')) {');
	    context.error('format');
	    context.code('}');
	};
	
	keywords.minItems = function (context) {
	    if (isInteger(context.schema.minItems)) {
	        context.code('if (' + context.path + '.length < ' + context.schema.minItems + ') {');
	        context.error('minItems');
	        context.code('}');
	    }
	};
	
	keywords.maxItems = function (context) {
	    if (isInteger(context.schema.maxItems)) {
	        context.code('if (' + context.path + '.length > ' + context.schema.maxItems + ') {');
	        context.error('maxItems');
	        context.code('}');
	    }
	};
	
	keywords.additionalItems = function (context) {
	    if (context.schema.additionalItems === false && Array.isArray(context.schema.items)) {
	        context.code('if (' + context.path + '.length > ' + context.schema.items.length + ') {');
	        context.error('additionalItems');
	        context.code('}');
	    }
	};
	
	keywords.uniqueItems = function (context) {
	    if (context.schema.uniqueItems) {
	        context.code('if (unique(' + context.path + ').length !== ' + context.path + '.length) {');
	        context.error('uniqueItems');
	        context.code('}');
	    }
	};
	
	keywords.items = function (context) {
	    var index = context.declare(0),
	        i = 0;
	
	    if (type(context.schema.items) === 'object') {
	        context.code('for (' + index + '; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');
	
	        context.validate(context.path + '[' + index + ']', context.schema.items, context.noFailFast);
	
	        context.code('}');
	    }
	    else if (Array.isArray(context.schema.items)) {
	        for (; i < context.schema.items.length; i++) {
	            context.code('if (' + context.path + '.length - 1 >= ' + i + ') {');
	
	            context.validate(context.path + '[' + i + ']', context.schema.items[i], context.noFailFast);
	
	            context.code('}');
	        }
	
	        if (type(context.schema.additionalItems) === 'object') {
	            context.code('for (' + index + ' = ' + i + '; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');
	
	            context.validate(context.path + '[' + index + ']', context.schema.additionalItems, context.noFailFast);
	
	            context.code('}');
	        }
	    }
	};
	
	keywords.maxProperties = function (context) {
	    if (isInteger(context.schema.maxProperties)) {
	        context.code('if (Object.keys(' + context.path + ').length > ' + context.schema.maxProperties + ') {');
	        context.error('maxProperties');
	        context.code('}');
	    }
	};
	
	keywords.minProperties = function (context) {
	    if (isInteger(context.schema.minProperties)) {
	        context.code('if (Object.keys(' + context.path + ').length < ' + context.schema.minProperties + ') {');
	        context.error('minProperties');
	        context.code('}');
	    }
	};
	
	keywords.required = function (context) {
	    if (!Array.isArray(context.schema.required)) {
	        return;
	    }
	
	    for (var i = 0; i < context.schema.required.length; i++) {
	        context.code('if (' + appendToPath(context.path, context.schema.required[i]) + ' === undefined) {');
	        context.error('required', context.schema.required[i]);
	        context.code('}');
	    }
	};
	
	keywords.properties = function (context) {
	    if (context.validatedProperties) {
	        // prevent multiple generations of property validation
	        return;
	    }
	
	    var props = context.schema.properties,
	        propKeys = type(props) === 'object' ? Object.keys(props) : [],
	        patProps = context.schema.patternProperties,
	        patterns = type(patProps) === 'object' ? Object.keys(patProps) : [],
	        addProps = context.schema.additionalProperties,
	        addPropsCheck = addProps === false || type(addProps) === 'object',
	        prop, i, nestedPath;
	
	    // do not use this generator if we have patternProperties or additionalProperties
	    // instead, the generator below will be used for all three keywords
	    if (!propKeys.length || patterns.length || addPropsCheck) {
	        return;
	    }
	
	    for (i = 0; i < propKeys.length; i++) {
	        prop = propKeys[i];
	        nestedPath = appendToPath(context.path, prop);
	
	        context.code('if (' + nestedPath + ' !== undefined) {');
	
	        context.validate(nestedPath, props[prop], context.noFailFast);
	
	        context.code('}');
	    }
	
	    context.validatedProperties = true;
	};
	
	keywords.patternProperties = keywords.additionalProperties = function (context) {
	    if (context.validatedProperties) {
	        // prevent multiple generations of this function
	        return;
	    }
	
	    var props = context.schema.properties,
	        propKeys = type(props) === 'object' ? Object.keys(props) : [],
	        patProps = context.schema.patternProperties,
	        patterns = type(patProps) === 'object' ? Object.keys(patProps) : [],
	        addProps = context.schema.additionalProperties,
	        addPropsCheck = addProps === false || type(addProps) === 'object',
	        keys, key, n, found,
	        propKey, pattern, i;
	
	    if (!propKeys.length && !patterns.length && !addPropsCheck) {
	        return;
	    }
	
	    keys = context.declare('[]');
	    key = context.declare('""');
	    n = context.declare(0);
	
	    if (addPropsCheck) {
	        found = context.declare(false);
	    }
	
	    context.code(keys + ' = Object.keys(' + context.path + ')');
	
	    context.code('for (' + n + '; ' + n + ' < ' + keys + '.length; ' + n + '++) {')
	        (key + ' = ' + keys + '[' + n + ']')
	
	        ('if (' + context.path + '[' + key + '] === undefined) {')
	            ('continue')
	        ('}');
	
	    if (addPropsCheck) {
	        context.code(found + ' = false');
	    }
	
	    // validate regular properties
	    for (i = 0; i < propKeys.length; i++) {
	        propKey = propKeys[i];
	
	        context.code((i ? 'else ' : '') + 'if (' + key + ' === "' + propKey + '") {');
	
	        if (addPropsCheck) {
	            context.code(found + ' = true');
	        }
	
	        context.validate(appendToPath(context.path, propKey), props[propKey], context.noFailFast);
	
	        context.code('}');
	    }
	
	    // validate pattern properties
	    for (i = 0; i < patterns.length; i++) {
	        pattern = patterns[i];
	
	        context.code('if ((' + inlineRegex(pattern) + ').test(' + key + ')) {');
	
	        if (addPropsCheck) {
	            context.code(found + ' = true');
	        }
	
	        context.validate(context.path + '[' + key + ']', patProps[pattern], context.noFailFast);
	
	        context.code('}');
	    }
	
	    // validate additional properties
	    if (addPropsCheck) {
	        context.code('if (!' + found + ') {');
	
	        if (addProps === false) {
	            // do not allow additional properties
	            context.error('additionalProperties');
	        }
	        else {
	            // validate additional properties
	            context.validate(context.path + '[' + key + ']', addProps, context.noFailFast);
	        }
	
	        context.code('}');
	    }
	
	    context.code('}');
	
	    context.validatedProperties = true;
	};
	
	keywords.dependencies = function (context) {
	    if (type(context.schema.dependencies) !== 'object') {
	        return;
	    }
	
	    var key, dep, i = 0;
	
	    for (key in context.schema.dependencies) {
	        dep = context.schema.dependencies[key];
	
	        context.code('if (' + appendToPath(context.path, key) + ' !== undefined) {');
	
	        if (type(dep) === 'object') {
	            //schema dependency
	            context.validate(context.path, dep, context.noFailFast);
	        }
	        else {
	            // property dependency
	            for (i; i < dep.length; i++) {
	                context.code('if (' + appendToPath(context.path, dep[i]) + ' === undefined) {');
	                context.error('dependencies', dep[i]);
	                context.code('}');
	            }
	        }
	
	        context.code('}');
	    }
	};
	
	keywords.allOf = function (context) {
	    if (!Array.isArray(context.schema.allOf)) {
	        return;
	    }
	
	    for (var i = 0; i < context.schema.allOf.length; i++) {
	        context.validate(context.path, context.schema.allOf[i], context.noFailFast);
	    }
	};
	
	keywords.anyOf = function (context) {
	    if (!Array.isArray(context.schema.anyOf)) {
	        return;
	    }
	
	    var errCount = context.declare(0),
	        initialCount = context.declare(0),
	        found = context.declare(false),
	        i = 0;
	
	    context.code(initialCount + ' = errors.length');
	
	    for (; i < context.schema.anyOf.length; i++) {
	        context.code('if (!' + found + ') {');
	
	        context.code(errCount + ' = errors.length');
	
	        context.validate(context.path, context.schema.anyOf[i], true);
	
	        context.code(found + ' = errors.length === ' + errCount)
	        ('}');
	    }
	
	    context.code('if (!' + found + ') {');
	
	    context.error('anyOf');
	
	    context.code('} else {')
	        ('errors.length = ' + initialCount)
	    ('}');
	};
	
	keywords.oneOf = function (context) {
	    if (!Array.isArray(context.schema.oneOf)) {
	        return;
	    }
	
	    var matching = context.declare(0),
	        initialCount = context.declare(0),
	        errCount = context.declare(0),
	        i = 0;
	
	    context.code(initialCount + ' = errors.length');
	
	    for (; i < context.schema.oneOf.length; i++) {
	        context.code(errCount + ' = errors.length');
	
	        context.validate(context.path, context.schema.oneOf[i], true);
	
	        context.code('if (errors.length === ' + errCount + ') {')
	            (matching + '++')
	        ('}');
	    }
	
	    context.code('if (' + matching + ' !== 1) {');
	
	    context.error('oneOf');
	
	    context.code('} else {')
	        ('errors.length = ' + initialCount)
	    ('}');
	};
	
	keywords.not = function (context) {
	    if (type(context.schema.not) !== 'object') {
	        return;
	    }
	
	    var errCount = context.declare(0);
	
	    context.code(errCount + ' = errors.length');
	
	    context.validate(context.path, context.schema.not, true);
	
	    context.code('if (errors.length === ' + errCount + ') {');
	
	    context.error('not');
	
	    context.code('} else {')
	        ('errors.length = ' + errCount)
	    ('}');
	};
	
	['minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', 'multipleOf']
	    .forEach(function (keyword) { keywords[keyword].type = 'number'; });
	
	['minLength', 'maxLength', 'pattern', 'format']
	    .forEach(function (keyword) { keywords[keyword].type = 'string'; });
	
	['minItems', 'maxItems', 'additionalItems', 'uniqueItems', 'items']
	    .forEach(function (keyword) { keywords[keyword].type = 'array'; });
	
	['maxProperties', 'minProperties', 'required', 'properties', 'patternProperties', 'additionalProperties', 'dependencies']
	    .forEach(function (keyword) { keywords[keyword].type = 'object'; });
	
	function getGenerators(schema) {
	    var keys = Object.keys(schema),
	        start = [],
	        perType = {},
	        gen, i;
	
	    for (i = 0; i < keys.length; i++) {
	        gen = keywords[keys[i]];
	
	        if (!gen) {
	            continue;
	        }
	
	        if (gen.type) {
	            if (!perType[gen.type]) {
	                perType[gen.type] = [];
	            }
	
	            perType[gen.type].push(gen);
	        }
	        else {
	            start.push(gen);
	        }
	    }
	
	    return start.concat(Object.keys(perType).reduce(function (arr, key) {
	        return arr.concat(perType[key]);
	    }, []));
	}
	
	function replaceIndexedProperty(match) {
	    var index = match.replace(PATH_PROP_REPLACE_EXPR, '$1');
	
	    if (!isNaN(+index)) {
	        // numeric index in array
	        return '.' + index;
	    }
	    else if (index[0] === '"') {
	        // string key for an object property
	        return '[\\"' + index.substr(1, index.length - 2) + '\\"]';
	    }
	
	    // variable containing the actual key
	    return '." + ' + index + ' + "';
	}
	
	function getPathExpression(path) {
	    return '"' + path.replace(PATH_REPLACE_EXPR, replaceIndexedProperty).substr(5) + '"';
	}
	
	function clone(obj) {
	    var cloned = obj,
	        objType = type(obj),
	        key, i;
	
	    if (objType === 'object') {
	        cloned = {};
	
	        for (key in obj) {
	            cloned[key] = clone(obj[key]);
	        }
	    }
	    else if (objType === 'array') {
	        cloned = [];
	
	        for (i = 0; i < obj.length; i++) {
	            cloned[i] = clone(obj[i]);
	        }
	    }
	    else if (objType === 'regexp') {
	        return new RegExp(obj);
	    }
	    else if (objType === 'date') {
	        return new Date(obj.toJSON());
	    }
	
	    return cloned;
	}
	
	function PropertyMarker() {
	    this.objects = [];
	    this.properties = [];
	}
	
	PropertyMarker.prototype.mark = function (obj, key) {
	    var index = this.objects.indexOf(obj),
	        prop;
	
	    if (index < 0) {
	        this.objects.push(obj);
	
	        prop = {};
	        prop[key] = 1;
	
	        this.properties.push(prop);
	
	        return;
	    }
	
	    prop = this.properties[index];
	
	    prop[key] = prop[key] ? prop[key] + 1 : 1;
	};
	
	PropertyMarker.prototype.deleteDuplicates = function () {
	    var key, i;
	
	    for (i = 0; i < this.properties.length; i++) {
	        for (key in this.properties[i]) {
	            if (this.properties[i][key] > 1) {
	                delete this.objects[i][key];
	            }
	        }
	    }
	};
	
	PropertyMarker.prototype.dispose = function () {
	    this.objects.length = 0;
	    this.properties.length = 0;
	};
	
	function build(schema, def, additional, resolver, parentMarker) {
	    var defType, defValue, key, i, propertyMarker;
	
	    if (type(schema) !== 'object') {
	        return def;
	    }
	
	    schema = resolver.resolve(schema);
	
	    if (def === undefined && schema.hasOwnProperty('default')) {
	        def = clone(schema['default']);
	    }
	
	    defType = type(def);
	
	    if (defType === 'object' && type(schema.properties) === 'object') {
	        for (key in schema.properties) {
	            defValue = build(schema.properties[key], def[key], additional, resolver);
	
	            if (defValue !== undefined) {
	                def[key] = defValue;
	            }
	        }
	
	        for (key in def) {
	            if (!(key in schema.properties) &&
	                (schema.additionalProperties === false ||
	                (additional === false && !schema.additionalProperties))) {
	
	                if (parentMarker) {
	                    parentMarker.mark(def, key);
	                }
	                else {
	                    delete def[key];
	                }
	            }
	        }
	    }
	    else if (defType === 'array' && schema.items) {
	        if (type(schema.items) === 'array') {
	            for (i = 0; i < schema.items.length; i++) {
	                defValue = build(schema.items[i], def[i], additional, resolver);
	
	                if (defValue !== undefined || i < def.length) {
	                    def[i] = defValue;
	                }
	            }
	        }
	        else if (def.length) {
	            for (i = 0; i < def.length; i++) {
	                def[i] = build(schema.items, def[i], additional, resolver);
	            }
	        }
	    }
	    else if (type(schema.allOf) === 'array' && schema.allOf.length) {
	        propertyMarker = new PropertyMarker();
	
	        for (i = 0; i < schema.allOf.length; i++) {
	            def = build(schema.allOf[i], def, additional, resolver, propertyMarker);
	        }
	
	        propertyMarker.deleteDuplicates();
	        propertyMarker.dispose();
	    }
	
	    return def;
	}
	
	function jsen(schema, options) {
	    if (type(schema) !== 'object') {
	        throw new Error(INVALID_SCHEMA);
	    }
	
	    options = options || {};
	
	    var missing$Ref = options.missing$Ref || false,
	        resolver = new SchemaResolver(schema, options.schemas, missing$Ref),
	        counter = 0,
	        id = function () { return 'i' + (counter++); },
	        funcache = {},
	        compiled,
	        refs = {
	            errors: []
	        },
	        scope = {
	            equal: equal,
	            unique: unique,
	            refs: refs
	        };
	
	    function cache(schema) {
	        var deref = resolver.resolve(schema),
	            ref = schema.$ref,
	            cached = funcache[ref],
	            func;
	
	        if (!cached) {
	            cached = funcache[ref] = {
	                key: id(),
	                func: function (data) {
	                    return func(data);
	                }
	            };
	
	            func = compile(deref);
	
	            Object.defineProperty(cached.func, 'errors', {
	                get: function () {
	                    return func.errors;
	                }
	            });
	
	            refs[cached.key] = cached.func;
	        }
	
	        return 'refs.' + cached.key;
	    }
	
	    function compile(schema) {
	        function declare(def) {
	            var variname = id();
	
	            code.def(variname, def);
	
	            return variname;
	        }
	
	        function validate(path, schema, noFailFast) {
	            var context,
	                cachedRef,
	                pathExp,
	                index,
	                lastType,
	                format,
	                gens,
	                gen,
	                i;
	
	            function error(keyword, key) {
	                var varid,
	                    errorPath = path,
	                    message = (key && schema.properties && schema.properties[key] && schema.properties[key].requiredMessage) ||
	                        schema.invalidMessage;
	
	                if (!message) {
	                    message = key && schema.properties && schema.properties[key] && schema.properties[key].messages &&
	                        schema.properties[key].messages[keyword] ||
	                        schema.messages && schema.messages[keyword];
	                }
	
	                if (path.indexOf('[') > -1) {
	                    // create error objects dynamically when path contains indexed property expressions
	                    errorPath = getPathExpression(path);
	
	                    if (key) {
	                        errorPath = errorPath ? errorPath + ' + ".' + key + '"' : key;
	                    }
	
	                    code('errors.push({')
	                        ('path: ' +  errorPath + ', ')
	                        ('keyword: "' + keyword + '"' + (message ? ',' : ''));
	
	                    if (message) {
	                        code('message: "' + message + '"');
	                    }
	
	                    code('})');
	                }
	                else {
	                    // generate faster code when no indexed properties in the path
	                    varid = id();
	
	                    errorPath = errorPath.substr(5);
	
	                    if (key) {
	                        errorPath = errorPath ? errorPath + '.' + key : key;
	                    }
	
	                    refs[varid] = {
	                        path: errorPath,
	                        keyword: keyword
	                    };
	
	                    if (message) {
	                        refs[varid].message = message;
	                    }
	
	                    code('errors.push(refs.' + varid + ')');
	                }
	
	                if (!noFailFast && !options.greedy) {
	                    code('return (validate.errors = errors) && false');
	                }
	            }
	
	            if (schema.$ref !== undefined) {
	                cachedRef = cache(schema);
	                pathExp = getPathExpression(path);
	                index = declare(0);
	
	                code('if (!' + cachedRef + '(' + path + ')) {')
	                    ('if (' + cachedRef + '.errors) {')
	                        ('errors.push.apply(errors, ' + cachedRef + '.errors)')
	                        ('for (' + index + ' = 0; ' + index + ' < ' + cachedRef + '.errors.length; ' + index + '++) {')
	                            ('if (' + cachedRef + '.errors[' + index + '].path) {')
	                                ('errors[errors.length - ' + cachedRef + '.errors.length + ' + index + '].path = ' + pathExp +
	                                    ' + "." + ' + cachedRef + '.errors[' + index + '].path')
	                            ('} else {')
	                                ('errors[errors.length - ' + cachedRef + '.errors.length + ' + index + '].path = ' + pathExp)
	                            ('}')
	                        ('}')
	                    ('}')
	                ('}');
	
	                return;
	            }
	
	            context = {
	                path: path,
	                schema: schema,
	                code: code,
	                declare: declare,
	                validate: validate,
	                error: error,
	                noFailFast: noFailFast
	            };
	
	            gens = getGenerators(schema);
	
	            for (i = 0; i < gens.length; i++) {
	                gen = gens[i];
	
	                if (gen.type && lastType !== gen.type) {
	                    if (lastType) {
	                        code('}');
	                    }
	
	                    lastType = gen.type;
	
	                    code('if (' + types[gen.type](path) + ') {');
	                }
	
	                gen(context);
	            }
	
	            if (lastType) {
	                code('}');
	            }
	
	            if (schema.format && options.formats) {
	                format = options.formats[schema.format];
	
	                if (format) {
	                    if (typeof format === 'string' || format instanceof RegExp) {
	                        code('if (!(' + inlineRegex(format) + ').test(' + context.path + ')) {');
	                        error('format');
	                        code('}');
	                    }
	                    else if (typeof format === 'function') {
	                        (scope.formats || (scope.formats = {}))[schema.format] = format;
	                        (scope.schemas || (scope.schemas = {}))[schema.format] = schema;
	
	                        code('if (!formats["' + schema.format + '"](' + context.path + ', schemas["' + schema.format + '"])) {');
	                        error('format');
	                        code('}');
	                    }
	                }
	            }
	        }
	
	        var code = func('validate', 'data')
	            ('var errors = []');
	
	        validate('data', schema);
	
	        code('return (validate.errors = errors) && errors.length === 0');
	
	        compiled = code.compile(scope);
	
	        compiled.errors = [];
	
	        compiled.build = function (initial, options) {
	            return build(
	                schema,
	                (options && options.copy === false ? initial : clone(initial)),
	                options && options.additionalProperties,
	                resolver);
	        };
	
	        return compiled;
	    }
	
	    return compile(schema);
	}
	
	jsen.browser = browser;
	jsen.clone = clone;
	jsen.equal = equal;
	jsen.unique = unique;
	jsen.resolve = SchemaResolver.resolvePointer;
	
	module.exports = jsen;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function func() {
	    var name = arguments[0] || '',
	        args = [].join.call([].slice.call(arguments, 1), ', '),
	        lines = '',
	        vars = '',
	        ind = 1,
	        tab = '  ',
	        bs = '{[',  // block start
	        be = '}]',  // block end
	        space = function () {
	            return new Array(ind + 1).join(tab);
	        },
	        push = function (line) {
	            lines += space() + line + '\n';
	        },
	        builder = function (line) {
	            var first = line[0],
	                last = line[line.length - 1];
	
	            if (be.indexOf(first) > -1 && bs.indexOf(last) > -1) {
	                ind--;
	                push(line);
	                ind++;
	            }
	            else if (bs.indexOf(last) > -1) {
	                push(line);
	                ind++;
	            }
	            else if (be.indexOf(first) > -1) {
	                ind--;
	                push(line);
	            }
	            else {
	                push(line);
	            }
	
	            return builder;
	        };
	
	    builder.def = function (id, def) {
	        vars += space() + 'var ' + id + (def !== undefined ? ' = ' + def : '') + '\n';
	
	        return builder;
	    };
	
	    builder.toSource = function () {
	        return 'function ' + name + '(' + args + ') {\n' + vars + '\n' + lines + '\n}';
	    };
	
	    builder.compile = function (scope) {
	        var src = 'return (' + builder.toSource() + ')',
	            scp = scope || {},
	            keys = Object.keys(scp),
	            vals = keys.map(function (key) { return scp[key]; });
	
	        return Function.apply(null, keys.concat(src)).apply(null, vals);
	    };
	
	    return builder;
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	function type(obj) {
	    var str = Object.prototype.toString.call(obj);
	    return str.substr(8, str.length - 9).toLowerCase();
	}
	
	function deepEqual(a, b) {
	    var keysA = Object.keys(a).sort(),
	        keysB = Object.keys(b).sort(),
	        i, key;
	
	    if (!equal(keysA, keysB)) {
	        return false;
	    }
	
	    for (i = 0; i < keysA.length; i++) {
	        key = keysA[i];
	
	        if (!equal(a[key], b[key])) {
	            return false;
	        }
	    }
	
	    return true;
	}
	
	function equal(a, b) {  // jshint ignore: line
	    var typeA = typeof a,
	        typeB = typeof b,
	        i;
	
	    // get detailed object type
	    if (typeA === 'object') {
	        typeA = type(a);
	    }
	
	    // get detailed object type
	    if (typeB === 'object') {
	        typeB = type(b);
	    }
	
	    if (typeA !== typeB) {
	        return false;
	    }
	
	    if (typeA === 'object') {
	        return deepEqual(a, b);
	    }
	
	    if (typeA === 'regexp') {
	        return a.toString() === b.toString();
	    }
	
	    if (typeA === 'array') {
	        if (a.length !== b.length) {
	            return false;
	        }
	
	        for (i = 0; i < a.length; i++) {
	            if (!equal(a[i], b[i])) {
	                return false;
	            }
	        }
	
	        return true;
	    }
	
	    return a === b;
	}
	
	module.exports = equal;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var equal = __webpack_require__(9);
	
	function findIndex(arr, value, comparator) {
	    for (var i = 0, len = arr.length; i < len; i++) {
	        if (comparator(arr[i], value)) {
	            return i;
	        }
	    }
	
	    return -1;
	}
	
	module.exports = function unique(arr) {
	    return arr.filter(function uniqueOnly(value, index, self) {
	        return findIndex(self, value, equal) === index;
	    });
	};
	
	module.exports.findIndex = findIndex;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var metaschema = __webpack_require__(12),
	    INVALID_SCHEMA_REFERENCE = 'jsen: invalid schema reference';
	
	function get(obj, path) {
	    if (!path.length) {
	        return obj;
	    }
	
	    var key = path.shift(),
	        val;
	
	    if (obj && typeof obj === 'object' && obj.hasOwnProperty(key)) {
	        val = obj[key];
	    }
	
	    if (path.length) {
	        if (val && typeof val === 'object') {
	            return get(val, path);
	        }
	
	        return undefined;
	    }
	
	    return val;
	}
	
	function refToPath(ref) {
	    var index = ref.indexOf('#'),
	        path;
	
	    if (index !== 0) {
	        return [ref];
	    }
	
	    ref = ref.substr(index + 1);
	
	    if (!ref) {
	        return [];
	    }
	
	    path = ref.split('/').map(function (segment) {
	        // Reference: http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-08#section-3
	        return decodeURIComponent(segment)
	            .replace(/~1/g, '/')
	            .replace(/~0/g, '~');
	    });
	
	    if (ref[0] === '/') {
	        path.shift();
	    }
	
	    return path;
	}
	
	function refFromId(obj, ref) {
	    if (obj && typeof obj === 'object') {
	        if (obj.id === ref) {
	            return obj;
	        }
	
	        return Object.keys(obj).reduce(function (resolved, key) {
	            return resolved || refFromId(obj[key], ref);
	        }, undefined);
	    }
	
	    return undefined;
	}
	
	function getResolvers(schemas) {
	    var keys = Object.keys(schemas),
	        resolvers = {},
	        key, i;
	
	    for (i = 0; i < keys.length; i++) {
	        key = keys[i];
	        resolvers[key] = new SchemaResolver(schemas[key]);
	    }
	
	    return resolvers;
	}
	
	function SchemaResolver(rootSchema, external, missing$Ref) {  // jshint ignore: line
	    this.rootSchema = rootSchema;
	    this.resolvedRootSchema = null;
	    this.cache = {};
	    this.missing$Ref = missing$Ref;
	
	    this.resolvers = external && typeof external === 'object' ?
	        getResolvers(external) :
	        null;
	}
	
	SchemaResolver.prototype.resolveRef = function (ref) {
	    var err = new Error(INVALID_SCHEMA_REFERENCE + ' ' + ref),
	        root = this.rootSchema,
	        resolvedRoot = this.resolvedRootSchema,
	        externalResolver,
	        path,
	        dest;
	
	    if (!ref || typeof ref !== 'string') {
	        throw err;
	    }
	
	    if (ref === metaschema.id) {
	        dest = metaschema;
	    }
	
	    if (dest === undefined && resolvedRoot) {
	        dest = refFromId(resolvedRoot, ref);
	    }
	
	    if (dest === undefined) {
	        dest = refFromId(root, ref);
	    }
	
	    if (dest === undefined) {
	        path = refToPath(ref);
	
	        if (resolvedRoot) {
	            dest = get(resolvedRoot, path.slice(0));
	        }
	
	        if (dest === undefined) {
	            dest = get(root, path.slice(0));
	        }
	    }
	
	    if (dest === undefined && path.length && this.resolvers) {
	        externalResolver = get(this.resolvers, path);
	
	        if (externalResolver) {
	            dest = externalResolver.resolve(externalResolver.rootSchema);
	        }
	    }
	
	    if (dest === undefined || typeof dest !== 'object') {
	        if (this.missing$Ref) {
	            dest = {};
	        } else {
	            throw err;
	        }
	    }
	
	    if (this.cache[ref] === dest) {
	        return dest;
	    }
	
	    this.cache[ref] = dest;
	
	    if (dest.$ref !== undefined) {
	        dest = this.cache[ref] = this.resolveRef(dest.$ref);
	    }
	
	    return dest;
	};
	
	SchemaResolver.prototype.resolve = function (schema) {
	    if (!schema || typeof schema !== 'object') {
	        return schema;
	    }
	
	    var ref = schema.$ref,
	        resolved = this.cache[ref];
	
	    if (ref === undefined) {
	        return schema;
	    }
	
	    if (resolved !== undefined) {
	        return resolved;
	    }
	
	    resolved = this.resolveRef(ref);
	
	    if (schema === this.rootSchema && schema !== resolved) {
	        // cache the resolved root schema
	        this.resolvedRootSchema = resolved;
	    }
	
	    return resolved;
	};
	
	SchemaResolver.resolvePointer = function (obj, pointer) {
	    return get(obj, refToPath(pointer));
	};
	
	module.exports = SchemaResolver;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = {
		"id": "http://json-schema.org/draft-04/schema#",
		"$schema": "http://json-schema.org/draft-04/schema#",
		"description": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": {
					"$ref": "#"
				}
			},
			"positiveInteger": {
				"type": "integer",
				"minimum": 0
			},
			"positiveIntegerDefault0": {
				"allOf": [
					{
						"$ref": "#/definitions/positiveInteger"
					},
					{
						"default": 0
					}
				]
			},
			"simpleTypes": {
				"anyOf": [
					{
						"enum": [
							"array",
							"boolean",
							"integer",
							"null",
							"number",
							"object",
							"string",
							"any"
						]
					},
					{
						"type": "string"
					}
				]
			},
			"stringArray": {
				"type": "array",
				"items": {
					"type": "string"
				},
				"minItems": 1,
				"uniqueItems": true
			}
		},
		"type": "object",
		"properties": {
			"id": {
				"type": "string",
				"format": "uri"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"title": {
				"type": "string"
			},
			"description": {
				"type": "string"
			},
			"default": {},
			"multipleOf": {
				"type": "number",
				"minimum": 0,
				"exclusiveMinimum": true
			},
			"maximum": {
				"type": "number"
			},
			"exclusiveMaximum": {
				"type": "boolean",
				"default": false
			},
			"minimum": {
				"type": "number"
			},
			"exclusiveMinimum": {
				"type": "boolean",
				"default": false
			},
			"maxLength": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minLength": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": {
				"anyOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				],
				"default": {}
			},
			"items": {
				"anyOf": [
					{
						"$ref": "#"
					},
					{
						"$ref": "#/definitions/schemaArray"
					}
				],
				"default": {}
			},
			"maxItems": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minItems": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"maxProperties": {
				"$ref": "#/definitions/positiveInteger"
			},
			"minProperties": {
				"$ref": "#/definitions/positiveIntegerDefault0"
			},
			"required": {
				"$ref": "#/definitions/stringArray"
			},
			"additionalProperties": {
				"anyOf": [
					{
						"type": "boolean"
					},
					{
						"$ref": "#"
					}
				],
				"default": {}
			},
			"definitions": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": {
					"$ref": "#"
				},
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": {
					"anyOf": [
						{
							"$ref": "#"
						},
						{
							"$ref": "#/definitions/stringArray"
						}
					]
				}
			},
			"enum": {
				"type": "array",
				"minItems": 1,
				"uniqueItems": true
			},
			"type": {
				"anyOf": [
					{
						"$ref": "#/definitions/simpleTypes"
					},
					{
						"type": "array",
						"items": {
							"$ref": "#/definitions/simpleTypes"
						},
						"minItems": 1,
						"uniqueItems": true
					}
				]
			},
			"allOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"anyOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"oneOf": {
				"$ref": "#/definitions/schemaArray"
			},
			"not": {
				"$ref": "#"
			}
		},
		"dependencies": {
			"exclusiveMaximum": [
				"maximum"
			],
			"exclusiveMinimum": [
				"minimum"
			]
		},
		"default": {}
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';
	
	var formats = {};
	
	// reference: http://dansnetwork.com/javascript-iso8601rfc3339-date-parser/
	formats['date-time'] = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
	// reference: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js#L7
	formats.uri = /^([a-zA-Z][a-zA-Z0-9+-.]*:){0,1}\/\/[^\s]*$/;
	// reference: http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
	//            http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
	formats.email = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	// reference: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	formats.ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	// reference: http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	formats.ipv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|[fF][eE]80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::([fF]{4}(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
	// reference: http://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address#answer-3824105
	formats.hostname = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*$/;
	
	module.exports = formats;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed = __webpack_require__(2);
	var Report = (function (_super) {
	    __extends(Report, _super);
	    function Report() {
	        _super.apply(this, arguments);
	    }
	    /**
	     * Add filter to report
	     * An optional target may be passed to apply the filter to specific page or visual.
	     *
	     * ```javascript
	     * // Add filter to report
	     * const filter = new filters.BasicFilter(...);
	     * report.addFilter(filter);
	     *
	     * // Add advanced filter to specific visual;
	     * const target = ...
	     * const filter = new filters.AdvancedFilter(...);
	     * report.addFilter(filter, target);
	     * ```
	     */
	    Report.prototype.addFilter = function (filter, target) {
	        var targetUrl = this.getTargetUrl(target);
	        return this.hpm.post(targetUrl + "/filters", filter)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Get filters that are applied to the report
	     * An optional target may be passed to get filters applied to a specific page or visual
	     *
	     * ```javascript
	     * // Get filters applied at report level
	     * report.getFilters()
	     *      .then(filters => {
	     *          ...
	     *      });
	     *
	     * // Get filters applied at page level
	     * const pageTarget = {
	     *   type: "page",
	     *   name: "reportSection1"
	     * };
	     *
	     * report.getFilters(pageTarget)
	     *      .then(filters => {
	     *          ...
	     *      });
	     * ```
	     */
	    Report.prototype.getFilters = function (target) {
	        var targetUrl = this.getTargetUrl(target);
	        return this.hpm.get(targetUrl + "/filters")
	            .then(function (response) { return response.body; }, function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Get the list of pages within the report
	     *
	     * ```javascript
	     * report.getPages()
	     *  .then(pages => {
	     *      ...
	     *  });
	     * ```
	     */
	    Report.prototype.getPages = function () {
	        return this.hpm.get('/report/pages')
	            .then(function (response) { return response.body; }, function (response) {
	            throw response.body;
	        });
	    };
	    Report.prototype.on = function (eventName, handler) {
	        if (Report.allowedEvents.indexOf(eventName) === -1) {
	            throw new Error("eventName is must be one of " + Report.allowedEvents + ". You passed: " + eventName);
	        }
	        this.router.post("/report/events/" + eventName, function (res, req) {
	            handler(res.body);
	        });
	    };
	    /**
	     * Set the active page
	     */
	    Report.prototype.setPage = function (pageName) {
	        var page = {
	            name: pageName,
	            displayName: null
	        };
	        return this.hpm.put('/report/pages/active', page)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Remove specific filter from report, page, or visual
	     */
	    Report.prototype.removeFilter = function (filter, target) {
	        var targetUrl = this.getTargetUrl(target);
	        return this.hpm.delete(targetUrl + "/filters", filter)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Remove all filters across the report, pages, and visuals
	     *
	     * ```javascript
	     * report.removeAllFilters();
	     * ```
	     */
	    Report.prototype.removeAllFilters = function () {
	        return this.hpm.delete('/report/allfilters', null)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Update existing filter applied to report, page, or visual.
	     *
	     * The existing filter will be replaced with the new filter.
	     */
	    Report.prototype.updateFilter = function (filter, target) {
	        var targetUrl = this.getTargetUrl(target);
	        return this.hpm.put(targetUrl + "/filters", filter)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Update settings of report (filter pane visibility, page navigation visibility)
	     */
	    Report.prototype.updateSettings = function (settings) {
	        return this.hpm.patch('/report/settings', settings)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Translate target into url
	     * Target may be to the whole report, speific page, or specific visual
	     */
	    Report.prototype.getTargetUrl = function (target) {
	        var targetUrl;
	        /**
	         * TODO: I mentioned this issue in the protocol test, but we're tranlating targets from objects
	         * into parts of the url, and then back to objects. It is a trade off between complixity in this code vs semantic URIs
	         *
	         * We could come up with a different idea which passed the target as part of the body
	         */
	        if (!target) {
	            targetUrl = '/report';
	        }
	        else if (target.type === "page") {
	            targetUrl = "/report/pages/" + target.name;
	        }
	        else if (target.type === "visual") {
	            targetUrl = "/report/visuals/" + target.id;
	        }
	        else {
	            throw new Error("target.type must be either 'page' or 'visual'. You passed: " + target.type);
	        }
	        return targetUrl;
	    };
	    Report.allowedEvents = ["dataSelected", "filterAdded", "filterUpdated", "filterRemoved", "pageChanged", "error"];
	    Report.type = "Report";
	    return Report;
	}(embed.Embed));
	exports.Report = Report;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed_1 = __webpack_require__(2);
	var Tile = (function (_super) {
	    __extends(Tile, _super);
	    function Tile() {
	        _super.apply(this, arguments);
	    }
	    Tile.type = "Tile";
	    return Tile;
	}(embed_1.Embed));
	exports.Tile = Tile;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var wpmp = __webpack_require__(17);
	var hpm = __webpack_require__(21);
	var router = __webpack_require__(25);
	exports.hpmFactory = function (wpmp, sdkVersion, sdkType, origin) {
	    if (sdkVersion === void 0) { sdkVersion = '2.0.0'; }
	    if (sdkType === void 0) { sdkType = 'js'; }
	    if (origin === void 0) { origin = 'sdk'; }
	    return new hpm.HttpPostMessage(wpmp, {
	        'origin': origin,
	        'x-sdk-type': sdkType,
	        'x-sdk-version': sdkVersion
	    });
	};
	exports.wpmpFactory = function (window, name, logMessages) {
	    return new wpmp.WindowPostMessageProxy(window, {
	        processTrackingProperties: {
	            addTrackingProperties: hpm.HttpPostMessage.addTrackingProperties,
	            getTrackingProperties: hpm.HttpPostMessage.getTrackingProperties,
	        },
	        isErrorMessage: hpm.HttpPostMessage.isErrorMessage,
	        name: name,
	        logMessages: logMessages
	    });
	};
	exports.routerFactory = function (wpmp) {
	    return new router.Router(wpmp);
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === 'object' && typeof module.exports === 'object') {
	        var v = factory(__webpack_require__(18), exports); if (v !== undefined) module.exports = v;
	    }
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	})(function (require, exports) {
	    "use strict";
	    var WindowPostMessageProxy = (function () {
	        function WindowPostMessageProxy(contentWindow, options) {
	            var _this = this;
	            if (options === void 0) { options = {
	                processTrackingProperties: {
	                    addTrackingProperties: WindowPostMessageProxy.defaultAddTrackingProperties,
	                    getTrackingProperties: WindowPostMessageProxy.defaultGetTrackingProperties
	                },
	                isErrorMessage: WindowPostMessageProxy.defaultIsErrorMessage,
	                receiveWindow: window,
	                name: WindowPostMessageProxy.createRandomString()
	            }; }
	            this.pendingRequestPromises = {};
	            // save contentWindow
	            this.contentWindow = contentWindow;
	            // save options with defaults
	            this.addTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.addTrackingProperties) || WindowPostMessageProxy.defaultAddTrackingProperties;
	            this.getTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.getTrackingProperties) || WindowPostMessageProxy.defaultGetTrackingProperties;
	            this.isErrorMessage = options.isErrorMessage || WindowPostMessageProxy.defaultIsErrorMessage;
	            this.receiveWindow = options.receiveWindow || window;
	            this.name = options.name || WindowPostMessageProxy.createRandomString();
	            this.logMessages = options.logMessages || false;
	            // Initialize
	            this.handlers = [];
	            this.windowMessageHandler = function (event) { return _this.onMessageReceived(event); };
	            this.start();
	        }
	        // Static
	        WindowPostMessageProxy.defaultAddTrackingProperties = function (message, trackingProperties) {
	            message[WindowPostMessageProxy.messagePropertyName] = trackingProperties;
	            return message;
	        };
	        WindowPostMessageProxy.defaultGetTrackingProperties = function (message) {
	            return message[WindowPostMessageProxy.messagePropertyName];
	        };
	        WindowPostMessageProxy.defaultIsErrorMessage = function (message) {
	            return !!message.error;
	        };
	        /**
	         * Adds handler.
	         * If the first handler whose test method returns true will handle the message and provide a response.
	         */
	        WindowPostMessageProxy.prototype.addHandler = function (handler) {
	            this.handlers.push(handler);
	        };
	        /**
	         * Removes handler.
	         * The reference must match the original object that was provided when adding the handler.
	         */
	        WindowPostMessageProxy.prototype.removeHandler = function (handler) {
	            var handlerIndex = this.handlers.indexOf(handler);
	            if (handlerIndex == -1) {
	                throw new Error("You attempted to remove a handler but no matching handler was found.");
	            }
	            this.handlers.splice(handlerIndex, 1);
	        };
	        /**
	         * Start listening to message events.
	         */
	        WindowPostMessageProxy.prototype.start = function () {
	            this.receiveWindow.addEventListener('message', this.windowMessageHandler);
	        };
	        /**
	         * Stops listening to message events.
	         */
	        WindowPostMessageProxy.prototype.stop = function () {
	            this.receiveWindow.removeEventListener('message', this.windowMessageHandler);
	        };
	        /**
	         * Post message to target window with tracking properties added and save deferred object referenced by tracking id.
	         */
	        WindowPostMessageProxy.prototype.postMessage = function (message) {
	            // Add tracking properties to indicate message came from this proxy
	            var trackingProperties = { id: WindowPostMessageProxy.createRandomString() };
	            this.addTrackingProperties(message, trackingProperties);
	            if (this.logMessages) {
	                console.log(this.name + " Posting message:");
	                console.log(JSON.stringify(message, null, '  '));
	            }
	            this.contentWindow.postMessage(message, "*");
	            var deferred = WindowPostMessageProxy.createDeferred();
	            this.pendingRequestPromises[trackingProperties.id] = deferred;
	            return deferred.promise;
	        };
	        /**
	         * Send response message to target window.
	         * Response messages re-use tracking properties from a previous request message.
	         */
	        WindowPostMessageProxy.prototype.sendResponse = function (message, trackingProperties) {
	            this.addTrackingProperties(message, trackingProperties);
	            if (this.logMessages) {
	                console.log(this.name + " Sending response:");
	                console.log(JSON.stringify(message, null, '  '));
	            }
	            this.contentWindow.postMessage(message, "*");
	        };
	        /**
	         * Message handler.
	         */
	        WindowPostMessageProxy.prototype.onMessageReceived = function (event) {
	            var _this = this;
	            if (this.logMessages) {
	                console.log(this.name + " Received message:");
	                console.log("type: " + event.type);
	                console.log(JSON.stringify(event.data, null, '  '));
	            }
	            var message = event.data;
	            var trackingProperties = this.getTrackingProperties(message);
	            // If this proxy instance could not find tracking properties then disregard message since we can't reliably respond
	            if (!trackingProperties) {
	                return;
	            }
	            var deferred = this.pendingRequestPromises[trackingProperties.id];
	            // If message does not have a known ID, treat it as a request
	            // Otherwise, treat message as response
	            if (!deferred) {
	                var handled = this.handlers.some(function (handler) {
	                    if (handler.test(message)) {
	                        Promise.resolve(handler.handle(message))
	                            .then(function (responseMessage) {
	                            _this.sendResponse(responseMessage, trackingProperties);
	                        });
	                        return true;
	                    }
	                });
	                /**
	                 * TODO: Consider returning an error message if nothing handled the message.
	                 * In the case of the Report receiving messages all of them should be handled,
	                 * however, in the case of the SDK receiving messages it's likely it won't register handlers
	                 * for all events. Perhaps make this an option at construction time.
	                 */
	                if (!handled) {
	                    console.warn("Proxy(" + this.name + ") did not handle message. Handlers: " + this.handlers.length + "  Message: " + JSON.stringify(message, null, '') + ".");
	                }
	            }
	            else {
	                /**
	                 * If error message reject promise,
	                 * Otherwise, resolve promise
	                 */
	                if (this.isErrorMessage(message)) {
	                    deferred.reject(message);
	                }
	                else {
	                    deferred.resolve(message);
	                }
	                // TODO: Move to .finally clause up where promise is created for better maitenance like original proxy code.
	                delete this.pendingRequestPromises[trackingProperties.id];
	            }
	        };
	        /**
	         * Utility to create a deferred object.
	         */
	        // TODO: Look to use RSVP library instead of doing this manually.
	        // From what I searched RSVP would work better because it has .finally and .deferred; however, it doesn't have Typings information. 
	        WindowPostMessageProxy.createDeferred = function () {
	            var deferred = {
	                resolve: null,
	                reject: null,
	                promise: null
	            };
	            var promise = new Promise(function (resolve, reject) {
	                deferred.resolve = resolve;
	                deferred.reject = reject;
	            });
	            deferred.promise = promise;
	            return deferred;
	        };
	        /**
	         * Utility to generate random sequence of characters used as tracking id for promises.
	         */
	        WindowPostMessageProxy.createRandomString = function () {
	            return (Math.random() + 1).toString(36).substring(7);
	        };
	        WindowPostMessageProxy.messagePropertyName = "windowPostMessageProxy";
	        return WindowPostMessageProxy;
	    }());
	    exports.WindowPostMessageProxy = WindowPostMessageProxy;
	});
	//# sourceMappingURL=windowPostMessageProxy.js.map

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./windowPostMessageProxy": 17,
		"./windowPostMessageProxy.d": 19,
		"./windowPostMessageProxy.d.ts": 19,
		"./windowPostMessageProxy.js": 17,
		"./windowPostMessageProxy.js.map": 20
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 18;


/***/ },
/* 19 */
/***/ function(module, exports) {



/***/ },
/* 20 */
/***/ function(module, exports) {



/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === 'object' && typeof module.exports === 'object') {
	        var v = factory(__webpack_require__(22), exports); if (v !== undefined) module.exports = v;
	    }
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	})(function (require, exports) {
	    "use strict";
	    var HttpPostMessage = (function () {
	        function HttpPostMessage(windowPostMessageProxy, defaultHeaders) {
	            if (defaultHeaders === void 0) { defaultHeaders = {}; }
	            this.defaultHeaders = defaultHeaders;
	            this.windowPostMessageProxy = windowPostMessageProxy;
	        }
	        // TODO: I the responsibility of knowing how to configure windowPostMessageProxy should
	        // live in this class, but then we have to have hard dependency for things like ITrackingProperties
	        HttpPostMessage.addTrackingProperties = function (message, trackingProperties) {
	            message.headers = message.headers || {};
	            message.headers.id = trackingProperties.id;
	            return message;
	        };
	        HttpPostMessage.getTrackingProperties = function (message) {
	            return {
	                id: message.headers.id
	            };
	        };
	        HttpPostMessage.isErrorMessage = function (message) {
	            return !(200 <= message.statusCode && message.statusCode < 300);
	        };
	        HttpPostMessage.prototype.get = function (url, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "GET",
	                url: url,
	                headers: headers
	            });
	        };
	        HttpPostMessage.prototype.post = function (url, body, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "POST",
	                url: url,
	                headers: headers,
	                body: body
	            });
	        };
	        HttpPostMessage.prototype.put = function (url, body, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "PUT",
	                url: url,
	                headers: headers,
	                body: body
	            });
	        };
	        HttpPostMessage.prototype.patch = function (url, body, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "PATCH",
	                url: url,
	                headers: headers,
	                body: body
	            });
	        };
	        HttpPostMessage.prototype.delete = function (url, body, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "DELETE",
	                url: url,
	                headers: headers,
	                body: body
	            });
	        };
	        HttpPostMessage.prototype.send = function (request) {
	            this.assign(request.headers, this.defaultHeaders);
	            return this.windowPostMessageProxy.postMessage(request);
	        };
	        /**
	         * Object.assign() polyfill
	         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	         */
	        HttpPostMessage.prototype.assign = function (target) {
	            var sources = [];
	            for (var _i = 1; _i < arguments.length; _i++) {
	                sources[_i - 1] = arguments[_i];
	            }
	            if (target === undefined || target === null) {
	                throw new TypeError('Cannot convert undefined or null to object');
	            }
	            var output = Object(target);
	            sources.forEach(function (source) {
	                if (source !== undefined && source !== null) {
	                    for (var nextKey in source) {
	                        if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
	                            output[nextKey] = source[nextKey];
	                        }
	                    }
	                }
	            });
	            return output;
	        };
	        return HttpPostMessage;
	    }());
	    exports.HttpPostMessage = HttpPostMessage;
	});
	//# sourceMappingURL=httpPostMessage.js.map

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./httpPostMessage": 21,
		"./httpPostMessage.d": 23,
		"./httpPostMessage.d.ts": 23,
		"./httpPostMessage.js": 21,
		"./httpPostMessage.js.map": 24
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 22;


/***/ },
/* 23 */
/***/ function(module, exports) {



/***/ },
/* 24 */
/***/ function(module, exports) {



/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["powerbi-router"] = factory();
		else
			root["powerbi-router"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict";
		var RouteRecognizer = __webpack_require__(1);
		var Router = (function () {
		    function Router(handlers) {
		        this.handlers = handlers;
		        /**
		         * TODO: look at generating the router dynamically based on list of supported http methods
		         * instead of hardcoding the creation of these and the methods.
		         */
		        this.getRouteRecognizer = new RouteRecognizer();
		        this.patchRouteRecognizer = new RouteRecognizer();
		        this.postRouteRecognizer = new RouteRecognizer();
		        this.putRouteRecognizer = new RouteRecognizer();
		        this.deleteRouteRecognizer = new RouteRecognizer();
		    }
		    Router.prototype.get = function (url, handler) {
		        this.registerHandler(this.getRouteRecognizer, "GET", url, handler);
		        return this;
		    };
		    Router.prototype.patch = function (url, handler) {
		        this.registerHandler(this.patchRouteRecognizer, "PATCH", url, handler);
		        return this;
		    };
		    Router.prototype.post = function (url, handler) {
		        this.registerHandler(this.postRouteRecognizer, "POST", url, handler);
		        return this;
		    };
		    Router.prototype.put = function (url, handler) {
		        this.registerHandler(this.putRouteRecognizer, "PUT", url, handler);
		        return this;
		    };
		    Router.prototype.delete = function (url, handler) {
		        this.registerHandler(this.deleteRouteRecognizer, "DELETE", url, handler);
		        return this;
		    };
		    /**
		     * TODO: This method could use some refactoring.  There is conflict of interest between keeping clean separation of test and handle method
		     * Test method only returns boolean indicating if request can be handled, and handle method has opportunity to modify response and return promise of it.
		     * In the case of the router with route-recognizer where handlers are associated with routes, this already guarantees that only one handler is selected and makes the test method feel complicated
		     * Will leave as is an investigate cleaner ways at later time.
		     */
		    Router.prototype.registerHandler = function (routeRecognizer, method, url, handler) {
		        var routeRecognizerHandler = function (request) {
		            var response = new Response();
		            return Promise.resolve(handler(request, response))
		                .then(function (x) { return response; });
		        };
		        routeRecognizer.add([
		            { path: url, handler: routeRecognizerHandler }
		        ]);
		        var internalHandler = {
		            test: function (request) {
		                if (request.method !== method) {
		                    return false;
		                }
		                var matchingRoutes = routeRecognizer.recognize(request.url);
		                if (matchingRoutes === undefined) {
		                    return false;
		                }
		                /**
		                 * Copy parameters from recognized route to the request so they can be used within the handler function
		                 * This isn't ideal because it is side affect which modifies the request instead of strictly testing for true or false
		                 * but I don't see a better place to put this.  If we move it between the call to test and the handle it becomes part of the window post message proxy
		                 * even though it's responsibility is related to routing.
		                 */
		                var route = matchingRoutes[0];
		                request.params = route.params;
		                request.queryParams = matchingRoutes.queryParams;
		                request.handler = route.handler;
		                return true;
		            },
		            handle: function (request) {
		                return request.handler(request);
		            }
		        };
		        this.handlers.addHandler(internalHandler);
		    };
		    return Router;
		}());
		exports.Router = Router;
		var Response = (function () {
		    function Response() {
		        this.statusCode = 200;
		        this.headers = {};
		        this.body = null;
		    }
		    Response.prototype.send = function (statusCode, body) {
		        this.statusCode = statusCode;
		        this.body = body;
		    };
		    return Response;
		}());
		exports.Response = Response;
	
	
	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {
	
		var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {(function() {
		    "use strict";
		    function $$route$recognizer$dsl$$Target(path, matcher, delegate) {
		      this.path = path;
		      this.matcher = matcher;
		      this.delegate = delegate;
		    }
		
		    $$route$recognizer$dsl$$Target.prototype = {
		      to: function(target, callback) {
		        var delegate = this.delegate;
		
		        if (delegate && delegate.willAddRoute) {
		          target = delegate.willAddRoute(this.matcher.target, target);
		        }
		
		        this.matcher.add(this.path, target);
		
		        if (callback) {
		          if (callback.length === 0) { throw new Error("You must have an argument in the function passed to `to`"); }
		          this.matcher.addChild(this.path, target, callback, this.delegate);
		        }
		        return this;
		      }
		    };
		
		    function $$route$recognizer$dsl$$Matcher(target) {
		      this.routes = {};
		      this.children = {};
		      this.target = target;
		    }
		
		    $$route$recognizer$dsl$$Matcher.prototype = {
		      add: function(path, handler) {
		        this.routes[path] = handler;
		      },
		
		      addChild: function(path, target, callback, delegate) {
		        var matcher = new $$route$recognizer$dsl$$Matcher(target);
		        this.children[path] = matcher;
		
		        var match = $$route$recognizer$dsl$$generateMatch(path, matcher, delegate);
		
		        if (delegate && delegate.contextEntered) {
		          delegate.contextEntered(target, match);
		        }
		
		        callback(match);
		      }
		    };
		
		    function $$route$recognizer$dsl$$generateMatch(startingPath, matcher, delegate) {
		      return function(path, nestedCallback) {
		        var fullPath = startingPath + path;
		
		        if (nestedCallback) {
		          nestedCallback($$route$recognizer$dsl$$generateMatch(fullPath, matcher, delegate));
		        } else {
		          return new $$route$recognizer$dsl$$Target(startingPath + path, matcher, delegate);
		        }
		      };
		    }
		
		    function $$route$recognizer$dsl$$addRoute(routeArray, path, handler) {
		      var len = 0;
		      for (var i=0; i<routeArray.length; i++) {
		        len += routeArray[i].path.length;
		      }
		
		      path = path.substr(len);
		      var route = { path: path, handler: handler };
		      routeArray.push(route);
		    }
		
		    function $$route$recognizer$dsl$$eachRoute(baseRoute, matcher, callback, binding) {
		      var routes = matcher.routes;
		
		      for (var path in routes) {
		        if (routes.hasOwnProperty(path)) {
		          var routeArray = baseRoute.slice();
		          $$route$recognizer$dsl$$addRoute(routeArray, path, routes[path]);
		
		          if (matcher.children[path]) {
		            $$route$recognizer$dsl$$eachRoute(routeArray, matcher.children[path], callback, binding);
		          } else {
		            callback.call(binding, routeArray);
		          }
		        }
		      }
		    }
		
		    var $$route$recognizer$dsl$$default = function(callback, addRouteCallback) {
		      var matcher = new $$route$recognizer$dsl$$Matcher();
		
		      callback($$route$recognizer$dsl$$generateMatch("", matcher, this.delegate));
		
		      $$route$recognizer$dsl$$eachRoute([], matcher, function(route) {
		        if (addRouteCallback) { addRouteCallback(this, route); }
		        else { this.add(route); }
		      }, this);
		    };
		
		    var $$route$recognizer$$specials = [
		      '/', '.', '*', '+', '?', '|',
		      '(', ')', '[', ']', '{', '}', '\\'
		    ];
		
		    var $$route$recognizer$$escapeRegex = new RegExp('(\\' + $$route$recognizer$$specials.join('|\\') + ')', 'g');
		
		    function $$route$recognizer$$isArray(test) {
		      return Object.prototype.toString.call(test) === "[object Array]";
		    }
		
		    // A Segment represents a segment in the original route description.
		    // Each Segment type provides an `eachChar` and `regex` method.
		    //
		    // The `eachChar` method invokes the callback with one or more character
		    // specifications. A character specification consumes one or more input
		    // characters.
		    //
		    // The `regex` method returns a regex fragment for the segment. If the
		    // segment is a dynamic of star segment, the regex fragment also includes
		    // a capture.
		    //
		    // A character specification contains:
		    //
		    // * `validChars`: a String with a list of all valid characters, or
		    // * `invalidChars`: a String with a list of all invalid characters
		    // * `repeat`: true if the character specification can repeat
		
		    function $$route$recognizer$$StaticSegment(string) { this.string = string; }
		    $$route$recognizer$$StaticSegment.prototype = {
		      eachChar: function(currentState) {
		        var string = this.string, ch;
		
		        for (var i=0; i<string.length; i++) {
		          ch = string.charAt(i);
		          currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: ch });
		        }
		
		        return currentState;
		      },
		
		      regex: function() {
		        return this.string.replace($$route$recognizer$$escapeRegex, '\\$1');
		      },
		
		      generate: function() {
		        return this.string;
		      }
		    };
		
		    function $$route$recognizer$$DynamicSegment(name) { this.name = name; }
		    $$route$recognizer$$DynamicSegment.prototype = {
		      eachChar: function(currentState) {
		        return currentState.put({ invalidChars: "/", repeat: true, validChars: undefined });
		      },
		
		      regex: function() {
		        return "([^/]+)";
		      },
		
		      generate: function(params) {
		        return params[this.name];
		      }
		    };
		
		    function $$route$recognizer$$StarSegment(name) { this.name = name; }
		    $$route$recognizer$$StarSegment.prototype = {
		      eachChar: function(currentState) {
		        return currentState.put({ invalidChars: "", repeat: true, validChars: undefined });
		      },
		
		      regex: function() {
		        return "(.+)";
		      },
		
		      generate: function(params) {
		        return params[this.name];
		      }
		    };
		
		    function $$route$recognizer$$EpsilonSegment() {}
		    $$route$recognizer$$EpsilonSegment.prototype = {
		      eachChar: function(currentState) {
		        return currentState;
		      },
		      regex: function() { return ""; },
		      generate: function() { return ""; }
		    };
		
		    function $$route$recognizer$$parse(route, names, specificity) {
		      // normalize route as not starting with a "/". Recognition will
		      // also normalize.
		      if (route.charAt(0) === "/") { route = route.substr(1); }
		
		      var segments = route.split("/");
		      var results = new Array(segments.length);
		
		      // A routes has specificity determined by the order that its different segments
		      // appear in. This system mirrors how the magnitude of numbers written as strings
		      // works.
		      // Consider a number written as: "abc". An example would be "200". Any other number written
		      // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
		      // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
		      // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
		      // leading symbol, "1".
		      // The rule is that symbols to the left carry more weight than symbols to the right
		      // when a number is written out as a string. In the above strings, the leading digit
		      // represents how many 100's are in the number, and it carries more weight than the middle
		      // number which represents how many 10's are in the number.
		      // This system of number magnitude works well for route specificity, too. A route written as
		      // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
		      // `x`, irrespective of the other parts.
		      // Because of this similarity, we assign each type of segment a number value written as a
		      // string. We can find the specificity of compound routes by concatenating these strings
		      // together, from left to right. After we have looped through all of the segments,
		      // we convert the string to a number.
		      specificity.val = '';
		
		      for (var i=0; i<segments.length; i++) {
		        var segment = segments[i], match;
		
		        if (match = segment.match(/^:([^\/]+)$/)) {
		          results[i] = new $$route$recognizer$$DynamicSegment(match[1]);
		          names.push(match[1]);
		          specificity.val += '3';
		        } else if (match = segment.match(/^\*([^\/]+)$/)) {
		          results[i] = new $$route$recognizer$$StarSegment(match[1]);
		          specificity.val += '1';
		          names.push(match[1]);
		        } else if(segment === "") {
		          results[i] = new $$route$recognizer$$EpsilonSegment();
		          specificity.val += '2';
		        } else {
		          results[i] = new $$route$recognizer$$StaticSegment(segment);
		          specificity.val += '4';
		        }
		      }
		
		      specificity.val = +specificity.val;
		
		      return results;
		    }
		
		    // A State has a character specification and (`charSpec`) and a list of possible
		    // subsequent states (`nextStates`).
		    //
		    // If a State is an accepting state, it will also have several additional
		    // properties:
		    //
		    // * `regex`: A regular expression that is used to extract parameters from paths
		    //   that reached this accepting state.
		    // * `handlers`: Information on how to convert the list of captures into calls
		    //   to registered handlers with the specified parameters
		    // * `types`: How many static, dynamic or star segments in this route. Used to
		    //   decide which route to use if multiple registered routes match a path.
		    //
		    // Currently, State is implemented naively by looping over `nextStates` and
		    // comparing a character specification against a character. A more efficient
		    // implementation would use a hash of keys pointing at one or more next states.
		
		    function $$route$recognizer$$State(charSpec) {
		      this.charSpec = charSpec;
		      this.nextStates = [];
		      this.charSpecs = {};
		      this.regex = undefined;
		      this.handlers = undefined;
		      this.specificity = undefined;
		    }
		
		    $$route$recognizer$$State.prototype = {
		      get: function(charSpec) {
		        if (this.charSpecs[charSpec.validChars]) {
		          return this.charSpecs[charSpec.validChars];
		        }
		
		        var nextStates = this.nextStates;
		
		        for (var i=0; i<nextStates.length; i++) {
		          var child = nextStates[i];
		
		          var isEqual = child.charSpec.validChars === charSpec.validChars;
		          isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;
		
		          if (isEqual) {
		            this.charSpecs[charSpec.validChars] = child;
		            return child;
		          }
		        }
		      },
		
		      put: function(charSpec) {
		        var state;
		
		        // If the character specification already exists in a child of the current
		        // state, just return that state.
		        if (state = this.get(charSpec)) { return state; }
		
		        // Make a new state for the character spec
		        state = new $$route$recognizer$$State(charSpec);
		
		        // Insert the new state as a child of the current state
		        this.nextStates.push(state);
		
		        // If this character specification repeats, insert the new state as a child
		        // of itself. Note that this will not trigger an infinite loop because each
		        // transition during recognition consumes a character.
		        if (charSpec.repeat) {
		          state.nextStates.push(state);
		        }
		
		        // Return the new state
		        return state;
		      },
		
		      // Find a list of child states matching the next character
		      match: function(ch) {
		        var nextStates = this.nextStates,
		            child, charSpec, chars;
		
		        var returned = [];
		
		        for (var i=0; i<nextStates.length; i++) {
		          child = nextStates[i];
		
		          charSpec = child.charSpec;
		
		          if (typeof (chars = charSpec.validChars) !== 'undefined') {
		            if (chars.indexOf(ch) !== -1) { returned.push(child); }
		          } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
		            if (chars.indexOf(ch) === -1) { returned.push(child); }
		          }
		        }
		
		        return returned;
		      }
		    };
		
		    // Sort the routes by specificity
		    function $$route$recognizer$$sortSolutions(states) {
		      return states.sort(function(a, b) {
		        return b.specificity.val - a.specificity.val;
		      });
		    }
		
		    function $$route$recognizer$$recognizeChar(states, ch) {
		      var nextStates = [];
		
		      for (var i=0, l=states.length; i<l; i++) {
		        var state = states[i];
		
		        nextStates = nextStates.concat(state.match(ch));
		      }
		
		      return nextStates;
		    }
		
		    var $$route$recognizer$$oCreate = Object.create || function(proto) {
		      function F() {}
		      F.prototype = proto;
		      return new F();
		    };
		
		    function $$route$recognizer$$RecognizeResults(queryParams) {
		      this.queryParams = queryParams || {};
		    }
		    $$route$recognizer$$RecognizeResults.prototype = $$route$recognizer$$oCreate({
		      splice: Array.prototype.splice,
		      slice:  Array.prototype.slice,
		      push:   Array.prototype.push,
		      length: 0,
		      queryParams: null
		    });
		
		    function $$route$recognizer$$findHandler(state, path, queryParams) {
		      var handlers = state.handlers, regex = state.regex;
		      var captures = path.match(regex), currentCapture = 1;
		      var result = new $$route$recognizer$$RecognizeResults(queryParams);
		
		      result.length = handlers.length;
		
		      for (var i=0; i<handlers.length; i++) {
		        var handler = handlers[i], names = handler.names, params = {};
		
		        for (var j=0; j<names.length; j++) {
		          params[names[j]] = captures[currentCapture++];
		        }
		
		        result[i] = { handler: handler.handler, params: params, isDynamic: !!names.length };
		      }
		
		      return result;
		    }
		
		    function $$route$recognizer$$decodeQueryParamPart(part) {
		      // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
		      part = part.replace(/\+/gm, '%20');
		      var result;
		      try {
		        result = decodeURIComponent(part);
		      } catch(error) {result = '';}
		      return result;
		    }
		
		    // The main interface
		
		    var $$route$recognizer$$RouteRecognizer = function() {
		      this.rootState = new $$route$recognizer$$State();
		      this.names = {};
		    };
		
		
		    $$route$recognizer$$RouteRecognizer.prototype = {
		      add: function(routes, options) {
		        var currentState = this.rootState, regex = "^",
		            specificity = {},
		            handlers = new Array(routes.length), allSegments = [], name;
		
		        var isEmpty = true;
		
		        for (var i=0; i<routes.length; i++) {
		          var route = routes[i], names = [];
		
		          var segments = $$route$recognizer$$parse(route.path, names, specificity);
		
		          allSegments = allSegments.concat(segments);
		
		          for (var j=0; j<segments.length; j++) {
		            var segment = segments[j];
		
		            if (segment instanceof $$route$recognizer$$EpsilonSegment) { continue; }
		
		            isEmpty = false;
		
		            // Add a "/" for the new segment
		            currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: "/" });
		            regex += "/";
		
		            // Add a representation of the segment to the NFA and regex
		            currentState = segment.eachChar(currentState);
		            regex += segment.regex();
		          }
		          var handler = { handler: route.handler, names: names };
		          handlers[i] = handler;
		        }
		
		        if (isEmpty) {
		          currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: "/" });
		          regex += "/";
		        }
		
		        currentState.handlers = handlers;
		        currentState.regex = new RegExp(regex + "$");
		        currentState.specificity = specificity;
		
		        if (name = options && options.as) {
		          this.names[name] = {
		            segments: allSegments,
		            handlers: handlers
		          };
		        }
		      },
		
		      handlersFor: function(name) {
		        var route = this.names[name];
		
		        if (!route) { throw new Error("There is no route named " + name); }
		
		        var result = new Array(route.handlers.length);
		
		        for (var i=0; i<route.handlers.length; i++) {
		          result[i] = route.handlers[i];
		        }
		
		        return result;
		      },
		
		      hasRoute: function(name) {
		        return !!this.names[name];
		      },
		
		      generate: function(name, params) {
		        var route = this.names[name], output = "";
		        if (!route) { throw new Error("There is no route named " + name); }
		
		        var segments = route.segments;
		
		        for (var i=0; i<segments.length; i++) {
		          var segment = segments[i];
		
		          if (segment instanceof $$route$recognizer$$EpsilonSegment) { continue; }
		
		          output += "/";
		          output += segment.generate(params);
		        }
		
		        if (output.charAt(0) !== '/') { output = '/' + output; }
		
		        if (params && params.queryParams) {
		          output += this.generateQueryString(params.queryParams, route.handlers);
		        }
		
		        return output;
		      },
		
		      generateQueryString: function(params, handlers) {
		        var pairs = [];
		        var keys = [];
		        for(var key in params) {
		          if (params.hasOwnProperty(key)) {
		            keys.push(key);
		          }
		        }
		        keys.sort();
		        for (var i = 0; i < keys.length; i++) {
		          key = keys[i];
		          var value = params[key];
		          if (value == null) {
		            continue;
		          }
		          var pair = encodeURIComponent(key);
		          if ($$route$recognizer$$isArray(value)) {
		            for (var j = 0; j < value.length; j++) {
		              var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
		              pairs.push(arrayPair);
		            }
		          } else {
		            pair += "=" + encodeURIComponent(value);
		            pairs.push(pair);
		          }
		        }
		
		        if (pairs.length === 0) { return ''; }
		
		        return "?" + pairs.join("&");
		      },
		
		      parseQueryString: function(queryString) {
		        var pairs = queryString.split("&"), queryParams = {};
		        for(var i=0; i < pairs.length; i++) {
		          var pair      = pairs[i].split('='),
		              key       = $$route$recognizer$$decodeQueryParamPart(pair[0]),
		              keyLength = key.length,
		              isArray = false,
		              value;
		          if (pair.length === 1) {
		            value = 'true';
		          } else {
		            //Handle arrays
		            if (keyLength > 2 && key.slice(keyLength -2) === '[]') {
		              isArray = true;
		              key = key.slice(0, keyLength - 2);
		              if(!queryParams[key]) {
		                queryParams[key] = [];
		              }
		            }
		            value = pair[1] ? $$route$recognizer$$decodeQueryParamPart(pair[1]) : '';
		          }
		          if (isArray) {
		            queryParams[key].push(value);
		          } else {
		            queryParams[key] = value;
		          }
		        }
		        return queryParams;
		      },
		
		      recognize: function(path) {
		        var states = [ this.rootState ],
		            pathLen, i, l, queryStart, queryParams = {},
		            isSlashDropped = false;
		
		        queryStart = path.indexOf('?');
		        if (queryStart !== -1) {
		          var queryString = path.substr(queryStart + 1, path.length);
		          path = path.substr(0, queryStart);
		          queryParams = this.parseQueryString(queryString);
		        }
		
		        path = decodeURI(path);
		
		        if (path.charAt(0) !== "/") { path = "/" + path; }
		
		        pathLen = path.length;
		        if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
		          path = path.substr(0, pathLen - 1);
		          isSlashDropped = true;
		        }
		
		        for (i=0; i<path.length; i++) {
		          states = $$route$recognizer$$recognizeChar(states, path.charAt(i));
		          if (!states.length) { break; }
		        }
		
		        var solutions = [];
		        for (i=0; i<states.length; i++) {
		          if (states[i].handlers) { solutions.push(states[i]); }
		        }
		
		        states = $$route$recognizer$$sortSolutions(solutions);
		
		        var state = solutions[0];
		
		        if (state && state.handlers) {
		          // if a trailing slash was dropped and a star segment is the last segment
		          // specified, put the trailing slash back
		          if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
		            path = path + "/";
		          }
		          return $$route$recognizer$$findHandler(state, path, queryParams);
		        }
		      }
		    };
		
		    $$route$recognizer$$RouteRecognizer.prototype.map = $$route$recognizer$dsl$$default;
		
		    $$route$recognizer$$RouteRecognizer.VERSION = '0.1.11';
		
		    var $$route$recognizer$$default = $$route$recognizer$$RouteRecognizer;
		
		    /* global define:true module:true window: true */
		    if ("function" === 'function' && __webpack_require__(3)['amd']) {
		      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return $$route$recognizer$$default; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		    } else if (typeof module !== 'undefined' && module['exports']) {
		      module['exports'] = $$route$recognizer$$default;
		    } else if (typeof this !== 'undefined') {
		      this['RouteRecognizer'] = $$route$recognizer$$default;
		    }
		}).call(this);
		
		//# sourceMappingURL=route-recognizer.js.map
		/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))
	
	/***/ },
	/* 2 */
	/***/ function(module, exports) {
	
		module.exports = function(module) {
			if(!module.webpackPolyfill) {
				module.deprecate = function() {};
				module.paths = [];
				// module.parent = undefined by default
				module.children = [];
				module.webpackPolyfill = 1;
			}
			return module;
		}
	
	
	/***/ },
	/* 3 */
	/***/ function(module, exports) {
	
		module.exports = function() { throw new Error("define cannot be used indirect"); };
	
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=router.js.map

/***/ }
/******/ ]);
//# sourceMappingURL=powerbi.js.map