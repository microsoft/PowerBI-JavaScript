const active_class = 'active';
const active_li = 'steps-li-active';

const EmbedViewMode = "view";
const EmbedEditMode = "edit";
const EmbedCreateMode = "create";

function OpenAuthStep() {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $("#steps-auth a").addClass(active_class);
    $("#steps-auth").addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").show();
    $("#embed-and-interact-steps-wrapper").hide();
}

function OpenEmbedStep(mode) {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $('#steps-embed a').addClass(active_class);
    $('#steps-embed').addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    $("#settings").load("settings_embed.html", function() {
        OpenEmbedMode(mode);

        // Fix report size ratio
        var reportContainer = $("#reportContainer");
        reportContainer.height(reportContainer.width() * 0.59);
    });
}

function OpenInteractStep() {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $('#steps-interact a').addClass(active_class);
    $('#steps-interact').addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    $("#settings").load("settings_interact.html", function() {
        SetToggleHandler("report-operations-div");
        SetToggleHandler("page-operations-div");
        SetToggleHandler("events-operations-div");
        SetToggleHandler("editandsave-operations-div");
        LoadCodeArea("#embedCodeDiv", _Report_GetId);
    });
}

function setCodeArea(mode)
{
    if (mode === EmbedViewMode)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_BasicEmbed);
    }
    else if (mode === EmbedEditMode)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_BasicEmbed_EditMode);
    }
    else if (mode === EmbedCreateMode)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_Create);
    }
}

function showEmbedSettings(mode)
{
    var inputDivToShow = "#embedModeInput";
    var inputDivToHide = "#createModeInput";

    if (mode === EmbedCreateMode)
    {
        inputDivToShow = "#createModeInput";
        inputDivToHide = "#embedModeInput";
    }
    
    $(inputDivToShow).show();
    $(inputDivToHide).hide();

    var embedModeRadios = $('input:radio[name=embedMode]'); 
    embedModeRadios.filter('[value='+ mode + ']').prop('checked', true);
}

function OpenEmbedMode(mode)
{
    if (mode == EmbedCreateMode)
    {
        if (IsEmbeddingSampleReport())
        {
            LoadSampleDatasetIntoSession();
        }

        SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
    }
    else {
        if (IsEmbeddingSampleReport())
        {
            LoadSampleReportIntoSession();
        }

        SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
    }

    setCodeArea(mode);
    showEmbedSettings(mode);
}

function OpenViewMode() {
    OpenEmbedMode(EmbedViewMode);
}

function OpenEditMode() {
    OpenEmbedMode(EmbedEditMode);
}

function OpenCreateMode() {
    OpenEmbedMode(EmbedCreateMode);
}

function IsEmbeddingSampleReport() {
    return GetSession(SessionKeys.IsSampleReport) == true;
}
