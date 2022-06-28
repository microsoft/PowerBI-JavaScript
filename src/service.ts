// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/prefer-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WindowPostMessageProxy } from 'window-post-message-proxy';
import { HttpPostMessage } from 'http-post-message';
import { Router, IExtendedRequest, Response as IExtendedResponse } from 'powerbi-router';
import { IPage, IReportCreateConfiguration } from 'powerbi-models';
import {
  Embed,
  IBootstrapEmbedConfiguration,
  IDashboardEmbedConfiguration,
  IEmbedConfiguration,
  IEmbedConfigurationBase,
  IQnaEmbedConfiguration,
  IReportEmbedConfiguration,
  ITileEmbedConfiguration,
  IVisualEmbedConfiguration,
} from './embed';
import { Report } from './report';
import { Create } from './create';
import { Dashboard } from './dashboard';
import { Tile } from './tile';
import { Page } from './page';
import { Qna } from './qna';
import { Visual } from './visual';
import * as utils from './util';
import * as sdkConfig from './config';

export interface IEvent<T> {
  type: string;
  id: string;
  name: string;
  value: T;
}

/**
 * @hidden
 */
export interface ICustomEvent<T> extends CustomEvent {
  detail: T;
}

/**
 * @hidden
 */
export interface IEventHandler<T> {
  (event: ICustomEvent<T>): any;
}

/**
 * @hidden
 */
export interface IHpmFactory {
  (wpmp: WindowPostMessageProxy, targetWindow?: Window, version?: string, type?: string, origin?: string): HttpPostMessage;
}

/**
 * @hidden
 */
export interface IWpmpFactory {
  (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window): WindowPostMessageProxy;
}

/**
 * @hidden
 */
export interface IRouterFactory {
  (wpmp: WindowPostMessageProxy): Router;
}

export interface IPowerBiElement extends HTMLElement {
  powerBiEmbed: Embed;
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
  sdkWrapperVersion?: string;
}

export interface IService {
  hpm: HttpPostMessage;
}

export type IComponentEmbedConfiguration = IReportEmbedConfiguration | IDashboardEmbedConfiguration | ITileEmbedConfiguration | IVisualEmbedConfiguration | IQnaEmbedConfiguration;

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
  private static components: (typeof Report | typeof Tile | typeof Dashboard | typeof Qna | typeof Visual)[] = [
    Tile,
    Report,
    Dashboard,
    Qna,
    Visual
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
   * @hidden
   */
  accessToken: string;

  /** The Configuration object for the service*/
  private config: IServiceConfiguration;

  /** A list of Dashboard, Report and Tile components that have been embedded using this service instance. */
  private embeds: Embed[];

  /** TODO: Look for way to make hpm private without sacrificing ease of maintenance. This should be private but in embed needs to call methods.
   *
   * @hidden
   */
  hpm: HttpPostMessage;
  /** TODO: Look for way to make wpmp private.  This is only public to allow stopping the wpmp in tests
   *
   * @hidden
   */
  wpmp: WindowPostMessageProxy;
  router: Router;
  private uniqueSessionId: string;

  /**
   * Creates an instance of a Power BI Service.
   *
   * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
   * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
   * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
   * @param {IServiceConfiguration} [config={}]
   * @hidden
   */
  constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config: IServiceConfiguration = {}) {
    this.wpmp = wpmpFactory(config.wpmpName, config.logMessages);
    this.hpm = hpmFactory(this.wpmp, null, config.version, config.type, config.sdkWrapperVersion);
    this.router = routerFactory(this.wpmp);
    this.uniqueSessionId = utils.generateUUID();

    /**
     * Adds handler for report events.
     */
    this.router.post(`/reports/:uniqueId/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.router.post(`/reports/:uniqueId/pages/:pageName/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.router.post(`/reports/:uniqueId/pages/:pageName/visuals/:visualName/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.router.post(`/dashboards/:uniqueId/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'dashboard',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    this.router.post(`/tile/:uniqueId/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'tile',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    /**
     * Adds handler for Q&A events.
     */
    this.router.post(`/qna/:uniqueId/events/:eventName`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'qna',
        id: req.params.uniqueId as string,
        name: req.params.eventName as string,
        value: req.body
      };

      this.handleEvent(event);
    });

    /**
     * Adds handler for front load 'ready' message.
     */
    this.router.post(`/ready/:uniqueId`, (req, _res) => {
      const event: IEvent<any> = {
        type: 'report',
        id: req.params.uniqueId as string,
        name: 'ready',
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
   *
   * @param {HTMLElement} element
   * @param {IEmbedConfiguration} [config={}]
   * @returns {Embed}
   */
  createReport(element: HTMLElement, config: IEmbedConfiguration | IReportCreateConfiguration): Embed {
    config.type = 'create';
    const powerBiElement = element as IPowerBiElement;
    const component = new Create(this, powerBiElement, config);
    powerBiElement.powerBiEmbed = component;
    this.addOrOverwriteEmbed(component, element);

    return component;
  }

  /**
   * TODO: Add a description here
   *
   * @param {HTMLElement} [container]
   * @param {IEmbedConfiguration} [config=undefined]
   * @returns {Embed[]}
   * @hidden
   */
  init(container?: HTMLElement, config: IEmbedConfiguration = undefined): Embed[] {
    container = (container && container instanceof HTMLElement) ? container : document.body;

    const elements = Array.prototype.slice.call(container.querySelectorAll(`[${Embed.embedUrlAttribute}]`));
    return elements.map((element) => this.embed(element, config));
  }

  /**
   * Given a configuration based on an HTML element,
   * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
   * otherwise creates a new component instance.
   *
   * @param {HTMLElement} element
   * @param {IEmbedConfigurationBase} [config={}]
   * @returns {Embed}
   */
  embed(element: HTMLElement, config: IComponentEmbedConfiguration | IEmbedConfigurationBase = {}): Embed {
    return this.embedInternal(element, config);
  }

  /**
   * Given a configuration based on an HTML element,
   * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
   * otherwise creates a new component instance.
   * This is used for the phased embedding API, once element is loaded successfully, one can call 'render' on it.
   *
   * @param {HTMLElement} element
   * @param {IEmbedConfigurationBase} [config={}]
   * @returns {Embed}
   */
  load(element: HTMLElement, config: IComponentEmbedConfiguration | IEmbedConfigurationBase = {}): Embed {
    return this.embedInternal(element, config, /* phasedRender */ true, /* isBootstrap */ false);
  }

  /**
   * Given an HTML element and entityType, creates a new component instance, and bootstrap the iframe for embedding.
   *
   * @param {HTMLElement} element
   * @param {IBootstrapEmbedConfiguration} config: a bootstrap config which is an embed config without access token.
   */
  bootstrap(element: HTMLElement, config: IComponentEmbedConfiguration | IBootstrapEmbedConfiguration): Embed {
    return this.embedInternal(element, config, /* phasedRender */ false, /* isBootstrap */ true);
  }

  /** @hidden */
  embedInternal(element: HTMLElement, config: IComponentEmbedConfiguration | IEmbedConfigurationBase = {}, phasedRender?: boolean, isBootstrap?: boolean): Embed {
    let component: Embed;
    const powerBiElement = element as IPowerBiElement;

    if (powerBiElement.powerBiEmbed) {
      if (isBootstrap) {
        throw new Error(`Attempted to bootstrap element ${element.outerHTML}, but the element is already a powerbi element.`);
      }

      component = this.embedExisting(powerBiElement, config, phasedRender);
    }
    else {
      component = this.embedNew(powerBiElement, config, phasedRender, isBootstrap);
    }

    return component;
  }

  /** @hidden */
  getNumberOfComponents(): number {
    if (!this.embeds) {
      return 0;
    }

    return this.embeds.length;
  }

  /** @hidden */
  getSdkSessionId(): string {
    return this.uniqueSessionId;
  }

  /**
   * Returns the Power BI Client SDK version
   *
   * @hidden
   */
  getSDKVersion(): string {
    return sdkConfig.default.version;
  }

  /**
   * Given a configuration based on a Power BI element, saves the component instance that reference the element for later lookup.
   *
   * @private
   * @param {IPowerBiElement} element
   * @param {IEmbedConfigurationBase} config
   * @returns {Embed}
   * @hidden
   */
  private embedNew(element: IPowerBiElement, config: IComponentEmbedConfiguration | IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean): Embed {
    const componentType = config.type || element.getAttribute(Embed.typeAttribute);
    if (!componentType) {
      const scrubbedConfig = { ...config, accessToken: "" };
      throw new Error(`Attempted to embed using config ${JSON.stringify(scrubbedConfig)} on element ${element.outerHTML}, but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '${Embed.typeAttribute}="${Report.type.toLowerCase()}"'.`);
    }

    // Saves the type as part of the configuration so that it can be referenced later at a known location.
    config.type = componentType;

    const Component = utils.find((embedComponent) => componentType === embedComponent.type.toLowerCase(), Service.components);
    if (!Component) {
      throw new Error(`Attempted to embed component of type: ${componentType} but did not find any matching component.  Please verify the type you specified is intended.`);
    }

    const component = new Component(this, element, config, phasedRender, isBootstrap);
    element.powerBiEmbed = component;

    this.addOrOverwriteEmbed(component, element);
    return component;
  }

  /**
   * Given an element that already contains an embed component, load with a new configuration.
   *
   * @private
   * @param {IPowerBiElement} element
   * @param {IEmbedConfigurationBase} config
   * @returns {Embed}
   * @hidden
   */
  private embedExisting(element: IPowerBiElement, config: IComponentEmbedConfiguration | IEmbedConfigurationBase, phasedRender?: boolean): Embed {
    const component = utils.find((x) => x.element === element, this.embeds);
    if (!component) {
      const scrubbedConfig = { ...config, accessToken: "" };
      throw new Error(`Attempted to embed using config ${JSON.stringify(scrubbedConfig)} on element ${element.outerHTML} which already has embedded component associated, but could not find the existing component in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.`);
    }

    // TODO: Multiple embedding to the same iframe is not supported in QnA
    if (config.type && config.type.toLowerCase() === "qna") {
      return this.embedNew(element, config);
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
        const report = new Report(this, element, config, /* phasedRender */ false, /* isBootstrap */ false, element.powerBiEmbed.iframe);
        component.populateConfig(config, /* isBootstrap */ false);
        report.load();
        element.powerBiEmbed = report;

        this.addOrOverwriteEmbed(component, element);

        return report;
      }
      const scrubbedConfig = { ...config, accessToken: "" };
      throw new Error(`Embedding on an existing element with a different type than the previous embed object is not supported.  Attempted to embed using config ${JSON.stringify(scrubbedConfig)} on element ${element.outerHTML}, but the existing element contains an embed of type: ${this.config.type} which does not match the new type: ${config.type}`);
    }

    component.populateConfig(config, /* isBootstrap */ false);
    component.load(phasedRender);

    return component;
  }

  /**
   * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
   * and automatically attempts to embed a powerbi component based on information from other powerbi-* attributes.
   *
   * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
   * This handler is typically useful only for applications that are rendered on the server so that all required data is available when the handler is called.
   *
   * @hidden
   */
  enableAutoEmbed(): void {
    window.addEventListener('DOMContentLoaded', (_event: Event) => this.init(document.body), false);
  }

  /**
   * Returns an instance of the component associated with the element.
   *
   * @param {HTMLElement} element
   * @returns {(Report | Tile)}
   */
  get(element: HTMLElement): Embed {
    const powerBiElement = element as IPowerBiElement;

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
   * @hidden
   */
  find(uniqueId: string): Embed {
    return utils.find((x) => x.config.uniqueId === uniqueId, this.embeds);
  }

  /**
   * Removes embed components whose container element is same as the given element
   *
   * @param {Embed} component
   * @param {HTMLElement} element
   * @returns {void}
   * @hidden
   */
  addOrOverwriteEmbed(component: Embed, element: HTMLElement): void {
    // remove embeds over the same div element.
    this.embeds = this.embeds.filter(function (embed) {
      return embed.element !== element;
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
    const powerBiElement = element as IPowerBiElement;

    if (!powerBiElement.powerBiEmbed) {
      return;
    }

    /** Removes the element frontLoad listener if exists. */
    const embedElement = powerBiElement.powerBiEmbed;
    if (embedElement.frontLoadHandler) {
      embedElement.element.removeEventListener('ready', embedElement.frontLoadHandler, false);
    }

    /** Removes all event handlers. */
    embedElement.allowedEvents.forEach((eventName) => {
      embedElement.off(eventName);
    });

    /** Removes the component from an internal list of components. */
    utils.remove((x) => x === powerBiElement.powerBiEmbed, this.embeds);
    /** Deletes a property from the HTML element. */
    delete powerBiElement.powerBiEmbed;
    /** Removes the iframe from the element. */
    const iframe = element.querySelector('iframe');
    if (iframe) {
      if (iframe.remove !== undefined) {
        iframe.remove();
      }
      else {
        /** Workaround for IE: unhandled rejection TypeError: object doesn't support property or method 'remove' */
        iframe.parentElement.removeChild(iframe);
      }
    }
  }

  /**
   * handles tile events
   *
   * @param {IEvent<any>} event
   * @hidden
   */
  handleTileEvents(event: IEvent<any>): void {
    if (event.type === 'tile') {
      this.handleEvent(event);
    }
  }

  async invokeSDKHook(hook: Function, req: IExtendedRequest, res: IExtendedResponse): Promise<void> {
    if (!hook) {
      res.send(404, null);
      return;
    }

    try {
      let result = await hook(req.body);
      res.send(200, result);
    } catch (error) {
      res.send(400, null);
      console.error(error);
    }
  }

  /**
   * Given an event object, finds the embed component with the matching type and ID, and invokes its handleEvent method with the event object.
   *
   * @private
   * @param {IEvent<any>} event
   * @hidden
   */
  private handleEvent(event: IEvent<any>): void {
    const embed = utils.find(embed => {
      return (embed.config.uniqueId === event.id);
    }, this.embeds);

    if (embed) {
      const value = event.value;

      if (event.name === 'pageChanged') {
        const pageKey = 'newPage';
        const page: IPage = value[pageKey];
        if (!page) {
          throw new Error(`Page model not found at 'event.value.${pageKey}'.`);
        }
        value[pageKey] = new Page(embed, page.name, page.displayName, true /* isActive */);
      }

      utils.raiseCustomEvent(embed.element, event.name, value);
    }
  }

  /**
   * API for warm starting powerbi embedded endpoints.
   * Use this API to preload Power BI Embedded in the background.
   *
   * @public
   * @param {IEmbedConfigurationBase} [config={}]
   * @param {HTMLElement} [element=undefined]
   */
  preload(config: IComponentEmbedConfiguration | IEmbedConfigurationBase, element?: HTMLElement): HTMLIFrameElement {
    const iframeContent = document.createElement("iframe");
    iframeContent.setAttribute("style", "display:none;");
    iframeContent.setAttribute("src", config.embedUrl);
    iframeContent.setAttribute("scrolling", "no");
    iframeContent.setAttribute("allowfullscreen", "false");

    let node = element;
    if (!node) {
      node = document.getElementsByTagName("body")[0];
    }

    node.appendChild(iframeContent);
    iframeContent.onload = () => {
      utils.raiseCustomEvent(iframeContent, "preloaded", {});
    };

    return iframeContent;
  }

  /**
   * Use this API to set SDK info
   *
   * @hidden
   * @param {string} type
   * @returns {void}
   */
     setSdkInfo(type: string, version: string): void {
      this.hpm.defaultHeaders['x-sdk-type'] = type;
      this.hpm.defaultHeaders['x-sdk-wrapper-version'] = version;
    }
}
