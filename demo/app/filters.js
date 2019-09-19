$(function () {
  var models = window['powerbi-client'].models;

  console.log('Scenario 4: Custom Filter Pane');

  var reportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
  var $customFilterPaneContainer = $('#reportcustomfilter');
  var customFilterPaneReport;
  var customFilterPaneReportPages;
  var $customFilterForm = $('#customfilterform');
  var $filterType = $('#filtertype');
  var $typeFields = $('.filter-type');
  var $operatorTypeFields = $('input[type=radio][name=operatorType]');
  var $operatorFields = $('.filter-operators');
  var $targetTypeFields = $('input[type=radio][name=filterTarget]');
  var $targetFields = $('.filter-target');
  var $reloadButton = $('#reload');

  var $predefinedFilter1 = $('#predefinedFilter1');
  var predefinedFilter1 = new models.AdvancedFilter({
    table: "Store",
    column: "Name"
  }, "And", [
      {
        operator: "Contains",
        value: "Direct"
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

  $reloadButton.on('click', function (event) {
    event.preventDefault();

    console.log('reload');
    customFilterPaneReport.reload();
  });

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
    updateFiltersPane();
  });

  $predefinedFilter2.on('click', function (event) {
    customFilterPaneReport.setFilters([predefinedFilter2.toJSON()]);
    updateFiltersPane();
  });

  $predefinedFilter3.on('click', function (event) {
    customFilterPaneReport.page('ReportSection2').setFilters([predefinedFilter3.toJSON()]);
    updateFiltersPane();
  });

  function getFilterTypeTarget() {
    var filterType = $filterType.val().toLowerCase();
    var filterTypeTarget = {};
    filterTypeTarget.table = $('#filtertable').val();

    if (filterType === "column") {
      filterTypeTarget.column = $('#filtercolumn').val();
    }
    else if (filterType === "hierarchy") {
      filterTypeTarget.hierarchy = $('#filterhierarchy').val();
      filterTypeTarget.hierarchyLevel = $('#filterhierarchylevel').val();
    }
    else if (filterType === "measure") {
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

  function updateFiltersPane() {
    const $filters = $('.filters');

    $.each($filters, function (index, element) {
      const $element = $(element);
      const filterable = $element.data('filterable');

      console.log($element, filterable);

      filterable.getFilters()
        .then(function (filters) {
          console.log(filterable.displayName, filters);
          $element.empty();
          filters
            .map(generateFilterElement)
            .forEach(function ($filter) {
              $element.append($filter);
            });
        });
    });
  }

  // Init
  updateFieldsForType("column");
  updateFieldsForOperator("basic");
  updateTargetFields("report");

  function generateFilterElement(filter) {
    var $removeButton = $('<button>')
      .addClass('btn')
      .addClass('btn-danger')
      .addClass('filter__remove')
      .data('filter', filter)
      .html('&times;')
      ;

    var $filterText = $('<div>')
      .addClass('filter__text')
      .text(JSON.stringify(filter, null, '  '))
      ;

    var $filter = $('<div>')
      .addClass('filter')
      .append($removeButton)
      .append($filterText)
      ;

    return $filter;
  }

  /**
   * Applied Filters Pane
   */
  function createAppliedFiltersPane($element, report) {
    var $appliedFiltersContainer = $('#appliedFilters');
    var $reportFilters = $('#reportFilters');
    var $pageFilters = $('#pageFilters');
    var $refreshAppliedFilters = $('#refreshAppliedFilters');
    let reportPages;

    var filtersTree = {
      filterable: report,
      filters: [],
      nodes: []
    };

    function generatePageFiltersContainer(page) {
      var $heading = $('<h4>')
        .text(page.name)
        ;

      var $filters = $('<div>')
        .addClass('filters')
        .data('filterable', page)
        ;

      var $filtersContainer = $('<div>')
        .append($heading)
        .append($filters)
        ;

      return $filtersContainer;
    }


    // Setup static report filterable on element;
    $reportFilters
      .data('filterable', report);

    // Setup page filters containers which have filterable
    report.getPages()
      .then(function (pages) {
        reportPages = pages;

        pages
          .map(generatePageFiltersContainer)
          .forEach(function ($pageFiltersContainer) {
            $pageFilters.append($pageFiltersContainer)
          });
      });

    $refreshAppliedFilters.on('click', function (event) {
      event.preventDefault();

      updateFiltersPane();
    });

    $appliedFiltersContainer.on('click', 'button.filter__remove', function (event) {
      event.preventDefault();
      const $element = $(event.target);
      const filterToRemove = $element.data('filter');
      const $filter = $element.closest('.filter');
      const $filtersContainer = $element.closest('.filters');
      const filterable = $filtersContainer.data('filterable');

      console.log('remove filter', $element, $filtersContainer, filterToRemove, filterable);

      filterable.getFilters()
        .then(function (filters) {
          let index = -1;
          filters.some(function (filter, i) {
            if (JSON.stringify(filter) === JSON.stringify(filterToRemove)) {
              index = i;
              return true;
            }
          });

          if (index !== -1) {
            filters.splice(index, 1);
            filterable.setFilters(filters);
            $filter.remove();
          }
        });
    });
  };

  /**
   * Remove Filters Buttons
   */
  var $removeFiltersReportForm = $('#removeFiltersReportForm');
  var $removeFiltersPageForm = $('#removeFiltersPageForm');
  var $removeFiltersVisualForm = $('#removeFiltersVisualForm');
  var $removeFiltersPagesList = $('#removeFiltersPagesList');
  var $removeFiltersVisualsList = $('#removeFiltersVisualsList');

  $removeFiltersReportForm.on('submit', function (event) {
    event.preventDefault();

    console.log('submit removeFiltersReportForm');
    customFilterPaneReport.removeFilters();
    updateFiltersPane();
  });

  $removeFiltersPageForm.on('submit', function (event) {
    event.preventDefault();

    var pageName = $removeFiltersPagesList.val();
    console.log('submit removeFiltersPageForm', pageName);
    customFilterPaneReport.page(pageName).removeFilters();
    updateFiltersPane();
  });

  $removeFiltersVisualForm.on('submit', function (event) {
    event.preventDefault();

    var visualName = $removeFiltersVisualsList.val();
    console.log('submit removeFiltersVisualForm', visualName);
    customFilterPaneReport.page('ReportSection2').visual(visualName).removeFilters();
    updateFiltersPane();
  });

  // Init
  fetch(reportUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json()
          .then(function (embedConfig) {
            var customFilterPaneConfig = $.extend({}, embedConfig, {
              settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: true
              }
            });

            customFilterPaneReport = powerbi.embed($customFilterPaneContainer.get(0), customFilterPaneConfig);
            return customFilterPaneReport;
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
        createAppliedFiltersPane(null, report);

        console.log('custom filter pane report loaded');
        report.getPages()
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
    })
    ;

});