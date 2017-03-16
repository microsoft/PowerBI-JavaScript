import * as embed from './embed';
import { Report } from './report';
import { Create } from './create';
import { Dashboard } from './dashboard';
import { Tile } from './tile';
import { Page } from './page';
import * as utils from './util';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';
import * as models from 'powerbi-models';

export interface IEvent<T> {
  type: string;
  id: string;
  name: string;
  value: T;
}

export interface ICustomEvent<T> extends CustomEvent {
  detail: T;
}

export interface IEventHandler<T> {
  (event: ICustomEvent<T>): any;
}

export interface IHpmFactory {
  (wpmp: wpmp.WindowPostMessageProxy, targetWindow?: Window, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
}

export interface IWpmpFactory {
  (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window): wpmp.WindowPostMessageProxy;
}

export interface IRouterFactory {
  (wpmp: wpmp.WindowPostMessageProxy): router.Router;
}

export interface IPowerBiElement extends HTMLElement {
  powerBiEmbed: embed.Embed;
}

export interface IDebugOptions {
  logMessages?: boolean;
  wpmpName?: string;
}

export interface IServiceConfiguration extends IDebugOptions {
  autoEmbedOnContentLoaded?: boolean;
  onError?: (error: any) => any;
  version?: string;
  type?: string;
}

export interface IService {
  hpm: hpm.HttpPostMessage;
}

/**
 * The Power BI Service embed component, which is the entry point to embed all other Power BI components into your application
 *  
 * @export
 * @class Service
 * @implements {IService}
 */
export class Service implements IService {

  /**
   * A list of components that this service can embed
   */
  private static components: (typeof Report | typeof Tile | typeof Dashboard)[] = [
    Tile,
    Report,
    Dashboard
  ];

  /**
   * The default configuration for the service
   */
  private static defaultConfig: IServiceConfiguration = {
    autoEmbedOnContentLoaded: false,
    onError: (...args) => console.log(args[0], args.slice(1))
  };

  /**
   * Gets or sets the access token as the global fallback token to use when a local token is not provided for a report or tile.
   * 
   * @type {string}
   */
  accessToken: string;

  /**The Configuration object for the service*/
  private config: IServiceConfiguration;

  /** A list of Dashboard, Report and Tile components that have been embedded using this service instance. */
  private embeds: embed.Embed[];
  /** TODO: Look for way to make hpm private without sacraficing ease of maitenance. This should be private but in embed needs to call methods. */
  hpm: hpm.HttpPostMessage;
  /** TODO: Look for way to make wpmp private.  This is only public to allow stopping the wpmp in tests */
  wpmp: wpmp.WindowPostMessageProxy;
  private router: router.Router;

  /**
   * Creates an instance of a Power BI Service.
   * 
   * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
   * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
   * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
   * @param {IServiceConfiguration} [config={}]
   */
  constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config: IServiceConfiguration = {}) {
    this.wpmp = wpmpFactory(config.wpmpName, config.logMessages);
    this.hpm = hpmFactory(this.wpmp, null, config.version, config.type);
    this.router = routerFactory(this.wpmp);

    /**
     * Adds handler for report events.
     */
    this.router.post(`/reports/:uniqueId/events/:eventName`, (req, res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId,
        name: req.params.eventName,
        value: req.body
      };

      this.handleEvent(event);
    });
    this.router.post(`/reports/:uniqueId/pages/:pageName/events/:eventName`, (req, res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId,
        name: req.params.eventName,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.router.post(`/dashboards/:uniqueId/events/:eventName`, (req, res) => {
      const event: IEvent<any> = {
        type: 'dashboard',
        id: req.params.uniqueId,
        name: req.params.eventName,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.embeds = [];

    // TODO: Change when Object.assign is available.
    this.config = utils.assign({}, Service.defaultConfig, config);

    if (this.config.autoEmbedOnContentLoaded) {
      this.enableAutoEmbed();
    }
  }

  /**
   * Creates new report
   * @param {HTMLElement} element
   * @param {embed.IEmbedConfiguration} [config={}]
   * @returns {embed.Embed}
   */
  createReport(element: HTMLElement, config: embed.IEmbedConfiguration): embed.Embed {
    config.type = 'create';
    let powerBiElement = <IPowerBiElement>element;
    const component = new Create(this, powerBiElement, config);
    powerBiElement.powerBiEmbed = component;

    this.addOrOverwriteEmbed(component, element);

    return component;
  }

  /**
   * TODO: Add a description here
   * 
   * @param {HTMLElement} [container]
   * @param {embed.IEmbedConfiguration} [config=undefined]
   * @returns {embed.Embed[]}
   */
  init(container?: HTMLElement, config: embed.IEmbedConfiguration = undefined): embed.Embed[] {
    container = (container && container instanceof HTMLElement) ? container : document.body;

    const elements = Array.prototype.slice.call(container.querySelectorAll(`[${embed.Embed.embedUrlAttribute}]`));
    return elements.map(element => this.embed(element, config));
  }

  /**
   * Given a configuration based on an HTML element,
   * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
   * otherwise creates a new component instance.
   * 
   * @param {HTMLElement} element
   * @param {embed.IEmbedConfiguration} [config={}]
   * @returns {embed.Embed}
   */
  embed(element: HTMLElement, config: embed.IEmbedConfiguration = {}): embed.Embed {
    let component: embed.Embed;
    let powerBiElement = <IPowerBiElement>element;

    if (powerBiElement.powerBiEmbed) {
      component = this.embedExisting(powerBiElement, config);
    }
    else {
      component = this.embedNew(powerBiElement, config);
    }

    return component;
  }

  /**
   * Given a configuration based on a Power BI element, saves the component instance that reference the element for later lookup.
   * 
   * @private
   * @param {IPowerBiElement} element
   * @param {embed.IEmbedConfiguration} config
   * @returns {embed.Embed}
   */
  private embedNew(element: IPowerBiElement, config: embed.IEmbedConfiguration): embed.Embed {
    const componentType = config.type || element.getAttribute(embed.Embed.typeAttribute);
    if (!componentType) {
      throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML}, but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '${embed.Embed.typeAttribute}="${Report.type.toLowerCase()}"'.`);
    }

    // Saves the type as part of the configuration so that it can be referenced later at a known location.
    config.type = componentType;

    const Component = utils.find(component => componentType === component.type.toLowerCase(), Service.components);
    if (!Component) {
      throw new Error(`Attempted to embed component of type: ${componentType} but did not find any matching component.  Please verify the type you specified is intended.`);
    }

    const component = new Component(this, element, config);
    element.powerBiEmbed = component;

    this.addOrOverwriteEmbed(component, element);
    return component;
  }

  /**
   * Given an element that already contains an embed component, load with a new configuration.
   * 
   * @private
   * @param {IPowerBiElement} element
   * @param {embed.IEmbedConfiguration} config
   * @returns {embed.Embed}
   */
  private embedExisting(element: IPowerBiElement, config: embed.IEmbedConfiguration): embed.Embed {
    const component = utils.find(x => x.element === element, this.embeds);
    if (!component) {
      throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML} which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.`);
    }

    /**
     * TODO: Dynamic embed type switching could be supported but there is work needed to prepare the service state and DOM cleanup.
     * remove all event handlers from the DOM, then reset the element to initial state which removes iframe, and removes from list of embeds
     * then we can call the embedNew function which would allow setting the proper embedUrl and construction of object based on the new type.
     */
    if (typeof config.type === "string" && config.type !== component.config.type) {

      /**
       * When loading report after create we want to use existing Iframe to optimize load period
       */
      if (config.type === "report" && component.config.type === "create") {
        const report = new Report(this, element, config, element.powerBiEmbed.iframe);
        report.load(<embed.IInternalEmbedConfiguration>config);
        element.powerBiEmbed = report;

        this.addOrOverwriteEmbed(component, element);

        return report;
      }

      throw new Error(`Embedding on an existing element with a different type than the previous embed object is not supported.  Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML}, but the existing element contains an embed of type: ${this.config.type} which does not match the new type: ${config.type}`);
    }

    component.load(<embed.IInternalEmbedConfiguration>config);

    return component;
  }

  /**
   * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
   * and automatically attempts to embed a powerbi component based on information from other powerbi-* attributes.
   *
   * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
   * This handler is typically useful only for applications that are rendered on the server so that all required data is available when the handler is called.
   */
  enableAutoEmbed(): void {
    window.addEventListener('DOMContentLoaded', (event: Event) => this.init(document.body), false);
  }

  /**
   * Returns an instance of the component associated with the element.
   * 
   * @param {HTMLElement} element
   * @returns {(Report | Tile)}
   */
  get(element: HTMLElement): Report | Tile | Dashboard {
    const powerBiElement = <IPowerBiElement>element;

    if (!powerBiElement.powerBiEmbed) {
      throw new Error(`You attempted to get an instance of powerbi component associated with element: ${element.outerHTML} but there was no associated instance.`);
    }

    return powerBiElement.powerBiEmbed;
  }

  /**
   * Finds an embed instance by the name or unique ID that is provided.
   * 
   * @param {string} uniqueId
   * @returns {(Report | Tile)}
   */
  find(uniqueId: string): Report | Tile | Dashboard {
    return utils.find(x => x.config.uniqueId === uniqueId, this.embeds);
  }

  addOrOverwriteEmbed(component: embed.Embed, element: HTMLElement): void {
    // remove embeds over the same div element.
    this.embeds = this.embeds.filter(function (embed) {
      return embed.element.id !== element.id;
    });

    this.embeds.push(component);
  }

  /**
   * Given an HTML element that has a component embedded within it, removes the component from the list of embedded components, removes the association between the element and the component, and removes the iframe.
   * 
   * @param {HTMLElement} element
   * @returns {void}
   */
  reset(element: HTMLElement): void {
    const powerBiElement = <IPowerBiElement>element;

    if (!powerBiElement.powerBiEmbed) {
      return;
    }

    /** Removes the component from an internal list of components. */
    utils.remove(x => x === powerBiElement.powerBiEmbed, this.embeds);
    /** Deletes a property from the HTML element. */
    delete powerBiElement.powerBiEmbed;
    /** Removes the iframe from the element. */
    const iframe = element.querySelector('iframe');
    if (iframe) {
      if (iframe.remove !== undefined) {
        iframe.remove();
      } else {
        // workaround for IE: Unhandled rejection TypeError: object doesn't support property or method 'remove'
        iframe.parentElement.removeChild(iframe);
      }
    }
  }

  /**
   * Given an event object, finds the embed component with the matching type and ID, and invokes its handleEvent method with the event object.
   * 
   * @private
   * @param {IEvent<any>} event
   */
  private handleEvent(event: IEvent<any>): void {
    const embed = utils.find(embed => {
      return (embed.config.uniqueId === event.id);
    }, this.embeds);

    if (embed) {
      const value = event.value;

      if (event.name === 'pageChanged') {
        const pageKey = 'newPage';
        const page: models.IPage = value[pageKey];
        if (!page) {
          throw new Error(`Page model not found at 'event.value.${pageKey}'.`);
        }
        value[pageKey] = new Page(embed, page.name, page.displayName);
      }

      utils.raiseCustomEvent(embed.element, event.name, value);
    }
  }
}