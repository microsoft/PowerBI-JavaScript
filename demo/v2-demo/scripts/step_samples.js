function OpenCodeStepWithSample(entityType) {
    $("html, body").animate({ scrollTop: 0 }, "slow");

    // Clear the log
    ClearTextArea('#txtResponse');

    SetSession(SessionKeys.EntityType, entityType);
    SetSession(SessionKeys.TokenType, defaultTokenType);

    if (entityType == EntityType.Report)
    {
        SetSession(SessionKeys.IsSampleReport, true);
        OpenCodeStep(EmbedViewMode, EntityType.Report);
    }
    else if (entityType == EntityType.Visual)
    {
        SetSession(SessionKeys.IsSampleReport, true);
        OpenCodeStep(EmbedViewMode, EntityType.Visual);
    }
    else if (entityType == EntityType.Dashboard)
    {
        SetSession(SessionKeys.IsSampleDashboard, true);
        OpenCodeStep(EmbedViewMode, EntityType.Dashboard);
    }
    else if (entityType == EntityType.Tile)
    {
      SetSession(SessionKeys.IsSampleTile, true);
      OpenCodeStep(EmbedViewMode, EntityType.Tile)
    }
    else if (entityType == EntityType.Qna)
    {
      SetSession(SessionKeys.IsSampleQna, true);
      OpenCodeStep(EmbedViewMode, EntityType.Qna)
    }
    else if (entityType == EntityType.PaginatedReport)
    {
      SetSession(SessionKeys.IsSamplePaginatedReport, true);
      OpenCodeStep(EmbedViewMode, EntityType.PaginatedReport)
    }
    else {
      assert(false);
      trackEvent(TelemetryEventName.CodeStepError, {});
      return;
    }
    trackEvent(TelemetrySectionName.SampleTool, { entityType: entityType, src: TelemetryEventSource.UserClick });
}
