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

## Wiki
See the [wiki](https://github.com/Microsoft/PowerBI-JavaScript/wiki) for more details.

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



