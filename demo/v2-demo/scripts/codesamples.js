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
        pageName: "ReportSectioneb8c865100f8508cc533",
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

    powerbi.reset(embedContainer);

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
        .then(function () {
            Log.logText("Filter pane was removed.");
        })
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
          var log = "Report pages:";
          pages.forEach(function(page) {
            log += "\n" + page.name + " - " + page.displayName;
          });
          Log.logText(log);
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

    // setPage will change the selected view to the page you indicate.
    // This is the actual page name not the display name.
    report.setPage("ReportSectiona271643cba2213c935be")
        .then(function () {
            Log.logText("Page was set to: ReportSectiona271643cba2213c935be");
        })
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
    report.setFilters([filter])
        .then(function () {
            Log.logText("Report filter was set.");
        })
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
        .then(function () {
          Log.logText("Report filters were removed.");
        })
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
      filterPaneEnabled: false,
      navContentPaneEnabled: false,
      layoutType: models.LayoutType.Custom,
      customLayout: {
        pageSize: pageSize,
        displayOption: models.DisplayOption.FitToPage,
        pagesLayout: {
          "ReportSection600dd9293d71ade01765": pageLayout
        }
      }
    }

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(settings)
        .then(function () {
            Log.logText("Custom layout applied, to remove custom layout, reload the report using 'Reload' API.")
        })
        .catch(function (error) {
            Log.log(errors);
        });
}

function _Report_HideAllVisualHeaders() {

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
    report.updateSettings(newSettings)
        .then(function () {
            Log.logText("Visual header was successfully hidden for all the visuals in the report.");
        })
        .catch(function (error) {
            Log.log(errors);
        });

}

function _Report_ShowAllVisualHeaders() {
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
    report.updateSettings(newSettings)
        .then(function () {
            Log.logText("Visual header was successfully shown for all the visuals in the report.");
        })
        .catch(function (error) {
            Log.log(errors);
        });

}

function _Report_HideSingleVisualHeader() {

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
    report.updateSettings(newSettings)
        .then(function () {
            Log.logText("Visual header was successfully hidden for 'Category Breakdown' visual.");
        })
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
        Log.logText("Event - commandTriggered:");
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
        Log.logText("Event - commandTriggered:");
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
            pages[3].setActive()
                .then(function () {
                    Log.logText("Active page was set to: \"" + pages[3].displayName + "\"");
                })
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
            table: "Geo",
            column: "Region"
        },
        operator: "In",
        values: ["West"]
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
            .then(function () {
                Log.logText("Page filter was set.");
            })
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
            .then(function () {
                Log.logText("Page filters were removed.");
            })
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
            hasLayout = hasLayout ? "has" : "doesn't have";
            Log.logText("Page \"" + pages[0].name + "\" " + hasLayout + " mobile portrait layout.");
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
    report.on("dataSelected", function(event) {
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
        Log.logText("Event - bookmarkApplied:");
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

    qna.setQuestion("2014 total units YTD by manufacturer, region as treemap chart")
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

    Log.logText("Change the question to see events in Log window.");
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

    // bookmarksManager.apply will apply the bookmark with the
    // given name on the report.
    // This is the actual bookmark name not the display name.
    report.bookmarksManager.apply("Bookmarkaf5fe203dc1e280a4822")
        .then(function () {
            Log.logText("Bookmark \"Q4 2014\" applied.");
        })
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

    // bookmarksManager.applyState will apply the bookmark which
    // represented by the given state string.
    report.bookmarksManager.applyState("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")
        .then(function () {
            Log.logText("Bookmark applied from given state.");
        })
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
    report.bookmarksManager.play(models.BookmarksPlayMode.Presentation)
        .then(function () {
            Log.logText("Bookmarks play mode is on, check the play bar at the bottom of the report.");
        });
}

function _Bookmarks_ExitPresentation() {
    // Get models. models contains enums that can be used.
    var models = window['powerbi-client'].models;

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#embedContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(embedContainer);

    // Exit bookmarks play mode
    report.bookmarksManager.play(models.BookmarksPlayMode.Off)
        .then(function () {
            Log.logText("Bookmarks play mode is off.");
        });
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
            return visual.type == "slicer" && visual.name == "4d55baaa5eddde4cdf90";
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
              return visual.type == "slicer" && visual.name == "4d55baaa5eddde4cdf90";
            });

            // Set the slicer state which contains the slicer filters.
            slicer.setSlicerState({ filters: [filter]})
                .then(function () {
                    Log.logText("Date slicer was set.");
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

function _Visual_SetFilters() {
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
              return visual.name == "VisualContainer4";
            });

            // Set the filter for the visual.
            // Pay attention that setFilters receives an array.
            visual.setFilters([filter])
                .then(function() {
                    Log.logText("Filter was set for \"Category Breakdown\" table.")
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
              return visual.name == "VisualContainer4";
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
              return visual.name == "VisualContainer4";
            });

            visual.removeFilters()
              .then(function () {
                Log.logText("\"Category Breakdown\" visual filters were removed.");
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
              return visual.name == "VisualContainer4";
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
              return visual.name == "VisualContainer4";
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