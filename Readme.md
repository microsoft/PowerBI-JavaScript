# powerbi-client

## Installation

Install via Nuget:

`Install-Package Microsoft.PowerBI.JavaScript -Pre`

Install from NPM:

`npm install -save powerbi-client`

Install from Bower:

`bower install powerbi-client --save`

Installing beta versions:

`npm install --save powerbi-client@beta`

## Setup Power BI for embedding

Add the Power BI script before your apps closing `</body>` tag

`<script src="/bower_components/powerbi-client/dist/powerbi.js"></script>`

This exposes two globals `Powerbi` which is the service class and `powerbi` which is an instance of the service.


# Embedding

## PaaS
### When using PaaS model the tokens issued are for a specific report or tile and the token should be associated with the embed url on the same element to ensure each has a unique token allows embeding multiple reports using the same service instance.

```
<div
	powerbi-type="report"
	powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=5dac7a4a-4452-46b3-99f6-a25915e0fe55"
	powerbi-access-token="eyJ0eXAiO...Qron7qYpY9MI"
></div>
```

## SaaS
### When using SaaS model the tokens issued are for a specific user who can view many types of visuals. This means you can add this as a global token reused for all embeded visuals as shown below:
```
<script>
	window.powerbi.accessToken = '{{AccessToken}}';
</script>
...

<div
	powerbi-type="report"
	powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=5dac7a4a-4452-46b3-99f6-a25915e0fe55"
></div>
```

# Service Configuration

As of 2.x Power BI will *NOT* automatically search your apps DOM for Power BI embed components on page load.
If you need this behavior you need to configure the service by calling:

```
powerbi.enableAutoEmbed();
```
See: CHANGELOG.md for more details

If your app is dyanamically adding new embed components after page load you will need to manually initialize them via JavaScript.

# Embed configuration and other options

All configuration and options will be provided as attributes prefixed with `powerbi-options-` on the containing html element.

1. **Filter Pane**

	FilterPane is enabled by default but can be disabled by adding the attribute:
	```
	<div ... powerbi-options-filter-pane-enabled="false"`></div>
	```

## Setting the size of embedded components
The report will automatically be embedded based on the size of it's container.
To override the default size of the embeds simply add a CSS class attribute or inline styles for width & height.

## Launch an embedded report in fullscreen mode
(Assumes element with id `myReport` already contained embedded report)
```
<script>
	var element = document.getElementById('#myReport');
	var report = powerbi.get(element);

	report.fullscreen();
</script>
```

## Dynamically embedding components
### Find all new Power BI components and initialize them.
`powerbi.init();`

By default this will look for elements within the `document.body`; however you can pass optional DOM element to scope the intialization to smaller subset.

```
var pageContainer = document.getElementsById('#pageContainer');
powerbi.init(pageContainer);
```

### Embed a single component
Setup the a new DOM element with the same structure as above.
Call the `embed` function passing in the single element.

`powerbi.embed(element);`

In the case above, the embed url, access-token, type, options, etc will be determined from the elements' attributes.
You can optionally pass a second argument to embed specifying these values as an object:

`powerbi.embed(element, { embedUrl: '...', accessToken: '...' }`;

### Get a reference to a existing Power BI component
Retrieve the existing component associated with the element.

`var myPowerBIComponent = powerbi.get(element);`

