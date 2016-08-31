import * as utils from './util';
import * as service from './service';
import * as models from 'powerbi-models';
import * as hpm from 'http-post-message';

declare global {
  interface Document {
    // Mozilla Fullscreen
    mozCancelFullScreen: Function;

    // Ms Fullscreen
    msExitFullscreen: Function;
  }

  interface HTMLIFrameElement {
    // Mozilla Fullscreen
    mozRequestFullScreen: Function;

    // Ms Fullscreen
    msRequestFullscreen: Function;
  }
}

// TODO: Re-use ILoadConfiguration interface to prevent duplicating properties.
// Current issue is that they are optional when embedding since they can be specificed as attributes but they are required when loading.
/**
 * Configuration settings for Power BI embed components
 * 
 * @export
 * @interface IEmbedConfiguration
 */
export interface IEmbedConfiguration {
  type?: string;
  id?: string;
  uniqueId?: string;
  embedUrl?: string;
  accessToken?: string;
  settings?: models.ISettings;
  pageName?: string;
  filters?: models.IFilter[];
}

export interface IInternalEmbedConfiguration extends models.ILoadConfiguration {
  uniqueId: string;
  type: string;
  embedUrl: string;
}

export interface IInternalEventHandler<T> {
  test(event: service.IEvent<T>): boolean;
  handle(event: service.ICustomEvent<T>): void;
}

/**
 * Base class for all Power BI embed components
 * 
 * @export
 * @abstract
 * @class Embed
 */
export abstract class Embed {
  static allowedEvents = ["loaded"];
  static accessTokenAttribute = 'powerbi-access-token';
  static embedUrlAttribute = 'powerbi-embed-url';
  static nameAttribute = 'powerbi-name';
  static typeAttribute = 'powerbi-type';
  static type: string;

  private static defaultSettings: models.ISettings = {
    filterPaneEnabled: true
  };

  allowedEvents = [];

  /**
   * Gets or sets the event handler registered for this embed component.
   * 
   * @type {IInternalEventHandler<any>[]}
   */
  eventHandlers: IInternalEventHandler<any>[];

  /**
   * Gets or sets the Power BI embed service.
   * 
   * @type {service.Service}
   */
  service: service.Service;

  /**
   * Gets or sets the HTML element that contains the Power BI embed component.
   * 
   * @type {HTMLElement}
   */
  element: HTMLElement;

  /**
   * Gets or sets the HTML iframe element that renders the Power BI embed component.
   * 
   * @type {HTMLIFrameElement}
   */
  iframe: HTMLIFrameElement;

  /**
   * Gets or sets the configuration settings for the Power BI embed component.
   * 
   * @type {IInternalEmbedConfiguration}
   */
  config: IInternalEmbedConfiguration;

  /**
   * Creates an instance of Embed.
   * 
   * Note: there is circular reference between embeds and the service, because
   * the service has a list of all embeds on the host page, and each embed has a reference to the service that created it.
   * 
   * @param {service.Service} service
   * @param {HTMLElement} element
   * @param {IEmbedConfiguration} config
   */
  constructor(service: service.Service, element: HTMLElement, config: IEmbedConfiguration) {
    Array.prototype.push.apply(this.allowedEvents, Embed.allowedEvents);
    this.eventHandlers = [];
    this.service = service;
    this.element = element;

    // TODO: Change when Object.assign is available.
    const settings = utils.assign({}, Embed.defaultSettings, config.settings);
    this.config = utils.assign({ settings }, config);
    this.config.accessToken = this.getAccessToken(service.accessToken);
    this.config.embedUrl = this.getEmbedUrl();
    this.config.id = this.getId();
    this.config.uniqueId = this.getUniqueId();

    const iframeHtml = `<iframe style="width:100%;height:100%;" src="${this.config.embedUrl}" scrolling="no" allowfullscreen="true"></iframe>`;

    this.element.innerHTML = iframeHtml;
    this.iframe = <HTMLIFrameElement>this.element.childNodes[0];
    this.iframe.addEventListener('load', () => this.load(this.config), false);
  }

  /**
   * Sends load configuration data.
   * 
   * ```javascript
   * report.load({
   *   type: 'report',
   *   id: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
   *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
   *   settings: {
   *     navContentPaneEnabled: false
   *   },
   *   pageName: "DefaultPage",
   *   filters: [
   *     {
   *        ...  DefaultReportFilter ...
   *     }
   *   ]
   * })
   *   .catch(error => { ... });
   * ```
   * 
   * @param {models.ILoadConfiguration} config
   * @returns {Promise<void>}
   */
  load(config: models.ILoadConfiguration): Promise<void> {
    const errors = models.validateLoad(config);
    if (errors) {
      throw errors;
    }
  
    let loadPath = '/report/load';
    if(this.config && this.config.type === 'dashboard') {
      loadPath = '/dashboard/load';
    }
   
    return this.service.hpm.post<void>(loadPath, config, { uid: this.config.uniqueId }, this.iframe.contentWindow)
    .then(response => {
      utils.assign(this.config, config);
      return response.body;
    },
    response => {
      throw response.body;
    });
  }

  /**
   * Removes one or more event handlers from the list of handlers.
   * If a reference to the existing handle function is specified, remove the specific handler.
   * If the handler is not specified, remove all handlers for the event name specified.
   * 
   * ```javascript
   * report.off('pageChanged')
   * 
   * or 
   * 
   * const logHandler = function (event) {
   *    console.log(event);
   * };
   * 
   * report.off('pageChanged', logHandler);
   * ```
   * 
   * @template T
   * @param {string} eventName
   * @param {service.IEventHandler<T>} [handler]
   */
  off<T>(eventName: string, handler?: service.IEventHandler<T>): void {
    const fakeEvent: service.IEvent<any> = { name: eventName, type: null, id: null, value: null };
    if (handler) {
      utils.remove(eventHandler => eventHandler.test(fakeEvent) && (eventHandler.handle === handler), this.eventHandlers);
      this.element.removeEventListener(eventName, <any>handler);
    }
    else {
      const eventHandlersToRemove = this.eventHandlers
        .filter(eventHandler => eventHandler.test(fakeEvent));

      eventHandlersToRemove
        .forEach(eventHandlerToRemove => {
          utils.remove(eventHandler => eventHandler === eventHandlerToRemove, this.eventHandlers);
          this.element.removeEventListener(eventName, <any>eventHandlerToRemove.handle);
        });
    }
  }

  /**
   * Adds an event handler for a specific event.
   * 
   * ```javascript
   * report.on('pageChanged', (event) => {
   *   console.log('PageChanged: ', event.page.name);
   * });
   * ```
   * 
   * @template T
   * @param {string} eventName
   * @param {service.IEventHandler<T>} handler
   */
  on<T>(eventName: string, handler: service.IEventHandler<T>): void {
    if (this.allowedEvents.indexOf(eventName) === -1) {
      throw new Error(`eventName is must be one of ${this.allowedEvents}. You passed: ${eventName}`);
    }

    this.eventHandlers.push({
      test: (event: service.IEvent<T>) => event.name === eventName,
      handle: handler
    });

    this.element.addEventListener(eventName, <any>handler)
  }

  /**
   * Reloads embed using existing configuration.
   * E.g. For reports this effectively clears all filters and makes the first page active which simulates resetting a report back to loaded state.
   * 
   * ```javascript
   * report.reload();
   * ```
   */
  reload(): Promise<void> {
    return this.load(this.config);
  }

  /**
   * Gets an access token from the first available location: config, attribute, global.
   * 
   * @private
   * @param {string} globalAccessToken
   * @returns {string}
   */
  private getAccessToken(globalAccessToken: string): string {
    const accessToken = this.config.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || globalAccessToken;

    if (!accessToken) {
      throw new Error(`No access token was found for element. You must specify an access token directly on the element using attribute '${Embed.accessTokenAttribute}' or specify a global token at: powerbi.accessToken.`);
    }

    return accessToken;
  }

  /**
   * Gets an embed url from the first available location: options, attribute.
   * 
   * @private
   * @returns {string}
   */
  private getEmbedUrl(): string {
    const embedUrl = this.config.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);

    if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
      throw new Error(`Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '${Embed.embedUrlAttribute}'.`);
    }

    return embedUrl;
  }

  /**
   * Gets a unique ID from the first available location: options, attribute.
   * If neither is provided generate a unique string.
   * 
   * @private
   * @returns {string}
   */
  private getUniqueId(): string {
    return this.config.uniqueId || this.element.getAttribute(Embed.nameAttribute) || utils.createRandomString();
  }

  /**
   * Gets the report ID from the first available location: options, attribute.
   * 
   * @abstract
   * @returns {string}
   */
  abstract getId(): string;

  /**
   * Requests the browser to render the component's iframe in fullscreen mode.
   */
  fullscreen(): void {
    const requestFullScreen = this.iframe.requestFullscreen || this.iframe.msRequestFullscreen || this.iframe.mozRequestFullScreen || this.iframe.webkitRequestFullscreen;
    requestFullScreen.call(this.iframe);
  }

  /**
   * Requests the browser to exit fullscreen mode.
   */
  exitFullscreen(): void {
    if (!this.isFullscreen(this.iframe)) {
      return;
    }

    const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
    exitFullscreen.call(document);
  }


  /**
   * Returns true if the iframe is rendered in fullscreen mode,
   * otherwise returns false.
   * 
   * @private
   * @param {HTMLIFrameElement} iframe
   * @returns {boolean}
   */
  private isFullscreen(iframe: HTMLIFrameElement): boolean {
    const options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];

    return options.some(option => document[option] === iframe);
  }
}