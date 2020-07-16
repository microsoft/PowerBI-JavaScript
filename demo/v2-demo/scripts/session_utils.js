const reportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/SampleReport';
const datasetUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/SampleCreate';
const dashboardUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Dashboards/SampleDashboard';
const tileUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Tiles/SampleTile';
const qnaUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Datasets/SampleQna';
const paginatedReportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/SampleRdlReport';
const layoutShowcaseReportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/LayoutDemoReport';
const insightToActionShowcaseReportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/InsightToActionReport';
const themesShowcaseReportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/ThemesReport';
const quickVisualCreatorShowcaseReportUrl = 'https://playgroundbe-bck-1.azurewebsites.net/Reports/EmptyReport';

var LastReportSampleUrl = null;
var ReportRefreshTokenTimer = 0;
var DashboardRefreshTokenTimer = 0;
var TileRefreshTokenTimer = 0;
var QnaRefreshTokenTimer = 0;

const EntityType = {
    Report : "Report",
    Visual : "Visual",
    Dashboard : "Dashboard",
    Tile : "Tile",
    Qna: "Qna",
    PaginatedReport: "PaginatedReport"
};

const SessionKeys = {
    AccessToken : "accessToken",
    DashboardId : "dashboardId",
    EmbedUrl : "embedUrl",
    EmbedId : "embedId",
    EmbedMode: "embedMode",
    EntityType: "entityType",
    GroupId : "groupId",
    IsSampleReport: "isSampleReport",
    IsSampleDashboard: "IsSampleDashboard",
    IsSampleTile: "IsSampleTile",
    IsSampleQna: "IsSampleQna",
    IsSamplePaginatedReport: "IsSamplePaginatedReport",
    IsTelemetryEnabled: "isTelemetryEnabled",
    PageName: "PageName",
    QnaQuestion: "QnaQuestion",
    QnaMode: "QnaMode",
    SampleId: "SampleId",
    SessionId: "SessionId",
    TokenType: "tokenType",
    VisualName: "VisualName"
};

var _session = {};

function initSession() {
    SetSession(SessionKeys.SessionId, generateNewGuid());
    if (GetParameterByName(SessionKeys.IsTelemetryEnabled) === "false") {
        SetSession(SessionKeys.IsTelemetryEnabled, false);
    } else {
        SetSession(SessionKeys.IsTelemetryEnabled, true);
    }
}

function GetParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }

    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function SetSession(key, value) {
    // This is a temporal solution for session (which is cleared on reload). Should be replaced with a real session.
    _session[key] = value;
}

function GetSession(key) {
    // This is a temporal solution for session (which is cleared on reload). Should be replaced with a real session.
    return _session[key];
}

function UpdateSession(button, sessionKey) {
    const value = $(button).val();
    if (value || value === "")
    {
        SetSession(sessionKey, value);
        SetIsSample(false);
    }
}

function SetIsSample(value) {
    const entityType = GetSession(SessionKeys.EntityType);

    if (entityType == EntityType.Report)
    {
        SetSession(SessionKeys.IsSampleReport, value);
    }
    else if (entityType == EntityType.Visual)
    {
        SetSession(SessionKeys.IsSampleReport, value);
    }
    else if (entityType == EntityType.Dashboard)
    {
        SetSession(SessionKeys.IsSampleDashboard, value);
    }
    else if (entityType == EntityType.Tile)
    {
        SetSession(SessionKeys.IsSampleTile, value);
    }
    else if (entityType == EntityType.Qna)
    {
        SetSession(SessionKeys.IsSampleQna, value);
    }
    else if (entityType == EntityType.PaginatedReport)
    {
        SetSession(SessionKeys.IsSamplePaginatedReport, value);
    }
}

function SetTextboxFromSessionOrUrlParam(sessionKey, textboxSelector) {
    let value = GetParameterByName(sessionKey);
    if (!value)
    {
        value = GetSession(sessionKey);
    } else {
        SetSession(sessionKey, value);
    }
    $(textboxSelector).val(value);
}

function SetTextBoxesFromSessionOrUrlParam(accessTokenSelector, embedUrlSelector, embedIdSelector, dashboardIdSelector) {
    let accessToken = GetParameterByName(SessionKeys.AccessToken);
    if (!accessToken)
    {
        accessToken = GetSession(SessionKeys.AccessToken);
    } else {
        SetSession(SessionKeys.AccessToken, accessToken);
    }

    let embedUrl = GetParameterByName(SessionKeys.EmbedUrl);
    if (!embedUrl)
    {
        embedUrl = GetSession(SessionKeys.EmbedUrl);
    } else {
        let groupId = GetParameterByName(SessionKeys.GroupId);
        if (groupId)
        {
            if (embedUrl.indexOf("?") != -1)
            {
              embedUrl += "&groupId=" + groupId;
            } else {
              embedUrl += "?groupId=" + groupId;
            }
        }
        SetSession(SessionKeys.EmbedUrl, embedUrl);
    }

    let embedId = GetParameterByName(SessionKeys.EmbedId);
    if (!embedId)
    {
        embedId = GetSession(SessionKeys.EmbedId);
    } else {
        SetSession(SessionKeys.EmbedId, embedId);
    }

    let tokenType = GetParameterByName(SessionKeys.TokenType);
    if (!tokenType)
    {
        tokenType = GetSession(SessionKeys.TokenType);
    } else {
        SetSession(SessionKeys.TokenType, tokenType);
    }

    let dashboardId = GetParameterByName(SessionKeys.DashboardId);
    if (!dashboardId) {
        dashboardId = GetSession(SessionKeys.DashboardId);
    } else {
        SetSession(SessionKeys.DashboardId, dashboardId);
    }

    $(accessTokenSelector).val(accessToken);
    $(embedUrlSelector).val(embedUrl);
    $(embedIdSelector).val(embedId);
    $(dashboardIdSelector).val(dashboardId);

    //
    // Set the embed type (Saas or Embed token)
    //
    let embedTypeRadios = $('input:radio[name=tokenType]');
    embedTypeRadios.filter('[value=' + tokenType + ']').prop('checked', true);
}

function FetchUrlIntoSession(url, updateCurrentToken) {
    return $.getJSON(url, function (embedConfig) {
        setSession(embedConfig.EmbedToken.Token, embedConfig.EmbedUrl, embedConfig.Id, embedConfig.DashboardId);
        SetSession(SessionKeys.SampleId, embedConfig.Id);

        if (updateCurrentToken)
        {
            let embedContainerId = getEmbedContainerID(capitalizeFirstLetter(embedConfig.Type));

            let embedContainer = powerbi.embeds.filter(function(embedElement) { return embedElement.element.id === embedContainerId; })[0];
            if (embedContainer)
            {
                embedContainer.setAccessToken(embedConfig.EmbedToken.Token);
            }
        }

        if (embedConfig.Type === "report" || embedConfig.Type === "visual")
        {
            // Set single visual embed sample details.
            SetSession(SessionKeys.PageName, "ReportSectioneb8c865100f8508cc533");
            SetSession(SessionKeys.VisualName, "47eb6c0240defd498d4b");

            LastReportSampleUrl = url;
        }

        TokenExpirationRefreshListener(embedConfig.MinutesToExpiration, capitalizeFirstLetter(embedConfig.Type));
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function TokenExpirationRefreshListener(minutesToExpiration, entityType) {
    const updateAfterMilliSeconds = (minutesToExpiration - 2) * 60 * 1000;

    if (entityType == EntityType.Report || entityType == EntityType.Visual) {
        setTokenRefreshListener(updateAfterMilliSeconds, ReportRefreshTokenTimer, LastReportSampleUrl, entityType);
    } else if (entityType == EntityType.Dashboard) {
        setTokenRefreshListener(updateAfterMilliSeconds, DashboardRefreshTokenTimer, dashboardUrl, entityType);
    } else if (entityType == EntityType.Qna) {
        setTokenRefreshListener(updateAfterMilliSeconds, QnaRefreshTokenTimer, qnaUrl, entityType);
    } else {
        setTokenRefreshListener(updateAfterMilliSeconds, TileRefreshTokenTimer, tileUrl, entityType);
    }
}

function setTokenRefreshListener(updateAfterMilliSeconds, RefreshTokenTimer, url, entityType) {
    if (RefreshTokenTimer)
    {
        console.log("step current " + entityType + " Embed Token update threads.");
        clearTimeout(RefreshTokenTimer);
    }

    console.log(entityType + " Embed Token will be updated in " + updateAfterMilliSeconds + " milliseconds.");
    RefreshTokenTimer = setTimeout(function() {
        if (url)
        {
            FetchUrlIntoSession(url, true /* updateCurrentToken */);
        }
    }, updateAfterMilliSeconds);
}

function LoadSampleReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(reportUrl, false /* updateCurrentToken */);
}

function LoadSampleVisualIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Visual);
    return FetchUrlIntoSession(reportUrl, false /* updateCurrentToken */);
}

function LoadSampleDatasetIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(datasetUrl, false /* updateCurrentToken */);
}

function LoadSampleDashboardIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Dashboard);
    return FetchUrlIntoSession(dashboardUrl, false /* updateCurrentToken */);
}

function LoadSampleTileIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Tile);
    return FetchUrlIntoSession(tileUrl, false /* updateCurrentToken */);
}

function LoadSampleQnaIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Qna);
    return FetchUrlIntoSession(qnaUrl, false /* updateCurrentToken */);
}

function LoadSamplePaginatedReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.PaginatedReport);
    return FetchUrlIntoSession(paginatedReportUrl, false /* updateCurrentToken */);
}

function LoadLayoutShowcaseReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(layoutShowcaseReportUrl, false /* updateCurrentToken */);
}

function LoadInsightToActionShowcaseReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(insightToActionShowcaseReportUrl, false /* updateCurrentToken */);
}

function LoadThemesShowcaseReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(themesShowcaseReportUrl, false /* updateCurrentToken */);
}

function LoadQuickVisualCreatorShowcaseReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(quickVisualCreatorShowcaseReportUrl, false /* updateCurrentToken */);
}

function WarmStartSampleReportEmbed() {
    let embedUrl = GetParameterByName(SessionKeys.EmbedUrl);
    if (embedUrl) {
        preload(embedUrl);
        return;
    }

    FetchUrlIntoSession(reportUrl, false /* updateCurrentToken */).then(function (response) {
        embedUrl = GetSession(SessionKeys.EmbedUrl);
        preload(embedUrl);
    });
}

function preload(embedUrl) {
    const config = {
        type: 'report',
        embedUrl: embedUrl
    };

    // Preload sample report
    powerbi.preload(config);
}

function setSession(accessToken, embedUrl, embedId, dashboardId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, embedId);
    SetSession(SessionKeys.DashboardId, dashboardId);
}

initSession();