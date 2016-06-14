import * as core from '../src/core';
import * as report from '../src/report';
import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import * as filters from 'powerbi-filters';
import { spyApp, setup } from './utility/mockReportEmbed';
import * as factories from '../src/factories';
import { spyWpmp } from './utility/mockWpmp';
import { spyHpm } from './utility/mockHpm';
import { spyRouter } from './utility/mockRouter';

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
    iframeHpm = setup(iframe.contentWindow, window, logMessages, 'ProtocolMockAppWpmp');
    
    // Register SDK side WPMP
    wpmp = factories.wpmpFactory(iframe.contentWindow, 'HostProxyDefaultNoHandlers', logMessages);
    hpm = factories.hpmFactory(wpmp, 'testVersion');
    const router = factories.routerFactory(wpmp);

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

  describe('HPM-to-MockApp', function () {
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
            hpm.post<report.IError>('/report/load', testData.load)
              .then(() => {
                expect(false).toBe(true);
                spyApp.validateLoad.calls.reset();
                done();
              })
              .catch(response => {
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
            hpm.post<void>('/report/load', testData.load)
              .then(response => {
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
            hpm.post<void>('/report/load', testData.load)
              .then(response => {
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
            hpm.get<report.IPage[]>('/report/pages')
              .then(response => {
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
            name: "fakeName"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.reject(null));
        // Act
            hpm.put<void>('/report/pages/active', testData.page)
              .catch(response => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setPage).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
        // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.setPage.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/active returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          page: {
            name: "fakeName"
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.resolve(null));

        // Act
            hpm.put<void>('/report/pages/active', testData.page)
              .then(response => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.setPage.calls.reset();
                done();
              });
          });
      });
      
      it('PUT /report/pages/active causes POST /report/events/pageChanged', function (done) {
        // Arrange
        const testData = {
          page: {
            name: "fakeName"
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
            hpm.put<void>('/report/pages/active', testData.page)
              .then(response => {
        // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateLoad.calls.reset();
                spyApp.setPage.calls.reset();
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
            hpm.get<filters.IFilter[]>('/report/filters')
              .then(response => {
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
            hpm.post<report.IError>('/report/filters', testData.filter)
              .catch(response => {
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
            hpm.post<void>('/report/filters', testData.filter)
              .then(response => {
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
            hpm.post<void>('/report/filters', testData.filter)
              .then(response => {
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
            hpm.put<report.IError>('/report/filters', testData.filter)
              .catch(response => {
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
            hpm.put<void>('/report/filters', testData.filter)
              .then(response => {
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
            hpm.put<void>('/report/filters', testData.filter)
              .then(response => {
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
      
      it('DELETE /report/allfilters returns 202 if request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
        // Act
            hpm.delete<void>('/report/allfilters', null)
              .then(response => {
        // Assert
                expect(spyApp.clearFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.clearFilters.calls.reset();
                done();
              });
          });
      });
      
      it('DELETE /report/allfilters causes POST /report/events/filtersCleared', function (done) {
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
            hpm.delete<void>('/report/allfilters', null)
              .then(response => {
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

      it('DELETE /report/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          },
          expectedErrors: [
            {
              message: 'invalid filter'
            }
          ]
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
            hpm.delete<report.IError[]>('/report/filters', testData.filter)
              .catch(response => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                expect(response.body).toEqual(testData.expectedErrors);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });
      
      it('DELETE /report/filters returns 202 if request is valid', function (done) {
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
            hpm.delete<void>('/report/filters', testData.filter)
              .then(response => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.removeFilter.calls.reset();
                done();
              });
          });
      });
      
      it('DELETE /report/filters will cause POST /report/events/filterRemoved', function (done) {
        // Arrange
        const testData = {
          filter: {
            name: "fakeFilter"
          },
          expectedEvent: {
            method: 'POST',
            url: '/report/events/filterRemoved'
          }
        };
        
        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

        // Act
            hpm.delete<void>('/report/filters', testData.filter)
              .then(response => {
        // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.removeFilter.calls.reset();
                done();
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
            hpm.get<filters.IFilter[]>('/report/pages/xyz/filters')
              .then(response => {
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
            hpm.post<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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
            hpm.post<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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
            hpm.post<void>('/report/pages/xyz/filters', testData.filter)
              .then(response => {
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
            hpm.post<void>('/report/pages/xyz/filters', testData.filter)
              .then(response => {
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
            hpm.put<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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
            hpm.put<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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
            hpm.put<void>('/report/pages/xyz/filters', testData.filter)
              .then(response => {
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
            hpm.put<void>('/report/pages/xyz/filters', testData.filter)
              .then(response => {
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
      it('DELETE /report/pages/xyz/filters returns 400 if target is invalid', function (done) {
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
            hpm.delete<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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

      it('DELETE /report/pages/xyz/filters returns 400 if filter is invalid', function (done) {
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
            hpm.delete<report.IError[]>('/report/pages/xyz/filters', testData.filter)
              .catch(response => {
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
      
      it('DELETE /report/pages/xyz/filters returns 202 if request is valid', function (done) {
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
            hpm.delete<void>('/report/pages/xyz/filters', testData.filter)
              .then(response => {
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
            type: "visual",
            id: "xyz"
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
              .then(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.post<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.post<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.post<void>('/report/visuals/xyz/filters', testData.filter)
              .then(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.post<void>('/report/visuals/xyz/filters', testData.filter)
              .then(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.put<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.put<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.put<void>('/report/visuals/xyz/filters', testData.filter)
              .then(response => {
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
            type: "visual",
            id: "xyz"
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
            hpm.put<void>('/report/visuals/xyz/filters', testData.filter)
              .then(response => {
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
      it('DELETE /report/visuals/xyz/filters returns 400 if target is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "visual",
            id: "xyz"
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
            hpm.delete<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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

      it('DELETE /report/visuals/xyz/filters returns 400 if filter is invalid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "visual",
            id: "xyz"
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
            hpm.delete<report.IError[]>('/report/visuals/xyz/filters', testData.filter)
              .catch(response => {
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
      
      it('DELETE /report/visuals/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          expectedTarget: {
            type: "visual",
            id: "xyz"
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
            hpm.delete<void>('/report/visuals/xyz/filters', testData.filter)
              .then(response => {
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
            hpm.patch<report.IError[]>('/report/settings', testData.settings)
              .catch(response => {
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
            hpm.patch<void>('/report/settings', testData.settings)
              .then(response => {
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
            hpm.patch<void>('/report/settings', testData.settings)
              .then(response => {
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
  
  describe('MockApp-to-HPM', function () {
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
            iframeHpm.post<void>('/report/events/pageChanged', testData.event)
              .then(response => {
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
              .then(response => {
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
              .then(response => {
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
              .then(response => {
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
              .then(response => {
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
              .then(response => {
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

describe('SDK-to-HPM', function () {
  let logMessages = (window.__karma__.config.args[0] === 'logMessages');
  let $element: JQuery;
  let iframe: HTMLIFrameElement;
  let powerbi: core.PowerBi;
  let report: report.Report;

  beforeAll(function () {
    const spyHpmFactory: factories.IHpmFactory = () => {
      return <Hpm.HttpPostMessage><any>spyHpm;
    };
    const noop: factories.IWpmpFactory = () => {
      return <Wpmp.WindowPostMessageProxy>null;
    };

    const spyRouterFactory: factories.IRouterFactory = () => {
      return <Router.Router><any>spyRouter;
    };

    powerbi = new core.PowerBi(spyHpmFactory, noop, spyRouterFactory);

    $element = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/e2e/utility/noop.html";
    const embedConfiguration = {
      type: "report",
      reportId: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc,
      wpmpName: 'SDK-to-HPM report wpmp'
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];

    // Reset load handler
    spyHpm.post.calls.reset();
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
  });

  afterEach(function () {
    spyHpm.get.calls.reset();
    spyHpm.post.calls.reset();
    spyHpm.patch.calls.reset();
    spyHpm.put.calls.reset();
    spyHpm.delete.calls.reset();

    spyRouter.get.calls.reset();
    spyRouter.post.calls.reset();
    spyRouter.patch.calls.reset();
    spyRouter.put.calls.reset();
    spyRouter.delete.calls.reset();
  });

  describe('load', function () {
    it('report.load() sends POST /report/load with configuration in body', function () {
      // Arrange
      const testData = {
        embedConfiguration: {
          id: 'fakeId',
          accessToken: 'fakeToken'
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.load(testData.embedConfiguration);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.embedConfiguration);
    });

    it('report.load() returns promise that rejects with validation error if the load configuration is invalid', function (done) {
      // Arrange
      const testData = {
        embedConfiguration: {
          id: 'fakeId',
          accessToken: 'fakeToken'
        },
        errorResponse: {
          body: {
            message: "invalid configuration object"
          }
        }
      };

      spyHpm.post.and.returnValue(Promise.reject(testData.errorResponse));

      // Act
      report.load(testData.embedConfiguration)
        .catch(error => {
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.embedConfiguration);
          expect(error).toEqual(testData.errorResponse.body);
      // Assert
          done();
        });
    });

    it('report.load() returns promise that resolves with null if the report load successful', function (done) {
      // Arrange
      const testData = {
        embedConfiguration: {
          id: 'fakeId',
          accessToken: 'fakeToken'
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.load(testData.embedConfiguration)
        .then(response => {
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.embedConfiguration);
          expect(response).toEqual(null);
      // Assert
          done();
        });
    });
  });

  describe('pages', function () {
    it('report.getPages() sends GET /report/pages', function () {
      // Arrange

      // Act
      report.getPages();

      // Assert
      expect(spyHpm.get).toHaveBeenCalledWith('/report/pages');
    });

    it('report.getPages() return promise that rejects with server error if there was error getting pages', function (done) {
      // Arrange
      const testData = {
        expectedError: {
          body: {
            message: 'internal server error'
          }
        }
      };

      spyHpm.get.and.returnValue(Promise.reject(testData.expectedError));

      // Act
      report.getPages()
        .catch(error => {
      // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages');
          expect(error).toEqual(testData.expectedError.body);
          done();
        });
    });

    it('report.getPages() returns promise that resolves with list of page names', function (done) {
      // Arrange
      const testData = {
        expectedResponse: {
          body: [
            'page1',
            'page2'
          ]
        }
      };

      spyHpm.get.and.returnValue(Promise.resolve(testData.expectedResponse));

      // Act
      report.getPages()
        .then(pages => {
      // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages');
          expect(pages).toEqual(testData.expectedResponse.body);
          done();
        });
    });
  });

  describe('filters (report level)', function () {
    it('report.addFilter(filter) sends POST /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      
      // Act
      report.addFilter(testData.filter);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter);
    });

    it('report.addFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.post.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.addFilter(testData.filter)
        .catch(errors => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter)
        .then(response => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter) sends PUT /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      
      // Act
      report.updateFilter(testData.filter);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter);
    });

    it('report.updateFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.updateFilter(testData.filter)
        .catch(errors => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter)
        .then(response => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter) sends DELETE /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      
      // Act
      report.removeFilter(testData.filter);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter);
    });

    it('report.removeFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.delete.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.removeFilter(testData.filter)
        .catch(errors => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter)
        .then(response => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });
  });

  describe('filters (page level)', function () {
    it('report.addFilter(filter, target) sends POST /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      
      // Act
      report.addFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
    });

    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.post.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.addFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter, target) sends PUT /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };
      
      // Act
      report.updateFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter, target) sends DELETE /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      
      // Act
      report.removeFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.delete.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });
  });
  
  describe('filters (visual level)', function () {
    it('report.addFilter(filter, target) sends POST /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      // Act
      report.addFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
    });

    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.post.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.addFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter, target) sends PUT /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      // Act
      report.updateFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter, target) sends DELETE /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      // Act
      report.removeFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedErrors: {
          body: [
            {
              message: 'target is invalid, missing property x'
            }
          ]
        }
      };

      spyHpm.delete.and.returnValue(Promise.reject(testData.expectedErrors));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .catch(errors => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .then(response => {
      // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter);
          expect(response).toEqual(null);
          done();
        });
    });
  });

  describe('settings', function () {
    it('report.updateSettings(settings) sends PATCH /report/settings with settings object', function () {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false
        }
      };

      // Act
      report.updateSettings(testData.settings);

      // Assert
      expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings);
    });

    it('report.updateSettings(setting) returns promise that rejects with validation error if object is invalid', function (done) {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false
        },
        expectedError: {
          body: [
            {
              message: 'settings object is invalid'
            }
          ]
        }
      };

      spyHpm.patch.and.returnValue(Promise.reject(testData.expectedError));

      // Act
      report.updateSettings(testData.settings)
        .catch(errors => {

      // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings);
          expect(errors).toEqual(testData.expectedError.body);
          done()
        });
    });

    it('report.updateSettings(settings) returns promise that resolves with null if requst is valid and accepted', function (done) {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false
        }
      };

      spyHpm.patch.and.returnValue(Promise.resolve(null));

      // Act
      report.updateSettings(testData.settings)
        .then(response => {

      // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings);
          expect(response).toEqual(null);
          done()
        });
    });
  });

  describe('SDK-to-Router (Event subscription)', function () {
    /**
     * This test should likely be moved to mock app section or removed since it is already covered.
     * The validation of supported events should likely happen by powerbi instead of by the SDK
     * since this is maitanence problem
     */
    it(`report.on(eventName, handler) should throw error if eventName is not supported`, function () {
      // Arrange
      const testData = {
        eventName: 'xyz',
        handler: jasmine.createSpy('handler')
      };
      
      // Act
      const attemptToSubscribeToEvent = () => {
        report.on(testData.eventName, testData.handler);
      };

      // Assert
      expect(attemptToSubscribeToEvent).toThrowError();
    });

    it(`report.on(eventName, handler) should register handler with router.post('/report/events/\${eventName}', (req, res) => { handler(req.body) })`, function () {
      // Arrange
      const testData = {
        eventName: 'pageChanged',
        handler: jasmine.createSpy('handler')
      };
      
      // Act
      report.on(testData.eventName, testData.handler);

      // Assert
      expect(spyRouter.post).toHaveBeenCalledWith(`/report/events/${testData.eventName}`, jasmine.any(Function));
    });
  });
});

describe('SDK-to-WPMP', function () {
  let $element: JQuery;
  let iframe: HTMLIFrameElement;
  let powerbi: core.PowerBi;
  let report: report.Report;

  beforeAll(function () {
    const spyWpmpFactory: factories.IWpmpFactory = (window, name?: string, logMessages?: boolean) => {
      return <Wpmp.WindowPostMessageProxy><any>spyWpmp;
    };

    powerbi = new core.PowerBi(factories.hpmFactory, spyWpmpFactory, factories.routerFactory);

    $element = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/e2e/utility/noop.html";
    const embedConfiguration = {
      type: "report",
      reportId: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc,
      wpmpName: 'SDK-to-WPMP report wpmp'
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];

    // Reset load handler
    spyHpm.post.calls.reset();
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
  });

  afterEach(function () {
    spyHpm.get.calls.reset();
    spyHpm.post.calls.reset();
    spyHpm.patch.calls.reset();
    spyHpm.put.calls.reset();
    spyHpm.delete.calls.reset();

    spyRouter.get.calls.reset();
    spyRouter.post.calls.reset();
    spyRouter.patch.calls.reset();
    spyRouter.put.calls.reset();
    spyRouter.delete.calls.reset();
  });

  describe('Event handlers', function () {
    it(`handler passed to report.on(eventName, handler) is called when POST /report/events/\${eventName} is received`, function (done) {
      // Arrange
      const testData = {
        eventName: 'pageChanged',
        handler: jasmine.createSpy('handler'),
        pageChangedEvent: {
          data: {
            method: 'POST',
            url: '/report/events/pageChanged',
            body: {
              name: "page1"
            }
          }
        }
      };
      
      report.on(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.pageChangedEvent);

      // Assert
      expect(spyWpmp.addHandler).toHaveBeenCalled();

      expect(testData.handler).toHaveBeenCalledWith(testData.pageChangedEvent.data.body);
      done();
    });
  });
});

describe('SDK-to-MockApp', function () {
  let logMessages = (window.__karma__.config.args[0] === 'logMessages');
  let $element: JQuery;
  let iframe: HTMLIFrameElement;
  let iframeHpm: Hpm.HttpPostMessage;
  let iframeLoaded: Promise<void>;
  let powerbi: core.PowerBi;
  let report: report.Report;

  beforeAll(function () {
    powerbi = new core.PowerBi(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

    $element = $(`<div class="powerbi-report-container2"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/e2e/utility/noop.html";
    const embedConfiguration = {
      type: "report",
      id: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc,
      wpmpName: 'SDK-to-MockApp report wpmp'
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];

    // Register Iframe side
    iframeHpm = setup(iframe.contentWindow, window, logMessages, 'IntegrationMockAppWpmp');

    // Reset load handler
    spyApp.validateLoad.calls.reset();
    spyApp.reset();

    iframeLoaded = new Promise<void>((resolve, reject) => {
      iframe.addEventListener('load', () => {
        resolve(null);
      });
    });
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
  });

  afterEach(function () {
    spyApp.reset();
  });

  describe('load', function () {
    it(`report.load() returns promise that rejects with validation errors if load configuration is invalid`, function (done) {
      /**
       * TODO: Add settings to load config
       */

      // Arrange
      const testData = {
        loadConfig: {
          id: 'fakeReportId',
          accessToken: 'fakeAccessToken'
        },
        expectedErrors: [
          {
            message: 'invalid load config'
          }
        ]
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateLoad.and.returnValue(Promise.reject(testData.expectedErrors));
      // Act
            report.load(testData.loadConfig)
              .catch(errors => {
      // Assert
                expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.loadConfig);
                expect(spyApp.load).not.toHaveBeenCalled();
                expect(errors).toEqual(testData.expectedErrors);
                done();
              });
          });
    });

    it('report.load() returns promise that resolves with null if the report load successful', function (done) {
      // Arrange
      const testData = {
        loadConfig: {
          id: 'fakeReportId',
          accessToken: 'fakeAccessToken'
        },
        expectedErrors: [
          {
            message: 'invalid load config'
          }
        ]
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateLoad.and.returnValue(Promise.resolve(null));
            spyApp.load.and.returnValue(Promise.resolve(null));
      // Act
            report.load(testData.loadConfig)
              .then(response => {
      // Assert
                expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.loadConfig);
                expect(spyApp.load).toHaveBeenCalledWith(testData.loadConfig);
                done();
              });
          });
    });
  });

  describe('pages', function () {
    it('report.getPages() return promise that rejects with server error if there was error getting pages', function (done) {
      // Arrange
      const testData = {
        expectedError: {
          message: 'internal server error'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.getPages.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.getPages()
              .catch(error => {
      // Assert
                expect(spyApp.getPages).toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.getPages() returns promise that resolves with list of page names', function (done) {
      // Arrange
      const testData = {
        pages: [
          {
            name: "page1",
            displayName: "Page 1"
          }
        ]
      };
      
      iframeLoaded
          .then(() => {
            spyApp.getPages.and.returnValue(Promise.resolve(testData.pages));
      // Act
            report.getPages()
              .then(pages => {
      // Assert
                expect(spyApp.getPages).toHaveBeenCalled();
                expect(pages).toEqual(testData.pages);
                done();
              });
          });
    });
  });

  describe('filters (report level)', function () {
    it('report.addFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedError: {
          message: 'invalid filter'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.addFilter(testData.filter)
              .catch(error => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.addFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.addFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.addFilter(testData.filter)
              .then(response => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
                done();
              });
          });
    });

    it('report.updateFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedError: {
          message: 'invalid filter'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.updateFilter(testData.filter)
              .catch(error => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.updateFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.updateFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.updateFilter(testData.filter)
              .then(response => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
                done();
              });
          });
    });

    it('report.removeFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        expectedError: {
          message: 'invalid filter'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.removeFilter(testData.filter)
              .catch(error => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.removeFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.removeFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.removeFilter(testData.filter)
              .then(response => {
      // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter);
                done();
              });
          });
    });

    it('report.removeAllFilters() returns promise that resolves with null if the request was accepted', function (done) {
      // Arrange
      iframeLoaded
          .then(() => {
            spyApp.clearFilters.and.returnValue(Promise.resolve(null));
      // Act
            report.removeAllFilters()
              .then(response => {
      // Assert
                expect(spyApp.clearFilters).toHaveBeenCalled();
                done();
              });
          });
    });
  });

  describe('filters (page level)', function () {
    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.addFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.addFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.addFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.updateFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.updateFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.updateFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.removeFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.removeFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.removeFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });
  });
  
  describe('filters (visual level)', function () {
    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.addFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.addFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.addFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.addFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.updateFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.updateFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.updateFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.updateFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        },
        expectedError: {
          message: 'invalid target'
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.reject(testData.expectedError));
      // Act
            report.removeFilter(testData.filter, testData.target)
              .catch(error => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).not.toHaveBeenCalled();
                expect(spyApp.removeFilter).not.toHaveBeenCalled();
                expect(error).toEqual(testData.expectedError);
                done();
              });
          });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new filters.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <report.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.removeFilter.and.returnValue(Promise.resolve(null));
      // Act
            report.removeFilter(testData.filter, testData.target)
              .then(response => {
      // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.target);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter, testData.target);
                done();
              });
          });
    });
  });

  describe('settings', function () {
    it('report.updateSettings(setting) returns promise that rejects with validation error if object is invalid', function (done) {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false
        },
        expectedErrors: [
          {
            message: 'invalid target'
          }
        ]
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.reject(testData.expectedErrors));
      // Act
            report.updateSettings(testData.settings)
              .catch(errors => {
      // Assert
                expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                expect(spyApp.updateSettings).not.toHaveBeenCalled();
                expect(errors).toEqual(testData.expectedErrors);
                done();
              });
          });
    });

    it('report.updateSettings(settings) returns promise that resolves with null if requst is valid and accepted', function (done) {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false
        },
        expectedErrors: [
          {
            message: 'invalid target'
          }
        ]
      };
      
      iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.resolve(null));
            spyApp.updateSettings.and.returnValue(Promise.resolve(null));
      // Act
            report.updateSettings(testData.settings)
              .then(response => {
      // Assert
                expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
                done();
              });
          });
    });
  });

  describe('SDK-to-Router (Event subscription)', function () {
    it(`report.on(eventName, handler) should throw error if eventName is not supported`, function () {
      // Arrange
      const testData = {
        eventName: 'xyz',
        handler: jasmine.createSpy('handler')
      };
      
      // Act
      const attemptToSubscribeToEvent = () => {
        report.on(testData.eventName, testData.handler);
      };

      // Assert
      expect(attemptToSubscribeToEvent).toThrowError();
    });

    it(`report.on(eventName, handler) should register handler and be called when POST /report/events/\${eventName} is received`, function () {
      // Arrange
      const testData = {
        eventName: 'pageChanged',
        handler: jasmine.createSpy('handler'),
        simulatedPageChangeBody: {
          initiator: 'sdk',
          page: {
            name: 'page1',
            displayName: 'Page 1'
          }
        }
      };
      
      report.on(testData.eventName, testData.handler);

      // Act
      iframeHpm.post('/report/events/pageChanged', testData.simulatedPageChangeBody)
        .then(response => {
      // Assert
          expect(testData.handler).toHaveBeenCalledWith(testData.simulatedPageChangeBody);
        });
    });
  });
});