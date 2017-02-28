var sampleContentLoaded = false;
var tutorialsContentLoaded = false;
var documentationContentLoaded = false;


$(function() {
    OpenSampleSection();
});

function OpenSampleSection()
{
    if (!sampleContentLoaded)
    {
        // Open Report Sample.
        $("#sampleContent").load("sample.html", function() {
            $("#mainContent").load("report.html");
            sampleContentLoaded = true;
        });
    }

    $(".content").hide();
    $("#sampleContent").show();
}

function OpenTutorialsSection()
{
    if (!tutorialsContentLoaded)
    {
        $("#tutorialsContent").load("tutorials.html");
        tutorialsContentLoaded = true;
    }

    $(".content").hide();
    $("#tutorialsContent").show();
}

function OpenDocumentationSection()
{
    if (!documentationContentLoaded)
    {
        $("#documentationContent").load("docs.html");
        documentationContentLoaded = true;
    }

    $(".content").hide();
    $("#documentationContent").show();
}