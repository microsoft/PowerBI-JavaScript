

let ThemesShowcaseState = {
    themesArray: null,
    themesReport: null,
    dataColorSize: 16,
    backgroundSize: 16,
};

// For report themes documentation please check https://docs.microsoft.com/en-us/power-bi/desktop-report-themes
const jsonThemes = [
    { 
        "name": "Apothecary", 
        "dataColors": ["#93A299", "#CF543F", "#B5AE53", "#848058", "#E8B54D", "#786C71", "#93A2A0", "#CF9A3F", "#8CB553", "#728458", "#D0E84D", "#786D6C"],
        "background":"#FFFFFF",
        "foreground": "#CF543F",
        "tableAccent": "#93A299"
    },
    { 
        "name": "Colorblind Safe", 
        "dataColors": ["#074650", "#009292", "#fe6db6", "#feb5da", "#480091", "#b66dff", "#b5dafe", "#6db6ff", "#914800", "#23fd23"],
        "background":"#FFFFFF",
        "foreground": "#074650",
        "tableAccent": "#fe6db6"
    },
    {
        "name": "Valentine's Day",
        "dataColors": ["#990011", "#cc1144", "#ee7799", "#eebbcc", "#cc4477", "#cc5555", "#882222", "#A30E33"],
        "background":"#FFFFFF",
        "foreground": "#ee7799",
        "tableAccent": "#990011"
    },
    { 
        "name": "Waveform", 
        "dataColors": ["#31B6FD", "#4584D3", "#5BD078", "#A5D028", "#F5C040", "#05E0DB", "#3153FD", "#4C45D3", "#5BD0B0", "#54D028", "#D0F540", "#057BE0"],
        "background":"#FFFFFF",
        "foreground": "#4584D3",
        "tableAccent": "#31B6FD"
    },
];

const backgrounds = [
    {
        "background": "#FFFFFF",
    },
    {
        "background": "#323130",
        "foreground": "#FFFFFF",
        "tableAccent": "#FFFFFF",
        "visualStyles": {
            "*":{
                "*":{
                    "*":[{
                            "fontFamily":"Segoe UI",
                            "color":{"solid":{"color":"#323130"}},
                            "labelColor":{"solid":{"color":"#FFFFFF"}},
                            "titleColor":{"solid":{"color":"#FFFFFF"}},
                        }],
                        "labels":[{
                            "color":{"solid":{"color":"#FFFFFF"}}
                        }],
                        "categoryLabels":[{
                            "color":{"solid":{"color":"#FFFFFF"}}
                        }]
                    }
                }
            }
    }
]

// Embed the report
function embedThemesReport() {

    // Load sample report properties into session
    return LoadThemesShowcaseReportIntoSession().then(function () {

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
            },

            // Adding theme attribute to the config, will apply the theme on load
            theme: {themeJson: jsonThemes[0]},
        };

        // Get a reference to the embedded report HTML element
        let embedContainer = $('#embedContainer')[0];

        // Embed the report and display it within the div container
        ThemesShowcaseState.themesReport = powerbi.embed(embedContainer, config);

        // Report.on will add an event handler for report loaded event
        ThemesShowcaseState.themesReport.on("loaded", function() {
            let themesList = $('#themesList');

            // Set the first theme on the list as active
            themesList.find("#theme0").attr('checked', true);

            // Displaying the themes list and the backgrounds list
            themesList.show();
            $('#backgroundsList').show();
            $('#background0', '#backgroundsList').addClass("selected");
        });
    });
}

// Apply clicked theme and set it as the active theme on the list
function onThemeClicked(element) {

    // Set the clicked theme as active
    $(element).attr('checked', true);

    applyTheme();
}

// Apply clicked background and set it as the active background on the list
function setThemeBackgroundActive(id) {

    // Set the clicked background as active
    $('.themeBackgroundColor').removeClass("selected");
    $('#background' + id, '#backgroundsList').addClass("selected");

    applyTheme();
}

function applyTheme() {
    // Get active theme id
    activeThemeId = Number($('input[name=theme]:checked', '#themesList')[0].getAttribute("id").slice(-1));
    activeBackgroundId = Number($('.selected', '#backgroundsList')[0].getAttribute("id").slice(-1));
    theme = {}
    $.extend(theme, jsonThemes[activeThemeId], backgrounds[activeBackgroundId]);

    // Apply the theme
    let report = ThemesShowcaseState.themesReport;
    report.applyTheme({themeJson: theme});
}

// Create a themes list
function createThemesList() {

    // Build the themes list HTML code
    let themesList = $('#themesList');

    // Hide the div until the report loads
    themesList.hide();

    // Building the themes list
    for (let i = 0; i < jsonThemes.length; i++) {
        themesList.append(buildThemeElement(i));
    }
}

// Create a backgrounds list
function createBackgroundsList() {

    // Build the backgrounds list HTML code
    let backgroundsList = $('#backgroundsList');

    // Hide the div until the report loads
    backgroundsList.hide();

    // Building the themes list
    for (let i = 0; i < backgrounds.length; i++) {
        backgroundsList.append(buildBackgroundElement(i));
    }
}

// Build theme radio button HTML element
function buildThemeElement(id) {
    let labelElement = document.createElement("label");
    labelElement.setAttribute("class", "showcaseRadioContainer themesRadioContainer");

    let inputElement = document.createElement("input");
    inputElement.setAttribute("type", "radio");
    inputElement.setAttribute("name", "theme");
    inputElement.setAttribute("id", 'theme' + id);
    inputElement.setAttribute("onclick", "onThemeClicked(this);");
    labelElement.appendChild(inputElement);

    let spanElement = document.createElement("span");
    spanElement.setAttribute("class", "showcaseRadioCheckmark");
    labelElement.appendChild(spanElement);

    let secondSpanElement = document.createElement("span");
    secondSpanElement.setAttribute("class", "radioTitle");
    let radioTitleElement = document.createTextNode(jsonThemes[id].name);
    secondSpanElement.appendChild(radioTitleElement);
    labelElement.appendChild(secondSpanElement);

    let colorsDivElement = document.createElement("div");
    colorsDivElement.setAttribute("class","themeColors");

    // Calculate the max width for displaying data colors
    const maxWidth = document.getElementById('themesDataColorsWrapper').offsetWidth - 48 /*padding*/;
    const dataColors = jsonThemes[id].dataColors;
    const singleDataColorWidth = ThemesShowcaseState.dataColorSize + 3 /*margin*/;
    let currentWidth = 0;
    for (let i = 0; i < dataColors.length; i++) {

        // Verify that the data colors will not overflow
        if (currentWidth + singleDataColorWidth > maxWidth)
            break;

        let dataColorElement = document.createElement("img");
        let url = "https://placehold.it/" + ThemesShowcaseState.dataColorSize + "/" + dataColors[i].substr(1) + "/000000?text=+";
        dataColorElement.setAttribute("src", url);
        dataColorElement.setAttribute("class", "themeDataColor");
        colorsDivElement.appendChild(dataColorElement);
        currentWidth += singleDataColorWidth;
    }

    labelElement.appendChild(colorsDivElement);

    return labelElement;
}

// Build background HTML element
function buildBackgroundElement(id) {
    let backgroundElement = document.createElement("img");
    let url = "https://placehold.it/" + ThemesShowcaseState.backgroundSize + "/" + backgrounds[id].background.substr(1) + "/000000?text=+";
    backgroundElement.setAttribute("src", url);
    backgroundElement.setAttribute("class", "themeBackgroundColor");
    backgroundElement.setAttribute("id", 'background' + id);
    backgroundElement.setAttribute("onclick", "setThemeBackgroundActive(" + id + ");");
    return backgroundElement;
}
