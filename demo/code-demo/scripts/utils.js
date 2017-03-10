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
        if (guidParts && guidParts.length > 0)
        {
            id = guidParts[0];
        }
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
    
    for (var i = 0; i < lines.length; ++i)
    {
        // remove trailing spaces.
        lines[i] = lines[i].substring(4);
    }

    return lines.join('\n');
}

function LoadCodeArea(divSelector, initialFunctionCode) {
    $(divSelector).load("code_area.html", function() {
        SetCode(initialFunctionCode);
    });
}

function LoadLogWindow(divSelector) {
    $(divSelector).load("log_window.html");
}

function SetCode(func) {
	var codeHtml = '<pre id="txtCode" class="brush: js; gutter: false;">';
	codeHtml = codeHtml + BodyCodeOfFunction(func) + '</pre><script type="text/javascript" src="syntaxHighlighter/syntaxhighlighter.js"></script>';
	$("#highlighter").html(codeHtml);

    var runFunc = mapFunc(func);
    
    $('#btnRunCode').off('click');
    $('#btnRunCode').click(runFunc);
}

function CopyCode() {
    CopyTextArea("#txtCode", "#btnRunCopyCode");
}

function CopyResponseWindow() {
    CopyTextArea("#txtResponse", "#btnCopyResponse");
}

function CopyTextArea(textAreaSelector, buttonSelector) {
    $(textAreaSelector).select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    // Set focus on copy button - this will deselect text in copied area.
    $(buttonSelector).focus();
}

function ClearTextArea(textAreaSelector) {
    $(textAreaSelector).val("");
}
