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
    trackEvent(TelemetryEventName.SectionOpen, { section: TelemetrySectionName.Documentation, src: TelemetryEventSource.UserClick });
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
    trackEvent(TelemetryEventName.SectionOpen, { section: TelemetrySectionName.Showcase, src: TelemetryEventSource.UserClick });
}

function SetActiveStyle(id)
{
    $("#main-ul li").removeClass("main-li-active");
    $(id).addClass("main-li-active");
}

const ShowcasesHtmls = {
    CustomLayout: "./live_showcases/custom_layout/showcase_custom_layout.html",
    Bookmarks: "./live_showcases/bookmarks/showcase_bookmarks.html",
    Themes: "./live_showcases/themes/showcase_themes.html",
    InsightToAction: "./live_showcases/insight_to_action/showcase_insight_to_action.html",
    QuickVisualCreator: "./live_showcases/quick_visual_creator/showcase_quick_visual_creator.html",
};

function OpenShowcase(showcaseType) {
    $("#showcasesContent").load(ShowcasesHtmls[showcaseType]);
    showcasesContentLoaded = false;
    trackEvent(TelemetrySectionName.Showcase, { showcaseType: showcaseType, src: TelemetryEventSource.UserClick });
}

function OpenShowcaseFromURL(showcase) {
    $("#showcasesContent").load(ShowcasesHtmls[showcase]);
    SetActiveStyle("#main-showcases");

    $(".content").hide();
    $("#showcasesContent").show();
    trackEvent(TelemetrySectionName.Showcase, { showcaseType: showcase, src: TelemetryEventSource.Url });
}