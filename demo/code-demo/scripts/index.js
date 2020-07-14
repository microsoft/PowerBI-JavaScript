var sampleContentLoaded = false;
var documentationContentLoaded = false;
var anyReportSectionLoaded = false;

$(function() {
    OpenSampleSection();
});

function OpenSampleSection() {
    OpenEmbedWorkspace("#top-sample", "step_authorize.html");
}

function OpenAnyReportSection() {
    OpenEmbedWorkspace("#top-anyReport", "anyReport.html");
}

function OpenEmbedWorkspace(activeTabSelector, authStepHtml)
{
    // Any report, uses the same settings as sample report. ony changes the auth step.
    if (!sampleContentLoaded)
    {
        // Open Report Sample.
        $("#sampleContent").load("sample.html", function() {
            $("#mainContent").load("report.html");
            sampleContentLoaded = true;
        });
    }

    $("#authorize-step-wrapper").load(authStepHtml);
    SetActiveStyle(activeTabSelector);

    $(".content").hide();
    $("#sampleContent").show();
    OpenAuthStep();
}

function OpenDocumentationSection() {
    if (!documentationContentLoaded)
    {
        $("#documentationContent").load("docs.html");
        documentationContentLoaded = true;
    }

    SetActiveStyle("#top-docs");

    $(".content").hide();
    $("#documentationContent").show();
}

function SetActiveStyle(id)
{
    $("#top-ul li").removeClass("top-li-active");
    $(id).addClass("top-li-active");
}