# Power BI for HTML / JavaScript
## Setup Nuget Package Source

- Name: **Power BI Private Nuget** *(For internal use only)*
- Source: https://www.myget.org/F/powerbi/auth/19dee0e1-a453-4d39-bcae-9b5f3d7469f3/api/v3/index.json

*Make sure to check the "Include prerelease" checkbox within the Nuget Package Manager*

## Install Nuget Packages
`Install-Package Microsoft.PowerBI.JavaScripot -Version 1.0.0-preview`

## Get Power BI Client ID & Secret
Go to [Power BI Dev Center](https://dev.powerbi.com/apps) to get your key

## Acquire your Power BI Access Token
Get your Power BI access token using ADAL library for JavaScript

## Setup Power BI for embedding
Add the Power BI CSS link within your apps `<head>` tag.

`<link href="/content/powerbi.css" rel="stylesheet"/>`

Add the Power BI script include before your apps closing `</body>` tag

`<script src="/scripts/powerbi.js"></script>`

Add your access token to your app so it can be accessed.  
*This can be set statically or dynamically via JavaScript.*

```
<script>
	window.powerbi = window.powerbi || {};
	window.powerbi.accessToken = '{{AccessToken}}';
</script>
```
# Embedding
Power BI will automatically search your apps DOM for Power BI embed components on page load.  
If your app is dyanamically adding new embed components after page load you will need to manually initialize them via JavaScript.

## Setting the size of embedded components
The tile & report embed will automatically be embedded based on the size of the embed container.  
To override the default size of the embeds simply add a CSS class attribute or inline styles for width & height.

## Embed a Report into your app
Add the following markup to embed a Power BI Report

Embed via full qualified Report `EmbedUrl`.

`<div powerbi-embed="{{EmbedUrl}}" powerbi-report></div>`

Or, embed with your `ReportId`

`<div powerbi-embed powerbi-report="{{ReportId}}"></div>`

### Launch an embedded report in fullscreen mode
```
<script>
	var elem = document.getElementById('#myReport');
	var report = window.powerbi.get(elem);
	
	report.fullscreen();
</script>
```

## Embed a Dashboard Tile into your app
Add the following markup to embed a Power BI Dashboard Tile

Embed via fully qualified tile `EmbedUrl`.

`<div powerbi-embed="{{EmbedUrl}}" powerbi-tile="{{TileId}}"></div>`

Or, embed with your `DashboardId` and `TileId`

`<div powerbi-embed powerbi-dashboard="{{DashboardId}}" powerbi-tile="{{TileId}}"></div>`

## Dynamically embedding components
### Find all new Power BI components and initialize them.
You can optional pass a DOM element to scope the intialization

`window.powerbi.init();`

### Embed a single component
Setup the a new DOM element with the same structure as above.
Call the `embed` function passing in the single element.

`window.powerbi.embed(element);`

### Get a reference to a existing Power BI component
Returns an instance of the Power BI component associated with an element

`var myPowerBIComponent = window.powerbi.get(element);`
