var sampleContentLoaded = false;
var documentationContentLoaded = false;
var demosContentLoaded = false;
var anyReportSectionLoaded = false;

$(function() {
    OpenSampleSection();
    WarmStartSampleReportEmbed();
});

function OpenSampleSection() {
    OpenEmbedWorkspace("#main-sample", "step_samples.html");
}

function OpenAnyReportSection() {
    OpenEmbedWorkspace("#main-anyReport", "anyReport.html");
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

    $("#samples-step-wrapper").load(authStepHtml);
    SetActiveStyle(activeTabSelector);

    $(".content").hide();
    $("#sampleContent").show();
    OpenSamplesStep();
}

function OpenDocumentationSection() {
    if (!documentationContentLoaded)
    {
        $("#documentationContent").load("docs.html");
        documentationContentLoaded = true;
    }

    SetActiveStyle("#main-docs");

    $(".content").hide();
    $("#documentationContent").show();
}

function OpenDemosSection() {
    if (!demosContentLoaded)
    {
        $("#demosContent").load("demos.html");
        demosContentLoaded = true;
    }

    SetActiveStyle("#main-demos");

    $(".content").hide();
    $("#demosContent").show();
}

function SetActiveStyle(id)
{
    $("#main-ul li").removeClass("main-li-active");
    $(id).addClass("main-li-active");
}