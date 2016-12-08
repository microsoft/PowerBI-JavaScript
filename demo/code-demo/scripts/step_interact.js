function OpenReportOperations() {
    $("#report-operations-div").show();
    $("#page-operations-div").hide();
    $("#events-operations-div").hide();
    
    $("#report-operations-li").addClass('active');
    $('#page-operations-li').removeClass('active');
    $('#events-operations-li').removeClass('active');

    $("#report-operations-div .function-ul li.active").click()

    $("#selected-catogory-button").html("Report operations");
    HideCategoriesList();
}

function OpenPageOperations() {
    $("#page-operations-div").show();
    $("#report-operations-div").hide();
    $("#events-operations-div").hide();

    $("#page-operations-li").addClass('active');
    $('#report-operations-li').removeClass('active');
    $('#events-operations-li').removeClass('active');

    $("#page-operations-div .function-ul li.active").click();

    $("#selected-catogory-button").html("Page operations");
    HideCategoriesList();
}

function OpenEventOperations() {
    $("#page-operations-div").hide();
    $("#report-operations-div").hide();
    $("#events-operations-div").show();

    $("#page-operations-li").removeClass('active');
    $('#report-operations-li').removeClass('active');
    $('#events-operations-li').addClass('active');
    
    $("#events-operations-div .function-ul li.active").click();

    $("#selected-catogory-button").html("Events Listener");
    HideCategoriesList();
}

function HideCategoriesList() {
    $("#operations-ul-wrapper").hide();
}

function ToggleCategoriesList(event) {
    var wrapper = $("#operations-ul-wrapper");
    if (wrapper.is(":visible"))
    {
        wrapper.hide();
    }
    else
    {
        wrapper.show();
    }
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