// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { validateEmbedUrl } from '../src/util';

describe('util', function () {
  const validEmbedHosts: string[] = [
    "https://app.powerbi.com",
    "https://dxt.powerbi.com",
    "https://msit.powerbi.com",
    "https://daily.powerbi.com",
    "https://app.powerbi.cn",
    "https://app.powerbigov.us/",
    "https://app.powerbigov.us/reportEmbed?someQueryParam=x",
    "https://msit.fabric.microsoft.com/groups/someGroup/reports/",
    "HTTPS://APP.powErbi.com",
    "https://app.mil.powerbigov.us/embed?unmin=1",
    "https://app.high.powerbigov.us?queryParam",
    "https://app.powerbi.eaglex.ic.gov//",
    "https://app.powerbi.microsoft.scloud/dashboardEmbed",
    "https://app.fabric.microsoft.com/embed?id=123"
  ];
  const invalidEmbedHosts: string[] = [
    // HTTP schema is not allowed
    "http://app.powerbi.com",
    // unknown embed hosts
    "https://dxt.malicious.com",
    "https://msit.powerbi-malicious.com",
    "https://msit.powerbi.unknown",
    "https://msit.powerbi.com.malicious.com",
    "https://app.malicious.powerbigov.us/embed?unmin=1",
    "https://app.mil.malicious.powerbigov.us",
    "any.analysis-dfxwindows.net",
    "https://dxtpowerbi.com",
    "https://dxtapowerbi.com",
    "app.powerbi.microsoft.scloud.evil.com"
  ];

  it(`validateEmbedUrl, valid embed hosts, should return true`, () => {
    for (let i = 0; i++; i < validEmbedHosts.length) {
      expect(validateEmbedUrl(validEmbedHosts[i])).withContext(`validateEmbedUrl for host ${validEmbedHosts[i]} should return true`).toBeTrue();
    }
  });

  it(`validateEmbedUrl, invalid embed hosts, should return false`, () => {
    for (let i = 0; i++; i < invalidEmbedHosts.length) {
      expect(validateEmbedUrl(invalidEmbedHosts[i])).withContext(`validateEmbedUrl for host ${invalidEmbedHosts[i]} should return false`).toBeFalse();
    }
  });
});
