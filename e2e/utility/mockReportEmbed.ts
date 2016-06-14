import * as Wpmp from 'window-post-message-proxy';
import * as Hpm from 'http-post-message';
import * as Router from 'powerbi-router';
import { mockAppSpyObj, mockApp } from './mockApp';

export const spyApp = mockAppSpyObj;

export function setup(iframeContentWindow: Window, parentWindow: Window, logMessages: boolean, name: string = 'MockAppWindowPostMessageProxy'): Hpm.HttpPostMessage {
  const parent = parentWindow || iframeContentWindow.parent;
  const wpmp = new Wpmp.WindowPostMessageProxy(parentWindow, {
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
  });
  const router = new Router.Router(wpmp);
  const app = mockApp;
  
  /**
   * Phase 1
   */
  router.post('/report/load', (req, res) => {
    const loadConfig = req.body;
    return app.validateLoad(loadConfig)
      .then(() => {
        app.load(loadConfig)
          .then(() => {
            const initiator = "sdk";
            hpm.post('/report/events/loaded', {
              initiator
            });
          }, error => {
            hpm.post('/report/events/error', error);
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
    const page = req.body;
    return app.validatePage(page)
      .then(() => {
        app.setActivePage(page)
          .then(page => {
            const initiator = "sdk";
            hpm.post('/report/events/pageChanged', {
              initiator,
              page
            });
          }, error => {
            hpm.post('/report/events/error', error);
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
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.addFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post('/report/events/filterAdded', {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });
  
  router.put('/report/filters', (req, res) => {
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.updateFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post('/report/events/filterUpdated', {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });
  
  router.delete('/report/filters', (req, res) => {
    const filter = req.body;
    return app.validateFilter(filter)
      .then(() => {
        app.removeFilter(filter)
          .then(filter => {
            const initiator = "sdk";
            hpm.post('/report/events/filterRemoved', {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });

        res.send(202);
      }, error => {
        res.send(400, error);
      });
  });

  router.delete('/report/allfilters', (req, res) => {
    app.clearFilters()
      .then(filter => {
        const initiator = "sdk";
        hpm.post('/report/events/filtersCleared', {
          initiator,
          filter
        });
      }, error => {
        hpm.post('/report/events/error', error);
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
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.getFilters(target)
      .then(filters => {
        res.send(200, filters);
      });
  });
  
  router.post('/report/pages/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.addFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/pages/${pageName}/events/filterAdded`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });
  
  router.put('/report/pages/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.updateFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/pages/${pageName}/events/filterUpdated`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  router.delete('/report/pages/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };

    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.removeFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/pages/${pageName}/events/filterRemoved`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  router.get('/report/visuals/:pageName/filters', (req, res) => {
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.getFilters(target)
      .then(filters => {
        res.send(200, filters);
      });
  });
  
  router.post('/report/visuals/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.addFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/visuals/${pageName}/events/filterAdded`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });
  
  router.put('/report/visuals/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };
    
    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.updateFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/visuals/${pageName}/events/filterUpdated`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });

  router.delete('/report/visuals/:pageName/filters', (req, res) => {
    const filter = req.body;
    const pageName = req.params.pageName;
    const target = {
      type: "page",
      name: pageName
    };

    return app.validateTarget(target)
      .then(() => app.validateFilter(filter))
      .then(() => {
        app.removeFilter(filter, target)
          .then(filter => {
            const initiator = "sdk";
            hpm.post(`/report/visuals/${pageName}/events/filterRemoved`, {
              initiator,
              filter
            });
          }, error => {
            hpm.post('/report/events/error', error);
          });
        
        res.send(202);
      }, errors => {
        res.send(400, errors);
      });
  });
  
  router.patch('/report/settings', (req, res) => {
    const settings = req.body;
    
    return app.validateSettings(settings)
      .then(() => {
        app.updateSettings(settings)
          .then(updatedSettings => {
            const initiator = "sdk";
            hpm.post(`/report/events/settingsUpdated`, {
              initiator,
              settings: updatedSettings
            });
          }, error => {
            hpm.post('/report/events/error', error);
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
    const target = {
      type: 'visual',
      visual: "xyz?"
    };
    
    return app.exportData(target)
      .then(data => {
        res.send(200, data);
      });
  });
  
  return hpm;
}