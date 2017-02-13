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
    var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportEmbedEditingEnabled=true';
    var datasetId = '8f94aa87-a12b-4afa-9ff3-a0f78cd434b9';
    var accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJEYmctV0FCSS1QQUFTLTEtU0NVUyIsIndpZCI6IjhhMGNlZTNlLTc3ZmEtNGM1Ny1hZTQ4LWM4NzliOTkwMjQyNSIsImRpZCI6IjhmOTRhYTg3LWExMmItNGFmYS05ZmYzLWEwZjc4Y2Q0MzRiOSIsInZlciI6IjAuMi4wIiwidHlwZSI6ImVtYmVkIiwic2NwIjoiRGF0YXNldC5SZWFkIiwiaXNzIjoiUG93ZXJCSVNESyIsImF1ZCI6Imh0dHBzOi8vYW5hbHlzaXMud2luZG93cy5uZXQvcG93ZXJiaS9hcGkiLCJleHAiOjE0OTU1MzE5MjEsIm5iZiI6MTQ4Njg4ODMyMX0.Lzug-8hFwPEWNgCJovk338Fc6Y6lrAZOcOruDRzT-Qw";

    OpenEmbedStepCreateWithSampleValues(accessToken, embedUrl, datasetId);
}

function setSession(accessToken, embedUrl, datasetId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, datasetId);
}