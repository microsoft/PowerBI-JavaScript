const reportUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Reports/SampleReport';
const datasetUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Reports/SampleCreate';
const dashboardUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Dashboards/SampleDashboard';
const tileUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Tiles/SampleTile';
const qnaUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Datasets/SampleQna';
const layoutShowcaseReportUrl = 'https://powerbiplaygroundbe.azurewebsites.net/api/Reports/LayoutDemoReport';

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
    Qna: "Qna"
};

var _session = {};

const SessionKeys = {
    AccessToken : "accessToken",
    EmbedUrl : "embedUrl",
    EmbedId : "embedId",
    DashboardId : "dashboardId",
    EmbedMode: "embedMode",
    EntityType: "entityType",
    GroupId : "groupId",
    IsSampleReport: "isSampleReport",
    IsSampleDashboard: "IsSampleDashboard",
    IsSampleTile: "IsSampleTile",
    IsSampleQna: "IsSampleQna",
    PageName: "PageName",
    QnaQuestion: "QnaQuestion",
    QnaMode: "QnaMode",
    SampleId: "SampleId",
    TokenType: "tokenType",
    VisualName: "VisualName"
};

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
        setSession(embedConfig.embedToken.token, embedConfig.embedUrl, embedConfig.id, embedConfig.dashboardId);
        SetSession(SessionKeys.SampleId, embedConfig.id);

        if (updateCurrentToken)
        {
            let embedContainerId = getEmbedContainerID(capitalizeFirstLetter(embedConfig.type));

            let embedContainer = powerbi.embeds.find(function(embedElement) {return (embedElement.element.id == embedContainerId)});
            if (embedContainer)
            {
                embedContainer.setAccessToken(embedConfig.embedToken.token);
            }
        }

        if (embedConfig.type === "report" || embedConfig.type === "visual")
        {
            // Set single visual embed sample details.
            SetSession(SessionKeys.PageName, "ReportSectioneb8c865100f8508cc533");
            SetSession(SessionKeys.VisualName, "47eb6c0240defd498d4b");

            LastReportSampleUrl = url;
        }

        TokenExpirationRefreshListener(embedConfig.minutesToExpiration, capitalizeFirstLetter(embedConfig.type));
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

function LoadLayoutShowcaseReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(layoutShowcaseReportUrl, false /* updateCurrentToken */);
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
