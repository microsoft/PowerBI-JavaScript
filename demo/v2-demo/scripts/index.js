var sampleContentLoaded = false;
var documentationContentLoaded = false;
var demosContentLoaded = false;

$(function() {
    OpenSampleSection();
    WarmStartSampleReportEmbed();
    if (GetParameterByName("demos")) {
        $('#main-demos').show();
    }
});

function OpenSampleSection() {
    OpenEmbedWorkspace("#main-sample", "step_samples.html");
}

function OpenEmbedWorkspace(activeTabSelector, samplesStepHtml)
{
    if (!sampleContentLoaded)
    {
        // Open Report Sample.
        $("#sampleContent").load("sample.html", function() {
            $("#mainContent").load("report.html");
            sampleContentLoaded = true;
        });
    }

    $("#samples-step-wrapper").load(samplesStepHtml);
    SetActiveStyle(activeTabSelector);

    $(".content").hide();
    $("#sampleContent").show();
    OpenSamplesStep();

    LayoutDemoState.layoutReport = null;
    BookmarkDemoState.bookmarksReport = null;
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
        $('#embedContainer').removeAttr('id');
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

const DemosHtmls = {
    CustomLayout : "./live_demos/custom_layout/demo_custom_layout.html",
    Bookmarks : "./live_demos/bookmarks/demo_bookmarks.html"
};

function OpenDemo(demoType) {
    $("#demosContent").load(DemosHtmls[demoType]);
    demosContentLoaded = false;
}
