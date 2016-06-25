import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import * as models from 'powerbi-models';
import { mockAppSpyObj, mockApp } from './mockApp';

export const spyApp = mockAppSpyObj;

export function setupMockApp(iframeContentWindow: Window, parentWindow: Window, logMessages: boolean, name: string = 'MockAppWindowPostMessageProxy'): Hpm.HttpPostMessage {
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
  const hpm = new Hpm.HttpPostMessage(parent, wpmp, {
    'origin': 'reportEmbedMock',
    'x-version': '1.0.0'
  });
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
  router.post('/report/load', (req, res) => {
    const uniqueId = req.headers['uid'];
    const loadConfig = req.body;
    return app.validateLoad(loadConfig)
      .then(() => {
        app.load(loadConfig)
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
          .then(page => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/pageChanged`, {
              initiator,
              page
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
   * Phase 2
   */
  router.get('/report/filters', (req, res) => {
    return app.getFilters()
      .then(filters => {
        res.send(200, filters);
      });
  });
  
  router.post('/report/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.addFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/filterAdded`, {
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
  
  router.put('/report/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.updateFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/filterUpdated`, {
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
  
  router.delete('/report/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.removeFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/events/filterRemoved`, {
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

  router.delete('/report/allfilters', (req, res) => {
    const uniqueId = req.headers['uid'];
    app.clearFilters()
      .then(filter => {
        const initiator = "sdk";
        hpm.post(`/reports/${uniqueId}/events/filtersCleared`, {
          initiator,
          filter
        });
      }, error => {
        hpm.post(`/reports/${uniqueId}/events/error`, error);
      });
    res.send(202);
  });
  
  /**
   * Phase 3
   */
  /**
   * TODO: Investigate the api for getting setting filters at targets.
   * Currently we are transforming the target into url parameters and then back out of url parameters
   * although this is more correct for use of HTTP, it might be easier to just keep it as an object in the body.
   */
  router.get('/report/pages/:pageName/filters', (req, res) => {
    const pageName = req.params.pageName;
    const target: models.ITarget = {
      type: "page",
      name: pageName
    };
    
    return app.getFilters(target)
      .then(filters => {
        res.send(200, filters);
      });
  });
  
  router.post('/report/pages/:pageName/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const pageName = req.params.pageName;
    const target: models.ITarget = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.addFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filterAdded`, {
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
  
  router.put('/report/pages/:pageName/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const pageName = req.params.pageName;
    const target: models.ITarget = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.updateFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filterUpdated`, {
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

  router.delete('/report/pages/:pageName/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const pageName = req.params.pageName;
    const target: models.ITarget = {
      type: "page",
      name: pageName
    };

    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.removeFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/pages/${pageName}/events/filterRemoved`, {
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

  router.get('/report/visuals/:visualId/filters', (req, res) => {
    const visualId = req.params.visualId;
    const target: models.ITarget = {
      type: "visual",
      id: visualId
    };
    
    return app.getFilters(target)
      .then(filters => {
        res.send(200, filters);
      });
  });
  
  router.post('/report/visuals/:visualId/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const visualId = req.params.visualId;
    const target: models.ITarget = {
      type: "visual",
      id: visualId
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.addFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/visuals/${visualId}/events/filterAdded`, {
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
  
  router.put('/report/visuals/:visualId/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const visualId = req.params.visualId;
    const target: models.ITarget = {
      type: "visual",
      id: visualId
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.updateFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/visuals/${visualId}/events/filterUpdated`, {
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

  router.delete('/report/visuals/:visualId/filters', (req, res) => {
    const uniqueId = req.headers['uid'];
    const filter = req.body;
    const visualId = req.params.visualId;
    const target: models.ITarget = {
      type: "visual",
      id: visualId
    };

    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.removeFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/reports/${uniqueId}/visuals/${visualId}/events/filterRemoved`, {
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
  })
  
  /**
   * Phase 4
   */
  // No work for router
  
  /**
   * Phase 5
   */
  router.get('/report/data', (req, res) => {
    const target: models.ITarget = {
      type: 'visual',
      id: "xyz?"
    };
    
    return app.exportData(target)
      .then(data => {
        res.send(200, data);
      });
  });
  
  return hpm;
}