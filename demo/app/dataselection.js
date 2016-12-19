$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 7: Data Selection');

  var reportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
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
  report.on('dataSelected', function (event) {
    console.log('dataSelected: ', event);

    var data = event.detail;

    $dataSelectedContainer.text(JSON.stringify(data, null, '  '));
  });
}
