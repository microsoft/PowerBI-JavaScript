var currentCode = "";
const interactIndicationTimeout = 5000;
const elementClickedTimeout = 250;
const textCodeTimeout = 100;

function BodyCodeOfFunction(func) {
    let lines = func.toString().split('\n');
    lines = lines.slice(1, lines.length-1);
    
    for (let i = 0; i < lines.length; ++i)
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
    currentCode = BodyCodeOfFunction(func);

    $("#highlighter").empty();

    var txtCodeElement = document.createElement("div");
    txtCodeElement.setAttribute("id", "txtCode");
    txtCodeElement.setAttribute("style", "display: none;");

    var preElement = document.createElement("pre");
    preElement.setAttribute("class", "brush: js; gutter: false;");

    var codeElement = document.createTextNode(currentCode);
    preElement.appendChild(codeElement);
    txtCodeElement.appendChild(preElement);
    $("#highlighter").append(txtCodeElement);

    var scriptElement = document.createElement("script");
    scriptElement.setAttribute("type", "text/javascript");
    scriptElement.setAttribute("src", "syntaxHighlighter/syntaxhighlighter.js");
    $("#highlighter").append(scriptElement);

    setTimeout(function() {
        $("#txtCode").show();
    }, textCodeTimeout);

    if (func != "") {
        let runFunc = mapFunc(func);

        if (getFuncName(runFunc).match(/Embed/)) {
            let oldFunc = runFunc;
            runFunc = function() {
                oldFunc();
                $('#interact-tab').addClass('enableTransition');
                setTimeout(function() {
                    $('#interact-tab').addClass('changeColor');
                }, interactIndicationTimeout);
            }
        }

        $('#btnRunCode').off('click');
        $('#btnRunCode').click(function() {
            elementClicked('#btnRunCode');
            runFunc();
        });
        // TODO: add indication to click Interact tab on first embedding
    }
}

function CopyCode() {
    const id = "clipboard-textarea";
    let textarea = document.getElementById(id);

    if (!textarea) {
        textarea = document.createElement("textarea");
        textarea.id = id;
        document.querySelector("body").appendChild(textarea);
    }

    textarea.value = currentCode;
    CopyTextArea('#' + id, "#btnRunCopyCode");
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

function getEmbedContainerID(entityType) {
    switch (entityType) {
        case EntityType.Visual:
            return "visualContainer";
        case EntityType.Dashboard:
            return "dashboardContainer";
        case EntityType.Tile:
            return "tileContainer";
        case EntityType.Qna:
            return "qnaContainer";
        default:
            return "embedContainer";
    }
}

function getEmbedContainerClassPrefix(entityType) {
    switch (entityType) {
        case EntityType.Visual:
            return ".visual";
        case EntityType.Dashboard:
            return ".dashboard";
        case EntityType.Tile:
            return ".tile";
        case EntityType.Qna:
            return ".qna";
        default:
            return ".report";
    }
}

function getEntityTypeFromParameter(urlParam) {
  switch (urlParam) {
      case "visual":
          return EntityType.Visual;
      case "dashboard":
          return EntityType.Dashboard;
      case "tile":
          return EntityType.Tile;
      case "qna":
          return EntityType.Qna;
      default:
          return EntityType.Report;
  }
}

function elementClicked(element) {
    $(element).addClass('elementClicked');
    setTimeout(function() {
        $(element).removeClass('elementClicked');
    }, elementClickedTimeout);
}
