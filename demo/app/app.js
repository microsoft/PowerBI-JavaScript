$(function () {
  var models = window['powerbi-client'].models;

  // Other
  var apiBaseUrl = 'https://powerbiembedapi.azurewebsites.net/api';
  var allReportsUrl = apiBaseUrl + '/reports';
  var staticReportId = 'c52af8ab-0468-4165-92af-dc39858d66ad';
  var staticReportUrl = allReportsUrl + '/' + staticReportId;
  var edogReportUrl = apiBaseUrl + '/dxt/reports/c4d31ef0-7b34-4d80-9bcb-5974d1405572';

  // Scenario 1: Static Embed
  var $staticReportContainer = $('#reportstatic');

  // Scenario 2: Dynamic Embed
  var $reportsList = $('#reportslist');
  var $dynamicReportContainer = $('#reportdynamic');

  // Scenario 3: Custom Page Navigation
  var $customPageNavContainer = $('#reportcustompagenav');
  var customPageNavReport;
  var $reportPagesList = $('#reportpagesbuttons');

  // Scenario 4: Custom Filter Pane
  var $customFilterPaneContainer = $('#reportcustomfilter');
  var customFilterPaneReport;
  var customFilterPaneReportPages;

  // Scenario 5: Default Page and/or Filter
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

  // Scenario 6: Update settings
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

  /**
   * Load 
   */
  fetch(staticReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (report) {
            /**
             * Basic Embed
             */
            var reportConfig = $.extend({
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false
              }
            }, report);
            var staticReport = powerbi.embed($staticReportContainer.get(0), reportConfig);

            /**
             * Default Page Report
             */
            var defaultPageConfig = $.extend({}, reportConfig, {
              pageName: defaultPageName,
              filter: defaultFilter.toJSON(),
              settings: {
                filterPaneEnabled: true,
                navContentPaneEnabled: true
              }
            });

            var defaultPageReport = powerbi.embed($defaultPageReportContainer.get(0), defaultPageConfig);

            /**
             * Custom Page Navigation Embed
             */
            var customPageNavConfig = $.extend({}, reportConfig, {
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false
              }
            });

            customPageNavReport = powerbi.embed($customPageNavContainer.get(0), customPageNavConfig);

            customPageNavReport.on('loaded', function (event) {
              console.log('custom page nav report loaded');
              customPageNavReport.getPages()
                .then(function (pages) {
                  console.log('pages: ', pages);
                  if(pages.length > 0) {
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

            customPageNavReport.on('error', function (event) {
              console.log('customPageNavReport error', event);
            });

            customPageNavReport.on('pageChanged', function (event) {
              console.log('pageChanged event received', event);
              updateActivePage(event.detail.newPage);
            });
          });
      }
    });

  fetch(edogReportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (report) {
            /**
             * Custom Filter Pane
             */
            var customFilterPaneConfig = $.extend({}, report, {
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: true
              }
            });

            customFilterPaneReport = powerbi.embed($customFilterPaneContainer.get(0), customFilterPaneConfig);

            customFilterPaneReport.on('loaded', function (event) {
              console.log('custom filter pane report loaded');
              customFilterPaneReport.getPages()
                .then(function (pages) {
                  customFilterPaneReportPages = pages;
                  var $pagesSelect = $('#filtertargetpage');
                  var $removeFiltersPagesList = $('#removeFiltersPagesList');

                  pages
                    .forEach(function (page) {
                      var $pageOption = $('<option>')
                        .val(page.name)
                        .text(page.displayName)
                        .data(page);

                      var $pageOption1 = $('<option>')
                        .val(page.name)
                        .text(page.displayName)
                        .data(page);

                      $removeFiltersPagesList.append($pageOption);
                      $pagesSelect.append($pageOption1);
                    });
                });
            });

            /**
             * Update Settings
             */
            var updateSettingsEmbedConfig = $.extend({}, report, {
              settings: {
                filterPaneEnabled: updateSettingsReportFilterPaneEnabled,
                navContentPaneEnabled: updateSettingsReprotNavContentPaneEnabled
              }
            });

            updateSettingsReport = powerbi.embed($updateSettingsReport.get(0), updateSettingsEmbedConfig);
          });
      }
    });

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

  /**
   * Custom Page Navigation Logic
   */
  (function () {
    var $resetButton = $('#resetButton');
    var $prevButton = $('#prevbutton');
    var $nextButton = $('#nextbutton');
    var $cycleButton = $('#cyclebutton');
    var cycleIntervalId;
    
    // When report button is clicked embed the report
    $reportsList.on('click', 'button', function (event) {
      var button = event.target;
      var report = $(button).data('report');
      var url = allReportsUrl + '/' + report.id;

      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (reportWithToken) {
          var reportConfig = $.extend({
              type: 'report',
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false
              }
          }, reportWithToken);

          powerbi.embed($dynamicReportContainer.get(0), reportConfig);
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
      powerbi.reset($dynamicReportContainer.get(0));
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
  })();

  /**
   * Custom Filter Pane
   */
  (function () {
    var $customFilterForm = $('#customfilterform');
    var $filterType = $('#filtertype');
    var $typeFields = $('.filter-type');
    var $operatorTypeFields = $('input[type=radio][name=operatorType]');
    var $operatorFields = $('.filter-operators');
    var $targetTypeFields = $('input[type=radio][name=filterTarget]');
    var $targetFields = $('.filter-target');

    var $predefinedFilter1 = $('#predefinedFilter1');
    var predefinedFilter1 = new models.AdvancedFilter({
      table: "Store",
      column: "Name"
    }, "Or", [
      {
        operator: "Contains",
        value: "Direct"
      },
      {
        operator: "None",
        value: "x"
      }
    ]);

    var $predefinedFilter2 = $('#predefinedFilter2');
    var predefinedFilter2 = new models.AdvancedFilter({
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

    var $predefinedFilter3 = $('#predefinedFilter3');
    var predefinedFilter3 = new models.AdvancedFilter({
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

    $customFilterForm.on('submit', function (event) {
      event.preventDefault();
      console.log('submit');

      var data = {
        target: getFilterTypeTarget(),
        operator: getFilterOperatorAndValues(),
        reportTarget: getReportTarget()
      };

      var filter;
      var values = Array.prototype.slice.call(data.operator.values);

      if (data.operator.type === "basic") {
        filter = new models.BasicFilter(data.target, data.operator.operator, values);
      }
      else if (data.operator.type === "advanced") {
        filter = new models.AdvancedFilter(data.target, data.operator.operator, values);
      }

      var filterTargetLevel = customFilterPaneReport;
      if (data.reportTarget.type === "page") {
        filterTargetLevel = customFilterPaneReport.page(data.reportTarget.name);
      }
      else if (data.reportTarget.type === "visual") {
        // Need to finalize how visuals report whichp age they are on in order to construct correct page object.
        filterTargetLevel = customFilterPaneReport.page('ReportSection1').visual(data.reportTarget.name);
      }

      var filterJson = filter.toJSON();
      filterTargetLevel.setFilters([filterJson]);
    });

    $filterType.on('change', function (event) {
      console.log('change');
      var value = $filterType.val().toLowerCase();
      updateFieldsForType(value);
    });

    $operatorTypeFields.on('change', function (event) {
      var checkedType = $('#customfilterform input[name=operatorType]:checked').val();
      console.log('operator change', checkedType);
      
      updateFieldsForOperator(checkedType.toLowerCase());
    });

    $targetTypeFields.on('change', function (event) {
      var checkedTarget = $('#customfilterform input[name=filterTarget]:checked').val();
      console.log('target change', checkedTarget);
      
      updateTargetFields(checkedTarget.toLowerCase());
    });

    $predefinedFilter1.on('click', function (event) {
      customFilterPaneReport.setFilters([predefinedFilter1.toJSON()]);
    });

    $predefinedFilter2.on('click', function (event) {
      customFilterPaneReport.setFilters([predefinedFilter1.toJSON()]);
    });

    $predefinedFilter3.on('click', function (event) {
      customFilterPaneReport.page('ReportSection2').setFilters([predefinedFilter3.toJSON()]);
    });

    function getFilterTypeTarget() {
      var filterType = $filterType.val().toLowerCase();
      var filterTypeTarget = {};
      filterTypeTarget.table = $('#filtertable').val();

      if(filterType === "column") {
        filterTypeTarget.column = $('#filtercolumn').val();
      }
      else if(filterType === "hierarchy") {
        filterTypeTarget.hierarchy = $('#filterhierarchy').val();
        filterTypeTarget.hierarchyLevel = $('#filterhierarchylevel').val();
      }
      else if(filterType === "measure") {
        filterTypeTarget.measure = $('#filtermeasure').val();
      }

      return filterTypeTarget;
    }

    function getFilterOperatorAndValues() {
      var operatorType = $('#customfilterform input[name=operatorType]:checked').val();
      var operatorAndValues = {
        type: operatorType
      };

      if (operatorType === "basic") {
        operatorAndValues.operator = $('#filterbasicoperator').val();
        operatorAndValues.values = $('.basic-value').map(function (index, element) {
          return $(element).val();
        });
      }
      else if (operatorType === "advanced") {
        operatorAndValues.operator = $('#filterlogicaloperator').val();
        operatorAndValues.values = $('.advanced-value')
          .map(function (index, element) {
            return {
              value: $(element).find('.advanced-value-input').val(),
              operator: $(element).find('.advanced-logical-condition').val()
            };
          });
      }

      return operatorAndValues;
    }

    function getReportTarget() {
      var checkedTarget = $('#customfilterform input[name=filterTarget]:checked').val();
      var target = {
        type: checkedTarget
      };
      
      if (checkedTarget === "page") {
        target.name = $('#filtertargetpage').val();
      }
      else if (checkedTarget === "visual") {
        target.id = undefined; // Need way to populate visual ids
      }

      return target;
    }

    function updateFieldsForType(type) {
      $typeFields.hide();
      $('.filter-type--' + type).show();
    }

    function updateFieldsForOperator(type) {
      $operatorFields.hide();
      $('.filter-operators--' + type).show();
    }

    function updateTargetFields(target) {
      $targetFields.hide();
      $('.filter-target--' + target).show();
    }

    // Init
    updateFieldsForType("column");
    updateFieldsForOperator("basic");
    updateTargetFields("report");
  })();

  /**
   * Remove Filters Buttons
   */
  (function () {
    var $removeFiltersReportForm = $('#removeFiltersReportForm');
    var $removeFiltersPageForm = $('#removeFiltersPageForm');
    var $removeFiltersVisualForm = $('#removeFiltersVisualForm');
    var $removeFiltersPagesList = $('#removeFiltersPagesList');
    var $removeFiltersVisualsList = $('#removeFiltersVisualsList');

    $removeFiltersReportForm.on('submit', function (event) {
      event.preventDefault();

      console.log('submit removeFiltersReportForm');
      customFilterPaneReport.removeFilters();
    });

    $removeFiltersPageForm.on('submit', function (event) {
      event.preventDefault();

      var pageName = $removeFiltersPagesList.val();
      console.log('submit removeFiltersPageForm', pageName);
      customFilterPaneReport.page(pageName).removeFilters();
    });

    $removeFiltersVisualForm.on('submit', function (event) {
      event.preventDefault();

      var visualName = $removeFiltersVisualsList.val();
      console.log('submit removeFiltersVisualForm', visualName);
      customFilterPaneReport.page('ReportSection2').visual(visualName).removeFilters();
    });
  })();
});