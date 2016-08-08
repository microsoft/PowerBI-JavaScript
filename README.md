# powerbi-client
[![Build Status](https://travis-ci.org/Microsoft/PowerBI-JavaScript.svg?branch=dev)](https://travis-ci.org/Microsoft/PowerBI-JavaScript)
[![npm version](https://badge.fury.io/js/powerbi-client.svg)](https://www.npmjs.com/package/powerbi-client)
[![Downloads](https://img.shields.io/npm/dm/powerbi-client.svg)](https://www.npmjs.com/package/powerbi-client)
[![GitHub tag](https://img.shields.io/github/tag/microsoft/powerbi-javascript.svg)](https://github.com/Microsoft/PowerBI-JavaScript/tags)
[![Gitter](https://img.shields.io/gitter/room/Microsoft/PowerBI-JavaScript.svg)](https://gitter.im/Microsoft/PowerBI-JavaScript)

## Documentation
### [https://microsoft.github.io/PowerBI-JavaScript](https://microsoft.github.io/PowerBI-JavaScript)

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

Ideally you would use module loader or compilation step to import using ES6 modules as:

```javascript
import * as pbi from 'powerbi-client';
```

However, the library is exported as a Universal Module and the Power BI script can be included before your apps closing `</body>` tag as:

```html
<script src="/bower_components/powerbi-client/dist/powerbi.js"></script>
```

When included directly the library is exposd as a global named 'powerbi-client'.
There is also another global `powerbi` which is an instance of the service.

# Embedding

## PaaS (Platform as a Service)
When using PaaS model the tokens issued are for a specific report or tile and the token should be associated with the embed url on the same element to ensure each has a unique token allows embedding multiple reports using the same service instance.

Provide embed configuration using attributes:

```html
<div
	powerbi-type="report"
	powerbi-access-token="eyJ0eXAiO...Qron7qYpY9MI"
	powerbi-report-id="5dac7a4a-4452-46b3-99f6-a25915e0fe55"
	powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed"
></div>
```
Embed using javascript:

```html
<div id="reportContainer"></div>
```

```javascript
var embedConfiguration = {
	type: 'report',
	accessToken: 'eyJ0eXAiO...Qron7qYpY9MI',
	id: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
	embedUrl: 'https://embedded.powerbi.com/appTokenReportEmbed'
};
var $reportContainer = $('#reportContainer');
var report = powerbi.embed($reportContainer.get(0), embedConfiguration);
```

> Notice how the attributes and embed configuration hold the same data, just provided to the service in different ways.

## SaaS (Software as a Service)
When using SaaS model the tokens issued are for a specific user who can view many types of visuals. This means you can add this as a global token reused for all embedded visuals as shown below:

It is not required, but you can assign global token on instane of Power BI servic which will be used as a fallback if a token isn't provided for the specific instance.

```html
<script>
	powerbi.accessToken = '{{AccessToken}}';
</script>
```

Provide embed configuration using attributes (notice access token does not need to be supplied because it will fallback to use the global token)

```html
<div
	powerbi-type="report"
	powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=5dac7a4a-4452-46b3-99f6-a25915e0fe55"
></div>
```

Embed using javascript:

```javascript
var embedConfiguration = {
	type: 'report',
	id: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
	embedUrl: 'https://embedded.powerbi.com/appTokenReportEmbed'
};
var $reportContainer = $('#reportContainer');
var report = powerbi.embed($reportContainer.get(0), embedConfiguration);
```

> Note: You can still choose to supply a SaaS access token (issued by AAD instead of your own service) in the embed configuration. This allows you to have apps that embed reports using SaaS and PaaS authentication.

> Also, notice how the embed experience across both SaaS and PaaS is nearly identical except for how you specify the access token.

# Service Configuration

As of 2.x Power BI will *NOT* automatically search your apps DOM for Power BI embed components on page load.
If you need this behavior you need to configure the service for this.

If your executing before the DOM is ready you can call, to add a listener to renable the default behavior by calling:
```
powerbi.enableAutoEmbed();
```
Otherwise, if your executing after the DOM is ready you can call:
```
powerbi.init();
```

See: CHANGELOG.md for more details

**If your app is dynamically adding new embed components after page load you will need to manually initialize them via JavaScript.**

You can do this by getting a reference to the element and calling `powerbi.embed(element)` similarly to the examples shown above. 

# Embed configuration and other options

All configuration and settings will be provided as attributes prefixed with `powerbi-settings-` on the containing html element.


1. **Filter Pane**

	FilterPane is enabled/visible by default but can be disabled/hidden by adding the attribute on the element or specifying the setting in the embed configuration:

	```html
	<div ... powerbi-settings-filter-pane-enabled="false"></div>
	```

	```javascript
	var embedConfig = {
		...
		settings: {
			filterPaneEnabled: false
		}
	};
	```

2. **Page Navigation**

	Page navigation is enabled/visible by default but can be disabled/hidden by adding the attribute:

	```javascript
	<div ... powerbi-settings-nav-content-pane-enabled="false"></div>
	```

	```javascript
		var embedConfig = {
		...
		settings: {
			navContentPaneEnabled: false
		}
	};
	```

## Setting the size of embedded components
The report will automatically be embedded based on the size of it's container.
To override the default size of the embeds simply add a CSS class attribute or inline styles for width & height.

## Launch an embedded report in fullscreen mode
(Assumes element with id `myReport` already contained embedded report)

```javascript
var element = document.getElementById('#myReport');
var report = powerbi.get(element);

report.fullscreen();
```

## Get a reference to a existing Power BI component
Retrieve the existing component associated with the element.

`var myPowerBIComponent = powerbi.get(element);`


## Handling Events

Embedded components will emit events after a command invoked on it has been executed and the operation completed.  These commands could be sent programmatically through the SDK or from the user directly interacting with the report.

Example: The user can manually change pages by using the built-in page navigation and clicking on the buttons, or you can programmatically change the page by sending the correct postMessage.  In both cases a `pageChanged` event will occur.

### Full list of events an their response values

All Embeds

```
loaded
	configuration
error
	error
```

Reports

```
pageChanged
	newPage
filtersApplied
	filters
dataSelected (Coming soon)
	filter
	data (Array of points)
	pageName
	visualId
```

### Example
It is required to wait for the report to be fully loaded before you can send it commands.  This is very similar to waiting for the DOM to be ready before attempting to take action on the elements.
In order to do this you must listen for the loaded event and then issue new commands.

```typescript
report.on('loaded', event => {
	report.getPages()
		.then(pages => {
			this.reportPages = pages;
		});
});
```

# Understanding the embed process
What actually happens when you call `powerbi.embed(element, embedConfig);`?

1. Determine if we are embedding on an element which is contains embedded content.

	If the content already embedded is of the same type, we can re-use the existing iframe and simply send a new load command to it rather than reloading the entire contents of the iframe which is much slower since there is significant amount of JavaScript to download.

2. (New Embed) Create instance of embed object.

	The [constructor](https://github.com/Microsoft/PowerBI-JavaScript/blob/dev/src/embed.ts#L67) of the embed will normalize all the required configuration from either the HTML attributes or those passed directly in the configuraiton object.

	(Existing Embed) Pass through to next step.

3. Call `embed.load` which will take the normalized load configuration and send the load message to the iframe.

// TODO: Insert flow-chart diagram

# Understanding the object hierarchy
The core of the library is a service which is responsible for tracking the embeds in the application, handling communication to and from their iframes, and also handling event bubbling.

The embeds that the service tracks are all implementations of the abstract `Embed` class. Concrete implementations of this class are things that you are familiar with in Power BI such as Reports and Dashbaords.

Within these top-level embed objects, the have a logical composition of other objects.  For example: Reports have pages and pages have visuals and each of these objects has different types of actions that can be performed on it.

// TODO: Insert UML and Block Diagrams

# Understanding the post message communication flow
Although `powerbi-client` is bundled as a single script for ease of use there are 4 other dependent libraries which enable familiar Promise-based programming style for communication accross windows.

1. [window-post-message-proxy](https://github.com/Microsoft/window-post-message-proxy)
2. [http-post-message](https://github.com/Microsoft/http-post-message)
3. [powerbi-models](https://github.com/Microsoft/powerbi-models)
4. [powerbi-router](https://github.com/Microsoft/powerbi-router)

Check out those repositories for individual descriptions and example usage.

In summary, we simulate HTTP protocol over window.postMessage.
This makes reasoning about message structure intuitive for web developers instead of being another arbitrary protocol.
This also makes the understanding the flow just like any other client server relationship.

Examples:
- Getting pages on a report: `GET /report/pages`
- Getting visuals on a page: `GET /report/pages/ReportSection/visuals`

// TODO: Include sequence diagram with requests flow and possible returns

There is more complexity in understanding the communication flow when the requests are state changing operations such as changing pages or setting filters.  These operations can be initiated programmatically by the SDK or manually by the user and in order to have a constent way of dealing with this in code the API's are asynchronous.

This means instead of request and response, it is commands and events.
In the case of the SDK sending the command it will only be validated and immediately return 202 Accepted response. Meanwhile, the embed will execute the operation and when complete it will send an event.
In the case of the user initiating the command, only the event will be emitted.

Page change example:
```javascript
// Register event handler for page change events.
// Will execute regardless of the event being initated programmatically or by the user.
report.on('pageChanged', event => {
  const page = event.detail.newPage;
  console.log(`${page.name} was set as active page`);
  // ... update ui with new page
});

// Programmatically change pages which will resolve before the page has actually changed.
page.setActive()
  .then(() => {
    console.log('command accepted');
  })
  .catch(errors => {
    console.log(errors);
  });
```
