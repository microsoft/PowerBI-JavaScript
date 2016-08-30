$(function () {
  var models = window['powerbi-client'].models;

  // Scenario 1: Static Embed
  var staticReportUrl = 'https://powerbiembedapi.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
  var $staticReportContainer = $('#reportstatic');
  var staticReport;

  fetch(staticReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            staticReport = powerbi.embed($staticReportContainer.get(0), embedConfig);
          });
      }
      else {
        return response.json()
          .then(function (error) {
            throw new Error(error);
          });
      }
    });

  var $fullscreen = $('#fullscreen');

  $fullscreen.on('click', function (event) {
    staticReport.fullscreen();
  });
});