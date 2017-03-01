const SampleReport = {
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXIiOiIwLjIuMCIsIndjbiI6IlBvd2VyQmlBenVyZVNhbXBsZXMiLCJ3aWQiOiJmODFjMTk2Ni1lZGVlLTQxMWItOGY4YS1mODQ0NjAxOWIwNDQiLCJyaWQiOiJjNTJhZjhhYi0wNDY4LTQxNjUtOTJhZi1kYzM5ODU4ZDY2YWQiLCJpc3MiOiJQb3dlckJJU0RLIiwiYXVkIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldC9wb3dlcmJpL2FwaSIsImV4cCI6MTg5MzQ0ODgwMCwibmJmIjoxNDgxMDM3MTY5fQ.m4SwqmRWA9rJgfl72lEQ_G-Ijpw9Up5YwmBOfXi00YU",
    EmbedUrl : "https://embedded.powerbi.com/appTokenReportEmbed?reportId=c52af8ab-0468-4165-92af-dc39858d66ad",
    EmbedId : "c52af8ab-0468-4165-92af-dc39858d66ad"
};

const SampleDataset = {
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJEYmctV0FCSS1QQUFTLTEtU0NVUyIsIndpZCI6IjhhMGNlZTNlLTc3ZmEtNGM1Ny1hZTQ4LWM4NzliOTkwMjQyNSIsImRpZCI6IjhmOTRhYTg3LWExMmItNGFmYS05ZmYzLWEwZjc4Y2Q0MzRiOSIsInZlciI6IjAuMi4wIiwidHlwZSI6ImVtYmVkIiwic2NwIjoiRGF0YXNldC5SZWFkIiwiaXNzIjoiUG93ZXJCSVNESyIsImF1ZCI6Imh0dHBzOi8vYW5hbHlzaXMud2luZG93cy5uZXQvcG93ZXJiaS9hcGkiLCJleHAiOjE0OTU1MzE5MjEsIm5iZiI6MTQ4Njg4ODMyMX0.Lzug-8hFwPEWNgCJovk338Fc6Y6lrAZOcOruDRzT-Qw",
    EmbedUrl : "https://embedded.powerbi.com/appTokenReportEmbed?reportEmbedEditingEnabled=true",
    EmbedId : "8f94aa87-a12b-4afa-9ff3-a0f78cd434b9"
};

function LoadSampleReportIntoSession() {
    setSession(SampleReport.AccessToken, SampleReport.EmbedUrl, SampleReport.EmbedId);
}

function LoadSampleDatasetIntoSession() {
    setSession(SampleDataset.AccessToken, SampleDataset.EmbedUrl, SampleDataset.EmbedId);
}

function OpenEmbedStepWithSample() {
    SetSession(SessionKeys.IsSampleReport, true);
    OpenEmbedStep(EmbedViewMode);
}

function OpenEmbedStepCreateWithSample() {
    SetSession(SessionKeys.IsSampleReport, true);
    OpenEmbedStep(EmbedCreateMode);
}

function OpenEmbedStepFromUserSettings() {
    SetSession(SessionKeys.IsSampleReport, false);
    OpenEmbedStep(EmbedViewMode);
}

function setSession(accessToken, embedUrl, embedId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, embedId);
}