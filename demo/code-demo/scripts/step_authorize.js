const SampleReport = {
    AccessToken : "",
    EmbedUrl : "https://embedded.powerbi.com/appTokenReportEmbed?reportId=c52af8ab-0468-4165-92af-dc39858d66ad",
    EmbedId : "c52af8ab-0468-4165-92af-dc39858d66ad"
};

const SampleDataset = {
    AccessToken : "",
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