$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 7: Data Selection');

  var reportUrl = 'https://powerbiembedapi.azurewebsites.net/api/dxt/reports/c4d31ef0-7b34-4d80-9bcb-5974d1405572';
  var $reportContainer = $('#reportContainer');
  var report;
  var $dataSelectedContainer = $("#dataSelectedContainer");

  // Init
  fetch(reportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            report = powerbi.embed($reportContainer.get(0), embedConfig);
            initializeDataSelection(report, $dataSelectedContainer);
            return report;
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

function initializeDataSelection(report, $dataSelectedContainer) {
  report.on('dataSelected', event => {
    console.log('dataSelected: ', event);

    var data = event.detail;

    $dataSelectedContainer.text(JSON.stringify(data, null, '  '));
  });
}