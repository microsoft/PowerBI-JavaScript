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

    OpenEmbedStep(mode, entityType);
}

function OpenEmbedStep(mode, entityType) {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_li);

    $('#steps-embed a').addClass(active_class);
    $('#steps-embed').addClass(active_li);

    // Hide Embed view in authorization step.
    $("#authorize-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    var embedContainer = $("#embedContainer");
    var dashboardContainer = $("#dashboardContainer");
    var tileContainer = $("#tileContainer");

    if (entityType == EntityType.Report)
    {
        $("#settings").load("settings_embed.html", function() {
            OpenEmbedMode(mode, entityType);

            // Fix report size ratio
            embedContainer.height(embedContainer.width() * 0.59);

            embedContainer.show();
            dashboardContainer.hide();
            tileContainer.hide();
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_embed_dashboard.html", function() {
            OpenEmbedMode(mode, entityType);

            // Fix report size ratio
            dashboardContainer.height(dashboardContainer.width() * 0.59);

            embedContainer.hide();
            dashboardContainer.show();
            tileContainer.hide();
        });
    }
    else
    {
        $("#settings").load("settings_embed_tile.html", function() {
            OpenEmbedMode(mode, entityType);

            tileContainer.height(tileContainer.width() * 0.59);

            embedContainer.hide();
            dashboardContainer.hide();
            tileContainer.show();
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
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_interact_dashboard.html", function() {
            SetToggleHandler("dashboard-operations-div");
            SetToggleHandler("dashboard-events-operations-div");
            LoadCodeArea("#embedCodeDiv", _Dashboard_GetId);
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
    else if (entityType == EntityType.Dashboard)
    {
        LoadCodeArea("#embedCodeDiv", _Embed_DashboardEmbed);
    }
    else
    {
        LoadCodeArea("#embedCodeDiv", _Embed_TileEmbed);
    }
}

function showEmbedSettings(mode, entityType)
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
        embedModeRadios.filter('[value='+ mode + ']').prop('checked', true);
    }
    else if (entityType == EntityType.Dashboard)
    {
        // Do nothing.
    }
}

function OpenEmbedMode(mode, entityType)
{
    if (entityType == EntityType.Report)
    {
        if (mode == EmbedCreateMode)
        {
            if (IsEmbeddingSampleReport())
            {
                LoadSampleDatasetIntoSession().then(function (response) {
                    SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
                    setCodeAndShowEmbedSettings(mode, entityType);
                });
            }
            else
            {
                SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
                setCodeAndShowEmbedSettings(mode, entityType);
            }
        }
        else
        {
            if (IsEmbeddingSampleReport())
            {
                LoadSampleReportIntoSession().then(function (response) {
                    SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
                    setCodeAndShowEmbedSettings(mode, entityType);
                });
            }
            else
            {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
                setCodeAndShowEmbedSettings(mode, entityType);
            }
        }
    }
    else if (entityType == EntityType.Dashboard)
    {
        if (IsEmbeddingSampleDashboard())
        {
            LoadSampleDashboardIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtDashboardEmbed", "#txtEmbedDashboardId");
                setCodeAndShowEmbedSettings(mode, entityType);
            });
        }
        else
        {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtDashboardEmbed", "#txtEmbedDashboardId");
            setCodeAndShowEmbedSettings(mode, entityType);
        }
    }
    else
    {
        if (IsEmbeddingSampleTile())
        {
            LoadSampleTileIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtTileEmbed", "#txtEmbedTileId", "#txtEmbedDashboardId");
                setCodeAndShowEmbedSettings(mode, entityType);
            });
        }
        else
        {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtTileEmbed", "#txtEmbedTileId", "#txtEmbedDashboardId");
            setCodeAndShowEmbedSettings(mode, entityType);
        }
    }
}

function setCodeAndShowEmbedSettings(mode, entityType) {
    setCodeArea(mode, entityType);
    showEmbedSettings(mode, entityType);
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
