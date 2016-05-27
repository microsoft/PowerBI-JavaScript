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
	var Wpmp = __webpack_require__(1);
	var Hpm = __webpack_require__(5);
	var Router = __webpack_require__(9);
	var mockReportEmbed_1 = __webpack_require__(13);
	function createDeferred() {
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
	}
	describe('Protocol', function () {
	    var logMessages = (window.__karma__.config.args[0] === 'logMessages');
	    var hpm;
	    var wpmp;
	    var iframe;
	    var iframeHpm;
	    var iframeLoaded;
	    var handler;
	    var spyHandler;
	    beforeAll(function () {
	        var iframeSrc = "base/e2e/utility/noop.html";
	        var $iframe = $("<iframe src=\"" + iframeSrc + "\" id=\"testiframe\"></iframe>").appendTo(document.body);
	        iframe = $iframe.get(0);
	        // Register Iframe side
	        iframeHpm = mockReportEmbed_1.setup(iframe.contentWindow, window, logMessages);
	        // Register SDK side WPMP
	        wpmp = new Wpmp.WindowPostMessageProxy(iframe.contentWindow, {
	            processTrackingProperties: {
	                addTrackingProperties: Hpm.HttpPostMessage.addTrackingProperties,
	                getTrackingProperties: Hpm.HttpPostMessage.getTrackingProperties,
	            },
	            isErrorMessage: Hpm.HttpPostMessage.isErrorMessage,
	            name: 'HostProxyDefaultNoHandlers',
	            logMessages: logMessages
	        });
	        hpm = new Hpm.HttpPostMessage(wpmp, {
	            origin: 'sdk',
	            'sdk-type': 'js',
	            'sdk-version': '2.0.0'
	        });
	        var router = new Router.Router(wpmp);
	        router.post('/report/events/loaded', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/pageChanged', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/filterAdded', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/filterUpdated', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/filterRemoved', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/filtersCleared', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/settingsUpdated', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        router.post('/report/events/dataSelected', function (req, res) {
	            handler.handle(req);
	            res.send(202);
	        });
	        handler = {
	            test: jasmine.createSpy("testSpy").and.returnValue(true),
	            handle: jasmine.createSpy("handleSpy").and.callFake(function (message) {
	                message.handled = true;
	                return message;
	            })
	        };
	        spyHandler = handler;
	        wpmp.addHandler(handler);
	        var iframeLoadedDeferred = createDeferred();
	        iframe.addEventListener('load', function () {
	            iframeLoadedDeferred.resolve();
	        });
	        iframeLoaded = iframeLoadedDeferred.promise;
	    });
	    afterAll(function () {
	        //wpmp.stop();
	    });
	    beforeEach(function () {
	        // empty
	    });
	    afterEach(function () {
	        spyHandler.test.calls.reset();
	        spyHandler.handle.calls.reset();
	    });
	    describe('SDK-to-REPORT', function () {
	        describe('load', function () {
	            it('POST /report/load returns 400 if the request is invalid', function (done) {
	                // Arrange
	                var testData = {
	                    load: {
	                        reportId: "fakeId",
	                        accessToken: "fakeToken",
	                        options: {}
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateLoad.and.returnValue(Promise.reject(null));
	                    // Act
	                    hpm.post('/report/load', testData.load)
	                        .then(function () {
	                        expect(false).toBe(true);
	                        mockReportEmbed_1.spyApp.validateLoad.calls.reset();
	                        done();
	                    })
	                        .catch(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
	                        expect(mockReportEmbed_1.spyApp.load).not.toHaveBeenCalledWith(testData.load);
	                        expect(response.statusCode).toEqual(400);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateLoad.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('POST /report/load returns 202 if the request is valid', function (done) {
	                // Arrange
	                var testData = {
	                    load: {
	                        reportId: "fakeId",
	                        accessToken: "fakeToken",
	                        options: {}
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateLoad.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.post('/report/load', testData.load)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
	                        expect(mockReportEmbed_1.spyApp.load).toHaveBeenCalledWith(testData.load);
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateLoad.calls.reset();
	                        mockReportEmbed_1.spyApp.load.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('POST /report/load causes POST /report/events/loaded', function (done) {
	                // Arrange
	                var testData = {
	                    load: {
	                        reportId: "fakeId",
	                        accessToken: "fakeToken",
	                        options: {
	                            pageNavigationEnabled: false
	                        }
	                    },
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/loaded',
	                        body: {
	                            initiator: 'sdk'
	                        }
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.load.and.returnValue(Promise.resolve(testData.load));
	                    // Act
	                    hpm.post('/report/load', testData.load)
	                        .then(function (response) {
	                        setTimeout(function () {
	                            // Assert
	                            expect(mockReportEmbed_1.spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
	                            expect(mockReportEmbed_1.spyApp.load).toHaveBeenCalledWith(testData.load);
	                            expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                            // Cleanup
	                            mockReportEmbed_1.spyApp.validateLoad.calls.reset();
	                            mockReportEmbed_1.spyApp.load.calls.reset();
	                            done();
	                        });
	                    });
	                });
	            });
	        });
	        describe('pages', function () {
	            it('GET /report/pages returns 200 with body as array of pages', function (done) {
	                // Arrange
	                var testData = {
	                    expectedPages: [
	                        {
	                            name: "a"
	                        },
	                        {
	                            name: "b"
	                        }
	                    ]
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.getPages.and.returnValue(Promise.resolve(testData.expectedPages));
	                    // Act
	                    hpm.get('/report/pages')
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.getPages).toHaveBeenCalled();
	                        var pages = response.body;
	                        expect(pages).toEqual(testData.expectedPages);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.getPages.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/pages/active returns 400 if request is invalid', function (done) {
	                // Arrange
	                var testData = {
	                    page: {
	                        name: "fakeName",
	                        displayName: "fakeDisplayName"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validatePage.and.returnValue(Promise.reject(null));
	                    // Act
	                    hpm.put('/report/pages/active', testData.page)
	                        .catch(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validatePage).toHaveBeenCalledWith(testData.page);
	                        expect(mockReportEmbed_1.spyApp.setActivePage).not.toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(400);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validatePage.calls.reset();
	                        mockReportEmbed_1.spyApp.setActivePage.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/pages/active returns 202 if request is valid', function (done) {
	                // Arrange
	                var testData = {
	                    page: {
	                        name: "fakeName",
	                        displayName: "fakeDisplayName"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validatePage.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.put('/report/pages/active', testData.page)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validatePage).toHaveBeenCalledWith(testData.page);
	                        expect(mockReportEmbed_1.spyApp.setActivePage).toHaveBeenCalledWith(testData.page);
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validatePage.calls.reset();
	                        mockReportEmbed_1.spyApp.setActivePage.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/pages/active causes POST /report/events/pageChanged', function (done) {
	                // Arrange
	                var testData = {
	                    page: {
	                        name: "fakeName",
	                        displayName: "fakeDisplayName"
	                    },
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/pageChanged',
	                        body: jasmine.objectContaining({
	                            initiator: 'sdk'
	                        })
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validatePage.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.put('/report/pages/active', testData.page)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validatePage).toHaveBeenCalledWith(testData.page);
	                        expect(mockReportEmbed_1.spyApp.setActivePage).toHaveBeenCalledWith(testData.page);
	                        expect(response.statusCode).toEqual(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateLoad.calls.reset();
	                        mockReportEmbed_1.spyApp.setActivePage.calls.reset();
	                        done();
	                    });
	                });
	            });
	        });
	        describe('filters (report level)', function () {
	            it('GET /report/filters returns 200 with body as array of filters', function (done) {
	                // Arrange
	                var testData = {
	                    filters: [
	                        {
	                            name: "fakeFilter1"
	                        },
	                        {
	                            name: "fakeFilter2"
	                        }
	                    ]
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
	                    // Act
	                    hpm.get('/report/filters')
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.getFilters).toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(200);
	                        expect(response.body).toEqual(testData.filters);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.getFilters.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('POST /report/filters returns 400 if request is invalid', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.reject(null));
	                    // Act
	                    hpm.post('/report/filters', testData.filter)
	                        .catch(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.addFilter).not.toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(400);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('POST /report/filters returns 202 if request is valid', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.post('/report/filters', testData.filter)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        mockReportEmbed_1.spyApp.addFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('POST /report/filters will cause POST /report/events/filterAdded', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    },
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/filterAdded'
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.post('/report/filters', testData.filter)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(response.statusCode).toEqual(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        mockReportEmbed_1.spyApp.addFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/filters returns 400 if request is invalid', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.reject(null));
	                    // Act
	                    hpm.put('/report/filters', testData.filter)
	                        .catch(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.updateFilter).not.toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(400);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/filters returns 202 if request is valid', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.put('/report/filters', testData.filter)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        mockReportEmbed_1.spyApp.updateFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PUT /report/filters will cause POST /report/events/filterUpdated', function (done) {
	                // Arrange
	                var testData = {
	                    filter: {
	                        name: "fakeFilter"
	                    },
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/filterUpdated'
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateFilter.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.put('/report/filters', testData.filter)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(mockReportEmbed_1.spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
	                        expect(response.statusCode).toEqual(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateFilter.calls.reset();
	                        mockReportEmbed_1.spyApp.updateFilter.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('DELETE /report/filters returns 202 if request is valid', function (done) {
	                // Arrange
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    hpm.delete('/report/filters')
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.clearFilters).toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.clearFilters.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('DELETE /report/filters causes POST /report/events/filtersCleared', function (done) {
	                // Arrange
	                var testData = {
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/filtersCleared'
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    hpm.delete('/report/filters')
	                        .then(function (response) {
	                        // Assert
	                        setTimeout(function () {
	                            expect(mockReportEmbed_1.spyApp.clearFilters).toHaveBeenCalled();
	                            expect(response.statusCode).toEqual(202);
	                            expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                            // Cleanup
	                            mockReportEmbed_1.spyApp.clearFilters.calls.reset();
	                            done();
	                        });
	                    });
	                });
	            });
	        });
	        describe('settings', function () {
	            it('PATCH /report/settings returns 400 if request is invalid', function (done) {
	                // Arrange
	                var testData = {
	                    settings: {
	                        filterPaneEnabled: false,
	                        pageNavigationEnabled: false
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateSettings.and.returnValue(Promise.reject(null));
	                    // Act
	                    hpm.patch('/report/settings', testData.settings)
	                        .catch(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
	                        expect(mockReportEmbed_1.spyApp.updateSettings).not.toHaveBeenCalled();
	                        expect(response.statusCode).toEqual(400);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateSettings.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PATCH /report/settings returns 202 if request is valid', function (done) {
	                // Arrange
	                var testData = {
	                    settings: {
	                        filterPaneEnabled: false,
	                        pageNavigationEnabled: false
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateSettings.and.returnValue(Promise.resolve(null));
	                    // Act
	                    hpm.patch('/report/settings', testData.settings)
	                        .then(function (response) {
	                        // Assert
	                        expect(mockReportEmbed_1.spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
	                        expect(mockReportEmbed_1.spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
	                        expect(response.statusCode).toEqual(202);
	                        // Cleanup
	                        mockReportEmbed_1.spyApp.validateSettings.calls.reset();
	                        mockReportEmbed_1.spyApp.updateSettings.calls.reset();
	                        done();
	                    });
	                });
	            });
	            it('PATCH /report/settings causes POST /report/events/settingsUpdated', function (done) {
	                // Arrange
	                var testData = {
	                    settings: {
	                        filterPaneEnabled: false
	                    },
	                    expectedEvent: {
	                        method: 'POST',
	                        url: '/report/events/settingsUpdated',
	                        body: {
	                            initiator: 'sdk',
	                            settings: {
	                                filterPaneEnabled: false,
	                                pageNavigationEnabled: false
	                            }
	                        }
	                    }
	                };
	                iframeLoaded
	                    .then(function () {
	                    mockReportEmbed_1.spyApp.validateSettings.and.returnValue(Promise.resolve(null));
	                    mockReportEmbed_1.spyApp.updateSettings.and.returnValue(Promise.resolve(testData.expectedEvent.body.settings));
	                    // Act
	                    hpm.patch('/report/settings', testData.settings)
	                        .then(function (response) {
	                        // Assert
	                        setTimeout(function () {
	                            expect(mockReportEmbed_1.spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
	                            expect(mockReportEmbed_1.spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
	                            expect(response.statusCode).toEqual(202);
	                            expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
	                            // Cleanup
	                            mockReportEmbed_1.spyApp.validateSettings.calls.reset();
	                            mockReportEmbed_1.spyApp.updateSettings.calls.reset();
	                            done();
	                        });
	                    });
	                });
	            });
	        });
	    });
	    describe('REPORT-to-SDK', function () {
	        describe('pages', function () {
	            it('POST /report/events/pageChanged when user changes page', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        page: {
	                            name: "fakePageName"
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/pageChanged',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/pageChanged', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	        });
	        describe('filters (report level)', function () {
	            it('POST /report/events/filterAdded when user adds filter', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        filter: {
	                            name: "fakeFilter"
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/filterAdded',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/filterAdded', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	            it('POST /report/events/filterUpdated when user changes filter', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        filter: {
	                            name: "fakeFilter"
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/filterUpdated',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/filterUpdated', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	            it('POST /report/events/filterRemoved when user removes filter', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        filter: {
	                            name: "fakeFilter"
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/filterRemoved',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/filterRemoved', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	        });
	        describe('settings', function () {
	            it('POST /report/events/settingsUpdated when user changes settings', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        settings: {
	                            pageNavigationEnabled: true
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/settingsUpdated',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/settingsUpdated', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	        });
	        describe('data selection', function () {
	            it('POST /report/events/dataSelected when user selects data', function (done) {
	                // Arrange
	                var testData = {
	                    event: {
	                        initiator: 'user',
	                        selection: {
	                            data: true
	                        }
	                    }
	                };
	                var testExpectedRequest = {
	                    method: 'POST',
	                    url: '/report/events/dataSelected',
	                    body: testData.event
	                };
	                iframeLoaded
	                    .then(function () {
	                    // Act
	                    iframeHpm.post('/report/events/dataSelected', testData.event)
	                        .then(function (response) {
	                        // Assert
	                        expect(response.statusCode).toBe(202);
	                        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
	                        done();
	                    });
	                    // Cleanup
	                });
	            });
	        });
	    });
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === 'object' && typeof module.exports === 'object') {
	        var v = factory(__webpack_require__(2), exports); if (v !== undefined) module.exports = v;
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./windowPostMessageProxy": 1,
		"./windowPostMessageProxy.js": 1
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
	webpackContext.id = 2;


/***/ },
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === 'object' && typeof module.exports === 'object') {
	        var v = factory(__webpack_require__(6), exports); if (v !== undefined) module.exports = v;
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
	        HttpPostMessage.prototype.delete = function (url, headers) {
	            if (headers === void 0) { headers = {}; }
	            return this.send({
	                method: "DELETE",
	                url: url,
	                headers: headers
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./httpPostMessage": 5,
		"./httpPostMessage.js": 5
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
	webpackContext.id = 6;


/***/ },
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (factory) {
	    if (typeof module === 'object' && typeof module.exports === 'object') {
	        var v = factory(__webpack_require__(10), exports); if (v !== undefined) module.exports = v;
	    }
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	})(function (require, exports) {
	    "use strict";
	    var Router = (function () {
	        function Router(handlers) {
	            this.handlers = handlers;
	        }
	        Router.prototype.get = function (url, handler) {
	            this.registerHandler("GET", url, handler);
	            return this;
	        };
	        Router.prototype.patch = function (url, handler) {
	            this.registerHandler("PATCH", url, handler);
	            return this;
	        };
	        Router.prototype.post = function (url, handler) {
	            this.registerHandler("POST", url, handler);
	            return this;
	        };
	        Router.prototype.put = function (url, handler) {
	            this.registerHandler("PUT", url, handler);
	            return this;
	        };
	        Router.prototype.delete = function (url, handler) {
	            this.registerHandler("DELETE", url, handler);
	            return this;
	        };
	        Router.prototype.registerHandler = function (method, url, handler) {
	            var internalHandler = {
	                test: function (request) {
	                    return (request.method === method
	                        && request.url === url);
	                },
	                handle: function (request) {
	                    var response = new Response();
	                    return Promise.resolve(handler(request, response))
	                        .then(function (x) { return response; });
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
	});
	//# sourceMappingURL=router.js.map

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./router": 9,
		"./router.js": 9
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
	webpackContext.id = 10;


/***/ },
/* 11 */,
/* 12 */,
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Wpmp = __webpack_require__(1);
	var Hpm = __webpack_require__(5);
	var Router = __webpack_require__(9);
	var mockApp_1 = __webpack_require__(14);
	exports.spyApp = mockApp_1.mockAppSpyObj;
	function setup(iframeContentWindow, parentWindow, logMessages) {
	    var parent = parentWindow || iframeContentWindow.parent;
	    var wpmp = new Wpmp.WindowPostMessageProxy(parentWindow, {
	        processTrackingProperties: {
	            addTrackingProperties: Hpm.HttpPostMessage.addTrackingProperties,
	            getTrackingProperties: Hpm.HttpPostMessage.getTrackingProperties,
	        },
	        isErrorMessage: Hpm.HttpPostMessage.isErrorMessage,
	        receiveWindow: iframeContentWindow,
	        name: 'MockAppWindowPostMessageProxy',
	        logMessages: false
	    });
	    var hpm = new Hpm.HttpPostMessage(wpmp, {
	        origin: 'powerbi'
	    });
	    var router = new Router.Router(wpmp);
	    var app = mockApp_1.mockApp;
	    /**
	     * Phase 1
	     */
	    router.post('/report/load', function (req, res) {
	        var loadConfig = req.body;
	        return app.validateLoad(loadConfig)
	            .then(function () {
	            app.load(loadConfig)
	                .then(function () {
	                var initiator = "sdk";
	                hpm.post('/report/events/loaded', {
	                    initiator: initiator
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (error) {
	            res.send(400, error);
	        });
	    });
	    router.get('/report/pages', function (req, res) {
	        return app.getPages()
	            .then(function (pages) {
	            res.send(200, pages);
	        });
	    });
	    router.put('/report/pages/active', function (req, res) {
	        var page = req.body;
	        return app.validatePage(page)
	            .then(function () {
	            app.setActivePage(page)
	                .then(function (page) {
	                var initiator = "sdk";
	                hpm.post('/report/events/pageChanged', {
	                    initiator: initiator,
	                    page: page
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (error) {
	            res.send(400, error);
	        });
	    });
	    /**
	     * Phase 2
	     */
	    router.get('/report/filters', function (req, res) {
	        return app.getFilters()
	            .then(function (filters) {
	            res.send(200, filters);
	        });
	    });
	    router.post('/report/filters', function (req, res) {
	        var filter = req.body;
	        return app.validateFilter(filter)
	            .then(function () {
	            app.addFilter(filter)
	                .then(function (filter) {
	                var initiator = "sdk";
	                hpm.post('/report/events/filterAdded', {
	                    initiator: initiator,
	                    filter: filter
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (error) {
	            res.send(400, error);
	        });
	    });
	    router.put('/report/filters', function (req, res) {
	        var filter = req.body;
	        return app.validateFilter(filter)
	            .then(function () {
	            app.updateFilter(filter)
	                .then(function (filter) {
	                var initiator = "sdk";
	                hpm.post('/report/events/filterUpdated', {
	                    initiator: initiator,
	                    filter: filter
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (error) {
	            res.send(400, error);
	        });
	    });
	    router.delete('/report/filters', function (req, res) {
	        app.clearFilters()
	            .then(function (filter) {
	            var initiator = "sdk";
	            hpm.post('/report/events/filtersCleared', {
	                initiator: initiator,
	                filter: filter
	            });
	        }, function (error) {
	            hpm.post('/report/events/error', error);
	        });
	        res.send(202);
	    });
	    /**
	     * Phase 3
	     */
	    /**
	     * TODO: Investigate the api for getting setting filters at targets.
	     * Currently we are transforming the target into url parameters and then back out of url parameters
	     * although this is more correct for use of HTTP, it might be easier to just keep it as an object in the body.
	     */
	    router.get('/report/pages/:pageName/filters', function (req, res) {
	        var pageName = req.params.pageName;
	        var target = {
	            type: "page",
	            name: pageName
	        };
	        return app.getFilters(target)
	            .then(function (filters) {
	            res.send(200, filters);
	        });
	    });
	    router.post('/report/pages/:pageName/filters', function (req, res) {
	        var filter = req.body;
	        var pageName = req.params.pageName;
	        var target = {
	            type: "page",
	            name: pageName
	        };
	        return app.validateFilter(filter)
	            .then(function () {
	            app.addFilter(filter, target)
	                .then(function (filter) {
	                var initiator = "sdk";
	                hpm.post("/report/pages/" + pageName + "/events/filterAdded", {
	                    initiator: initiator,
	                    filter: filter
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (errors) {
	            res.send(400, errors);
	        });
	    });
	    router.put('/report/pages/:pageName/filters', function (req, res) {
	        var filter = req.body;
	        var pageName = req.params.pageName;
	        var target = {
	            type: "page",
	            name: pageName
	        };
	        return app.validateFilter(filter)
	            .then(function () {
	            app.updateFilter(filter, target)
	                .then(function (filter) {
	                var initiator = "sdk";
	                hpm.post("/report/pages/" + pageName + "/events/filterUpdated", {
	                    initiator: initiator,
	                    filter: filter
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (errors) {
	            res.send(400, errors);
	        });
	    });
	    router.put('/report/filters', function (req, res) {
	        var filter = req.body;
	        return app.validateFilter(filter)
	            .then(function () {
	            app.updateFilter(filter)
	                .then(function (filter) {
	                var initiator = "sdk";
	                hpm.post("/report/events/filterUpdated", {
	                    initiator: initiator,
	                    filter: filter
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (errors) {
	            res.send(400, errors);
	        });
	    });
	    router.patch('/report/settings', function (req, res) {
	        var settings = req.body;
	        return app.validateSettings(settings)
	            .then(function () {
	            app.updateSettings(settings)
	                .then(function (updatedSettings) {
	                var initiator = "sdk";
	                hpm.post("/report/events/settingsUpdated", {
	                    initiator: initiator,
	                    settings: updatedSettings
	                });
	            }, function (error) {
	                hpm.post('/report/events/error', error);
	            });
	            res.send(202);
	        }, function (errors) {
	            res.send(400, errors);
	        });
	    });
	    /**
	     * Phase 4
	     */
	    // No work for router
	    /**
	     * Phase 5
	     */
	    router.get('/report/data', function (req, res) {
	        var target = {
	            type: 'visual',
	            visual: "xyz?"
	        };
	        return app.exportData(target)
	            .then(function (data) {
	            res.send(200, data);
	        });
	    });
	    return hpm;
	}
	exports.setup = setup;


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * These are the methods that should be implemented and exposed in the PowerBI angular application which can be invoked from the ReportEmbed iframe.
	 */
	"use strict";
	exports.mockAppSpyObj = {
	    // Load
	    load: jasmine.createSpy("load").and.returnValue(Promise.resolve(null)),
	    validateLoad: jasmine.createSpy("validateLoad").and.returnValue(Promise.resolve(null)),
	    // Settings
	    updateSettings: jasmine.createSpy("updateSettings").and.returnValue(Promise.resolve(null)),
	    validateSettings: jasmine.createSpy("validateSettings").and.returnValue(Promise.resolve(null)),
	    // Pages
	    getPages: jasmine.createSpy("getPages").and.returnValue(Promise.resolve(null)),
	    setActivePage: jasmine.createSpy("setActivePage").and.returnValue(Promise.resolve(null)),
	    togglePageNavigation: jasmine.createSpy("togglePageNavigation").and.returnValue(Promise.resolve(null)),
	    validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
	    // Filters
	    validateFilter: jasmine.createSpy("validateFilter").and.returnValue(Promise.resolve(null)),
	    validateTarget: jasmine.createSpy("validateTarget").and.returnValue(Promise.resolve(null)),
	    getFilters: jasmine.createSpy("getFilters").and.returnValue(Promise.resolve(null)),
	    addFilter: jasmine.createSpy("addFilter").and.returnValue(Promise.resolve(null)),
	    updateFilter: jasmine.createSpy("updateFilter").and.returnValue(Promise.resolve(null)),
	    removeFilter: jasmine.createSpy("removeFilter").and.returnValue(Promise.resolve(null)),
	    clearFilters: jasmine.createSpy("clearFilters").and.returnValue(Promise.resolve(null)),
	    toggleFilterPane: jasmine.createSpy("toggleFilterPane").and.returnValue(Promise.resolve(null)),
	    // Other
	    exportData: jasmine.createSpy("exportData").and.returnValue(Promise.resolve(null))
	};
	exports.mockApp = exports.mockAppSpyObj;


/***/ }
/******/ ]);
//# sourceMappingURL=protocol.e2e.spec.js.map