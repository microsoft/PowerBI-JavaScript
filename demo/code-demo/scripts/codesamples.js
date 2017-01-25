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

    // Get viewMode
    var checkd = $('#viewMode:checked').val();
    var viewMode = checkd ? 1 : 0; 

    // Embed configuration used to describe the what and how to embed.
    // This object is used when calling powerbi.embed.
    // This also includes settings and options such as filters.
    // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
    var config= {
        type: 'report',
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        permissions: 3/*All*/,
        viewMode: viewMode,
        settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        }
    };

    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Embed the report and display it within the div container.
    var report = powerbi.embed(reportContainer, config);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function() {
        Log.logText("Loaded");
    });
}

function _Embed_EmbedWithDefaultFilter() {
    var txtAccessToken = $('#txtAccessToken').val();
    var txtEmbedUrl = $('#txtReportEmbed').val();
    var txtEmbedReportId = $('#txtEmbedReportId').val();
    
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
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        id: txtEmbedReportId,
        settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: false
        },
        filters: [filter]
    };
    
    var reportContainer = document.getElementById('reportContainer');
    powerbi.embed(reportContainer, embedConfiguration);
}

function _Embed_Create() {
    // Read embed application token from textbox
    var txtAccessToken = $('#txtAccessToken').val();

    // Read embed URL from textbox
    var txtEmbedUrl = $('#txtReportEmbed').val();

    // Read dataset Id from textbox
    var txtEmbedDatasetId = $('#txtEmbedDatasetId').val();
    
    // Embed create configuration used to describe the what and how to create report.
    // This object is used when calling powerbi.createReport.
    var embedCreateConfiguration = {
        accessToken: txtAccessToken,
        embedUrl: txtEmbedUrl,
        datasetId: txtEmbedDatasetId,
    };
    
    // Grab the reference to the div HTML element that will host the report
    var reportContainer = $('#reportContainer')[0];

    // Create report
    var report = powerbi.createReport(reportContainer, embedCreateConfiguration);

    // Report.off removes a given event handler if it exists.
    report.off("loaded");

    // Report.on will add an event handler which prints to Log window.
    report.on("loaded", function() {
        Log.logText("Loaded");
    });
}

// ---- Report Operations ----------------------------------------------------

function _Report_GetId() {
    
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

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

    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Update the settings by passing in the new settings you have configured.
    report.updateSettings(newSettings)
        .then(function (result) {
            $("#result").html(result);
        })
        .catch(function (error) {
            $("#result").html(error);
        });
}

function _Report_GetPages() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

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
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // setPage will change the selected view to the page you indicate.
    // This is the actual page name not the display name.
    report.setPage("ReportSection2")
        .then(function (result) {
            Log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });

    // Report.off removes a given event handler if it exists.
    report.off("pageChanged");

    // Report.on will add an event handler which prints page 
    // name and display name to Log window.
    report.on("pageChanged", function(event) {
        var page = event.detail.newPage;
        Log.logText(page.name + " - " + page.displayName);
    });
}

function _Report_GetFilters() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
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

    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    // Set the filter for the report.
    // Pay attention that setFilters receives an array.
    report.setFilters([filter])
        .then(function (result) {
            Log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_RemoveFilters() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Remove the filters currently applied to the report.
    report.removeFilters()
        .then(function (result) {
            Log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_PrintCurrentReport() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Trigger the print dialog for your browser.
    report.print()
        .then(function (result) {
            Log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_Reload() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Reload the displayed report
    report.reload()
        .then(function (result) {
            Log.log(result);
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

function _Report_FullScreen() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Displays the report in full screen mode.
    report.fullscreen();
}

function _Report_ExitFullScreen() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Exits full screen mode.
    report.exitFullscreen();
}

function _Report_switchModeEdit() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Switch to edit mode.
    report.switchMode("edit");
}

function _Report_switchModeView() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Switch to view mode.
    report.switchMode("view");
}

function _Report_save() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Save report
    report.save();
    
    // report.off removes a given event handler if it exists.
    report.off("saved");

    // report.on will add an event handler which prints to Log window.
    report.on("saved", function() {
        var reportObjectId = event.detail.reportObjectId;
        var isSaveAs = event.detail.saveAs;
        var name = event.detail.reportName;
        Log.logText("Report name " + name);
        Log.logText("Save Report Completed, reportObjectId: " + reportObjectId);
        Log.logText("Is saveAs: " + isSaveAs.toString());
    });
}

function _Report_saveAs() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    var saveAsParameters = {
        name: "newReport"
    };

    // SaveAs report
    report.saveAs(saveAsParameters);

    // report.off removes a given event handler if it exists.
    report.off("saved");

    // report.on will add an event handler which prints to Log window.
    report.on("saved", function() {
        var reportObjectId = event.detail.reportObjectId;
        var isSaveAs = event.detail.saveAs;
        var name = event.detail.reportName;
        Log.logText("Report name " + name);
        Log.logText("Save Report Completed, new reportObjectId: " + reportObjectId);
        Log.logText("Is saveAs: " + isSaveAs.toString());
    });
}

function _Report_setAccessToken() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    // New AccessToken
    var newAccessToken = "newAccessToken";

    // Set new AccessToken
    report.setAccessToken(newAccessToken).then(function (result) {
            Log.log("AccessToken set");
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

// ---- Page Operations ----------------------------------------------------

function _Page_SetActive() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    // Retrieve the page collection, and then set the second page to be active.
    report.getPages()
        .then(function (pages) {
            pages[1].setActive().then(function (result) {
                Log.log(result);
            });
        })
        .catch(function (errors) {
           Log.log(errors);
        });
}

function _Page_GetFilters() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    // Retrieve the page collection and get the filters for the first page.
    report.getPages()
        .then(function (pages) {
            pages[0].getFilters()
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

function _Page_SetFilters() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

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
            pages[0].setFilters([filter])
                .then(function (result) {
                    Log.log(result);
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
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);
    
    // Retrieve the page collection and remove the filters for the first page.
    report.getPages()
        .then(function (pages) {
            pages[0].removeFilters()
                .then(function (result) {
                    Log.log(result);
                })
                .catch(function (errors) {
                    Log.log(errors);
                });
        })
        .catch(function (errors) {
            Log.log(errors);
        });
}

// ---- Event Listener ----------------------------------------------------

function _Events_PageChanged() {
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

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
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

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
    // Grab the reference to the div HTML element that will host the report.
    var reportContainer = $('#reportContainer')[0];

    // Get a reference to the embedded report.
    report = powerbi.get(reportContainer);

    // Report.off removes a given event listener if it exists.
    report.off("saveAsTriggered");

    // Report.on will add an event listener.
    report.on("saveAsTriggered", function(event) {
        var eventType = event.type;
        Log.logText("Event Triggered: " + eventType);
    });

    // Select Run and change to a different page.
    // You should see an entry in the Log window.

    Log.logText("Run SaveAs to see events in Log window.");
}