var embedWithSpecificReportDivExpanded = false;

function ToggleEmbedWithSpecificReportDiv() {
    if (embedWithSpecificReportDivExpanded == true)
    {
        embedWithSpecificReportDivExpanded = false;
        $("#EmbedWithSpecificReportDiv").hide();
    }
    else
    {
        embedWithSpecificReportDivExpanded = true;
        $("#EmbedWithSpecificReportDiv").show();
    }
}

function OpenEmbedStepWithSample() {
    var staticReportUrl = 'https://powerbiembedapi.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';

    fetch(staticReportUrl).then(function (response) {
        if (response.ok) {
            return response.json().then(function (embedConfig) {
                SetSessions(embedConfig.accessToken, embedConfig.embedUrl, embedConfig.id);
                OpenEmbedStep();
            });
        }
        else {
            return response.json().then(function (error) {
                throw new Error(error);
            });
        }
    });
}