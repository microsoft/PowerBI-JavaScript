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

	"use strict";
	var core_1 = __webpack_require__(1);
	/**
	 * Make PowerBi available on global object for use in apps without module loading support.
	 * Save class to allow creating an instance of the service.
	 * Create instance of class with default config for normal usage.
	 */
	window.Powerbi = core_1.default;
	window.powerbi = new core_1.default();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var report_1 = __webpack_require__(2);
	var tile_1 = __webpack_require__(5);
	var util_1 = __webpack_require__(4);
	var PowerBi = (function () {
	    function PowerBi(config) {
	        if (config === void 0) { config = {}; }
	        this.embeds = [];
	        window.addEventListener('message', this.onReceiveMessage.bind(this), false);
	        // TODO: Change when Object.assign is available.
	        this.config = util_1.default.assign({}, PowerBi.defaultConfig, config);
	        if (this.config.autoEmbedOnContentLoaded) {
	            this.enableAutoEmbed();
	        }
	    }
	    /**
	     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed' attribute
	     * and automatically attempts to embed a powerbi component based on information from the attributes.
	     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
	     */
	    PowerBi.prototype.init = function (container) {
	        var _this = this;
	        container = (container && container instanceof HTMLElement) ? container : document.body;
	        var elements = Array.prototype.slice.call(container.querySelectorAll('[powerbi-embed]'));
	        elements.forEach(function (element) { return _this.embed(element); });
	    };
	    /**
	     * Given an html element embed component based on configuration.
	     * If component has already been created and attached to eleemnt simply return it to prevent creating duplicate components for same element.
	     */
	    PowerBi.prototype.embed = function (element, config) {
	        var _this = this;
	        if (config === void 0) { config = {}; }
	        var instance;
	        var powerBiElement = element;
	        if (powerBiElement.powerBiEmbed && !config.overwrite) {
	            instance = powerBiElement.powerBiEmbed;
	            return instance;
	        }
	        /** If component is already registered on this element, but we are supposed to overwrite, remove existing component from registry */
	        if (powerBiElement.powerBiEmbed && config.overwrite) {
	            this.remove(powerBiElement.powerBiEmbed);
	        }
	        var Component = util_1.default.find(function (component) { return config.type === component.type || element.getAttribute('powerbi-type') === component.type; }, PowerBi.components);
	        if (!Component) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + ", but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as 'powerbi-type=\"report\"'.");
	        }
	        // TODO: Consider removing in favor of passing reference to `this` in constructor
	        // The getGlobalAccessToken function is only here so that the components (Tile | Report) can get the global access token without needing reference
	        // to the service that they are registered within becaues it creates circular dependencies
	        config.getGlobalAccessToken = function () { return _this.accessToken; };
	        instance = new Component(element, config);
	        powerBiElement.powerBiEmbed = instance;
	        this.embeds.push(instance);
	        return instance;
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
	     * Remove component from the list of embedded components.
	     */
	    PowerBi.prototype.remove = function (component) {
	        util_1.default.remove(function (x) { return x === component; }, this.embeds);
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
	            var embed = util_1.default.find(function (embed) { return event.source === embed.iframe.contentWindow; }, this.embeds);
	            if (embed) {
	                var messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
	                util_1.default.raiseCustomEvent(embed.element, PowerBi.eventMap[messageData.event], messageData);
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
	        tile_1.default,
	        report_1.default
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PowerBi;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed_1 = __webpack_require__(3);
	var Report = (function (_super) {
	    __extends(Report, _super);
	    function Report(element, options) {
	        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
	        options.loadAction = 'loadReport';
	        _super.call(this, element, options);
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
	    Report.type = 'report';
	    return Report;
	}(embed_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Report;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util_1 = __webpack_require__(4);
	var Embed = (function () {
	    function Embed(element, options) {
	        this.element = element;
	        // TODO: Change when Object.assign is available.
	        this.options = util_1.default.assign({}, Embed.defaultOptions, options);
	        var embedUrl = this.getEmbedUrl();
	        var iframeHtml = "<iframe style=\"width:100%;height:100%;\" src=\"" + embedUrl + "\" scrolling=\"no\" allowfullscreen=\"true\"></iframe>";
	        this.element.innerHTML = iframeHtml;
	        this.iframe = this.element.childNodes[0];
	        this.iframe.addEventListener('load', this.load.bind(this), false);
	    }
	    /**
	     * Handler for when the iframe has finished loading the powerbi placeholder page.
	     * This is used to inject configuration options such as access token, loadAction, etc
	     * which allow iframe to load the actual report with authentication.
	     */
	    Embed.prototype.load = function () {
	        var computedStyle = window.getComputedStyle(this.element);
	        var accessToken = this.getAccessToken();
	        var initEventArgs = {
	            message: {
	                action: this.options.loadAction,
	                accessToken: accessToken,
	                width: computedStyle.width,
	                height: computedStyle.height
	            }
	        };
	        util_1.default.raiseCustomEvent(this.element, 'embed-init', initEventArgs);
	        this.iframe.contentWindow.postMessage(JSON.stringify(initEventArgs.message), '*');
	    };
	    /**
	     * Get access token from first available location: options, attribute, global.
	     */
	    Embed.prototype.getAccessToken = function () {
	        var accessToken = this.options.accessToken || this.element.getAttribute('powerbi-access-token') || this.options.getGlobalAccessToken();
	        if (!accessToken) {
	            throw new Error("No access token was found for element. You must specify an access token directly on the element using attribute 'powerbi-access-token' or specify a global token at: powerbi.accessToken.");
	        }
	        return accessToken;
	    };
	    /**
	     * Get embed url from first available location: options, attribute.
	     */
	    Embed.prototype.getEmbedUrl = function () {
	        var embedUrl = this.options.embedUrl || this.element.getAttribute('powerbi-embed');
	        if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
	            throw new Error("Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute 'powerbi-embed'.");
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
	    /**
	     * Default options for embeddable component.
	     */
	    Embed.defaultOptions = {
	        filterPaneEnabled: true,
	        overwrite: true
	    };
	    return Embed;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Embed;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var Utils = (function () {
	    function Utils() {
	    }
	    Utils.raiseCustomEvent = function (element, eventName, eventData) {
	        var customEvent;
	        if (typeof window.CustomEvent === 'function') {
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
	        var inlineEventAttr = 'on' + eventName.replace('-', '');
	        var inlineScript = element.getAttribute(inlineEventAttr);
	        if (inlineScript) {
	            eval.call(element, inlineScript);
	        }
	    };
	    Utils.findIndex = function (predicate, xs) {
	        if (!Array.isArray(xs)) {
	            throw new Error("You attempted to call find with second that was not an array. You passed: " + xs);
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Utils;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed_1 = __webpack_require__(3);
	var Tile = (function (_super) {
	    __extends(Tile, _super);
	    function Tile(element, options) {
	        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
	        options.loadAction = 'loadTile';
	        _super.call(this, element, options);
	    }
	    Tile.prototype.getEmbedUrl = function () {
	        var embedUrl = _super.prototype.getEmbedUrl.call(this);
	        return embedUrl;
	    };
	    Tile.type = 'tile';
	    return Tile;
	}(embed_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Tile;


/***/ }
/******/ ]);
//# sourceMappingURL=powerbi.js.map