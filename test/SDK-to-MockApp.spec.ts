// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as utils from '../src/util';
import * as service from '../src/service';
import * as embed from '../src/embed';
import * as report from '../src/report';
import * as page from '../src/page';
import * as Hpm from 'http-post-message';
import * as models from 'powerbi-models';
import * as factories from '../src/factories';
import * as util from '../src/util';
import { spyApp, setupEmbedMockApp } from './utility/mockEmbed';
import { iframeSrc } from './constsants';

describe('SDK-to-MockApp', function () {
  let element: HTMLDivElement;
  let iframe: HTMLIFrameElement;
  let iframeHpm: Hpm.HttpPostMessage;
  let powerbi: service.Service;
  let report: report.Report;
  let page1: page.Page;
  const embedConfiguration: embed.IEmbedConfiguration = {
    type: "report",
    id: "fakeReportIdInitialEmbed",
    accessToken: 'fakeTokenInitialEmbed',
    embedUrl: iframeSrc
  };

  beforeEach(async function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory, {
      wpmpName: 'SDK-to-MockApp HostWpmp'
    });
    element = document.createElement('div');
    element.id = "reportContainer1";
    element.className = 'powerbi-report-container2';
    document.body.appendChild(element);
    report = <report.Report>powerbi.embed(element, embedConfiguration);
    page1 = report.page('ReportSection1');
    iframe = element.getElementsByTagName('iframe')[0];

    /**
     * Note: For testing we need to configure the eventSourceOverrideWindow to allow the host to respond to
     * the iframe window; however, the iframe window doesn't exist until the first embed is created.
     *
     * To work around this we create a service for the initial embed, embed a report, then set the private variable
     */
    (<any>powerbi.wpmp).eventSourceOverrideWindow = iframe.contentWindow;
    // Register Iframe side
    let hpmPostSpy = spyOn(powerbi.hpm, "post").and.returnValue(Promise.resolve(<any>{}));
    iframeHpm = setupEmbedMockApp(iframe.contentWindow, window, 'SDK-to-MockApp IframeWpmp');

    await new Promise<void>((resolve, _reject) => {
      iframe.addEventListener('load', () => {
        resolve(null);
      });
    });

    hpmPostSpy.and.callThrough();
  });

  afterEach(function () {
    powerbi.reset(element);
    element.remove();
    powerbi.wpmp?.stop();
    spyApp.reset();
  });

  describe('report', function () {
    beforeEach(function () {
      spyOn(utils, "getTimeDiffInMilliseconds").and.callFake(() => 700); // Prevent requests from being throttled.
    });

    describe('load', function () {
      it('report.load() returns promise that resolves with null if the report load successful', async function () {
        try {
          const response = await report.load(undefined);
          // Assert
          expect(response).toEqual({} as any);
        } catch (error) {
          fail("lod shouldn't fail");
        }
      });
    });

    describe('pages', function () {
      it('report.getPages() return promise that rejects with server error if there was error getting pages', async function () {
        // Arrange
        const testData = {
          expectedError: {
            message: 'internal server error'
          }
        };

        try {
          spyApp.getPages.and.callFake(() => Promise.reject(testData.expectedError));
          // Act
          await report.getPages();
          fail("getPagesshouldn't succeed");
        } catch (error) {
          // Assert
          expect(spyApp.getPages).toHaveBeenCalled();
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
        }
      });

      it('report.getPages() returns promise that resolves with list of page names', async function () {
        // Arrange
        const testData = {
          pages: [
            {
              name: "page1",
              displayName: "Page 1",
              isActive: true
            }
          ]
        };

        try {
          spyApp.getPages.and.returnValue(Promise.resolve(testData.pages));
          const pages = await report.getPages();
          // Assert
          expect(spyApp.getPages).toHaveBeenCalled();
          // Workaround to compare pages
          pages.forEach(page => {
            const testPage = util.find(p => p.name === page.name, testData.pages);
            if (testPage) {
              expect(page.name).toEqual(testPage.name);
              expect(page.isActive).toEqual(testPage.isActive);
            }
            else {
              expect(true).toBe(false);
            }
          });
        } catch (error) {
          console.log("getPages failed with", error);
          fail("getPages failed");
        }
      });
    });

    describe('filters', function () {
      it('report.getFilters() returns promise that rejects with server error if there was problem getting filters', async function () {
        // Arrange
        const testData = {
          expectedError: {
            message: 'could not serialize filters'
          }
        };

        try {
          spyApp.getFilters.and.callFake(() => Promise.reject(testData.expectedError));
          await report.getFilters();
          fail("getFilters shouldn't succeed");
        } catch (error) {
          // Assert
          expect(spyApp.getFilters).toHaveBeenCalled();
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
        }
      });

      it('report.getFilters() returns promise that resolves with filters is request is successful', async function () {
        // Arrange
        const testData = {
          filters: [
            { x: 'fakeFilter' }
          ]
        };

        spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
        try {

          // Act
          const filters = await report.getFilters();
          // Assert
          expect(spyApp.getFilters).toHaveBeenCalled();
          // @ts-ignore as testData is not of type IFilter
          expect(filters).toEqual(testData.filters);
        } catch (error) {
          fail("get filtershousln't fails");
        }
      });

      it('report.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
          ],
          expectedErrors: [
            {
              message: 'invalid filter'
            }
          ]
        };

        spyApp.validateFilter.and.callFake(() => Promise.reject(testData.expectedErrors));
        try {

          // Act
          await report.setFilters(testData.filters);
          fail("et filter should fail");
        } catch (error) {
          // Assert
          expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
          expect(spyApp.setFilters).not.toHaveBeenCalled();
          expect(error).toEqual(jasmine.objectContaining(testData.expectedErrors));
        }
      });

      it('report.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', async function () {
        // Arrange
        const testData = {
          filters: [(new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()]
        };

        spyApp.validateFilter.and.returnValue(Promise.resolve(null));
        spyApp.setFilters.and.returnValue(Promise.resolve(null));
        try {
          // Act
          await report.setFilters(testData.filters);
          expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
          expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
        } catch (error) {
          fail("why fail");
        }
      });

      it('report.removeFilters() returns promise that resolves with null if the request was accepted', async function () {
        // Arrange
        let spy = spyOn(report, 'updateFilters').and.callFake(() => Promise.resolve(null));
        try {
          // Act
          await report.removeFilters();
          // Assert
          expect(spy).toHaveBeenCalledWith(models.FiltersOperations.RemoveAll);
        } catch (error) {
          fail("remove fialter shouldn't fail");
        }
      });
    });

    describe('print', function () {
      it('report.print() returns promise that resolves with null if the report print command was accepted', async function () {
        // Arrange
        spyApp.print.and.returnValue(Promise.resolve({}));
        // Act
        const response = await report.print();
        // Assert
        expect(spyApp.print).toHaveBeenCalled();
        expect(response).toEqual();
      });
    });

    describe('refresh', function () {
      it('report.refresh() returns promise that resolves with null if the report refresh command was accepted', async function () {
        // Arrange
        spyApp.refreshData.and.returnValue(Promise.resolve(null));
        // Act
        const response = await report.refresh();
        // Assert
        expect(spyApp.refreshData).toHaveBeenCalled();
        expect(response).toEqual(undefined);
      });
    });

    describe('settings', function () {
      it('report.updateSettings(setting) returns promise that rejects with validation error if object is invalid', async function () {
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
        spyApp.validateSettings.and.callFake(() => Promise.reject(testData.expectedErrors));

        try {
          // Act
          await report.updateSettings(testData.settings);
          fail("shouldfail");
        } catch (errors) {
          // Assert
          expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
          expect(spyApp.updateSettings).not.toHaveBeenCalled();
          expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors));
        }
      });

      it('report.updateSettings(settings) returns promise that resolves with null if requst is valid and accepted', async function () {
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

        try {
          spyApp.validateSettings.and.returnValue(Promise.resolve(null));
          spyApp.updateSettings.and.returnValue(Promise.resolve(null));
          // Act
          await report.updateSettings(testData.settings);
          // Assert
          expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
          expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
        } catch (error) {
          console.log("updateSettings failed with", error);
          fail("updateSettings failed");
        }
      });
    });

    describe('page', function () {
      describe('filters', function () {

        beforeEach(() => {
          spyApp.validatePage.and.returnValue(Promise.resolve(null));
        });

        it('page.getFilters() returns promise that rejects with server error if there was problem getting filters', async function () {
          // Arrange
          const testData = {
            expectedError: {
              message: 'could not serialize filters'
            }
          };

          try {
            spyApp.getFilters.and.callFake(() => Promise.reject(testData.expectedError));

            await page1.getFilters();
          } catch (error) {
            // Assert
            expect(spyApp.getFilters).toHaveBeenCalled();
            expect(error).toEqual(jasmine.objectContaining(testData.expectedError));

          }
        });

        it('page.getFilters() returns promise that resolves with filters is request is successful', async function () {
          // Arrange
          const testData = {
            filters: [
              { x: 'fakeFilter' }
            ]
          };

          try {

            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            const filters = await page1.getFilters();
            // Assert
            expect(spyApp.getFilters).toHaveBeenCalled();
            // @ts-ignore as testData is not of type IFilter as testData is not of type IFilter
            expect(filters).toEqual(testData.filters);
          } catch (error) {
            fail("getFilters shouldn't fail");
          }
        });

        it('page.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', async function () {
          // Arrange
          const testData = {
            filters: [
              (new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
            ],
            expectedErrors: [
              {
                message: 'invalid filter'
              }
            ]
          };

          // await iframeLoaded;
          try {
            spyApp.validateFilter.and.callFake(() => Promise.reject(testData.expectedErrors));
            await page1.setFilters(testData.filters);
            fail("setilters shouldn't fail");
          } catch (error) {
            expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
            expect(spyApp.setFilters).not.toHaveBeenCalled();
            expect(error).toEqual(jasmine.objectContaining(testData.expectedErrors));
          }
        });

        it('page.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', async function () {
          // Arrange
          const testData = {
            filters: [(new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()]
          };

          spyApp.validateFilter.and.returnValue(Promise.resolve(null));
          spyApp.setFilters.and.returnValue(Promise.resolve(null));
          try {
            await page1.setFilters(testData.filters);
            expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
            expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
          } catch (error) {
            console.log("setFilters failed with", error);
            fail("setilters failed");
          }
        });

        it('page.removeFilters() returns promise that resolves with null if the request was accepted', async function () {
          // Arrange
          try {
            spyApp.updateFilters.and.returnValue(Promise.resolve(null));
            // Act
            await page1.removeFilters();
          } catch (error) {
            console.log("removeFilters failed with", error);
            fail("removeFilters failed");
          }
          // Assert
          expect(spyApp.updateFilters).toHaveBeenCalledWith(models.FiltersOperations.RemoveAll, undefined);
        });

        describe('setActive', function () {
          it('page.setActive() returns promise that rejects if page is invalid', async function () {
            // Arrange
            const testData = {
              errors: [
                {
                  message: 'page xyz was not found in report'
                }
              ]
            };

            spyApp.validatePage.and.callFake(() => Promise.reject(testData.errors));
            try {
              // Act
              await page1.setActive();
              fail("setActive shouldn't succeed");

            } catch (errors) {
              expect(spyApp.validatePage).toHaveBeenCalled();
              expect(spyApp.setPage).not.toHaveBeenCalled();
              expect(errors).toEqual(jasmine.objectContaining(testData.errors));
            }
            spyApp.validatePage.and.callThrough();
          });

          it('page.setActive() returns promise that resolves with null if request is successful', async function () {
            // Act
            spyApp.validatePage.and.returnValue(Promise.resolve(null));
            spyApp.setPage.and.returnValue(Promise.resolve(null));
            try {
              await page1.setActive();
              expect(spyApp.validatePage).toHaveBeenCalled();
              expect(spyApp.setPage).toHaveBeenCalled();
            } catch (error) {
              console.log("setActive failed with ", error);
              fail("setActive failed");
            }
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

        try {
          report.on(testData.eventName, testData.handler);
          fail("should throw exception");
        } catch (error) {
          expect(1).toEqual(1);
        }
      });

      it(`report.on(eventName, handler) should register handler and be called when POST /report/:uniqueId/events/:eventName is received`, async function () {
        // Arrange
        const testData = {
          reportId: 'fakeReportId',
          eventName: 'pageChanged',
          handler: jasmine.createSpy('handler'),
          simulatedPageChangeBody: {
            initiator: 'sdk',
            newPage: {
              name: 'page1',
              displayName: 'Page 1'
            }
          },
          expectedEvent: {
            detail: {
              initiator: 'sdk',
              newPage: report.page('page1')
            }
          }
        };

        report.on(testData.eventName, testData.handler);
        try {
          // Act
          await iframeHpm.post(`/reports/${report.config.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody);

        } catch (error) {
          fail("testshouldn't fail");
        }
        // Assert
        expect(testData.handler).toHaveBeenCalledWith(jasmine.any(CustomEvent));
        // Workaround to compare pages which prevents recursive loop in jasmine equals
        // expect(testData.handler2).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedPageChangeBody }));
        expect(testData.handler.calls.mostRecent().args[0].detail.newPage.name).toEqual(testData.expectedEvent.detail.newPage.name);
      });

      it(`if multiple reports with the same id are loaded into the host, and event occurs on one of them, only one report handler should be called`, async function () {
        // Arrange
        const testData = {
          reportId: 'fakeReportId',
          eventName: 'pageChanged',
          handler: jasmine.createSpy('handler'),
          handler2: jasmine.createSpy('handler2'),
          simulatedPageChangeBody: {
            initiator: 'sdk',
            newPage: {
              name: 'page1',
              displayName: 'Page 1'
            }
          }
        };

        // Create a second iframe and report
        const element2 = document.createElement('div');
        element2.id = "reportContainer2";
        element2.className = 'powerbi-report-container3';
        document.body.appendChild(element2);
        const report2 = <report.Report>powerbi.embed(element2, embedConfiguration);
        const iframe2 = element2.getElementsByTagName('iframe')[0];
        setupEmbedMockApp(iframe2.contentWindow, window, 'SDK-to-MockApp IframeWpmp2');
        await new Promise<void>((resolve, _reject) => {
          iframe2.addEventListener('load', () => {
            resolve(null);
          });
        });

        report.on(testData.eventName, testData.handler);
        report2.on(testData.eventName, testData.handler2);

        try {
          await iframeHpm.post(`/reports/${report2.config.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody);
        } catch (error) {
          powerbi.reset(element2);
          element2.remove();
          fail("hpm post shouldn't fail");
        }
        // Act
        expect(testData.handler).not.toHaveBeenCalled();
        expect(testData.handler2).toHaveBeenCalledWith(jasmine.any(CustomEvent));
        // Workaround to compare pages which prevents recursive loop in jasmine equals
        // expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
        expect(testData.handler2.calls.mostRecent().args[0].detail.newPage.name).toEqual(testData.simulatedPageChangeBody.newPage.name);
        powerbi.reset(element2);
        element2.remove();
      });

      it(`ensure load event is allowed`, async function () {
        // Arrange
        const testData = {
          reportId: 'fakeReportId',
          eventName: 'loaded',
          handler: jasmine.createSpy('handler3'),
          simulatedBody: {
            initiator: 'sdk'
          }
        };

        report.on(testData.eventName, testData.handler);

        // Act
        try {
          await iframeHpm.post(`/reports/${report.config.uniqueId}/events/${testData.eventName}`, testData.simulatedBody);
        } catch (error) {
          fail("ensure load event is allowed failed");
        }

        // Assert
        expect(testData.handler).toHaveBeenCalledWith(jasmine.any(CustomEvent));
        expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedBody }));
      });
    });
  });
});
