let VisualCreatorShowcaseState = {
    report: null,
    page: null,
    visual: null,
    visualType: null,
    dataRoles: {
        Legend: null,
        Values: null,
        Value: null,
        Axis: null,
        Tooltips: null,
        'Y Axis': null,
        Category: null,
        Breakdown: null,
    },
    dataFieldsCount: 0,
    properties: {
        legend: true,
        xAxis: true,
        yAxis: true,
        title: true,
        titleText: null,
        titleAlign: null
    },
}

// Define the available data roles for the visual types
const visualTypeToDataRoles = [
    { name: 'pieChart', displayName: 'Pie chart', dataRoles: ['Legend', 'Values', 'Tooltips'] },
    { name: 'columnChart', displayName: 'Column chart', dataRoles: ['Axis', 'Values', 'Tooltips'] },
    { name: 'areaChart', displayName: 'Area chart', dataRoles: ['Axis', 'Legend', 'Values'] },
    { name: 'waterfallChart', displayName: 'Waterfall Chart', dataRoles: ['Category', 'Breakdown', 'Values'] },
];

// Define the available fields for each data role
const dataRolesToFields = [
    { dataRole: 'Legend', Fields: ['State', 'Region', 'Manufacturer'] },
    { dataRole: 'Values', Fields: ['Total Units', 'Total Category Volume', 'Total Compete Volume'] },
    { dataRole: 'Axis', Fields: ['State', 'Region', 'Manufacturer'] },
    { dataRole: 'Value', Fields: ['Total Units', 'Total Category Volume', 'Total Compete Volume'] },
    { dataRole: 'Y Axis', Fields: ['Total Units', 'Total Category Volume', 'Total Compete Volume'] },
    { dataRole: 'Tooltips', Fields: ['Total Units', 'Total Category Volume', 'Total Compete Volume'] },
    { dataRole: 'Category', Fields: ['State', 'Region', 'Date'] },
    { dataRole: 'Breakdown', Fields: ['State', 'Region', 'Manufacturer'] },
];

// Define schemas for visuals API
const schemas = {
    column: 'http://powerbi.com/product/schema#column',
    measure: 'http://powerbi.com/product/schema#measure',
    property: 'http://powerbi.com/product/schema#property',
};

// Define mapping from fields to target table and column/measure
const dataFieldsTargets = {
    State: { column: 'State', table: 'Geo', schema: schemas.column },
    Region: { column: 'Region', table: 'Geo', schema: schemas.column },
    District: { column: 'District', table: 'Geo', schema: schemas.column },
    Manufacturer: { column: 'Manufacturer', table: 'Manufacturer', schema: schemas.column },
    TotalUnits: { measure: 'Total Units', table: 'SalesFact', schema: schemas.measure },
    TotalCategoryVolume: { measure: 'Total Category Volume', table: 'SalesFact', schema: schemas.measure },
    TotalCompeteVolume: { measure: 'Total Compete Volume', table: 'SalesFact', schema: schemas.measure },
    Date: { measure: 'Date', table: 'Date', schema: schemas.measure },
};

// Define the available 
const showcaseProperties = ['legend', 'xAxis', 'yAxis'];
const visualTypeProperties = {
    pieChart: ['legend'],
    columnChart: ['xAxis', 'yAxis'],
    areaChart: ['legend', 'xAxis', 'yAxis'],
    waterfallChart: ['legend', 'xAxis', 'yAxis'],
};

const disabledClass = "generator-disabled";

// Embed the report
function embedQuickVisualCreatorReport() {

    // Load sample report properties into session
    return LoadQuickVisualCreatorShowcaseReportIntoSession().then(function () {

        // Starting spinner animation
        $("#spinner").show();

        // Get models. models contains enums that can be used
        let models = window['powerbi-client'].models;

        // Get embed application token from session
        let accessToken = GetSession(SessionKeys.AccessToken);

        // Get embed URL from session
        let embedUrl = GetSession(SessionKeys.EmbedUrl);

        // Get report Id from session
        let embedReportId = GetSession(SessionKeys.EmbedId);

        // Use View permissions
        let permissions = models.Permissions.View;

        // Embed configuration used to describe the what and how to embed
        // This object is used when calling powerbi.embed
        // This also includes settings and options such as filters
        // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details
        let config = {
            type: 'report',
            tokenType: models.TokenType.Embed,
            accessToken: accessToken,
            embedUrl: embedUrl,
            id: embedReportId,
            permissions: permissions,
            settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false,
                layoutType: models.LayoutType.Custom,
                customLayout: {
                    pageSize: {
                        type: models.PageSizeType.Custom,
                        width: $('#embedContainer').width(),
                        height: $('#embedContainer').height()
                    },
                    displayOption: models.DisplayOption.ActualSize,
                }
            }
        };

        // Get a reference to the embedded report HTML element
        let embedContainer = $('#embedContainer')[0];

        // Embed the report and display it within the div container
        VisualCreatorShowcaseState.report = powerbi.embed(embedContainer, config);

        // Report.on will add an event handler for report rendered event
        VisualCreatorShowcaseState.report.on("rendered", function () {

            // Setting the first page as active
            VisualCreatorShowcaseState.report.getPages().then(function (pages) {
                pages[0].setActive();
                VisualCreatorShowcaseState.page = pages[0];
            });

            // Update html available visual types
            updateAvailableVisualTypes();

            // Enable choosing visual type
            $("#generator-type").removeClass(disabledClass);

            // Hiding the spinner animation
            $("#spinner").hide();

            // Covering the embeded view with instruction text
            $("#overlay-embed-container").addClass("overlay-text")
            $('#overlay-embed-container').text('Start by choosing the visual type');
            $("#overlay-embed-container").show();

            // Remove the event listener, thus, it will only be called once
            VisualCreatorShowcaseState.report.off("rendered");
        });
    });
}

// Initialize the custom dropdowns
function initializeDropdowns() {
    let x, i, j, selElmnt, a, b, c;

    // Look for any elements with the class "styled-select"
    x = document.getElementsByClassName("styled-select");
    for (i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];

        // For each element, create a new DIV that will act as the selected item
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.setAttribute("id", "selected-value-" + i);
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);

        // For each element, create a new DIV that will contain the option list
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < selElmnt.length; j++) {

            // For each option in the original select element,
            // create a new DIV that will act as an option item
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;

            // Adding new click event listener
            c.addEventListener("click", function (e) {

                // When an item is clicked, update the original select box, and the selected item
                let y, i, k, s, h;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                h = this.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        for (k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }

                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }

                h.click();

                // Changing the visual type or updating the data role field, according to the dropdown id
                if (s.id == 'visual-type') {
                    changeVisualType(h.innerHTML);
                } else {
                    updateDataRoleField(s.parentNode.parentNode.children[0].id, h.innerHTML);
                }
            });

            b.appendChild(c);
        }

        x[i].appendChild(b);

        // Adding new click event listener for the select box
        a.addEventListener("click", function (e) {
            // When the select box is clicked, close any other select boxes,
            // and open/close the current select box
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
}

// Close all select boxes in the document, except the current select box
function closeAllSelect(elmnt) {

    let x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }

    for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

// Changing the visual type
function changeVisualType(visualTypeDisplayName) {
    // Get the visual type from the display name
    let visualTypeData = visualTypeToDataRoles.filter((function (e) { return e.displayName === visualTypeDisplayName }))[0];
    let visualTypeName = visualTypeData.name;

    // Retrieve the visual's capabilities
    VisualCreatorShowcaseState.report.getVisualCapabilities(visualTypeName).then(function (capabilities) {

        // Validating data roles existence on the given visual type
        if (!validateDataRoles(capabilities, visualTypeData.dataRoles)) {
            resetVisualGenerator();
            handleInvalidDataRoles();
            return;
        }

        // Enable the fields section
        $('#generator-fields').removeClass(disabledClass);

        // Disable the properties section, and reset all properties
        $('#generator-properties').addClass(disabledClass);
        resetGeneratorProperties();

        // Update the overlay text
        $('#overlay-embed-container').text('Use the dropdown menus to choose data fields');
        $('#overlay-embed-container').show();

        // Reset the data fields count
        VisualCreatorShowcaseState.dataFieldsCount = 0;

        // If the visual doesn't exist, create new visual, otherwise, delete the old visual and create new visual
        if (!VisualCreatorShowcaseState.visual) {
            VisualCreatorShowcaseState.page.createVisual(visualTypeName, getVisualLayout()).then(function () {
                updateShowCaseVisType(visualTypeName, visualTypeData.dataRoles);
            });
        }
        else if (visualTypeName != VisualCreatorShowcaseState.visualType) {
            VisualCreatorShowcaseState.page.deleteVisual(VisualCreatorShowcaseState.visual.name).then(function () {
                VisualCreatorShowcaseState.page.createVisual(visualTypeName, getVisualLayout()).then(function () {
                    updateShowCaseVisType(visualTypeName, visualTypeData.dataRoles);
                });
            });
        }
    });
}

// Update showcase after visual type change
function updateShowCaseVisType(visualTypeName, dataRoles) {
    updateCurrentVisualState(visualTypeName);
    resetGeneratorDataRoles();
    updateAvailableDataRoles(dataRoles);
    updateDropdownsVisibility();
}

// Update the visual state
function updateCurrentVisualState(visualTypeName) {
    VisualCreatorShowcaseState.page.getVisuals().then(function (visuals) {
        // Update visual and visual type
        VisualCreatorShowcaseState.visual = visuals[0]
        VisualCreatorShowcaseState.visualType = visualTypeName;

        // Enabling the pie chart legend (disabled by default)
        if (visualTypeName === "pieChart") {
            VisualCreatorShowcaseState.visual.setProperty(propertyToSelector('legend'), { schema: schemas.property, value: true });
        }

        // Formatting the title to be more accessible
        VisualCreatorShowcaseState.visual.setProperty(propertyToSelector('titleSize'), { schema: schemas.property, value: 14 });
        VisualCreatorShowcaseState.visual.setProperty(propertyToSelector('titleColor'), { schema: schemas.property, value: '#000000' });

        // Disabling unavailable properties for specific visual types
        $('.toggle-wrapper').removeClass("disabled");
        for (let i = 0; i < showcaseProperties.length; i++) {
            if (visualTypeProperties[visualTypeName].indexOf(showcaseProperties[i]) < 0) {
                $('#' + showcaseProperties[i] + '.toggle-wrapper').addClass("disabled");
            }
        }
    });
}

// Update the data roles and the data roles fields, on the dropdown menus
function updateAvailableDataRoles(dataRoles) {
    let dataRolesNamesElements = document.querySelectorAll('.inline-select-text');
    for (let i = 0; i < dataRoles.length; i++) {
        dataRolesNamesElements[i].innerHTML = dataRoles[i] + ':';
        dataRolesNamesElements[i].id = dataRoles[i];

        let dataFields = dataRolesToFields.filter(function (e) { return e.dataRole === dataRoles[i] })[0].Fields;
        updateAvailableDataFields(dataRolesNamesElements[i].parentElement, dataFields);
    }
}

// Update the data fields on the dropdown menus
function updateAvailableDataFields(dataRoleElement, dataFields) {
    let fieldDivElements = dataRoleElement.querySelector('.select-items').children;
    let fieldOptionElements = dataRoleElement.querySelectorAll('option');
    for (let i = 0; i < dataFields.length; i++) {
        fieldDivElements[i].innerHTML = dataFields[i];
        fieldOptionElements[i + 1].innerHTML = dataFields[i];
    }
}

// Update html visual types
function updateAvailableVisualTypes() {
    let typesDivElements = $('.select-items')[0].children;
    let typesOptionElements = $('#visual-type')[0].children;
    for (let i = 0; i < visualTypeToDataRoles.length; i++) {
        typesDivElements[i].innerHTML = visualTypeToDataRoles[i].displayName;
        typesOptionElements[i + 1].innerHTML = visualTypeToDataRoles[i].displayName;
    }
}

// Print the report
function printVisual() {
    if (!VisualCreatorShowcaseState.visual)
        return;
    VisualCreatorShowcaseState.report.print();
}

// Update data roles field on the visual
function updateDataRoleField(dataRole, field) {

    // Check if the requested field is not the same as the selected field
    if (field != VisualCreatorShowcaseState.dataRoles[dataRole]) {

        // Getting the visual capabilites
        VisualCreatorShowcaseState.visual.getCapabilities().then(function (capabilities) {

            // Getting the data role name
            let dataRoleName = capabilities.dataRoles.filter(function (dr) { return dr.displayName === dataRole })[0].name;

            // Remove whitespaces from field
            let dataFieldKey = field.replace(/\s+/g, '');

            // Check if the data role already has a field
            if (VisualCreatorShowcaseState.dataRoles[dataRole]) {

                // If the data role has a field, remove it
                VisualCreatorShowcaseState.visual.removeDataField(dataRoleName, 0).then(function (res) {
                    VisualCreatorShowcaseState.dataFieldsCount--;

                    // If there are no more data fields, recreating the visual before adding the data field
                    if (VisualCreatorShowcaseState.dataFieldsCount === 0) {
                        VisualCreatorShowcaseState.page.createVisual(VisualCreatorShowcaseState.visualType, getVisualLayout()).then(function () {
                            VisualCreatorShowcaseState.page.getVisuals().then(function (visuals) {
                                VisualCreatorShowcaseState.visual = visuals[0];
                                VisualCreatorShowcaseState.dataFieldsCount++;
                                VisualCreatorShowcaseState.visual.addDataField(dataRoleName, dataFieldsTargets[dataFieldKey]).then(function () { disableSelectedDataFields(dataRole, field); });
                            });
                        });
                    } else {
                        VisualCreatorShowcaseState.dataFieldsCount++;
                        VisualCreatorShowcaseState.visual.addDataField(dataRoleName, dataFieldsTargets[dataFieldKey]).then(function () { disableSelectedDataFields(dataRole, field); });
                    }
                });
            } else {

                // Adding a new field
                VisualCreatorShowcaseState.visual.addDataField(dataRoleName, dataFieldsTargets[dataFieldKey]).then(function () {
                    disableSelectedDataFields(dataRole, field);
                    VisualCreatorShowcaseState.dataFieldsCount++;

                    // Showing the visual if there are 2 or more data fields
                    if (VisualCreatorShowcaseState.dataFieldsCount > 1) {
                        $("#overlay-embed-container").hide();
                        $('#generator-properties').removeClass(disabledClass);
                    }
                });
            }
        });
    }
}

// Hiding the selected data field from the dropdown
function disableSelectedDataFields(dataRole, field) {
    VisualCreatorShowcaseState.dataRoles[dataRole] = field;
    updateDropdownsVisibility();
}

// Update the visibility of the dropdowns
function updateDropdownsVisibility() {
    $('.select-items div').show();

    let selected = $('.select-selected');
    selected.each(function () {
        let selectedValue = $(this).text();
        $('.select-items div:contains(' + selectedValue + ')').hide();
    });
}

// Return the visual layout
function getVisualLayout() {
    // Get models. models contains enums that can be used
    let models = window['powerbi-client'].models;

    return {
        width: 0.9 * $('#embedContainer').width(),
        height: 0.85 * $('#embedContainer').height(),
        x: (0.1 * $('#embedContainer').width()) / 2,
        y: (0.1 * $('#embedContainer').height()) / 2,
        displayState: {
            // Change the selected visuals display mode to visible
            mode: models.VisualContainerDisplayMode.Visible
        }
    };
}

// Toggle a property value
function toggleProperty(propertyName) {
    if (!VisualCreatorShowcaseState.visual)
        return;

    let newValue = $('#' + propertyName + '-toggle')[0].checked;
    VisualCreatorShowcaseState.properties[propertyName] = newValue;

    // Setting the property on the visual
    VisualCreatorShowcaseState.visual.setProperty(propertyToSelector(propertyName), { schema: schemas.property, value: newValue });
}

// Update the title alignment
function onAlignClicked(direction) {
    if (!VisualCreatorShowcaseState.visual)
        return;

    $(".alignment-block").removeClass("selected");
    $("#align-" + direction).addClass("selected");
    VisualCreatorShowcaseState.properties['titleAlign'] = direction;

    // Setting the property on the visual
    VisualCreatorShowcaseState.visual.setProperty(propertyToSelector('titleAlign'), { schema: schemas.property, value: direction });
}

// Convert property name to selector
function propertyToSelector(propertyName) {
    switch (propertyName) {
        case 'title':
            return { objectName: "title", propertyName: "visible" };
        case 'xAxis':
            return { objectName: "categoryAxis", propertyName: "visible" };
        case 'yAxis':
            return { objectName: "valueAxis", propertyName: "visible" };
        case 'legend':
            return { objectName: "legend", propertyName: "visible" };
        case 'titleText':
            return { objectName: "title", propertyName: "titleText" };
        case 'titleAlign':
            return { objectName: "title", propertyName: "alignment" };
        case 'titleSize':
            return { objectName: "title", propertyName: "textSize" };
        case 'titleColor':
            return { objectName: "title", propertyName: "fontColor" };
    }
}

// Handles erase tool click
function onEraseToolClicked() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    document.getElementById("ptitle").value = "";

    // Reseting the title text to auto generated
    VisualCreatorShowcaseState.visual.resetProperty(propertyToSelector('titleText'));
}

// Update the title's text
function updateTitleText() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    let text = document.getElementById("ptitle").value;

    // If the title is blank, reseting the title to auto generated
    if (text === "") {
        onEraseToolClicked();
        return;
    }

    VisualCreatorShowcaseState.visual.setProperty(propertyToSelector('titleText'), { schema: schemas.property, value: text });
}

// Reset the data roles section
function resetGeneratorDataRoles() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    VisualCreatorShowcaseState.dataRoles = {
        Legend: null,
        Values: null,
        Value: null,
        Axis: null,
        Tooltips: null,
        'Y Axis': null,
        Category: null,
        Breakdown: null,
    };

    VisualCreatorShowcaseState.dataFieldsCount = 0;

    let nodesToReset = $('.select-selected').slice(1); //all dropdowns except of visual type selection 
    for (let i = 0; i < nodesToReset.length; i++) {
        nodesToReset[i].innerHTML = 'Select an option';
    }

    $('.field ~ .select-items').children().show();
    $('.field ~ .select-items').children().removeClass('same-as-selected');
}

// Reset the current visual
function resetGeneratorVisual() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    VisualCreatorShowcaseState.page.deleteVisual(VisualCreatorShowcaseState.visual.name);
    VisualCreatorShowcaseState.visual = null;
    VisualCreatorShowcaseState.visualType = null;
    $('.select-selected')[0].innerHTML = 'Select an option';
    $('#visual-type ~ .select-items > .same-as-selected').show();
    $('#visual-type ~ .select-items > .same-as-selected')[0].removeAttribute('class');
}

// Reset the properties section
function resetGeneratorProperties() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    VisualCreatorShowcaseState.properties = {
        legend: true,
        xAxis: true,
        yAxis: true,
        title: true,
        titleText: null,
        titleAlign: null
    };

    for (let i = 0; i < 4; i++) {
        $('input[type="checkbox"]')[i].checked = true;
    }

    $(".alignment-block").removeClass("selected");
    $("#align-left").addClass("selected");

    document.getElementById("ptitle").value = "";
}

// Reset the visual generator (data roles, properties and visual)
function resetVisualGenerator() {
    if (!VisualCreatorShowcaseState.visual)
        return;

    $('#generator-fields').addClass(disabledClass);
    $('#generator-properties').addClass(disabledClass);

    $('#overlay-embed-container').text('Start by choosing the visual type');
    $("#overlay-embed-container").show();

    resetGeneratorDataRoles();
    resetGeneratorProperties();
    resetGeneratorVisual();
}

// Validate the existance of each dataRole on the visual's capabilities
function validateDataRoles(capabilities, dataRolesDisplayNames) {
    for (let i = 0; i < dataRolesDisplayNames.length; i++) {

        // Filter the corrsponding dataRole in the visual's capabilities dataRoles
        if (capabilities.dataRoles.filter(function (dr) { return dr.displayName === dataRolesDisplayNames[i] }).length === 0) {
            return false;
        }
    }

    return true;
}

// Show an error message on dataRoles validation failure
function handleInvalidDataRoles() {

    // Update the overlay text
    $('#overlay-embed-container').text("Failed to validate the visual's dataRoles. Please select a different visual type to continue.");
    $('#overlay-embed-container').show();
}

