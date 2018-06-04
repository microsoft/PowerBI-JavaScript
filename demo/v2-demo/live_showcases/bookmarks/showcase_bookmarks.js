

var BookmarkShowcaseState = {
    bookmarksArray: null,
    bookmarksReport: null,

    // Next bookmark ID counter
    nextBookmarkId: 1
}

function embedBookmarksReport() {

    // Load sample report properties into session
    return LoadSampleReportIntoSession().then(function () {

        // Get models. models contains enums that can be used
        const models = window['powerbi-client'].models;

        // Get embed application token from session
        var accessToken = GetSession(SessionKeys.AccessToken);

        // Get embed URL from session
        var embedUrl = GetSession(SessionKeys.EmbedUrl);

        // Get report Id from session
        var embedReportId = GetSession(SessionKeys.EmbedId);

        // We give the user View permissions
        var permissions = models.Permissions.View;

        // Embed configuration used to describe the what and how to embed
        // This object is used when calling powerbi.embed
        // This also includes settings and options such as filters
        // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details
        var config= {
            type: 'report',
            tokenType: models.TokenType.Embed,
            accessToken: accessToken,
            embedUrl: embedUrl,
            id: embedReportId,
            permissions: permissions,
            settings: {
                filterPaneEnabled: true,
                navContentPaneEnabled: false,
                background: models.BackgroundType.Transparent
            }
        };

        // Get a reference to the embedded report HTML element
        var embedContainer = $('#embedContainer')[0];

        // Embed the report and display it within the div container
        BookmarkShowcaseState.bookmarksReport = powerbi.embed(embedContainer, config);

        // Report.on will add an event handler for report loaded event.
        BookmarkShowcaseState.bookmarksReport.on("loaded", function() {

            // Get report's existing bookmarks
            BookmarkShowcaseState.bookmarksReport.bookmarksManager.getBookmarks().then(function (bookmarks) {

                // Create bookmarks list from the existing report bookmarks
                createBookmarksList(bookmarks);
            });
        });
    });
}

// Embed shared report with bookmark on load
function embedSharedBookmark(enableFilterPane, bookmarkState) {

    // Load sample report properties into session
    LoadSampleReportIntoSession().then(function () {

        // Get models. models contains enums that can be used
        const models = window['powerbi-client'].models;

        // Get embed application token from session
        var accessToken = GetSession(SessionKeys.AccessToken);

        // Get embed URL from session
        var embedUrl = GetSession(SessionKeys.EmbedUrl);

        // Get report Id from session
        var embedReportId = GetSession(SessionKeys.EmbedId);

        // We give the user View permissions
        var permissions = models.Permissions.View;

        // Get the bookmark state from url param
        var bookmarkState = GetBookmarkStateFromURL();

        // Embed configuration used to describe the what and how to embed
        // This object is used when calling powerbi.embed
        // This also includes settings and options such as filters
        // You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details
        var config= {
            type: 'report',
            tokenType: models.TokenType.Embed,
            accessToken: accessToken,
            embedUrl: embedUrl,
            id: embedReportId,
            permissions: permissions,
            settings: {
                filterPaneEnabled: false,
                navContentPaneEnabled: false,
                background: models.BackgroundType.Transparent
            },

            // Adding bookmark attribute will apply the bookmark on load
            bookmark: {
                state: bookmarkState
            }
        };

        // Get a reference to the embedded report HTML element
        var embedContainer = $('#embedContainer')[0];

        // Embed the report and display it within the div container
        BookmarkShowcaseState.bookmarksReport = powerbi.embed(embedContainer, config);
    });
}

// Create a bookmarks list from the existing report bookmarks and update the HTML
function createBookmarksList(bookmarks) {

    // Reset next bookmark ID
    BookmarkShowcaseState.nextBookmarkId = 1;

    // Set bookmarks array to the report's fetched bookmarks
    BookmarkShowcaseState.bookmarksArray = bookmarks;

    // Build the bookmarks list HTML code
    var bookmarksList = $('#bookmarksList');
    for (let bookmark of BookmarkShowcaseState.bookmarksArray) {
        bookmarksList.append(buildBookmarkElement(bookmark));
    }
}

function onBookmarkCaptureClicked() {

    // Element clicked animation
    elementClicked('#btnCaptureBookmark');

    // Capture the report's current state
    BookmarkShowcaseState.bookmarksReport.bookmarksManager.capture().then(function (capturedBookmark) {

        // Build bookmark element
        let bookmark = {
            name: "bookmark_" + BookmarkShowcaseState.nextBookmarkId,
            displayName: "Bookmark " + BookmarkShowcaseState.nextBookmarkId,
            state: capturedBookmark.state
        }

        // Add and set the captured bookmark as active
        setCapturedBookmarkActive(bookmark);

        // Add the bookmark to the bookmarks array and increase the bookmarks number counter
        BookmarkShowcaseState.bookmarksArray.push(bookmark);
        BookmarkShowcaseState.nextBookmarkId++;
    });
}

function setCapturedBookmarkActive(bookmark) {
    // Add the new bookmark to the HTML list
    $('#bookmarksList').append(buildBookmarkElement(bookmark));

    // Remove share boomark icon
    $('#bookmarkShare').remove();

    // Find bookmark parent node
    let parentNode = ($('#bookmark_' + BookmarkShowcaseState.nextBookmarkId)[0]).parentNode;

    // Add share bookmark icon to bookmark's line
    $(parentNode).append(buildShareElement());

    // Set bookmark radio button to checked
    $('#bookmark_' + BookmarkShowcaseState.nextBookmarkId).attr('checked', true);
}

function onCloseDialogClicked() {

    // Close the dialog
    $('#overlay').hide();
    $('#shareDialog').hide();
}

function onDialogCopyClicked() {

    // Copy the input text
    CopyTextArea('#dialogInput', '#btnDialogCopy')
}

function onBookmarkClicked(element) {

    // Remove share boomark icon
    $('#bookmarkShare').remove();

    // Add share bookmark icon to bookmark's line
    $(element.parentNode).append(buildShareElement());

    // Get bookmark Id from HTML
    const bookmarkId = $(element).attr('id');

    // Find the bookmark in the bookmarks array
    let currentBookmark = BookmarkShowcaseState.bookmarksArray.find(bookmark => { return bookmark.name === bookmarkId });

    // Apply the bookmark state
    BookmarkShowcaseState.bookmarksReport.bookmarksManager.applyState(currentBookmark.state);
}

// Open bookmark share dialog
function shareBookmark(element) {

    // Get bookmark Id from HTML
    const bookmarkId = $($(element).siblings('input')).attr('id');

    // Find the bookmark in the bookmarks array
    let currentBookmark = BookmarkShowcaseState.bookmarksArray.find(bookmark => { return bookmark.name === bookmarkId });

    // Build the share bookmark URL
    let shareUrl = location.href.substring(0, location.href.lastIndexOf("/")) + '/shareBookmark.html' + '?state=' + currentBookmark.state;

    // Set bookmark display name and share URL on dialog HTML code
    var displayNameElement = document.createTextNode(currentBookmark.displayName);
    $('#dialogBookmarkName').append(displayNameElement);
    $('#dialogInput').val(shareUrl);

    // Show overlay and share dialog
    $('#overlay').show();
    $('#shareDialog').show();
}

// Build bookmark radio button HTML element
function buildBookmarkElement(bookmark) {

    var labelElement = document.createElement("label");
    labelElement.setAttribute("class", "bookmarkContainer");

    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "radio");
    inputElement.setAttribute("name", "bookmark");
    inputElement.setAttribute("id", bookmark.name);
    inputElement.setAttribute("onclick", "onBookmarkClicked(this);");
    labelElement.appendChild(inputElement);

    var spanElement = document.createElement("span");
    spanElement.setAttribute("class", "bookmarkCheckmark");
    labelElement.appendChild(spanElement);

    var secondSpanElement = document.createElement("span");
    secondSpanElement.setAttribute("class", "radioTitle");
    var radioTitleElement = document.createTextNode(bookmark.displayName);
    secondSpanElement.appendChild(radioTitleElement);
    labelElement.appendChild(secondSpanElement);

    return labelElement;
}

// Build share icon HTML element
function buildShareElement() {
    var imgElement = document.createElement("img");
    imgElement.setAttribute("src","images/share.png");
    imgElement.setAttribute("id","bookmarkShare");
    imgElement.setAttribute("onclick","shareBookmark(this);");
    return imgElement;
}

// Get the bookmark state from url 'state' argument
function GetBookmarkStateFromURL() {
    url = window.location.href;
    let regex = new RegExp("[?&]state(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2]);
}
