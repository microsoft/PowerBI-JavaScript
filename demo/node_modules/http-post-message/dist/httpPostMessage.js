/*! http-post-message v0.2.3 | (c) 2016 Microsoft Corporation MIT */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
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