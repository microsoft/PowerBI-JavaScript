const TelemetryEventName = {
    CodeStepError: "CodeStepError",
    CopyCode: "CopyCode",
    CopyLog: "CopyLog",
    DesktopModeOpen: "DesktopModeOpen",
    InnerSectionOpen: "InnerSectionOpen",
    Interact: "Interact",
    MobileModeOpen: "MobileModeOpen",
    RunClick: "RunClick",
    SectionOpen: "SectionOpen",
    SessionStart: "SessionStart"
};
const TelemetryEventSource = {
    Url: "Url",
    UserClick: "UserClick"
};

const TelemetryInnerSection = {
    Code: "Code",
    Sample: "Sample"
};

const TelemetrySectionName = {
    Documentation: "Documentation",
    SampleTool: "SampleTool",
    Showcase: "Showcase"
};

function trackEvent(name, properties, flush) {
    if (!_session[SessionKeys.IsTelemetryEnabled]) {
        return;
    }
    assert(name && properties);
    properties.sessionId = GetSession(SessionKeys.SessionId);

    getAppInsightsInstance().then(function(ai) {
      // Normally, the SDK sends data at fixed intervals (typically 30 secs) or whenever buffer is full (typically 500 items).
      // https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#flushing-data
      ai.trackEvent({ name: name, properties: properties });
      if (flush) {
          ai.flush();
      }
    });
}

trackEvent(TelemetryEventName.SessionStart, { referrer: document.referrer }, true);