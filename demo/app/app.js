$(function () {

  var $staticReport = $('#reportstatic');

  var $reportsList = $('#reportslist');
  var $dynamicReport = $('#reportdynamic');
  var $customPageNavReport = $('#reportcustompagenav');
  var $resetButton = $('#resetButton');

  var apiBaseUrl = 'http://powerbipaasapi.azurewebsites.net/api/reports';

  /**
   * Basic Embed
   */
  var staticReportId = '5dac7a4a-4452-46b3-99f6-a25915e0fe55';
  var staticReportUrl = apiBaseUrl + '/' + staticReportId;

  fetch(staticReportUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (report) {
      var reportConfig = $.extend({ type: 'report' }, report);
      powerbi.embed($staticReport.get(0), reportConfig);
    });

  /**
   * Dynamic Embed
   */
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

  var allReportsUrl = apiBaseUrl;
  fetch(allReportsUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (reports) {
      reports
        .map(generateReportListItem)
        .forEach(function (element) {
          $reportsList.append(element);
        });
    });

  // When report button is clicked embed the report
  $reportsList.on('click', 'button', function (event) {
    var button = event.target;
    var report = $(button).data('report');
    var url = apiBaseUrl + '/' + report.id;

    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (reportWithToken) {
        var reportConfig = $.extend({ type: 'report' }, reportWithToken);
        powerbi.embed($dynamicReport.get(0), reportConfig);
      });
  });

  $resetButton.on('click', function (event) {
    powerbi.reset($dynamicReport.get(0));
  });
});