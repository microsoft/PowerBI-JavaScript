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
	if (sessionAccessToken)
	{
		$("#txtAccessToken").val(sessionAccessToken);
	}
}

function SetEmbedUrlFromSession() {	
	var sessionEmbedUrl = GetSession("embedUrl");
	if (sessionEmbedUrl)
	{
		$("#txtReportEmbed").val(sessionEmbedUrl);
	}
	
	var sessionEmbedId = GetSession("embedId");
	if (sessionEmbedId)
	{
		$("#txtEmbedReportId").val(sessionEmbedId);
	}
}