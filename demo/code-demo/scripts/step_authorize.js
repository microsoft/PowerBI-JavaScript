const SampleReport = {
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJSZXBvcnRFbWJlZE1TSVRTYW1wbGUiLCJ3aWQiOiI1NjM2Yzg5ZS1hMzdkLTQ5YjEtOTk0Zi01MzJkYmY4YTIzYjUiLCJyaWQiOiJiZjMzMDAyZS05YWRjLTQ1MmQtYTBiNS1mYjY0OWQ4MDYzNTgiLCJ2ZXIiOiIwLjIuMCIsInR5cGUiOiJlbWJlZCIsInNjcCI6IlJlcG9ydC5SZWFkIiwiaXNzIjoiUG93ZXJCSVNESyIsImF1ZCI6Imh0dHBzOi8vYW5hbHlzaXMud2luZG93cy5uZXQvcG93ZXJiaS9hcGkiLCJleHAiOjE0OTY5MzE1ODcsIm5iZiI6MTQ4ODI4Nzk4N30.FWl6kKaPgu2JZdp4NuRvtm-Cr7nUuvKlrrKmlimM2mE",
    EmbedUrl : "https://msit.powerbi.com/appTokenReportEmbed?reportId=bf33002e-9adc-452d-a0b5-fb649d806358",
    EmbedId : "bf33002e-9adc-452d-a0b5-fb649d806358"
};

const SampleDataset = {
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJSZXBvcnRFbWJlZE1TSVRTYW1wbGUiLCJ3aWQiOiI1NjM2Yzg5ZS1hMzdkLTQ5YjEtOTk0Zi01MzJkYmY4YTIzYjUiLCJkaWQiOiJkYzM5NzRmMS00OWE1LTQ2OGEtODQ4NC0zZTE0MjAzZDBjYmIiLCJ2ZXIiOiIwLjIuMCIsInR5cGUiOiJlbWJlZCIsInNjcCI6IkRhdGFzZXQuUmVhZCIsImlzcyI6IlBvd2VyQklTREsiLCJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiZXhwIjoxNDk2OTMxNjY2LCJuYmYiOjE0ODgyODgwNjZ9.xeWUKm38zhmH9M5i3M4JZz-_csJmPovfRTV_3_POKz0",
    EmbedUrl : "https://msit.powerbi.com/appTokenReportEmbed?reportEmbedEditingEnabled=true",
    EmbedId : "dc3974f1-49a5-468a-8484-3e14203d0cbb"
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