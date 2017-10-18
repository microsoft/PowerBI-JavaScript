function OpenReportOperations() {
    $("#report-operations-div").show();
    $("#page-operations-div").hide();
    $("#events-operations-div").hide();
    $("#editandsave-operations-div").hide();

    $("#report-operations-li").addClass('active');
    $('#page-operations-li').removeClass('active');
    $('#events-operations-li').removeClass('active');
    $('#editandsave-operations-li').removeClass('active');
    
    $("#report-operations-div .function-ul li.active").click()
    $("#selected-catogory-button").html("Report operations");
}

function OpenPageOperations() {
    $("#page-operations-div").show();
    $("#report-operations-div").hide();
    $("#events-operations-div").hide();
    $("#editandsave-operations-div").hide();

    $("#page-operations-li").addClass('active');
    $('#report-operations-li').removeClass('active');
    $('#events-operations-li').removeClass('active');
    $('#editandsave-operations-li').removeClass('active');

    $("#page-operations-div .function-ul li.active").click();

    $("#selected-catogory-button").html("Page operations");
}

function OpenEventOperations() {
    $("#page-operations-div").hide();
    $("#report-operations-div").hide();
    $("#events-operations-div").show();
    $("#editandsave-operations-div").hide();

    $("#page-operations-li").removeClass('active');
    $('#report-operations-li').removeClass('active');
    $('#events-operations-li').addClass('active');
    $('#editandsave-operations-li').removeClass('active');

    $("#events-operations-div .function-ul li.active").click();

    $("#selected-catogory-button").html("Events Listener");
}

function OpenEditAndSaveOperations() {
    $("#page-operations-div").hide();
    $("#report-operations-div").hide();
    $("#events-operations-div").hide();
    $("#editandsave-operations-div").show();

    $("#page-operations-li").removeClass('active');
    $('#report-operations-li').removeClass('active');
    $('#events-operations-li').removeClass('active');
    $('#editandsave-operations-li').addClass('active');
    
    $("#editandsave-operations-div .function-ul li.active").click();

    $("#selected-catogory-button").html("Edit and save operations");
}

function OpenTileOperations() {
    $("#tile-operations-div").show();
    $("#tile-operations-li").addClass('active');
    
    $("#tile-operations-div .function-ul li.active").click()
    $("#selected-catogory-button").html("Tile operations");
}

function OpenQnaOperations() {
    $("#qna-operations-div").show();
    $("#qna-operations-li").addClass('active');
    
    $("#qna-operations-div .function-ul li.active").click()
    $("#selected-catogory-button").html("QNA operations");
}

function OpenDashboardOperations() {
    $("#dashboard-operations-div").show();
    $("#dashboard-events-operations-div").hide();

    $("#dashboard-operations-li").addClass('active');
    $('#dashboard-events-operations-li').removeClass('active');
    
    $("#dashboard-operations-div .function-ul li.active").click()
    $("#selected-catogory-button").html("Dashboard operations");
}

function OpenDashboardEventOperations() {
    $("#dashboard-operations-div").hide();
    $("#dashboard-events-operations-div").show();

    $('#dashboard-operations-li').removeClass('active');
    $('#dashboard-events-operations-li').addClass('active');

    $("#dashboard-events-operations-div .function-ul li.active").click();
    $("#selected-catogory-button").html("Events Listener");
}

function SetToggleHandler(devId) {
    var selector = "#" + devId + " .function-ul li";
    $(selector).each(function(index, li) {
        $(li).click(function() {
            $(selector).removeClass('active');
            $(li).addClass('active');
        });
    });
}
