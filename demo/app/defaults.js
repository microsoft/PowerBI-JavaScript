$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 5: Default Page and/or Filter');

  var staticReportUrl = 'https://powerbiembedapi.azurewebsites.net/api/dxt/reports/c4d31ef0-7b34-4d80-9bcb-5974d1405572';
  var $defaultPageReportContainer = $('#reportdefaults');
  var defaultPageReport;
  var defaultPageName = 'ReportSection2';
  var defaultFilter = new models.AdvancedFilter({
    table: "Store",
    column: "Name"
  }, "Or", [
      {
        operator: "Contains",
        value: "Wash"
      },
      {
        operator: "Contains",
        value: "Park"
      }
    ]);

  // Init
  fetch(staticReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            var defaultsEmbedConfig = $.extend({}, embedConfig, {
              pageName: defaultPageName,
              filter: defaultFilter.toJSON(),
              settings: {
                filterPaneEnabled: true,
                navContentPaneEnabled: true
              }
            });

            defaultPageReport = powerbi.embed($defaultPageReportContainer.get(0), defaultsEmbedConfig);
            return defaultPageReport;
          });
      }
      else {
        return response.json()
          .then(function (error) {
            throw new Error(error);
          });
      }
    });
});