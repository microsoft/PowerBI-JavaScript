/*! powerbi-client v1.1.0 | (c) 2016 Microsoft Corporation MIT */
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
	/**
	 * Make PowerBi available on global object for use in apps without module loading support.
	 * Save class to allow creating an instance of the service.
	 * Create instance of class with default config for normal usage.
	 */
	window.Powerbi = core_1.PowerBi;
	window.powerbi = new core_1.PowerBi();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var embed_1 = __webpack_require__(2);
	var report_1 = __webpack_require__(4);
	var tile_1 = __webpack_require__(5);
	var util_1 = __webpack_require__(3);
	var PowerBi = (function () {
	    function PowerBi(config) {
	        if (config === void 0) { config = {}; }
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
	        var elements = Array.prototype.slice.call(container.querySelectorAll("[" + embed_1.Embed.embedUrlAttribute + "]"));
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
	        var componentType = config.type || element.getAttribute(embed_1.Embed.typeAttribute);
	        if (!componentType) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + ", but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '" + embed_1.Embed.typeAttribute + "=\"" + report_1.Report.name.toLowerCase() + "\"'.");
	        }
	        // Save type on configuration so it can be referenced later at known location
	        config.type = componentType;
	        var Component = util_1.Utils.find(function (component) { return componentType === component.name.toLowerCase(); }, PowerBi.components);
	        if (!Component) {
	            throw new Error("Attempted to embed component of type: " + componentType + " but did not find any matching component.  Please verify the type you specified is intended.");
	        }
	        // TODO: Consider removing in favor of passing reference to `this` in constructor
	        // The getGlobalAccessToken function is only here so that the components (Tile | Report) can get the global access token without needing reference
	        // to the service that they are registered within becaues it creates circular dependencies
	        config.getGlobalAccessToken = function () { return _this.accessToken; };
	        var component = new Component(element, config);
	        element.powerBiEmbed = component;
	        this.embeds.push(component);
	        return component;
	    };
	    PowerBi.prototype.embedExisting = function (element, config) {
	        var component = util_1.Utils.find(function (x) { return x.element === element; }, this.embeds);
	        if (!component) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + " which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.");
	        }
	        component.load(config, true);
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
	            var embed = util_1.Utils.find(function (embed) { return event.source === embed.iframe.contentWindow; }, this.embeds);
	            if (embed) {
	                var messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
	                util_1.Utils.raiseCustomEvent(embed.element, PowerBi.eventMap[messageData.event], messageData);
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
	// export default PowerBi; 


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var util_1 = __webpack_require__(3);
	var Embed = (function () {
	    function Embed(element, options) {
	        var _this = this;
	        this.element = element;
	        // TODO: Change when Object.assign is available.
	        this.options = util_1.Utils.assign({}, Embed.defaultOptions, options);
	        this.options.accessToken = this.getAccessToken();
	        this.options.embedUrl = this.getEmbedUrl();
	        var iframeHtml = "<iframe style=\"width:100%;height:100%;\" src=\"" + this.options.embedUrl + "\" scrolling=\"no\" allowfullscreen=\"true\"></iframe>";
	        this.element.innerHTML = iframeHtml;
	        this.iframe = this.element.childNodes[0];
	        this.iframe.addEventListener('load', function () { return _this.load(_this.options, false); }, false);
	    }
	    /**
	     * Handler for when the iframe has finished loading the powerbi placeholder page.
	     * This is used to inject configuration options such as access token, loadAction, etc
	     * which allow iframe to load the actual report with authentication.
	     */
	    Embed.prototype.load = function (options, requireId, message) {
	        if (requireId === void 0) { requireId = false; }
	        if (message === void 0) { message = null; }
	        if (!message) {
	            throw new Error("You called load without providing message properties from the concrete embeddable class.");
	        }
	        var baseMessage = {
	            accessToken: options.accessToken
	        };
	        util_1.Utils.assign(message, baseMessage);
	        var event = {
	            message: message
	        };
	        util_1.Utils.raiseCustomEvent(this.element, event.message.action, event);
	        this.iframe.contentWindow.postMessage(JSON.stringify(event.message), '*');
	    };
	    /**
	     * Get access token from first available location: options, attribute, global.
	     */
	    Embed.prototype.getAccessToken = function () {
	        var accessToken = this.options.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || this.options.getGlobalAccessToken();
	        if (!accessToken) {
	            throw new Error("No access token was found for element. You must specify an access token directly on the element using attribute '" + Embed.accessTokenAttribute + "' or specify a global token at: powerbi.accessToken.");
	        }
	        return accessToken;
	    };
	    /**
	     * Get embed url from first available location: options, attribute.
	     */
	    Embed.prototype.getEmbedUrl = function () {
	        var embedUrl = this.options.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);
	        if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
	            throw new Error("Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '" + Embed.embedUrlAttribute + "'.");
	        }
	        return embedUrl;
	    };
	    /**
	     * Request the browser to make the components iframe fullscreen.
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
	    /**
	     * Default options for embeddable component.
	     */
	    Embed.defaultOptions = {
	        filterPaneEnabled: true
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

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed_1 = __webpack_require__(2);
	var Report = (function (_super) {
	    __extends(Report, _super);
	    function Report() {
	        _super.apply(this, arguments);
	    }
	    Report.prototype.getEmbedUrl = function () {
	        var embedUrl = _super.prototype.getEmbedUrl.call(this);
	        // TODO: Need safe way to add url parameters.
	        // We are assuming embedUrls use query parameters to supply id of visual
	        // so must prefix with '&'.
	        if (!this.options.filterPaneEnabled) {
	            embedUrl += "&filterPaneEnabled=false";
	        }
	        return embedUrl;
	    };
	    Report.prototype.load = function (options, requireId) {
	        if (requireId === void 0) { requireId = false; }
	        if (requireId && typeof options.id !== 'string') {
	            throw new Error("id must be specified when loading reports on existing elements.");
	        }
	        var message = {
	            action: 'loadReport',
	            reportId: options.id,
	            accessToken: null
	        };
	        _super.prototype.load.call(this, options, requireId, message);
	    };
	    Report.name = "Report";
	    return Report;
	}(embed_1.Embed));
	exports.Report = Report;


/***/ },
/* 5 */
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
	    Tile.prototype.getEmbedUrl = function () {
	        var embedUrl = _super.prototype.getEmbedUrl.call(this);
	        return embedUrl;
	    };
	    Tile.prototype.load = function (options, requireId) {
	        if (requireId === void 0) { requireId = false; }
	        if (requireId && typeof options.id !== 'string') {
	            throw new Error("id must be specified when loading reports on existing elements.");
	        }
	        var message = {
	            action: 'loadTile',
	            tileId: options.id,
	            accessToken: null
	        };
	        _super.prototype.load.call(this, options, requireId, message);
	    };
	    Tile.name = "Tile";
	    return Tile;
	}(embed_1.Embed));
	exports.Tile = Tile;


/***/ }
/******/ ]);
//# sourceMappingURL=powerbi.js.map