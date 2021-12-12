// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as service from '../src/service';
import * as embed from '../src/embed';
import * as report from '../src/report';
import * as create from '../src/create';
import * as factories from '../src/factories';
import { EmbedUrlNotSupported } from '../src/errors';

// Todo: remove JQuery usage from this tests file.

function ValidateDashboardConfigurationWorksAsExpected(pageView: string, exceptionExpected: boolean, powerbi: service.Service): void {
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

  let exceptionThrown = false;
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

describe('service', function () {
  let powerbi: service.Service;
  let element: HTMLDivElement;

  beforeEach(function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    powerbi.accessToken = 'ABC123';
    element = document.createElement('div');
    element.id = 'powerbi-fixture';
    document.body.appendChild(element);
  });

  afterEach(function () {
    element.remove();
    powerbi.wpmp.stop();
  });

  it('is defined', function () {
    expect(powerbi).toBeDefined();
  });

  describe('init', function () {
    it('embeds all components found in the DOM', function () {
      // Arrange
      const elements = [
        '<div id="reportContainer1" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
        '<div id="reportContainer2" powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=XYZ456" powerbi-type="report"></div>',
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
      const attemptGet = (): void => {
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
    });

    it('calling get on element with embeded dashboard component returns the instance', function () {
      // Arrange
      const $element = $('<div powerbi-type="dashboard" powerbi-embed-url="https://app.powerbi.com/dashboardEmbed?dashboardId=ABC123"></div>')
        .appendTo('#powerbi-fixture');

      const componentInstance = powerbi.embed($element[0]);

      // Act
      const componentInstance2 = powerbi.get($element[0]);

      // Assert
      expect(componentInstance).toEqual(componentInstance2);
    });
  });

  describe('embed', function () {
    it('if attempting to embed without specifying a type, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = (): void => {
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
      const attemptEmbed = (): void => {
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
      const attemptEmbed = (): void => {
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
      let iframe = $reportContainer.find('iframe');
      expect(iframe.attr('src')).toEqual('fakeUrl?reportId=1&language=languageName&formatLocale=formatName&uid=fakeUid');
    });

    it('if attempting to embed without specifying an embed url, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = (): void => {
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
      const attemptEmbed = (): void => {
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
      const attemptToEmbed = (): void => {
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
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-settings-filter-pane-enabled="false"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect(report.config.settings.filterPaneEnabled).toEqual(false);
    });

    it('should get navContentPaneEnabled setting from attribute from config and then attribute', function () {
      // Arrange
      const embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed`;
      const $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-report-id="abc123" powerbi-settings-nav-content-pane-enabled="false"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      const report = powerbi.embed($reportContainer[0]);

      // Assert
      expect(report.config.settings.navContentPaneEnabled).toEqual(false);
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
      let component = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      let report = powerbi.embed(component[0]);

      // Assert
      expect(report).toBeDefined();
    });

    it('if dashboard embed component was not previously created, creates an instance and return it', function () {
      // Arrange
      let component = $('<div powerbi-embed-url="https://app.powerbi.com/dashboardEmbed?dashboardId=ABC123" powerbi-type="dashboard"></div>')
        .appendTo('#powerbi-fixture');

      // Act
      let dashboard = powerbi.embed(component[0]);

      // Assert
      expect(dashboard).toBeDefined();
    });

    it("looks for a token first from attribute 'powerbi-access-token'", function () {
      // Arrange
      let embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
      let testToken = "fakeToken1";
      let $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-access-token="${testToken}"></div>`)
        .appendTo('#powerbi-fixture');

      // Act
      powerbi.embed($reportContainer[0]);

      // Assert
      let report = powerbi.get($reportContainer[0]);
      let accessToken = report.config.accessToken;

      expect(accessToken).toEqual(testToken);
    });

    it("if token is not found by attribute 'powerbi-access-token', fallback to using global", function () {
      // Arrange
      let embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
      let testToken = "fakeToken1";
      let $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
        .appendTo('#powerbi-fixture');

      let originalToken = powerbi.accessToken;
      powerbi.accessToken = testToken;

      // Act
      powerbi.embed($reportContainer[0]);

      // Assert
      let report = powerbi.get($reportContainer[0]);
      let accessToken = report.config.accessToken;

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
        const attemptCreate = (): void => {
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
        const attemptCreate = (): void => {
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
        const attemptCreate = (): void => {
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
        let embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
        let $reportContainer = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
          .appendTo('#powerbi-fixture');

        // Act
        powerbi.embed($reportContainer[0], { uniqueId: "fakeUid" });

        // Assert
        let iframe = $reportContainer.find('iframe');
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

        const configuration: embed.IEmbedConfiguration = {};

        // Act
        const report = powerbi.embed($reportContainer[0], configuration);

        // Assert
        expect((<embed.IEmbedConfiguration>report.config).theme).toBeUndefined();
      });
    });

    describe('tiles', function () {
      it('creates tile iframe from embedUrl', function () {
        // Arrange
        let embedUrl = 'https://app.powerbi.com/embed?dashboardId=D1&tileId=T1';
        let $tileContainer = $('<div powerbi-embed-url="' + embedUrl + '" powerbi-type="tile"></div>')
          .appendTo('#powerbi-fixture');

        // Act
        powerbi.embed($tileContainer[0], { dashboardId: "D1", embedUrl: embedUrl });

        // Assert
        let iframe = $tileContainer.find('iframe');
        expect(iframe.length).toEqual(1);
        expect(iframe.attr('src').indexOf(embedUrl)).toEqual(0);
      });
    });
  });

  describe('bootstrap', function () {
    it('if attempting to bootstrap without specifying a type, throw error', function () {
      // Arrange
      const component = $('<div></div>')
        .appendTo('#powerbi-fixture');

      // Act
      const attemptEmbed = (): void => {
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
      const attemptEmbed = (): void => {
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
      const attemptBootstrap = (): void => {
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
      let iframe = $reportContainer.find('iframe');
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

      let exceptionThrown = false;
      try {
        powerbi.embed($element[0], reportEmbedConfig);
      }
      catch (e) {
        exceptionThrown = true;
        expect(e.message).toBe(EmbedUrlNotSupported);
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
      let iframe = $element.find('iframe');
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
