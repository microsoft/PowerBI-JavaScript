

var BookmarkShowcaseState = {
    bookmarksArray: null,
    bookmarksReport: null,

    // Next bookmark ID counter
    nextBookmarkId: 1
}

const dialogTextSelectTimeout = 50;

// Embed the report and retrieve the existing report bookmarks
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

        // Use View permissions
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

        // Use View permissions
        var permissions = models.Permissions.View;

        // Get the bookmark name from url param
        var bookmarkName = GetBookmarkNameFromURL();

        // Get the bookmark state from local storage
        // any type of database can be used
        var bookmarkState = localStorage.getItem(bookmarkName);

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
    for (let i = 0; i < BookmarkShowcaseState.bookmarksArray.length; i++) {
        bookmarksList.append(buildBookmarkElement(BookmarkShowcaseState.bookmarksArray[i]));
    }

    // Set first bookmark active
    if (bookmarksList.length) {
        let firstBookmark = $('#' + BookmarkShowcaseState.bookmarksArray[0].name);

        // Apply first bookmark state
        onBookmarkClicked(firstBookmark[0]);
    }
}

// Capture new bookmark of the current state and update the bookmarks list
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

        // Add the new bookmark to the HTML list
        $('#bookmarksList').append(buildBookmarkElement(bookmark));

        // Set the captured bookmark as active
        setBookmarkActive($('#bookmark_' + BookmarkShowcaseState.nextBookmarkId));

        // Add the bookmark to the bookmarks array and increase the bookmarks number counter
        BookmarkShowcaseState.bookmarksArray.push(bookmark);
        BookmarkShowcaseState.nextBookmarkId++;
    });
}

// Set the bookmark as the active bookmark on the list
function setBookmarkActive(bookmarkSelector) {

    // Remove share boomark icon
    $('#bookmarkShare').remove();

    // Find bookmark parent node
    let parentNode = (bookmarkSelector[0]).parentNode;

    // Add share bookmark icon to bookmark's line
    $(parentNode).append(buildShareElement());

    // Set bookmark radio button to checked
    bookmarkSelector.attr('checked', true);
}

// Closes the dialog
function onCloseDialogClicked() {
    $('#overlay').hide();
    $('#shareDialog').hide();
}

// Copy the dialog's input text
function onDialogCopyClicked() {
    CopyTextArea('#dialogInput', '#btnDialogCopy');
    $('#dialogInput').select();
}

// Apply clicked bookmark state and set it as the active bookmark on the list
function onBookmarkClicked(element) {

    // Set the clicked bookmark as active
    setBookmarkActive($(element));

    // Get bookmark Id from HTML
    const bookmarkId = $(element).attr('id');

    // Find the bookmark in the bookmarks array
    let currentBookmark = getBookmarkByID(bookmarkId);

    // Apply the bookmark state
    BookmarkShowcaseState.bookmarksReport.bookmarksManager.applyState(currentBookmark.state);
}

// Open bookmark share dialog
function shareBookmark(element) {

    // Get bookmark Id from HTML
    const bookmarkId = $($(element).siblings('input')).attr('id');

    // Find the bookmark in the bookmarks array
    let currentBookmark = getBookmarkByID(bookmarkId);

    // Build the share bookmark URL
    let shareUrl = location.href.substring(0, location.href.lastIndexOf("/")) + '/shareBookmark.html' + '?name=' + currentBookmark.name;

    // Store bookmark state with name as a key on the local storage
    // any type of database can be used
    localStorage.setItem(currentBookmark.name, currentBookmark.state);

    // Set bookmark display name and share URL on dialog HTML code
    $('#dialogBookmarkName').empty();
    var displayNameElement = document.createTextNode(currentBookmark.displayName);
    $('#dialogBookmarkName').append(displayNameElement);
    $('#dialogInput').val(shareUrl);

    // Show overlay and share dialog
    $('#overlay').show();
    $('#shareDialog').show();

    // Select dialog input after the dialog is shown
    setTimeout(function() {
        $('#dialogInput').select();
    }, dialogTextSelectTimeout);
}

// Get the bookmark with bookmarkId name
function getBookmarkByID(bookmarkId) {
    return jQuery.grep(BookmarkShowcaseState.bookmarksArray, function (bookmark) { return bookmark.name === bookmarkId })[0];
}

// Build bookmark radio button HTML element
function buildBookmarkElement(bookmark) {
    var labelElement = document.createElement("label");
    labelElement.setAttribute("class", "showcaseRadioContainer");

    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "radio");
    inputElement.setAttribute("name", "bookmark");
    inputElement.setAttribute("id", bookmark.name);
    inputElement.setAttribute("onclick", "onBookmarkClicked(this);");
    labelElement.appendChild(inputElement);

    var spanElement = document.createElement("span");
    spanElement.setAttribute("class", "showcaseRadioCheckmark");
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

// Get the bookmark name from url 'name' argument
function GetBookmarkNameFromURL() {
    url = window.location.href;
    let regex = new RegExp("[?&]name(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2]);
}
