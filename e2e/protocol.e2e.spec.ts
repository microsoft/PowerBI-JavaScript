import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import { spyApp, setup } from './utility/mockReportEmbed';

declare global {
  interface Window {
    __karma__: any;
  }
}

describe('Protocol', function () {
  let logMessages = (window.__karma__.config.args[0] === 'logMessages');
  let hpm: Hpm.HttpPostMessage;
  let wpmp: Wpmp.WindowPostMessageProxy;
  let iframe: HTMLIFrameElement;
  let iframeHpm: Hpm.HttpPostMessage;
  let iframeLoaded: Promise<void>;
  
  let handler: Wpmp.IMessageHandler;
  let spyHandler: {
    test: jasmine.Spy,
    handle: jasmine.Spy
  };
  
  beforeAll(function () {
    const iframeSrc = "base/e2e/utility/noop.html";
    const $iframe = $(`<iframe src="${iframeSrc}" id="testiframe"></iframe>`).appendTo(document.body);
    iframe = <HTMLIFrameElement>$iframe.get(0);
    
    // Register Iframe side
    iframeHpm = setup(iframe.contentWindow, window, logMessages);
    
    // Register SDK side WPMP
    wpmp = new Wpmp.WindowPostMessageProxy(iframe.contentWindow, {
      processTrackingProperties: {
          addTrackingProperties: Hpm.HttpPostMessage.addTrackingProperties,
          getTrackingProperties: Hpm.HttpPostMessage.getTrackingProperties,
      },
      isErrorMessage: Hpm.HttpPostMessage.isErrorMessage,
      name: 'HostProxyDefaultNoHandlers',
      logMessages
    });
    hpm = new Hpm.HttpPostMessage(wpmp, {
      origin: 'sdk',
      'sdk-type': 'js',
      'sdk-version': '2.0.0'
    });
    const router = new Router.Router(wpmp);
    router.post('/report/events/loaded', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/pageChanged', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/filterAdded', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/filterUpdated', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/filterRemoved', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/filtersCleared', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/settingsUpdated', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    router.post('/report/events/dataSelected', (req, res) => {
      handler.handle(req);
      res.send(202);
    });
    
    handler = {
      test: jasmine.createSpy("testSpy").and.returnValue(true),
      handle: jasmine.createSpy("handleSpy").and.callFake(function (message: any) {
        message.handled = true;
        return message;
      })
    };
    
    spyHandler = <any>handler;
    wpmp.addHandler(handler);

    iframeLoaded = new Promise<void>((resolve, reject) => {
      iframe.addEventListener('load', () => {
        resolve(null);
      });
    });
  });
  
  afterAll(function () { 
    //wpmp.stop();
  });
  
  beforeEach(() => {
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
        const testData = {
          load: {
            reportId: "fakeId",
            accessToken: "fakeToken",
            options: {
            }
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateLoad.and.returnValue(Promise.reject(null));
            
        // Act
            hpm.post('/report/load', testData.load)
              .then(() => {
                expect(false).toBe(true);
                spyApp.validateLoad.calls.reset();
                done();
              })
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
                expect(spyApp.load).not.toHaveBeenCalledWith(testData.load);
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validateLoad.calls.reset();
                done();
              });
          });
      });
      
      it('POST /report/load returns 202 if the request is valid', function (done) {
        // Arrange
        const testData = {
          load: {
            reportId: "fakeId",
            accessToken: "fakeToken",
            options: {
            }
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateLoad.and.returnValue(Promise.resolve(null));
        // Act
            hpm.post('/report/load', testData.load)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
                expect(spyApp.load).toHaveBeenCalledWith(testData.load);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateLoad.calls.reset();
                spyApp.load.calls.reset();
                done();
              });
          });
      });
      
      it('POST /report/load causes POST /report/events/loaded', function (done) {
        // Arrange
        const testData = {
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
          .then(() => {
            spyApp.load.and.returnValue(Promise.resolve(testData.load));
            
        // Act
            hpm.post('/report/load', testData.load)
              .then((response: Hpm.IResponse) => {
                setTimeout(() => {
        // Assert
                  expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
                  expect(spyApp.load).toHaveBeenCalledWith(testData.load);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                  spyApp.validateLoad.calls.reset();
                  spyApp.load.calls.reset();
                  done();
                });
              });
          });
      });
    });
    
    describe('pages', function () {
      
      it('GET /report/pages returns 200 with body as array of pages', function (done) {
        // Arrange
        const testData = {
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
          .then(() => {
            spyApp.getPages.and.returnValue(Promise.resolve(testData.expectedPages));
        // Act
            hpm.get('/report/pages')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.getPages).toHaveBeenCalled();
                const pages = response.body;
                expect(pages).toEqual(testData.expectedPages);
        // Cleanup
                spyApp.getPages.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/active returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          page: {
            name: "fakeName",
            displayName: "fakeDisplayName"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.reject(null));
        // Act
            hpm.put('/report/pages/active', testData.page)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setActivePage).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.setActivePage.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/active returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          page: {
            name: "fakeName",
            displayName: "fakeDisplayName"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/pages/active', testData.page)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setActivePage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.setActivePage.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/active causes POST /report/events/pageChanged', function (done) {
        // Arrange
        const testData = {
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
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/pages/active', testData.page)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setActivePage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateLoad.calls.reset();
                spyApp.setActivePage.calls.reset();
                done();
              });
          });
      });
    });
    
    describe('filters (report level)', function () {
      
      it('GET /report/filters returns 200 with body as array of filters', function (done) {
        // Arrange
        const testData = {
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
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            
        // Act
            hpm.get('/report/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual(testData.filters);
        // Cleanup
                spyApp.getFilters.calls.reset();
                done();
              });
          });
      });
      
      it('POST /report/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

        // Act
            hpm.post('/report/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('POST /report/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });
      
      it('POST /report/filters will cause POST /report/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/events/filterAdded'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

        // Act
            hpm.put('/report/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/filters will cause POST /report/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/events/filterUpdated'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('DELETE /report/filters returns 202 if request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
        // Act
            hpm.delete('/report/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.clearFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.clearFilters.calls.reset();
                done();
              });
          });
      });
      
      it('DELETE /report/filters causes POST /report/events/filtersCleared', function (done) {
        // Arrange
        const testData = {
          expectedEvent: {
            method: 'POST',
            url: '/report/events/filtersCleared'
          }
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            hpm.delete('/report/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                setTimeout(() => {
                  expect(spyApp.clearFilters).toHaveBeenCalled();
                  expect(response.statusCode).toEqual(202);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                  spyApp.clearFilters.calls.reset();
                  done();
                })
              });
          });
      });
    });

    describe('filters (page level)', function () {
      it('GET /report/pages/xyz/filters returns 200 with body as array of filters', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
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
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            
        // Act
            hpm.get('/report/pages/xyz/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.getFilters).toHaveBeenCalledWith(testData.expectedTarget);
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual(testData.filters);
        // Cleanup
                spyApp.getFilters.calls.reset();
                done();
              });
          });
      });

      it('POST /report/pages/xyz/filters returns 400 if page name is invalid', function (done) {
        // Arrange
        const testData = {
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

        // Act
            hpm.post('/report/pages/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/pages/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.post('/report/pages/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/pages/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/pages/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/pages/xyz/filters will cause POST /report/pages/xyz/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/pages/xyz/events/filterAdded'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/pages/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/filters returns 400 if page name is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
            hpm.put('/report/pages/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "Filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.put('/report/pages/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/pages/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/xyz/filters will cause POST /report/pages/xyz/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/pages/xyz/events/filterUpdated'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/pages/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });

      /**
       * TODO: Sending targeted removal of filter should use DELETE as http method, but if conforming to REST
       * design DELETE reqeusts should specify filter identity within URL which cannot be done with current filter spec unless they each have unique id.
       * 
       * The workaround is to either allow a body to be specified with DELETE requests, or to change to a PUT/POST request
       */
      xit('DELETE /report/pages/xyz/filters returns 400 if target is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
            hpm.delete('/report/pages/xyz/filters')
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                done();
              });
          });
      });

      xit('DELETE /report/pages/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "Filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.delete('/report/pages/xyz/filters')
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      xit('DELETE /report/pages/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.delete('/report/pages/xyz/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.removeFilter.calls.reset();
                done();
              });
          });
      });
    });

    describe('filters (visual level)', function () {
      it('GET /report/visuals/xyz/filters returns 200 with body as array of filters', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
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
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            
        // Act
            hpm.get('/report/visuals/xyz/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.getFilters).toHaveBeenCalledWith(testData.expectedTarget);
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual(testData.filters);
        // Cleanup
                spyApp.getFilters.calls.reset();
                done();
              });
          });
      });

      it('POST /report/visuals/xyz/filters returns 400 if page name is invalid', function (done) {
        // Arrange
        const testData = {
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

        // Act
            hpm.post('/report/visuals/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/visuals/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.post('/report/visuals/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/visuals/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/visuals/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });

      it('POST /report/visuals/xyz/filters will cause POST /report/visuals/xyz/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/visuals/xyz/events/filterAdded'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.post('/report/visuals/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.addFilter.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/visuals/xyz/filters returns 400 if page name is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
            hpm.put('/report/visuals/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/visuals/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "Filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.put('/report/visuals/xyz/filters', testData.filter)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/visuals/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/visuals/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/visuals/xyz/filters will cause POST /report/visuals/xyz/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/visuals/xyz/events/filterUpdated'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put('/report/visuals/xyz/filters', testData.filter)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.updateFilter.calls.reset();
                done();
              });
          });
      });

      /**
       * TODO: Sending targeted removal of filter should use DELETE as http method, but if conforming to REST
       * design DELETE reqeusts should specify filter identity within URL which cannot be done with current filter spec unless they each have unique id.
       * 
       * The workaround is to either allow a body to be specified with DELETE requests, or to change to a PUT/POST request
       */
      xit('DELETE /report/visuals/xyz/filters returns 400 if target is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedErrors: [
            {
              message: "Page does not exist"
            }
          ],
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
            hpm.delete('/report/visuals/xyz/filters')
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                done();
              });
          });
      });

      xit('DELETE /report/visuals/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          expectedFilterError: {
            message: "Filter is invalid"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedFilterError));

        // Act
            hpm.delete('/report/visuals/xyz/filters')
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedFilterError);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      xit('DELETE /report/visuals/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.delete('/report/visuals/xyz/filters')
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateTarget.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.removeFilter.calls.reset();
                done();
              });
          });
      });
    });
    
    describe('settings', function () {
      
      it('PATCH /report/settings returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          settings: {
            filterPaneEnabled: false,
            pageNavigationEnabled: false
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.reject(null));
            
        // Act
            hpm.patch('/report/settings', testData.settings)
              .catch((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                expect(spyApp.updateSettings).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validateSettings.calls.reset();
                done();
              });
          });
      });
      
      it('PATCH /report/settings returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          settings: {
            filterPaneEnabled: false,
            pageNavigationEnabled: false
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.resolve(null));
            
        // Act
            hpm.patch('/report/settings', testData.settings)
              .then((response: Hpm.IResponse) => {
        // Assert
                expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateSettings.calls.reset();
                spyApp.updateSettings.calls.reset();
                done();
              });
          });
      });
      
      it('PATCH /report/settings causes POST /report/events/settingsUpdated', function (done) {
        // Arrange
        const testData = {
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
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.resolve(null));
            spyApp.updateSettings.and.returnValue(Promise.resolve(testData.expectedEvent.body.settings));
            
        // Act
            hpm.patch('/report/settings', testData.settings)
              .then((response: Hpm.IResponse) => {
        // Assert
                setTimeout(() => {
                  expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                  expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
                  expect(response.statusCode).toEqual(202);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                  spyApp.validateSettings.calls.reset();
                  spyApp.updateSettings.calls.reset();
                  
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
        const testData = {
          event: {
            initiator: 'user',
            page: {
              name: "fakePageName"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/pageChanged',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/pageChanged', testData.event)
              .then((response: Hpm.IResponse) => {
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
        const testData = {
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/filterAdded',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/filterAdded', testData.event)
              .then((response: Hpm.IResponse) => {
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
        const testData = {
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/filterUpdated',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/filterUpdated', testData.event)
              .then((response: Hpm.IResponse) => {
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
        const testData = {
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/filterRemoved',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/filterRemoved', testData.event)
              .then((response: Hpm.IResponse) => {
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
        const testData = {
          event: {
            initiator: 'user',
            settings: {
              pageNavigationEnabled: true
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/settingsUpdated',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/settingsUpdated', testData.event)
              .then((response: Hpm.IResponse) => {
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
        const testData = {
          event: {
            initiator: 'user',
            selection: {
              data: true
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: '/report/events/dataSelected',
          body: testData.event
        };
        
        iframeLoaded
          .then(() => {
            
        // Act
            iframeHpm.post('/report/events/dataSelected', testData.event)
              .then((response: Hpm.IResponse) => {
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
