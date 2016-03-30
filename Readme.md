# Power BI for HTML / JavaScript

## Install via Nuget
`Install-Package Microsoft.PowerBI.JavaScript -Pre`

## Install from NPM
`npm install powerbi-client`

## Install from Bower
`bower install powerbi-client`

## Setup Power BI for embedding
Add the Power BI script include before your apps closing `</body>` tag

`<script src="/bower_components/powerbi-client/dist/powerbi.js"></script>`

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
The report will automatically be embedded based on the size of it's container.  
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
