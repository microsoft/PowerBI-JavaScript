var sampleContentLoaded = false;
var documentationContentLoaded = false;
var showcasesContentLoaded = false;

$(function() {
    OpenSampleSection();
    WarmStartSampleReportEmbed();
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

    LayoutShowcaseState.layoutReport = null;
    BookmarkShowcaseState.bookmarksReport = null;
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

function OpenShowcasesSection() {
    if (!showcasesContentLoaded)
    {
        $('#embedContainer').removeAttr('id');
        $("#showcasesContent").load("showcases.html");
        showcasesContentLoaded = true;
    }

    SetActiveStyle("#main-showcases");

    $(".content").hide();
    $("#showcasesContent").show();
}

function SetActiveStyle(id)
{
    $("#main-ul li").removeClass("main-li-active");
    $(id).addClass("main-li-active");
}

const ShowcasesHtmls = {
    CustomLayout : "./live_showcases/custom_layout/showcase_custom_layout.html",
    Bookmarks : "./live_showcases/bookmarks/showcase_bookmarks.html"
};

function OpenShowcase(showcaseType) {
    $("#showcasesContent").load(ShowcasesHtmls[showcaseType]);
    showcasesContentLoaded = false;
}

function OpenShowcaseFromURL(showcase) {
    $("#showcasesContent").load(ShowcasesHtmls[showcase]);
    SetActiveStyle("#main-showcases");

    $(".content").hide();
    $("#showcasesContent").show();
}