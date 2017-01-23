function OpenEmbedStepWithSampleValues(accessToken, embedUrl, reportId)
{
    setSession(accessToken, embedUrl, reportId);
    OpenEmbedStep();
}

function OpenCleanEmbedStep()
{
    OpenEmbedStepWithSampleValues("","","");
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

function OpenEmbedStepCreateWithSampleValues(accessToken, embedUrl, datasetId)
{
    setSession(accessToken, embedUrl, datasetId);
    OpenCreateStep();
}

function OpenCleanEmbedStepCreate()
{
    OpenEmbedStepCreateWithSampleValues("","","");
}

function OpenEmbedStepCreateWithSample() {
    // Default values - report with embed token which expires on 1/1/2030.
    var embedUrl = 'https://dxt.powerbi.com/appTokenReportEmbed?reportEmbedEditingEnabled=true';
    var datasetId = '56603ccc-e43f-46ad-ba2f-b9e9a145f0b7';
    var accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJTYWdlRFhUV0MiLCJ3aWQiOiIwZmI4MGMyNC05ODlmLTQ4NDEtOWU0OS1iOWFjOWNhMzRmZTIiLCJkaWQiOiI1NjYwM2NjYy1lNDNmLTQ2YWQtYmEyZi1iOWU5YTE0NWYwYjciLCJ2ZXIiOiIwLjIuMCIsInR5cGUiOiJlbWJlZCIsInNjcCI6IkRhdGFzZXQuUmVhZCBXb3Jrc3BhY2UuUmVwb3J0LkNyZWF0ZSIsImlzcyI6IlBvd2VyQklTREsiLCJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiZXhwIjoxNDkzNzE3MTU2LCJuYmYiOjE0ODUwNzM1NTZ9.3V7S7JinkJygkXaLtyK_StfYSR53Mbc56-VPFJFlETI";

    OpenEmbedStepCreateWithSampleValues(accessToken, embedUrl, datasetId);
}

function setSession(accessToken, embedUrl, datasetId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, datasetId);
}