# powerbi-client
[![Build Status](https://travis-ci.org/Microsoft/PowerBI-JavaScript.svg?branch=dev)](https://travis-ci.org/Microsoft/PowerBI-JavaScript)
[![npm version](https://badge.fury.io/js/powerbi-client.svg)](https://www.npmjs.com/package/powerbi-client)
[![Downloads](https://img.shields.io/npm/dm/powerbi-client.svg)](https://www.npmjs.com/package/powerbi-client)
[![GitHub tag](https://img.shields.io/github/tag/microsoft/powerbi-javascript.svg)](https://github.com/Microsoft/PowerBI-JavaScript/tags)
[![Gitter](https://img.shields.io/gitter/room/Microsoft/PowerBI-JavaScript.svg)](https://gitter.im/Microsoft/PowerBI-JavaScript)

## Wiki
See the [wiki](https://github.com/Microsoft/PowerBI-JavaScript/wiki) for more details about embedding, service configuration, setting default page, page navigation, dynamically applying filters, and more.

## Code Docs
See the [code docs](https://microsoft.github.io/PowerBI-JavaScript) for detailed information about classes, interfaces, types, etc.

## Demo
See the [live demo](https://microsoft.github.io/PowerBI-JavaScript/demo) for sample application using the powerbi-client library in scenarios such as page navigation, applying filters, updating settings, and more.

## Installation

Install via Nuget:

`Install-Package Microsoft.PowerBI.JavaScript -Pre`

Install from NPM:

`npm install -save powerbi-client`

Install from Bower:

`bower install powerbi-client --save`

Installing beta versions:

`npm install --save powerbi-client@beta`

## Include the library via import or manually

Ideally you would use module loader or compilation step to import using ES6 modules as:

```javascript
import * as pbi from 'powerbi-client';
```

However, the library is exported as a Universal Module and the powerbi.js script can be included before your apps closing `</body>` tag as:

```html
<script src="/bower_components/powerbi-client/dist/powerbi.js"></script>
```

When included directly the library is exposd as a global named 'powerbi-client'.
There is also another global `powerbi` which is an instance of the service.


