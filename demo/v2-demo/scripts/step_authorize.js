var reportUrl = 'http://powerbiembedapiv2.azurewebsites.net/api/Reports/SampleReport';
var datasetUrl = 'http://powerbiembedapiv2.azurewebsites.net/api/Reports/SampleCreate';
var dashboardUrl = 'http://powerbiembedapiv2.azurewebsites.net/api/Dashboards/SampleDashboard';

const EntityType = {
    Report : "Report",
    Dashboard : "Dashboard",
};

function FetchUrlIntoSession(url) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.json()
            .then(function (embedConfig) {
                setSession(embedConfig.embedToken.token, embedConfig.embedUrl, embedConfig.id);
                SetSession(SessionKeys.SampleId, embedConfig.id);
            });
        }
        else {
            return response.json()
            .then(function (error) {
                throw new Error(error);
            });
        }
    });
}

function LoadSampleReportIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(reportUrl);
}

function LoadSampleDatasetIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Report);
    return FetchUrlIntoSession(datasetUrl);
}

function LoadSampleDashboardIntoSession() {
    SetSession(SessionKeys.EntityType, EntityType.Dashboard);
    return FetchUrlIntoSession(dashboardUrl);
}

function OpenEmbedStepWithSample(entityType) {
    SetSession(SessionKeys.EntityType, entityType);

    if (entityType == EntityType.Report)
    {
        SetSession(SessionKeys.IsSampleReport, true);
        OpenEmbedStep(EmbedViewMode, EntityType.Report);
    }
    else if (entityType == EntityType.Dashboard)
    {
        SetSession(SessionKeys.IsSampleDashboard, true);
        OpenEmbedStep(EmbedViewMode, EntityType.Dashboard);
    }
}

function OpenEmbedStepCreateWithSample() {
    SetSession(SessionKeys.IsSampleReport, true);
    SetSession(SessionKeys.EntityType, EntityType.Report);

    OpenEmbedStep(EmbedCreateMode, EntityType.Report);
}

function OpenEmbedStepFromUserSettings() {
    SetSession(SessionKeys.IsSampleReport, false);
    SetSession(SessionKeys.EntityType, EntityType.Report);

    OpenEmbedStep(EmbedViewMode, EntityType.Report);
}

function setSession(accessToken, embedUrl, embedId)
{
    SetSession(SessionKeys.AccessToken, accessToken);
    SetSession(SessionKeys.EmbedUrl, embedUrl);
    SetSession(SessionKeys.EmbedId, embedId);
}