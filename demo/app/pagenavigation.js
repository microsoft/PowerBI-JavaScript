$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 3: Custom Page Navigation');

  // Declare Variables
  var staticReportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
  var $customPageNavContainer = $('#reportcustompagenav');
  var customPageNavReport;
  var $reportPagesList = $('#reportpagesbuttons');
  var $prevButton = $('#prevbutton');
  var $nextButton = $('#nextbutton');
  var $cycleButton = $('#cyclebutton');
  var cycleIntervalId;

  // Helper function to generate pages list
  function generateReportPage(page) {
    var $page = $('<button>')
      .attr({
        type: 'button'
      })
      .addClass('btn btn-success')
      .data('page', page)
      .text(page.displayName);

    if (page.isActive) {
      $page.addClass('active');
    }

    return $page;
  }

  function updateActivePage(newPage) {
    // Remove active class
    var reportButtons = $reportPagesList.children('button');

    reportButtons
      .each(function (index, element) {
        var $element = $(element);
        var buttonPage = $element.data('page');
        if (buttonPage.isActive) {
          buttonPage.isActive = false;
          $element.removeClass('active');
        }
      });

    // Set active class
    reportButtons
      .each(function (index, element) {
        var $element = $(element);
        var buttonPage = $element.data('page');
        if (buttonPage.name === newPage.name) {
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
        if (buttonPage.isActive) {
          $activeButtonIndex = index;
        }
      });

    if (forwards) {
      $activeButtonIndex += 1;
    }
    else {
      $activeButtonIndex -= 1;
    }

    if ($activeButtonIndex > reportButtons.length - 1) {
      $activeButtonIndex = 0;
    }
    if ($activeButtonIndex < 0) {
      $activeButtonIndex = reportButtons.length - 1;
    }

    reportButtons
      .each(function (index, element) {
        if ($activeButtonIndex === index) {
          var $element = $(element);
          var buttonPage = $element.data('page');

          customPageNavReport.setPage(buttonPage.name);
        }
      });
  }

  $prevButton.on('click', function (event) {
    changePage(false);
  });

  $nextButton.on('click', function (event) {
    changePage(true);
  });

  $cycleButton.on('click', function (event) {
    $cycleButton.toggleClass('active');
    $cycleButton.data('cycle', !$cycleButton.data('cycle'));

    if ($cycleButton.data('cycle')) {
      cycleIntervalId = setInterval(function () {
        console.log('cycle page: ');
        changePage(true);
      }, 1000);
    }
    else {
      clearInterval(cycleIntervalId);
    }
  });

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

  // Init
  fetch(staticReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (report) {
            var embedConfig = $.extend({
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false
              }
            }, report);
            customPageNavReport = powerbi.embed($customPageNavContainer.get(0), embedConfig);
            return customPageNavReport;
          });
      }
      else {
        return response.json()
          .then(function (error) {
            throw new Error(error);
          });
      }
    })
    .then(function (report) {
      report.on('loaded', function (event) {
        console.log('custom page nav report loaded');
        report.getPages()
          .then(function (pages) {
            console.log('pages: ', pages);
            if (pages.length > 0) {
              const firstPage = pages[0];
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

      report.on('error', function (event) {
        console.log('customPageNavReport error', event);
      });

      report.on('pageChanged', function (event) {
        console.log('pageChanged event received', event);
        updateActivePage(event.detail.newPage);
      });
    });
});