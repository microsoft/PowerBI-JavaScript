const active_class = 'active';
const active_steps_li = 'steps-li-active';
const active_tabs_li = 'tabs-li-active';
const active_mode = 'active-mode'

const EmbedViewMode = "view";
const EmbedEditMode = "edit";
const EmbedCreateMode = "create";

const runEmbedCodeTimeout = 500;
const interactTooltipTimeout = 2000;

const defaultTokenType = 1;
const defaultQnaQuestion = "2014 total units YTD var % by month, manufacturer as clustered column chart";
const defaultQnaMode = "Interactive";
const interactiveNoQuestionMode = "InteractiveNoQuestion";

function OpenSamplesStep() {
    $('#steps-ul a').removeClass(active_class);
    $('.'+ active_steps_li).removeClass(active_steps_li);

    $("#steps-samples a").addClass(active_class);
    $("#steps-samples a").addClass(active_steps_li);

    $('#interact-tab').removeClass('enableTransition');
    $('#interact-tab').removeClass('changeColor');

    // Hide Embed view in samples step.
    $("#samples-step-wrapper").show();
    $("#embed-and-interact-steps-wrapper").hide();

    $("#welcome-text").show();

    trackEvent(TelemetryEventName.InnerSectionOpen, { section: TelemetryInnerSection.Sample, src: TelemetryEventSource.UserClick });
}

function OpenCodeStepFromNavPane()
{
    const mode = GetSession(SessionKeys.EmbedMode);
    const entityType = GetSession(SessionKeys.EntityType);
    const tokenType = GetSession(SessionKeys.TokenType);

    OpenCodeStep(mode, entityType, tokenType);
}

function OpenCodeStep(mode, entityType, tokenType) {
    $('#steps-ul a').removeClass(active_class);
    $('.' + active_steps_li).removeClass(active_steps_li);

    $('#steps-code a').addClass(active_class);
    $('#steps-code a').addClass(active_steps_li);

    // Hide Embed view in samples step.
    $("#samples-step-wrapper").hide();
    $("#embed-and-interact-steps-wrapper").show();

    $("#welcome-text").hide();
    $("#playground-banner").hide();

    $("#highlighter").empty();

    let containers = $(".iframeContainer");
    containers.removeClass(active_class);

    const containerID = getEmbedContainerID(entityType);
    const classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'Container').removeAttr('id');
    $(classPrefix + 'MobileContainer').removeAttr('id');

    // remove ID if exists on any container
    $("#" + containerID).removeAttr('id');

    const activeContainer = classPrefix + ($(".desktop-view").hasClass(active_class) ? 'Container' : 'MobileContainer');

    $(activeContainer).attr('id', containerID);
    $(activeContainer).addClass(active_class);

    $('.' + active_tabs_li).removeClass(active_tabs_li);

    $('#embed-tab').addClass(active_tabs_li);
    $('#interact-tab').removeClass(active_tabs_li);

    LoadEmbedSettings(mode, entityType, tokenType);

    trackEvent(TelemetryEventName.InnerSectionOpen, { section: TelemetryInnerSection.Code, src: TelemetryEventSource.UserClick });
}

function bootstrapIframe(entityType) {
    const activeContainer = getActiveEmbedContainer();

    // To avoid multiple bootstrap when switching between Desktop view and Phone view 
    // and also when changing the mode (view/edit/create).
    if (activeContainer.children.length > 0) {
      // entity is already embedded
      return;
    }

    // Bootstrap iframe - for better performance.
    let embedUrl = GetSession(SessionKeys.EmbedUrl);
    config = {
        type: entityType.toLowerCase(),
        embedUrl: embedUrl
    };

    const isMobile = $(".mobile-view").hasClass(active_class);
    if (isMobile) {
        config.settings = {
            layoutType: models.LayoutType.MobilePortrait
        };
    }

    // Hide the container in order to hide the spinner.
    $(activeContainer).css({"visibility":"hidden"});
    powerbi.bootstrap(activeContainer, config);
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
    else if (entityType == EntityType.PaginatedReport)
    {
        $("#settings").load("settings_embed_paginatedreport.html", function() {
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

    const mode = GetSession(SessionKeys.EmbedMode);
    const entityType = GetSession(SessionKeys.EntityType);
    const tokenType = GetSession(SessionKeys.TokenType);

    LoadEmbedSettings(mode, entityType, tokenType);
}

function isInteractStepEnabled(entityType) {
    const classPrefix = getEmbedContainerClassPrefix(entityType);
    const activeContainer = classPrefix + ($(".desktop-view").hasClass(active_class) ? 'Container' : 'MobileContainer');

    // Check if active container has an iframe
    return $(activeContainer + " iframe").length > 0;
}

function OpenInteractTab() {
    const entityType = GetSession(SessionKeys.EntityType);
    // Interact step is disabled unless active container has an iframe
    if (!isInteractStepEnabled(entityType)) {
        $('.interactTooltip .tooltipText').addClass("showTooltip");
        setTimeout(function() {
            $('.interactTooltip .tooltipText').removeClass("showTooltip");
        }, interactTooltipTimeout);
        return;
    }
    $('#interact-tab').removeClass('enableTransition');
    $('#interact-tab').removeClass('changeColor');

    $('.' + active_tabs_li).removeClass(active_tabs_li);
    $('#interact-tab').addClass(active_tabs_li);

    if (entityType == EntityType.Tile)
    {
        $("#settings").load("settings_interact_tile.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        $("#settings").load("settings_interact_dashboard.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
            hideFeaturesOnMobile();
        });
    }
    else if (entityType == EntityType.Qna)
    {
        $("#settings").load("settings_interact_qna.html", function() {
            const isResultOnlyMode = GetSession(SessionKeys.QnaMode) === "ResultOnly";
            // Hide set question on interactive mode
            $('#qna-operations').toggle(isResultOnlyMode);
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
    else if (entityType == EntityType.PaginatedReport)
    {
        $("#settings").load("settings_interact_paginatedreport.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
        });
    }
    else
    {
        $("#settings").load("settings_interact_report.html", function() {
            SetToggleHandler("operation-categories");
            LoadCodeArea("#embedCodeDiv", "");
            $('.hideOnReportCreate').toggle(GetSession(SessionKeys.EmbedMode) !== EmbedCreateMode);
            hideFeaturesOnMobile();
        });
    }
}

function setCodeArea(mode, entityType)
{
    LoadCodeArea("#embedCodeDiv", getEmbedCode(mode, entityType));
}

function getEmbedCode(mode, entityType)
{
    const isDesktop = $(".desktop-view").hasClass(active_class);
    let code = "";
    if (entityType == EntityType.Report)
    {
        if (mode === EmbedViewMode)
        {
            code = isDesktop ? _Embed_BasicEmbed : _Embed_BasicEmbed_Mobile;
        }
        else if (mode === EmbedEditMode)
        {
            code = isDesktop ? _Embed_BasicEmbed_EditMode : _Embed_MobileEditNotSupported;
        }
        else if (mode === EmbedCreateMode)
        {
            code = isDesktop ? _Embed_Create : _Embed_MobileCreateNotSupported;
        }
    }
    else if (entityType == EntityType.Visual) {
        code = _Embed_VisualEmbed;
    }
    else if (entityType == EntityType.Dashboard)
    {
        code = isDesktop ? _Embed_DashboardEmbed : _Embed_DashboardEmbed_Mobile;
    }
    else if (entityType == EntityType.Tile)
    {
        code = _Embed_TileEmbed;
    }
    else if (entityType == EntityType.Qna)
    {
        code = GetParameterByName(SessionKeys.TokenType) === '0' /* AAD Token */ ? _Embed_QnaEmbed_Aad : _Embed_QnaEmbed;
    }
    else if (entityType == EntityType.PaginatedReport)
    {
       code = _Embed_PaginatedReportBasicEmbed
    }
    return code;
}

function showEmbedSettings(mode, entityType, tokenType)
{
    if (entityType == EntityType.Report)
    {
        let inputDivToShow = "#embedModeInput";
        let inputDivToHide = "#createModeInput";

        if (mode === EmbedCreateMode)
        {
            inputDivToShow = "#createModeInput";
            inputDivToHide = "#embedModeInput";
        }

        $(inputDivToShow).show();
        $(inputDivToHide).hide();

        let embedModeRadios = $('input:radio[name=embedMode]');
        embedModeRadios.filter('[value=' + mode + ']').prop('checked', true);

        let embedTypeRadios = $('input:radio[name=tokenType]');
        embedTypeRadios.filter('[value=' + tokenType + ']').prop('checked', true);
    }
    else if (entityType == EntityType.Visual) {
        $("#embedModeInput").show();
        let embedTypeRadios = $('input:radio[name=tokenType]');
        embedTypeRadios.filter('[value=' + tokenType + ']').prop('checked', true);
    }
    else if (entityType == EntityType.Dashboard)
    {
        // Do nothing.
    }
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
        LoadSettings = function() {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtQnaEmbed", "#txtDatasetId");
            SetTextboxFromSessionOrUrlParam(SessionKeys.QnaQuestion, "#txtQuestion");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            let qnaMode = GetParameterByName(SessionKeys.QnaMode);
            if (qnaMode) {
                let modesRadios = $('input:radio[name=qnaMode]');
                modesRadios.filter('[id=' + qnaMode + ']').prop('checked', true);
                qnaMode = qnaMode !== interactiveNoQuestionMode ? qnaMode : defaultQnaMode;
                SetSession(SessionKeys.QnaMode, qnaMode);
            }
        };

        if (IsEmbeddingSampleQna())
        {
            LoadSampleQnaIntoSession().then(function (response) {
                if (!GetSession(SessionKeys.QnaQuestion)) {
                    SetSession(SessionKeys.QnaQuestion, defaultQnaQuestion);
                }

                LoadSettings();
            });
        }
        else
        {
            LoadSettings();
        }
    }
    else if (entityType == EntityType.PaginatedReport) {
        if (IsEmbeddingSamplePaginatedReport()) {
            LoadSamplePaginatedReportIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
                setCodeAndShowEmbedSettings(mode, entityType, tokenType);
            });
        }
        else {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
            setCodeAndShowEmbedSettings(mode, entityType, tokenType);
        }
    }
}

function setCodeAndShowEmbedSettings(mode, entityType, tokenType) {
    setCodeArea(mode, entityType);
    showEmbedSettings(mode, entityType, tokenType);
    bootstrapIframe(entityType);
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

function IsEmbeddingSamplePaginatedReport() {
    return GetSession(SessionKeys.IsSamplePaginatedReport) == true;
}

function ToggleQuestionBox(enabled) {
    UpdateSession("input[name='qnaMode']:checked", SessionKeys.QnaMode);
    let txtQuestion = $("#txtQuestion");
    if (enabled === true) {
        let question = GetSession(SessionKeys.QnaQuestion);
        question = question ? question : defaultQnaQuestion;
        txtQuestion.val(question);
        txtQuestion.prop('disabled', false);
    }
    else {
        txtQuestion.val("");
        txtQuestion.prop('disabled', true);
    }
}

function OnTokenTypeRadioClicked(tokenType) {
    SetSession(SessionKeys.TokenType, tokenType);
    const entityType = GetSession(SessionKeys.EntityType);

    if (tokenType == 0 /* AAD Token */) {
        $('.inputLine input').each(function () {
            $(this).val("");
            let onChangeFunc = $(this).attr("onchange");
            if (onChangeFunc) {
                // Change 'this' to button's identifier
                onChangeFunc = onChangeFunc.replace("this", "'input#" + $(this).attr('id') + "'");
                eval(onChangeFunc);
            }
        });

    } else {
        // Moving to embed token will reload the sample
        ReloadSample(entityType);
    }
}

function ReloadSample(entityType) {
    const mode = GetSession(SessionKeys.EmbedMode);
    SetIsSample(true);

    if (entityType == EntityType.Report)
    {
        if (mode == EmbedCreateMode)
        {
            LoadSampleDatasetIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtCreateAccessToken", "#txtCreateReportEmbed", "#txtEmbedDatasetId");
            });
        }
        else
        {
            LoadSampleReportIntoSession().then(function (response) {
                SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
            });
        }
    }
    else if (entityType == EntityType.Visual)
    {
        LoadSampleVisualIntoSession().then(function (response) {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
            SetTextboxFromSessionOrUrlParam(SessionKeys.PageName, "#txtPageName");
            SetTextboxFromSessionOrUrlParam(SessionKeys.VisualName, "#txtVisualName");
        });
    }
    else if (entityType == EntityType.Dashboard)
    {
        LoadSampleDashboardIntoSession().then(function (response) {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtDashboardEmbed", "#txtEmbedDashboardId");
        });
    }
    else if (entityType == EntityType.Tile)
    {
        LoadSampleTileIntoSession().then(function (response) {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtTileEmbed", "#txtEmbedTileId", "#txtEmbedDashboardId");
        });
    }
    else if (entityType == EntityType.Qna)
    {
        LoadSampleQnaIntoSession().then(function (response) {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtQnaEmbed", "#txtDatasetId");
        });
    }
    else if (entityType == EntityType.PaginatedReport)
    {
        LoadSamplePaginatedReportIntoSession().then(function (response) {
            SetTextBoxesFromSessionOrUrlParam("#txtAccessToken", "#txtReportEmbed", "#txtEmbedReportId");
        });
    }
}

function EmbedAreaDesktopView() {
    if ($(".desktop-view").hasClass(active_class)) {
        return;
    }

    $("#btnPhoneView").removeClass(active_mode);
    $("#btnDesktopView").addClass(active_mode);

    const entityType = GetSession(SessionKeys.EntityType);
    const mode = GetSession(SessionKeys.EmbedMode);

    $(".desktop-view").show();
    $(".mobile-view").hide();

    $(".desktop-view").addClass(active_class);
    $(".mobile-view").removeClass(active_class);

    const containerID = getEmbedContainerID(entityType);
    const classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'MobileContainer').removeAttr('id');
    $(classPrefix + 'Container').attr('id', containerID);

    $(classPrefix + 'MobileContainer').removeClass(active_class);
    $(classPrefix + 'Container').addClass(active_class);

    if($('#embed-tab').hasClass(active_tabs_li)) {
        // Update embed code area
        setCodeArea(mode, entityType);
    }

    $('.hideOnMobile').show();

    // Check if run button was clicked in the other mode and wasn't clicked on the new mode
    if ($(classPrefix + "MobileContainer iframe").length && !$(classPrefix + "Container iframe").length) {
        let runFunc = getEmbedCode(mode, entityType);
        if ($('#interact-tab').hasClass(active_tabs_li)) {
            runFunc = updateRunFuncSessionParameters(runFunc);
            eval(runFunc);
        } else {
            runFunc();
        }
    }
    trackEvent(TelemetryEventName.DesktopModeOpen, {});
}

function EmbedAreaMobileView() {
    if ($(".mobile-view").hasClass(active_class)) {
        return;
    }

    $("#btnDesktopView").removeClass(active_mode);
    $("#btnPhoneView").addClass(active_mode);

    const entityType = GetSession(SessionKeys.EntityType);
    const mode = GetSession(SessionKeys.EmbedMode);

    $(".desktop-view").hide();
    $(".mobile-view").show();

    $(".desktop-view").removeClass(active_class);
    $(".mobile-view").addClass(active_class);

    const containerID = getEmbedContainerID(entityType);
    const classPrefix = getEmbedContainerClassPrefix(entityType);

    $(classPrefix + 'Container').removeAttr('id');
    $(classPrefix + 'MobileContainer').attr('id', containerID);

    $(classPrefix + 'Container').removeClass(active_class);
    $(classPrefix + 'MobileContainer').addClass(active_class);

    if($('#embed-tab').hasClass(active_tabs_li)) {
        // Update embed code area
        setCodeArea(mode, entityType);
    }

    $('.hideOnMobile').hide();

    // Remove active class and code if the feature should be hidden on mobile view
    if ($('#interact-tab').hasClass(active_tabs_li)) {
        let activeHideOnMobile = $('.function-ul .hideOnMobile.active');
        if (activeHideOnMobile.length) {
            activeHideOnMobile.removeClass(active_class);
            LoadCodeArea("#embedCodeDiv", "");
        }
    }

    // Check if run button was clicked in the other mode and wasn't clicked on the new mode
    if ($(classPrefix + "Container iframe").length && !$(classPrefix + "MobileContainer iframe").length) {
      // It's not enough to check the number of iframes because of the bootstrap feature.
      if (GetSession(SessionKeys.EntityIsAlreadyEmbedded)) {
        let runFunc = getEmbedCode(mode, entityType);
        if ($('#interact-tab').hasClass(active_tabs_li)) {
            runFunc = updateRunFuncSessionParameters(runFunc);
            eval(runFunc);
        } else {
            runFunc();
        }
      }
    }
    trackEvent(TelemetryEventName.MobileModeOpen, {});
}

function updateRunFuncSessionParameters(runFunc) {
    const entityType = GetSession(SessionKeys.EntityType);
    const accessToken = '"' + GetSession(SessionKeys.AccessToken) + '"';
    const embedUrl = '"' + GetSession(SessionKeys.EmbedUrl) + '"';
    const embedId = '"' + GetSession(SessionKeys.EmbedId) + '"';
    const dashboardId = '"' + GetSession(SessionKeys.DashboardId) + '"';
    const pageName = '"' + GetSession(SessionKeys.PageName) + '"';
    const visualName = '"' + GetSession(SessionKeys.VisualName) + '"';

    let code = BodyCodeOfFunction(runFunc);
    let tokenType = GetSession(SessionKeys.TokenType);
    tokenType = (tokenType != undefined)? tokenType : defaultTokenType;
    code = code.replace("$('#txtAccessToken').val()", accessToken)
                .replace("$('input:radio[name=tokenType]:checked').val()", tokenType);

    if (entityType == EntityType.Report) {
        code = code.replace("$('#txtReportEmbed').val()", embedUrl)
                    .replace("$('#txtEmbedReportId').val()", embedId);
    } else if (entityType == EntityType.Dashboard) {
        code = code.replace("$('#txtDashboardEmbed').val()", embedUrl)
                    .replace("$('#txtEmbedDashboardId').val()", embedId);
    } else if (entityType == EntityType.Tile) {
        code = code.replace("$('#txtTileEmbed').val()", embedUrl)
                    .replace("$('#txtEmbedDashboardId').val()", dashboardId)
                    .replace("$('#txtEmbedTileId').val()", embedId);
    } else if (entityType == EntityType.Visual) {
        code = code.replace("$('#txtReportEmbed').val()", embedUrl)
                    .replace("$('#txtEmbedReportId').val()", embedId)
                    .replace("$('#txtPageName').val()", pageName)
                    .replace("$('#txtVisualName').val()", visualName);
    } else if (entityType == EntityType.Qna) {
        let question = GetSession(SessionKeys.QnaQuestion);
        question = question? question : defaultQnaQuestion;
        let mode = GetSession(SessionKeys.QnaMode);
        mode = mode? mode : defaultQnaMode;
        code = code.replace("$('#txtQnaEmbed').val()", embedUrl)
                    .replace("$('#txtDatasetId').val()", embedId)
                    .replace("$('#txtQuestion').val()", '"' + question + '"')
                    .replace('$("input[name=' + "'qnaMode'" + ']:checked").val()', '"' + mode + '"');
    }

    return code;
}

function hideFeaturesOnMobile(){
    if ($(".mobile-view").hasClass(active_class))
        $('.hideOnMobile').hide();
}

function onShowcaseTryMeClicked(showcase) {
    let showcaseUrl = location.href.substring(0, location.href.lastIndexOf("/")) + '?showcase=' + showcase;
    trackEvent(TelemetrySectionName.Showcase, { showcaseType: showcase, src: TelemetryEventSource.Interact });
    window.open(showcaseUrl, '_blank');
}
