$(function () {
  var models = window['powerbi-client'].models;

  // Scenario 1: Static Embed
  var staticReportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
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

  var $getId = $('#getId');
  $getId.on('click', function (event) {
	alert(staticReport.getId());
  });
	
  var $fullscreen = $('#fullscreen');
  $fullscreen.on('click', function (event) {
    staticReport.fullscreen();
  });
  
  var $reloadReport = $('#reloadReport');
  $reloadReport.on('click', function (event) {
    staticReport.reload()
		.catch(function(error) { alert(error); });
  });
  
  var $printReport = $('#printReport');
  $printReport.on('click', function (event) {
    staticReport.print();
  });
});
