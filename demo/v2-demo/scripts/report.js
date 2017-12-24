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

function OpenEmbedStepFromNavPane()
{
    var mode = GetSession(SessionKeys.EmbedMode);
    var entityType = GetSession(SessionKeys.EntityType);
    var tokenType = GetSession(SessionKeys.TokenType);

    OpenEmbedStep(mode, entityType, tokenType);
}

function OpenEmbedStep(mode, entityType, tokenType) {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $('#steps-embed a').addClass(active_class);
    $('#steps-embed').addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    let containers = $(".embedContainer");
    containers.hide();

    if (entityType == EntityType.Report)
    {
        $("#settings").load("settings_embed.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);

            // Fix report size ratio
            var embedContainer = $("#embedContainer");
            embedContainer.height(embedContainer.width() * 0.59);
            embedContainer.show();
        });
    }
    else if (entityType == EntityType.Visual)
    {
        $("#settings").load("settings_embed_visual.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);

            // Fix report size ratio
            var visualContainer = $("#visualContainer");
            visualContainer.height(visualContainer.width() * 0.59);
            visualContainer.show();
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_embed_dashboard.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);

            // Fix report size ratio
            var dashboardContainer = $("#dashboardContainer");
            dashboardContainer.height(dashboardContainer.width() * 0.59);
            dashboardContainer.show();
        });
    }
    else if (entityType == EntityType.Tile)
    {
        $("#settings").load("settings_embed_tile.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);

            var tileContainer = $("#tileContainer");
            tileContainer.height(tileContainer.width() * 0.59);
            tileContainer.show();
        });
    }
    else if (entityType == EntityType.Qna)
    {
        $("#settings").load("settings_embed_qna.html", function() {
            OpenEmbedMode(mode, entityType,tokenType);

            var qnaContainer = $("#qnaContainer");
            qnaContainer.height(qnaContainer.width() * 0.59);
            qnaContainer.show();
        });
    }
}

function OpenInteractStep() {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $('#steps-interact a').addClass(active_class);
    $('#steps-interact').addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    var entityType = GetSession(SessionKeys.EntityType);

    if (entityType == EntityType.Tile)
    {
        $("#settings").load("settings_interact_tile.html", function() {
            SetToggleHandler("tile-operations-div");
            LoadCodeArea("#embedCodeDiv", "");
            AddImgToNewOperations();
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_interact_dashboard.html", function() {
            SetToggleHandler("dashboard-operations-div");
            SetToggleHandler("dashboard-events-operations-div");
            LoadCodeArea("#embedCodeDiv", _Dashboard_GetId);
            AddImgToNewOperations();
        });
    }
    else if (entityType == EntityType.Qna)
    {
        $("#settings").load("settings_interact_qna.html", function() {
            SetToggleHandler("qna-operations-div");
            SetToggleHandler("qna-events-operations-div");
            LoadCodeArea("#embedCodeDiv", _Qna_SetQuestion);
            AddImgToNewOperations();
        });
    }
    else
    {
        $("#settings").load("settings_interact.html", function() {
            SetToggleHandler("report-operations-div");
            SetToggleHandler("page-operations-div");
            SetToggleHandler("events-operations-div");
            SetToggleHandler("editandsave-operations-div");
            LoadCodeArea("#embedCodeDiv", _Report_GetId);
            AddImgToNewOperations();
        });
      }
}

function setCodeArea(mode, entityType)
{
    if (entityType == EntityType.Report)
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
    else if (entityType == EntityType.Visual) {
        LoadCodeArea("#embedCodeDiv", _Embed_VisualEmbed);
    }
    else if (entityType == EntityType.Dashboard)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_DashboardEmbed);
    }
    else if (entityType == EntityType.Tile)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_TileEmbed);
    }
    else if (entityType == EntityType.Qna)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_QnaEmbed);
    }
}

function showEmbedSettings(mode, entityType, tokenType)
{
    if (entityType == EntityType.Report)
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
        embedModeRadios.filter('[value=' + mode + ']').prop('checked', true);

        var embedTypeRadios = $('input:radio[name=tokenType]');
        embedTypeRadios.filter('[value=' + tokenType + ']').prop('checked', true);
    }
    else if (entityType == EntityType.Visual) {
        $("#embedModeInput").show();
        var embedTypeRadios = $('input:radio[name=tokenType]');
        embedTypeRadios.filter('[value=' + tokenType + ']').prop('checked', true);
    }
    else if (entityType == EntityType.Dashboard)
    {
        // Do nothing.
    }
}

function SetEmbedTypeToEmbedToken(tokenType)
{
    SetSession(SessionKeys.TokenType, tokenType);
}

function OpenEmbedMode(mode, entityType, tokenType)
{
    if (entityType == EntityType.Report)
    {
        if (mode == EmbedCreateMode)
        {
            if (IsEmbeddingSampleReport())
            {
                LoadSampleDatasetIntoSession().then(function (response) {
                    SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
                    setCodeAndShowEmbedSettings(mode, entityType, tokenType);
                });
            }
            else
            {
                SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            }
        }
        else
        {
            if (IsEmbeddingSampleReport())
            {
                LoadSampleReportIntoSession().then(function (response) {
                    SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
                    setCodeAndShowEmbedSettings(mode, entityType, tokenType);
                });
            }
            else
            {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            }
        }
    }
    else if (entityType == EntityType.Visual)
    {
        LoadSettings = function() {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
            SetTextboxFromSessionOrUrlParam(SessionKeys.PageName, "#txtPageName");
            SetTextboxFromSessionOrUrlParam(SessionKeys.VisualName, "#txtVisualName");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
        };

        if (IsEmbeddingSampleReport())
        {
            LoadSampleReportIntoSession().then(function (response) {
                LoadSettings();
            });
        }
        else
        {
            LoadSettings();
        }
    }
    else if (entityType == EntityType.Dashboard)
    {
        if (IsEmbeddingSampleDashboard())
        {
            LoadSampleDashboardIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtDashboardEmbed", "#txtEmbedDashboardId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            });
        }
        else
        {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtDashboardEmbed", "#txtEmbedDashboardId");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
        }
    }
    else if (entityType == EntityType.Tile)
    {
        if (IsEmbeddingSampleTile())
        {
            LoadSampleTileIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtTileEmbed", "#txtEmbedTileId", "#txtEmbedDashboardId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            });
        }
        else
        {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtTileEmbed", "#txtEmbedTileId", "#txtEmbedDashboardId");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
        }
    }
    else if (entityType == EntityType.Qna)
    {
        if (IsEmbeddingSampleQna())
        {
            LoadSampleQnaIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtQnaEmbed", "#txtDatasetId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            });
        }
        else
        {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtQnaEmbed", "#txtDatasetId");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
        }
    }
}

function setCodeAndShowEmbedSettings(mode, entityType, tokenType) {
    setCodeArea(mode, entityType);
    showEmbedSettings(mode, entityType, tokenType);
}

function OpenViewMode() {
    SetSession(SessionKeys.EmbedMode, EmbedViewMode);
    OpenEmbedMode(EmbedViewMode, EntityType.Report);
}

function OpenEditMode() {
    SetSession(SessionKeys.EmbedMode, EmbedEditMode);
    OpenEmbedMode(EmbedEditMode, EntityType.Report);
}

function OpenCreateMode() {
    SetSession(SessionKeys.EmbedMode, EmbedCreateMode);
    OpenEmbedMode(EmbedCreateMode, EntityType.Report);
}

function IsEmbeddingSampleReport() {
    return GetSession(SessionKeys.IsSampleReport) == true;
}

function IsEmbeddingSampleDashboard() {
    return GetSession(SessionKeys.IsSampleDashboard) == true;
}

function IsEmbeddingSampleTile() {
    return GetSession(SessionKeys.IsSampleTile) == true;
}

function IsEmbeddingSampleQna() {
    return GetSession(SessionKeys.IsSampleQna) == true;
}

function ToggleQuestionBox(enabled) {
    let txtQuestion = $("#txtQuestion");
    if (enabled === true) {
        txtQuestion.val("This year sales by store type by postal code as map");
        txtQuestion.prop('disabled', false);
    }
    else {
        txtQuestion.val("");
        txtQuestion.prop('disabled', true);
    }
}
