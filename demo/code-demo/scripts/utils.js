function ValidateEmbedUrl(embedUrl) {
	var embedUrl = $('#txtReportEmbed').val();
	
	if (!embedUrl)
	{
		alert("You must specify an embed url.");
		return false;
	}
	var id = null;
	var parts = embedUrl.split("reportId=");
	if (parts && parts.length > 0)
	{
		var guidParts = parts[parts.length  -1].split("&");
		id = guidParts[0];
	}
	
	if (!id)
	{
		alert("Could not find report ID in url");
		return false;
	}
	
	return true;
}

function BodyCodeOfFunction(func) {
	var lines = func.toString().split('\n');
	lines = lines.slice(1, lines.length-1);
	return lines.join('\n');
}

function SetSampleCode(func) {
	$("#inputCode").text(BodyCodeOfFunction(func));
	
	$('#btnRunSampleCode').off('click');
	$('#btnRunSampleCode').click(func);
}

function SetEmbedCode(func) {
	$("#txtEmbedCode").text(BodyCodeOfFunction(func));
	
	$('#btnRunEmbedCode').off('click');
	$('#btnRunEmbedCode').click(func);
}
