const active_class = 'active';
const active_steps_li = 'steps-li-active';
const active_tabs_li = 'tabs-li-active';

const EmbedViewMode = "view";
const EmbedEditMode = "edit";
const EmbedCreateMode = "create";

const runEmbedCodeTimeout = 500;

function OpenSamplesStep() {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_steps_li);

    $("#steps-samples a").addClass(active_class);
    $("#steps-samples").addClass(active_steps_li);

    // Hide Embed view in authorization step.
    $("#samples-step-wrapper").show();
    $("#embed-and-interact-steps-wrapper").hide();
}

function OpenCodeStepFromNavPane()
{
    var mode = GetSession(SessionKeys.EmbedMode);
    var entityType = GetSession(SessionKeys.EntityType);
    var tokenType = GetSession(SessionKeys.TokenType);

    OpenCodeStep(mode, entityType, tokenType);
}

function OpenCodeStep(mode, entityType, tokenType) {
    $('#steps-ul a').removeClass(active_class);
    $(".steps-li-active").removeClass(active_steps_li);

    $('#steps-code a').addClass(active_class);
    $('#steps-code').addClass(active_steps_li);

    // Hide Embed view in authorization step.
    $("#samples-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    let containers = $(".iframeContainer");
    containers.removeClass(active_class);

    var containerID = getEmbedContainerID(entityType);
    var classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'Container').removeAttr('id');
    $(classPrefix + 'MobileContainer').removeAttr('id');

    var activeContainer = classPrefix + ($(".desktop-view").hasClass(active_class) ? 'Container' : 'MobileContainer');

    $(activeContainer).attr('id', containerID);
    $(activeContainer).addClass(active_class);

    $('.' + active_tabs_li).removeClass(active_tabs_li);

    $('#embed-tab').addClass(active_tabs_li);
    $('#interact-tab').removeClass(active_tabs_li);

    LoadEmbedSettings(mode, entityType, tokenType);
}

function LoadEmbedSettings(mode, entityType, tokenType) {
    if (entityType == EntityType.Report)
    {
        $("#settings").load("settings_embed_report.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);
        });
    }
    else if (entityType == EntityType.Visual)
    {
        $("#settings").load("settings_embed_visual.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_embed_dashboard.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);
        });
    }
    else if (entityType == EntityType.Tile)
    {
        $("#settings").load("settings_embed_tile.html", function() {
            OpenEmbedMode(mode, entityType, tokenType);
        });
    }
    else if (entityType == EntityType.Qna)
    {
        $("#settings").load("settings_embed_qna.html", function() {
            OpenEmbedMode(mode, entityType,tokenType);
        });
    }
}

function OpenEmbedTab() {
    if ($('#embed-tab').hasClass(active_tabs_li)) {
        return;
    }

    $('.' + active_tabs_li).removeClass(active_tabs_li);

    $('#embed-tab').addClass(active_tabs_li);

    var mode = GetSession(SessionKeys.EmbedMode);
    var entityType = GetSession(SessionKeys.EntityType);
    var tokenType = GetSession(SessionKeys.TokenType);

    LoadEmbedSettings(mode, entityType, tokenType);
}

function isInteractStepEnabled(entityType) {
    var classPrefix = getEmbedContainerClassPrefix(entityType);
    var activeContainer = classPrefix + ($(".desktop-view").hasClass(active_class) ? 'Container' : 'MobileContainer');

    // Check if active container has an iframe
    return $(activeContainer + " iframe").length > 0;
}

function OpenInteractTab() {
    var entityType = GetSession(SessionKeys.EntityType);
    // Interact step is disabled unless active container has an iframe
    if (!isInteractStepEnabled(entityType)) {
        // TODO: SHOW TOOLTIP "Press the run button in order to embed, before interacting"
        return;
    }

    $('.' + active_tabs_li).removeClass(active_tabs_li);
    $('#interact-tab').addClass(active_tabs_li);

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
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
    else if (entityType == EntityType.Qna)
    {
        $("#settings").load("settings_interact_qna.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
    else if (entityType == EntityType.Visual)
    {
        $("#settings").load("settings_interact_visual.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
    else
    {
        $("#settings").load("settings_interact_report.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
}

function setCodeArea(mode, entityType)
{
    const isDesktop = $(".desktop-view").hasClass(active_class);
    if (entityType == EntityType.Report)
    {
        if (mode === EmbedViewMode)
        {
            const code = isDesktop ? _Embed_BasicEmbed : _Embed_BasicEmbed_Mobile;
            LoadCodeArea("#embedCodeDiv", code);
        }
        else if (mode === EmbedEditMode)
        {
            const code = isDesktop ? _Embed_BasicEmbed_EditMode : _Embed_MobileEditNotSupported;
            LoadCodeArea("#embedCodeDiv", code);
        }
        else if (mode === EmbedCreateMode)
        {
            const code = isDesktop ? _Embed_BasicEmbed_EditMode : _Embed_MobileCreateNotSupported;
            LoadCodeArea("#embedCodeDiv", code);
        }
    }
    else if (entityType == EntityType.Visual) {
        LoadCodeArea("#embedCodeDiv", _Embed_VisualEmbed);
    }
    else if (entityType == EntityType.Dashboard)
    {
        const code = isDesktop ? _Embed_DashboardEmbed : _Embed_DashboardEmbed_Mobile;
        LoadCodeArea("#embedCodeDiv", code);
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
            LoadSampleVisualIntoSession().then(function (response) {
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

function EmbedAreaDesktopView() {
    if ($(".desktop-view").hasClass(active_class)) {
        return;
    }

    var entityType = GetSession(SessionKeys.EntityType);
    var mode = GetSession(SessionKeys.EmbedMode);

    $(".desktop-view").show();
    $(".mobile-view").hide();
    
    $(".desktop-view").addClass(active_class);
    $(".mobile-view").removeClass(active_class);

    var containerID = getEmbedContainerID(entityType);
    var classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'MobileContainer').removeAttr('id');
    $(classPrefix + 'Container').attr('id', containerID);

    $(classPrefix + 'MobileContainer').removeClass(active_class);
    $(classPrefix + 'Container').addClass(active_class);

    if(!$('#embed-tab').hasClass("tabs-li-active")) {
        return;
    }

    // Update embed code area
    setCodeArea(mode, entityType)

    // Check if run button was clicked in the other mode and wasn't clicked on the new mode
    if ($(classPrefix + "MobileContainer iframe").length && !$(classPrefix + "Container iframe").length) {
        setTimeout(function() {
            $('#btnRunCode').click();
        }, runEmbedCodeTimeout);
    }
}

function EmbedAreaMobileView() {
    if ($(".mobile-view").hasClass(active_class)) {
        return;
    }

    var entityType = GetSession(SessionKeys.EntityType);
    var mode = GetSession(SessionKeys.EmbedMode);

    $(".desktop-view").hide();
    $(".mobile-view").show();

    $(".desktop-view").removeClass(active_class);
    $(".mobile-view").addClass(active_class);

    var containerID = getEmbedContainerID(entityType);
    var classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'Container').removeAttr('id');
    $(classPrefix + 'MobileContainer').attr('id', containerID);

    $(classPrefix + 'Container').removeClass(active_class);
    $(classPrefix + 'MobileContainer').addClass(active_class);

    if(!$('#embed-tab').hasClass("tabs-li-active")) {
        return;
    }

    // Update embed code area
    setCodeArea(mode, entityType)

    // Check if run button was clicked in the other mode and wasn't clicked on the new mode
    if ($(classPrefix + "Container iframe").length && !$(classPrefix + "MobileContainer iframe").length) {
        setTimeout(function() {
            $('#btnRunCode').click();
        }, runEmbedCodeTimeout);
    }
}
