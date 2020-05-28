function OpenBookmarksOperations() {
    $("#bookmarks-operations-ul").toggle();
    $("#bookmarks-operations").toggleClass("active");
}

function OpenEditSaveOperations() {
    $("#editsave-operations-ul").toggle();
    $("#editsave-operations").toggleClass("active");
}

function OpenDataOperations() {
    $("#data-operations-ul").toggle();
    $("#data-operations").toggleClass("active");
}

function OpenAuthoringOperations() {
    $("#authoring-operations-ul").toggle();
    $("#authoring-operations").toggleClass("active");
}

function OpenMenuOperations() {
    $("#menu-operations-ul").toggle();
    $("#menu-operations").toggleClass("active");
}

function OpenReportPropertiesOperations() {
    $("#reportproperties-operations-ul").toggle();
    $("#reportproperties-operations").toggleClass("active");
}

function OpenFiltersOperations() {
    $("#filters-operations-ul").toggle();
    $("#filters-operations").toggleClass("active");
}

function OpenGeneralOperations() {
    $("#general-operations-ul").toggle();
    $("#general-operations").toggleClass("active");
}

function OpenLayoutOperations() {
    $("#layout-operations-ul").toggle();
    $("#layout-operations").toggleClass("active");
}

function OpenNavigationOperations() {
    $("#navigation-operations-ul").toggle();
    $("#navigation-operations").toggleClass("active");
}

function OpenDashboardGeneralOperations() {
    $("#dashboard-general-operations-ul").toggle();
    $("#dashboard-general-operations").toggleClass("active");
}

function OpenDashboardPropertiesOperations() {
    $("#dashboard-properties-operations-ul").toggle();
    $("#dashboard-properties-operations").toggleClass("active");
}

function OpenDashboardEventsOperations() {
    $("#dashboard-events-operations-ul").toggle();
    $("#dashboard-events-operations").toggleClass("active");
}

function OpenQnaOperations() {
    $("#qna-operations-ul").toggle();
    $("#qna-operations").toggleClass("active");
}

function OpenQnaEventsOperations() {
    $("#qna-events-operations-ul").toggle();
    $("#qna-events-operations").toggleClass("active");
}

function SetToggleHandler(devId) {
    const selector = "#" + devId + " .function-ul li";
    $(selector).each(function(index, li) {
        $(li).click(function() {
            $(selector).removeClass('active');
            $(li).addClass('active');
        });
    });
}
