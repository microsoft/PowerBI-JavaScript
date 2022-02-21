// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { WindowPostMessageProxy } from 'window-post-message-proxy';
import { HttpPostMessage } from 'http-post-message';
import { spyApp, setupEmbedMockApp } from './utility/mockEmbed';
import { hpmFactory, routerFactory, wpmpFactory } from '../src/factories';
import { iframeSrc } from './constsants';
import * as models from 'powerbi-models';

describe('Protocol', function () {
  let hpm: HttpPostMessage;
  let wpmp: WindowPostMessageProxy;
  let iframe: HTMLIFrameElement;
  let iframeHpm: HttpPostMessage;

  let spyHandler: {
    test: jasmine.Spy;
    handle: jasmine.Spy;
  };

  beforeEach(async function () {
    iframe = document.createElement('iframe');
    iframe.id = 'protocol';
    iframe.src = iframeSrc;
    document.body.appendChild(iframe);

    await new Promise(resolve => iframe.addEventListener('load', () => resolve(null)));

    // Register Iframe side
    iframeHpm = setupEmbedMockApp(iframe.contentWindow, window, 'ProtocolMockAppWpmp');

    // Register SDK side WPMP
    wpmp = wpmpFactory('HostProxyDefaultNoHandlers',false, iframe.contentWindow);
    hpm = hpmFactory(wpmp, iframe.contentWindow, 'testVersion');

    const router = routerFactory(wpmp);

    spyHandler = {
      test: jasmine.createSpy("testSpy").and.returnValue(true),
      handle: jasmine.createSpy("handleSpy").and.callFake(function (message: any) {
        message.handled = true;
        return message;
      })
    };

    router.post('/reports/:uniqueId/events/:eventName', (req, res) => {
      spyHandler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/pages/:pageName/events/:eventName', (req, res) => {
      spyHandler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/pages/:pageName/visuals/:visualName/events/:eventName', (req, res) => {
      spyHandler.handle(req);
      res.send(202);
    });
  });

  afterEach(function () {
    iframe.remove();
    wpmp.stop();
    spyHandler.test.calls.reset();
    spyHandler.handle.calls.reset();
    spyApp.reset();
  });

  describe('HPM-to-MockApp', function () {
    describe('notfound', function () {
      it('GET request to uknown url returns 404 Not Found', async function () {
        try {
          await hpm.get<any>('route/that/does/not/exist');
        } catch (response) {
          expect(response.statusCode).toEqual(404);
        }
      });

      it('POST request to uknown url returns 404 Not Found', async function () {

        try {
          await hpm.post<any>('route/that/does/not/exist', null);
        } catch (response) {
          expect(response.statusCode).toEqual(404);
        }
      });

      it('PUT request to uknown url returns 404 Not Found', async function () {
        try {
          await hpm.put<any>('route/that/does/not/exist', null);
        } catch (response) {
          expect(response.statusCode).toEqual(404);
        }
      });

      it('PATCH request to uknown url returns 404 Not Found', async function () {
        try {
          await hpm.patch<any>('route/that/does/not/exist', null);
        } catch (response) {
          expect(response.statusCode).toEqual(404);
        }
      });

      it('DELETE request to uknown url returns 404 Not Found', async function () {
        try {
          await hpm.delete<any>('route/that/does/not/exist');
        } catch (response) {
          expect(response.statusCode).toEqual(404);
        }
      });
    });

    describe('create', function () {
      describe('report', function () {
        it('POST /report/create returns 400 if the request is invalid', async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            create: {
              datasetId: "fakeId",
              accessToken: "fakeToken",
            }
          };

          spyApp.validateCreateReport.and.callFake(() => Promise.reject(null));

          // Act
          try {
            await hpm.post<models.IError>('/report/create', testData.create, { uid: testData.uniqueId });
            fail("POST to /report/create should fail");
          } catch (response) {
            // Assert
            expect(spyApp.validateCreateReport).toHaveBeenCalledWith(testData.create);
            expect(response.statusCode).toEqual(400);
          }
        });
      });

      it('POST /report/create returns 202 if the request is valid', async function () {
        // Arrange
        const testData = {
          create: {
            datasetId: "fakeId",
            accessToken: "fakeToken",
          }
        };

        spyApp.validateCreateReport.and.returnValue(Promise.resolve(null));
        // Act
        try {
          const response = await hpm.post<void>('/report/create', testData.create);
          // Assert
          expect(spyApp.validateCreateReport).toHaveBeenCalledWith(testData.create);
          expect(response.statusCode).toEqual(202);
        } catch (error) {
          console.log("hpm.post failed with", error);
          fail("hpm.post");
        }
      });
    });
  });

  describe('load & prepare', function () {
    describe('report', function () {
      for (let action of ['load', 'prepare']) {
        it(`POST /report/${action} returns 400 if the request is invalid`, async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            load: {
              reportId: "fakeId",
              accessToken: "fakeToken",
              options: {
              }
            }
          };

          spyApp.validateReportLoad.and.callFake(() => Promise.reject(null));

          // Act
          try {
            await hpm.post<models.IError>(`/report/${action}`, testData.load, { uid: testData.uniqueId });
            fail(`Post to /report/${action} should fail`);
          } catch (response) {
            // Assert
            expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyApp.reportLoad).not.toHaveBeenCalledWith(testData.load);
            expect(response.statusCode).toEqual(400);
          }
        });

        it(`POST /report/${action} returns 202 if the request is valid`, async function () {
          // Arrange
          const testData = {
            load: {
              reportId: "fakeId",
              accessToken: "fakeToken",
              options: {
              }
            }
          };

          spyApp.validateReportLoad.and.callFake(() => Promise.resolve({}));
          try {
            const response = await hpm.post<void>(`/report/${action}`, testData.load);
            // Assert
            expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
            expect(response.statusCode).toEqual(202);
          } catch (error) {
            console.error(error);
            fail(error);
          }
        });

        it(`POST /report/${action} causes POST /reports/:uniqueId/events/loaded`, async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            load: {
              reportId: "fakeId",
              accessToken: "fakeToken",
              options: {
                navContentPaneEnabled: false
              }
            },
          };
          const testExpectedEvent = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/events/loaded`,
            body: {
              initiator: 'sdk'
            }
          };

          try {
            // Act
            await hpm.post<void>(`/report/${action}`, testData.load, { uid: testData.uniqueId });
            // Assert
            expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
          } catch (error) {
            console.log("hpm.post failed with", error);
            fail("hpm.post failed");
          }
        });

        it(`POST /report/${action} causes POST /reports/:uniqueId/events/error`, async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            load: {
              reportId: "fakeId",
              accessToken: "fakeToken",
              options: {
                navContentPaneEnabled: false
              }
            },
            error: {
              message: "error message"
            }
          };
          const testExpectedEvent = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/events/error`,
            body: testData.error
          };

          spyApp.reportLoad.and.callFake(() => Promise.reject(testData.error));
          try {
            // Act
            await hpm.post<void>(`/report/${action}`, testData.load, { uid: testData.uniqueId });
            expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
            expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
          } catch (error) {
            console.log("hpm pody failed with", error);
            fail("hpm pody failed");
          }
        });
      }
    });

    describe('dashboard', function () {
      it('POST /dashboard/load returns 202 if the request is valid', async function () {

        // Arrange
        const testData = {
          load: {
            dashboardId: "fakeId",
            accessToken: "fakeToken",
            options: {
            }
          }
        };

        spyApp.validateDashboardLoad.and.returnValue(Promise.resolve(null));
        try {
          // Act
          const response = await hpm.post<void>('/dashboard/load', testData.load);
          // Assert
          expect(spyApp.validateDashboardLoad).toHaveBeenCalledWith(testData.load);
          expect(spyApp.dashboardLoad).toHaveBeenCalledWith(testData.load);
          expect(response.statusCode).toEqual(202);
        } catch (error) {

          console.error(error);
          fail(error);
        }
      });

      it('POST /dashboard/load returns 400 if the request is invalid', async function () {

        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          load: {
            dashboardId: "fakeId",
            accessToken: "fakeToken",
            options: {
            }
          }
        };

        spyApp.validateDashboardLoad.and.callFake(() => Promise.reject(null));

        try {
          // Act
          await hpm.post<models.IError>('/dashboard/load', testData.load, { uid: testData.uniqueId });
          fail("POST to /dashboard/load should fail");
        } catch (response) {
          // Assert
          expect(spyApp.validateDashboardLoad).toHaveBeenCalledWith(testData.load);
          expect(spyApp.dashboardLoad).not.toHaveBeenCalledWith(testData.load);
          expect(response.statusCode).toEqual(400);
        }
      });
    });
  });

  describe('render', function () {
    it('POST /report/render returns 202 if the request is valid', async function () {
      // Arrange
      spyApp.render.and.returnValue(Promise.resolve(null));
      // Act
      const response = await hpm.post<void>('/report/render', null);
      // Assert
      expect(spyApp.render).toHaveBeenCalled();
      expect(response.statusCode).toEqual(202);
    });
  });

  describe('pages', function () {
    it('GET /report/pages returns 200 with body as array of pages', async function () {
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

      spyApp.getPages.and.returnValue(Promise.resolve(testData.expectedPages));
      // Act
      const response = await hpm.get<models.IPage[]>('/report/pages');
      // Assert
      expect(spyApp.getPages).toHaveBeenCalled();
      const pages = response.body;
      // @ts-ignore as testData is not of type IFilter
      expect(pages).toEqual(testData.expectedPages);
    });

    it('GET /report/pages returns 500 with body as error', async function () {
      // Arrange
      const testData = {
        expectedError: {
          message: "could not query pages"
        }
      };

      spyApp.getPages.and.callFake(() => Promise.reject(testData.expectedError));
      try {
        // Act
        await hpm.get<models.IPage[]>('/report/pages');
        fail("Get /report/pages should fail");
      } catch (response) {
        // Assert
        expect(spyApp.getPages).toHaveBeenCalled();
        const error = response.body;
        expect(error).toEqual(testData.expectedError);
      }
    });

    it('PUT /report/pages/active returns 400 if request is invalid', async function () {
      // Arrange
      const testData = {
        page: {
          name: "fakeName"
        }
      };

      spyApp.validatePage.and.callFake(() => Promise.reject(null));
      try {

        // Act
        await hpm.put<void>('/report/pages/active', testData.page);
        fail("put to /report/pages/active should fail");
      } catch (response) {
        // Assert
        expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
        expect(spyApp.setPage).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(400);
      }
    });

    it('PUT /report/pages/active returns 202 if request is valid', async function () {
      // Arrange
      const testData = {
        page: {
          name: "fakeName"
        }
      };

      spyApp.validatePage.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/pages/active', testData.page);
      // Assert
      expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
      expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
      expect(response.statusCode).toEqual(202);
    });

    it('PUT /report/pages/active causes POST /reports/:uniqueId/events/pageChanged', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        page: {
          name: "fakeName"
        }
      };
      const expectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/events/pageChanged`,
        body: jasmine.objectContaining({
          initiator: 'sdk'
        })
      };

      spyApp.validatePage.and.returnValue(Promise.resolve(null));
      spyHandler.handle.calls.reset();
      // Act
      const response = await hpm.put<void>('/report/pages/active', testData.page, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
      expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
      expect(response.statusCode).toEqual(202);
      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
    });

    it('PUT /report/pages/active causes POST /reports/:uniqueId/events/error', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        page: {
          name: "fakeName"
        },
        error: {
          message: "error"
        }
      };
      const expectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/events/error`,
        body: testData.error
      };

      spyApp.validatePage.and.returnValue(Promise.resolve(null));
      spyApp.setPage.and.callFake(() => Promise.reject(testData.error));

      // Act
      const response = await hpm.put<void>('/report/pages/active', testData.page, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
      expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
      expect(response.statusCode).toEqual(202);
      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
    });

    describe('refresh', function () {
      it('POST /report/refresh returns 202 if the request is valid', async function () {
        // Arrange
        spyApp.refreshData.and.returnValue(Promise.resolve(null));
        // Act
        const response = await hpm.post<void>('/report/refresh', null);
        // Assert
        expect(spyApp.refreshData).toHaveBeenCalled();
        expect(response.statusCode).toEqual(202);

      });
    });

    describe('print', function () {
      it('POST /report/print returns 202 if the request is valid', async function () {
        // Arrange
        spyApp.print.and.returnValue(Promise.resolve(null));
        // Act
        const response = await hpm.post<void>('/report/print', null);
        // Assert
        expect(spyApp.print).toHaveBeenCalled();
        expect(response.statusCode).toEqual(202);

      });
    });

    describe('switchMode', function () {
      it('POST /report/switchMode returns 202 if the request is valid', async function () {
        // Arrange
        spyApp.switchMode.and.returnValue(Promise.resolve(null));
        // Act
        const response = await hpm.post<void>('/report/switchMode/Edit', null);
        // Assert
        expect(spyApp.switchMode).toHaveBeenCalled();
        expect(response.statusCode).toEqual(202);
      });
    });

    describe('save', function () {
      it('POST /report/save returns 202 if the request is valid', async function () {
        // Arrange
        spyApp.save.and.returnValue(Promise.resolve(null));
        // Act
        const response = await hpm.post<void>('/report/save', null);
        // Assert
        expect(spyApp.save).toHaveBeenCalled();
        expect(response.statusCode).toEqual(202);
      });
    });
  });

  describe('saveAs', function () {
    it('POST /report/saveAs returns 202 if the request is valid', async function () {
      // Arrange
      let saveAsParameters: models.ISaveAsParameters = { name: "reportName" };

      spyApp.saveAs.and.returnValue(Promise.resolve(null));
      // Act
      const response = await hpm.post<void>('/report/saveAs', saveAsParameters);
      // Assert
      expect(spyApp.saveAs).toHaveBeenCalled();
      expect(spyApp.saveAs).toHaveBeenCalledWith(saveAsParameters);
      expect(response.statusCode).toEqual(202);
    });
  });

  describe('setAccessToken', function () {
    it('POST /report/token returns 202 if the request is valid', async function () {
      // Arrange
      let accessToken: string = "fakeToken";

      spyApp.setAccessToken.and.returnValue(Promise.resolve(null));
      // Act
      const response = await hpm.post<void>('/report/token', accessToken);
      // Assert
      expect(spyApp.setAccessToken).toHaveBeenCalled();
      expect(spyApp.setAccessToken).toHaveBeenCalledWith(accessToken);
      expect(response.statusCode).toEqual(202);
    });
  });

  describe('filters (report level)', function () {
    it('GET /report/filters returns 200 with body as array of filters', async function () {
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

      spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));

      // Act
      const response = await hpm.get<models.IFilter[]>('/report/filters');
      // Assert
      expect(spyApp.getFilters).toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
      // @ts-ignore as testData is not of type IFilter
      expect(response.body).toEqual(testData.filters);
    });

    it('GET /report/filters returns 500 with body as error', async function () {
      // Arrange
      const testData = {
        error: {
          message: "internal error"
        }
      };

      spyApp.getFilters.and.callFake(() => Promise.reject(testData.error));

      // Act
      try {
        await hpm.get<models.IFilter[]>('/report/filters');

      } catch (response) {
        // Assert
        expect(spyApp.getFilters).toHaveBeenCalled();
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(testData.error);
      }
    });

    it('PUT /report/filters returns 400 if request is invalid', async function () {
      // Arrange
      const testData = {
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };

      spyApp.validateFilter.and.callFake(() => Promise.reject(null));

      // Act
      try {
        await hpm.put<models.IError>('/report/filters', testData.filters);

      } catch (response) {
        // Assert
        expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
        expect(spyApp.setFilters).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(400);
      }
    });

    it('PUT /report/filters returns 202 if request is valid', async function () {
      // Arrange
      const testData = {
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };

      spyApp.validateFilter.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/filters', testData.filters);
      // Assert
      expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
      expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
      expect(response.statusCode).toEqual(202);
    });

    it('PUT /report/filters will cause POST /reports/:uniqueId/events/filtersApplied', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };
      const testExpectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/events/filtersApplied`
      };

      spyApp.validateFilter.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/filters', testData.filters, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
      expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
      expect(response.statusCode).toEqual(202);
      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
    });
  });

  describe('filters (page level)', function () {
    beforeEach(() => {
      spyApp.validatePage.and.returnValue(Promise.resolve(null));
      spyApp.validateFilter.and.returnValue(Promise.resolve(null));
    });
    it('GET /report/pages/xyz/filters returns 200 with body as array of filters', async function () {
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

      spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));

      // Act
      const response = await hpm.get<models.IFilter[]>('/report/pages/xyz/filters');
      // Assert
      expect(spyApp.getFilters).toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
      // @ts-ignore as testData is not of type IFilter
      expect(response.body).toEqual(testData.filters);
    });

    it('GET /report/pages/xyz/filters returns 500 with body as error', async function () {
      // Arrange
      const testData = {
        error: {
          message: "internal error"
        }
      };

      spyApp.getFilters.and.callFake(() => Promise.reject(testData.error));

      // Act
      try {
        await hpm.get<models.IFilter[]>('/report/pages/xyz/filters');

      } catch (response) {
        // Assert
        expect(spyApp.getFilters).toHaveBeenCalled();
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(testData.error);

      }
    });

    it('PUT /report/pages/xyz/filters returns 400 if request is invalid', async function () {
      // Arrange
      const testData = {
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };

      spyApp.validateFilter.and.callFake(() => Promise.reject(null));

      // Act
      try {
        await hpm.put<models.IError>('/report/pages/xyz/filters', testData.filters);

      } catch (response) {
        // Assert
        expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
        expect(spyApp.setFilters).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(400);
      }
    });

    it('PUT /report/pages/xyz/filters returns 202 if request is valid', async function () {
      // Arrange
      const testData = {
        filters: [
          {
            name: "fakeFilter"
          }
        ],
      };

      spyApp.validateFilter.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/pages/xyz/filters', testData.filters);
      // Assert
      expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
      expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
      expect(response.statusCode).toEqual(202);
    });

    it('PUT /report/pages/xyz/filters will cause POST /reports/:uniqueId/pages/xyz/events/filtersApplied', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };
      const testExpectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/pages/xyz/events/filtersApplied`
      };

      spyApp.validateFilter.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/pages/xyz/filters', testData.filters, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
      expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
      expect(response.statusCode).toEqual(202);
      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
    });
  });

  describe('filters (visual level)', function () {
    it('GET /report/pages/xyz/visuals/uvw/filters returns 200 with body as array of filters', async function () {
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

      spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));

      // Act
      try {

        const response = await hpm.get<models.IFilter[]>('/report/pages/xyz/visuals/uvw/filters');
        // Assert
        expect(spyApp.getFilters).toHaveBeenCalled();
        expect(response.statusCode).toEqual(200);
        // @ts-ignore as testData is not of type IFilter
        expect(response.body).toEqual(testData.filters);
      } catch (error) {
        console.log("get filter shouldn't fail");
      }
    });

    it('GET /report/pages/xyz/visuals/uvw/filters returns 500 with body as error', async function () {
      // Arrange
      const testData = {
        error: {
          message: "internal error"
        }
      };

      spyApp.getFilters.and.callFake(() => Promise.reject(testData.error));

      // Act
      try {
        await hpm.get<models.IFilter[]>('/report/pages/xyz/visuals/uvw/filters');

      } catch (response) {

        // Assert
        expect(spyApp.getFilters).toHaveBeenCalled();
        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual(testData.error);

      }
    });

    it('PUT /report/pages/xyz/visuals/uvw/filters returns 400 if request is invalid', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };

      spyApp.validateFilter.and.callFake(() => Promise.reject(null));

      // Act
      try {
        await hpm.put<models.IError>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId });

      } catch (response) {
        // Assert
        expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
        expect(spyApp.setFilters).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(400);

      }
    });

    it('PUT /report/pages/xyz/visuals/uvw/filters returns 202 if request is valid', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        filters: [
          {
            name: "fakeFilter"
          }
        ],
      };

      spyApp.validateFilter.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.put<void>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
      expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
      expect(response.statusCode).toEqual(202);
    });

    it('PUT /report/:uniqueId/pages/xyz/visuals/uvw/filters will cause POST /reports/:uniqueId/pages/xyz/visuals/uvw/events/filtersApplied', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        filters: [
          {
            name: "fakeFilter"
          }
        ]
      };
      const testExpectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/pages/xyz/visuals/uvw/events/filtersApplied`
      };
      // Act
      try {
        const response = await hpm.put<void>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId });
        // Assert
        expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
        expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
        expect(response.statusCode).toEqual(202);
        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
      } catch (error) {
        console.log("hpm.put failed with", error);
        fail("hpm.put failed");
      }
    });
  });

  describe('settings', function () {
    it('PATCH /report/settings returns 400 if request is invalid', async function () {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: false
        }
      };

      spyApp.validateSettings.and.callFake(() => Promise.reject(null));

      // Act
      try {
        await hpm.patch<models.IError[]>('/report/settings', testData.settings);

      } catch (response) {
        // Assert
        expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
        expect(spyApp.updateSettings).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(400);
      }
    });

    it('PATCH /report/settings returns 202 if request is valid', async function () {
      // Arrange
      const testData = {
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: false
        }
      };

      spyApp.validateSettings.and.returnValue(Promise.resolve(null));

      // Act
      const response = await hpm.patch<void>('/report/settings', testData.settings);
      // Assert
      expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
      expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
      expect(response.statusCode).toEqual(202);
    });

    it('PATCH /report/settings causes POST /reports/:uniqueId/events/settingsUpdated', async function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        settings: {
          filterPaneEnabled: false
        }
      };
      const testExpectedEvent = {
        method: 'POST',
        url: `/reports/${testData.uniqueId}/events/settingsUpdated`,
        body: {
          initiator: 'sdk',
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: false
          }
        }
      };

      spyApp.validateSettings.and.returnValue(Promise.resolve(null));
      spyApp.updateSettings.and.returnValue(Promise.resolve(testExpectedEvent.body.settings));

      // Act
      const response = await hpm.patch<void>('/report/settings', testData.settings, { uid: testData.uniqueId });
      // Assert
      expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
      expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
      expect(response.statusCode).toEqual(202);
      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
    });
  });

  describe('MockApp-to-HPM', function () {
    describe('pages', function () {
      it('POST /reports/:uniqueId/events/pageChanged when user changes page', async function () {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            newPage: {
              name: "fakePageName"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/pageChanged`,
          body: testData.event
        };
        // Act
        const response = await iframeHpm.post<void>(testExpectedRequest.url, testData.event);
        // Assert
        expect(response.statusCode).toBe(202);
        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));

      });
    });

    describe('filters (report level)', function () {
      it('POST /reports/:uniqueId/events/filtersApplied when user changes filter', async function () {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            filters: [
              {
                name: "fakeFilter"
              }
            ]
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filtersApplied`,
          body: testData.event
        };
        // Act
        const response = await iframeHpm.post(testExpectedRequest.url, testData.event);
        // Assert
        expect(response.statusCode).toBe(202);
        expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
      });

      describe('filters (page level)', function () {
        it('POST /reports/:uniqueId/pages/xyz/events/filtersApplied when user changes filter', async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            reportId: 'fakeReportId',
            event: {
              initiator: 'user',
              filters: [
                {
                  name: "fakeFilter"
                }
              ]
            }
          };
          const testExpectedRequest = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/pages/xyz/events/filtersApplied`,
            body: testData.event
          };
          // Act
          const response = await iframeHpm.post(testExpectedRequest.url, testData.event);
          // Assert
          expect(response.statusCode).toBe(202);
          expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
        });
      });

      describe('filters (visual level)', function () {
        it('POST /reports/:uniqueId/pages/xyz/visuals/uvw/events/filtersApplied when user changes filter', async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            reportId: 'fakeReportId',
            event: {
              initiator: 'user',
              filters: [
                {
                  name: "fakeFilter"
                }
              ]
            }
          };
          const testExpectedRequest = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/pages/xyz/visuals/uvw/events/filtersApplied`,
            body: testData.event
          };

          // Act
          const response = await iframeHpm.post(testExpectedRequest.url, testData.event);
          // Assert
          expect(response.statusCode).toBe(202);
          expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
        });
      });

      describe('settings', function () {
        it('POST /reports/:uniqueId/events/settingsUpdated when user changes settings', async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            reportId: 'fakeReportId',
            event: {
              initiator: 'user',
              settings: {
                navContentPaneEnabled: true
              }
            }
          };
          const testExpectedRequest = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/events/settingsUpdated`,
            body: testData.event
          };
          // Act
          const response = await iframeHpm.post(testExpectedRequest.url, testData.event);
          // Assert
          expect(response.statusCode).toBe(202);
          expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
        });
      });

      describe('data selection', function () {
        it('POST /reports/:uniqueId/events/dataSelected when user selects data', async function () {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            reportId: 'fakeReportId',
            event: {
              initiator: 'user',
              selection: {
                data: true
              }
            }
          };
          const testExpectedRequest = {
            method: 'POST',
            url: `/reports/${testData.uniqueId}/events/dataSelected`,
            body: testData.event
          };
          // Act
          const response = await iframeHpm.post(testExpectedRequest.url, testData.event);
          // Assert
          expect(response.statusCode).toBe(202);
          expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));
        });
      });
    });
  });
});
