const TelemetryEventName = {
    Homepage : "Homepage",
};

function trackEvent(name, properties, flush = false) {
    if (!_session[SessionKeys.IsTelemetryEnabled]) {
        return;
    }
    assert(name && properties);
    properties.sessionId = GetSession(SessionKeys.SessionId);

    // Normally, the SDK sends data at fixed intervals (typically 30 secs) or whenever buffer is full (typically 500 items).
    // https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#flushing-data
    appInsights.trackEvent({ name, properties });
    if (flush) {
        appInsights.flush();
    }
}

trackEvent(TelemetryEventName.Homepage, {}, true);