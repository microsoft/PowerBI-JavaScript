/*! powerbi-client v2.0.0 | (c) 2016 Microsoft Corporation MIT */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["powerbi-client"] = factory();
	else
		root["powerbi-client"] = factory();
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

	var service = __webpack_require__(1);
	exports.service = service;
	var factories = __webpack_require__(8);
	exports.factories = factories;
	var models = __webpack_require__(4);
	exports.models = models;
	var report_1 = __webpack_require__(5);
	exports.Report = report_1.Report;
	var tile_1 = __webpack_require__(7);
	exports.Tile = tile_1.Tile;
	var embed_1 = __webpack_require__(2);
	exports.Embed = embed_1.Embed;
	var page_1 = __webpack_require__(6);
	exports.Page = page_1.Page;
	/**
	 * Makes Power BI available to the global object for use in applications that don't have module loading support.
	 *
	 * Note: create an instance of the class with the default configuration for normal usage, or save the class so that you can create an instance of the service.
	 */
	var powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
	window.powerbi = powerbi;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var embed = __webpack_require__(2);
	var report_1 = __webpack_require__(5);
	var tile_1 = __webpack_require__(7);
	var page_1 = __webpack_require__(6);
	var utils = __webpack_require__(3);
	/**
	 * The Power BI Service embed component, which is the entry point to embed all other Power BI components into your application
	 *
	 * @export
	 * @class Service
	 * @implements {IService}
	 */
	var Service = (function () {
	    /**
	     * Creates an instance of a Power BI Service.
	     *
	     * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
	     * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
	     * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
	     * @param {IServiceConfiguration} [config={}]
	     */
	    function Service(hpmFactory, wpmpFactory, routerFactory, config) {
	        var _this = this;
	        if (config === void 0) { config = {}; }
	        this.wpmp = wpmpFactory(config.wpmpName, config.logMessages);
	        this.hpm = hpmFactory(this.wpmp, null, config.version, config.type);
	        this.router = routerFactory(this.wpmp);
	        /**
	         * Adds handler for report events.
	         */
	        this.router.post("/reports/:uniqueId/events/:eventName", function (req, res) {
	            var event = {
	                type: 'report',
	                id: req.params.uniqueId,
	                name: req.params.eventName,
	                value: req.body
	            };
	            _this.handleEvent(event);
	        });
	        this.router.post("/reports/:uniqueId/pages/:pageName/events/:eventName", function (req, res) {
	            var event = {
	                type: 'report',
	                id: req.params.uniqueId,
	                name: req.params.eventName,
	                value: req.body
	            };
	            _this.handleEvent(event);
	        });
	        this.router.post("/reports/:uniqueId/pages/:pageName/visuals/:pageName/events/:eventName", function (req, res) {
	            var event = {
	                type: 'report',
	                id: req.params.uniqueId,
	                name: req.params.eventName,
	                value: req.body
	            };
	            _this.handleEvent(event);
	        });
	        this.embeds = [];
	        // TODO: Change when Object.assign is available.
	        this.config = utils.assign({}, Service.defaultConfig, config);
	        if (this.config.autoEmbedOnContentLoaded) {
	            this.enableAutoEmbed();
	        }
	    }
	    /**
	     * TODO: Add a description here
	     *
	     * @param {HTMLElement} [container]
	     * @param {embed.IEmbedConfiguration} [config=undefined]
	     * @returns {embed.Embed[]}
	     */
	    Service.prototype.init = function (container, config) {
	        var _this = this;
	        if (config === void 0) { config = undefined; }
	        container = (container && container instanceof HTMLElement) ? container : document.body;
	        var elements = Array.prototype.slice.call(container.querySelectorAll("[" + embed.Embed.embedUrlAttribute + "]"));
	        return elements.map(function (element) { return _this.embed(element, config); });
	    };
	    /**
	     * Given a configuration based on an HTML element,
	     * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
	     * otherwise creates a new component instance.
	     *
	     * @param {HTMLElement} element
	     * @param {embed.IEmbedConfiguration} [config={}]
	     * @returns {embed.Embed}
	     */
	    Service.prototype.embed = function (element, config) {
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
	     * Given a configuration based on a Power BI element, saves the component instance that reference the element for later lookup.
	     *
	     * @private
	     * @param {IPowerBiElement} element
	     * @param {embed.IEmbedConfiguration} config
	     * @returns {embed.Embed}
	     */
	    Service.prototype.embedNew = function (element, config) {
	        var componentType = config.type || element.getAttribute(embed.Embed.typeAttribute);
	        if (!componentType) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + ", but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '" + embed.Embed.typeAttribute + "=\"" + report_1.Report.type.toLowerCase() + "\"'.");
	        }
	        // Saves the type as part of the configuration so that it can be referenced later at a known location.
	        config.type = componentType;
	        var Component = utils.find(function (component) { return componentType === component.type.toLowerCase(); }, Service.components);
	        if (!Component) {
	            throw new Error("Attempted to embed component of type: " + componentType + " but did not find any matching component.  Please verify the type you specified is intended.");
	        }
	        var component = new Component(this, element, config);
	        element.powerBiEmbed = component;
	        this.embeds.push(component);
	        return component;
	    };
	    /**
	     * Given an element that already contains an embed component, load with a new configuration.
	     *
	     * @private
	     * @param {IPowerBiElement} element
	     * @param {embed.IEmbedConfiguration} config
	     * @returns {embed.Embed}
	     */
	    Service.prototype.embedExisting = function (element, config) {
	        var component = utils.find(function (x) { return x.element === element; }, this.embeds);
	        if (!component) {
	            throw new Error("Attempted to embed using config " + JSON.stringify(config) + " on element " + element.outerHTML + " which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.");
	        }
	        component.load(config);
	        return component;
	    };
	    /**
	     * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
	     * and automatically attempts to embed a powerbi component based on information from other powerbi-* attributes.
	     *
	     * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
	     * This handler is typically useful only for applications that are rendered on the server so that all required data is available when the handler is called.
	     */
	    Service.prototype.enableAutoEmbed = function () {
	        var _this = this;
	        window.addEventListener('DOMContentLoaded', function (event) { return _this.init(document.body); }, false);
	    };
	    /**
	     * Returns an instance of the component associated with the element.
	     *
	     * @param {HTMLElement} element
	     * @returns {(Report | Tile)}
	     */
	    Service.prototype.get = function (element) {
	        var powerBiElement = element;
	        if (!powerBiElement.powerBiEmbed) {
	            throw new Error("You attempted to get an instance of powerbi component associated with element: " + element.outerHTML + " but there was no associated instance.");
	        }
	        return powerBiElement.powerBiEmbed;
	    };
	    /**
	     * Finds an embed instance by the name or unique ID that is provided.
	     *
	     * @param {string} uniqueId
	     * @returns {(Report | Tile)}
	     */
	    Service.prototype.find = function (uniqueId) {
	        return utils.find(function (x) { return x.config.uniqueId === uniqueId; }, this.embeds);
	    };
	    /**
	     * Given an HTML element that has a component embedded within it, removes the component from the list of embedded components, removes the association between the element and the component, and removes the iframe.
	     *
	     * @param {HTMLElement} element
	     * @returns {void}
	     */
	    Service.prototype.reset = function (element) {
	        var powerBiElement = element;
	        if (!powerBiElement.powerBiEmbed) {
	            return;
	        }
	        /** Removes the component from an internal list of components. */
	        utils.remove(function (x) { return x === powerBiElement.powerBiEmbed; }, this.embeds);
	        /** Deletes a property from the HTML element. */
	        delete powerBiElement.powerBiEmbed;
	        /** Removes the iframe from the element. */
	        var iframe = element.querySelector('iframe');
	        if (iframe) {
	            iframe.remove();
	        }
	    };
	    /**
	     * Given an event object, finds the embed component with the matching type and ID, and invokes its handleEvent method with the event object.
	     *
	     * @private
	     * @param {IEvent<any>} event
	     */
	    Service.prototype.handleEvent = function (event) {
	        var embed = utils.find(function (embed) {
	            return (embed.config.type === event.type
	                && embed.config.uniqueId === event.id);
	        }, this.embeds);
	        if (embed) {
	            var value = event.value;
	            if (event.name === 'pageChanged') {
	                var pageKey = 'newPage';
	                var page = value[pageKey];
	                if (!page) {
	                    throw new Error("Page model not found at 'event.value." + pageKey + "'.");
	                }
	                value[pageKey] = new page_1.Page(embed, page.name, page.displayName);
	            }
	            utils.raiseCustomEvent(embed.element, event.name, value);
	        }
	    };
	    /**
	     * A list of components that this service can embed
	     */
	    Service.components = [
	        tile_1.Tile,
	        report_1.Report
	    ];
	    /**
	     * The default configuration for the service
	     */
	    Service.defaultConfig = {
	        autoEmbedOnContentLoaded: false,
	        onError: function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            return console.log(args[0], args.slice(1));
	        }
	    };
	    return Service;
	}());
	exports.Service = Service;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(3);
	var models = __webpack_require__(4);
	/**
	 * Base class for all Power BI embed components
	 *
	 * @export
	 * @abstract
	 * @class Embed
	 */
	var Embed = (function () {
	    /**
	     * Creates an instance of Embed.
	     *
	     * Note: there is circular reference between embeds and the service, because
	     * the service has a list of all embeds on the host page, and each embed has a reference to the service that created it.
	     *
	     * @param {service.Service} service
	     * @param {HTMLElement} element
	     * @param {IEmbedConfiguration} config
	     */
	    function Embed(service, element, config) {
	        var _this = this;
	        this.allowedEvents = [];
	        Array.prototype.push.apply(this.allowedEvents, Embed.allowedEvents);
	        this.eventHandlers = [];
	        this.service = service;
	        this.element = element;
	        // TODO: Change when Object.assign is available.
	        var settings = utils.assign({}, Embed.defaultSettings, config.settings);
	        this.config = utils.assign({ settings: settings }, config);
	        this.config.accessToken = this.getAccessToken(service.accessToken);
	        this.config.embedUrl = this.getEmbedUrl();
	        this.config.id = this.getId();
	        this.config.uniqueId = this.getUniqueId();
	        var iframeHtml = "<iframe style=\"width:100%;height:100%;\" src=\"" + this.config.embedUrl + "\" scrolling=\"no\" allowfullscreen=\"true\"></iframe>";
	        this.element.innerHTML = iframeHtml;
	        this.iframe = this.element.childNodes[0];
	        this.iframe.addEventListener('load', function () { return _this.load(_this.config); }, false);
	    }
	    /**
	     * Sends load configuration data.
	     *
	     * ```javascript
	     * report.load({
	     *   type: 'report',
	     *   id: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
	     *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
	     *   settings: {
	     *     navContentPaneEnabled: false
	     *   },
	     *   pageName: "DefaultPage",
	     *   filters: [
	     *     {
	     *        ...  DefaultReportFilter ...
	     *     }
	     *   ]
	     * })
	     *   .catch(error => { ... });
	     * ```
	     *
	     * @param {models.ILoadConfiguration} config
	     * @returns {Promise<void>}
	     */
	    Embed.prototype.load = function (config) {
	        var _this = this;
	        var errors = models.validateLoad(config);
	        if (errors) {
	            throw errors;
	        }
	        return this.service.hpm.post('/report/load', config, { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .then(function (response) {
	            utils.assign(_this.config, config);
	            return response.body;
	        }, function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Removes one or more event handlers from the list of handlers.
	     * If a reference to the existing handle function is specified, remove the specific handler.
	     * If the handler is not specified, remove all handlers for the event name specified.
	     *
	     * ```javascript
	     * report.off('pageChanged')
	     *
	     * or
	     *
	     * const logHandler = function (event) {
	     *    console.log(event);
	     * };
	     *
	     * report.off('pageChanged', logHandler);
	     * ```
	     *
	     * @template T
	     * @param {string} eventName
	     * @param {service.IEventHandler<T>} [handler]
	     */
	    Embed.prototype.off = function (eventName, handler) {
	        var _this = this;
	        var fakeEvent = { name: eventName, type: null, id: null, value: null };
	        if (handler) {
	            utils.remove(function (eventHandler) { return eventHandler.test(fakeEvent) && (eventHandler.handle === handler); }, this.eventHandlers);
	            this.element.removeEventListener(eventName, handler);
	        }
	        else {
	            var eventHandlersToRemove = this.eventHandlers
	                .filter(function (eventHandler) { return eventHandler.test(fakeEvent); });
	            eventHandlersToRemove
	                .forEach(function (eventHandlerToRemove) {
	                utils.remove(function (eventHandler) { return eventHandler === eventHandlerToRemove; }, _this.eventHandlers);
	                _this.element.removeEventListener(eventName, eventHandlerToRemove.handle);
	            });
	        }
	    };
	    /**
	     * Adds an event handler for a specific event.
	     *
	     * ```javascript
	     * report.on('pageChanged', (event) => {
	     *   console.log('PageChanged: ', event.page.name);
	     * });
	     * ```
	     *
	     * @template T
	     * @param {string} eventName
	     * @param {service.IEventHandler<T>} handler
	     */
	    Embed.prototype.on = function (eventName, handler) {
	        if (this.allowedEvents.indexOf(eventName) === -1) {
	            throw new Error("eventName is must be one of " + this.allowedEvents + ". You passed: " + eventName);
	        }
	        this.eventHandlers.push({
	            test: function (event) { return event.name === eventName; },
	            handle: handler
	        });
	        this.element.addEventListener(eventName, handler);
	    };
	    /**
	     * Reloads embed using existing configuration.
	     * E.g. For reports this effectively clears all filters and makes the first page active which simulates resetting a report back to loaded state.
	     *
	     * ```javascript
	     * report.reload();
	     * ```
	     */
	    Embed.prototype.reload = function () {
	        return this.load(this.config);
	    };
	    /**
	     * Gets an access token from the first available location: config, attribute, global.
	     *
	     * @private
	     * @param {string} globalAccessToken
	     * @returns {string}
	     */
	    Embed.prototype.getAccessToken = function (globalAccessToken) {
	        var accessToken = this.config.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || globalAccessToken;
	        if (!accessToken) {
	            throw new Error("No access token was found for element. You must specify an access token directly on the element using attribute '" + Embed.accessTokenAttribute + "' or specify a global token at: powerbi.accessToken.");
	        }
	        return accessToken;
	    };
	    /**
	     * Gets an embed url from the first available location: options, attribute.
	     *
	     * @private
	     * @returns {string}
	     */
	    Embed.prototype.getEmbedUrl = function () {
	        var embedUrl = this.config.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);
	        if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
	            throw new Error("Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '" + Embed.embedUrlAttribute + "'.");
	        }
	        return embedUrl;
	    };
	    /**
	     * Gets a unique ID from the first available location: options, attribute.
	     * If neither is provided generate a unique string.
	     *
	     * @private
	     * @returns {string}
	     */
	    Embed.prototype.getUniqueId = function () {
	        return this.config.uniqueId || this.element.getAttribute(Embed.nameAttribute) || utils.createRandomString();
	    };
	    /**
	     * Requests the browser to render the component's iframe in fullscreen mode.
	     */
	    Embed.prototype.fullscreen = function () {
	        var requestFullScreen = this.iframe.requestFullscreen || this.iframe.msRequestFullscreen || this.iframe.mozRequestFullScreen || this.iframe.webkitRequestFullscreen;
	        requestFullScreen.call(this.iframe);
	    };
	    /**
	     * Requests the browser to exit fullscreen mode.
	     */
	    Embed.prototype.exitFullscreen = function () {
	        if (!this.isFullscreen(this.iframe)) {
	            return;
	        }
	        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
	        exitFullscreen.call(document);
	    };
	    /**
	     * Returns true if the iframe is rendered in fullscreen mode,
	     * otherwise returns false.
	     *
	     * @private
	     * @param {HTMLIFrameElement} iframe
	     * @returns {boolean}
	     */
	    Embed.prototype.isFullscreen = function (iframe) {
	        var options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];
	        return options.some(function (option) { return document[option] === iframe; });
	    };
	    Embed.allowedEvents = ["loaded"];
	    Embed.accessTokenAttribute = 'powerbi-access-token';
	    Embed.embedUrlAttribute = 'powerbi-embed-url';
	    Embed.nameAttribute = 'powerbi-name';
	    Embed.typeAttribute = 'powerbi-type';
	    Embed.defaultSettings = {
	        filterPaneEnabled: true
	    };
	    return Embed;
	}());
	exports.Embed = Embed;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Raises a custom event with event data on the specified HTML element.
	 *
	 * @export
	 * @param {HTMLElement} element
	 * @param {string} eventName
	 * @param {*} eventData
	 */
	function raiseCustomEvent(element, eventName, eventData) {
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
	}
	exports.raiseCustomEvent = raiseCustomEvent;
	/**
	 * Finds the index of the first value in an array that matches the specified predicate.
	 *
	 * @export
	 * @template T
	 * @param {(x: T) => boolean} predicate
	 * @param {T[]} xs
	 * @returns {number}
	 */
	function findIndex(predicate, xs) {
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
	}
	exports.findIndex = findIndex;
	/**
	 * Finds the first value in an array that matches the specified predicate.
	 *
	 * @export
	 * @template T
	 * @param {(x: T) => boolean} predicate
	 * @param {T[]} xs
	 * @returns {T}
	 */
	function find(predicate, xs) {
	    var index = findIndex(predicate, xs);
	    return xs[index];
	}
	exports.find = find;
	function remove(predicate, xs) {
	    var index = findIndex(predicate, xs);
	    xs.splice(index, 1);
	}
	exports.remove = remove;
	// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	// TODO: replace in favor of using polyfill
	/**
	 * Copies the values of all enumerable properties from one or more source objects to a target object, and returns the target object.
	 *
	 * @export
	 * @param {any} args
	 * @returns
	 */
	function assign() {
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
	}
	exports.assign = assign;
	/**
	 * Generates a random 7 character string.
	 *
	 * @export
	 * @returns {string}
	 */
	function createRandomString() {
	    return (Math.random() + 1).toString(36).substring(7);
	}
	exports.createRandomString = createRandomString;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*! powerbi-models v0.7.4 | (c) 2016 Microsoft Corporation MIT */
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["powerbi-models"] = factory();
		else
			root["powerbi-models"] = factory();
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
	
		var __extends = (this && this.__extends) || function (d, b) {
		    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
		    function __() { this.constructor = d; }
		    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
		/* tslint:disable:no-var-requires */
		exports.advancedFilterSchema = __webpack_require__(1);
		exports.filterSchema = __webpack_require__(2);
		exports.loadSchema = __webpack_require__(3);
		exports.pageSchema = __webpack_require__(4);
		exports.settingsSchema = __webpack_require__(5);
		exports.basicFilterSchema = __webpack_require__(6);
		/* tslint:enable:no-var-requires */
		var jsen = __webpack_require__(7);
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
		exports.validateSettings = validate(exports.settingsSchema, {
		    schemas: {
		        basicFilter: exports.basicFilterSchema,
		        advancedFilter: exports.advancedFilterSchema
		    }
		});
		exports.validateLoad = validate(exports.loadSchema, {
		    schemas: {
		        settings: exports.settingsSchema,
		        basicFilter: exports.basicFilterSchema,
		        advancedFilter: exports.advancedFilterSchema
		    }
		});
		exports.validatePage = validate(exports.pageSchema);
		exports.validateFilter = validate(exports.filterSchema, {
		    schemas: {
		        basicFilter: exports.basicFilterSchema,
		        advancedFilter: exports.advancedFilterSchema
		    }
		});
		(function (FilterType) {
		    FilterType[FilterType["Advanced"] = 0] = "Advanced";
		    FilterType[FilterType["Basic"] = 1] = "Basic";
		    FilterType[FilterType["Unknown"] = 2] = "Unknown";
		})(exports.FilterType || (exports.FilterType = {}));
		var FilterType = exports.FilterType;
		function getFilterType(filter) {
		    var basicFilter = filter;
		    var advancedFilter = filter;
		    if ((typeof basicFilter.operator === "string")
		        && (Array.isArray(basicFilter.values))) {
		        return FilterType.Basic;
		    }
		    else if ((typeof advancedFilter.logicalOperator === "string")
		        && (Array.isArray(advancedFilter.conditions))) {
		        return FilterType.Advanced;
		    }
		    else {
		        return FilterType.Unknown;
		    }
		}
		exports.getFilterType = getFilterType;
		function isMeasure(arg) {
		    return arg.table !== undefined && arg.measure !== undefined;
		}
		exports.isMeasure = isMeasure;
		function isColumn(arg) {
		    return arg.table !== undefined && arg.column !== undefined;
		}
		exports.isColumn = isColumn;
		function isHierarchy(arg) {
		    return arg.table !== undefined && arg.hierarchy !== undefined && arg.hierarchyLevel !== undefined;
		}
		exports.isHierarchy = isHierarchy;
		var Filter = (function () {
		    function Filter(target) {
		        this.target = target;
		    }
		    Filter.prototype.toJSON = function () {
		        return {
		            $schema: this.schemaUrl,
		            target: this.target
		        };
		    };
		    ;
		    return Filter;
		}());
		exports.Filter = Filter;
		var BasicFilter = (function (_super) {
		    __extends(BasicFilter, _super);
		    function BasicFilter(target, operator) {
		        var values = [];
		        for (var _i = 2; _i < arguments.length; _i++) {
		            values[_i - 2] = arguments[_i];
		        }
		        _super.call(this, target);
		        this.operator = operator;
		        this.schemaUrl = BasicFilter.schemaUrl;
		        if (values.length === 0) {
		            throw new Error("values must be a non-empty array. You passed: " + values);
		        }
		        /**
		         * Accept values as array instead of as individual arguments
		         * new BasicFilter('a', 'b', 1, 2);
		         * new BasicFilter('a', 'b', [1,2]);
		         */
		        if (Array.isArray(values[0])) {
		            this.values = values[0];
		        }
		        else {
		            this.values = values;
		        }
		    }
		    BasicFilter.prototype.toJSON = function () {
		        var filter = _super.prototype.toJSON.call(this);
		        filter.operator = this.operator;
		        filter.values = this.values;
		        return filter;
		    };
		    BasicFilter.schemaUrl = "http://powerbi.com/product/schema#basic";
		    return BasicFilter;
		}(Filter));
		exports.BasicFilter = BasicFilter;
		var AdvancedFilter = (function (_super) {
		    __extends(AdvancedFilter, _super);
		    function AdvancedFilter(target, logicalOperator) {
		        var conditions = [];
		        for (var _i = 2; _i < arguments.length; _i++) {
		            conditions[_i - 2] = arguments[_i];
		        }
		        _super.call(this, target);
		        this.schemaUrl = AdvancedFilter.schemaUrl;
		        // Guard statements
		        if (typeof logicalOperator !== "string" || logicalOperator.length === 0) {
		            // TODO: It would be nicer to list out the possible logical operators.
		            throw new Error("logicalOperator must be a valid operator, You passed: " + logicalOperator);
		        }
		        this.logicalOperator = logicalOperator;
		        var extractedConditions;
		        /**
		         * Accept conditions as array instead of as individual arguments
		         * new AdvancedFilter('a', 'b', "And", { value: 1, operator: "Equals" }, { value: 2, operator: "IsGreaterThan" });
		         * new AdvancedFilter('a', 'b', "And", [{ value: 1, operator: "Equals" }, { value: 2, operator: "IsGreaterThan" }]);
		         */
		        if (Array.isArray(conditions[0])) {
		            extractedConditions = conditions[0];
		        }
		        else {
		            extractedConditions = conditions;
		        }
		        if (extractedConditions.length === 0) {
		            throw new Error("conditions must be a non-empty array. You passed: " + conditions);
		        }
		        if (extractedConditions.length > 2) {
		            throw new Error("AdvancedFilters may not have more than two conditions. You passed: " + conditions.length);
		        }
		        if (extractedConditions.length === 1 && logicalOperator !== "And") {
		            throw new Error("Logical Operator must be \"And\" when there is only one condition provided");
		        }
		        this.conditions = extractedConditions;
		    }
		    AdvancedFilter.prototype.toJSON = function () {
		        var filter = _super.prototype.toJSON.call(this);
		        filter.logicalOperator = this.logicalOperator;
		        filter.conditions = this.conditions;
		        return filter;
		    };
		    AdvancedFilter.schemaUrl = "http://powerbi.com/product/schema#advanced";
		    return AdvancedFilter;
		}(Filter));
		exports.AdvancedFilter = AdvancedFilter;
	
	
	/***/ },
	/* 1 */
	/***/ function(module, exports) {
	
		module.exports = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {
				"target": {
					"oneOf": [
						{
							"type": "object",
							"properties": {
								"table": {
									"type": "string"
								},
								"column": {
									"type": "string"
								}
							},
							"required": [
								"table",
								"column"
							]
						},
						{
							"type": "object",
							"properties": {
								"table": {
									"type": "string"
								},
								"hierarchy": {
									"type": "string"
								},
								"hierarchyLevel": {
									"type": "string"
								}
							},
							"required": [
								"table",
								"hierarchy",
								"hierarchyLevel"
							]
						},
						{
							"type": "object",
							"properties": {
								"table": {
									"type": "string"
								},
								"measure": {
									"type": "string"
								}
							},
							"required": [
								"table",
								"measure"
							]
						}
					]
				},
				"logicalOperator": {
					"type": "string"
				},
				"conditions": {
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
							"value": {
								"type": [
									"string",
									"boolean",
									"number"
								]
							},
							"operator": {
								"type": "string"
							}
						},
						"required": [
							"value",
							"operator"
						]
					}
				}
			},
			"required": [
				"target",
				"logicalOperator",
				"conditions"
			]
		};
	
	/***/ },
	/* 2 */
	/***/ function(module, exports) {
	
		module.exports = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"oneOf": [
				{
					"$ref": "#basicFilter"
				},
				{
					"$ref": "#advancedFilter"
				}
			],
			"invalidMessage": "filter is invalid"
		};
	
	/***/ },
	/* 3 */
	/***/ function(module, exports) {
	
		module.exports = {
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
					},
					"invalidMessage": "id property is invalid"
				},
				"settings": {
					"$ref": "#settings"
				},
				"pageName": {
					"type": "string",
					"messages": {
						"type": "pageName must be a string"
					}
				},
				"filters": {
					"type": "array",
					"oneOf": [
						{
							"$ref": "#basicFilter"
						},
						{
							"$ref": "#advancedFilter"
						}
					],
					"invalidMessage": "filters property is invalid"
				}
			},
			"required": [
				"accessToken",
				"id"
			]
		};
	
	/***/ },
	/* 4 */
	/***/ function(module, exports) {
	
		module.exports = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"messages": {
						"type": "name must be a string",
						"required": "name is required"
					}
				}
			},
			"required": [
				"name"
			]
		};
	
	/***/ },
	/* 5 */
	/***/ function(module, exports) {
	
		module.exports = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {
				"filterPaneEnabled": {
					"type": "boolean",
					"messages": {
						"type": "filterPaneEnabled must be a boolean"
					}
				},
				"navContentPaneEnabled": {
					"type": "boolean",
					"messages": {
						"type": "navContentPaneEnabled must be a boolean"
					}
				}
			}
		};
	
	/***/ },
	/* 6 */
	/***/ function(module, exports) {
	
		module.exports = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {
				"target": {
					"type": "object",
					"properties": {
						"table": {
							"type": "string"
						},
						"column": {
							"type": "string"
						},
						"hierarchy": {
							"type": "string"
						},
						"hierarchyLevel": {
							"type": "string"
						},
						"measure": {
							"type": "string"
						}
					},
					"required": [
						"table"
					]
				},
				"operator": {
					"type": "string"
				},
				"values": {
					"type": "array",
					"items": {
						"type": [
							"string",
							"boolean",
							"number"
						]
					}
				}
			},
			"required": [
				"target",
				"operator",
				"values"
			]
		};
	
	/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {
	
		module.exports = __webpack_require__(8);
	
	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {
	
		/* WEBPACK VAR INJECTION */(function(process) {'use strict';
		
		var PATH_REPLACE_EXPR = /\[.+?\]/g,
		    PATH_PROP_REPLACE_EXPR = /\[?(.*?)?\]/,
		    REGEX_ESCAPE_EXPR = /[\/]/g,
		    VALID_IDENTIFIER_EXPR = /^[a-z_$][0-9a-z]*$/gi,
		    INVALID_SCHEMA = 'jsen: invalid schema object',
		    browser = typeof window === 'object' && !!window.navigator,   // jshint ignore: line
		    nodev0 = typeof process === 'object' && process.version.split('.')[0] === 'v0',
		    func = __webpack_require__(10),
		    equal = __webpack_require__(11),
		    unique = __webpack_require__(12),
		    SchemaResolver = __webpack_require__(13),
		    formats = __webpack_require__(15),
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
		
		/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))
	
	/***/ },
	/* 9 */
	/***/ function(module, exports) {
	
		// shim for using process in browser
		var process = module.exports = {};
		
		// cached from whatever global is present so that test runners that stub it
		// don't break things.  But we need to wrap it in a try catch in case it is
		// wrapped in strict mode code which doesn't define any globals.  It's inside a
		// function because try/catches deoptimize in certain engines.
		
		var cachedSetTimeout;
		var cachedClearTimeout;
		
		(function () {
		    try {
		        cachedSetTimeout = setTimeout;
		    } catch (e) {
		        cachedSetTimeout = function () {
		            throw new Error('setTimeout is not defined');
		        }
		    }
		    try {
		        cachedClearTimeout = clearTimeout;
		    } catch (e) {
		        cachedClearTimeout = function () {
		            throw new Error('clearTimeout is not defined');
		        }
		    }
		} ())
		function runTimeout(fun) {
		    if (cachedSetTimeout === setTimeout) {
		        //normal enviroments in sane situations
		        return setTimeout(fun, 0);
		    }
		    try {
		        // when when somebody has screwed with setTimeout but no I.E. maddness
		        return cachedSetTimeout(fun, 0);
		    } catch(e){
		        try {
		            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
		            return cachedSetTimeout.call(null, fun, 0);
		        } catch(e){
		            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
		            return cachedSetTimeout.call(this, fun, 0);
		        }
		    }
		
		
		}
		function runClearTimeout(marker) {
		    if (cachedClearTimeout === clearTimeout) {
		        //normal enviroments in sane situations
		        return clearTimeout(marker);
		    }
		    try {
		        // when when somebody has screwed with setTimeout but no I.E. maddness
		        return cachedClearTimeout(marker);
		    } catch (e){
		        try {
		            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
		            return cachedClearTimeout.call(null, marker);
		        } catch (e){
		            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
		            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
		            return cachedClearTimeout.call(this, marker);
		        }
		    }
		
		
		
		}
		var queue = [];
		var draining = false;
		var currentQueue;
		var queueIndex = -1;
		
		function cleanUpNextTick() {
		    if (!draining || !currentQueue) {
		        return;
		    }
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
		    var timeout = runTimeout(cleanUpNextTick);
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
		    runClearTimeout(timeout);
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
		        runTimeout(drainQueue);
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
	/* 10 */
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
	/* 11 */
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
	/* 12 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		var equal = __webpack_require__(11);
		
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
	/* 13 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		var metaschema = __webpack_require__(14),
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
	/* 14 */
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
	/* 15 */
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
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=models.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed = __webpack_require__(2);
	var utils = __webpack_require__(3);
	var page_1 = __webpack_require__(6);
	/**
	 * The Power BI Report embed component
	 *
	 * @export
	 * @class Report
	 * @extends {embed.Embed}
	 * @implements {IReportNode}
	 * @implements {IFilterable}
	 */
	var Report = (function (_super) {
	    __extends(Report, _super);
	    /**
	     * Creates an instance of a Power BI Report.
	     *
	     * @param {service.Service} service
	     * @param {HTMLElement} element
	     * @param {embed.IEmbedConfiguration} config
	     */
	    function Report(service, element, config) {
	        var filterPaneEnabled = (config.settings && config.settings.filterPaneEnabled) || !(element.getAttribute(Report.filterPaneEnabledAttribute) === "false");
	        var navContentPaneEnabled = (config.settings && config.settings.navContentPaneEnabled) || !(element.getAttribute(Report.navContentPaneEnabledAttribute) === "false");
	        var settings = utils.assign({
	            filterPaneEnabled: filterPaneEnabled,
	            navContentPaneEnabled: navContentPaneEnabled
	        }, config.settings);
	        var configCopy = utils.assign({ settings: settings }, config);
	        _super.call(this, service, element, configCopy);
	        Array.prototype.push.apply(this.allowedEvents, Report.allowedEvents);
	    }
	    /**
	     * Adds backwards compatibility for the previous load configuration, which used the reportId query parameter to specify the report ID
	     * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
	     *
	     * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
	     *
	     * @static
	     * @param {string} url
	     * @returns {string}
	     */
	    Report.findIdFromEmbedUrl = function (url) {
	        var reportIdRegEx = /reportId="?([^&]+)"?/;
	        var reportIdMatch = url.match(reportIdRegEx);
	        var reportId;
	        if (reportIdMatch) {
	            reportId = reportIdMatch[1];
	        }
	        return reportId;
	    };
	    /**
	     * Gets filters that are applied at the report level.
	     *
	     * ```javascript
	     * // Get filters applied at report level
	     * report.getFilters()
	     *   .then(filters => {
	     *     ...
	     *   });
	     * ```
	     *
	     * @returns {Promise<models.IFilter[]>}
	     */
	    Report.prototype.getFilters = function () {
	        return this.service.hpm.get("/report/filters", { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .then(function (response) { return response.body; }, function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Gets the report ID from the first available location: options, attribute, embed url.
	     *
	     * @returns {string}
	     */
	    Report.prototype.getId = function () {
	        var reportId = this.config.id || this.element.getAttribute(Report.reportIdAttribute) || Report.findIdFromEmbedUrl(this.config.embedUrl);
	        if (typeof reportId !== 'string' || reportId.length === 0) {
	            throw new Error("Report id is required, but it was not found. You must provide an id either as part of embed configuration or as attribute '" + Report.reportIdAttribute + "'.");
	        }
	        return reportId;
	    };
	    /**
	     * Gets the list of pages within the report.
	     *
	     * ```javascript
	     * report.getPages()
	     *  .then(pages => {
	     *      ...
	     *  });
	     * ```
	     *
	     * @returns {Promise<Page[]>}
	     */
	    Report.prototype.getPages = function () {
	        var _this = this;
	        return this.service.hpm.get('/report/pages', { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .then(function (response) {
	            return response.body
	                .map(function (page) {
	                return new page_1.Page(_this, page.name, page.displayName);
	            });
	        }, function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Creates an instance of a Page.
	     *
	     * Normally you would get Page objects by calling `report.getPages()`, but in the case
	     * that the page name is known and you want to perform an action on a page without having to retrieve it
	     * you can create it directly.
	     *
	     * Note: Because you are creating the page manually there is no guarantee that the page actually exists in the report, and subsequent requests could fail.
	     *
	     * ```javascript
	     * const page = report.page('ReportSection1');
	     * page.setActive();
	     * ```
	     *
	     * @param {string} name
	     * @param {string} [displayName]
	     * @returns {Page}
	     */
	    Report.prototype.page = function (name, displayName) {
	        return new page_1.Page(this, name, displayName);
	    };
	    /**
	     * Removes all filters at the report level.
	     *
	     * ```javascript
	     * report.removeFilters();
	     * ```
	     *
	     * @returns {Promise<void>}
	     */
	    Report.prototype.removeFilters = function () {
	        return this.setFilters([]);
	    };
	    /**
	     * Sets the active page of the report.
	     *
	     * ```javascript
	     * report.setPage("page2")
	     *  .catch(error => { ... });
	     * ```
	     *
	     * @param {string} pageName
	     * @returns {Promise<void>}
	     */
	    Report.prototype.setPage = function (pageName) {
	        var page = {
	            name: pageName,
	            displayName: null
	        };
	        return this.service.hpm.put('/report/pages/active', page, { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Sets filters at the report level.
	     *
	     * ```javascript
	     * const filters: [
	     *    ...
	     * ];
	     *
	     * report.setFilters(filters)
	     *  .catch(errors => {
	     *    ...
	     *  });
	     * ```
	     *
	     * @param {(models.IFilter[])} filters
	     * @returns {Promise<void>}
	     */
	    Report.prototype.setFilters = function (filters) {
	        return this.service.hpm.put("/report/filters", filters, { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Updates visibility settings for the filter pane and the page navigation pane.
	     *
	     * ```javascript
	     * const newSettings = {
	     *   navContentPaneEnabled: true,
	     *   filterPaneEnabled: false
	     * };
	     *
	     * report.updateSettings(newSettings)
	     *   .catch(error => { ... });
	     * ```
	     *
	     * @param {models.ISettings} settings
	     * @returns {Promise<void>}
	     */
	    Report.prototype.updateSettings = function (settings) {
	        return this.service.hpm.patch('/report/settings', settings, { uid: this.config.uniqueId }, this.iframe.contentWindow)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    Report.allowedEvents = ["dataSelected", "filtersApplied", "pageChanged", "error"];
	    Report.reportIdAttribute = 'powerbi-report-id';
	    Report.filterPaneEnabledAttribute = 'powerbi-settings-filter-pane-enabled';
	    Report.navContentPaneEnabledAttribute = 'powerbi-settings-nav-content-pane-enabled';
	    Report.typeAttribute = 'powerbi-type';
	    Report.type = "Report";
	    return Report;
	}(embed.Embed));
	exports.Report = Report;


/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * A Power BI report page
	 *
	 * @export
	 * @class Page
	 * @implements {IPageNode}
	 * @implements {IFilterable}
	 */
	var Page = (function () {
	    /**
	     * Creates an instance of a Power BI report page.
	     *
	     * @param {IReportNode} report
	     * @param {string} name
	     * @param {string} [displayName]
	     */
	    function Page(report, name, displayName) {
	        this.report = report;
	        this.name = name;
	        this.displayName = displayName;
	    }
	    /**
	     * Gets all page level filters within the report.
	     *
	     * ```javascript
	     * page.getFilters()
	     *  .then(pages => { ... });
	     * ```
	     *
	     * @returns {(Promise<models.IFilter[]>)}
	     */
	    Page.prototype.getFilters = function () {
	        return this.report.service.hpm.get("/report/pages/" + this.name + "/filters", { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
	            .then(function (response) { return response.body; }, function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Removes all filters from this page of the report.
	     *
	     * ```javascript
	     * page.removeFilters();
	     * ```
	     *
	     * @returns {Promise<void>}
	     */
	    Page.prototype.removeFilters = function () {
	        return this.setFilters([]);
	    };
	    /**
	     * Makes the current page the active page of the report.
	     *
	     * ```javascripot
	     * page.setActive();
	     * ```
	     *
	     * @returns {Promise<void>}
	     */
	    Page.prototype.setActive = function () {
	        var page = {
	            name: this.name,
	            displayName: null
	        };
	        return this.report.service.hpm.put('/report/pages/active', page, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    /**
	     * Sets all filters on the current page.
	     *
	     * ```javascript
	     * page.setFilters(filters);
	     *   .catch(errors => { ... });
	     * ```
	     *
	     * @param {(models.IFilter[])} filters
	     * @returns {Promise<void>}
	     */
	    Page.prototype.setFilters = function (filters) {
	        return this.report.service.hpm.put("/report/pages/" + this.name + "/filters", filters, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
	            .catch(function (response) {
	            throw response.body;
	        });
	    };
	    return Page;
	}());
	exports.Page = Page;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var embed_1 = __webpack_require__(2);
	/**
	 * The Power BI tile embed component
	 *
	 * @export
	 * @class Tile
	 * @extends {Embed}
	 */
	var Tile = (function (_super) {
	    __extends(Tile, _super);
	    function Tile() {
	        _super.apply(this, arguments);
	    }
	    /**
	     * The ID of the tile
	     *
	     * @returns {string}
	     */
	    Tile.prototype.getId = function () {
	        throw Error('Not implemented. Embedding tiles is not supported yet.');
	    };
	    Tile.type = "Tile";
	    return Tile;
	}(embed_1.Embed));
	exports.Tile = Tile;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var config_1 = __webpack_require__(9);
	var wpmp = __webpack_require__(10);
	var hpm = __webpack_require__(11);
	var router = __webpack_require__(12);
	exports.hpmFactory = function (wpmp, defaultTargetWindow, sdkVersion, sdkType) {
	    if (sdkVersion === void 0) { sdkVersion = config_1.default.version; }
	    if (sdkType === void 0) { sdkType = config_1.default.type; }
	    return new hpm.HttpPostMessage(wpmp, {
	        'x-sdk-type': sdkType,
	        'x-sdk-version': sdkVersion
	    }, defaultTargetWindow);
	};
	exports.wpmpFactory = function (name, logMessages, eventSourceOverrideWindow) {
	    return new wpmp.WindowPostMessageProxy({
	        processTrackingProperties: {
	            addTrackingProperties: hpm.HttpPostMessage.addTrackingProperties,
	            getTrackingProperties: hpm.HttpPostMessage.getTrackingProperties,
	        },
	        isErrorMessage: hpm.HttpPostMessage.isErrorMessage,
	        name: name,
	        logMessages: logMessages,
	        eventSourceOverrideWindow: eventSourceOverrideWindow
	    });
	};
	exports.routerFactory = function (wpmp) {
	    return new router.Router(wpmp);
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	var config = {
	    version: '2.0.0',
	    type: 'js'
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = config;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*! window-post-message-proxy v0.2.4 | (c) 2016 Microsoft Corporation MIT */
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["window-post-message-proxy"] = factory();
		else
			root["window-post-message-proxy"] = factory();
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
	/***/ function(module, exports) {
	
		"use strict";
		var WindowPostMessageProxy = (function () {
		    function WindowPostMessageProxy(options) {
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
		        // save options with defaults
		        this.addTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.addTrackingProperties) || WindowPostMessageProxy.defaultAddTrackingProperties;
		        this.getTrackingProperties = (options.processTrackingProperties && options.processTrackingProperties.getTrackingProperties) || WindowPostMessageProxy.defaultGetTrackingProperties;
		        this.isErrorMessage = options.isErrorMessage || WindowPostMessageProxy.defaultIsErrorMessage;
		        this.receiveWindow = options.receiveWindow || window;
		        this.name = options.name || WindowPostMessageProxy.createRandomString();
		        this.logMessages = options.logMessages || false;
		        this.eventSourceOverrideWindow = options.eventSourceOverrideWindow;
		        this.suppressWarnings = options.suppressWarnings || false;
		        if (this.logMessages) {
		            console.log("new WindowPostMessageProxy created with name: " + this.name + " receiving on window: " + this.receiveWindow.document.title);
		        }
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
		        if (handlerIndex === -1) {
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
		    WindowPostMessageProxy.prototype.postMessage = function (targetWindow, message) {
		        // Add tracking properties to indicate message came from this proxy
		        var trackingProperties = { id: WindowPostMessageProxy.createRandomString() };
		        this.addTrackingProperties(message, trackingProperties);
		        if (this.logMessages) {
		            console.log(this.name + " Posting message:");
		            console.log(JSON.stringify(message, null, '  '));
		        }
		        targetWindow.postMessage(message, "*");
		        var deferred = WindowPostMessageProxy.createDeferred();
		        this.pendingRequestPromises[trackingProperties.id] = deferred;
		        return deferred.promise;
		    };
		    /**
		     * Send response message to target window.
		     * Response messages re-use tracking properties from a previous request message.
		     */
		    WindowPostMessageProxy.prototype.sendResponse = function (targetWindow, message, trackingProperties) {
		        this.addTrackingProperties(message, trackingProperties);
		        if (this.logMessages) {
		            console.log(this.name + " Sending response:");
		            console.log(JSON.stringify(message, null, '  '));
		        }
		        targetWindow.postMessage(message, "*");
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
		        var sendingWindow = this.eventSourceOverrideWindow || event.source;
		        var message = event.data;
		        if (typeof message !== "object") {
		            if (!this.suppressWarnings) {
		                console.warn("Proxy(" + this.name + "): Received message that was not an object. Discarding message");
		            }
		            return;
		        }
		        var trackingProperties;
		        try {
		            trackingProperties = this.getTrackingProperties(message);
		        }
		        catch (e) {
		            if (!this.suppressWarnings) {
		                console.warn("Proxy(" + this.name + "): Error occurred when attempting to get tracking properties from incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
		            }
		        }
		        var deferred;
		        if (trackingProperties) {
		            deferred = this.pendingRequestPromises[trackingProperties.id];
		        }
		        // If message does not have a known ID, treat it as a request
		        // Otherwise, treat message as response
		        if (!deferred) {
		            var handled = this.handlers.some(function (handler) {
		                var canMessageBeHandled = false;
		                try {
		                    canMessageBeHandled = handler.test(message);
		                }
		                catch (e) {
		                    if (!_this.suppressWarnings) {
		                        console.warn("Proxy(" + _this.name + "): Error occurred when handler was testing incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
		                    }
		                }
		                if (canMessageBeHandled) {
		                    var responseMessagePromise = void 0;
		                    try {
		                        responseMessagePromise = Promise.resolve(handler.handle(message));
		                    }
		                    catch (e) {
		                        if (!_this.suppressWarnings) {
		                            console.warn("Proxy(" + _this.name + "): Error occurred when handler was processing incoming message:", JSON.stringify(message, null, '  '), "Error: ", e);
		                        }
		                        responseMessagePromise = Promise.resolve();
		                    }
		                    responseMessagePromise
		                        .then(function (responseMessage) {
		                        if (!responseMessage) {
		                            var warningMessage = "Handler for message: " + JSON.stringify(message, null, '  ') + " did not return a response message. The default response message will be returned instead.";
		                            if (!_this.suppressWarnings) {
		                                console.warn("Proxy(" + _this.name + "): " + warningMessage);
		                            }
		                            responseMessage = {
		                                warning: warningMessage
		                            };
		                        }
		                        _this.sendResponse(sendingWindow, responseMessage, trackingProperties);
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
		            if (!handled && !this.suppressWarnings) {
		                console.warn("Proxy(" + this.name + ") did not handle message. Handlers: " + this.handlers.length + "  Message: " + JSON.stringify(message, null, '') + ".");
		            }
		        }
		        else {
		            /**
		             * If error message reject promise,
		             * Otherwise, resolve promise
		             */
		            var isErrorMessage = true;
		            try {
		                isErrorMessage = this.isErrorMessage(message);
		            }
		            catch (e) {
		                console.warn("Proxy(" + this.name + ") Error occurred when trying to determine if message is consider an error response. Message: ", JSON.stringify(message, null, ''), 'Error: ', e);
		            }
		            if (isErrorMessage) {
		                deferred.reject(message);
		            }
		            else {
		                deferred.resolve(message);
		            }
		            // TODO: Move to .finally clause up where promise is created for better maitenance like original proxy code.
		            delete this.pendingRequestPromises[trackingProperties.id];
		        }
		    };
		    WindowPostMessageProxy.messagePropertyName = "windowPostMessageProxy";
		    return WindowPostMessageProxy;
		}());
		exports.WindowPostMessageProxy = WindowPostMessageProxy;
	
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=windowPostMessageProxy.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*! http-post-message v0.2.3 | (c) 2016 Microsoft Corporation MIT */
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["http-post-message"] = factory();
		else
			root["http-post-message"] = factory();
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
	/***/ function(module, exports) {
	
		"use strict";
		var HttpPostMessage = (function () {
		    function HttpPostMessage(windowPostMessageProxy, defaultHeaders, defaultTargetWindow) {
		        if (defaultHeaders === void 0) { defaultHeaders = {}; }
		        this.defaultHeaders = defaultHeaders;
		        this.defaultTargetWindow = defaultTargetWindow;
		        this.windowPostMessageProxy = windowPostMessageProxy;
		    }
		    // TODO: See if it's possible to share tracking properties interface?
		    // The responsibility of knowing how to configure windowPostMessageProxy for http should
		    // live in this http class, but the configuration would need ITrackingProperties
		    // interface which lives in WindowPostMessageProxy. Use <any> type as workaround
		    HttpPostMessage.addTrackingProperties = function (message, trackingProperties) {
		        message.headers = message.headers || {};
		        if (trackingProperties && trackingProperties.id) {
		            message.headers.id = trackingProperties.id;
		        }
		        return message;
		    };
		    HttpPostMessage.getTrackingProperties = function (message) {
		        return {
		            id: message.headers && message.headers.id
		        };
		    };
		    HttpPostMessage.isErrorMessage = function (message) {
		        if (typeof (message && message.statusCode) !== 'number') {
		            return false;
		        }
		        return !(200 <= message.statusCode && message.statusCode < 300);
		    };
		    HttpPostMessage.prototype.get = function (url, headers, targetWindow) {
		        if (headers === void 0) { headers = {}; }
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        return this.send({
		            method: "GET",
		            url: url,
		            headers: headers
		        }, targetWindow);
		    };
		    HttpPostMessage.prototype.post = function (url, body, headers, targetWindow) {
		        if (headers === void 0) { headers = {}; }
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        return this.send({
		            method: "POST",
		            url: url,
		            headers: headers,
		            body: body
		        }, targetWindow);
		    };
		    HttpPostMessage.prototype.put = function (url, body, headers, targetWindow) {
		        if (headers === void 0) { headers = {}; }
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        return this.send({
		            method: "PUT",
		            url: url,
		            headers: headers,
		            body: body
		        }, targetWindow);
		    };
		    HttpPostMessage.prototype.patch = function (url, body, headers, targetWindow) {
		        if (headers === void 0) { headers = {}; }
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        return this.send({
		            method: "PATCH",
		            url: url,
		            headers: headers,
		            body: body
		        }, targetWindow);
		    };
		    HttpPostMessage.prototype.delete = function (url, body, headers, targetWindow) {
		        if (body === void 0) { body = null; }
		        if (headers === void 0) { headers = {}; }
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        return this.send({
		            method: "DELETE",
		            url: url,
		            headers: headers,
		            body: body
		        }, targetWindow);
		    };
		    HttpPostMessage.prototype.send = function (request, targetWindow) {
		        if (targetWindow === void 0) { targetWindow = this.defaultTargetWindow; }
		        request.headers = this.assign({}, this.defaultHeaders, request.headers);
		        if (!targetWindow) {
		            throw new Error("target window is not provided.  You must either provide the target window explicitly as argument to request, or specify default target window when constructing instance of this class.");
		        }
		        return this.windowPostMessageProxy.postMessage(targetWindow, request);
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
	
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=httpPostMessage.js.map

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*! powerbi-router v0.1.5 | (c) 2016 Microsoft Corporation MIT */
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
/******/ ])
});
;
//# sourceMappingURL=powerbi.js.map