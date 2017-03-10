$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 5: Default Page and/or Filter');

  var staticReportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
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

  var defaultFilters = [defaultFilter];
  
  // Init
  fetch(staticReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            var defaultsEmbedConfig = $.extend({}, embedConfig, {
              pageName: defaultPageName,
              filter: defaultFilters,
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
