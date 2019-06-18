

# powerbi-report-authoring
This library is an extension of powerbi-client library.
While powerbi-client library helps for embedding Power BI reports into your apps, powerbi-report-authoring helps for editing Power BI reports programatically.

## Wiki
See [powerbi-client wiki](https://github.com/Microsoft/PowerBI-JavaScript/wiki) for more details about embedding Power BI reports.

See [powerbi-report-authoring wiki](https://github.com/Microsoft/PowerBI-JavaScript/wiki) for more details about authoring Power BI reports in embed session.

Install from NPM:

`npm install --save powerbi-report-authoring`

## Include the library via import or manually

Ideally you would use module loader or compilation step to import using ES6 modules as:

```javascript
import 'powerbi-report-authoring';
```

However, the library is exported as a Universal Module and the powerbi-report-authoring.js script can be included before your apps closing `</body>` tag and after including powerbi-client as:

```html
<script src="<path>/powerbi-client/dist/powerbi.js"></script>
<script src="<path>/powerbi-report-authoring/dist/powerbi-report-authoring.js"></script>
```

When included directly the library is extending classes and interfaces from 'powerbi-client' library.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
