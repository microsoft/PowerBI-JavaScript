function OpenEmbedStepWithSampleValues(accessToken, embedUrl, reportId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, reportId);

    OpenEmbedStep();
}

function OpenEmbedStepWithSample() {
    var staticReportUrl = 'https://powerbi-embed-api.azurewebsites.net/api/reports/c52af8ab-0468-4165-92af-dc39858d66ad';
    fetch(staticReportUrl).then(function (response) {
        // Do Nothing. Keeping this call for telemtry usage (Meanwhile)

    });

    // Default values - report with embed token which expires on 1/1/2030.
    var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=c52af8ab-0468-4165-92af-dc39858d66ad';
    var reportId = 'c52af8ab-0468-4165-92af-dc39858d66ad';
    var accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXIiOiIwLjIuMCIsIndjbiI6IlBvd2VyQmlBenVyZVNhbXBsZXMiLCJ3aWQiOiJmODFjMTk2Ni1lZGVlLTQxMWItOGY4YS1mODQ0NjAxOWIwNDQiLCJyaWQiOiJjNTJhZjhhYi0wNDY4LTQxNjUtOTJhZi1kYzM5ODU4ZDY2YWQiLCJpc3MiOiJQb3dlckJJU0RLIiwiYXVkIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldC9wb3dlcmJpL2FwaSIsImV4cCI6MTg5MzQ0ODgwMCwibmJmIjoxNDgxMDM3MTY5fQ.m4SwqmRWA9rJgfl72lEQ_G-Ijpw9Up5YwmBOfXi00YU";

    OpenEmbedStepWithSampleValues(accessToken, embedUrl, reportId);
}