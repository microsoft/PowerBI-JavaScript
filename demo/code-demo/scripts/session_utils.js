var _session = {};

function SetSession(key, value) {
    // This is a temporal solution for session (which is cleared on reload). Should be replaced with a real session.
    _session[key] = value;
}

function GetSession(key) {
    // This is a temporal solution for session (which is cleared on reload). Should be replaced with a real session.
    return _session[key];
}

function SetSessions(accessToken, embedReportUrl, embedReprotId) {
    SetSession("accessToken", accessToken);
    SetSession("embedUrl", embedReportUrl);
    SetSession("embedId", embedReprotId);
}

function UpdateSessions() {
    var txtAccessToken = $('#txtAccessToken').val();
    if (txtAccessToken)
    {
        SetSession("accessToken", txtAccessToken);
    }

    var txtEmbedUrl = $('#txtReportEmbed').val();
    if (txtEmbedUrl)
    {
        SetSession("embedUrl", txtEmbedUrl);
    }

    var txtEmbedReportId = $('#txtEmbedReportId').val();
    if (txtEmbedReportId)
    {
        SetSession("embedId", txtEmbedReportId);
    }
}

function SetAccessTokenFromSession() {
    var sessionAccessToken = GetSession("accessToken");
    $("#txtAccessToken").val(sessionAccessToken);
}

function SetAccessTokenFromSessionOrUrlParam() {
	var accessToken = GetParameterByName("accessToken");
	if (!accessToken)
	{
		accessToken = GetSession("accessToken");
	}
	
    $("#txtAccessToken").val(accessToken);
}

function GetParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function SetEmbedUrlFromSessionOrUrlParam() {
	var embedUrl = GetParameterByName("embedUrl");
	if (!embedUrl)
	{
		embedUrl = GetSession("embedUrl");
	}
    $("#txtReportEmbed").val(embedUrl);
    
	var embedId = GetParameterByName("embedId");
	if (!embedId)
	{
		embedId = GetSession("embedId");
	}
    $("#txtEmbedReportId").val(embedId);
}

function SetEmbedUrlFromSession() {    
    var sessionEmbedUrl = GetSession("embedUrl");
    $("#txtReportEmbed").val(sessionEmbedUrl);
    
    var sessionEmbedId = GetSession("embedId");
    $("#txtEmbedReportId").val(sessionEmbedId);
}


