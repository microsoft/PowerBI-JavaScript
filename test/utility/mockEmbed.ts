import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import * as models from 'powerbi-models';
import { mockAppSpyObj, mockApp } from './mockApp';

export const spyApp = mockAppSpyObj;

export function setupEmbedMockApp(iframeContentWindow: Window, parentWindow: Window, logMessages: boolean, name: string = 'MockAppWindowPostMessageProxy'): Hpm.HttpPostMessage {
  const parent = parentWindow || iframeContentWindow.parent;
  const wpmp = new Wpmp.WindowPostMessageProxy({
    processTrackingProperties: {
      addTrackingProperties: Hpm.HttpPostMessage.addTrackingProperties,
      getTrackingProperties: Hpm.HttpPostMessage.getTrackingProperties,
    },
    isErrorMessage: Hpm.HttpPostMessage.isErrorMessage,
    receiveWindow: iframeContentWindow,
    name,
    logMessages
  });
  const hpm = new Hpm.HttpPostMessage(wpmp, {
    'origin': 'reportEmbedMock',
    'x-version': '1.0.0'
  }, parent);
  const router = new Router.Router(wpmp);
  const app = mockApp;

  /**
   * Setup not found handlers.
   */
  function notFoundHandler(req, res) {
    res.send(404, `Not Found. Url: ${req.params.notfound} was not found.`);
  };
  router.get('*notfound', notFoundHandler);
  router.post('*notfound', notFoundHandler);
  router.patch('*notfound', notFoundHandler);
  router.put('*notfound', notFoundHandler);
  router.delete('*notfound', notFoundHandler);

  /**
   * Phase 1
   */
  
  /**
   * Dashboard Embed
   */
  router.post('/dashboard/load', (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    return app.validateDashboardLoad(loadConfig)
      .then(() => {
        app.dashboardLoad(loadConfig)
          .then(() => {
            const initiator = "sdk";
            hpm.post(`/dashboards/${uniqueId}/events/loaded`, {
              initiator
            });
          }, error => {
            hpm.post(`/dashboards/${uniqueId}/events/error`, error);
          });
          
        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });
  
  /**
   * Create Report
   */
  router.post('/report/create', (req, res) => {
    const uniqueId = req.headers['uid'];
    const createConfig = req.body;
    return app.validateCreateReport(createConfig)
      .then(() => {
        app.reportLoad(createConfig)
          .then(() => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/loaded`, {
              initiator
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });

  /**
   * Report Embed
   */
  router.post('/report/load', (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    return app.validateReportLoad(loadConfig)
      .then(() => {
        app.reportLoad(loadConfig)
          .then(() => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/loaded`, {
              initiator
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });

  /**
   * Report Embed
   */
  router.post('/report/prepare', (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    return app.validateReportLoad(loadConfig)
      .then(() => {
        app.reportLoad(loadConfig)
          .then(() => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/loaded`, {
              initiator
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });

  router.post('/report/render', (req, res) => {
    app.render();
    res.send(202);
  });

  router.get('/report/pages', (req, res) => {
    return app.getPages()
      .then(pages => {
        res.send(200, pages);
      }, error => {
        res.send(500, error);
      });
  });

  router.put('/report/pages/active', (req, res) => {
    const uniqueId = req.headers['uid'];
    const page = req.body;
    return app.validatePage(page)
      .then(() => {
        app.setPage(page)
          .then(() => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/pageChanged`, {
              initiator,
              newPage: page
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  /**
   * Phase 2
   */
  router.get('/report/filters', (req, res) => {
    return app.getFilters()
      .then(filters => {
        res.send(200, filters);
      }, error => {
        res.send(500, error);
      });
  });

  router.put('/report/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filters = req.body;

    return Promise.all(filters.map(filter => app.validateFilter(filter)))
      .then(() => {
        app.setFilters(filters)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/filtersApplied`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });

  /**
   * Phase 3
   */
  router.get('/report/pages/:pageName/filters', (req, res) => {
    const page = {
      name: req.params.pageName,
      displayName: null
    };

    return app.validatePage(page)
      .then(() => {
        return app.getFilters()
          .then(filters => {
            res.send(200, filters);
          }, error => {
            res.send(500, error);
          });
      }, errors => {
        res.send(400, errors);
      });
  });

  router.put('/report/pages/:pageName/filters', (req, res) => {
    const pageName = req.params.pageName;
    const uniqueId = req.headers['uid'];
    const filters = req.body;
    const page: models.IPage = {
      name: pageName,
      displayName: null
    };

    return app.validatePage(page)
      .then(() => Promise.all(filters.map(filter => app.validateFilter(filter))))
      .then(() => {
        app.setFilters(filters)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filtersApplied`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  router.get('/report/pages/:pageName/visuals/:visualName/filters', (req, res) => {
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

    return app.validateVisual(page, visual)
      .then(() => {
        return app.getFilters()
          .then(filters => {
            res.send(200, filters);
          }, error => {
            res.send(500, error);
          });
      }, errors => {
        res.send(400, errors);
      });
  });

  router.put('/report/pages/:pageName/visuals/:visualName/filters', (req, res) => {
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

    return app.validateVisual(page, visual)
      .then(() => Promise.all(filters.map(filter => app.validateFilter(filter))))
      .then(() => {
        app.setFilters(filters)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/pages/${pageName}/visuals/${visualName}/events/filtersApplied`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  router.patch('/report/settings', (req, res) => {
    const uniqueId = req.headers['uid'];
    const settings = req.body;

    return app.validateSettings(settings)
      .then(() => {
        app.updateSettings(settings)
          .then(updatedSettings => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/settingsUpdated`, {
              initiator,
              settings: updatedSettings
            });
          }, error => {
            hpm.post(`/reports/${uniqueId}/events/error`, error);
          });

        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  /**
   * Phase 4
   */
  router.get('/report/data', (req, res) => {
    return app.exportData()
      .then(data => {
        res.send(200, data);
      });
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