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
import { spyApp, setupEmbedMockApp } from './utility/mockEmbed';
import * as factories from '../src/factories';
import { spyWpmp } from './utility/mockWpmp';
import { spyHpm } from './utility/mockHpm';
import { spyRouter } from './utility/mockRouter';
import * as util from '../src/util';
import { EmbedUrlNotSupported } from '../src/errors'

declare global {
  interface Window {
    __karma__: any;
  }
}

function ValidateDashboardConfigurationWorksAsExpected(pageView: string, exceptionExpected: boolean, powerbi: service.Service) {
  const embedUrl = `https://app.powerbi.com/dashboardEmbed`;
  const component = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
    .appendTo('#powerbi-fixture');

  const dashboardEmbedConfig = {
    type: "dashboard",
    id: "fakeReportId",
    groupId: "fakeGroupId",
    accessToken: "fakeAccessToken",
    embedUrl: "fakeEmbedUrl",
    pageView: pageView
  };

  var exceptionThrown = false;
  // Act
  try {
    powerbi.embed(component[0], <any>dashboardEmbedConfig);
  }
  catch (e) {
    exceptionThrown = true;
  }

  // Assert
  expect(exceptionThrown).toBe(exceptionExpected);
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
    describe('embeds all components found in the DOM', function () {
      let powerbi: service.Service; // redefined for this scope

      beforeEach(function() {
        powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
        powerbi.accessToken = 'ABC123';
      });

      afterEach(function () {
        powerbi.wpmp.stop();
        powerbi = null;
      });

      it('should work with multiple elements without id', function () {
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
        // Check the number of components controlled by powerbi
        expect(powerbi.getNumberOfComponents()).toEqual(2);
      });

      it('should work with multiple elements with id', function () {
        // Arrange
        const elements = [
          '<div id="first-report" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
          '<div id="second-report" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=XYZ456" powerbi-type="report"></div>',
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
        // Check the number of components controlled by powerbi
        expect(powerbi.getNumberOfComponents()).toEqual(2);
      });

      it('should work with multiple elements with duplicated id', function () {
        // Arrange
        const elements = [
          '<div id="report" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
          '<div id="report" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=XYZ456" powerbi-type="report"></div>',
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
        // Check the number of components controlled by powerbi
        expect(powerbi.getNumberOfComponents()).toEqual(2);
      });
    });

    it('embeds all components found in the DOM without id attribute', function () {
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

    it('embeds all components found in the DOM with duplicate id attribute', function () {
      // Arrange
      const elements = [
        '<div id="reportContainer1" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
        '<div id="reportContainer1" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=XYZ456" powerbi-type="report"></div>',
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

    it('calling get on element with embeded report component returns the instance', function () {
      // Arrange
      const $element = $('<div powerbi-type="report" powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123"></div>')
        .appendTo('#powerbi-fixture');

      const componentInstance = powerbi.embed($element[0]);

      // Act
      const componentInstance2 = powerbi.get($element[0]);

      // Assert
      expect(componentInstance).toEqual(componentInstance2);
    })

    it('calling get on element with embeded dashboard component returns the instance', function () {
      // Arrange
      const $element = $('<div powerbi-type="dashboard" powerbi-embed-url="https://app.powerbi.com/dashboardEmbed?dashboardId=ABC123"></div>')
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

    it('if attempting to embed on existing element with different type than previous embed, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      const reportEmbedConfig: embed.IEmbedConfiguration = {
        type: "report",
        id: "fakeReportId",
        accessToken: "fakeAccessToken",
        embedUrl: "fakeEmbedUrl",
        groupId: "fakeGroupId",
      };

      const dashboardEmbedConfig: embed.IEmbedConfiguration = {
        type: "dashboard",
        id: "fakeDashboardId",
        accessToken: "fakeAccessToken",
        embedUrl: "fakeEmbedUrl",
        groupId: "fakeGroupId"
      };

      powerbi.embed(component[0], reportEmbedConfig);

      // Act
      const attemptEmbed = () => {
        powerbi.embed(component[0], dashboardEmbedConfig);
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if Create is already embedded in element re-use the existing component by calling load with the new information', function () {
      // Arrange
      const $element = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const testConfiguration = {
        accessToken: "fakeAccessToken",
        embedUrl: 'fakeUrl',
        id: 'report2',
        type: 'report',
        groupId: "fakeGroupId"
      };

      const createConfig: embed.IEmbedConfiguration = {
        datasetId: "fakeDashboardId",
        accessToken: "fakeAccessToken",
        embedUrl: "fakeEmbedUrl",
        groupId: "fakeGroupId"
      };

      // Act
      const component = powerbi.createReport($element[0], createConfig);
      const component2 = powerbi.embed($element[0], testConfiguration);
      const component3 = powerbi.get($element[0]);

      // Assert
      //expect(component.createReport).toHaveBeenCalledWith(createConfig);
      expect(component).toBeDefined();
      expect(component2).toBeDefined();
      expect(component2).toBe(component3);
    });

    it('Create embed url with correct locale parameters', function () {
      // Arrange
      const $reportContainer = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const testConfiguration: embed.IEmbedConfiguration = {
        accessToken: "fakeAccessToken",
        embedUrl: 'fakeUrl?reportId=1',
        id: 'report2',
        type: 'report',
        settings: {
          localeSettings: {
            language: 'languageName',
            formatLocale: 'formatName'
          }
        },
        groupId: "fakeGroupId",
        uniqueId: "fakeUid",
      };

      powerbi.embed($reportContainer[0], testConfiguration);
      var iframe = $reportContainer.find('iframe');
      expect(iframe.attr('src')).toEqual('fakeUrl?reportId=1&language=languageName&formatLocale=formatName&uid=fakeUid');
    });

    it('if attempting to embed without specifying an embed url, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        const configuration: embed.IEmbedConfiguration = { type: "report", embedUrl: null, accessToken: null, id: null };
        powerbi.embed(component[0], configuration);
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
        const configuration: embed.IEmbedConfiguration = { type: "report", embedUrl: null, accessToken: null, id: null };
        powerbi.embed(component[0], configuration);
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

    it('if attempting to embed a dashboard with an invalid pageView, throw error', function () {
      ValidateDashboardConfigurationWorksAsExpected("notValid", true, powerbi);
    });

    it('if attempting to embed a dashboard with a pageView equals fitToWidth, don\'t throw error', function () {
      ValidateDashboardConfigurationWorksAsExpected("fitToWidth", false, powerbi);
    });

    it('if attempting to embed a dashboard with a pageView equals oneColumn, don\'t throw error', function () {
      ValidateDashboardConfigurationWorksAsExpected("oneColumn", false, powerbi);
    });

    it('if attempting to embed a dashboard with a pageView equals actualSize, don\'t throw error', function () {
      ValidateDashboardConfigurationWorksAsExpected("actualSize", false, powerbi);
    });

    it('if attempting to embed a dashboard with an undefined pageView, don\'t throw error', function () {
      ValidateDashboardConfigurationWorksAsExpected(undefined, false, powerbi);
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

    it('should get group id from configuration first', function () {
      // Arrange
      const testGroupId = "ABC123";
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?groupId=DIFFERENTID`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      const configuration: embed.IEmbedConfiguration = { id: 'fakeId', groupId: testGroupId };

      // Act
      const report = powerbi.embed($reportContainer[0], configuration);

      // Assert
      expect((<embed.IEmbedConfiguration>report.config).groupId).toEqual(testGroupId);
    });

    it('should get groupId from embeddUrl is not specified in config', function () {
      // Arrange
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?groupId=DIFFERENTID`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      const configuration: embed.IEmbedConfiguration = { id: 'fakeId' };

      // Act
      const report = powerbi.embed($reportContainer[0], configuration);

      // Assert
      expect((<embed.IEmbedConfiguration>report.config).groupId).toEqual('DIFFERENTID');
    });

    it('should get groupId undefined if not specified in embeddUrl or config', function () {
      // Arrange
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=fakeId`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      const configuration: embed.IEmbedConfiguration = { id: 'fakeId' };

      // Act
      const report = powerbi.embed($reportContainer[0], configuration);

      // Assert
      expect((<embed.IEmbedConfiguration>report.config).groupId).toBeUndefined();
    });

    it('should get filterPaneEnabled setting from attribute from config and then attribute', function () {
      // Arrange
      const testUniqueId = 'fakeUniqueId';
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-settings-filter-pane-enabled="false"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect((<embed.IEmbedSettings>report.config.settings).filterPaneEnabled).toEqual(false);
    });

    it('should get navContentPaneEnabled setting from attribute from config and then attribute', function () {
      // Arrange
      const testUniqueId = 'fakeUniqueId';
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-settings-nav-content-pane-enabled="false"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect((<embed.IEmbedSettings>report.config.settings).navContentPaneEnabled).toEqual(false);
    });

    it('if component is already embedded in element re-use the existing component by calling load with the new information', function () {
      // Arrange
      const $element = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const component = powerbi.embed($element[0]);
      spyOn(component, "load");

      const testConfiguration: embed.IEmbedConfiguration = {
        accessToken: "fakeToken",
        embedUrl: 'fakeUrl',
        id: 'report2',
      };

      // Act
      const component2 = powerbi.embed($element[0], testConfiguration);

      const actualConfig = <embed.IEmbedConfiguration>component2.config;

      // Assert
      expect(component.load).toHaveBeenCalled();
      expect(actualConfig.accessToken).toEqual(testConfiguration.accessToken);
      expect(actualConfig.embedUrl).toEqual(testConfiguration.embedUrl);
      expect(actualConfig.id).toEqual(testConfiguration.id);

      expect(component2).toBe(component);
    });

    it('if report embed component was not previously created, creates an instance and return it', function () {
      // Arrange
      var component = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      var report = powerbi.embed(component[0]);

      // Assert
      expect(report).toBeDefined();
    });

    it('if dashboard embed component was not previously created, creates an instance and return it', function () {
      // Arrange
      var component = $('<div powerbi-embed-url="https://app.powerbi.com/dashboardEmbed?dashboardId=ABC123" powerbi-type="dashboard"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      var dashboard = powerbi.embed(component[0]);

      // Assert
      expect(dashboard).toBeDefined();
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
      var accessToken = report.config.accessToken;

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

    describe('createReport', function () {
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const accessToken = 'ABC123';

      it('if attempting to createReport without specifying an embed url, throw error', function () {
        // Arrange
        const component = $('<div></div>')
          .appendTo('#powerbi-fixture');

        // Act
        const attemptCreate = () => {
          powerbi.createReport(component[0], { embedUrl: null, accessToken: accessToken, datasetId: '123' });
        };

        // Assert
        expect(attemptCreate).toThrowError(Error);
      });

      it('if attempting to createReport without specifying an access token, throw error', function () {
        // Arrange
        const component = $('<div></div>')
          .appendTo('#powerbi-fixture');

        const originalToken = powerbi.accessToken;
        powerbi.accessToken = undefined;

        // Act
        const attemptCreate = () => {
          powerbi.createReport(component[0], { embedUrl: embedUrl, accessToken: null, datasetId: '123' });
        };

        // Assert
        expect(attemptCreate).toThrowError(Error);

        // Cleanup
        powerbi.accessToken = originalToken;
      });

      it('if attempting to createReport without specifying an datasetId, throw error', function () {
        // Arrange
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const attemptCreate = () => {
          powerbi.createReport($reportContainer[0], { embedUrl: embedUrl, accessToken: accessToken });
        };

        // Assert
        expect(attemptCreate).toThrowError();
      });

    });

    describe('findIdFromEmbedUrl of Create', function () {
      it('should return value of datasetId query parameter in embedUrl', function () {
        // Arrange
        const testDatasetId = "ABC123";
        const testEmbedUrl = `http://embedded.powerbi.com/appTokenReportEmbed?datasetId=${testDatasetId}`;

        // Act
        const datasetId = create.Create.findIdFromEmbedUrl(testEmbedUrl);

        // Assert
        expect(datasetId).toEqual(testDatasetId);
      });

      it('should return undefinded if the datasetId parameter is not in the url', function () {
        // Arrange
        const testEmbedUrl = `http://embedded.powerbi.com/appTokenReportEmbed`;

        // Act
        const datasetId = create.Create.findIdFromEmbedUrl(testEmbedUrl);

        // Assert
        expect(datasetId).toBeUndefined();
      });

      it('should get datasetId from configuration first', function () {
        // Arrange
        const testDatasetId = "ABC123";
        const accessToken = 'ABC123';
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?datasetId=DIFFERENTID`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.createReport($reportContainer[0], { embedUrl: embedUrl, accessToken: accessToken, datasetId: testDatasetId });

        // Assert
        expect(report.createConfig.datasetId).toEqual(testDatasetId);
      });

      it('should fallback to using datasetId from embedUrl if not supplied in create configuration', function () {
        // Arrange
        const testDatasetId = "ABC123";
        const accessToken = 'ABC123';
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?datasetId=${testDatasetId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}"</div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.createReport($reportContainer[0], { embedUrl: embedUrl, accessToken: accessToken });

        // Assert
        expect(report.createConfig.datasetId).toEqual(testDatasetId);
      });

      it('theme should be in create config if exists is embedConfig', function () {
        // Arrange

        const testDatasetId = "ABC123";
        const accessToken = 'ABC123';
        const theme = { themeJson: { name: "Theme ABC 123" } };
        const embedUrl = `https://app.powerbi.com/reportEmbed?datasetId=${testDatasetId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}"</div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.createReport($reportContainer[0], { embedUrl: embedUrl, accessToken: accessToken, theme: theme });

        // Assert
        expect(report.createConfig.theme).toEqual(theme);
      });

      it('theme should be undefined in create config if not exists is embedConfig', function () {
        // Arrange

        const testDatasetId = "ABC123";
        const accessToken = 'ABC123';
        const theme = { themeJson: { name: "Theme ABC 123" } };
        const embedUrl = `https://app.powerbi.com/reportEmbed?datasetId=${testDatasetId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}"</div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.createReport($reportContainer[0], { embedUrl: embedUrl, accessToken: accessToken });

        // Assert
        expect(report.createConfig.theme).toBeUndefined();
      });
    });

    describe('reports', function () {
      it('creates report iframe from embedUrl', function () {
        // Arrange
        var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
        var $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        let report = powerbi.embed($reportContainer[0], { uniqueId: "fakeUid" });

        // Assert
        var iframe = $reportContainer.find('iframe');
        expect(iframe.length).toEqual(1);
        expect(iframe.attr('src')).toEqual(embedUrl + "&uid=fakeUid");
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

        const configuration: embed.IEmbedConfiguration = { id: testReportId };

        // Act
        const report = powerbi.embed($reportContainer[0], configuration);

        // Assert
        expect((<embed.IEmbedConfiguration>report.config).id).toEqual(testReportId);
      });

      it('should fallback to using id from attribute if not supplied in embed/load configuration', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=DIFFERENTID`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="${testReportId}"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        const report = powerbi.embed($reportContainer[0]);
        const config: embed.IEmbedConfiguration = report.config;
        // Assert
        expect(config.id).toEqual(testReportId);
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
        expect((<embed.IEmbedConfiguration>report.config).id).toEqual(testReportId);
      });

      it('theme should be in report config if exists is embedConfig', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${testReportId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id></div>`)
          .appendTo('#powerbi-fixture');

        const theme = { themeJson: { name: "Theme ABC 123" } };
        const configuration: embed.IEmbedConfiguration = { theme: theme };

        // Act
        const report = powerbi.embed($reportContainer[0], configuration);

        // Assert
        expect((<embed.IEmbedConfiguration>report.config).theme).toEqual(theme);
      });

      it('theme should be  undefined in report config if not exists is embedConfig', function () {
        // Arrange
        const testReportId = "ABC123";
        const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${testReportId}`;
        const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id></div>`)
          .appendTo('#powerbi-fixture');

        const theme = { themeJson: { name: "Theme ABC 123" } };
        const configuration: embed.IEmbedConfiguration = {};

        // Act
        const report = powerbi.embed($reportContainer[0], configuration);

        // Assert
        expect((<embed.IEmbedConfiguration>report.config).theme).toBeUndefined();
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

  describe('bootstrap', function () {
    it('if attempting to bootstrap without specifying a type, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        powerbi.bootstrap(component[0], {});
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if attempting to bootstrap with an unknown type, throw error', function () {
      // Arrange
      const component = $('<div powerbi-type="unknownType"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = () => {
        powerbi.bootstrap(component[0], {});
      };

      // Assert
      expect(attemptEmbed).toThrowError(Error);
    });

    it('if attempting to bootstrap on existing element, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      const reportEmbedConfig: embed.IEmbedConfiguration = {
        type: "report",
        id: "fakeReportId",
        accessToken: "fakeAccessToken",
        embedUrl: "fakeEmbedUrl",
        groupId: "fakeGroupId",
      };

      const reportEmbedConfig2: embed.IEmbedConfiguration = {
        type: "report",
        id: "fakeReportId2",
        accessToken: "fakeAccessToken",
        embedUrl: "fakeEmbedUrl",
        groupId: "fakeGroupId"
      };

      powerbi.embed(component[0], reportEmbedConfig);

      // Act
      const attemptBootstrap = () => {
        powerbi.bootstrap(component[0], reportEmbedConfig2);
      };

      // Assert
      expect(attemptBootstrap).toThrowError(Error);
    });

    it('powerbi.embed should use the same iframe is already embedded with powerbi.bootstrap', function () {
      // Arrange
      const $element = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const testConfiguration = {
        accessToken: "fakeAccessToken",
        embedUrl: 'fakeUrl',
        id: 'report2',
        type: 'report',
        groupId: "fakeGroupId"
      };

      // Act
      const component = powerbi.bootstrap($element[0], {
        type: 'report',
        embedUrl: 'fakeUrl2',
      });

      const component2 = powerbi.embed($element[0], testConfiguration);
      const component3 = powerbi.get($element[0]);

      // Assert
      expect(component).toBeDefined();
      expect(component2).toBeDefined();
      expect(component2).toBe(component3);
    });

    it('powerbi.bootstrap url with correct locale parameters', function () {
      // Arrange
      const $reportContainer = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      const testConfiguration: embed.IEmbedConfiguration = {
        embedUrl: 'fakeUrl?reportId=1',
        id: 'report2',
        type: 'report',
        settings: {
          localeSettings: {
            language: 'languageName',
            formatLocale: 'formatName'
          }
        },
        uniqueId: "fakeUid",
      };

      powerbi.bootstrap($reportContainer[0], testConfiguration);
      var iframe = $reportContainer.find('iframe');
      expect(iframe.attr('src')).toEqual('fakeUrl?reportId=1&language=languageName&formatLocale=formatName&uid=fakeUid');
    });

    it('Cannot use JS SDK if autoAuth in embed url', function () {
      const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=ABC123&autoAuth=true`;
      const $element = $(`<div powerbi-type="dashboard" powerbi-embed-url="${embedUrl}"></div>`)
        .appendTo('#powerbi-fixture');
      const reportEmbedConfig = {
        type: "report",
        id: "fakeReportId",
        groupId: "fakeGroupId",
        accessToken: "fakeAccessToken",
        embedUrl: embedUrl
      };

      var exceptionThrown = false;
      try {
        powerbi.embed($element[0], reportEmbedConfig);
      }
      catch (e) {
        exceptionThrown = true;
        expect(e.message).toBe(EmbedUrlNotSupported)
      }

      expect(exceptionThrown).toBe(true);
      $element.empty();
      $element.remove();
    });
  });

  describe('reset', function () {
    it('deletes the powerBiEmbed property on the element', function () {
      // Arrange
      const $element = $('<div></div>');

      const config: embed.IEmbedConfiguration = {
        type: 'report',
        embedUrl: 'fakeUrl',
        id: 'fakeId',
        accessToken: 'fakeToken'
      };

      powerbi.embed($element.get(0), config);

      // Act
      expect((<service.IPowerBiElement>$element.get(0)).powerBiEmbed).toBeDefined();
      powerbi.reset($element.get(0));

      // Assert
      expect((<service.IPowerBiElement>$element.get(0)).powerBiEmbed).toBeUndefined();
    });

    it('clears the innerHTML of the element', function () {
      // Arrange
      const $element = $('<div></div>');

      const config: embed.IEmbedConfiguration = {
        type: 'report',
        embedUrl: 'fakeUrl',
        id: 'fakeReportId',
        accessToken: 'fakeToken'
      };

      powerbi.embed($element.get(0), config);

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
    iframeHpm = setupEmbedMockApp(iframe.contentWindow, window, logMessages, 'ProtocolMockAppWpmp');

    // Register SDK side WPMP
    wpmp = factories.wpmpFactory('HostProxyDefaultNoHandlers', logMessages, iframe.contentWindow);
    hpm = factories.hpmFactory(wpmp, iframe.contentWindow, 'testVersion');
    const router = factories.routerFactory(wpmp);

    router.post('/reports/:uniqueId/events/:eventName', (req, res) => {
      handler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/pages/:pageName/events/:eventName', (req, res) => {
      handler.handle(req);
      res.send(202);
    });

    router.post('/reports/:uniqueId/pages/:pageName/visuals/:visualName/events/:eventName', (req, res) => {
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

    describe('create', function () {
      describe('report', function () {
        it('POST /report/create returns 400 if the request is invalid', function (done) {
          // Arrange
          const testData = {
            uniqueId: 'uniqueId',
            create: {
              datasetId: "fakeId",
              accessToken: "fakeToken",
            }
          };

          iframeLoaded
            .then(() => {
              spyApp.validateCreateReport.and.returnValue(Promise.reject(null));

              // Act
              hpm.post<models.IError>('/report/create', testData.create, { uid: testData.uniqueId })
                .then(() => {
                  expect(false).toBe(true);
                  spyApp.validateReportLoad.calls.reset();
                  done();
                })
                .catch(response => {
                  // Assert
                  expect(spyApp.validateCreateReport).toHaveBeenCalledWith(testData.create);
                  expect(response.statusCode).toEqual(400);

                  // Cleanup
                  spyApp.validateCreateReport.calls.reset();
                  done();
                });
            });
        });

        it('POST /report/create returns 202 if the request is valid', function (done) {
          // Arrange
          const testData = {
            create: {
              datasetId: "fakeId",
              accessToken: "fakeToken",
            }
          };

          iframeLoaded
            .then(() => {
              spyApp.validateCreateReport.and.returnValue(Promise.resolve(null));
              // Act
              hpm.post<void>('/report/create', testData.create)
                .then(response => {
                  // Assert
                  expect(spyApp.validateCreateReport).toHaveBeenCalledWith(testData.create);
                  expect(response.statusCode).toEqual(202);
                  // Cleanup
                  spyApp.validateCreateReport.calls.reset();
                  spyApp.reportLoad.calls.reset();
                  done();
                })
                .catch(response => {
                  expect(false).toBe(true);
                  spyApp.validateCreateReport.calls.reset();
                  done();
                });
            });
        });
      });
    });

    describe('load & prepare', function () {
      describe('report', function () {
        for (var action of ['load', 'prepare']) {
          it(`POST /report/${action} returns 400 if the request is invalid`, function (done) {
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
                spyApp.validateReportLoad.and.returnValue(Promise.reject(null));

                // Act
                hpm.post<models.IError>(`/report/${action}`, testData.load, { uid: testData.uniqueId })
                  .then(() => {
                    expect(false).toBe(true);
                    spyApp.validateReportLoad.calls.reset();
                    done();
                  })
                  .catch(response => {
                    // Assert
                    expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
                    expect(spyApp.reportLoad).not.toHaveBeenCalledWith(testData.load);
                    expect(response.statusCode).toEqual(400);
                    // Cleanup
                    spyApp.validateReportLoad.calls.reset();
                    done();
                  });
              });
          });

          it(`POST /report/${action} returns 202 if the request is valid`, function (done) {
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
                spyApp.validateReportLoad.and.returnValue(Promise.resolve(null));
                // Act
                hpm.post<void>(`/report/${action}`, testData.load)
                  .then(response => {
                    // Assert
                    expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
                    expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
                    expect(response.statusCode).toEqual(202);
                    // Cleanup
                    spyApp.validateReportLoad.calls.reset();
                    spyApp.reportLoad.calls.reset();
                    done();
                  });
              });
          });

          it(`POST /report/${action} causes POST /reports/:uniqueId/events/loaded`, function (done) {
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
                spyApp.reportLoad.and.returnValue(Promise.resolve(testData.load));

                // Act
                hpm.post<void>(`/report/${action}`, testData.load, { uid: testData.uniqueId })
                  .then(response => {
                    setTimeout(() => {
                      // Assert
                      expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
                      expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
                      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
                      // Cleanup
                      spyApp.validateReportLoad.calls.reset();
                      spyApp.reportLoad.calls.reset();
                      done();
                    });
                  });
              });
          });

          it(`POST /report/${action} causes POST /reports/:uniqueId/events/error`, function (done) {
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

            iframeLoaded
              .then(() => {
                spyApp.reportLoad.and.returnValue(Promise.reject(testData.error));

                // Act
                hpm.post<void>(`/report/${action}`, testData.load, { uid: testData.uniqueId })
                  .then(response => {
                    setTimeout(() => {
                      // Assert
                      expect(spyApp.validateReportLoad).toHaveBeenCalledWith(testData.load);
                      expect(spyApp.reportLoad).toHaveBeenCalledWith(testData.load);
                      expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
                      // Cleanup
                      spyApp.validateReportLoad.calls.reset();
                      spyApp.reportLoad.calls.reset();
                      done();
                    });
                  });
              });
          });
        }
      });

      describe('dashboard', function () {
        it('POST /dashboard/load returns 202 if the request is valid', function (done) {

          // Arrange
          const testData = {
            load: {
              dashboardId: "fakeId",
              accessToken: "fakeToken",
              options: {
              }
            }
          };

          iframeLoaded
            .then(() => {
              spyApp.validateDashboardLoad.and.returnValue(Promise.resolve(null));
              // Act
              hpm.post<void>('/dashboard/load', testData.load)
                .then(response => {
                  // Assert
                  expect(spyApp.validateDashboardLoad).toHaveBeenCalledWith(testData.load);
                  expect(spyApp.dashboardLoad).toHaveBeenCalledWith(testData.load);
                  expect(response.statusCode).toEqual(202);
                  // Cleanup
                  spyApp.validateDashboardLoad.calls.reset();
                  spyApp.dashboardLoad.calls.reset();
                  done();
                });
            });
        });

        it('POST /dashboard/load returns 400 if the request is invalid', function (done) {

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

          iframeLoaded
            .then(() => {
              spyApp.validateDashboardLoad.and.returnValue(Promise.reject(null));

              // Act
              hpm.post<models.IError>('/dashboard/load', testData.load, { uid: testData.uniqueId })
                .then(() => {
                  expect(false).toBe(true);
                  spyApp.validateDashboardLoad.calls.reset();
                  done();
                })
                .catch(response => {
                  // Assert
                  expect(spyApp.validateDashboardLoad).toHaveBeenCalledWith(testData.load);
                  expect(spyApp.dashboardLoad).not.toHaveBeenCalledWith(testData.load);
                  expect(response.statusCode).toEqual(400);
                  // Cleanup
                  spyApp.validateDashboardLoad.calls.reset();
                  done();
                });
            });
        });
      });
    });

    describe('render', function () {
      it('POST /report/render returns 202 if the request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.render.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/render', null)
              .then(response => {
                // Assert
                expect(spyApp.render).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.render.calls.reset();
                done();
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

      it('GET /report/pages returns 500 with body as error', function (done) {
        // Arrange
        const testData = {
          expectedError: {
            message: "could not query pages"
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getPages.and.returnValue(Promise.reject(testData.expectedError));
            // Act
            hpm.get<models.IPage[]>('/report/pages')
              .catch(response => {
                // Assert
                expect(spyApp.getPages).toHaveBeenCalled();
                const error = response.body;
                expect(error).toEqual(testData.expectedError);
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
          }
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
                spyApp.validateReportLoad.calls.reset();
                spyApp.setPage.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/active causes POST /reports/:uniqueId/events/error', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.resolve(null));
            spyApp.setPage.and.returnValue(Promise.reject(testData.error));

            // Act
            hpm.put<void>('/report/pages/active', testData.page, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validatePage).toHaveBeenCalledWith(testData.page);
                expect(spyApp.setPage).toHaveBeenCalledWith(testData.page);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
                // Cleanup
                spyApp.validateReportLoad.calls.reset();
                spyApp.setPage.calls.reset();
                done();
              });
          });
      });
    });

    describe('refresh', function () {
      it('POST /report/refresh returns 202 if the request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.refreshData.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/refresh', null)
              .then(response => {
                // Assert
                expect(spyApp.refreshData).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.refreshData.calls.reset();
                done();
              });
          });
      });
    });

    describe('print', function () {
      it('POST /report/print returns 202 if the request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.print.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/print', null)
              .then(response => {
                // Assert
                expect(spyApp.print).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.print.calls.reset();
                done();
              });
          });
      });
    });

    describe('switchMode', function () {
      it('POST /report/switchMode returns 202 if the request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.switchMode.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/switchMode/Edit', null)
              .then(response => {
                // Assert
                expect(spyApp.switchMode).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.switchMode.calls.reset();
                done();
              });
          });
      });
    });

    describe('save', function () {
      it('POST /report/save returns 202 if the request is valid', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.save.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/save', null)
              .then(response => {
                // Assert
                expect(spyApp.save).toHaveBeenCalled();
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.save.calls.reset();
                done();
              });
          });
      });
    });

    describe('saveAs', function () {
      it('POST /report/saveAs returns 202 if the request is valid', function (done) {
        // Arrange
        let saveAsParameters: models.ISaveAsParameters = { name: "reportName" };

        iframeLoaded
          .then(() => {
            spyApp.saveAs.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/saveAs', saveAsParameters)
              .then(response => {
                // Assert
                expect(spyApp.saveAs).toHaveBeenCalled();
                expect(spyApp.saveAs).toHaveBeenCalledWith(saveAsParameters);
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.saveAs.calls.reset();
                done();
              });
          });
      });
    });

    describe('setAccessToken', function () {
      it('POST /report/token returns 202 if the request is valid', function (done) {
        // Arrange
        let accessToken: string = "fakeToken";

        iframeLoaded
          .then(() => {
            spyApp.setAccessToken.and.returnValue(Promise.resolve(null));
            // Act
            hpm.post<void>('/report/token', accessToken)
              .then(response => {
                // Assert
                expect(spyApp.setAccessToken).toHaveBeenCalled();
                expect(spyApp.setAccessToken).toHaveBeenCalledWith(accessToken);
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.saveAs.calls.reset();
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

      it('GET /report/filters returns 500 with body as error', function (done) {
        // Arrange
        const testData = {
          error: {
            message: "internal error"
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.reject(testData.error));

            // Act
            hpm.get<models.IFilter[]>('/report/filters')
              .catch(response => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(500);
                expect(response.body).toEqual(testData.error);
                // Cleanup
                spyApp.getFilters.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          filters: [
            {
              name: "fakeFilter"
            }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

            // Act
            hpm.put<models.IError>('/report/filters', testData.filters)
              .catch(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).not.toHaveBeenCalled();
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
          filters: [
            {
              name: "fakeFilter"
            }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/filters', testData.filters)
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/filters will cause POST /reports/:uniqueId/events/filtersApplied', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/filters', testData.filters, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
                // Cleanup
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
                done();
              });
          });
      });
    });

    describe('filters (page level)', function () {
      it('GET /report/pages/xyz/filters returns 200 with body as array of filters', function (done) {
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
            hpm.get<models.IFilter[]>('/report/pages/xyz/filters')
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

      it('GET /report/pages/xyz/filters returns 500 with body as error', function (done) {
        // Arrange
        const testData = {
          error: {
            message: "internal error"
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.reject(testData.error));

            // Act
            hpm.get<models.IFilter[]>('/report/pages/xyz/filters')
              .catch(response => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(500);
                expect(response.body).toEqual(testData.error);
                // Cleanup
                spyApp.getFilters.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          filters: [
            {
              name: "fakeFilter"
            }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

            // Act
            hpm.put<models.IError>('/report/pages/xyz/filters', testData.filters)
              .catch(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          filters: [
            {
              name: "fakeFilter"
            }
          ],
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/pages/xyz/filters', testData.filters)
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/filters will cause POST /reports/:uniqueId/pages/xyz/events/filtersApplied', function (done) {
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

        iframeLoaded
          .then(() => {
            spyHandler.handle.calls.reset();
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/pages/xyz/filters', testData.filters, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
                // Cleanup
                spyApp.validatePage.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
                done();
              });
          });
      });
    });

    describe('filters (visual level)', function () {
      it('GET /report/pages/xyz/visuals/uvw/filters returns 200 with body as array of filters', function (done) {
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
            hpm.get<models.IFilter[]>('/report/pages/xyz/visuals/uvw/filters')
              .then(response => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual(testData.filters);
                // Cleanup
                spyApp.getFilters.calls.reset();
                spyApp.validateVisual.calls.reset();
                done();
              });
          });
      });

      it('GET /report/pages/xyz/visuals/uvw/filters returns 500 with body as error', function (done) {
        // Arrange
        const testData = {
          error: {
            message: "internal error"
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.reject(testData.error));

            // Act
            hpm.get<models.IFilter[]>('/report/pages/xyz/visuals/uvw/filters')
              .catch(response => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(response.statusCode).toEqual(500);
                expect(response.body).toEqual(testData.error);
                // Cleanup
                spyApp.getFilters.calls.reset();
                spyApp.validateVisual.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/visuals/uvw/filters returns 400 if request is invalid', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          filters: [
            {
              name: "fakeFilter"
            }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(null));

            // Act
            hpm.put<models.IError>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId })
              .catch(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).not.toHaveBeenCalled();
                expect(response.statusCode).toEqual(400);
                // Cleanup
                spyApp.validateVisual.calls.reset();
                spyApp.validateFilter.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/pages/xyz/visuals/uvw/filters returns 202 if request is valid', function (done) {
        // Arrange
        const testData = {
          uniqueId: 'uniqueId',
          filters: [
            {
              name: "fakeFilter"
            }
          ],
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));

            // Act
            hpm.put<void>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                // Cleanup
                spyApp.validateVisual.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
                done();
              });
          });
      });

      it('PUT /report/:uniqueId/pages/xyz/visuals/uvw/filters will cause POST /reports/:uniqueId/pages/xyz/visuals/uvw/events/filtersApplied', function (done) {
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

        iframeLoaded
          .then(() => {

            // Act
            hpm.put<void>('/report/pages/xyz/visuals/uvw/filters', testData.filters, { uid: testData.uniqueId })
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                expect(response.statusCode).toEqual(202);
                expect(spyHandler.handle).toHaveBeenCalledWith(jasmine.objectContaining(testExpectedEvent));
                // Cleanup
                spyApp.validateVisual.calls.reset();
                spyApp.validateFilter.calls.reset();
                spyApp.setFilters.calls.reset();
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
      it('POST /reports/:uniqueId/events/filtersApplied when user changes filter', function (done) {
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

    describe('filters (page level)', function () {
      it('POST /reports/:uniqueId/pages/xyz/events/filtersApplied when user changes filter', function (done) {
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

    describe('filters (visual level)', function () {
      it('POST /reports/:uniqueId/pages/xyz/visuals/uvw/events/filtersApplied when user changes filter', function (done) {
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

        iframeLoaded
          .then(() => {
            spyHandler.handle.calls.reset();

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
  let $reportElement: JQuery;
  let $dashboardElement: JQuery;
  let $createElement: JQuery;
  let iframe: HTMLIFrameElement;
  let dashboardIframe: HTMLIFrameElement;
  let createIframe: HTMLIFrameElement;
  let visualFrame: HTMLIFrameElement;
  let powerbi: service.Service;
  let report: report.Report;
  let create: create.Create;
  let dashboard: dashboard.Dashboard;
  let embeddedVisual: visual.Visual;
  let page1: page.Page;
  let visual1: visualDescriptor.VisualDescriptor;
  let uniqueId = 'uniqueId';
  let sdkSessionId = 'sdkSessionId';
  let createUniqueId = 'uniqueId';
  let dashboardUniqueId = 'uniqueId';
  let visualUniqueId = 'uniqueId';
  let embedConfiguration: embed.IEmbedConfiguration;
  let dashboardEmbedConfiguration: embed.IEmbedConfiguration;
  let embedCreateConfiguration: embed.IEmbedConfiguration;
  let visualEmbedConfiguration: embed.IVisualEmbedConfiguration;

  let reportConfigurationBck: embed.IEmbedConfigurationBase;
  let createConfigurationBck: embed.IEmbedConfigurationBase;
  let dashboardEmbedConfigurationBck: embed.IEmbedConfigurationBase;
  let visualEmbedConfigurationBck: embed.IEmbedConfigurationBase;

  const iframeSrc = "base/test/utility/noop.html";

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

    spyOn(utils, "getTimeDiffInMilliseconds").and.callFake(() => 700); // Prevent requests from being throttled.

    powerbi = new service.Service(spyHpmFactory, noop, spyRouterFactory, { wpmpName: 'SDK-to-HPM report wpmp' });

    $reportElement = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);
    $createElement = $(`<div class="powerbi-create-container"></div>`)
      .appendTo(document.body);
    $dashboardElement = $(`<div class="powerbi-dashboard-container"></div>`)
      .appendTo(document.body);
    let $visualElement = $(`<div class="powerbi-report-container"></div>`)
      .appendTo(document.body);

    embedConfiguration = {
      type: "report",
      id: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc
    };
    embedCreateConfiguration = {
      datasetId: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc
    };
    dashboardEmbedConfiguration = {
      type: "dashboard",
      id: "fakeDashboardId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc
    };
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
    report = <report.Report>powerbi.embed($reportElement[0], embedConfiguration);
    create = <create.Create>powerbi.createReport($createElement[0], embedCreateConfiguration);
    dashboard = <dashboard.Dashboard>powerbi.embed($dashboardElement[0], dashboardEmbedConfiguration);
    embeddedVisual = <visual.Visual>powerbi.embed($visualElement[0], visualEmbedConfiguration);
    page1 = new page.Page(report, 'xyz');
    visual1 = new visualDescriptor.VisualDescriptor(page1, 'uvw', 'title', 'type', {});
    uniqueId = report.config.uniqueId;
    sdkSessionId = powerbi.getSdkSessionId();
    createUniqueId = create.config.uniqueId;
    dashboardUniqueId = dashboard.config.uniqueId;
    visualUniqueId = embeddedVisual.config.uniqueId;
    iframe = <HTMLIFrameElement>$reportElement.find('iframe')[0];
    createIframe = <HTMLIFrameElement>$createElement.find('iframe')[0];
    dashboardIframe = <HTMLIFrameElement>$dashboardElement.find('iframe')[0];
    visualFrame = <HTMLIFrameElement>$visualElement.find('iframe')[0];

    // Reset load handler
    spyHpm.post.calls.reset();
  });

  afterAll(function () {
    powerbi.reset($reportElement.get(0));
    powerbi.reset($dashboardElement.get(0));
    $reportElement.remove();
    $dashboardElement.remove();
    powerbi.wpmp.stop();
  });

  beforeEach(function () {
    reportConfigurationBck = report.config;
    createConfigurationBck = create.config;
    dashboardEmbedConfigurationBck = dashboard.config;
    visualEmbedConfigurationBck = embeddedVisual.config;
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

    report.config = reportConfigurationBck;
    create.config = createConfigurationBck;
    dashboard.config = dashboardEmbedConfigurationBck;
    embeddedVisual.config = visualEmbedConfigurationBck;
  });

  describe('report', function () {

    describe('load', function () {
      it('report.load() sends POST /report/load with configuration in body', function () {
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
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration)
        report.config = expectedConfiguration;
        report.iframeLoaded = true;
        report.load();

        // Assert
        const expectedHeaders = {
          bootstrapped: undefined,
          sdkVersion: sdkConfig.default.version,
          uid: uniqueId,
          sdkSessionId: sdkSessionId
        };

        expect(spyHpm.post).toHaveBeenCalledWith('/report/load', expectedConfiguration, expectedHeaders, iframe.contentWindow);
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
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration);
        report.config = expectedConfiguration;
        report.load()
          .catch(error => {
            const expectedHeaders = {
              bootstrapped: undefined,
              sdkVersion: sdkConfig.default.version,
              uid: uniqueId,
              sdkSessionId: sdkSessionId
            };
            expect(spyHpm.post).toHaveBeenCalledWith('/report/load', expectedConfiguration, expectedHeaders, iframe.contentWindow);
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
          },
          response: {
            body: null
          }
        };

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));

        // Act
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration);
        report.config = expectedConfiguration;
        report.load()
          .then(response => {
            const expectedHeaders = {
              bootstrapped: undefined,
              sdkVersion: sdkConfig.default.version,
              uid: uniqueId,
              sdkSessionId: sdkSessionId
            };

            expect(spyHpm.post).toHaveBeenCalledWith('/report/load', expectedConfiguration, expectedHeaders, iframe.contentWindow);
            expect(response).toEqual(null);
            // Assert
            done();
          });
      });

      it('report.load() updates the internal configuration if the load request was successful', function (done) {
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
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration);
        report.config = expectedConfiguration;
        report.load()
          .then(response => {
            expect(report.config).toEqual(jasmine.objectContaining(expectedConfiguration));
            expect(response).toEqual(null);
            // Assert
            done();
          });
      });

      it('powerbi.embed with visual name sends POST /report/load with custom layout configuration in body', function (done) {

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
                "ReportSection1": {
                  defaultLayout: {
                    displayState: {
                      mode: models.VisualContainerDisplayMode.Hidden
                    }
                  },
                  visualsLayout: {
                    "VisualContainer1": {
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
        embeddedVisual.iframeLoaded = true;

        embeddedVisual.load().then(() => {
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
          expect(spyArgs[3]).toEqual(visualFrame.contentWindow);
          done();
        });
      });

      it('embeddedVisual.getFilters(models.FiltersLevel.Report) sends GET /report/filters', function () {
        // Act
        embeddedVisual.getFilters(models.FiltersLevel.Report);

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('embeddedVisual.setFilters(filters, models.FiltersLevel.Report) sends PUT /report/filters', function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        // Act
        embeddedVisual.setFilters(testData.filters, models.FiltersLevel.Report);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('embeddedVisual.getFilters(models.FiltersLevel.Page) sends GET /report/pages/ReportSection1/filters', function () {
        // Act
        embeddedVisual.getFilters(models.FiltersLevel.Page);

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/filters`, { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('embeddedVisual.setFilters(filters, models.FiltersLevel.Page) sends PUT /report/pages/ReportSection1/filters', function () {
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
        embeddedVisual.setFilters(testData.filters, models.FiltersLevel.Page);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/ReportSection1/filters`, testData.filters, { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('embeddedVisual.getFilters() sends GET /report/pages/ReportSection1/visuals/VisualContainer1/filters', function () {
        // Act
        embeddedVisual.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals/VisualContainer1/filters`, { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('embeddedVisual.setFilters(filters) sends PUT /report/pages/ReportSection1/visuals/VisualContainer1/filters', function () {
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
        embeddedVisual.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/ReportSection1/visuals/VisualContainer1/filters`, testData.filters, { uid: visualUniqueId }, visualFrame.contentWindow);
      });

      it('Not supported visual method: getPages', function () {
        // Act
        const attempt = () => {
          embeddedVisual.getPages()
        };

        // Assert
        expect(attempt).toThrow(visual.Visual.GetPagesNotSupportedError);
      });

      it('Not supported visual method: setPage', function () {
        // Act
        const attempt = () => {
          embeddedVisual.setPage(null)
        };

        // Assert
        expect(attempt).toThrow(visual.Visual.SetPageNotSupportedError);
      });
    });

    describe('pages', function () {
      it('report.getPages() sends GET /report/pages', function () {
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
        report.getPages();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, iframe.contentWindow);
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
            expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, iframe.contentWindow);
            expect(error).toEqual(testData.expectedError.body);
            done();
          });
      });

      it('report.getPages() returns promise that resolves with list of Page objects', function (done) {
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

        // Act
        report.getPages()
          .then(pages => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith('/report/pages', { uid: uniqueId }, iframe.contentWindow);
            expect(pages[0].name).toEqual(testData.expectedResponse.body[0].name);
            expect(pages[1].name).toEqual(testData.expectedResponse.body[1].name);
            done();
          });
      });

      it('report.addPage() sends POST /report/addPage with displayName', function () {
        // Arrange
        const displayName = "testName";
        const expectedRequest = {
          displayName: displayName
        };
        const expectedHeaders = { uid: uniqueId };

        spyHpm.post.and.returnValue(Promise.resolve(page1));

        // Act
        report.addPage(displayName);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/addPage', expectedRequest, expectedHeaders, iframe.contentWindow);
      });

      it('report.deletePage() sends POST /report/addPage with displayName', function () {
        // Arrange
        const name = "testName";
        const expectedHeaders = { uid: uniqueId };

        spyHpm.delete.and.returnValue(Promise.resolve(null));

        // Act
        report.deletePage(name);

        expect(spyHpm.delete).toHaveBeenCalledWith(`/report/pages/${name}`, {}, expectedHeaders, iframe.contentWindow);
      });
    });

    describe('filters', function () {
      it('report.getFilters() sends GET /report/filters', function () {
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
        report.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.getFilters() returns promise that rejects with server error if there was error getting  filters', function (done) {
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

        spyHpm.get.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
        report.getFilters()
          .catch(errors => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, iframe.contentWindow);
            expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
            done();
          });
      });

      it('report.getFilters() returns promise that resolves with the filters if the request is accepted', function (done) {
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
        report.getFilters()
          .then(filters => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith('/report/filters', { uid: uniqueId }, iframe.contentWindow);
            expect(filters).toEqual(testData.response.body);
            done();
          });
      });

      it('report.setFilters(filters) sends PUT /report/filters', function () {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        // Act
        report.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', function (done) {
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

        spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
        report.setFilters(testData.filters)
          .catch(errors => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
            done();
          });
      });

      it('report.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        report.setFilters(testData.filters)
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });

      it('report.removeFilters() sends PUT /report/filters', function () {
        // Arrange

        // Act
        report.removeFilters();

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', [], { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.removeFilters() returns promise that resolves with null if request is accepted', function (done) {
        // Arrange
        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        report.removeFilters()
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith('/report/filters', [], { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });
    });

    describe('switchMode', function () {
      it('report.switchMode() sends POST /report/switchMode', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.switchMode(models.ViewMode.Edit);

        // Assert
        let url = '/report/switchMode/edit';
        expect(spyHpm.post).toHaveBeenCalledWith(url, null, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.switchMode() returns promise that resolves if the request is accepted', function (done) {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.switchMode(models.ViewMode.Edit)
          .then(() => {
            // Assert
            let url = '/report/switchMode/edit';
            expect(spyHpm.post).toHaveBeenCalledWith(url, null, { uid: uniqueId }, iframe.contentWindow);
            done();
          });
      });
    });

    describe('save', function () {
      it('report.save() sends POST /report/save', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.save();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/save', null, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.save() returns promise that resolves if the request is accepted', function (done) {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.save()
          .then(() => {
            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/save', null, { uid: uniqueId }, iframe.contentWindow);
            done();
          });
      });
    });

    describe('saveAs', function () {
      let saveAsParameters: models.ISaveAsParameters = { name: "reportName" };

      it('report.saveAs() sends POST /report/saveAs', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.saveAs(saveAsParameters);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/saveAs', saveAsParameters, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.saveAs() returns promise that resolves if the request is accepted', function (done) {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.saveAs(saveAsParameters)
          .then(() => {
            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/saveAs', saveAsParameters, { uid: uniqueId }, iframe.contentWindow);
            done();
          });
      });
    });

    describe('setAccessToken', function () {
      let accessToken: string = "fakeToken";

      it('report.setAccessToken() sends POST /report/token', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.setAccessToken(accessToken);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/token', accessToken, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.setAccessToken() returns promise that resolves if the request is accepted', function (done) {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        let newToken = "newToken"
        // Act
        report.setAccessToken(newToken)
          .then(() => {
            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/token', newToken, { uid: uniqueId }, iframe.contentWindow);
            expect(report.service.accessToken).toEqual(newToken);
            expect(report.config.accessToken).toEqual(newToken);
            expect(report.element.getAttribute(embed.Embed.accessTokenAttribute)).toEqual(newToken);
            done();
          });
      });
    });

    describe('print', function () {
      it('report.print() sends POST /report/print', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.print();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/print', null, { uid: uniqueId }, iframe.contentWindow);
      });

      it('report.print() returns promise that resolves if the request is accepted', function (done) {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.print()
          .then(() => {
            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/print', null, { uid: uniqueId }, iframe.contentWindow);
            done();
          });
      });
    });

    describe('reload', function () {
      it('report.reload() sends POST /report/load with configuration in body', function (done) {
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
        let expectedConfiguration = utils.assign({}, report.config, testData.loadConfiguration);
        report.config = expectedConfiguration;
        report.load()
          .then(() => {
            spyHpm.post.calls.reset();

            // Act
            report.reload();

            const expectedHeaders = {
              bootstrapped: undefined,
              sdkVersion: sdkConfig.default.version,
              uid: uniqueId,
              sdkSessionId: sdkSessionId
            };

            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/load', expectedConfiguration, expectedHeaders, iframe.contentWindow);
            done();
          });
      });
    });

    describe('refresh', function () {
      it('report.refresh() sends POST /report/refresh', function () {
        // Arrange
        spyHpm.post.and.returnValue(Promise.resolve({
          body: {}
        }));

        // Act
        report.refresh();

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/refresh', null, { uid: uniqueId }, iframe.contentWindow);
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
        expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, iframe.contentWindow);
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
            expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, iframe.contentWindow);
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
            expect(spyHpm.patch).toHaveBeenCalledWith('/report/settings', testData.settings, { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done()
          });
      });
    });
  });

  describe('create', function () {
    describe('createReport', function () {
      it('create.createReport() sends POST /report/create with configuration in body', function () {
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
        create.createReport(testData.createConfiguration);

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId }, createIframe.contentWindow);
      });

      it('create.createReport() returns promise that rejects with validation error if the create configuration is invalid', function (done) {
        // Arrange
        const testData = {
          createConfiguration: {
            datasetId: 'fakeId',
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
        create.createReport(testData.createConfiguration)
          .catch(error => {
            expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId }, createIframe.contentWindow);
            expect(error).toEqual(testData.errorResponse.body);
            // Assert
            done();
          });
      });

      it('create.createReport() returns promise that resolves with null if create report was successful', function (done) {
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
        create.createReport(testData.createConfiguration)
          .then(response => {
            expect(spyHpm.post).toHaveBeenCalledWith('/report/create', testData.createConfiguration, { uid: createUniqueId, sdkSessionId: sdkSessionId }, createIframe.contentWindow);
            expect(response).toEqual(null);
            // Assert
            done();
          });
      });
    });
  });

  describe('dashboard', function () {
    describe('load', function () {
      it('dashboard.load() sends POST /dashboard/load with configuration in body', function () {
        // Arrange
        const testData = {
          loadConfiguration: {
            id: 'fakeId',
            accessToken: 'fakeToken',
            type: 'dashboard'
          },
          response: {
            body: null
          }
        };

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));

        // Act
        let expectedConfiguration = utils.assign({}, dashboard.config, testData.loadConfiguration);
        dashboard.config = expectedConfiguration;
        dashboard.load();

        const expectedHeaders = {
          bootstrapped: undefined,
          sdkVersion: sdkConfig.default.version,
          uid: dashboardUniqueId,
          sdkSessionId: sdkSessionId
        };

        // Assert
        expect(spyHpm.post).toHaveBeenCalledWith('/dashboard/load', expectedConfiguration, expectedHeaders, dashboardIframe.contentWindow);
      });
    });
  });

  describe('page', function () {
    describe('filters', function () {
      it('page.getFilters() sends GET /report/pages/xyz/filters', function () {
        // Arrange

        // Act
        page1.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
      });

      it('page.getFilters() return promise that rejects with server error if there was error getting filters', function (done) {
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
        page1.getFilters()
          .catch(error => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
            expect(error).toEqual(testData.expectedError.body);
            done();
          });
      });

      it('page.getFilters() returns promise that resolves with list of filters', function (done) {
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
        page1.getFilters()
          .then(filters => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
            expect(filters).toEqual(testData.expectedResponse.body);
            done();
          });
      });

      it('page.setFilters(filters) sends PUT /report/pages/xyz/filters', function () {
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
        page1.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
      });

      it('page.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', function (done) {
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

        spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
        page1.setFilters(testData.filters)
          .catch(errors => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
            done();
          });
      });

      it('page.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        page1.setFilters(testData.filters)
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });

      it('page.removeFilters() sends PUT /report/pages/xyz/filters', function () {
        // Arrange

        // Act
        page1.removeFilters();

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, [], { uid: uniqueId }, iframe.contentWindow);
      });

      it('page.removeFilters() returns promise that resolves with null if request is accepted', function (done) {
        // Arrange
        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        page1.removeFilters()
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/filters`, [], { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });
    });

    describe('setActive', function () {
      it('page.setActive() sends PUT /report/pages/active', function () {
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
        page1.setActive();

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, iframe.contentWindow);
      });

      it('page.setActive() returns a promise rejected with errors if the page was invalid', function (done) {
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

        spyHpm.put.and.returnValue(Promise.reject(testData.response));

        // Act
        page1.setActive()
          .catch(errors => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, iframe.contentWindow);
            expect(errors).toEqual(jasmine.objectContaining(testData.response.body));
            done();
          });
      });

      it('page.setActive() returns a promise resolved with null if the page is valid', function (done) {
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
        page1.setActive()
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/active`, testData.page, { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });
    });
  });

  describe('visual', function () {
    describe('filters', function () {
      it('visual.getFilters() sends GET /report/pages/xyz/visuals/uvw/filters', function () {
        // Arrange

        // Act
        visual1.getFilters();

        // Assert
        expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
      });

      it('visual.getFilters() return promise that rejects with server error if there was error getting filters', function (done) {
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
        visual1.getFilters()
          .catch(error => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
            expect(error).toEqual(testData.expectedError.body);
            done();
          });
      });

      it('visual.getFilters() returns promise that resolves with list of filters', function (done) {
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
        visual1.getFilters()
          .then(filters => {
            // Assert
            expect(spyHpm.get).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, { uid: uniqueId }, iframe.contentWindow);
            expect(filters).toEqual(testData.expectedResponse.body);
            done();
          });
      });

      it('visual.setFilters(filters) sends PUT /report/pages/xyz/visuals/uvw/filters', function () {
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
        visual1.setFilters(testData.filters);

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
      });

      it('visual.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', function (done) {
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

        spyHpm.put.and.returnValue(Promise.reject(testData.expectedErrors));

        // Act
        visual1.setFilters(testData.filters)
          .catch(errors => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors.body));
            done();
          });
      });

      it('visual.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
        // Arrange
        const testData = {
          filters: [
            (new models.BasicFilter({ table: "Cars", measure: "Make" }, "In", ["subaru", "honda"])).toJSON(),
            (new models.AdvancedFilter({ table: "Cars", measure: "Make" }, "And", [{ value: "subaru", operator: "None" }, { value: "honda", operator: "Contains" }])).toJSON()
          ]
        };

        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        visual1.setFilters(testData.filters)
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, testData.filters, { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });

      it('visual.removeFilters() sends PUT /report/pages/xyz/visuals/uvw/filters', function () {
        // Arrange

        // Act
        visual1.removeFilters();

        // Assert
        expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, [], { uid: uniqueId }, iframe.contentWindow);
      });

      it('visual.removeFilters() returns promise that resolves with null if request is accepted', function (done) {
        // Arrange
        spyHpm.put.and.returnValue(Promise.resolve(null));

        // Act
        visual1.removeFilters()
          .then(response => {
            // Assert
            expect(spyHpm.put).toHaveBeenCalledWith(`/report/pages/${page1.name}/visuals/${visual1.name}/filters`, [], { uid: uniqueId }, iframe.contentWindow);
            expect(response).toEqual(null);
            done();
          });
      });
    });

    describe('theme', function () {
      it('report.applyTheme(theme) sends PUT /report/theme with theme in body', function () {
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

        spyHpm.post.and.returnValue(Promise.resolve(testData.response));
        report.applyTheme(testData.theme)
          .then(() => {
            spyHpm.post.calls.reset();

            // Act
            report.reload();

            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/load', jasmine.objectContaining(testData.theme), { uid: uniqueId, sdkSessionId: sdkSessionId }, iframe.contentWindow);
          });
      });

      it('report.resetTheme() sends PUT /report/theme with empty object as theme in body', function () {
        // Arrange
        const response = {
          body: null
        };

        spyHpm.post.and.returnValue(Promise.resolve(response));
        report.resetTheme()
          .then(() => {
            spyHpm.post.calls.reset();

            // Act
            report.reload();

            // Assert
            expect(spyHpm.post).toHaveBeenCalledWith('/report/load', jasmine.objectContaining({}), { uid: uniqueId, sdkSessionId: sdkSessionId }, iframe.contentWindow);
          });
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
    powerbi.reset($element.get(0));
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
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler'),
        filtersAppliedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
            body: {
              initiator: 'sdk',
              filters: [
                {
                  x: 'fakeFilter'
                }
              ]
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.filtersAppliedEvent);

      // Assert
      expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.filtersAppliedEvent.data.body }));
    });

    it(`off('eventName', handler) will remove single handler which matches function reference for that event`, function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
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
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
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
      expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
      expect(testData.handler2).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
      expect(testData.handler3).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
    });


    it(`off('eventName') will remove all handlers which matches event name`, function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: '/reports/fakeReportId/events/filtersApplied',
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
  let page1: page.Page;
  let report2: report.Report;

  beforeAll(function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory, {
      wpmpName: 'SDK-to-MockApp HostWpmp',
      logMessages
    });

    $element = $(`<div id="reportContainer1" class="powerbi-report-container2"></div>`)
      .appendTo(document.body);

    $element2 = $(`<div id="reportContainer2" class="powerbi-report-container3"></div>`)
      .appendTo(document.body);

    const iframeSrc = "base/test/utility/noop.html";
    const embedConfiguration: embed.IEmbedConfiguration = {
      type: "report",
      id: "fakeReportIdInitialEmbed",
      accessToken: 'fakeTokenInitialEmbed',
      embedUrl: iframeSrc
    };
    report = <report.Report>powerbi.embed($element[0], embedConfiguration);
    page1 = report.page('ReportSection1');
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
    iframeHpm = setupEmbedMockApp(iframe.contentWindow, window, logMessages, 'SDK-to-MockApp IframeWpmp');
    iframeHpm2 = setupEmbedMockApp(iframe2.contentWindow, window, logMessages, 'SDK-to-MockApp IframeWpmp2');

    // Reset load handler
    spyApp.validateReportLoad.calls.reset();
    spyApp.validateDashboardLoad.calls.reset();
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
    powerbi.reset($element.get(0));
    $element.remove();
    powerbi.wpmp.stop();
  });

  afterEach(function () {
    spyApp.reset();
  });

  describe('report', function () {

    beforeEach(function () {
      spyOn(utils, "getTimeDiffInMilliseconds").and.callFake(() => 700); // Prevent requests from being throttled.
    });

    describe('load', function () {
      it(`report.load() returns promise that rejects with validation errors if load configuration is invalid`, function (done) {
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
            spyApp.validateReportLoad.and.returnValue(Promise.reject(testData.expectedErrors));
            // Act
            let expectedConfiguration = utils.assign({}, report.config, testData.loadConfig);
            report.config = expectedConfiguration;
            report.load()
              .catch(errors => {
                // Assert
                expect(spyApp.validateReportLoad).toHaveBeenCalledWith(expectedConfiguration);
                expect(spyApp.reportLoad).not.toHaveBeenCalled();
                expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors));
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
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.validateReportLoad.and.returnValue(Promise.resolve(null));
            spyApp.reportLoad.and.returnValue(Promise.resolve(null));
            // Act
            let expectedConfiguration = utils.assign({}, report.config, testData.loadConfig);
            report.config = expectedConfiguration;
            report.load()
              .then(response => {
                // Assert
                expect(spyApp.validateReportLoad).toHaveBeenCalledWith(expectedConfiguration);
                expect(spyApp.reportLoad).toHaveBeenCalledWith(expectedConfiguration);
                expect(response).toEqual(undefined);
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
                expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
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
              displayName: "Page 1",
              isActive: true
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
                // Workaround to compare pages
                pages
                  .forEach(page => {
                    const testPage = util.find(p => p.name === page.name, testData.pages);
                    if (testPage) {
                      expect(page.name).toEqual(testPage.name);
                      expect(page.isActive).toEqual(testPage.isActive)
                    }
                    else {
                      expect(true).toBe(false);
                    }
                  });
                done();
              });
          });
      });
    });

    describe('filters', function () {
      it('report.getFilters() returns promise that rejects with server error if there was problem getting filters', function (done) {
        // Arrange
        const testData = {
          expectedError: {
            message: 'could not serialize filters'
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.reject(testData.expectedError));
            // Act
            report.getFilters()
              .catch(error => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
                done();
              });
          });
      });

      it('report.getFilters() returns promise that resolves with filters is request is successful', function (done) {
        // Arrange
        const testData = {
          filters: [
            { x: 'fakeFilter' }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            // Act
            report.getFilters()
              .then(filters => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(filters).toEqual(testData.filters);
                done();
              });
          });
      });

      it('report.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedErrors));
            // Act
            report.setFilters(testData.filters)
              .catch(error => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).not.toHaveBeenCalled();
                expect(error).toEqual(jasmine.objectContaining(testData.expectedErrors));
                done();
              });
          });
      });

      it('report.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
        // Arrange
        const testData = {
          filters: [(new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.setFilters.and.returnValue(Promise.resolve(null));
            // Act
            report.setFilters(testData.filters)
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                done();
              });
          });
      });

      it('report.removeFilters() returns promise that resolves with null if the request was accepted', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.setFilters.and.returnValue(Promise.resolve(null));
            // Act
            report.removeFilters()
              .then(response => {
                // Assert
                expect(spyApp.setFilters).toHaveBeenCalled();
                done();
              });
          });
      });
    });

    describe('print', function () {
      it('report.print() returns promise that resolves with null if the report print command was accepted', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.print.and.returnValue(Promise.resolve(null));
            // Act
            report.print()
              .then(response => {
                // Assert
                expect(spyApp.print).toHaveBeenCalled();
                expect(response).toEqual(undefined);
                done();
              });
          });
      });
    });

    describe('refresh', function () {
      it('report.refresh() returns promise that resolves with null if the report refresh command was accepted', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.refreshData.and.returnValue(Promise.resolve(null));
            // Act
            report.refresh()
              .then(response => {
                // Assert
                expect(spyApp.refreshData).toHaveBeenCalled();
                expect(response).toEqual(undefined);
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
                expect(errors).toEqual(jasmine.objectContaining(testData.expectedErrors));
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
  });

  describe('page', function () {
    describe('filters', function () {
      it('page.getFilters() returns promise that rejects with server error if there was problem getting filters', function (done) {
        // Arrange
        const testData = {
          expectedError: {
            message: 'could not serialize filters'
          }
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.reject(testData.expectedError));
            // Act
            page1.getFilters()
              .catch(error => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(error).toEqual(jasmine.objectContaining(testData.expectedError));
                done();
              });
          });
      });

      it('page.getFilters() returns promise that resolves with filters is request is successful', function (done) {
        // Arrange
        const testData = {
          filters: [
            { x: 'fakeFilter' }
          ]
        };

        iframeLoaded
          .then(() => {
            spyApp.getFilters.and.returnValue(Promise.resolve(testData.filters));
            // Act
            page1.getFilters()
              .then(filters => {
                // Assert
                expect(spyApp.getFilters).toHaveBeenCalled();
                expect(filters).toEqual(testData.filters);
                done();
              });
          });
      });

      it('page.setFilters(filters) returns promise that rejects with validation errors if filter is invalid', function (done) {
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

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.reject(testData.expectedErrors));
            // Act
            page1.setFilters(testData.filters)
              .catch(error => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).not.toHaveBeenCalled();
                expect(error).toEqual(jasmine.objectContaining(testData.expectedErrors));
                done();
              });
          });
      });

      it('page.setFilters(filters) returns promise that resolves with null if filter was valid and request is accepted', function (done) {
        // Arrange
        const testData = {
          filters: [(new models.BasicFilter({ table: "cars", column: "make" }, "In", ["subaru", "honda"])).toJSON()]
        };

        iframeLoaded
          .then(() => {
            spyApp.validateFilter.and.returnValue(Promise.resolve(null));
            spyApp.setFilters.and.returnValue(Promise.resolve(null));
            // Act
            page1.setFilters(testData.filters)
              .then(response => {
                // Assert
                expect(spyApp.validateFilter).toHaveBeenCalledWith(testData.filters[0]);
                expect(spyApp.setFilters).toHaveBeenCalledWith(testData.filters);
                done();
              });
          });
      });

      it('page.removeFilters() returns promise that resolves with null if the request was accepted', function (done) {
        // Arrange
        iframeLoaded
          .then(() => {
            spyApp.setFilters.and.returnValue(Promise.resolve(null));
            // Act
            page1.removeFilters()
              .then(response => {
                // Assert
                expect(spyApp.setFilters).toHaveBeenCalled();
                done();
              });
          });
      });
    });

    describe('setActive', function () {
      it('page.setActive() returns promise that rejects if page is invalid', function (done) {
        // Arrange
        const testData = {
          errors: [
            {
              message: 'page xyz was not found in report'
            }
          ]
        };

        // Act
        iframeLoaded
          .then(() => {
            spyApp.validatePage.and.returnValue(Promise.reject(testData.errors));

            // Act
            page1.setActive()
              .catch(errors => {
                // Assert
                expect(spyApp.validatePage).toHaveBeenCalled(); //.toHaveBeenCalledWith(page1);
                expect(spyApp.setPage).not.toHaveBeenCalled();
                expect(errors).toEqual(jasmine.objectContaining(testData.errors));
                done();
              });
          });
      });

      it('page.setActive() returns promise that resolves with null if request is successful', function (done) {
        // Arrange
        const testData = {
          errors: [
            {
              message: 'page xyz was not found in report'
            }
          ]
        };

        // Act
        iframeLoaded
          .then(() => {
            setTimeout(() => {
              spyApp.validatePage.and.returnValue(Promise.resolve(null));
              spyApp.setPage.and.returnValue(Promise.resolve(null));
              // Act
              page1.setActive()
                .then(() => {
                  // Assert
                  expect(spyApp.validatePage).toHaveBeenCalled(); //.toHaveBeenCalledWith(page1);
                  expect(spyApp.setPage).toHaveBeenCalled(); //.toHaveBeenCalledWith(page1);
                  done();
                });
            }, 500);
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

    it(`report.on(eventName, handler) should register handler and be called when POST /report/:uniqueId/events/:eventName is received`, function (done) {
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
      const testDataHandler: jasmine.Spy = testData.handler;

      report.on(testData.eventName, testData.handler);

      // Act
      iframeHpm.post(`/reports/${report.config.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody)
        .then(response => {
          // Assert
          expect(testData.handler).toHaveBeenCalledWith(jasmine.any(CustomEvent));
          // Workaround to compare pages which prevents recursive loop in jasmine equals
          // expect(testData.handler2).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedPageChangeBody }));
          expect(testData.handler.calls.mostRecent().args[0].detail.newPage.name).toEqual(testData.expectedEvent.detail.newPage.name);
          done();
        });
    });

    it(`if multiple reports with the same id are loaded into the host, and event occurs on one of them, only one report handler should be called`, function (done) {
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

      report.on(testData.eventName, testData.handler);
      report2.on(testData.eventName, testData.handler2);

      // Act
      iframeHpm.post(`/reports/${report2.config.uniqueId}/events/${testData.eventName}`, testData.simulatedPageChangeBody)
        .then(response => {
          expect(testData.handler).not.toHaveBeenCalled();
          expect(testData.handler2).toHaveBeenCalledWith(jasmine.any(CustomEvent));
          // Workaround to compare pages which prevents recursive loop in jasmine equals
          // expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining(testData.expectedEvent));
          expect(testData.handler2.calls.mostRecent().args[0].detail.newPage.name).toEqual(testData.simulatedPageChangeBody.newPage.name);
          done();
        });
    });

    it(`ensure load event is allowed`, function (done) {
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
      iframeHpm.post(`/reports/${report.config.uniqueId}/events/${testData.eventName}`, testData.simulatedBody)
        .then(response => {
          // Assert
          expect(testData.handler).toHaveBeenCalledWith(jasmine.any(CustomEvent));
          expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedBody }));
          done();
        });
    });
  });
});