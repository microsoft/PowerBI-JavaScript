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
    var config= {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.on("error", function(event) {
        Log.log(event.detail);

        report.off("error");
    });

    report.off("saved");
    report.on("saved", function(event) {
        Log.log(event.detail);
        if(event.detail.saveAs) {
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
    var config= {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        pageName: "ReportSectionf55279cd456214bd0381",
        settings: {
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
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.on("error", function(event) {
        Log.log(event.detail);

        report.off("error");
    });

    report.off("saved");
    report.on("saved", function(event) {
        Log.log(event.detail);
        if(event.detail.saveAs) {
            Log.logText('In order to interact with the new report, create a new token and load the new report');
         }
     });
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
    var config= {
        type: 'visual',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtReportId,
        pageName: txtPageName,
        visualName: txtVisualName
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#visualContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.on("error", function(event) {
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
    dashboard.on("loaded", function() {
        Log.logText("Loaded");
    });

    dashboard.on("error", function(event) {
        Log.log(event.detail);

        dashboard.off("error");
    });

    dashboard.off("tileClicked");
    dashboard.on("tileClicked", function(event) {
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
    dashboard.on("loaded", function() {
        Log.logText("Loaded");
    });

    dashboard.on("error", function(event) {
        Log.log(event.detail);

        dashboard.off("error");
    });

    dashboard.off("tileClicked");
    dashboard.on("tileClicked", function(event) {
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
    var config= {
        type: 'report',
        tokenType: tokenType == '0' ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: permissions,
        viewMode: viewMode,
        settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true,
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
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.off("saveAsTriggered");
    report.on("saveAsTriggered", function() {
        Log.logText("Cannot save sample report");
    });

    report.off("error");
    report.on("error", function(event) {
        Log.log(event.detail);
    });

    report.off("saved");
    report.on("saved", function(event) {
        Log.log(event.detail);
        if(event.detail.saveAs) {
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
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(embedContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.off("error");
    report.on("error", function(event) {
        Log.log(event.detail);
    });

    report.off("saved");
    report.on("saved", function(event) {
        Log.log(event.detail);
        if(event.detail.saveAs) {
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
        table: "Store",
        column: "Chain"
      },
      operator: "In",
      values: ["Lindseys"]
    };

    var embedConfiguration = {
        type: 'report',
        tokenType: models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: false
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
    var config= {
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
    tile.on("tileLoaded", function(event) {
        Log.logText("Tile loaded event");
    });

    // Tile.off removes a given event handler if it exists.
    tile.off("tileClicked");

    // Tile.on will add an event handler which prints to Log window.
    tile.on("tileClicked", function(event) {
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
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.off("error");
    report.on("error", function(event) {
        Log.log(event.detail);
    });

    // report.off removes a given event handler if it exists.
    report.off("saved");
    report.on("saved", function(event) {
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
    report.on("loaded", function() {
        Log.logText("Loaded");
    });

    report.off("saveAsTriggered");
    report.on("saveAsTriggered", function() {
        Log.logText("Cannot save sample report");
    });

    report.off("error");
    report.on("error", function(event) {
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

    // Read Qna mode
    var qnaMode = $("input[name='qnaMode']:checked").val();

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config= {
        type: 'qna',
        tokenType: models.TokenType.Embed,
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetIds: [txtDatasetId],
        viewMode: models.QnaMode[qnaMode],
        question: txtQuestion
    };

    // Get a reference to the embedded QNA HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Embed the QNA and display it within the div container.
    var qna = powerbi.embed(qnaContainer, config);

    // qna.off removes a given event handler if it exists.
    qna.off("loaded");

    // qna.on will add an event handler which prints to Log window.
    qna.on("loaded", function(event) {
        Log.logText("QNA loaded event");
        Log.log(event.detail);
    });
}

// ---- Report Operations ----------------------------------------------------

function _Report_GetId() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the report id.
    var reportId = report.getId();

    Log.logText(reportId);
}

function _Report_UpdateSettings() {
    // The new settings that you want to apply to the report.
    const newSettings = {
      navContentPaneEnabled: true,
      filterPaneEnabled: false
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(newSettings)
        .catch(function (error) {
            Log.log(errors);
        });
}

function _Report_GetPages() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and loop through to collect the
    // page name and display name of each page and display the value.
    report.getPages()
        .then(function (pages) {
            pages.forEach(function(page) {
                var log = page.name + " - " + page.displayName;
                Log.logText(log);
            });
        })
        .catch(function (error) {
            Log.log(error);
        });
}

function _Report_SetPage() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("pageChanged");

    // Report.on will add an event handler which prints page
    // name and display name to Log window.
    report.on("pageChanged", function(event) {
        var page = event.detail.newPage;
        Log.logText(page.name + " - " + page.displayName);
    });

    // setPage will change the selected view to the page you indicate.
    // This is the actual page name not the display name.
    report.setPage("ReportSection2")
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Get the filters applied to the report.
    report.getFilters()
        .then(function (filters) {
            Log.log(filters);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_SetFilters() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
      $schema: "http://powerbi.com/product/schema#basic",
      target: {
        table: "Store",
        column: "Chain"
      },
      operator: "In",
      values: ["Lindseys"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    report.setFilters([filter])
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Remove the filters currently applied to the report.
    report.removeFilters()
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_PrintCurrentReport() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Trigger the print dialog for your browser.
    report.print()
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_Reload() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Reload the displayed report
    report.reload()
        .then(function (result) {
            Log.logText("Reloaded");
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_Refresh() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Refresh the displayed report
    report.refresh()
        .then(function (result) {
            Log.logText("Refreshed");
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_ApplyCustomLayout() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Define default visual layout: visible in 400x300.
    let defaultLayout = {
      width: 400,
      height: 300,
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
        "VisualContainer7": {
          x: 70,
          y: 100,
          displayState: {
            mode: models.VisualContainerDisplayMode.Visible
          }
        },
        "VisualContainer4": {
          x: 540,
          y: 100,
          displayState: {
            mode: models.VisualContainerDisplayMode.Visible
          }
        }
      }
    };

    let settings = {
      filterPaneEnabled: false,
      navContentPaneEnabled: false,
      layoutType: models.LayoutType.Custom,
      customLayout: {
        pageSize: pageSize,
        displayOption: models.DisplayOption.FitToPage,
        pagesLayout: {
          "ReportSection3": pageLayout
        }
      }
    }

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(settings)
        .catch(function (error) {
            Log.log(errors);
        });
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

function _Report_Extensions_OptionsMenu() {
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
    report.updateSettings(newSettings)
        .catch(function (error) {
            Log.log(errors);
        });

    // Report.on will add an event handler to commandTriggered event which prints to console window.
    report.on("commandTriggered", function(event) {
        var commandDetails = event.detail;
        Log.log(commandDetails);
    });

    // Select Run and open options menu to see new added items.
    // Click on menu items added and you should see an entry in the Log window.

    Log.logText("Open visual options menu by clicking the three dots icon and click on added items to see events in Log window.");
}

function _Report_Extensions_ContextMenu() {
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
    report.updateSettings(newSettings)
        .catch(function (error) {
            Log.log(errors);
        });

    // Report.on will add an event handler to commandTriggered event which prints to console window.
    report.on("commandTriggered", function(event) {
        var commandDetails = event.detail;
        Log.log(commandDetails);
    });

    // Select Run and context menu (i.e. by right click on data points) to see new added items.
    // Click on menu items added and you should see an entry in the Log window.

    Log.logText("Open visual context menu by right click on data points and click on added items to see events in Log window.");
}

// ---- Page Operations ----------------------------------------------------

function _Page_SetActive() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection, and then set the second page to be active.
    report.getPages()
        .then(function (pages) {
            pages[1].setActive()
                .catch(function (errors) {
                    Log.log(errors);
                });
        })
        .catch(function (errors) {
           Log.log(errors);
        });
}

function _Page_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the filters for the first page.
    report.getPages()
        .then(function (pages) {
          // Retrieve active page.
          var activePage = pages.find(function(page) {
            return page.isActive
          });

          activePage.getFilters()
            .then(function (filters) {
                Log.log(filters);
            })
            .catch(function (errors) {
                Log.log(errors);
            });
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Page_GetVisuals() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {
        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {
            Log.log(
              visuals.map(function(visual) {
                return {
                  name: visual.name,
                  type: visual.type,
                  title: visual.title,
                  layout: visual.layout
                };
            }));
          })
          .catch(function (errors) {
              Log.log(errors);
          });
      })
      .catch(function (errors) {
          Log.log(errors);
      });
}

function _Page_SetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Build the filter you want to use. For more information, see Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Store",
            column: "Chain"
        },
        operator: "In",
        values: ["Lindseys"]
    };

    // Retrieve the page collection and then set the filters for the first page.
    // Pay attention that setFilters receives an array.
    report.getPages()
        .then(function (pages) {
          // Retrieve active page.
          var activePage = pages.find(function(page) {
            return page.isActive
          });

          activePage.setFilters([filter])
            .catch(function (errors) {
                Log.log(errors);
            });
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Page_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and remove the filters for the first page.
    report.getPages()
        .then(function (pages) {
          // Retrieve active page.
          var activePage = pages.find(function(page) {
            return page.isActive
          });

          activePage.removeFilters()
            .catch(function (errors) {
                Log.log(errors);
            });
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Page_HasLayout() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and check if the first page has a MobilePortrait layout.
    report.getPages().then(function (pages) {
        pages[0].hasLayout(models.LayoutType.MobilePortrait).then(function(hasLayout) {
            Log.logText(hasLayout);
        })
    });
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
    report.on("pageChanged", function(event) {
        var page = event.detail.newPage;
        Log.logText("Page changed to: " + page.name + " - " + page.displayName);
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
    report.on("dataSelected", function(event) {
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
    report.on("saveAsTriggered", function(event) {
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
    report.on("bookmarkApplied", function(event) {
        Log.log(event.detail);
    });

    // Select Run and then go to bookmarks
    // and select 'Apply Bookmark by name'.
    // You should see an entry in the Log window.
    Log.logText("Apply a bookmark to see events in Log window.");
}

// ---- Dashboard Operations ----------------------------------------------------

function _Dashboard_GetId() {
    // Get a reference to the embedded dashboard HTML element
    var dashboardContainer = $('#dashboardContainer')[0];

    // Get a reference to the embedded dashboard.
    dashboard = powerbi.get(dashboardContainer);

    // Retrieve the dashboard id.
    var dashboardId = dashboard.getId();

    Log.logText(dashboardId);
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
    dashboard.on("tileClicked", function(event) {
        Log.log(event.detail);
    });
}

// ---- Qna Events Listener ----------------------------------------------------

function _Qna_SetQuestion() {
    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Get a reference to the embedded Q&A.
    qna = powerbi.get(qnaContainer);

    qna.setQuestion("This year sales")
        .then(function (result) {
            log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Qna_QuestionChanged() {
    // Get a reference to the embedded Q&A HTML element
    var qnaContainer = $('#qnaContainer')[0];

    // Get a reference to the embedded Q&A.
    qna = powerbi.get(qnaContainer);

    // qna.off removes a given event listener if it exists.
    qna.off("visualRendered");

    // qna.on will add an event listener.
    qna.on("visualRendered", function(event) {
        Log.log(event.detail);
    });
}

// ---- Visual Events Listener ----------------------------------------------------

function _Visual_DataSelected() {
    // Get a reference to the embedded visual HTML element
    var visualContainer = $('#visualContainer')[0];

    // Get a reference to the embedded visual.
    visual = powerbi.get(visualContainer);

    // Visual.off removes a given event listener if it exists.
    visual.off("dataSelected");

    // Visual.on will add an event listener.
    visual.on("dataSelected", function(event) {
        var data = event.detail;
        Log.log(data);
    });

    // Select Run and select an element of a visualization.
    // For example, a bar in a bar chart. You should see an entry in the Log window.

    Log.logText("Select data to see events in Log window.");
}

// ---- Bookmarks Operations ----------------------------------------------------
function _Bookmarks_Enable() {
    // The new settings that you want to apply to the report.
    const newSettings = {
      bookmarksPaneEnabled: true
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(newSettings)
        .catch(function (error) {
            Log.log(errors);
        });
}

function _Bookmarks_Disable() {
    // The new settings that you want to apply to the report.
    const newSettings = {
      bookmarksPaneEnabled: false
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(newSettings)
        .catch(function (error) {
            Log.log(errors);
        });
}

function _Bookmarks_Get() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the bookmark collection and loop through to print the
    // bookmarks' name and display name.
    report.bookmarksManager.getBookmarks()
        .then(function (bookmarks) {
            bookmarks.forEach(function(bookmark) {
                var log = bookmark.name + " - " + bookmark.displayName;
                Log.logText(log);
            });
        })
        .catch(function (error) {
            Log.log(error);
        });
}

function _Bookmarks_Apply() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("bookmarkApplied");

    // Report.on will add an event handler which prints bookmark
    // name and display name to Log window.
    report.on("bookmarkApplied", function(event) {
        var bookmark = event.detail;
        Log.logText(bookmark.bookmarkName);
    });

    // bookmarksManager.apply will apply the bookmark with the
    // given name on the report.
    // This is the actual bookmark name not the display name.
    report.bookmarksManager.apply("Bookmark4f76333c3ea205286501")
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Bookmarks_Capture() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Capture the current bookmark and prints the bookmark's
    // state string to Log window.
    report.bookmarksManager.capture()
        .then(function (capturedBookmark) {
            var log = "Captured bookmark state: " + capturedBookmark.state;
            Log.logText(log);
        })
        .catch(function (error) {
            Log.log(error);
        });
}

function _Bookmarks_ApplyState() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Report.off removes a given event handler if it exists.
    report.off("bookmarkApplied");

    // Report.on will add an event handler which prints bookmark
    // name and display name to Log window.
    report.on("bookmarkApplied", function(event) {
        var bookmark = event.detail;
        Log.logText(bookmark.bookmarkName);
    });

    // bookmarksManager.applyState will apply the bookmark which
    // represented by the given state string.
    report.bookmarksManager.applyState("H4sIAAAAAAAAA81YUW/aMBD+K5GlqS/RRChdNd5WWqRpbVc1iGmaeDDJFdwmcWY7FITy33d2wlbSlAQGoTwlZ+fuO9/dd2eWxGcyDujiloZAuuSC86eQiierQ2wSrcvazunYOTv/3G75Y6cDvtOCFu7isWI8kqS7JIqKCaghkwkNtEIU/hqlNoF5HHBB9T5XUQV67wyExHfU73zUaqin2Axc8FQmvYeYC5W/n+KGBxYo/EZ/O15czWOBypcrjH2ziLvUItbvPbQy4YJ5NCDGvgCZmVuSHg+S0DxdrcldnggP7uHBLEWKqQVqumRSoR5FUnTkTvAYxJrcuqERnaBtvT7lzz0BaNsnXSe1C/CcY+Crgat9CFwDhhaKmHTsX+PRKSKzQJvwFkKPknca+/+JeeaSNjdcVULbJn3BQ+NbXo8Sd/6F4you8PxGNvkxBXzS+3o88pnKvfha8EzmW2r4nL0YiwVne1PKIhSi2SENElPUqPWaIXz0RDugxbjz5JpFvoSFPNHbR2ma5sW/cwByj8sBHSWtyxHptWpAp40BMtlTDajTGKDvMUTWDY/UtAass8ZgGaE10LbKaWlmehkWmcKcyxlouC7TIsmiSQDZgmlu5mmQ+aBgrsZ8rlvl+BFJTStJtbmCovbeNHXe5szGuKjHw5gKJotv35AjSLdlk2t4ULXD+DY9FUJ4zyZTo7aMn1x0xDIfaIY6FD9tTCr7jRA02qZaL2B88Wc08lB6qJO4TcJxyXhUC8MNUJkIqA2CBvAqQQZc0cAyS9YQc1Bbsj4cD0+G5A6E5f62+jsGZy8HM2XS+glUWP+W14GYwWwTIUmPKiwz7MhCrbPSaqBHe48vRrs86Rf1B5NtshzZyAXBYIu5Zyv1ZVzrVHLt3oJYVmJ5duulnSLoUeFX9pNPW/aTvRPJHZdK4/FfU+o7KpdDcPu2HaZGyEMaF2uVCx/ERVaVl0ysLuE4BFw1cI66bvfNFtVpVFrNG26bDV0lSi837yjJK9MrZtBIP9h4fKXBPW+OqusOIg2xSNmfMX2G3Tsov5MdBsXOf6XV6WNBIjGu4GeQGsnA6lMtTcOz404Mt/C853nB/P4AHEfgTkoWAAA=")
        .catch(function (error) {
            Log.log(error);
        });
}

function _Bookmarks_EnterPresentation() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Enter bookmarks play mode
    report.bookmarksManager.play(models.BookmarksPlayMode.Presentation);
}

function _Bookmarks_ExitPresentation() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Exit bookmarks play mode
    report.bookmarksManager.play(models.BookmarksPlayMode.Off);
}

function _Visual_GetSlicer() {
    // Get a reference to the embedded report HTML element 
    var embedContainer = $('#embedContainer')[0]; 

    // Get a reference to the embedded report. 
    report = powerbi.get(embedContainer); 

    // Retrieve the page collection and get the visuals for the first page. 
    report.getPages() 
      .then(function (pages) { 
          // Retrieve active page.
          var activePage = pages.find(function(page) {
            return page.isActive;
        });

      activePage.getVisuals()
        .then(function (visuals) { 
          // Retrieve the wanted visual. 
          var slicer = visuals.find(function(visual) { 
            return visual.type == "slicer"; 
          }); 

          // Get the slicer state which contains the slicer filter.
          slicer.getSlicerState()
            .then(function (state) {
                Log.log(state);
            })
            .catch(function (errors) {
                Log.log(errors);
            });
          })
          .catch(function (errors) { 
              Log.log(errors); 
          }); 
    }) 
    .catch(function (errors) { 
        Log.log(errors); 
    });
}

function _Visual_SetSlicer() {
    // Build the filter you want to use. For more information, See Constructing 
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters. 
    const filter = { 
        $schema: "http://powerbi.com/product/schema#basic", 
        target: { 
            table: "District", 
            column: "District Manager" 
        },
        operator: "In", 
        values: ["Brad Sutton", "Andrew Ma"] 
    };

    // Get a reference to the embedded report HTML element 
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report. 
    report = powerbi.get(embedContainer); 
      
    // Retrieve the page collection and get the visuals for the first page. 
    report.getPages() 
      .then(function (pages) { 
          // Retrieve active page.
          var activePage = pages.find(function(page) {
            return page.isActive;
        });

      activePage.getVisuals()
        .then(function (visuals) { 
          // Retrieve the wanted visual. 
          var slicer = visuals.find(function(visual) { 
            return visual.type == "slicer"; 
          }); 

          // Set the slicer state which contains the slicer filters.
          slicer.setSlicerState({ filters: [filter]})
              .catch(function (errors) {
                  Log.log(errors);
              });
          })
          .catch(function (errors) { 
              Log.log(errors); 
          }); 
    }) 
    .catch(function (errors) { 
        Log.log(errors); 
    });
}

function _Visual_SetFilters() {
    // Build the filter you want to use. For more information, See Constructing
    // Filters in https://github.com/Microsoft/PowerBI-JavaScript/wiki/Filters.
    const filter = {
      $schema: "http://powerbi.com/product/schema#basic",
      target: {
        table: "Store",
        column: "Chain"
      },
      operator: "In",
      values: ["Fashions Direct"]
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {

        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {

            // Retrieve the wanted visual.
            var visual = visuals.find(function(visual) {
              return visual.name == "VisualContainer3";
            });

            // Set the filter for the visual.
            // Pay attention that setFilters receives an array.
            visual.setFilters([filter])
                .catch(function (errors) {
                    Log.log(errors);
                });
            })
            .catch(function (errors) {
                Log.log(errors);
            });
      })
      .catch(function (errors) {
          Log.log(errors);
      });
}

function _Visual_GetFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {

        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {

            // Retrieve the wanted visual.
            var visual = visuals.find(function(visual) {
              return visual.name == "VisualContainer3";
            });

            visual.getFilters()
              .then(function (filters) {
                Log.log(filters);
              })
              .catch(function (errors) {
                Log.log(errors);
              });
          })
          .catch(function (errors) {
            Log.log(errors);
          });
      })
      .catch(function (errors) {
        Log.log(errors);
      });
}

function _Visual_RemoveFilters() {
    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {

        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {

            // Retrieve the wanted visual.
            var visual = visuals.find(function(visual) {
              return visual.name == "VisualContainer3";
            });

            visual.removeFilters()
              .catch(function (errors) {
                Log.log(errors);
              });
          })
          .catch(function (errors) {
            Log.log(errors);
          });
      })
      .catch(function (errors) {
        Log.log(errors);
      });
}

function _Visual_ExportData_Summarized() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {

        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {

            // Retrieve the wanted visual.
            var visual = visuals.find(function(visual) {
              return visual.name == "VisualContainer3";
            });

            // Exports visual data
            visual.exportData(models.ExportDataType.Summarized)
              .then(function (result) {
                Log.logCsv(result.data);
              })
              .catch(function (errors) {
                Log.log(errors);
              });
            })
            .catch(function (errors) {
              Log.log(errors);
            });
      })
      .catch(function (errors) {
        Log.log(errors);
      });
}

function _Visual_ExportData_Underlying() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Retrieve the page collection and get the visuals for the first page.
    report.getPages()
      .then(function (pages) {

        // Retrieve active page.
        var activePage = pages.find(function(page) {
          return page.isActive
        });

        activePage.getVisuals()
          .then(function (visuals) {

            // Retrieve the wanted visual.
            var visual = visuals.find(function(visual) {
              return visual.name == "VisualContainer3";
            });

            // Exports visual data
            visual.exportData(models.ExportDataType.Underlying)
              .then(function (result) {
                Log.logCsv(result.data);
              })
              .catch(function (errors) {
                Log.log(errors);
              });
            })
            .catch(function (errors) {
              Log.log(errors);
            });
      })
      .catch(function (errors) {
        Log.log(errors);
      });
}