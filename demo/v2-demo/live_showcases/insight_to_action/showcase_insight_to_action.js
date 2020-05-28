let InsightToActionShowcaseState = {
    report: null,
    data: null,
    allChecked: false,
    tooltipNextPressed: false,
}

const dialogTooltipTimeout = 1500;
const sentMessageTimeout = 3000;

// Embed the report and retrieve the existing report bookmarks
function embedInsightsToActionReport() {
    InsightToActionShowcaseState.tooltipNextPressed = false;

    // Load sample report properties into session
    return LoadInsightToActionShowcaseReportIntoSession().then(function () {

        // Get models. models contains enums that can be used
        const models = window['powerbi-client'].models;

        // Get embed application token from session
        let accessToken = GetSession(SessionKeys.AccessToken);

        // Get embed URL from session
        let embedUrl = GetSession(SessionKeys.EmbedUrl);
        
        // Get report Id from session
        let embedReportId = GetSession(SessionKeys.EmbedId);
        
        // Use View permissions
        let permissions = models.Permissions.View;

        // Icon for the custom extension
        const base64Icon = "data:image/png;base64,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"

        // Table visual name
        const tableVisualName = "1149606f2a101953b4ba";

        // Embed configuration used to describe the what and how to embed
        // This object is used when calling powerbi.embed
        // This also includes settings and options such as filters
        // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details
        let config= {
            type: 'report',
            tokenType: models.TokenType.Embed,
            accessToken: accessToken,
            embedUrl: embedUrl,
            id: embedReportId,
            permissions: permissions,
            settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false,

                // Adding the extension command to the options menu
                extensions: [
                    {
                        command: {
                            name: "campaign",
                            title: "Start campaign",
                            icon: base64Icon,
                            selector: {
                                $schema: "http://powerbi.com/product/schema#visualSelector",
                                visualName: tableVisualName
                            },
                            extend: {
                                visualOptionsMenu: {
                                    title: "Start campaign",
                                    menuLocation: models.MenuLocation.Top,
                                }
                            }
                        }
                    },
                ],

                // Hiding built-in commands on the options menu
                commands: [
                    {
                        spotlight: {
                            selector: {
                                visualName: tableVisualName
                            },
                            displayOption: models.CommandDisplayOption.Hidden,
                        },
                        exportData: {
                            selector: {
                                visualName: tableVisualName
                            },
                            displayOption: models.CommandDisplayOption.Hidden,
                        },
                        seeData: {
                            selector: {
                                visualName: tableVisualName
                            },
                            displayOption: models.CommandDisplayOption.Hidden,
                        },
                    }
                ]
            },
        };

        // Get a reference to the embedded report HTML element
        let embedContainer = $('#embedContainer')[0];

        // Embed the report and display it within the div container
        InsightToActionShowcaseState.report = powerbi.embed(embedContainer, config);
        InsightToActionShowcaseState.report.on("rendered", function() {
            setTooltipPosition();
            $('#startTooltip').addClass("showTooltip");

            // Remove event handler, thus, the tooltip will appear only once
            InsightToActionShowcaseState.report.off("rendered");
        });

        // Report.on will add an event handler to commandTriggered event which prints to console window.
        InsightToActionShowcaseState.report.on("commandTriggered", function(event) {
            if (event.detail.command === "campaign") {
                InsightToActionShowcaseState.report.getPages()
                    .then(function (pages) {

                        // Retrieve active page.
                        let activePage = pages.filter(function(page) {
                            return page.isActive
                        })[0];

                        // Get page's visuals
                        activePage.getVisuals()
                            .then(function (visuals) {

                            // Retrieve the wanted visual.
                            let visual = visuals.filter(function(visual) {
                                return visual.name === tableVisualName;
                            })[0];

                            // Exports visual data
                            visual.exportData(models.ExportDataType.Underlying).then(handleExportData);
                            });
                    });
            }
        });
    });
}

// Handles the export data API result
function handleExportData(result) {

    // Parse the recieved data from csv to 2d array
    let resultData = parseData(result.data);

    // Filter the unwanted columns
    InsightToActionShowcaseState.data = filterTable(["Latest purchase - Category", "Total spend", "Days since last purchase"], resultData);

    // Create a table from the 2d array
    let table = createTable(InsightToActionShowcaseState.data)

    // Clear the div
    $("#dialogTable").empty();

    // Add the table to the dialog
    $("#dialogTable").append(table)

    // Hide the tooltip
    $('#startTooltip').removeClass("showTooltip");

    // Show the dialog
    $('#dialogMask').show();
    $('#distributionDialog').show();

    // Shows dialog tooltip after a short delay
    setTimeout(function() {
        $('#dialogTooltip').addClass("showTooltip");
    }, dialogTooltipTimeout);
}

// Parse the data from the API
function parseData(data) {
    let result = [];
    data.split("\n").forEach(function(row) {
        if (row !== "") {
            let rowArray = [];
            row.split(",").forEach(function(cell) {
                rowArray.push(cell);
            });

            result.push(rowArray);
        }
    });

    return result;
}

// Filter the table's data - removing the 'filterValues' columns
function filterTable(filterValues, table) {
    for (let i = 0; i < filterValues.length; i++) {
        valueIndex = table[0].indexOf(
            table[0].filter(function(value) { return value === filterValues[i] })[0]
        );

        for (let j = 0; j < table.length; j++) {
            table[j].splice(valueIndex, 1);
        }
    }

    return table;
}

// Handles tooltip click action
function onTootipClicked(tooltipId) {
    if ( tooltipId === "closeTooltip"){
        $('#startTooltip').hide();
    } else if (!InsightToActionShowcaseState.tooltipNextPressed && tooltipId === "startTooltip") {
        let newText = document.createTextNode("Then, click `Start campaign` menu command.");
        let startTooltipSubText = $('#startTooltip .showcaseTooltipSubText');
        const textOldHeight = startTooltipSubText[0].offsetHeight;
        startTooltipSubText.empty();
        startTooltipSubText.append(newText);
        startTooltipSubText[0].setAttribute("style", "height: " + textOldHeight + "px;");

        let newTooltipNumber = document.createTextNode("2 of 2");
        $('#startTooltip .tooltipNumber').empty();
        $('#startTooltip .tooltipNumber').append(newTooltipNumber);

        let newBtnText = document.createTextNode("Got it");
        $('#startTooltip .btnShowcaseTooltip').empty();
        $('#startTooltip .btnShowcaseTooltip').append(newBtnText);

        InsightToActionShowcaseState.tooltipNextPressed = true;
    } else {
        $('#' + tooltipId).hide();
    }
}

// Closes the dialog
function onCloseDialog(id) {
    $('#dialogTooltip').hide();
    $('#dialogMask').hide();
    $('#' + id).hide();
}

// Open the send coupon/discount dialog
function onSendClicked(name) {
    let headerText = document.createTextNode("Send " + name + " to distribution list");
    $('#sendDialog .dialogHeaderText').empty();
    $('#sendDialog .dialogHeaderText').append(headerText);

    const promotionToSend = name === "coupon" ? "30$ coupon" : "10% discount";
    let bodyText = "Hi <customer name>, get your " + promotionToSend + " today!";
    $('#sendDialog textarea').val(bodyText);

    $('#dialogTooltip').hide();
    $('#distributionDialog').hide();
    $('#sendDialog').show();
}

// Closes the send dialog and shows the 'Sent' message
function onSendDialogSendClicked() {
    $('#sendDialog').hide();
    $('#dialogMask').hide();
    $('#messageSent').addClass("show");

    setTimeout(function() {
        $('#messageSent').removeClass("show");
    }, sentMessageTimeout);
}

// Build the HTML table from the data
function createTable(tableData) {
    let table = document.createElement('table');
    let tableBody = document.createElement('tbody');
    let rowIndex = 0;

    // Set all checked to true, for check all table button
    InsightToActionShowcaseState.allChecked = true;

    tableData.forEach(function(rowData) {
        let row = document.createElement('tr');

        // Add ✓ or checkbox
        if (rowIndex === 0) {
            let cell = document.createElement('th');
            cell.setAttribute("onclick","onCheckAllClicked();");
            cell.setAttribute("class", "checkAllBtn");
            cell.appendChild(document.createTextNode('✓'));
            row.appendChild(cell);
        } else {
            let cell = document.createElement('td');
            let checkboxElement = document.createElement("input");
            checkboxElement.setAttribute("type", "checkbox");
            checkboxElement.setAttribute("name", "tableRowCheckbox");
            checkboxElement.setAttribute("id", "row" + rowIndex);
            checkboxElement.checked = true;
            cell.appendChild(checkboxElement);
            row.appendChild(cell);
        }

        let isNameCell = true;
        rowData.forEach(function(cellData) {
            let cell;
            if (rowIndex !== 0) {
                cell = document.createElement('td');
                if (isNameCell) {
                    cell.setAttribute("class", "nameCell");
                    isNameCell = false;
                }
            } else {
                cell = document.createElement('th');
            }

            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
        rowIndex++;
    });

    table.appendChild(tableBody);

    return table;
}

// Check/Uncheck all the customers on the table
function onCheckAllClicked() {
    let checkboxes = document.getElementsByName("tableRowCheckbox");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = !InsightToActionShowcaseState.allChecked;
    }

    InsightToActionShowcaseState.allChecked = !InsightToActionShowcaseState.allChecked;
}

// Calculate and set the tooltip position
function setTooltipPosition() {
    let startTooltip = document.getElementById("startTooltip");
    let embedContainer = document.getElementById('embedContainer');
    let textHeight = document.getElementById('showcases-text').offsetHeight;
    let containerHeight = embedContainer.offsetWidth * 0.56;

    // Calculate the tooltip position relatively
    const top = textHeight + 64 + ((embedContainer.offsetHeight - containerHeight) / 2) - startTooltip.offsetHeight + (0.05 * embedContainer.offsetHeight);
    const left = (embedContainer.offsetWidth - 10) * 0.971 - 125;
    startTooltip.setAttribute("style", "top: " + top + "px; left: " + left + "px;");
}