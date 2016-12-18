$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 2: Dynamic Embed');

  // Declare Variables
  var allReportsUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports';
  var $reportsList = $('#reportslist');
  var $resetButton = $('#resetButton');
  var $dynamicReportContainer = $('#reportdynamic');

  // When report button is clicked embed the report
  $reportsList.on('click', 'button', function (event) {
    var button = event.target;
    var report = $(button).data('report');
    var url = allReportsUrl + '/' + report.id;

    fetch(url)
      .then(function (response) {
        if (response.ok) {
          return response.json()
            .then(function (embedConfig) {
              return powerbi.embed($dynamicReportContainer.get(0), embedConfig);
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

  // When reset button is clicked reset container
  $resetButton.on('click', function (event) {
    powerbi.reset($dynamicReportContainer.get(0));
  });

  // Helper function to generate HTML for each report
  function generateReportListItem(report) {
    var button = $('<button>')
      .attr({
        type: 'button'
      })
      .addClass('btn btn-success')
      .data('report', report)
      .text('Embed!');

    var reportName = $('<span />')
      .addClass('report-name')
      .text(report.name)

    var element = $('<li>')
      .append(reportName)
      .append(button);

    return element;
  }

  // Init
  fetch(allReportsUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (reports) {
            reports
              .map(generateReportListItem)
              .forEach(function (element) {
                $reportsList.append(element);
              });
          });
      }
    });
});