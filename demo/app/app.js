$(function () {

  var $staticReport = $('#reportstatic');
  var $reportsList = $('#reportslist');
  var $dynamicReport = $('#reportdynamic');
  var $customPageNavReport = $('#reportcustompagenav');
  var customPageNavReport;
  var customPageNavReportPages;
  var $reportPagesList = $('#reportpagesbuttons');
  var $resetButton = $('#resetButton');
  var $prevButton = $('#prevbutton');
  var $nextButton = $('#nextbutton');
  var $cycleButton = $('#cyclebutton');
  var cycleIntervalId;
  var apiBaseUrl = 'http://powerbipaasapi.azurewebsites.net/api/reports';

  var localReportOverride = {
    embedUrl: 'https://portal.analysis.windows-int.net/appTokenReportEmbed',
    id: 'c4d31ef0-7b34-4d80-9bcb-5974d1405572',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXIiOiIwLjEuMCIsImF1ZCI6Imh0dHBzOi8vYW5hbHlzaXMud2luZG93cy5uZXQvcG93ZXJiaS9hcGkiLCJpc3MiOiJQb3dlckJJU0RLIiwidHlwZSI6ImVtYmVkIiwid2NuIjoiV2FsbGFjZSIsIndpZCI6IjUyMWNkYTJhLTRlZDItNDg5Ni1hYzA0LWM5YzM4MWRjMjUyYSIsInJpZCI6ImM0ZDMxZWYwLTdiMzQtNGQ4MC05YmNiLTU5NzRkMTQwNTU3MiIsIm5iZiI6MTQ2NzMxNjQ2MCwiZXhwIjoxNDY3MzIwMDYwfQ.1iKcgmG07m-VLGKmGwKI95ICVYowYkVGnudws02rtow'
  };

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
      var reportConfig = $.extend({ type: 'report' }, report, localReportOverride);
      var staticReport = powerbi.embed($staticReport.get(0), reportConfig);

      staticReport.on('loaded', function (event) {
        console.log('static report loaded');
      });
      staticReport.on('error', function (event) {
        console.log('static report error');
      });
      
      var customPageNavConfig = $.extend({
        settings: {
          filterPaneEnabled: false
        }
      }, reportConfig);

      customPageNavReport = powerbi.embed($customPageNavReport.get(0), customPageNavConfig);
      customPageNavReport.on('loaded', function (event) {
        console.log('custom page nav report loaded');
        customPageNavReport.getPages()
          .then(pages => {
            console.log('pages: ', pages);
            if(pages.length > 0) {
              customPageNavReportPages = pages;
              const firstPage = customPageNavReportPages[0];
              firstPage.isActive = true;

            	pages
                .map(function (page) {
                  return generateReportPage(page);
                })
                .forEach(function (element) {
                  $reportPagesList.append(element);
                });
            }
          });
      });
      customPageNavReport.on('error', function (event) {
        console.log('customPageNavReport error', event);
      });

      customPageNavReport.on('pageChanged', function (event) {
        console.log('pageChanged event received', event);
        updateActivePage(event.newPage);
      });
    });

  function updateActivePage(newPage) {
    // Remove active class
    var reportButtons = $reportPagesList.children('button');

    reportButtons
      .each(function (index, element) {
        var $element = $(element);
        var buttonPage = $element.data('page');
        if(buttonPage.isActive) {
          buttonPage.isActive = false;
          $element.removeClass('active');
        }
      });

    // Set active class
    reportButtons
      .each(function (index, element) {
        var $element = $(element);
        var buttonPage = $element.data('page');
        if(buttonPage.name === newPage.name) {
          buttonPage.isActive = true;
          $element.addClass('active');
        }
      });
  }

  function changePage(forwards) {
    // Remove active class
    var reportButtons = $reportPagesList.children('button');
    var $activeButtonIndex = -1;

    reportButtons
      .each(function (index, element) {
        var $element = $(element);
        var buttonPage = $element.data('page');
        if(buttonPage.isActive) {
          $activeButtonIndex = index;
        }
      });

    if(forwards) {
      $activeButtonIndex += 1;
    }
    else {
      $activeButtonIndex -= 1;
    }

    if($activeButtonIndex > reportButtons.length - 1) {
      $activeButtonIndex = 0;
    }
    if($activeButtonIndex < 0) {
      $activeButtonIndex = reportButtons.length - 1;
    }

    reportButtons
      .each(function (index, element) {
        if($activeButtonIndex === index) {
          var $element = $(element);
          var buttonPage = $element.data('page');
          
          customPageNavReport.setPage(buttonPage.name);
        }
      });
  }

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

  function generateReportPage(page) {
    var $page = $('<button>')
      .attr({
        type: 'button'
      })
      .addClass('btn btn-success')
      .data('page', page)
      .text(page.displayName);

    if(page.isActive) {
      $page.addClass('active');
    }

    return $page;
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
        var reportConfig = $.extend({ type: 'report' }, reportWithToken, localReportOverride);
        powerbi.embed($dynamicReport.get(0), reportConfig);
      });
  });

  $prevButton.on('click', function (event) {
    changePage(false);
  });

  $nextButton.on('click', function (event) {
    changePage(true);
  });

  $cycleButton.on('click', function (event) {
    $cycleButton.toggleClass('active');
    $cycleButton.data('cycle', !$cycleButton.data('cycle'));

    if($cycleButton.data('cycle')) {
      cycleIntervalId = setInterval(function () {
        console.log('cycle page: ');
        changePage(true);
      }, 1000);
    }
    else {
      clearInterval(cycleIntervalId);
    }
  });

  $resetButton.on('click', function (event) {
    powerbi.reset($dynamicReport.get(0));
  });


  /**
   * Custom Page Navigation
   */
  $reportPagesList.on('click', 'button', function (event) {
    var button = event.target;
    var report = $(button).data('report');
    var page = $(button).data('page');

    console.log('Attempting to set page to: ', page.name);
    customPageNavReport.setPage(page.name)
      .then(function (response) {
        console.log('Page changed request accepted');
      });
  });
});