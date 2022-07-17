// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as utils from '../src/util';
import * as service from '../src/service';
import * as embed from '../src/embed';
import * as report from '../src/report';
import * as visual from '../src/visual';
import * as create from '../src/create';
import * as dashboard from '../src/dashboard';
import * as page from '../src/page';
import * as sdkConfig from '../src/config';
import * as visualDescriptor from '../src/visualDescriptor';
import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import * as models from 'powerbi-models';
import { spyApp } from './utility/mockEmbed';
import * as factories from '../src/factories';
import { spyHpm } from './utility/mockHpm';
import { spyRouter } from './utility/mockRouter';
import { APINotSupportedForRDLError } from '../src/errors';
import { iframeSrc } from './constsants';

describe('SDK-to-HPM', function () {
  let powerbi: service.Service;
  let page1: page.Page;
  let visual1: visualDescriptor.VisualDescriptor;
  let uniqueId = 'uniqueId';
  let sdkSessionId = 'sdkSessionId';
  let createUniqueId = 'uniqueId';
  let dashboardUniqueId = 'uniqueId';
  let visualUniqueId = 'uniqueId';
  let embedConfiguration: embed.IEmbedConfiguration;
  let visualEmbedConfiguration: embed.IVisualEmbedConfiguration;

  beforeEach(function () {
    const spyHpmFactory: factories.IHpmFactory = () => {
      return <Hpm.HttpPostMessage><any>spyHpm;
    };
    const noop: factories.IWpmpFactory = () => {
      return <Wpmp.WindowPostMessageProxy>null;
    };

    const spyRouterFactory: factories.IRouterFactory = () => {
      return <Router.Router><any>spyRouter;
    };

    spyOn(utils, "getTimeDiffInMilliseconds").and.callFake(() => 700); // Prevent requests from being throttled.

    powerbi = new service.Service(spyHpmFactory, noop, spyRouterFactory, { wpmpName: 'SDK-to-HPM report wpmp' });

    sdkSessionId = powerbi.getSdkSessionId();
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

    spyApp.reset();
  });

  describe('report', function () {
    let reportElement: HTMLDivElement;
    let report: report.Report;

    beforeEach(async () => {
      reportElement = document.createElement('div');
      reportElement.className = 'powerbi-report-container';
      document.body.appendChild(reportElement);

      embedConfiguration = {
        type: "report",
        id: "fakeReportId",
        accessToken: 'fakeToken',
        tokenType: models.TokenType.Aad,
        embedUrl: iframeSrc,
        eventHooks: { accessTokenProvider: function () { return null; } }
      };

      spyHpm.post.and.callFake(() => Promise.resolve({}));
      report = <report.Report>powerbi.embed(reportElement, embedConfiguration);

      page1 = new page.Page(report, 'xyz');
      visual1 = new visualDescriptor.VisualDescriptor(page1, 'uvw', 'title', 'type', {});
      uniqueId = report.config.uniqueId;

      const iframe = reportElement.getElementsByTagName('iframe')[0];
      await new Promise<void>((resolve, _reject) => {
        iframe.addEventListener('load', () => resolve(null));
      });
      spyHpm.post.and.callThrough();
    });

    afterEach(() => {
      powerbi.reset(reportElement);
      reportElement.remove();
    });

    describe('load', function () {
      it('report.load() sends POST /report/load with configuration in body', async function () {
        // Arrange
        const testData = {
          loadConfiguration: {
            id: 'fakeId',
            accessToken: 'fakeToken'
          },
          response: {
            body: null
          }
        };

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));

        // Act
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration);
        report.config = expectedConfiguration;
        await report.load();

        // Assert
        const expectedHeaders = {
          bootstrapped: undefined,
          sdkVersion: sdkConfig.default.version,
          uid: uniqueId,
          sdkSessionId: sdkSessionId,
          tokenProviderSupplied: true
        };

        expect(spyHpm.post).toHaveBeenCalledWith('/report/load', expectedConfiguration, expectedHeaders, jasmine.any(Object));
      });

      it('report.load() returns promise that rejects with validation error if the load configuration is invalid', async function () {
        // Arrange
        const testData = {
          errorResponse: {
            body: {
              message: "invalid configuration object"
            }
          }
        };

        spyHpm.post.and.callFake(() => Promise.reject(testData.errorResponse));

        try {
          // Act

          await report.load();
          fail("load shouldn't succeed");
        } catch (error) {
          const expectedHeaders = {
            bootstrapped: undefined,
            sdkVersion: sdkConfig.default.version,
            uid: uniqueId,
            sdkSessionId: sdkSessionId,
            tokenProviderSupplied: true
          };
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', report.config, expectedHeaders, jasmine.any(Object));
          expect(error).toEqual(testData.errorResponse.body);
        }
      });

      it('report.load() returns promise that resolves with null if the report load successful', async function () {
        // Arrange
        const testData = {
          response: {
            body: null
          }
        };

        spyHpm.post.and.callFake(() => Promise.resolve(testData.response));
        // Act
        try {
          const response = await report.load();
          const expectedHeaders = {
            bootstrapped: undefined,
            sdkVersion: sdkConfig.default.version,
            uid: uniqueId,
            sdkSessionId: sdkSessionId,
            tokenProviderSupplied: true
          };

          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', report.config, expectedHeaders, jasmine.any(Object));
          expect(response).toEqual(null);
        } catch (error) {
          console.log("report.load failed with", error);
          fail("report.load failed");
        }
      });

      it('report.load() updates the internal configuration if the load request was successful', async function () {
        // Arrange
        const testData = {
          loadConfiguration: {
            id: 'newFakeId',
            accessToken: 'newFakeToken'
          },
          response: {
            body: null
          }
        };

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));

        // Act
        let expectedConfiguration = { ...report.config, ...testData.loadConfiguration };
        report.config = expectedConfiguration;
        try {
          const response = await report.load();
          expect(report.config).toEqual(jasmine.objectContaining(expectedConfiguration));
          expect(response).toEqual(null);
        } catch (error) {
          console.log("report.load failed with", error);
          fail("report.load failed");
        }
      });
    });

    describe('pages', function () {
      it('report.getPages() sends GET /report/pages', async function () {
        // Arrange
        const testData = {
          response: {
            body: [
              {
                name: 'page1'
              }
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.response));

        // Act
        await report.getPages();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.getPages() return promise that rejects with server error if there was error getting pages', async function () {
        // Arrange
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.getPages();
          fail("getPages should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.getPages() returns promise that resolves with list of Page objects', async function () {
        // Arrange
        const testData = {
          pages: [
            'page1',
            'page2'
          ],
          expectedResponse: {
            body: [
              report.page('page1'),
              report.page('page2')
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.expectedResponse));
        try {
          // Act
          const pages = await report.getPages();
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(pages[0].name).toEqual(testData.expectedResponse.body[0].name);
          expect(pages[1].name).toEqual(testData.expectedResponse.body[1].name);

        } catch (error) {
          console.log("report.getPages failed with", error);
          fail("report.getPages failed");
        }
      });

      it('report.getPageByName() returns promise that rejects if report page with given page name not found', async function () {
        // Arrange
        const pageName = 'page1';
        const testData = {
          expectedError: {
            body: {
              message: 'page not found'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.getPageByName(pageName);
          fail("report.getPages should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.getPageByName(pageName) returns promise that resolves with page if request is successful', async function () {
        // Arrange
        const pageName = "page1";
        const testData = {
          expectedResponse:
          {
            report: report,
            name: "page1",
            displayName: "Page 1",
            isActive: true
          }
        };

        spyApp.getPageByName.and.returnValue(Promise.resolve(testData.expectedResponse));
        try {
          // Act
          const page = await spyApp.getPageByName(pageName);
          // Assert
          expect(spyApp.getPageByName).toHaveBeenCalled();
          expect(page.name).toEqual(testData.expectedResponse.name);
          expect(page.isActive).toEqual(testData.expectedResponse.isActive);
        } catch (error) {
          console.log("getPageByName failed with", error);
          fail("getPageByName failed");
        }
      });

      it('report.getActivePage() sends GET /report/pages', async function () {
        // Arrange
        const testData = {
          response: {
            body: [
              {
                name: 'page1',
                isActive: true
              }
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.response));

        // Act
        try {
          await report.getActivePage();
        } catch (error) {
          // The test only checks hpm request
        }

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.getActivePage() return promise that rejects with server error if there was error getting active page', async function () {
        // Arrange
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.getActivePage();
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.getActivePage() return promise that rejects if embedded report is an RDL report', async function () {
        // Arrange
        const testData = {
          expectedError: {
            body: {
              message: APINotSupportedForRDLError
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.getActivePage();
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.getActivePage() returns promise that resolves with a page if request is successful', async function () {
        // Arrange
        const testData = {
          expectedResponse:
          {
            report: report,
            name: "page1",
            displayName: "Page 1",
            isActive: true
          }
        };

        spyApp.getActivePage.and.returnValue(Promise.resolve(testData.expectedResponse));
        try {
          // Act
          const page = await spyApp.getActivePage();
          // Assert
          expect(spyApp.getActivePage).toHaveBeenCalled();
          expect(page.name).toEqual(testData.expectedResponse.name);
          expect(page.isActive).toEqual(testData.expectedResponse.isActive);
        } catch (error) {
          console.log("getActivePage failed with", error);
          fail("getActivePage failed");
        }
      });

      it('report.addPage() sends POST /report/addPage with displayName', async function () {
        // Arrange
        const displayName = "testName";
        const expectedRequest = {
          displayName: displayName
        };
        const expectedHeaders = { uid: uniqueId };

        spyHpm.post.and.returnValue(Promise.resolve({ body: page1 }));

        // Act
        await report.addPage(displayName);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/addPage', expectedRequest, expectedHeaders, jasmine.any(Object));
      });

      it('report.renamePage() sends PUT /report/pages/{name} with displayName', async function () {
        // Arrange
        const name = "testName";
        const displayName = "newName";
        const expectedHeaders = { uid: uniqueId };
        const expectedRequest = {
          name,
          displayName
        };

        spyHpm.put.and.returnValue(Promise.resolve({}));

        // Act
        await report.renamePage(name, displayName);

        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${name}/name`, expectedRequest, expectedHeaders, jasmine.any(Object));
      });

      it('report.deletePage() sends DELETE /report/pages/{name}', async function () {
        // Arrange
        const name = "testName";
        const expectedHeaders = { uid: uniqueId };

        spyHpm.delete.and.returnValue(Promise.resolve({}));

        // Act
        await report.deletePage(name);

        expect(spyHpm.delete).toHaveBeenCalledWith(`/report/pages/${name}`, {}, expectedHeaders, jasmine.any(Object));
      });
    });

    describe('filters', function () {
      it('report.getFilters() sends GET /report/filters', async function () {
        // Arrange
        const testData = {
          response: {
            body: [
              (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
              (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.response));

        // Act
        await report.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.getFilters() returns promise that rejects with server error if there was error getting  filters', async function () {
        // Arrange
        const testData = {
          expectedErrors: {
            body: [
              {
                message: 'target is invalid, missing property x'
              }
            ]
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedErrors));
        try {
          // Act
          await report.getFilters();
        } catch (errors) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, jasmine.any(Object));
          expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
        }
      });

      it('report.getFilters() returns promise that resolves with the filters if the request is accepted', async function () {
        // Arrange
        const testData = {
          response: {
            body: [
              (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
              (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.response));

        try {
          // Act
          const filters = await report.getFilters();
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, jasmine.any(Object));
          expect(filters).toEqual(testData.response.body);
        } catch (error) {
          console.log("getFilters failed with", error);
          fail("getFilters failed");
        }
      });

      it('report.setFilters(filters) sends PUT /report/filters', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };
        spyHpm.put.and.returnValue(Promise.resolve({}));

        // Act
        await report.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ],
          expectedErrors: {
            body: [
              {
                message: 'target is invalid, missing property x'
              }
            ]
          }
        };

        spyHpm.put.and.callFake(() => Promise.reject(testData.expectedErrors));
        try {
          // Act
          await report.setFilters(testData.filters);
        } catch (errors) {
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, jasmine.any(Object));
          expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
        }
      });

      it('report.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));
        try {
          // Act
          const response = await report.setFilters(testData.filters);
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        } catch (error) {
          console.log("setFilters failed with", error);
          fail("setFilters failed");
        }
      });

      it('report.removeFilters() sends PUT /report/filters', async function () {
        // Arrange
        spyHpm.post.and.callFake(() => Promise.resolve({}));

        // Act
        await report.removeFilters();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.removeFilters() returns promise that resolves with null if request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve(null));

        // Act
        const response = await report.removeFilters();
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
        expect(response).toEqual(null);
      });
    });

    describe('switchMode', function () {
      it('report.switchMode() sends POST /report/switchMode', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.switchMode(models.ViewMode.Edit);

        // Assert
        const url = '/report/switchMode/edit';
        expect(spyHpm.post).toHaveBeenCalledWith(url, null, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.switchMode() returns promise that resolves if the request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.switchMode(models.ViewMode.Edit);
        // Assert
        let url = '/report/switchMode/edit';
        expect(spyHpm.post).toHaveBeenCalledWith(url, null, { uid: uniqueId }, jasmine.any(Object));
      });
    });

    describe('save', function () {
      it('report.save() sends POST /report/save', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.save();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/save', null, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.save() returns promise that resolves if the request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.save();
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/save', null, { uid: uniqueId }, jasmine.any(Object));
      });
    });

    describe('switchLayout', function () {
      it('report.switchLayout(layout) returns promise that rejects with errors if there was error if initial layout and current layout type do not match', async function () {
        // Arrange
        // Set initial layout to desktop layout
        report.config.settings.layoutType = models.LayoutType.Master;

        const layoutType = models.LayoutType.MobileLandscape;
        const testData = {
          expectedError: {
            message: 'Switching between mobile and desktop layouts is not supported. Please reset the embed container and re-embed with required layout.'
          },
          settings: {
            layoutType: layoutType
          }
        };

        spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.switchLayout(layoutType);
        } catch (error) {
          // Assert
          expect(spyHpm.patch).not.toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.message);
        }
      });

      it('report.switchLayout(layout) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        // Set initial layout to mobile layout
        report.config.settings.layoutType = models.LayoutType.MobilePortrait;

        const layoutType = models.LayoutType.MobileLandscape;

        spyApp.switchLayout.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.switchLayout(layoutType);
        // Assert
        expect(spyApp.switchLayout).toHaveBeenCalled();
        expect(response).toEqual(null);
      });
    });

    describe('custom layout', function () {
      it('visual.moveVisual() returns promise that rejects with server error if error in updating setting', async function () {
        // Arrange
        const x = 0;
        const y = 0;
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await visual1.moveVisual(x, y);
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('visual.moveVisual() returns promise that resolves with null if request is valid and accepted', async function () {
        // Arrange
        const x = 0;
        const y = 0;

        spyApp.moveVisual.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.moveVisual(x, y);
        // Assert
        expect(spyApp.moveVisual).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('visual.setVisualDisplayState(displayState) returns promise that rejects with validation error if display state is invalid', async function () {
        // Arrange
        const displayState = 2;
        const testData = {
          expectedError: {
            body: {
              message: 'mode property is invalid'
            }
          },
        };

        spyApp.setVisualDisplayState.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await spyApp.setVisualDisplayState(displayState);
          fail("setVisualDisplayState should have failed");
        } catch (error) {
          // Assert
          expect(error).toEqual(testData.expectedError);
        }
      });

      it('visual.setVisualDisplayState(displayState) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const displayState = models.VisualContainerDisplayMode.Visible;

        spyApp.setVisualDisplayState.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.setVisualDisplayState(displayState);
        // Assert
        expect(spyApp.setVisualDisplayState).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('visual.resizeVisual returns promise that rejects with server error if error in updating setting', async function () {
        // Arrange
        const width = 200;
        const height = 100;
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await visual1.resizeVisual(width, height);
          fail("resizeVisual should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('visual.resizeVisual returns promise that resolves with null if request is valid and accepted', async function () {
        // Arrange
        const width = 200;
        const height = 100;

        spyApp.resizeVisual.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.resizeVisual(width, height);
        // Assert
        expect(spyApp.resizeVisual).toHaveBeenCalled();
        expect(response).toEqual(null);
      });
    });

    describe('saveAs', function () {
      let saveAsParameters: models.ISaveAsParameters = { name: "reportName" };

      it('report.saveAs() sends POST /report/saveAs', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.saveAs(saveAsParameters);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/saveAs', saveAsParameters, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.saveAs() returns promise that resolves if the request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.saveAs(saveAsParameters);
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/saveAs', saveAsParameters, { uid: uniqueId }, jasmine.any(Object));

      });
    });

    describe('setAccessToken', function () {
      let accessToken: string = "fakeToken";

      it('report.setAccessToken() sends POST /report/token', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.setAccessToken(accessToken);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/token', accessToken, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.setAccessToken() returns promise that resolves if the request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        let newToken = "newToken";
        // Act
        await report.setAccessToken(newToken);
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/token', newToken, { uid: uniqueId }, jasmine.any(Object));
        expect(report.service.accessToken).toEqual(newToken);
        expect(report.config.accessToken).toEqual(newToken);
        expect(report.element.getAttribute(embed.Embed.accessTokenAttribute)).toEqual(newToken);
      });
    });

    describe('print', function () {
      it('report.print() sends POST /report/print', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.print();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/print', null, { uid: uniqueId }, jasmine.any(Object));
      });

      it('report.print() returns promise that resolves if the request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.print();
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/print', null, { uid: uniqueId }, jasmine.any(Object));

      });
    });

    describe('reload', function () {
      it('report.reload() sends POST /report/load with configuration in body', async function () {
        // Arrange
        const testData = {
          response: {
            body: null
          }
        };

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));

        try {
          await report.load();
          spyHpm.post.calls.reset();

          // Act
          try {
            await report.reload();
          } catch (error) {
            console.log("reloaed failed wtih", error);
            fail("reload failed");
          }

          const expectedHeaders = {
            bootstrapped: undefined,
            sdkVersion: sdkConfig.default.version,
            uid: uniqueId,
            sdkSessionId: sdkSessionId,
            tokenProviderSupplied: true
          };

          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', report.config, expectedHeaders, jasmine.any(Object));
        } catch (error) {
          console.log("load failed with", error);
          fail("load failed");
        }
      });
    });

    describe('refresh', function () {
      it('report.refresh() sends POST /report/refresh', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        await report.refresh();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/refresh', null, { uid: uniqueId }, jasmine.any(Object));
      });
    });

    describe('settings', function () {
      it('report.updateSettings(settings) sends PATCH /report/settings with settings object', async function () {
        // Arrange
        const testData = {
          settings: {
            filterPaneEnabled: false
          }
        };

        spyHpm.patch.and.returnValue(Promise.resolve({}));
        // Act
        try {
          await report.updateSettings(testData.settings);
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
        } catch (error) {
          console.log("updateSettings failed with", error);
          fail("updateSettings failed");
        }
      });

      it('report.updateSettings(setting) returns promise that rejects with validation error if object is invalid', async function () {
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

        spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError));

        try {
          await report.updateSettings(testData.settings);
          fail("updateSettings should have failed");
        } catch (errors) {
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(errors).toEqual(testData.expectedError.body);
        }
      });

      it('report.updateSettings(settings) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const testData = {
          settings: {
            filterPaneEnabled: false
          }
        };

        spyHpm.patch.and.returnValue(Promise.resolve(null));

        // Act
        const response = await report.updateSettings(testData.settings);
        // Assert
        expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
        expect(response).toEqual(null);
      });

      it('report.addContextMenuCommand(commandName, commandTitle, contextMenuTitle) returns promise that rejects with validation errors if extensions property is invalid', async function () {
        // Arrange
        const commandName = "name1";
        const commandTitle = "title1";
        const contextMenuTitle = "menu1";
        const testData = {
          expectedError: {
            body: [
              {
                message: 'extensions property is invalid'
              }
            ]
          },
          settings: {
            extensions: {
              commands: [{
                name: "name1",
                title: "title1",
                extend: {
                  visualContextMenu: {
                    title: contextMenuTitle,
                    menuLocation: 0
                  }
                }
              }],
              groups: []
            }
          }
        };

        spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.addContextMenuCommand(commandName, commandTitle, contextMenuTitle, 0, "", "", "");
          fail("addContextMenuCommand should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError.body));
        }
      });

      it('report.addContextMenuCommand(commandName, commandTitle, contextMenuTitle) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const commandName = "name2";
        const commandTitle = "title2";
        const contextMenuTitle = "menu2";

        spyApp.addContextMenuCommand.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.addContextMenuCommand(commandName, commandTitle, contextMenuTitle);
        // Assert
        expect(spyApp.addContextMenuCommand).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.addOptionsMenuCommand(commandName, commandTitle, optionsMenuTitle) returns promise that rejects with validation errors if extensions property is invalid', async function () {
        // Arrange
        const commandName = "name1";
        const commandTitle = "title1";
        const optionsMenuTitle = "menu1";
        const testData = {
          expectedError: {
            body: [
              {
                message: 'extensions property is invalid'
              }
            ]
          },
          settings: {
            extensions: {
              commands: [{
                name: "name1",
                title: "title1",
                extend: {
                  visualOptionsMenu: {
                    title: "menu1",
                    menuLocation: 0,
                  }
                },
                icon: undefined
              }],
              groups: []
            }
          }
        };

        spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError));
        try {

          // Act
          await report.addOptionsMenuCommand(commandName, commandTitle, optionsMenuTitle);
          fail("addOptionsMenuCommand should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError.body));
        }
      });

      it('report.addOptionsMenuCommand(commandName, commandTitle, optionsMenuTitle) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const commandName = "name2";
        const commandTitle = "title2";
        const optionsMenuTitle = "menu2";

        spyApp.addOptionsMenuCommand.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.addOptionsMenuCommand(commandName, commandTitle, optionsMenuTitle);
        // Assert
        expect(spyApp.addOptionsMenuCommand).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.removeContextMenuCommand(commandName) returns promise that rejects with validation errors if command name is invalid', async function () {
        // Arrange
        const commandName = "name1";
        const testData = {
          expectedError: {
            message: 'PowerBIEntityNotFound'
          },
          settings: {
            extensions: {
              commands: [{
                name: "name1",
                title: "title1",
                extend: {
                }
              }]
            }
          }
        };

        spyApp.removeContextMenuCommand.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await spyApp.removeContextMenuCommand(commandName);
          fail("removeContextMenuCommand should have failed");
        } catch (error) {
          // Assert
          expect(spyHpm.patch).not.toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
        }
      });

      it('report.removeContextMenuCommand(commandName) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const commandName = "name2";

        spyApp.removeContextMenuCommand.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.removeContextMenuCommand(commandName);
        // Assert
        expect(spyApp.removeContextMenuCommand).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.removeOptionsMenuCommand(commandName) returns promise that rejects with validation errors if command name is invalid', async function () {
        // Arrange
        const commandName = "name1";
        const testData = {
          expectedError: {
            message: 'PowerBIEntityNotFound'
          },
          settings: {
            extensions: {
              commands: [{
                name: "name1",
                title: "title1",
                icon: "",
                extend: {
                }
              }]
            }
          }
        };

        spyApp.removeOptionsMenuCommand.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await spyApp.removeOptionsMenuCommand(commandName);

        } catch (error) {
          // Assert
          expect(spyHpm.patch).not.toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
        }
      });

      it('report.removeOptionsMenuCommand(commandName) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const commandName = "name2";

        spyApp.removeOptionsMenuCommand.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.removeOptionsMenuCommand(commandName);
        // Assert
        expect(spyApp.removeOptionsMenuCommand).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.setVisualDisplayState(pageName, visualName, displayState) returns promise that rejects with validation error if display state is invalid', async function () {
        // Arrange
        const pageName = 'page1';
        const visualName = 'visual';
        const displayState = 2;
        const testData = {
          expectedError: {
            body: {
              message: 'display state is invalid'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.setVisualDisplayState(pageName, visualName, displayState);
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.setVisualDisplayState(pageName, visualName, displayState) returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const pageName = 'page1';
        const visualName = 'visual';
        const displayState = models.VisualContainerDisplayMode.Visible;

        spyApp.setVisualDisplayState.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.setVisualDisplayState(pageName, visualName, displayState);
        // Assert
        expect(spyApp.setVisualDisplayState).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.resizeVisual returns promise that rejects with validation error if page name is invalid', async function () {
        // Arrange
        const pageName = 'invalid page';
        const visualName = 'visual';
        const width = 200;
        const height = 100;
        const testData = {
          expectedError: {
            body: {
              message: 'page name is invalid'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.resizeVisual(pageName, visualName, width, height);
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.resizeVisual returns promise that resolves with null if request is valid and accepted', async function () {
        // Arrange
        const pageName = 'page1';
        const visualName = 'visual';
        const width = 200;
        const height = 100;

        spyApp.resizeVisual.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.resizeVisual(pageName, visualName, width, height);
        // Assert
        expect(spyApp.resizeVisual).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('report.resizeActivePage returns promise that rejects with validation error if page size type is invalid', async function () {
        // Arrange
        const pageSizeType = 5;
        const width = 200;
        const height = 100;
        const testData = {
          expectedError: {
            body: {
              message: 'page size type is invalid'
            }
          },
          settings: {
            layoutType: models.LayoutType.Custom,
            customLayout: {
              pageSize: {
                type: pageSizeType,
                width: width,
                height: height
              }
            }
          }
        };

        spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.resizeActivePage(pageSizeType, width, height);
        } catch (error) {
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('report.resizeActivePage returns promise that resolves with null if request is valid and accepted', async function () {
        // Arrange
        const pageSizeType = models.PageSizeType.Custom;
        const width = 200;
        const height = 100;

        spyApp.resizeActivePage.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.resizeActivePage(pageSizeType, width, height);
        // Assert
        expect(spyApp.resizeActivePage).toHaveBeenCalled();
        expect(response).toEqual(null);
      });

      it('moveVisual returns promise that rejects with validation error if visual name is invalid', async function () {
        // Arrange
        const pageName = 'page1';
        const visualName = 'invalid visual';
        const x = 0;
        const y = 0;
        const testData = {
          expectedError: {
            body: {
              message: 'visual name is invalid'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await report.moveVisual(pageName, visualName, x, y);
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('moveVisual returns promise that resolves with null if requst is valid and accepted', async function () {
        // Arrange
        const pageName = 'page1';
        const visualName = 'visual';
        const x = 0;
        const y = 0;

        spyApp.moveVisual.and.returnValue(Promise.resolve(null));

        // Act
        const response = await spyApp.moveVisual(pageName, visualName, x, y);
        // Assert
        expect(spyApp.moveVisual).toHaveBeenCalled();
        expect(response).toEqual(null);
      });
    });

    describe('visual level filters', function () {
      it('visual.getFilters() sends GET /report/pages/xyz/visuals/uvw/filters', async function () {
        // Arrange
        spyHpm.get.and.callFake(() => Promise.resolve({}));

        // Act
        await visual1.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
      });

      it('visual.getFilters() return promise that rejects with server error if there was error getting filters', async function () {
        // Arrange
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));

        try {
          // Act
          await visual1.getFilters();
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('visual.getFilters() returns promise that resolves with list of filters', async function () {
        // Arrange
        const testData = {
          expectedResponse: {
            body: [
              { x: 'fakeFilter1' },
              { x: 'fakeFilter2' }
            ]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.expectedResponse));

        // Act
        const filters = await visual1.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
        // @ts-ignore as testData is not of type IFilter
        expect(filters).toEqual(testData.expectedResponse.body);
      });

      it('visual.setFilters(filters) sends PUT /report/pages/xyz/visuals/uvw/filters', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ],
          response: {
            body: []
          }
        };

        spyHpm.put.and.returnValue(Promise.resolve(testData.response));

        // Act
        await visual1.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
      });

      it('visual.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ],
          expectedErrors: {
            body: [
              {
                message: 'target is invalid, missing property x'
              }
            ]
          }
        };

        spyHpm.put.and.callFake(() => Promise.reject(testData.expectedErrors));
        try {
          // Act
          await visual1.setFilters(testData.filters);
          fail("setFilters shouldn't succeed");
        } catch (errors) {
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
          expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
        }
      });

      it('visual.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', async function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));
        try {
          // Act
          const response = await visual1.setFilters(testData.filters);
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        } catch (error) {
          console.log("setFilters failed with", error);
          fail("setFilters failed");
        }
      });

      it('visual.removeFilters() sends PUT /report/pages/xyz/visuals/uvw/filters', async function () {
        // Arrange

        // Act
        await visual1.removeFilters();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
      });

      it('visual.removeFilters() returns promise that resolves with null if request is accepted', async function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve(null));

        // Act
        const response = await visual1.removeFilters();
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
        expect(response).toEqual(null);
      });
    });

    describe('page', function () {
      describe('filters', function () {
        it('page.getFilters() sends GET /report/pages/xyz/filters', async function () {
          // Arrange
          spyHpm.get.and.callFake(() => Promise.resolve({}));

          // Act
          await page1.getFilters();

          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
        });

        it('page.getFilters() return promise that rejects with server error if there was error getting filters', async function () {
          // Arrange
          const testData = {
            expectedError: {
              body: {
                message: 'internal server error'
              }
            }
          };

          spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
          try {
            // Act
            await page1.getFilters();
          } catch (error) {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
            expect(error).toEqual(testData.expectedError.body);
          }
        });

        it('page.getFilters() returns promise that resolves with list of filters', async function () {
          // Arrange
          const testData = {
            expectedResponse: {
              body: [
                { x: 'fakeFilter1' },
                { x: 'fakeFilter2' }
              ]
            }
          };

          spyHpm.get.and.returnValue(Promise.resolve(testData.expectedResponse));

          // Act
          const filters = await page1.getFilters();
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, jasmine.any(Object));
          // @ts-ignore as testData is not of type IFilter
          expect(filters).toEqual(testData.expectedResponse.body);
        });

        it('page.setFilters(filters) sends PUT /report/pages/xyz/filters', async function () {
          // Arrange
          const testData = {
            filters: [
              (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
              (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
            ],
            response: {
              body: []
            }
          };

          spyHpm.put.and.returnValue(Promise.resolve(testData.response));

          // Act
          await page1.setFilters(testData.filters);

          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
        });

        it('page.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', async function () {
          // Arrange
          const testData = {
            filters: [
              (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
              (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
            ],
            expectedErrors: {
              body: [
                {
                  message: 'target is invalid, missing property x'
                }
              ]
            }
          };

          spyHpm.put.and.callFake(() => Promise.reject(testData.expectedErrors));
          try {
            // Act
            await page1.setFilters(testData.filters);
          } catch (errors) {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
            expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
          }
        });

        it('page.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', async function () {
          // Arrange
          const testData = {
            filters: [
              (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
              (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
            ]
          };

          spyHpm.put.and.returnValue(Promise.resolve(null));

          // Act
          const response = await page1.setFilters(testData.filters);
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        });

        it('page.removeFilters() sends PUT /report/pages/xyz/filters', async function () {
          // Arrange

          // Act
          await page1.removeFilters();

          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
        });

        it('page.removeFilters() returns promise that resolves with null if request is accepted', async function () {
          // Arrange
          spyHpm.post.and.returnValue(Promise.resolve(null));

          // Act
          const response = await page1.removeFilters();
          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { filtersOperation: models.FiltersOperations.RemoveAll, filters: undefined }, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        });
      });

      describe('setActive', function () {
        it('page.setActive() sends PUT /report/pages/active', async function () {
          // Arrange
          const testData = {
            page: {
              name: page1.name,
              displayName: null,
              isActive: true,
            }
          };

          spyHpm.put.and.returnValue(Promise.resolve(null));

          // Act
          await page1.setActive();

          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, jasmine.any(Object));
        });

        it('page.setActive() returns a promise rejected with errors if the page was invalid', async function () {
          // Arrange
          const testData = {
            page: {
              name: page1.name,
              displayName: null,
              isActive: true,
            },
            response: {
              body: [
                {
                  message: 'page abc123 does not exist on report xyz'
                }
              ]
            }
          };

          spyHpm.put.and.callFake(() => Promise.reject(testData.response));
          try {
            // Act
            await page1.setActive();
            fail("setActive should have failed");
          } catch (errors) {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, jasmine.any(Object));
            expect(errors).toEqual(jasmine.objectContaining(testData.response.body));
          }
        });

        it('page.setActive() returns a promise resolved with null if the page is valid', async function () {
          // Arrange
          const testData = {
            page: {
              name: page1.name,
              displayName: null,
              isActive: true,
            }
          };

          spyHpm.put.and.returnValue(Promise.resolve(null));

          // Act
          const response = await page1.setActive();

          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        });
      });
      describe('custom layout', function () {
        it('page.setVisualDisplayState returns promise that rejects with validation error if display state is invalid', async function () {
          // Arrange
          const visualName = 'visual';
          const displayState = 2;
          const testData = {
            expectedError: {
              body: {
                message: 'display state is invalid'
              }
            }
          };

          spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
          try {
            // Act
            await page1.setVisualDisplayState(visualName, displayState);
            fail("setVisualDisplayState should have failed");
          } catch (error) {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
            expect(error).toEqual(testData.expectedError.body);
          }
        });

        it('page.setVisualDisplayState returns promise that resolves with null if requst is valid and accepted', async function () {
          // Arrange
          const visualName = 'visual';
          const displayState = models.VisualContainerDisplayMode.Visible;

          spyApp.setVisualDisplayState.and.returnValue(Promise.resolve(null));

          // Act
          const response = await spyApp.setVisualDisplayState(visualName, displayState);
          // Assert
          expect(spyApp.setVisualDisplayState).toHaveBeenCalled();
          expect(response).toEqual(null);
        });

        it('page.moveVisual returns promise that rejects with validation error if visual name is invalid', async function () {
          // Arrange
          const visualName = 'invalid visual';
          const x = 0;
          const y = 0;
          const testData = {
            expectedError: {
              body: {
                message: 'visual name is invalid'
              }
            }
          };

          spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
          try {
            // Act
            await page1.moveVisual(visualName, x, y);
          } catch (error) {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, jasmine.any(Object));
            expect(error).toEqual(testData.expectedError.body);
          }
        });

        it('page.moveVisual returns promise that resolves with null if requst is valid and accepted', async function () {
          // Arrange
          const visualName = 'visual';
          const x = 0;
          const y = 0;

          spyApp.moveVisual.and.returnValue(Promise.resolve(null));

          // Act
          const response = await spyApp.moveVisual(visualName, x, y);
          // Assert
          expect(spyApp.moveVisual).toHaveBeenCalled();
          expect(response).toEqual(null);

        });

        it('page.resizePage returns promise that rejects with validation error if page is not active page', async function () {
          // Arrange=-
          const pageSizeType = 1;
          const width = 200;
          const height = 100;
          const testData = {
            expectedError: {
              message: 'Cannot resize the page. Only the active page can be resized'
            },
            settings: {
              layoutType: models.LayoutType.Custom,
              customLayout: {
                pageSize: {
                  type: pageSizeType,
                  width: width,
                  height: height
                }
              }
            }
          };

          spyHpm.patch.and.callFake(() => Promise.reject(testData.expectedError.message));
          try {
            // Act
            await page1.resizePage(pageSizeType, width, height);
          } catch (error) {
            // Assert
            expect(spyHpm.patch).not.toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
            expect(error).toEqual(testData.expectedError.message);
          }
        });

        it('page.resizePage returns promise that resolves with null if page is active page', async function () {
          // Arrange
          const pageSizeType = 1;
          const width = 200;
          const height = 100;
          const testData = {
            settings: {
              layoutType: models.LayoutType.Custom,
              customLayout: {
                pageSize: {
                  type: pageSizeType,
                  width: width,
                  height: height
                }
              }
            }
          };

          page1.isActive = true;
          spyHpm.patch.and.returnValue(Promise.resolve(null));

          // Act
          const response = await page1.resizePage(pageSizeType, width, height);
          // Assert
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, jasmine.any(Object));
          expect(response).toEqual(null);
        });

        it('page.resizePage returns promise that resolves with null if request is valid and accepted', async function () {
          // Arrange
          const pageSizeType = models.PageSizeType.Custom;
          const width = 200;
          const height = 100;

          spyApp.resizeActivePage.and.returnValue(Promise.resolve(null));

          // Act
          const response = await spyApp.resizeActivePage(pageSizeType, width, height);
          // Assert
          expect(spyApp.resizeActivePage).toHaveBeenCalled();
          expect(response).toEqual(null);
        });
      });
    });

    describe('setDisplayName', function () {
      it('page.setDisplayName(displayName) sends PUT /report/pages/{pageName}/name', async function () {
        // Arrange
        const displayName = "newName";
        const testData = {
          page: {
            name: page1.name,
            displayName,
          }
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        await page1.setDisplayName(displayName);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/name`, testData.page, { uid: uniqueId }, jasmine.any(Object));
      });
    });

    describe('getVisualByName', function () {
      it('page.getVisualByName(visualName) returns promise that rejects if visual with given name not found', async function () {
        // Arrange
        const pageName = page1.name;
        const visualName = "visual1";
        const testData = {
          expectedError: {
            body: {
              message: 'visual not found'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await page1.getVisualByName(visualName);
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${pageName}/visuals`, { uid: uniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('page.getVisualByName(visualName) returns promise that resolves with visual if request is successful', async function () {
        // Arrange
        const visualName = "visual1";
        const testData = {
          expectedResponse:
          {
            name: "visual1",
            title: "Visual 1",
            type: "type1",
            layout: {},
            page: {}
          }
        };

        spyApp.getVisualByName.and.returnValue(Promise.resolve(testData.expectedResponse));

        // Act
        const visual = await spyApp.getVisualByName(visualName);

        // Assert
        expect(spyApp.getVisualByName).toHaveBeenCalled();
        expect(visual.name).toEqual(testData.expectedResponse.name);
        expect(visual.title).toEqual(testData.expectedResponse.title);
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
        const attemptToSubscribeToEvent = (): void => {
          report.on(testData.eventName, testData.handler);
        };

        // Assert
        expect(attemptToSubscribeToEvent).toThrowError();
      });
    });

    describe('theme', function () {
      it('report.getTheme() sends GET /report/theme', async function () {
        // Arrange
        const testData = {
          response: {
            body: [
              {
                themeJson: {name: "Theme ABC 123"}
              }
            ]
          }
        };

        const expectedHeaders = {
          uid: uniqueId,
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.response));
        try {
          await report.getTheme();
          expect(spyHpm.get).toHaveBeenCalledWith('/report/theme', expectedHeaders, jasmine.any(Object));
        } catch (error) {
          console.log("getTheme failed with", error);
          fail("getTheme failed");
        }
      });

      it('report.applyTheme(theme) sends PUT /report/theme with theme in body', async function () {
        // Arrange
        const testData = {
          theme: {
            themeJson: {
              name: "Theme ABC 123"
            }
          },
          response: {
            body: null
          }
        };

        const expectedHeaders = {
          uid: uniqueId,
        };

        spyHpm.put.and.returnValue(Promise.resolve(testData.response));
        try {
          await report.applyTheme(testData.theme);
          expect(spyHpm.put).toHaveBeenCalledWith('/report/theme', jasmine.objectContaining(testData.theme), expectedHeaders, jasmine.any(Object));
        } catch (error) {
          console.log("applyTheme failed with", error);
          fail("applyTheme failed");
        }
      });

      it('report.resetTheme() sends PUT /report/theme with empty object as theme in body', async function () {
        // Arrange
        const response = {
          body: null
        };

        const expectedHeaders = {
          uid: uniqueId,
        };

        spyHpm.put.and.returnValue(Promise.resolve(response));

        try {
          await report.resetTheme();
          expect(spyHpm.put).toHaveBeenCalledWith('/report/theme', {}, expectedHeaders, jasmine.any(Object));
        } catch (error) {
          console.log("resetTheme failed with", error);
          fail("resetTheme failed");
        }
      });
    });
  });

  describe('createReport', function () {
    let createElement: HTMLDivElement;
    let create: create.Create;

    beforeEach(async () => {
      createElement = document.createElement('div');
      createElement.className = 'powerbi-create-container';
      document.body.appendChild(createElement);

      const embedCreateConfiguration = {
        datasetId: "fakeReportId",
        accessToken: 'fakeToken',
        tokenType: models.TokenType.Aad,
        embedUrl: iframeSrc,
        eventHooks: { accessTokenProvider: function () { return null; } }
      };
      spyHpm.post.and.returnValue(Promise.resolve({}));
      create = <create.Create>powerbi.createReport(createElement, embedCreateConfiguration);
      createUniqueId = create.config.uniqueId;
      const createIframe = createElement.getElementsByTagName('iframe')[0];
      await new Promise<void>((resolve, _reject) => createIframe.addEventListener('load', () => resolve(null)));
      spyHpm.post.and.callThrough();
    });

    afterEach(() => {
      powerbi.reset(createElement);
      createElement.remove();
    });

    it('create.createReport() sends POST /report/create with configuration in body', async function () {
      // Arrange
      const testData = {
        createConfiguration: {
          datasetId: 'fakeId',
          accessToken: 'fakeToken'
        },
        response: {
          body: null
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(testData.response));

      // Act
      await create.createReport(testData.createConfiguration);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId, tokenProviderSupplied: true }, jasmine.any(Object));
    });

    it('create.createReport() returns promise that rejects with validation error if the create configuration is invalid', async function () {
      // Arrange
      const testData = {
        createConfiguration: {
          datasetId: 'fakeId',
          accessToken: 'fakeToken',
          tokenType: models.TokenType.Aad,
          eventHooks: { accessTokenProvider: function () { return null; } }
        },
        errorResponse: {
          body: {
            message: "invalid configuration object"
          }
        }
      };

      spyHpm.post.and.callFake(() => Promise.reject(testData.errorResponse));
      try {
        // Act
        await create.createReport(testData.createConfiguration);

      } catch (error) {
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId , tokenProviderSupplied: true}, jasmine.any(Object));
        expect(error).toEqual(testData.errorResponse.body);
      }
    });

    it('create.createReport() returns promise that resolves with null if create report was successful', async function () {
      // Arrange
      const testData = {
        createConfiguration: {
          datasetId: 'fakeId',
          accessToken: 'fakeToken',
          tokenType: models.TokenType.Aad,
          eventHooks: { accessTokenProvider: function () { return null; } }
        },
        response: {
          body: null
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(testData.response));

      // Act
      const response = await create.createReport(testData.createConfiguration);
      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId, tokenProviderSupplied: true }, jasmine.any(Object));
      expect(response).toEqual(null);
    });
  });

  describe('dashboard', function () {
    let dashboardElement: HTMLDivElement;
    let dashboard: dashboard.Dashboard;

    beforeEach(async () => {
      dashboardElement = document.createElement('div');
      dashboardElement.className = 'powerbi-dashboard-container';
      document.body.appendChild(dashboardElement);

      const dashboardEmbedConfiguration = {
        type: "dashboard",
        id: "fakeDashboardId",
        accessToken: 'fakeToken',
        embedUrl: iframeSrc
      };
      spyHpm.post.and.returnValue(Promise.resolve({}));
      dashboard = <dashboard.Dashboard>powerbi.embed(dashboardElement, dashboardEmbedConfiguration);
      dashboardUniqueId = dashboard.config.uniqueId;
      const dashboardIframe = dashboardElement.getElementsByTagName('iframe')[0];
      await new Promise<void>((resolve, _reject) => {
        dashboardIframe.addEventListener('load', () => resolve(null));
      });
      spyHpm.post.and.callThrough();
    });

    afterEach(() => {
      powerbi.reset(dashboardElement);
      dashboardElement.remove();
    });

    it('dashboard.load() sends POST /dashboard/load with configuration in body', async function () {
      spyHpm.post.and.returnValue(Promise.resolve({}));
      try {
        // Act
        dashboard.iframeLoaded = true;
        await dashboard.load();
        const expectedHeaders = {
          bootstrapped: undefined,
          sdkVersion: sdkConfig.default.version,
          uid: dashboardUniqueId,
          sdkSessionId: sdkSessionId
        };
        expect(spyHpm.post).toHaveBeenCalled();
        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/dashboard/load', dashboard.config, expectedHeaders, jasmine.any(Object));

      } catch (error) {
        console.log("dashboard load failed with", error);
        fail("dashboard load failed");
      }
    });
  });

  describe('visual', function () {
    let visualElement: HTMLDivElement;
    let embeddedVisual: visual.Visual;

    beforeEach(async () => {
      visualElement = document.createElement('div');
      visualElement.className = 'powerbi-report-container';
      document.body.appendChild(visualElement);

      visualEmbedConfiguration = {
        id: "visual1",
        accessToken: 'fakeToken',
        embedUrl: iframeSrc,
        type: "visual",
        pageName: "ReportSection1",
        visualName: "VisualContainer1",
        width: 1200,
        height: 1000
      };
      spyHpm.post.and.callFake(() => Promise.resolve({}));
      embeddedVisual = powerbi.embed(visualElement, visualEmbedConfiguration) as any as visual.Visual;
      visualUniqueId = embeddedVisual.config.uniqueId;
      const visualFrame = visualElement.getElementsByTagName('iframe')[0];
      await new Promise<void>((resolve, _reject) => {
        visualFrame.addEventListener('load', () => resolve(null));
      });
      spyHpm.post.and.callThrough();
    });

    afterEach(() => {
      powerbi.reset(visualElement);
      visualElement.remove();
    });

    it('powerbi.embed with visual name sends POST /report/load with custom layout configuration in body', async function () {

      let testData = {
        loadConfiguration: visualEmbedConfiguration,
        response: {
          body: null
        }
      };

      let expectedConfiguration = {
        id: visualEmbedConfiguration.id,
        accessToken: visualEmbedConfiguration.accessToken,
        embedUrl: visualEmbedConfiguration.embedUrl,
        type: visualEmbedConfiguration.type,
        pageName: visualEmbedConfiguration.pageName,
        visualName: visualEmbedConfiguration.visualName,
        width: visualEmbedConfiguration.width,
        height: visualEmbedConfiguration.height,
        groupId: undefined,
        uniqueId: embeddedVisual.config.uniqueId,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: false,
          layoutType: models.LayoutType.Custom,
          customLayout: {
            displayOption: models.DisplayOption.FitToPage,
            pageSize: {
              type: models.PageSizeType.Custom,
              width: testData.loadConfiguration.width,
              height: testData.loadConfiguration.height,
            },
            pagesLayout: {
              ReportSection1: {
                defaultLayout: {
                  displayState: {
                    mode: models.VisualContainerDisplayMode.Hidden
                  }
                },
                visualsLayout: {
                  VisualContainer1: {
                    displayState: {
                      mode: models.VisualContainerDisplayMode.Visible
                    },
                    x: 1,
                    y: 1,
                    z: 1,
                    width: testData.loadConfiguration.width,
                    height: testData.loadConfiguration.height
                  }
                }
              }
            }
          }
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(testData.response));

      // Act
      let inputConfig = utils.assign({}, embeddedVisual.config, visualEmbedConfiguration);
      embeddedVisual.config = inputConfig;

      await embeddedVisual.load();
      // Assert
      expect(spyHpm.post).toHaveBeenCalled();

      let spyArgs = spyHpm.post.calls.mostRecent().args;
      expect(spyArgs[0]).toEqual('/report/load');
      expect(spyArgs[1]).toEqual(expectedConfiguration);
      expect(spyArgs[2]).toEqual({
        bootstrapped: undefined,
        sdkVersion: sdkConfig.default.version,
        uid: visualUniqueId,
        sdkSessionId: sdkSessionId
      });
    });

    it('embeddedVisual.getFilters(models.FiltersLevel.Report) sends GET /report/filters', async function () {
      spyHpm.get.and.callFake(() => Promise.resolve({}));

      // Act
      await embeddedVisual.getFilters(models.FiltersLevel.Report);

      // Assert
      expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('embeddedVisual.setFilters(filters, models.FiltersLevel.Report) sends PUT /report/filters', async function () {
      // Arrange
      const testData = {
        filters: [
          (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
          (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
        ]
      };

      // Act
      await embeddedVisual.setFilters(testData.filters, models.FiltersLevel.Report);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('embeddedVisual.getFilters(models.FiltersLevel.Page) sends GET /report/pages/ReportSection1/filters', async function () {
      spyHpm.get.and.callFake(() => Promise.resolve({}));

      // Act
      await embeddedVisual.getFilters(models.FiltersLevel.Page);

      // Assert
      expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/filters`, { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('embeddedVisual.setFilters(filters, models.FiltersLevel.Page) sends PUT /report/pages/ReportSection1/filters', async function () {
      // Arrange
      const testData = {
        filters: [
          (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
          (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
        ],
        response: {
          body: []
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(testData.response));

      // Act
      await embeddedVisual.setFilters(testData.filters, models.FiltersLevel.Page);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/ReportSection1/filters`, testData.filters, { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('embeddedVisual.getFilters() sends GET /report/pages/ReportSection1/visuals/VisualContainer1/filters', async function () {
      spyHpm.get.and.callFake(() => Promise.resolve({}));

      // Act
      await embeddedVisual.getFilters();

      // Assert
      expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals/VisualContainer1/filters`, { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('embeddedVisual.setFilters(filters) sends PUT /report/pages/ReportSection1/visuals/VisualContainer1/filters', async function () {
      // Arrange
      const testData = {
        filters: [
          (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
          (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
        ],
        response: {
          body: []
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(testData.response));

      // Act
      await embeddedVisual.setFilters(testData.filters);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals/VisualContainer1/filters`, testData.filters, { uid: visualUniqueId }, jasmine.any(Object));
    });

    it('Not supported visual method: getPages', function () {
      // Act
      const attempt = (): void => {
        embeddedVisual.getPages();
      };

      // Assert
      expect(attempt).toThrow(visual.Visual.GetPagesNotSupportedError);
    });

    it('Not supported visual method: setPage', function () {
      // Act
      const attempt = (): void => {
        embeddedVisual.setPage(null);
      };

      // Assert
      expect(attempt).toThrow(visual.Visual.SetPageNotSupportedError);
    });

    describe('getVisualDescriptor', function () {
      it('embeddedVisual.getVisualDescriptor() sends GET /report/pages/xyz/visuals', async function () {
        // Act
        try {
          await embeddedVisual.getVisualDescriptor();
        } catch (error) {
          // The test only needs to check hpm request
        }

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals`, { uid: visualUniqueId }, jasmine.any(Object));
      });

      it('embeddedVisual.getVisualDescriptor() returns promise that rejects with server error if there was error getting visual details', async function () {
        // Arrange
        const testData = {
          expectedError: {
            body: {
              message: 'internal server error'
            }
          }
        };

        spyHpm.get.and.callFake(() => Promise.reject(testData.expectedError));
        try {
          // Act
          await embeddedVisual.getVisualDescriptor();
          fail("getVisualDescriptor should succeed");
        } catch (error) {
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals`, { uid: visualUniqueId }, jasmine.any(Object));
          expect(error).toEqual(testData.expectedError.body);
        }
      });

      it('embeddedVisual.getVisualDescriptor() returns promise that resolves with visual details', async function () {
        // Arrange
        const fakeVisualDescriptor = new visualDescriptor.VisualDescriptor(page1, visualEmbedConfiguration.visualName, 'title', 'type', {});
        const testData = {
          expectedResponse: {
            body: [fakeVisualDescriptor]
          }
        };

        spyHpm.get.and.returnValue(Promise.resolve(testData.expectedResponse));

        try {
          // Act
          const visualDescriptor = await embeddedVisual.getVisualDescriptor();
          // Assert
          expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals`, { uid: visualUniqueId }, jasmine.any(Object));
          expect(visualDescriptor.name).toEqual(fakeVisualDescriptor.name);
        } catch (error) {
          console.log("getVisualDescriptor failed with", error);
          fail("getVisualDescriptor failed");
        }
      });
    });
  });
});
