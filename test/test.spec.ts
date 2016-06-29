import * as service from '../src/service';
import * as embed from '../src/embed';
import * as report from '../src/report';
import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import * as models from 'powerbi-models';
import { spyApp, setupMockApp } from './utility/mockReportEmbed';
import * as factories from '../src/factories';
import { spyWpmp } from './utility/mockWpmp';
import { spyHpm } from './utility/mockHpm';
import { spyRouter } from './utility/mockRouter';

declare global {
  interface Window {
    __karma__: any;
  }
}

let logMessages = (window.__karma__.config.args[0] === 'logMessages');

describe('service', function () {
  let powerbi: service.Service;
  let $element: JQuery;

  beforeAll(function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    powerbi.accessToken = 'ABC123';
    $element = $('<div id="powerbi-fixture"></div>').appendTo(document.body);
  });

  afterAll(function () {
    $element.remove();
    powerbi.wpmp.stop();
  });

  afterEach(function () {
    $element.empty();
  });

  it('is defined', function () {
    expect(powerbi).toBeDefined();
  });

  describe('init', function () {
    it('embeds all components found in the DOM', function () {
      // Arrange
      const elements = [
        '<div powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
        '<div powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=XYZ456" powerbi-type="report"></div>',
      ];

      elements.forEach(element => {
        $(element).appendTo('#powerbi-fixture');
      });

      // Act
      powerbi.init();

      // Assert
      // If embed element has iframe inside it, assume embed action occurred
      const iframes = document.querySelectorAll('[powerbi-embed-url] iframe');
      expect(iframes.length).toEqual(2);
    });
  });

  describe('get', function () {
    it('if attempting to get a powerbi component on an element which was not embedded, throw an error', function () {
      // Arrange
      const $component = $('<div></div>');

      // Act
      const attemptGet = () => {
        powerbi.get($component[0]);
      };

      // Assert
      expect(attemptGet).toThrowError(Error);
    });

    it('calling get on element with embeded component returns the instance', function () {
      // Arrange
      const $element = $('<div powerbi-type="report" powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123"></div>')
        .appendTo('#powerbi-fixture');

      const componentInstance = powerbi.embed($element[0]);

      // Act
      const componentInstance2 = powerbi.get($element[0]);

      // Assert
      expect(componentInstance).toEqual(componentInstance2);
    })
  });

  describe('embed', function () {
    it('if attempting to embed without specifying a type, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        powerbi.embed(component[0]);
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if attempting to embed with an unknown type, throw error', function () {
      // Arrange
      const component = $('<div powerbi-type="unknownType"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        powerbi.embed(component[0]);
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if attempting to embed without specifying an embed url, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        powerbi.embed(component[0], { type: "report", embedUrl: null, accessToken: null, id: null });
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if attempting to embed without specifying an access token, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      const originalToken = powerbi.accessToken;
      powerbi.accessToken = undefined;

      // Act
      const attemptEmbed = () => {
        powerbi.embed(component[0], { type: "report", embedUrl: null, accessToken: null, id: null });
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);

      // Cleanup
      powerbi.accessToken = originalToken;
    });

    it('if attempting to embed without specifying an id, throw error', function () {
      // Arrange
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const attemptToEmbed = () => {
        powerbi.embed($reportContainer[0]);
      };

      // Assert
      expect(attemptToEmbed).toThrowError();
    });

    it('should get uqiqueId from config first', function () {
      // Arrange
      const testUniqueId = 'fakeUniqueId';
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-name="differentUniqueId"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0], { uniqueId: testUniqueId });

      // Assert
      expect(report.config.uniqueId).toEqual(testUniqueId);
    });

    it('should get uqiqueId from name attribute if uniqueId is not specified in config', function () {
      // Arrange
      const testUniqueId = 'fakeUniqueId';
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-name="${testUniqueId}"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect(report.config.uniqueId).toEqual(testUniqueId);
    });

    it('should generate uqiqueId if uniqueId is not specified in config or attribute', function () {
      // Arrange
      const testUniqueId = 'fakeUniqueId';
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect(report.config.uniqueId).toEqual(jasmine.any(String));
    });

    it('if component is already embedded in element re-use the existing component by calling load with the new information', function () {
      // Arrange
      const $element = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const component = powerbi.embed($element[0]);
      spyOn(component, "load");

      const testConfiguration = {
        accessToken: undefined,
        embedUrl: 'fakeUrl',
        id: 'report2'
      };

      // Act
      const component2 = powerbi.embed($element[0], testConfiguration);

      // Assert
      expect(component.load).toHaveBeenCalledWith(testConfiguration);
      expect(component2).toBe(component);
    });

    it('if component was not previously created, creates an instance and return it', function () {
      // Arrange
      var component = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      var report = powerbi.embed(component[0]);

      // Assert
      expect(report).toBeDefined();
    });

    it("looks for a token first from attribute 'powerbi-access-token'", function () {
      // Arrange
      var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
      var testToken = "fakeToken1";
      var $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-access-token="${testToken}"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      powerbi.embed($reportContainer[0]);

      // Assert
      var report = powerbi.get($reportContainer[0]);
      // TODO: Find way to prevent using private method getAccessToken.
      // Need to know what token the report used, but don't have another option?
      // To properly only test public methods but still confirm this we would need to create special iframe which echoed all
      // messages and then we could test what it received
      var accessToken = (<any>report).getAccessToken();

      expect(accessToken).toEqual(testToken);
    });

    it("if token is not found by attribute 'powerbi-access-token', fallback to using global", function () {
      // Arrange
      var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
      var testToken = "fakeToken1";
      var $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      var originalToken = powerbi.accessToken;
      powerbi.accessToken = testToken;

      // Act
      powerbi.embed($reportContainer[0]);

      // Assert
      var report = powerbi.get($reportContainer[0]);
      var accessToken = report.config.accessToken;

      expect(accessToken).toEqual(testToken);

      // Cleanup
      powerbi.accessToken = originalToken;
    });

    describe('reports', function () {
      it('creates report iframe from embedUrl', function () {
        // Arrange
        var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
        var $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        let report = powerbi.embed($reportContainer[0]);

        // Assert
        var iframe = $reportContainer.find('iframe');
        expect(iframe.length).toEqual(1);
        expect(iframe.attr('src')).toEqual(embedUrl);
      });

      describe('findIdFromEmbedUrl', function () {
        it('should return value of reportId query parameter in embedUrl', function () {
          // Arrange
          const testReportId = "ABC123";
          const testEmbedUrl = `http://embedded.powerbi.com/appTokenReportEmbed?reportId=${testReportId}`;

          // Act
          const reportId = report.Report.findIdFromEmbedUrl(testEmbedUrl);

          // Assert
          expect(reportId).toEqual(testReportId);
        });

        it('should return undefinded if the query parameter is not in the url', function () {
          // Arrange
          const testEmbedUrl = `http://embedded.powerbi.com/appTokenReportEmbed`;

          // Act
          const reportId = report.Report.findIdFromEmbedUrl(testEmbedUrl);

          // Assert
          expect(reportId).toBeUndefined();
        });
      });

      it('should get report id from configuration first', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=DIFFERENTID`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.embed($reportContainer[0], { id: testReportId });

        // Assert
        expect(report.config.id).toEqual(testReportId);
      });

      it('should fallback to using id from attribute if not supplied in embed/load configuration', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=DIFFERENTID`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="${testReportId}"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.embed($reportContainer[0]);

        // Assert
        expect(report.config.id).toEqual(testReportId);
      });

      it('should fallback to using id from embedUrl if not supplied in embed/load configuration or attribute', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=${testReportId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.embed($reportContainer[0]);

        // Assert
        expect(report.config.id).toEqual(testReportId);
      });
    });

    xdescribe('tiles', function () {
      it('creates tile iframe from embedUrl', function () {
        // Arrange
        var embedUrl = 'https://app.powerbi.com/embed?dashboardId=D1&tileId=T1';
        var $tileContainer = $('<div powerbi-embed-url="' + embedUrl + '" powerbi-type="tile"></div>')
          .appendTo('#powerbi-fixture');

        // Act
        let tile = powerbi.embed($tileContainer[0]);

        // Assert
        var iframe = $tileContainer.find('iframe');
        expect(iframe.length).toEqual(1);
        expect(iframe.attr('src')).toEqual(embedUrl);
      });
    });
  });

  describe('reset', function () {
    it('deletes the powerBiEmbed property on the element', function () {
      // Arrange
      const $element = $('<div></div>');
      powerbi.embed($element.get(0), {
        type: 'report',
        embedUrl: 'fakeUrl',
        id: 'fakeId',
        accessToken: 'fakeToken'
      });

      // Act
      expect((<service.IPowerBiElement>$element.get(0)).powerBiEmbed).toBeDefined();
      powerbi.reset($element.get(0));

      // Assert
      expect((<service.IPowerBiElement>$element.get(0)).powerBiEmbed).toBeUndefined();
    });

    it('clears the innerHTML of the element', function () {
      // Arrange
      const $element = $('<div></div>');
      powerbi.embed($element.get(0), {
        type: 'report',
        embedUrl: 'fakeUrl',
        id: 'fakeReportId',
        accessToken: 'fakeToken'
      });

      // Act
      var iframe = $element.find('iframe');
      expect(iframe.length).toEqual(1);
      powerbi.reset($element.get(0));

      // Assert
      expect($element.html()).toEqual('');
    });

    it('removes the powerbi instance from the list of embeds', function () {
      // Arrange
      const $element = $('<div></div>');
      const testEmbedConfig = {
        type: 'report',
        embedUrl: 'fakeUrl',
        id: 'fakeReportId',
        accessToken: 'fakeToken',
        uniqueId: 'fakeUniqeId'
      };
      powerbi.embed($element.get(0), testEmbedConfig);

      // Act
      const report = powerbi.find(testEmbedConfig.uniqueId);
      expect(report).toBeDefined();

      powerbi.reset($element.get(0));

      // Assert
      const report2 = powerbi.find(testEmbedConfig.uniqueId);
      expect(report2).toBeUndefined();
    });
  });
});

describe('embed', function () {
  let powerbi: service.Service;
  let $element: JQuery;
  let $container: JQuery;
  let $iframe: JQuery;

  beforeAll(function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    powerbi.accessToken = 'ABC123';
    $element = $('<div id="powerbi-fixture"></div>').appendTo(document.body);
  });

  beforeEach(function () {
    $container = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
      .appendTo('#powerbi-fixture');

    powerbi.embed($container[0]);
    $iframe = $container.find('iframe');
  });

  afterEach(function () {
    $element.empty();
  });

  afterAll(function () {
    $element.remove();
    powerbi.wpmp.stop();
  });

  describe('iframe', function () {
    it('has a src', function () {
      expect($iframe.attr('src').length).toBeGreaterThan(0);
    });

    it('disables scrollbars by default', function () {
      expect($iframe.attr('scrolling')).toEqual('no');
    });

    it('sets width/height to 100%', function () {
      expect($iframe[0].style.width).toEqual('100%');
      expect($iframe[0].style.height).toEqual('100%');
    });
  });

  describe('fullscreen', function () {
    it('sets the iframe as the fullscreen element', function () {
      var report = powerbi.get($container[0]);
      report.fullscreen();

      expect(document.webkitFullscreenElement === $iframe[0]);
    });
  });

  describe('exitFullscreen', function () {
    it('clears the iframe fullscreen element', function () {
      var report = powerbi.get($container[0]);
      report.fullscreen();
      report.exitFullscreen();

      expect(document.webkitFullscreenElement !== $iframe[0]);
    });
  });
});

describe('Protocol', function () {
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
    const iframeSrc = "base/test/utility/noop.html";
    const $iframe = $(`<iframe src="${iframeSrc}"></iframe>`).appendTo(document.body);
    iframe = <HTMLIFrameElement>$iframe.get(0);

    // Register Iframe side
    iframeHpm = setupMockApp(iframe.contentWindow, window, logMessages, 'ProtocolMockAppWpmp');

    // Register SDK side WPMP
    wpmp = factories.wpmpFactory('HostProxyDefaultNoHandlers', logMessages, iframe.contentWindow);
    hpm = factories.hpmFactory(iframe.contentWindow, wpmp, 'testVersion');
    const router = factories.routerFactory(wpmp);

    router.post('/reports/:uniqueId/events/:eventName', (req, res) => {
      handler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/pages/:pageName/events/:eventName', (req, res) => {
      handler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/visuals/:visualId/events/:eventName', (req, res) => {
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
    // wpmp.addHandler(handler);

    iframeLoaded = new Promise<void>((resolve, reject) => {
      iframe.addEventListener('load', () => {
        resolve(null);
      });
    });
  });

  afterAll(function () {
    wpmp.stop();
  });

  beforeEach(() => {
    // empty
  });

  afterEach(function () {
    spyHandler.test.calls.reset();
    spyHandler.handle.calls.reset();
  });

  describe('HPM-to-MockApp', function () {
    describe('notfound', function () {
      it('GET request to uknown url returns 404 Not Found', function (done) {
        iframeLoaded
          .then(() => {
            hpm.get<any>('route/that/does/not/exist')
              .catch(response => {
                expect(response.statusCode).toEqual(404);
                done();
              });
          });
      });

      it('POST request to uknown url returns 404 Not Found', function (done) {
        iframeLoaded
          .then(() => {
            hpm.post<any>('route/that/does/not/exist', null)
              .catch(response => {
                expect(response.statusCode).toEqual(404);
                done();
              });
          });
      });

      it('PUT request to uknown url returns 404 Not Found', function (done) {
        iframeLoaded
          .then(() => {
            hpm.put<any>('route/that/does/not/exist', null)
              .catch(response => {
                expect(response.statusCode).toEqual(404);
                done();
              });
          });
      });

      it('PATCH request to uknown url returns 404 Not Found', function (done) {
        iframeLoaded
          .then(() => {
            hpm.patch<any>('route/that/does/not/exist', null)
              .catch(response => {
                expect(response.statusCode).toEqual(404);
                done();
              });
          });
      });

      it('DELETE request to uknown url returns 404 Not Found', function (done) {
        iframeLoaded
          .then(() => {
            hpm.delete<any>('route/that/does/not/exist')
              .catch(response => {
                expect(response.statusCode).toEqual(404);
                done();
              });
          });
      });
    });

    describe('load', function () {
      it('POST /report/load returns 400 if the request is invalid', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validateLoad.and.returnValue(Promise.reject(null));

            // Act
            hpm.post<models.IError>('/report/load', testData.load, { uid: testData.uniqueId })
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

      it('POST /report/load causes POST /reports/:uniqueId/events/loaded', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.load.and.returnValue(Promise.resolve(testData.load));

            // Act
            hpm.post<void>('/report/load', testData.load, { uid: testData.uniqueId })
              .then(response => {
                setTimeout(() => {
                  // Assert
                  expect(spyApp.validateLoad).toHaveBeenCalledWith(testData.load);
                  expect(spyApp.load).toHaveBeenCalledWith(testData.load);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.get<models.IPage[]>('/report/pages')
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

      it('PUT /report/pages/active causes POST /reports/:uniqueId/events/pageChanged', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          page: {
            name: "fakeName"
          },
          
        };
        const expectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/pageChanged`,
          body: jasmine.objectContaining({
            initiator: 'sdk'
          })
        };

        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/pages/active', testData.page, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
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
            hpm.get<models.IFilter[]>('/report/filters')
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
            hpm.post<models.IError>('/report/filters', testData.filter)
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

      it('POST /report/filters will cause POST /reports/:uniqueId/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          filter: {
            name: "fakeFilter"
          }
        };
        const expectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterAdded`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.post<void>('/report/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
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
            hpm.put<models.IError>('/report/filters', testData.filter)
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

      it('PUT /report/filters will cause POST /reports/:uniqueId/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          filter: {
            name: "fakeFilter"
          }
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterUpdated`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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

      it('DELETE /report/allfilters causes POST /reports/:uniqueId/events/filtersCleared', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filtersCleared`
        };

        iframeLoaded
          .then(() => {

            // Act
            hpm.delete<void>('/report/allfilters', null, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                setTimeout(() => {
                  expect(spyApp.clearFilters).toHaveBeenCalled();
                  expect(response.statusCode).toEqual(202);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.delete<models.IError[]>('/report/filters', testData.filter)
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

      it('DELETE /report/filters will cause POST /reports/:uniqueId/events/filterRemoved', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          filter: {
            name: "fakeFilter"
          }
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterRemoved`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.delete<void>('/report/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.removeFilter).toHaveBeenCalledWith(testData.filter);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.get<models.IFilter[]>('/report/pages/xyz/filters')
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
            hpm.post<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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
            hpm.post<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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

      it('POST /report/pages/xyz/filters will cause POST /reports/:uniqueId/pages/xyz/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/pages/xyz/events/filterAdded`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.post<void>('/report/pages/xyz/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.put<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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
            hpm.put<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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

      it('PUT /report/pages/xyz/filters will cause POST /reports/:uniqueId/pages/xyz/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          expectedTarget: {
            type: "page",
            name: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/pages/xyz/events/filterUpdated`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/pages/xyz/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.delete<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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
            hpm.delete<models.IError[]>('/report/pages/xyz/filters', testData.filter)
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
            hpm.post<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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
            hpm.post<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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

      it('POST /report/visuals/xyz/filters will cause POST /reports/:uniqueId/visuals/xyz/events/filterAdded', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          expectedTarget: {
            type: "visual",
            id: "xyz"
          },
          filter: {
            name: "fakeFilter"
          }
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/visuals/xyz/events/filterAdded`
        };

        iframeLoaded
          .then(() => {
            spyApp.validateTarget.and.returnValue(Promise.resolve(null));
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.post<void>('/report/visuals/xyz/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.addFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.put<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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
            hpm.put<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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

      it('PUT /report/visuals/xyz/filters will cause POST /reports/:uniqueId/visuals/xyz/events/filterUpdated', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          expectedTarget: {
            type: "visual",
            id: "xyz"
          },
          filter: {
            name: "fakeFilter"
          },
          
        };
        const testExpectedEvent = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/visuals/xyz/events/filterUpdated`
        };
        

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/visuals/xyz/filters', testData.filter, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateTarget).toHaveBeenCalledWith(testData.expectedTarget);
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filter);
                expect(spyApp.updateFilter).toHaveBeenCalledWith(testData.filter, testData.expectedTarget);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
            hpm.delete<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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
            hpm.delete<models.IError[]>('/report/visuals/xyz/filters', testData.filter)
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
            navContentPaneEnabled: false
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.reject(null));

            // Act
            hpm.patch<models.IError[]>('/report/settings', testData.settings)
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
            navContentPaneEnabled: false
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

      it('PATCH /report/settings causes POST /reports/:uniqueId/events/settingsUpdated', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validateSettings.and.returnValue(Promise.resolve(null));
            spyApp.updateSettings.and.returnValue(Promise.resolve(testExpectedEvent.body.settings));

            // Act
            hpm.patch<void>('/report/settings', testData.settings, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                setTimeout(() => {
                  expect(spyApp.validateSettings).toHaveBeenCalledWith(testData.settings);
                  expect(spyApp.updateSettings).toHaveBeenCalledWith(testData.settings);
                  expect(response.statusCode).toEqual(202);
                  expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
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
      it('POST /reports/:uniqueId/events/pageChanged when user changes page', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            page: {
              name: "fakePageName"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/pageChanged`,
          body: testData.event
        };

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post<void>(testExpectedRequest.url, testData.event)
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
      it('POST /reports/:uniqueId/events/filterAdded when user adds filter', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterAdded`,
          body: testData.event
        };

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post(testExpectedRequest.url, testData.event)
              .then(response => {
                // Assert
                expect(response.statusCode).toBe(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));

                done();
              });

            // Cleanup
          });
      });

      it('POST /reports/:uniqueId/events/filterUpdated when user changes filter', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterUpdated`,
          body: testData.event
        };

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post(testExpectedRequest.url, testData.event)
              .then(response => {
                // Assert
                expect(response.statusCode).toBe(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedRequest));

                done();
              });

            // Cleanup
          });
      });

      it('POST /reports/:uniqueId/events/filterRemoved when user removes filter', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          reportId: 'fakeReportId',
          event: {
            initiator: 'user',
            filter: {
              name: "fakeFilter"
            }
          }
        };
        const testExpectedRequest = {
          method: 'POST',
          url: `/reports/${testData.uniqueId}/events/filterRemoved`,
          body: testData.event
        };

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post(testExpectedRequest.url, testData.event)
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
      it('POST /reports/:uniqueId/events/settingsUpdated when user changes settings', function (done) {
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

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post(testExpectedRequest.url, testData.event)
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
      it('POST /reports/:uniqueId/events/dataSelected when user selects data', function (done) {
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

        iframeLoaded
          .then(() => {

            // Act
            iframeHpm.post(testExpectedRequest.url, testData.event)
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
  let $element: JQuery;
  let iframe: HTMLIFrameElement;
  let powerbi: service.Service;
  let report: report.Report;
  let uniqueId = 'uniqueId';
  let embedConfiguration: embed.IEmbedConfiguration;

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

    powerbi = new service.Service(spyHpmFactory, noop, spyRouterFactory, { wpmpName: 'SDK-to-HPM report wpmp' });

    $element = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/test/utility/noop.html";
    embedConfiguration = {
      type: "report",
      id: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);
    uniqueId = report.config.uniqueId;

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];

    // Reset load handler
    spyHpm.post.calls.reset();
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
    powerbi.wpmp.stop();
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
        loadConfiguration: {
          id: 'fakeId',
          accessToken: 'fakeToken'
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.load(testData.loadConfiguration);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.loadConfiguration, { uid: uniqueId });
    });

    it('report.load() returns promise that rejects with validation error if the load configuration is invalid', function (done) {
      // Arrange
      const testData = {
        loadConfiguration: {
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
      report.load(testData.loadConfiguration)
        .catch(error => {
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.loadConfiguration, { uid: uniqueId });
          expect(error).toEqual(testData.errorResponse.body);
          // Assert
          done();
        });
    });

    it('report.load() returns promise that resolves with null if the report load successful', function (done) {
      // Arrange
      const testData = {
        loadConfiguration: {
          id: 'fakeId',
          accessToken: 'fakeToken'
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.load(testData.loadConfiguration)
        .then(response => {
          expect(spyHpm.post).toHaveBeenCalledWith('/report/load', testData.loadConfiguration, { uid: uniqueId });
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
      expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId });
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
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId });
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
          expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId });
          expect(pages).toEqual(testData.expectedResponse.body);
          done();
        });
    });
  });

  describe('filters (report level)', function () {
    it('report.addFilter(filter) sends POST /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };


      // Act
      report.addFilter(testData.filter);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
    });

    it('report.addFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
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
          expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter)
        .then(response => {
          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter) sends PUT /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };


      // Act
      report.updateFilter(testData.filter);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
    });

    it('report.updateFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
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
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter)
        .then(response => {
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter) sends DELETE /report/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };


      // Act
      report.removeFilter(testData.filter);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
    });

    it('report.removeFilter(filter) returns promise that rejects with validation errors if filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
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
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON()
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter)
        .then(response => {
          // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });
  });

  describe('filters (page level)', function () {
    it('report.addFilter(filter, target) sends POST /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };


      // Act
      report.addFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
    });

    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
          expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter, target) sends PUT /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      // Act
      report.updateFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
          expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter, target) sends DELETE /report/pages/:pageName/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };


      // Act
      report.removeFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
          type: "page",
          name: "page1"
        }
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/pages/page1/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });
  });

  describe('filters (visual level)', function () {
    it('report.addFilter(filter, target) sends POST /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      // Act
      report.addFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
    });

    it('report.addFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
          expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.addFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.post.and.returnValue(Promise.resolve(null));

      // Act
      report.addFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.post).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.updateFilter(filter, target) sends PUT /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      // Act
      report.updateFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
    });

    it('report.updateFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
          expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.updateFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.put.and.returnValue(Promise.resolve(null));

      // Act
      report.updateFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.put).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
          expect(response).toEqual(null);
          done();
        });
    });

    it('report.removeFilter(filter, target) sends DELETE /report/visuals/:visualId/filters with filter', function () {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      // Act
      report.removeFilter(testData.filter, testData.target);

      // Assert
      expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
    });

    it('report.removeFilter(filter, target) returns promise that rejects with validation errors if target or filter is invalid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
          expect(errors).toEqual(testData.expectedErrors.body);
          done();
        });
    });

    it('report.removeFilter(filter, target) returns promise that resolves with null if request is valid', function (done) {
      // Arrange
      const testData = {
        filter: (new models.ValueFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
          type: "visual",
          id: "visualId"
        }
      };

      spyHpm.delete.and.returnValue(Promise.resolve(null));

      // Act
      report.removeFilter(testData.filter, testData.target)
        .then(response => {
          // Assert
          expect(spyHpm.delete).toHaveBeenCalledWith('/report/visuals/visualId/filters', testData.filter, { uid: uniqueId });
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
      expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId });
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
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId });
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
          expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId });
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
  });
});

describe('SDK-to-WPMP', function () {
  let $element: JQuery;
  let iframe: HTMLIFrameElement;
  let powerbi: service.Service;
  let report: report.Report;
  let uniqueId: string;

  beforeAll(function () {
    const spyWpmpFactory: factories.IWpmpFactory = (name?: string, logMessages?: boolean) => {
      return <Wpmp.WindowPostMessageProxy><any>spyWpmp;
    };

    powerbi = new service.Service(factories.hpmFactory, spyWpmpFactory, factories.routerFactory);

    $element = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/test/utility/noop.html";
    const embedConfiguration = {
      type: "report",
      id: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc,
      wpmpName: 'SDK-to-WPMP report wpmp'
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);
    uniqueId = report.config.uniqueId;

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];

    // Reset load handler
    spyWpmp.addHandler.calls.reset();
    spyHpm.post.calls.reset();
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
    powerbi.wpmp.stop();
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
    it(`handler passed to report.on(eventName, handler) is called when POST /report/:uniqueId/events/:eventName is received`, function () {
      // Arrange
      const testData = {
        eventName: 'pageChanged',
        handler: jasmine.createSpy('handler'),
        pageChangedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/pageChanged`,
            body: {
              initiator: 'sdk',
              page: {
                name: 'page1',
                displayName: 'Page 1'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.pageChangedEvent);

      // Assert
      expect(testData.handler).toHaveBeenCalledWith(testData.pageChangedEvent.data.body);
    });

    it(`off('eventName', handler) will remove single handler which matches function reference for that event`, function () {
      // Arrange
      const testData = {
        eventName: 'filterAdded',
        handler: jasmine.createSpy('handler1'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filterAdded`,
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.off(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).not.toHaveBeenCalled();
    });

    it('if multiple handlers for the same event are registered they will all be called', function () {
      // Arrange
      const testData = {
        eventName: 'filterAdded',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filterAdded`,
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.on(testData.eventName, testData.handler2);
      report.on(testData.eventName, testData.handler3);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).toHaveBeenCalledWith(testData.simulatedEvent.data.body);
      expect(testData.handler2).toHaveBeenCalledWith(testData.simulatedEvent.data.body);
      expect(testData.handler3).toHaveBeenCalledWith(testData.simulatedEvent.data.body);
    });


    it(`off('eventName') will remove all handlers which matches event name`, function () {
      // Arrange
      const testData = {
        eventName: 'filterUpdated',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: '/reports/fakeReportId/events/filterUpdated',
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.on(testData.eventName, testData.handler2);
      report.on(testData.eventName, testData.handler3);
      report.off(testData.eventName);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).not.toHaveBeenCalled();
      expect(testData.handler2).not.toHaveBeenCalled();
      expect(testData.handler3).not.toHaveBeenCalled();
    });
  });
});

describe('SDK-to-MockApp', function () {
  let $element: JQuery;
  let $element2: JQuery;
  let iframe: HTMLIFrameElement;
  let iframe2: HTMLIFrameElement;
  let iframeHpm: Hpm.HttpPostMessage;
  let iframeHpm2: Hpm.HttpPostMessage;
  let iframeLoaded: Promise<void[]>;
  let powerbi: service.Service;
  let report: report.Report;
  let report2: report.Report;

  beforeAll(function () {
    
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory, {
      wpmpName: 'SDK-to-MockApp HostWpmp',
      logMessages
    });

    $element = $(`<div class="powerbi-report-container2"></div>`)
      .appendTo(document.body);

    $element2 = $(`<div class="powerbi-report-container3"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/test/utility/noop.html";
    const embedConfiguration: embed.IEmbedConfiguration = {
      type: "report",
      id: "fakeReportIdInitialEmbed",
      accessToken: 'fakeTokenInitialEmbed',
      embedUrl: iframeSrc
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);
    report2 = <report.Report>powerbi.embed($element2[0], embedConfiguration);

    iframe = <HTMLIFrameElement>$element.find('iframe')[0];
    iframe2 = <HTMLIFrameElement>$element2.find('iframe')[0];

    /**
     * Note: For testing we need to configure the eventSourceOverrideWindow to allow the host to respond to
     * the iframe window; however, the iframe window doesn't exist until the first embed is created.
     * 
     * To work around this we create a service for the initial embed, embed a report, then set the private variable
     */
    (<any>powerbi.wpmp).eventSourceOverrideWindow = iframe.contentWindow;

    // Register Iframe side
    iframeHpm = setupMockApp(iframe.contentWindow, window, logMessages, 'SDK-to-MockApp IframeWpmp');
    iframeHpm2 = setupMockApp(iframe2.contentWindow, window, logMessages, 'SDK-to-MockApp IframeWpmp2');

    // Reset load handler
    spyApp.validateLoad.calls.reset();
    spyApp.reset();

    const iframe1Loaded = new Promise<void>((resolve, reject) => {
      iframe.addEventListener('load', () => {
        resolve(null);
      });
    });
    const iframe2Loaded = new Promise<void>((resolve, reject) => {
      iframe2.addEventListener('load', () => {
        resolve(null);
      });
    });

    iframeLoaded = Promise.all<void>([iframe1Loaded, iframe2Loaded]);
  });

  afterAll(function () {
    // TODO: Should call remove using the powerbi service first to clean up intenral references to DOM inside this element
    $element.remove();
    powerbi.wpmp.stop();
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IPageTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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
        filter: (new models.ValueFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON(),
        target: <models.IVisualTarget>{
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

    it(`report.on(eventName, handler) should register handler and be called when POST /report/:uniqueId/events/:eventName is received`, function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
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
      iframeHpm.post(`/reports/${testData.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody)
        .then(response => {
          // Assert
          expect(testData.handler).toHaveBeenCalledWith(testData.simulatedPageChangeBody);
        });
    });

    it(`if multiple reports with the same id are loaded into the host, and event occurs on one of them, only one report handler should be called`, function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        eventName: 'filterAdded',
        handler: jasmine.createSpy('handler'),
        handler2: jasmine.createSpy('handler2'),
        simulatedPageChangeBody: {
          initiator: 'sdk',
          page: {
            name: 'page1',
            displayName: 'Page 1'
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report2.on(testData.eventName, testData.handler2);

      // Act
      iframeHpm.post(`/reports/${report2.config.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody)
        .then(response => {
          // Assert
          expect(testData.handler2).toHaveBeenCalledWith(testData.simulatedPageChangeBody);
          expect(testData.handler).not.toHaveBeenCalled();
        });
    });

    it(`ensure load event is allowed`, function () {
      // Arrange
      const testData = {
        uniqueId: 'uniqueId',
        reportId: 'fakeReportId',
        eventName: 'loaded',
        handler: jasmine.createSpy('handler'),
        simulatedBody: {
          initiator: 'sdk'
        }
      };

      report.on(testData.eventName, testData.handler);

      // Act
      iframeHpm.post(`/reports/${report2.config.uniqueId}/events/${testData.eventName}`, testData.simulatedBody)
        .then(response => {
          // Assert
          expect(testData.handler).toHaveBeenCalledWith(testData.simulatedBody);
        });
    });
  });
});