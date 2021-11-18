// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as service from '../src/service';
import * as factories from '../src/factories';

// Avoid adding new tests to this file, create another spec file instead.

describe('embed', function () {
  let powerbi: service.Service;
  let container: HTMLDivElement;
  let iframe: HTMLIFrameElement;

  beforeEach(function () {
    powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    powerbi.accessToken = 'ABC123';
    container = document.createElement('iframe');
    container.setAttribute("powerbi-embed-url", "https://app.powerbi.com/reportEmbed?reportId=ABC123");
    container.setAttribute("powerbi-type", "report");
    document.body.appendChild(container);

    powerbi.embed(container);
    iframe = container.getElementsByTagName('iframe')[0];
  });

  afterEach(function () {
    powerbi.reset(container);
    container.remove();
    powerbi.wpmp.stop();
  });

  describe('iframe', function () {
    it('has a src', function () {
      expect(iframe.src.length).toBeGreaterThan(0);
    });

    it('disables scrollbars by default', function () {
      expect(iframe.getAttribute('scrolling')).toEqual('no');
    });

    it('sets width/height to 100%', function () {
      expect(iframe.style.width).toEqual('100%');
      expect(iframe.style.height).toEqual('100%');
    });
  });

  describe('fullscreen', function () {
    it('sets the iframe as the fullscreen element', function () {
      let requestFullscreenSpy = jasmine.createSpy();
      iframe.requestFullscreen = requestFullscreenSpy;
      let report = powerbi.get(container);
      report.fullscreen();

      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });

  describe('exitFullscreen', function () {
    it('clears the iframe fullscreen element', function () {
      let requestFullscreenSpy = jasmine.createSpy();
      iframe.requestFullscreen = requestFullscreenSpy;
      let report = powerbi.get(container);
      report.fullscreen();
      report.exitFullscreen();
      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });
});
