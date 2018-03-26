var _session = {};

const SessionKeys = {
    AccessToken : "accessToken",
    EmbedUrl : "embedUrl",
    EmbedId : "embedId",
    DashboardId : "dashboardId",
    GroupId : "groupId",
    IsSampleReport: "isSampleReport",
    IsSampleDashboard: "IsSampleDashboard",
    IsSampleTile: "IsSampleTile",
    IsSampleQna: "IsSampleQna",
    EmbedMode: "embedMode",
    TokenType: "tokenType",
    EntityType: "entityType",
    SampleId: "SampleId",
    PageName: "PageName",
    VisualName: "VisualName",
    QnaQuestion: "QnaQuestion",
    QnaMode: "QnaMode"
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
    }
    $(textboxSelector).val(value);
}

function SetTextBoxesFromSessionOrUrlParam(accessTokenSelector, embedUrlSelector, embedIdSelector, dashboardIdSelector) {
    let accessToken = GetParameterByName(SessionKeys.AccessToken);
    if (!accessToken)
    {
        accessToken = GetSession(SessionKeys.AccessToken);
    }

    let embedUrl = GetParameterByName(SessionKeys.EmbedUrl);
    if (!embedUrl)
    {
        embedUrl = GetSession(SessionKeys.EmbedUrl);
    } else {
        let groupId = GetParameterByName(SessionKeys.GroupId);
        if(groupId)
        {
            if (embedUrl.indexOf("?") != -1)
            {
              embedUrl += "&groupId=" + groupId;
            } else {
              embedUrl += "?groupId=" + groupId;
            }
        }
    }

    let embedId = GetParameterByName(SessionKeys.EmbedId);
    if (!embedId)
    {
        embedId = GetSession(SessionKeys.EmbedId);
    }

    let tokenType = GetParameterByName(SessionKeys.TokenType);
    if (!tokenType)
    {
        tokenType = GetSession(SessionKeys.TokenType);
    }

    let dashboardId = GetParameterByName(SessionKeys.DashboardId);
    if (!dashboardId) {
        dashboardId = GetSession(SessionKeys.DashboardId);
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
