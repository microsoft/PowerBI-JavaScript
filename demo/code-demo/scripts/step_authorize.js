const SampleReport = {
    // Expires on 1.1.2030
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJMaXZlU2FtcGxlV1NDIiwid2lkIjoiODU2YjNmOTktODM2My00ZWRhLWE5OWUtNzJlZTkzZDZkNDcwIiwicmlkIjoiYjI4ZGRiOTItNTJlMS00NzliLWE5ZTgtNDNkMTYzMGM5OTE3IiwidmVyIjoiMC4yLjAiLCJ0eXBlIjoiZW1iZWQiLCJzY3AiOiJSZXBvcnQuUmVhZCIsImlzcyI6IlBvd2VyQklTREsiLCJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiZXhwIjoxODkzNDg5ODI1LCJuYmYiOjE0ODg0NDMwMjV9.x0R3fBAwgCo88U6ca2DgK3cj--GZ9oSnbXR_F5XNh9Q",
    EmbedUrl : "https://msit.powerbi.com/appTokenReportEmbed?reportId=b28ddb92-52e1-479b-a9e8-43d1630c9917",
    EmbedId : "b28ddb92-52e1-479b-a9e8-43d1630c9917"
};

const SampleDataset = {
    // Expires on 1.1.2030
    AccessToken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3Y24iOiJMaXZlU2FtcGxlV1NDIiwid2lkIjoiODU2YjNmOTktODM2My00ZWRhLWE5OWUtNzJlZTkzZDZkNDcwIiwiZGlkIjoiNzg1NThkM2QtNTYxNi00YTUxLTg4NzQtMzE3NzM1ZDIxNTI1IiwidmVyIjoiMC4yLjAiLCJ0eXBlIjoiZW1iZWQiLCJzY3AiOiJEYXRhc2V0LlJlYWQiLCJpc3MiOiJQb3dlckJJU0RLIiwiYXVkIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldC9wb3dlcmJpL2FwaSIsImV4cCI6MTg5MzQ5MDAxMCwibmJmIjoxNDg4NDQzMjEwfQ.snH1_Mez3uMhRluyAy_1aZUo3yEAIpTP1UgmZxTg5BY",
    EmbedUrl : "https://msit.powerbi.com/appTokenReportEmbed?datasetId=78558d3d-5616-4a51-8874-317735d21525",
    EmbedId : "78558d3d-5616-4a51-8874-317735d21525"
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