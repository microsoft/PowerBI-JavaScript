// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WindowPostMessageProxy } from 'window-post-message-proxy';
import { HttpPostMessage } from 'http-post-message';
import { Router } from 'powerbi-router';
import { mockAppSpyObj, mockApp } from './mockApp';
import * as models from 'powerbi-models';

export const spyApp = mockAppSpyObj;

export function setupEmbedMockApp(iframeContentWindow: Window, parentWindow: Window, name: string = 'MockAppWindowPostMessageProxy'): HttpPostMessage {
  const parent = parentWindow || iframeContentWindow.parent;
  const wpmp = new WindowPostMessageProxy({
    processTrackingProperties: {
      addTrackingProperties: HttpPostMessage.addTrackingProperties,
      getTrackingProperties: HttpPostMessage.getTrackingProperties,
    },
    isErrorMessage: HttpPostMessage.isErrorMessage,
    receiveWindow: iframeContentWindow,
    name,
  });
  const hpm = new HttpPostMessage(wpmp, {
    'origin': 'reportEmbedMock',
    'x-version': '1.0.0'
  }, parent);
  const router = new Router(wpmp);
  const app = mockApp;

  /**
   * Setup not found handlers.
   */
  function notFoundHandler(req, res): void {
    res.send(404, `Not Found. Url: ${req.params.notfound} was not found.`);
  }
  router.get('*notfound', notFoundHandler);
  router.post('*notfound', notFoundHandler);
  router.patch('*notfound', notFoundHandler);
  router.put('*notfound', notFoundHandler);
  router.delete('*notfound', notFoundHandler);

  /**
   * Dashboard Embed
   */
  router.post('/dashboard/load', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    try {
      await app.validateDashboardLoad(loadConfig);
      try {
        await app.dashboardLoad(loadConfig);
        hpm.post(`/dashboards/${uniqueId}/events/loaded`, {
          initiator: "sdk"
        });
      } catch (error) {
        hpm.post(`/dashboards/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  /**
   * Create Report
   */
  router.post('/report/create', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const createConfig = req.body;
    try {
      await app.validateCreateReport(createConfig);
      try {
        await app.reportLoad(createConfig);
        hpm.post(`/reports/${uniqueId}/events/loaded`, {
          initiator: "sdk"
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  /**
   * Report Embed
   */
  router.post('/report/load', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    try {
      await app.validateReportLoad(loadConfig);
      try {
        await app.reportLoad(loadConfig);
        hpm.post(`/reports/${uniqueId}/events/loaded`, {
          initiator: "sdk"
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});

    } catch (error) {
      res.send(400, error);
    }
  });

  /**
   * Report Embed
   */
  router.post('/report/prepare', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    try {
      await app.validateReportLoad(loadConfig);
      try {
        await app.reportLoad(loadConfig);
        hpm.post(`/reports/${uniqueId}/events/loaded`, {
          initiator: "sdk"
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});

    } catch (error) {
      res.send(400, error);
    }
  });

  router.post('/report/render', (req, res) => {
    app.render();
    res.send(202, {});
  });

  router.get('/report/pages', async (req, res) => {
    try {
      const pages = await app.getPages();
      res.send(200, pages);

    } catch (error) {
      res.send(500, error);
    }
  });

  router.put('/report/pages/active', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const page = req.body;
    try {
      await app.validatePage(page);
      try {
        await app.setPage(page);
        hpm.post(`/reports/${uniqueId}/events/pageChanged`, {
          initiator: "sdk",
          newPage: page
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202);
    } catch (error) {
      res.send(400, error);
    }
  });

  router.get('/report/filters', async (req, res) => {
    try {
      const filters = await app.getFilters();
      res.send(200, filters);
    } catch (error) {
      res.send(500, error);
    }
  });

  router.put('/report/filters', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const filters = req.body;

    try {
      await Promise.all(filters.map(filter => app.validateFilter(filter)));
      try {
        const filter = await app.setFilters(filters);
        hpm.post(`/reports/${uniqueId}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  router.post('/report/filters', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const operation = req.body.filtersOperation;
    const filters = req.body.filters;

    try {
      Promise.all(filters ? filters.map(filter => app.validateFilter(filter)) : [Promise.resolve(null)]);
      try {
        const filter = await app.updateFilters(operation, filters);
        hpm.post(`/reports/${uniqueId}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  router.get('/report/pages/:pageName/filters', async (req, res) => {
    const page = {
      name: req.params.pageName,
      displayName: null
    };
    try {
      await app.validatePage(page);
      try {
        const filters = await app.getFilters();
        res.send(200, filters);
      } catch (error) {
        res.send(500, error);
      }
    } catch (error) {
      res.send(400, error);
    }
  });

  router.post('/report/pages/:pageName/filters', async (req, res) => {
    const pageName = req.params.pageName;
    const uniqueId = req.headers['uid'];
    const operation = req.body.filtersOperation;
    const filters = req.body.filters;
    const page: models.IPage = {
      name: pageName,
      displayName: null
    };

    try {
      await app.validatePage(page);
      await Promise.all(filters ? filters.map(filter => app.validateFilter(filter)) : [Promise.resolve(null)]);
      try {
        const filter = await app.updateFilters(operation, filters);
        hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});

    } catch (error) {
      res.send(400, error);

    }
  });

  router.put('/report/pages/:pageName/filters', async (req, res) => {
    const pageName = req.params.pageName;
    const uniqueId = req.headers['uid'];
    const filters = req.body;
    const page: models.IPage = {
      name: pageName,
      displayName: null
    };
    try {
      await app.validatePage(page);
      await Promise.all(filters.map(filter => app.validateFilter(filter)));
      try {
        const filter = await app.setFilters(filters);
        hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  router.get('/report/pages/:pageName/visuals/:visualName/filters', async (req, res) => {
    const page = {
      name: req.params.pageName,
      displayName: null
    };
    const visual: models.IVisual = {
      name: req.params.visualName,
      title: 'title',
      type: 'type',
      layout: {},
    };

    try {
      await app.validateVisual(page, visual);
      try {
        const filters = await app.getFilters();
        res.send(200, filters);
      } catch (error) {
        res.send(500, error);
      }
    } catch (error) {
      res.send(400, error);
    }
  });

  router.post('/report/pages/:pageName/visuals/:visualName/filters', async (req, res) => {
    const pageName = req.params.pageName;
    const visualName = req.params.visualName;
    const uniqueId = req.headers['uid'];
    const operation = req.body.filtersOperation;
    const filters = req.body.filters; const page: models.IPage = {
      name: pageName,
      displayName: null
    };
    const visual: models.IVisual = {
      name: visualName,
      title: 'title',
      type: 'type',
      layout: {},
    };

    try {
      await app.validateVisual(page, visual);
      await Promise.all(filters ? filters.map(filter => app.validateFilter(filter)) : [Promise.resolve(null)]);
      try {
        const filter = await app.updateFilters(operation, filters);
        hpm.post(`/reports/${uniqueId}/pages/${pageName}/visuals/${visualName}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  router.put('/report/pages/:pageName/visuals/:visualName/filters', async (req, res) => {
    const pageName = req.params.pageName;
    const visualName = req.params.visualName;
    const uniqueId = req.headers['uid'];
    const filters = req.body;
    const page: models.IPage = {
      name: pageName,
      displayName: null
    };
    const visual: models.IVisual = {
      name: visualName,
      title: 'title',
      type: 'type',
      layout: {},
    };
    try {
      await app.validateVisual(page, visual);
      await Promise.all(filters.map(filter => app.validateFilter(filter)));
      try {
        const filter = await app.setFilters(filters);
        hpm.post(`/reports/${uniqueId}/pages/${pageName}/visuals/${visualName}/events/filtersApplied`, {
          initiator: "sdk",
          filter
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    } catch (error) {
      res.send(400, error);
    }
  });

  router.patch('/report/settings', async (req, res) => {
    const uniqueId = req.headers['uid'];
    const settings = req.body;
    try {
      await app.validateSettings(settings);
      try {
        const updatedSettings = await app.updateSettings(settings);
        hpm.post(`/reports/${uniqueId}/events/settingsUpdated`, {
          initiator: "sdk",
          settings: updatedSettings
        });
      } catch (error) {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      }
      res.send(202, {});
    }
    catch (error) {
      res.send(400, error);
    }
  });

  router.get('/report/data', async (req, res) => {
    const data = await app.exportData();
    res.send(200, data);
  });

  router.post('/report/refresh', (req, res) => {
    app.refreshData();
    res.send(202);
  });

  router.post('/report/print', (req, res) => {
    app.print();
    res.send(202);
  });

  router.post('report/switchMode/Edit', (req, res) => {
    app.switchMode();
    res.send(202);
  });

  router.post('report/save', (req, res) => {
    app.save();
    res.send(202);
  });

  router.post('report/saveAs', (req, res) => {
    const settings = req.body;
    app.saveAs(settings);
    res.send(202);
  });

  router.post('report/token', (req, res) => {
    const settings = req.body;
    app.setAccessToken(settings);
    res.send(202);
  });
  return hpm;
}
