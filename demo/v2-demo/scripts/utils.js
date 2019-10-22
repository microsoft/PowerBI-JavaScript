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
        let funcName = getFuncName(runFunc);
        if (funcName.match(/Embed/)) {
            let oldFunc = runFunc;
            runFunc = function() {
                oldFunc();

                SetSession(SessionKeys.EntityIsAlreadyEmbedded, true);

                $('#interact-tab').addClass('enableTransition');
                setTimeout(function() {
                    $('#interact-tab').addClass('changeColor');
                }, interactIndicationTimeout);
            }
        }

        $('#btnRunCode').off('click');
        $('#btnRunCode').click(function() {
            showEmbedContainer();
            removeIframeIfUrlIsChanged();
            elementClicked('#btnRunCode');
            trackEvent(TelemetryEventName.RunClick, { EmbedType: GetSession(SessionKeys.EntityType), TokenType: GetSession(SessionKeys.TokenType), ApiUsed: funcName });
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
    trackEvent(TelemetryEventName.CopyCode, {});
}

function CopyResponseWindow() {
    CopyTextArea("#txtResponse", "#btnCopyResponse");
    trackEvent(TelemetryEventName.CopyLog, {});
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
        case EntityType.Dashboard:
            return "dashboardContainer";
        case EntityType.Tile:
            return "tileContainer";
        case EntityType.Qna:
            return "qnaContainer";
        case EntityType.PaginatedReport:
            return "paginatedReportContainer";    
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
        case EntityType.PaginatedReport:
            return ".paginatedReport";
        default:
            return ".report";
    }
}

function getActiveEmbedContainer() {
    const entityType = GetSession(SessionKeys.EntityType);
    const classPrefix = getEmbedContainerClassPrefix(entityType);
    const activeContainer = classPrefix + ($(".desktop-view").hasClass(active_class) ? 'Container' : 'MobileContainer');
    return $(activeContainer)[0];
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
      case "rdl":
          return EntityType.PaginatedReport;    
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

function showEmbedContainer() {
    const activeContainer = getActiveEmbedContainer();
    $(activeContainer).css({"visibility":"visible"});
}

function removeIframeIfUrlIsChanged() {
    const activeContainer = getActiveEmbedContainer();
    if (!activeContainer || !activeContainer.powerBiEmbed || !activeContainer.powerBiEmbed.iframe) {
      return;
    }

    let existingIframeUrl = removeArgFromUrl(activeContainer.powerBiEmbed.iframe.src, "uid");
    existingIframeUrl = removeArgFromUrl(existingIframeUrl, "isMobile");

    let embedUrl = GetSession(SessionKeys.EmbedUrl);

    if (embedUrl !== existingIframeUrl) {
        // textbox has changed, delete the iframe and avoid the bootstrap.
        powerbi.reset(activeContainer);
    }
}

function SetAuthoringPageActive(report) {
    return new Promise(function(resolve, reject) {

        // Get all report pages
        report.getPages().then(function (pages) {

            // Find authoring page
            var authoringPage = pages.filter(function (page) {
                return page.name === "ReportSection6da8317ad6cbcae5b3bb";
            })[0];

            // If active page is not authoring page, navigate to authoring page
            if (authoringPage.isActive) {
                resolve(authoringPage);
            } else {
                authoringPage.setActive().then(function () {
                    Log.logText("Page was set to authoring page.");
                    resolve(authoringPage);
                }).catch(function (errors) {
                    reject(errors);
                });
            }
        }).catch(function (errors) {
            reject(errors);
        });
    });
}

function removeArgFromUrl(url, arg) {
    const argRegEx = new RegExp(arg + '="?([^&]+)"?')
    const argMatch = url.match(argRegEx);

    if (argMatch) {
        return url.replace("&" + argMatch[0], "");
    }

    return url;
}

function getRandomValue() {

  // window.msCrypto for IE
  var cryptoObj = window.crypto || window.msCrypto;
  var randomValueArray = new Uint32Array(1);
  cryptoObj.getRandomValues(randomValueArray);

  return randomValueArray[0];
}