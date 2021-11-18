// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as service from '../src/service';
import * as report from '../src/report';
import * as Wpmp from 'window-post-message-proxy';
import * as factories from '../src/factories';
import { spyWpmp } from './utility/mockWpmp';
import { spyHpm } from './utility/mockHpm';
import { spyRouter } from './utility/mockRouter';
import { iframeSrc } from './constsants';

describe('SDK-to-WPMP', function () {
  let element: HTMLDivElement;
  let powerbi: service.Service;
  let report: report.Report;
  let uniqueId: string;

  beforeEach(function () {
    const spyWpmpFactory: factories.IWpmpFactory = (_name?: string, _logMessages?: boolean) => {
      return <Wpmp.WindowPostMessageProxy>spyWpmp;
    };

    powerbi = new service.Service(factories.hpmFactory, spyWpmpFactory, factories.routerFactory);

    element = document.createElement('div');
    element.className = 'powerbi-report-container';

    const embedConfiguration = {
      type: "report",
      id: "fakeReportId",
      accessToken: 'fakeToken',
      embedUrl: iframeSrc,
      wpmpName: 'SDK-to-WPMP report wpmp'
    };
    const hpmPostpy = spyOn(powerbi.hpm, "post").and.callFake(() => Promise.resolve(<any>{}));
    report = <report.Report>powerbi.embed(element, embedConfiguration);
    hpmPostpy.and.callThrough();
    uniqueId = report.config.uniqueId;
    spyHpm.post.calls.reset();
  });

  afterEach(function () {
    powerbi.reset(element);
    element.remove();

    spyWpmp.stop();
    spyWpmp.addHandler.calls.reset();
    spyWpmp.clearHandlers();

    spyHpm.get.calls.reset();
    spyHpm.post.calls.reset();
    spyHpm.patch.calls.reset();
    spyHpm.put.calls.reset();
    spyHpm.delete.calls.reset();

    spyRouter.get.calls.reset();
    spyRouter.post.calls.reset();
    spyRouter.patch.calls.reset();
    spyRouter.put.calls.reset();
    spyRouter.delete.calls.reset();
  });

  describe('Event handlers', function () {
    it(`handler passed to report.on(eventName, handler) is called when POST /report/:uniqueId/events/:eventName is received`, function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler'),
        filtersAppliedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
            body: {
              initiator: 'sdk',
              filters: [
                {
                  x: 'fakeFilter'
                }
              ]
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.filtersAppliedEvent);

      // Assert
      expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.filtersAppliedEvent.data.body }));
    });

    it(`off('eventName', handler) will remove single handler which matches function reference for that event`, function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.off(testData.eventName, testData.handler);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).not.toHaveBeenCalled();
    });

    it('if multiple handlers for the same event are registered they will all be called', function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: `/reports/${uniqueId}/events/filtersApplied`,
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.on(testData.eventName, testData.handler2);
      report.on(testData.eventName, testData.handler3);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
      expect(testData.handler2).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
      expect(testData.handler3).toHaveBeenCalledWith(jasmine.objectContaining({ detail: testData.simulatedEvent.data.body }));
    });

    it(`off('eventName') will remove all handlers which matches event name`, function () {
      // Arrange
      const testData = {
        eventName: 'filtersApplied',
        handler: jasmine.createSpy('handler1'),
        handler2: jasmine.createSpy('handler2'),
        handler3: jasmine.createSpy('handler3'),
        simulatedEvent: {
          data: {
            method: 'POST',
            url: '/reports/fakeReportId/events/filtersApplied',
            body: {
              initiator: 'sdk',
              filter: {
                x: '1',
                y: '2'
              }
            }
          }
        }
      };

      report.on(testData.eventName, testData.handler);
      report.on(testData.eventName, testData.handler2);
      report.on(testData.eventName, testData.handler3);
      report.off(testData.eventName);

      // Act
      spyWpmp.onMessageReceived(testData.simulatedEvent);

      // Assert
      expect(testData.handler).not.toHaveBeenCalled();
      expect(testData.handler2).not.toHaveBeenCalled();
      expect(testData.handler3).not.toHaveBeenCalled();
    });
  });
});
