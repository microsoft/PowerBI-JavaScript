const SampleReport = {
    // Expires on 1.1.2030
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXIiOiIwLjIuMCIsIndjbiI6IlBvd2VyQmlBenVyZVNhbXBsZXMiLCJ3aWQiOiJmODFjMTk2Ni1lZGVlLTQxMWItOGY4YS1mODQ0NjAxOWIwNDQiLCJyaWQiOiJjNTJhZjhhYi0wNDY4LTQxNjUtOTJhZi1kYzM5ODU4ZDY2YWQiLCJpc3MiOiJQb3dlckJJU0RLIiwiYXVkIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldC9wb3dlcmJpL2FwaSIsImV4cCI6MTg5MzQ0ODgwMCwibmJmIjoxNDgxMDM3MTY5fQ.m4SwqmRWA9rJgfl72lEQ_G-Ijpw9Up5YwmBOfXi00YU",
    EmbedUrl : "https://embedded.powerbi.com/appTokenReportEmbed?reportId=c52af8ab-0468-4165-92af-dc39858d66ad",
    EmbedId : "c52af8ab-0468-4165-92af-dc39858d66ad"
};

const SampleDataset = {
    // Expires on 1.1.2030
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXIiOiIwLjIuMCIsInR5cGUiOiJlbWJlZCIsIndjbiI6IlBvd2VyQmlBenVyZVNhbXBsZXMiLCJ3aWQiOiJmODFjMTk2Ni1lZGVlLTQxMWItOGY4YS1mODQ0NjAxOWIwNDQiLCJkaWQiOiIxZWUwYjI2NC1iMjgwLTQzZjEtYmJiNy05ZDhiZDJkMDNhNzgiLCJzY3AiOiJEYXRhc2V0LlJlYWQiLCJpc3MiOiJQb3dlckJJU0RLIiwiYXVkIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldC9wb3dlcmJpL2FwaSIsImV4cCI6MTk2MTg1NDIzNiwibmJmIjoxNDg4NDY4NjM2fQ.Udv5Y6gMrTKUw0-5mXeCwud8u4JI5Y5loAwJc2jWugQ",
    EmbedUrl : "https://embedded.powerbi.com/appTokenReportEmbed",
    EmbedId : "1ee0b264-b280-43f1-bbb7-9d8bd2d03a78"
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