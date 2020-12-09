/*
    This file contains the code samples which will appear live in the web-page.
    Each sample method name starts with _Report_ or _Page or _Embed depends on which section it appears.
    Please keep this.
*/

// ---- Embed Code ----------------------------------------------------

function _Embed_BasicEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read report Id from textbox
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // We give All permissions to demonstrate switching between View and Edit mode and saving report.
    var permissions = models.Permissions.All;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        settings: {
            panes: {
                filters: {
                    visible: true
                },
                pageNavigation: {
                    visible: true
                }
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.on("error", function (event) {
        Log.log(event.detail);

        report.off("error");
    });

    report.off("saved");
    report.on("saved", function (event) {
        Log.log(event.detail);
        if (event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
        }
    });
}

function _Embed_BasicEmbed_Mobile() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read report Id from textbox
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // We give All permissions to demonstrate switching between View and Edit mode and saving report.
    var permissions = models.Permissions.All;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        pageName: "ReportSectioneb8c865100f8508cc533",
        settings: {
            panes: {
                filters: {
                    visible: false
                }
            },
            layoutType: models.LayoutType.MobilePortrait
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.on("error", function (event) {
        Log.log(event.detail);

        report.off("error");
    });

    report.off("saved");
    report.on("saved", function (event) {
        Log.log(event.detail);
        if (event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
        }
    });
}

// ---- Paginated Embed Code ----------------------------------------------------
function _Embed_PaginatedReportBasicEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read paginated report Id from textbox
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Se view permissions.
    var permissions = models.Permissions.View;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
    };

    // Get a reference to the paginated embedded report HTML element
    var paginatedReportContainer = $('#paginatedReportContainer')[0];

    // Embed the paginated report and display it within the div container.
    var report = powerbi.embed(paginatedReportContainer, config);

    Log.logText("Loading Paginated Report.");
}

function _Embed_VisualEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read report Id from textbox
    var txtReportId = $('#txtEmbedReportId').val();

    // Read page name from textbox
    var txtPageName = $('#txtPageName').val();

    // Read visual name from textbox
    var txtVisualName = $('#txtVisualName').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'visual',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtReportId,
        pageName: txtPageName,
        visualName: txtVisualName
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.on("error", function (event) {
        Log.log(event.detail);

        report.off("error");
    });
}

function _Embed_DashboardEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtDashboardEmbed').val();

    // Read dashboard Id from textbox
    var txtEmbedDashboardId = $('#txtEmbedDashboardId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'dashboard',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedDashboardId,
        pageView: 'fitToWidth'
    };

    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Embed the dashboard and display it within the div container.
    var dashboard = powerbi.embed(dashboardContainer, config);

    // Dashboard.off removes a given event handler if it exists.
    dashboard.off("loaded");

    // Dashboard.on will add an event handler which prints to Log window.
    dashboard.on("loaded", function () {
        Log.logText("Loaded");
    });

    dashboard.on("error", function (event) {
        Log.log(event.detail);

        dashboard.off("error");
    });

    dashboard.off("tileClicked");
    dashboard.on("tileClicked", function (event) {
        Log.log(event.detail);
    });
}

function _Embed_DashboardEmbed_Mobile() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtDashboardEmbed').val();

    // Read dashboard Id from textbox
    var txtEmbedDashboardId = $('#txtEmbedDashboardId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'dashboard',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedDashboardId,
        pageView: 'oneColumn'
    };

    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Embed the dashboard and display it within the div container.
    var dashboard = powerbi.embed(dashboardContainer, config);

    // Dashboard.off removes a given event handler if it exists.
    dashboard.off("loaded");

    // Dashboard.on will add an event handler which prints to Log window.
    dashboard.on("loaded", function () {
        Log.logText("Loaded");
    });

    dashboard.on("error", function (event) {
        Log.log(event.detail);

        dashboard.off("error");
    });

    dashboard.off("tileClicked");
    dashboard.on("tileClicked", function (event) {
        Log.log(event.detail);
    });
}

function _Mock_Embed_BasicEmbed(isEdit) {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read report Id from textbox
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;
    var permissions = models.Permissions.All;
    var viewMode = isEdit ? models.ViewMode.Edit : models.ViewMode.View;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        viewMode: viewMode,
        settings: {
            panes: {
                filters: {
                    visible: true
                },
                pageNavigation: {
                    visible: true
                }
            },
            useCustomSaveAsDialog: true
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.off("saveAsTriggered");
    report.on("saveAsTriggered", function () {
        Log.logText("Cannot save sample report");
    });

    report.off("error");
    report.on("error", function (event) {
        Log.log(event.detail);
    });

    report.off("saved");
    report.on("saved", function (event) {
        Log.log(event.detail);
        if (event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
        }
    });
}

function _Mock_Embed_BasicEmbed_EditMode() {
    _Mock_Embed_BasicEmbed(true);
}

function _Mock_Embed_BasicEmbed_ViewMode() {
    _Mock_Embed_BasicEmbed(false);
}

function _Embed_BasicEmbed_EditMode() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read report Id from textbox
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: models.Permissions.All /*gives maximum permissions*/,
        viewMode: models.ViewMode.Edit,
        settings: {
            panes: {
                filters: {
                    visible: true
                },
                pageNavigation: {
                    visible: true
                }
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.off("error");
    report.on("error", function (event) {
        Log.log(event.detail);
    });

    report.off("saved");
    report.on("saved", function (event) {
        Log.log(event.detail);
        if (event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
        }
    });
}

function _Embed_MobileEditNotSupported() {
    // Edit mode is not supported on mobile.
}

function _Embed_MobileCreateNotSupported() {
    // Create mode is not supported on mobile.
}

function _Embed_EmbedWithDefaultFilter() {
    var txtAccessToken = $('#txtAccessToken').val();
    var txtEmbedUrl = $('#txtReportEmbed').val();
    var txtEmbedReportId = $('#txtEmbedReportId').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Geo",
            column: "Region"
        },
        operator: "In",
        values: ["West"]
    };

    var embedConfiguration = {
        type: 'report',
        tokenType: models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        settings: {
            panes: {
                filters: {
                    visible: false
                },
                pageNavigation: {
                    visible: false
                }
            }
        },
        filters: [filter]
    };

    var embedContainer = document.getElementById('embedContainer');
    powerbi.embed(embedContainer, embedConfiguration);
}

function _Embed_TileEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtTileEmbed').val();

    // Read dashboard Id from textbox
    var txtEmbedDashboardId = $('#txtEmbedDashboardId').val();

    // Read tile Id from textbox
    var txtEmbedTileId = $('#txtEmbedTileId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'tile',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedTileId,
        dashboardId: txtEmbedDashboardId
    };

    // Get a reference to the embedded tile HTML element
    var tileContainer = $('#tileContainer')[0];

    // Embed the tile and display it within the div container.
    var tile = powerbi.embed(tileContainer, config);

    // Tile.off removes a given event handler if it exists.
    tile.off("tileLoaded");

    // Tile.on will add an event handler which prints to Log window.
    tile.on("tileLoaded", function (event) {
        Log.logText("Tile loaded event");
    });

    // Tile.off removes a given event handler if it exists.
    tile.off("tileClicked");

    // Tile.on will add an event handler which prints to Log window.
    tile.on("tileClicked", function (event) {
        Log.logText("Tile clicked event");
        Log.log(event.detail);
    });
}

function _Embed_Create() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtCreateAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtCreateReportEmbed').val();

    // Read dataset Id from textbox
    var txtEmbedDatasetId = $('#txtEmbedDatasetId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed create configuration used to describe the what and how to create report.
    // This object is used when calling powerbi.createReport.
    var embedCreateConfiguration = {
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetId: txtEmbedDatasetId,
    };

    // Grab the reference to the div HTML element that will host the report
    var embedContainer = $('#embedContainer')[0];

    // Create report
    var report = powerbi.createReport(embedContainer, embedCreateConfiguration);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.off("error");
    report.on("error", function (event) {
        Log.log(event.detail);
    });

    // report.off removes a given event handler if it exists.
    report.off("saved");
    report.on("saved", function (event) {
        Log.log(event.detail);
        Log.logText('In order to interact with the new report, create a new token and load the new report');
    });
}

function _Mock_Embed_Create() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtCreateAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtCreateReportEmbed').val();

    // Read dataset Id from textbox
    var txtEmbedDatasetId = $('#txtEmbedDatasetId').val();

    // Read embed type from radio
    var tokenType = $('input:radio[name=tokenType]:checked').val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed create configuration used to describe the what and how to create report.
    // This object is used when calling powerbi.createReport.
    var embedCreateConfiguration = {
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetId: txtEmbedDatasetId,
        settings: {
            useCustomSaveAsDialog: true
        }
    };

    // Grab the reference to the div HTML element that will host the report
    var embedContainer = $('#embedContainer')[0];

    // Create report
    var report = powerbi.createReport(embedContainer, embedCreateConfiguration);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    report.off("saveAsTriggered");
    report.on("saveAsTriggered", function () {
        Log.logText("Cannot save sample report");
    });

    report.off("error");
    report.on("error", function (event) {
        Log.log(event.detail);
    });
}

function _Embed_QnaEmbed() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtQnaEmbed').val();

    // Read dataset Id from textbox
    var txtDatasetId = $('#txtDatasetId').val();

    // Read question from textbox
    var txtQuestion = $('#txtQuestion').val();

    // Read Q&A mode
    var qnaMode = $("input[name='qnaMode']:checked").val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'qna',
        tokenType: models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetIds: [txtDatasetId],
        viewMode: models.QnaMode[qnaMode],
        question: txtQuestion
    };

    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Embed the Q&A and display it within the div container.
    powerbi.embed(qnaContainer, config);
}

function _Embed_QnaEmbed_Aad() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtQnaEmbed').val();

    // Read dataset Id from textbox
    var txtDatasetId = $('#txtDatasetId').val();

    // Read question from textbox
    var txtQuestion = $('#txtQuestion').val();

    // Read Q&A mode
    var qnaMode = $("input[name='qnaMode']:checked").val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config = {
        type: 'qna',
        tokenType: models.TokenType.Aad,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetIds: [txtDatasetId],
        viewMode: models.QnaMode[qnaMode],
        question: txtQuestion
    };

    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Embed the Q&A and display it within the div container.
    powerbi.embed(qnaContainer, config);
}

// ---- Report Operations ----------------------------------------------------

function _Report_GetId() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the report id.
    var reportId = report.getId();

    Log.logText("Report id: \"" + reportId + "\"");
}

async function _Report_UpdateSettings() {
    // The new settings that you want to apply to the report.
    const newSettings = {
        panes: {
            filters: {
                visible: false
            },
            pageNavigation: {
                visible: true
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
        Log.logText("Filter pane was removed.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_GetPages() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and loop through to collect the
    // page name and display name of each page and display the value.
    try {
        const pages = await report.getPages();
        var log = "Report pages:";
        pages.forEach(function (page) {
            log += "\n" + page.name + " - " + page.displayName;
        });
        Log.logText(log);
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_SetPage() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // setPage will change the selected view to the page you indicate.
    // This is the actual page name not the display name.
    try {
        await report.setPage("ReportSectiona271643cba2213c935be");
        Log.logText("Page was set to: ReportSectiona271643cba2213c935be");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Get the filters applied to the report.
    try {
        const filters = await report.getFilters();
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_SetFilters() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Geo",
            column: "Region"
        },
        operator: "In",
        values: ["West"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    try {
        await report.setFilters([filter]);
        Log.logText("Report filter was set.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Remove the filters currently applied to the report.
    try {
        await report.removeFilters();
        Log.logText("Report filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Report_SetFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Date",
            column: "Months"
        },
        operator: "In",
        values: ["Oct", "Nov", "Dec"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    try {
        await visual.setFilters([filter], models.FiltersLevel.Report);
        Log.logText("Report filter was set.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Report_GetFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Get the filters applied to the report.
    try {
        const filters = await visual.getFilters(models.FiltersLevel.Report);
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Report_RemoveFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Remove the filters currently applied to the report.
    try {
        await report.removeFilters(models.FiltersLevel.Report);
        Log.logText("Report filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Page_SetFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Date",
            column: "Months"
        },
        operator: "In",
        values: ["Oct", "Nov", "Dec"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    try {
        await visual.setFilters([filter], models.FiltersLevel.Page);
        Log.logText("Page filter was set.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Page_GetFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Get the filters applied to the report.
    try {
        const filters = await visual.getFilters(models.FiltersLevel.Page);
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Page_RemoveFilters() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Remove the filters currently applied to the report.
    try {
        await report.removeFilters(models.FiltersLevel.Page);
        Log.logText("Page filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Visual_SetFilters() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Date",
            column: "Months"
        },
        operator: "In",
        values: ["Oct", "Nov", "Dec"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    try {
        await visual.setFilters([filter]);
        Log.logText("Report filter was set.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Visual_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Get the filters applied to the report.
    try {
        const filters = await visual.getFilters();
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_Visual_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Remove the filters currently applied to the report.
    try {
        await report.removeFilters();
        Log.logText("Report filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_PrintCurrentReport() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Trigger the print dialog for your browser.
    try {
        await report.print();
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Reload() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Reload the displayed report
    try {
        await report.reload();
        Log.logText("Reloaded");
    }
    catch (errors) {
        Log.log(errors);
    }
}

function _PaginatedReport_Reload() {
    // Get a reference to the paginated report HTML element
    var paginatedReportContainer = $('#paginatedReportContainer')[0];

    // Get a reference to the embedded paginated report.
    paginatedReport = powerbi.get(paginatedReportContainer);

    // Reload the displayed paginated report
    paginatedReport.reload();

    Log.logText("Reload Paginated Report");
}

async function _Report_Refresh() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Refresh the displayed report
    try {
        await report.refresh();
        Log.logText("Refreshed");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_ApplyCustomLayout() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Define default visual layout: visible in 400x300.
    let defaultLayout = {
        width: 400,
        height: 250,
        displayState: {
            mode: models.VisualContainerDisplayMode.Hidden
        }
    };

    // Define page size as custom size: 1000x580.
    let pageSize = {
        type: models.PageSizeType.Custom,
        width: 1000,
        height: 580
    };

    // Page layout: two visible visuals in fixed position.
    let pageLayout = {
        defaultLayout: defaultLayout,
        visualsLayout: {
            "VisualContainer1": {
                x: 70,
                y: 100,
                displayState: {
                    mode: models.VisualContainerDisplayMode.Visible
                }
            },
            "VisualContainer3": {
                x: 540,
                y: 100,
                displayState: {
                    mode: models.VisualContainerDisplayMode.Visible
                }
            }
        }
    };

    let settings = {
        layoutType: models.LayoutType.Custom,
        customLayout: {
            pageSize: pageSize,
            displayOption: models.DisplayOption.FitToPage,
            pagesLayout: {
                "ReportSection600dd9293d71ade01765": pageLayout
            }
        },
        panes: {
            filters: {
                visible: false
            },
            pageNavigation: {
                visible: false
            }
        }
    }

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(settings);
        Log.logText("Custom layout applied, to remove custom layout, reload the report using 'Reload' API.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_HideAllVisualHeaders() {

    // New settings to hide all the visual headers in the report
    const newSettings = {
        visualSettings: {
            visualHeaders: [
                {
                    settings: {
                        visible: false
                    }
                    // No selector - Hide visual header for all the visuals in the report
                }
            ]
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
        Log.logText("Visual header was successfully hidden for all the visuals in the report.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_ShowAllVisualHeaders() {
    // New settings to show all the visual headers in the report
    const newSettings = {
        visualSettings: {
            visualHeaders: [
                {
                    settings: {
                        visible: true
                    }
                    // No selector - Show visual header for all the visuals in the report
                }
            ]
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
        Log.logText("Visual header was successfully shown for all the visuals in the report.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_HideSingleVisualHeader() {

    // Define settings to hide the header of a single visual
    var newSettings = {
        visualSettings: {
            visualHeaders: [
                {
                    settings: {
                        visible: true
                    }
                    // No selector - Show visual header for all the visuals in the report
                },
                {
                    settings: {
                        visible: false
                    },
                    selector: {
                        $schema: "http://powerbi.com/product/schema#visualSelector",
                        visualName: "VisualContainer4"
                        // The visual name can be retrieved using getVisuals()
                        // Hide visual header for a single visual only
                    }
                }
            ]
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
        Log.logText("Visual header was successfully hidden for 'Category Breakdown' visual.");
    }
    catch (error) {
        Log.log(error);
    }
}

function _Report_FullScreen() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Displays the report in full screen mode.
    report.fullscreen();
}

function _Report_ExitFullScreen() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Exits full screen mode.
    report.exitFullscreen();
}

// ---- PaginatedReport Operations ----------------------------------------------------

function _PaginatedReport_GetId() {
    // Get a reference to the embedded report HTML element
    var paginatedReportContainer = $('#paginatedReportContainer')[0];

    // Get a reference to the embedded report.
    paginatedReport = powerbi.get(paginatedReportContainer);

    // Retrieve the report id.
    var reportId = paginatedReport.getId();

    Log.logText(reportId);
}

function _PaginatedReport_FullScreen() {
    // Get a reference to the paginated embedded report HTML element
    var paginatedReportContainer = $('#paginatedReportContainer')[0];

    // Get a reference to the paginated embedded report.
    paginatedReport = powerbi.get(paginatedReportContainer);

    // Displays the paginated report in full screen mode.
    paginatedReport.fullscreen();
}

function _PaginatedReport_ExitFullScreen() {
    // Get a reference to the paginated embedded report HTML element
    var paginatedReportContainer = $('#paginatedReportContainer')[0];

    // Get a reference to the paginated embedded report.
    paginatedReport = powerbi.get(paginatedReportContainer);

    // Exits full screen mode.
    paginatedReport.exitFullscreen();
}

function _Report_switchModeEdit() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Switch to edit mode.
    report.switchMode("edit");
}

function _Report_switchModeView() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Switch to view mode.
    report.switchMode("view");
}

function _Report_save() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Save report
    report.save();
}

function _Mock_Report_save() {
    Log.logText('Cannot save sample report');
}

function _Report_saveAs() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    var saveAsParameters = {
        name: "newReport"
    };

    // SaveAs report
    report.saveAs(saveAsParameters);
}

async function _Report_Extensions_OptionsMenu() {
    const base64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAu9JREFUeJzt3U9OE2Ech/FnSiKsXbh340pg5Qk8gofAY3gGtBqWXsKNIR5BF0ZkQ9h6A2pC62LAEP5ITdv3R+f7fJJ3QUh4ZzpPmaaZmReGZxf4ABwDE2C24Jhc/K33wE7D/dB/2gIOgCmLH/S7xhQYA5uN9klz2gK+sLoDf30cXsypB+KAdgf/coyb7Jnutctq/+3/63Sw3WD/VmpUvQFL8BroCubtgL2CeXXNMe3f/ZfjqMH+rVTFO2fZJsCjwrnX+sPgEAKYFc+/1q/hED4DaAEGEM4AwhlAOAMIZwDhDCCcAYQzgHAGEM4AwhlAOAMIZwDhDCCcAYQzgHAGEM4AwhlAOAMIZwDhDCCcAYQzgHAGEM4AwhlAOAMIZwDhDCCcAYQzgHAGEM4AwhlAOAMIZwDhDCDcbQEs+3n7qx7Vqvf/vjH3egctnrfvqB13rnfQ+nn7jtrxd72DDXpj4BVK8RR4DHzq6M/5X1nzZ97qv82A3Q3gDfCidltUoAOmHf0nxGfFG6MaPztqn7evWpOO/lygUH4TGM4AwhlAOAMIZwDhDCCcAYQzgHAGEM4AwhlAOAMIZwDhDCCcAYQbAb+rN0JlJiPgtHorVOZkRH+NuDIddvS3C33Dy8LTTLm4LPwX8AQvDU/zDvh4+cMm/amg+pYlR5vxmVuuBN+iv0XMm0OHO86Bfa4c/NvO+9vAHvCS/h6yG3eSaq1MgBP6//AHwPervxzCB79Z8fxr/Rr6TWA4AwhnAOEMIJwBhDOAcAYQzgDCGUA4AwhnAOEMIJwBhDOAcAYQzgDCGUA4AwhnAOEMIJwBhDOAcAYQzgDCGUA4AwhnAOEMIJwBhDOAcAYQzgDCGUA4AwhnAOEMIJwBhDOAcAYQbggBVK53MCmceymGEMBp4dwnhXMvxRACqFzvwLUWHoAdah5wfQ48b7B/msOY9gHsN9kzzaX1ege3Pm9ftVqsd3Djeft6eLbpl0M5As5Y/KCfAT+AtwzwnP8HNwiKJyPkCoYAAAAASUVORK5CYII=";

    // The new settings that you want to apply to the report.
    const newSettings = {
        extensions: [
            {
                command: {
                    name: "extension command",
                    title: "Extend commands",
                    icon: base64Icon,
                    extend: {
                        // Define visualOptionsMenu to extend options menu
                        visualOptionsMenu: {
                            // Define title to override default title.
                            // You can override default icon as well.
                            title: "Extend options menu",
                        }
                    }
                }
            }
        ]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
    }
    catch (error) {
        Log.log(error);
    }

    // Report.on will add an event handler to commandTriggered event which prints to console window.
    report.on("commandTriggered", function (event) {
        Log.logText("Event - commandTriggered:");
        var commandDetails = event.detail;
        Log.log(commandDetails);
    });

    // Select Run and open options menu to see new added items.
    // Click on menu items added and you should see an entry in the Log window.

    Log.logText("Open visual options menu by clicking the three dots icon and click on added items to see events in Log window.");
}

async function _Report_Extensions_ContextMenu() {
    // The new settings that you want to apply to the report.
    const newSettings = {
        extensions: [
            {
                command: {
                    name: "extension command",
                    title: "Extend command",
                    extend: {
                        // Define visualContextMenu to extend context menu.
                        visualContextMenu: {
                            // Define title to override default title.
                            //You can override default icon as well.
                            title: "Extend context menu",
                        }
                    }
                }
            }
        ]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
    }
    catch (error) {
        Log.log(error);
    }

    // Report.on will add an event handler to commandTriggered event which prints to console window.
    report.on("commandTriggered", function (event) {
        Log.logText("Event - commandTriggered:");
        var commandDetails = event.detail;
        Log.log(commandDetails);
    });

    // Select Run and context menu (i.e. by right click on data points) to see new added items.
    // Click on menu items added and you should see an entry in the Log window.

    Log.logText("Open visual context menu by right click on data points and click on added items to see events in Log window.");
}

async function _Visual_Operations_SortVisualBy() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Build the sort request.
    // For more information, See https://github.com/Microsoft/PowerBI-JavaScript/wiki/Sort-Visual-By
    const sortByRequest = {
        orderBy: {
            table: "SalesFact",
            measure: "Total Category Volume"
        },
        direction: models.SortDirection.Descending
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name === "VisualContainer6";
        })[0];

        // Sort the visual's data by direction and data field.
        await visual.sortBy(sortByRequest);
        Log.logText("\"Total Category Volume Over Time by Region\" visual was sorted according to the request.")
    }
    catch (errors) {
        Log.log(errors);
    }
}

// ---- Page Operations ----------------------------------------------------

async function _Page_SetActive() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve active page.
    try {
        const pages = await report.getPages();
        await pages[3].setActive();
        Log.logText("Active page was set to: \"" + pages[3].displayName + "\"");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Page_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the filters for the first page.
    try {
        const pages = await report.getPages();
        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const filters = await activePage.getFilters();
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Page_GetVisuals() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();
        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();
        Log.log(
            visuals.map(function (visual) {
                return {
                    name: visual.name,
                    type: visual.type,
                    title: visual.title,
                    layout: visual.layout
                };
            }));
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Page_SetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Build the filter you want to use. For more information, see Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Geo",
            column: "Region"
        },
        operator: "In",
        values: ["West"]
    };

    // Retrieve the page collection and then set the filters for the first page.
    // Pay attention that setFilters receives an array.
    try {
        const pages = await report.getPages();
        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        await activePage.setFilters([filter]);
        Log.logText("Page filter was set.");

    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Page_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and remove the filters for the first page.
    try {
        const pages = await report.getPages();
        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        await activePage.removeFilters();
        Log.logText("Page filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Page_HasLayout() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and check if the first page has a MobilePortrait layout.
    try {
        const pages = await report.getPages();
        const hasLayout = await pages[0].hasLayout(models.LayoutType.MobilePortrait);

        var hasLayoutText = hasLayout ? "has" : "doesn't have";
        Log.logText("Page \"" + pages[0].name + "\" " + hasLayoutText + " mobile portrait layout.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

// ---- Event Listener ----------------------------------------------------

function _Events_PageChanged() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event listener if it exists.
    report.off("pageChanged");

    // Report.on will add an event listener.
    report.on("pageChanged", function (event) {
        Log.logText("Event - pageChanged:");
        var page = event.detail.newPage;
        Log.logText("Page changed to \"" + page.name + "\" - \"" + page.displayName + "\"");
    });

    // Select Run and change to a different page.
    // You should see an entry in the Log window.

    Log.logText("Select different page to see events in Log window.");
}

function _Events_DataSelected() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event listener if it exists.
    report.off("dataSelected");

    // Report.on will add an event listener.
    report.on("dataSelected", function (event) {
        Log.logText("Event - dataSelected:");
        var data = event.detail;
        Log.log(data);
    });

    // Select Run and select an element of a visualization.
    // For example, a bar in a bar chart. You should see an entry in the Log window.

    Log.logText("Select data to see events in Log window.");
}

function _Events_SaveAsTriggered() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event listener if it exists.
    report.off("saveAsTriggered");

    // Report.on will add an event listener.
    report.on("saveAsTriggered", function (event) {
        Log.log(event);
    });

    // Select Run and then select SaveAs.
    // You should see an entry in the Log window.

    Log.logText("Select SaveAs to see events in Log window.");
}

function _Events_BookmarkApplied() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event listener if it exists.
    report.off("bookmarkApplied");

    // Report.on will add an event listener.
    report.on("bookmarkApplied", function (event) {
        Log.logText("Event - bookmarkApplied:");
        Log.log(event.detail);
    });

    // Select Run and then go to bookmarks
    // and select 'Apply Bookmark by name'.
    // You should see an entry in the Log window.
    Log.logText("Apply a bookmark to see events in Log window.");
}

function _Events_ReportLoaded() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function () {
        Log.logText("Loaded");
    });

    Log.logText("Reload the report to see the loaded event.");
}

function _Events_ReportRendered() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("rendered");

    // Report.on will add an event handler which prints to Log window.
    report.on("rendered", function () {
        Log.logText("Rendered");
    });

    Log.logText("Reload the report to see the rendered event.");
}

function _Events_ReportSaved() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("saved");

    // Report.on will add an event handler which prints to Log window.
    report.on("saved", function (event) {
        Log.log(event.detail);
        if (event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
        }
    });

    Log.logText("Save/SaveAs the report to see the saved event.");
}

function _Events_TileLoaded() {
    // Get a reference to the embedded tile HTML element
    var tileContainer = $('#tileContainer')[0];

    // Get a reference to the embedded tile.
    var tile = powerbi.get(tileContainer);

    // Tile.off removes a given event handler if it exists.
    tile.off("tileLoaded");

    // Tile.on will add an event handler which prints to Log window.
    tile.on("tileLoaded", function (event) {
        Log.logText("Tile loaded event");
    });
}

function _Events_TileClicked() {
    // Get a reference to the embedded tile HTML element
    var tileContainer = $('#tileContainer')[0];

    // Get a reference to the embedded tile.
    var tile = powerbi.get(tileContainer);

    // Tile.off removes a given event handler if it exists.
    tile.off("tileClicked");

    // Tile.on will add an event handler which prints to Log window.
    tile.on("tileClicked", function (event) {
        Log.logText("Tile clicked event");
        Log.log(event.detail);
    });

    Log.logText("Click on the tile to see the tile clicked event.");
}

function _Events_ButtonClicked() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event listener if it exists.
    report.off("buttonClicked");

    // Report.on will add an event listener.
    report.on("buttonClicked", function (event) {
        Log.logText("Event - buttonClicked:");
        var data = event.detail;
        Log.log(data);
    });

    // Select Run and click on a button in the report
    // For example, a Qna button. You should see an entry in the Log window.
    Log.logText("Click button to see event in Log window.");
}

// ---- Dashboard Operations ----------------------------------------------------

function _Dashboard_GetId() {
    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Get a reference to the embedded dashboard.
    dashboard = powerbi.get(dashboardContainer);

    // Retrieve the dashboard id.
    var dashboardId = dashboard.getId();

    Log.logText("Dashboard id: \"" + dashboardId + "\"");
}

function _Dashboard_FullScreen() {
    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Get a reference to the embedded dashboard.
    dashboard = powerbi.get(dashboardContainer);

    // Displays the dashboard in full screen mode.
    dashboard.fullscreen();
}

function _Dashboard_ExitFullScreen() {
    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Get a reference to the embedded dashboard.
    dashboard = powerbi.get(dashboardContainer);

    // Exits full screen mode.
    dashboard.exitFullscreen();
}

// ---- Dashboard Events Listener ----------------------------------------------------

function _DashboardEvents_TileClicked() {
    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Get a reference to the embedded dashboard.
    dashboard = powerbi.get(dashboardContainer);

    // dashboard.off removes a given event listener if it exists.
    dashboard.off("tileClicked");

    // dashboard.on will add an event listener.
    dashboard.on("tileClicked", function (event) {
        Log.log(event.detail);
    });
}

// ---- Qna Events Listener ----------------------------------------------------

async function _Qna_SetQuestion() {
    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Get a reference to the embedded Q&A.
    qna = powerbi.get(qnaContainer);

    try {
        const result = await qna.setQuestion("2014 total units YTD by manufacturer, region as treemap chart");
        Log.log(result);
    }
    catch (errors) {
        Log.log(errors);
    }
}

function _Qna_QuestionChanged() {
    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Get a reference to the embedded Q&A.
    qna = powerbi.get(qnaContainer);

    // qna.off removes a given event listener if it exists.
    qna.off("visualRendered");

    // qna.on will add an event listener.
    qna.on("visualRendered", function (event) {
        Log.log(event.detail);
    });

    Log.logText("Change the question to see events in Log window.");
}

// ---- Visual Events Listener ----------------------------------------------------

function _Visual_DataSelected() {
    // Get a reference to the embedded visual HTML element
    var visualContainer = $('#embedContainer')[0];

    // Get a reference to the embedded visual.
    visual = powerbi.get(visualContainer);

    // Visual.off removes a given event listener if it exists.
    visual.off("dataSelected");

    // Visual.on will add an event listener.
    visual.on("dataSelected", function (event) {
        var data = event.detail;
        Log.log(data);
    });

    // Select Run and select an element of a visualization.
    // For example, a bar in a bar chart. You should see an entry in the Log window.

    Log.logText("Select data to see events in Log window.");
}

// ---- Bookmarks Operations ----------------------------------------------------
async function _Bookmarks_Enable() {
    // The new settings that you want to apply to the report.
    const newSettings = {
        panes: {
            bookmarks: {
                visible: true
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Bookmarks_Disable() {
    // The new settings that you want to apply to the report.
    const newSettings = {
        panes: {
            bookmarks: {
                visible: false
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await report.updateSettings(newSettings);
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Bookmarks_Get() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the bookmark collection and loop through to print the
    // bookmarks' name and display name.
    try {
        const bookmarks = await report.bookmarksManager.getBookmarks();
        bookmarks.forEach(function (bookmark) {
            var log = bookmark.name + " - " + bookmark.displayName;
            Log.logText(log);
        });
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Bookmarks_Apply() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // bookmarksManager.apply will apply the bookmark with the
    // given name on the report.
    // This is the actual bookmark name not the display name.
    try {
        await report.bookmarksManager.apply("Bookmarkaf5fe203dc1e280a4822");
        Log.logText("Bookmark \"Q4 2014\" applied.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Bookmarks_Capture() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Capture the current bookmark and prints the bookmark's
    // state string to Log window.
    try {
        const capturedBookmark = await report.bookmarksManager.capture();
        var log = "Captured bookmark state: " + capturedBookmark.state;
        Log.logText(log);
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Bookmarks_ApplyState() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // bookmarksManager.applyState will apply the bookmark which
    // represented by the given state string.
    try {
        await report.bookmarksManager.applyState("H4sIAAAAAAAAA+1d62/bOBL/VwIfDvmSXQyfEvvp2qa9La7Z7iW9HIpDP/AxcrRrS4Yspw2K/u9HSbbrxJal+J3USRBEMjUcDofD3zyofOu4eDjo6bvfdR87Lzqv0vSvvs7+OiGkc9ZJ7t8MlNbaEMuIoxGllFMS+VbpII/TZNh58a2T66yL+XU8HOleQdHf/F8HeEggcIZKwQyRwoEQnc/fzzr4ddBLM108fZXrHAsKt5gN/bXvlfwKnri2eXyLV2jz6u4lDtIsH19LAOcUVcwFRDsEEkjhn4niXu7JFOTM3Zuvg8xz8W0ymLflh75Vfjcorl/7jrtpFlvdmz5aPHk9YYSedd5mab+kMZaS8y3fJHmc3/mL84Lz75/POv+9wQzLZq/TxMUVw98678rfBRs4HFaCKpv0Rv0HnxRXV+kos3iJ0Y+LssPvXl5/ZOkAs7LTT6gzf8/3eq17o1LOnuj72DPvx1GwX9z2DSkQ/r5o+fm7/1UJfaa7Vmw8GOpCTs46N+mX1xn6Fq7zgpRdDatZKieied58ozUmbp1h+dG4kc0fjuwKu31M8gWDO3vAFNkGV4uEfZEm+U0LhugOxRQPr3XyMhs67NXowW1pD/yiyHWcjOdXRCQALYghKL0iEGeZKu4P46Tbw8qClPag/OtjNRajh7G9utH+wpsd86fXpoLY96JbVCIMGBNADRBpCSLCWgSp1NxbPIYBD3jIIMRgPYJhGEobSaCWc0IF1Ua7RoI5fs1N+nWemoCA+G9NRejXuCICDFmLvQBQCEIjFxolDA3ACb06e1QoFkZgNIAXoSUMmFmLPW8wmHCRlx+nEoQRwjYrTC17VitqGHcuJBqscIrz5snVpfF6Ncpzv0zmp5c5wyURwmgBjBmtgK9JUkZGBwJsgDSQzijCrF2D5Nlksy+e6aeuaH0TO4dJp1pClHk5MAcSqQ4DqwSDerO8q/3zQ0nuPUZ5ZbL6A53Fw4kBm1z9K078YoKzmYZrbbCXoyTxUj6Zbm+XcfemJLxgkyXFDnuv0UGySSs2twQE5liZ26IOYUeCGUZeuludWHRzXFygHo4ybMvGle7h8K2eZ+RjmuveyX+S2K+/eUZKiLRsJdveaOgnEV0lldc3Ossfrug0c5i9uiuXzXmcTXCyX3RvdjCkYtkutylGUCRWWxOC9bYROZAVd5WmnkJghHoYEXCp0ITInW426Sv1RKmjjCERBJwJnHeINN+/ndyKn/FgUTf7G2SrzkZrG7P1pf33ag2cXHi/GPMTD1oy3K+xWcTRySWhF6uYHqOzgzA3NWJutjshCwWTEeEOVUiMsVywNdEYRetBMTM2pAyFx2MhROs5BA6874uBDiVYiiIAuYZDoELBheSRjDRHMNa7VM2Iu5aaA6o1eHdAIkAowyCiwerUru97gGT/1vKIKo+o8lmiyhaM/Bb7Oczszd17vMXePD/Tz+c/mrBx7RWvCtyOleiRMzxeslMynXsjnDab4aS8efLjRvHxmP/FMUhoqRzPThqLg4Q/p2ac67tteV5VZsLz9udMmHusaBVAenbSnKyzZzi0yaL53Oj9PcAybP9Y5uj5Haqf9SQd0me3to/wYFYa/x75zQyPAjnipc3hpZ7fCY8g6bFIAkISomUoEIAhaENlc2x89fSe0pQLIFZZKqWTwMMWIZ3lIbFIGxABUwGC4iEn1pF1SDaNwCkeKAdaoUXtQPBxgnLlCBy3Aoo8AUehADToQOJaBKVENJ4mOi/gACjTMlyLIPPKYbmIDAFDVUFa0UaCtXE4RgUGTAMBisY4Io2w9fi1XY1LO0AbzwLadx68Wp2nvsctw9p4rqgn1/lo2ArQnl6gi0f9003B2tlR1zDVVNfzYw5mtqR2EzCcnYAZFFkv/9bRxnYQdjonc8P/x1QyQJvDjeedmmDjppD0HDvbDznWq8a7vu4uwvGNW3J/1MvjS/+MztyCXIaxQWikJAGzTFlumMajIagzBO/TL0crcFBWgBytwAasAHdFtZrWwsMVh9y6SDXjqWEvtqUO/iDW6WPWLUXexaSaKq9Gg4r/GIc/LMv9vzYWAXuZlInTduk8urE82dQ1WKaqzjfK4z6eFqXYv4D8BchHgBflz+njMnxsn5wTMs95uQLH6Xid6wXTPsy9V3g+Lu7HckNZTUp+aSXu0YQI/MLIR+qpyBdc/aooGxOrvIullE5fYf4FMTmdmJr6+gfysP5h/YDn+F7VbeRoRDiw4scGRmhlw/rtenchx4knf1JoKnqXuC7suIah2kfRSe24qumg3llkwmnLnHKa01DoJYWyP9feTRrNCtvl3k1a4KmfENH+5udnz5D26cOnB5nAA6gBPcgCoXEd0yGVB7UT/WBW9NOqoHrp76SmbDC3xmaOqS2bhlPP6y0mMfpN55G4cw/MXnh8Vh0NnUGaOz3mV5MA2tZe/Xuazw9kZxt4VVM2hT3XhWCbHYRk1OvVz85m690W8bZK+nIjOjPNYO2Vi9nbe6s7WIq1dsrJ364G2uKCaE0rLl5mcX7T966jnTXim9XhaQHpTPXmdH1dWd/avbnVC5Kg22ej7N1bpdK/+TAobG/qrRw7hBnds14tjQS2AJGD+DbNP2rTw307tnWWtNiWFmbqPfR9hGvS3l59LtEHEcoYQqzz/rQAIsAJWY+hj270HhNhRzf6cDPET9+RDnkUSB4CJ1oHoYaiQqEgsXoeoiYa3Sbqe+6fcOmXmbDvAl9/iZ1a1S4dHf1N1/8+T1etKvS9X3786cOnk9c3Ouk2+2xwvn2PrQWL27di/8R0TomwWzyyVzT5eG/2kPI4T8qxfHalpWsVsm/r7VM77n+1N2msc4xrg2bnGevkRie48g85SCskDRhHamUIDPEgst6P2tyeXO67YXRVBjwIlaFUO+4E0wY4Z7Ak/fWzu4kHkG39uaInzQWEOy1CeLYFhIpFBGkoDePGUUIoZc3nP3bruEMEDFQUKAJcaYWasGOi/mn479vcvxsPyj7BXXvBa5IWhK6Co/b/xNrfNvzwpNS/Pq9VNJTFm/pMcbSPSMuUUs661d2Il91uhl09UeV1yn6XILk0qwb5dpSMhQe78bsfjS538DK5PYq80iChNNcq4NSYgJPQGS2bX4x71KCjBk01iBlwkikRAsiQUsXAHSvGW6e6d3ra65jqPtAzkE/fXV74n1DWcpc3d96uO6uTZRB7u8rYrY2St1DGN3qYz2jj0hNorU56FW9gmI0blF//B2OhSYYdZwAA");
        Log.logText("Bookmark applied from given state.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Bookmarks_EnterPresentation() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Enter bookmarks play mode
    try {
        await report.bookmarksManager.play(models.BookmarksPlayMode.Presentation);
        Log.logText("Bookmarks play mode is on, check the play bar at the bottom of the report.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Bookmarks_ExitPresentation() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Exit bookmarks play mode
    try {
        await report.bookmarksManager.play(models.BookmarksPlayMode.Off);
        Log.logText("Bookmarks play mode is off.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_GetSlicer() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive;
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var slicer = visuals.filter(function (visual) {
            return visual.type == "slicer" && visual.name == "4d55baaa5eddde4cdf90";
        })[0];

        // Get the slicer state which contains the slicer filter.
        const state = await slicer.getSlicerState();
        Log.log(state);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_SetSlicer() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
            table: "Date",
            column: "Date"
        },
        filterType: 0,
        logicalOperator: "And",
        conditions: [
            {
                operator: "GreaterThanOrEqual",
                value: "2014-10-12T21:00:00.000Z"
            },
            {
                operator: "LessThan",
                value: "2014-11-28T22:00:00.000Z"
            }
        ]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive;
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var slicer = visuals.filter(function (visual) {
            return visual.type == "slicer" && visual.name == "4d55baaa5eddde4cdf90";
        })[0];

        // Set the slicer state which contains the slicer filters.
        await slicer.setSlicerState({ filters: [filter] });
        Log.logText("Date slicer was set.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_SetFilters() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
            table: "SalesFact",
            measure: "Total Category Volume"
        },
        filterType: 0,
        logicalOperator: "And",
        conditions: [
            {
                operator: "LessThan",
                value: 500
            }
        ]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name == "VisualContainer4";
        })[0];

        // Set the filter for the visual.
        // Pay attention that setFilters receives an array.
        await visual.setFilters([filter]);
        Log.logText("Filter was set for \"Category Breakdown\" table.")
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name == "VisualContainer4";
        })[0];

        const filters = await visual.getFilters();
        Log.log(filters);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name == "VisualContainer4";
        })[0];

        await visual.removeFilters();
        Log.logText("\"Sentiment by Year and Months\" visual filters were removed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_ExportData_Summarized() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name == "VisualContainer4";
        })[0];

        const result = await visual.exportData(models.ExportDataType.Summarized);
        Log.logCsv(result.data);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Visual_ExportData_Underlying() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    try {
        const pages = await report.getPages();

        // Retrieve active page.
        var activePage = pages.filter(function (page) {
            return page.isActive
        })[0];

        const visuals = await activePage.getVisuals();

        // Retrieve the target visual.
        var visual = visuals.filter(function (visual) {
            return visual.name == "VisualContainer4";
        })[0];

        // Exports visual data
        const result = await visual.exportData(models.ExportDataType.Underlying);
        Log.logCsv(result.data);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _ReportVisual_UpdateSettings() {
    // The new settings that you want to apply to the report.
    const newSettings = {
        panes: {
            filters: {
                visible: true
            }
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await visual.updateSettings(newSettings);
        Log.logText("Filter pane was added.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _ReportVisual_HideSingleVisualHeader() {

    // Define settings to hide the header of a single visual
    var newSettings = {
        visualSettings: {
            visualHeaders: [
                {
                    settings: {
                        visible: true
                    }
                    // No selector - Show visual header for all the visuals in the report
                },
                {
                    settings: {
                        visible: false
                    },
                    selector: {
                        $schema: "http://powerbi.com/product/schema#visualSelector",
                        visualName: "47eb6c0240defd498d4b"
                        // The visual name can be retrieved using getVisuals()
                        // Hide visual header for a single visual only
                    }
                }
            ]
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    visual = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    try {
        await visual.updateSettings(newSettings);
        Log.logText("Visual header was successfully hidden for 'Sentiment by Year and Months' visual.");
    }
    catch (error) {
        Log.log(error);
    }
}

async function _Report_Authoring_Create() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);

        // Creating new visual
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Visualization
        const response = await page.createVisual('clusteredColumnChart');

        let visual = response.visual;

        // Defining data fields
        const regionColumn = { column: 'Region', table: 'Geo', schema: 'http://powerbi.com/product/schema#column' };
        const totalUnitsMeasure = { measure: 'Total Units', table: 'SalesFact', schema: 'http://powerbi.com/product/schema#measure' };
        const totalVanArsdelUnitsMeasure = { measure: 'Total VanArsdel Units', table: 'SalesFact', schema: 'http://powerbi.com/product/schema#measure' };

        // Setting visual data fields
        visual.addDataField('Category', regionColumn);
        visual.addDataField('Y', totalUnitsMeasure);
        visual.addDataField('Y', totalVanArsdelUnitsMeasure);

        // Personalizing the visual
        visual.setProperty({ objectName: "title", propertyName: "textSize" }, { schema: 'http://powerbi.com/product/schema#property', value: 8 });
        visual.setProperty({ objectName: "title", propertyName: "fontColor" }, { schema: 'http://powerbi.com/product/schema#property', value: '#000000' });

        // Visit: https://github.com/microsoft/powerbi-report-authoring/wiki for full documentation
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_ChangeType() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Visualization
        await visual.changeType('waterfallChart');
        Log.logText("Last visual type was changed.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_Remove() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Visualization
        await page.deleteVisual(visual.name);
        Log.logText("Last visual was deleted.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_Capabilities() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Getting visual capabilities
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Data-binding
        const capabilities = await visual.getCapabilities();
        Log.logText("Visual capabilities:");
        Log.log(capabilities);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_AddDataField() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Getting 'Y' role data fields
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Data-binding
        const dataFields = await visual.getDataFields('Y');

        // Removing the second data field of 'Y' role, in order to add Legend/Breakdown
        if (dataFields.length > 1)
            visual.removeDataField('Y', 1);

        // Adding Legend/Breakdown data role
        if (visual.type === 'clusteredColumnChart') {
            const quarterColumn = { column: 'Quarter', table: 'Date', schema: 'http://powerbi.com/product/schema#column' };
            await visual.addDataField('Series', quarterColumn);
            Log.logText("Data field was added to last visual.");
        }
        else {
            const categoryColumn = { column: 'Category', table: 'Product', schema: 'http://powerbi.com/product/schema#column' };
            await visual.addDataField('Breakdown', categoryColumn);
            Log.logText("Data field was added to last visual.");
        }
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_RemoveDataField() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();

        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];
        let dataRole = visual.type === 'clusteredColumnChart' ? 'Series' : 'Breakdown';

        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Data-binding
        const dataFields = await visual.getDataFields(dataRole);

        // Removing Legend/Breakdown data field
        if (dataFields.length > 0) {
            await visual.removeDataField(dataRole, 0);
            Log.logText("Data field was removed from last visual.");
        }
        else {
            Log.log("Please add additional data field first.");
        }
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_GetDataField() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Getting 'Y' role data fields
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Data-binding
        const dataFields = await visual.getDataFields('Y');
        Log.logText("Visual 'Y' fields:");
        Log.log(dataFields);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_GetProperty() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Get legend position property
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Properties
        const property = await visual.getProperty({ objectName: "legend", propertyName: "position" });
        Log.logText("Last visual - legend position property:");
        Log.log(property);
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_SetProperty() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Set legend position to bottom center
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Properties
        await visual.setProperty({ objectName: "legend", propertyName: "position" }, { schema: 'http://powerbi.com/product/schema#property', value: 'BottomCenter' });
        Log.logText("Last visual legend position was set to bottom center.");
    }
    catch (errors) {
        Log.log(errors);
    }
}

async function _Report_Authoring_ResetProperty() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Util function - setting authoring page as active
    // For implementation please check 'Navigation > Page - Set active' code sample.
    try {
        const page = await SetAuthoringPageActive(report);
        const visuals = await page.getVisuals();
        if (visuals.length < 1) {
            Log.logText("No visuals on authoring page. Please run 'Create visual and personalize' first.");
            return;
        }

        // Getting the last visual that was added
        let visual = visuals[visuals.length - 1];

        // Reset visual legend position
        // Documentation link: https://github.com/microsoft/powerbi-report-authoring/wiki/Properties
        await visual.resetProperty({ objectName: "legend", propertyName: "position" });
        Log.logText("Last visual legend position property was reset to default value.");
    }
    catch (errors) {
        Log.log(errors);
    }
}
