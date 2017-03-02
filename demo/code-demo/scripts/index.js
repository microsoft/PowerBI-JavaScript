var sampleContentLoaded = false;
var documentationContentLoaded = false;


$(function() {
    OpenSampleSection();
});

function OpenSampleSection() {
    if (!sampleContentLoaded)
    {
        // Open Report Sample.
        $("#sampleContent").load("sample.html", function() {
            $("#mainContent").load("report.html");
            sampleContentLoaded = true;
        });
    }

    SetActiveStyle("#top-sample");

    $(".content").hide();
    $("#sampleContent").show();
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