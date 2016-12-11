$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 6: Update settings');

  var reportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
  var $updateSettingsReport = $('#updatesettingsreport');
  var updateSettingsReport;
  var updateSettingsReportFilterPaneEnabled = false;
  var updateSettingsReprotNavContentPaneEnabled = false;
  var $toggleFilterPaneButton = $('#toggleFilterPane');
  var $toggleNavContentPaneButton = $('#toggleNavContentPane');

  $toggleFilterPaneButton.on('click', function () {
    updateSettingsReportFilterPaneEnabled = !updateSettingsReportFilterPaneEnabled;
    updateSettingsReport.updateSettings({
      filterPaneEnabled: updateSettingsReportFilterPaneEnabled
    });
  });

  $toggleNavContentPaneButton.on('click', function () {
    updateSettingsReprotNavContentPaneEnabled = !updateSettingsReprotNavContentPaneEnabled;
    updateSettingsReport.updateSettings({
      navContentPaneEnabled: updateSettingsReprotNavContentPaneEnabled
    });
  });

  // Init
  fetch(reportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            var updateSettingsEmbedConfig = $.extend({}, embedConfig, {
              settings: {
                filterPaneEnabled: updateSettingsReportFilterPaneEnabled,
                navContentPaneEnabled: updateSettingsReprotNavContentPaneEnabled
              }
            });

            updateSettingsReport = powerbi.embed($updateSettingsReport.get(0), updateSettingsEmbedConfig);
            return updateSettingsReport;
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