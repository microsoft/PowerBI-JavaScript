import * as utils from './util';
import * as service from './service';
import * as sdkConfig from './config';
import * as models from 'powerbi-models';
import { Defaults } from './defaults';

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

/**
 * Prepare configuration for Power BI embed components.
 *
 * @export
 * @interface IBootstrapEmbedConfiguration
 */
export interface IBootstrapEmbedConfiguration {
  hostname?: string;
  embedUrl?: string;
  settings?: ISettings;
  uniqueId?: string;
  type?: string;
  groupId?: string;
  bootstrapped?: boolean;
}

/**
 * Base Configuration settings for Power BI embed components
 *
 * @export
 * @interface IEmbedConfigurationBase
 * @extends IBootstrapEmbedConfiguration
 */
export interface IEmbedConfigurationBase extends IBootstrapEmbedConfiguration {
  accessToken?: string;
  tokenType?: models.TokenType;
}

// TODO: Re-use ILoadConfiguration interface to prevent duplicating properties.
// Current issue is that they are optional when embedding since they can be specificed as attributes but they are required when loading.
/**
 * Configuration settings for Power BI embed components
 *
 * @export
 * @interface IEmbedConfiguration
 */
export interface IEmbedConfiguration extends IEmbedConfigurationBase {
  id?: string;
  settings?: IEmbedSettings;
  pageName?: string;
  filters?: models.IFilter[];
  pageView?: models.PageView;
  datasetId?: string;
  permissions?: models.Permissions;
  viewMode?: models.ViewMode;
  action?: string;
  dashboardId?: string;
  height?: number;
  width?: number;
  theme?: models.IReportTheme;
}

export interface IVisualEmbedConfiguration extends IEmbedConfiguration {
  visualName: string;
}

/**
 * Configuration settings for Power BI QNA embed component
 *
 * @export
 * @interface IEmbedConfiguration
 */
export interface IQnaEmbedConfiguration extends IEmbedConfigurationBase {
  datasetIds: string[];
  question?: string;
  viewMode?: models.QnaMode;
}

export interface ILocaleSettings {
  language?: string;
  formatLocale?: string;
}

export interface ISettings {
  localeSettings?: ILocaleSettings;
}

export interface IEmbedSettings extends models.ISettings, ISettings {
}

export interface IQnaSettings extends models.IQnaSettings, ISettings {
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
  static allowedEvents = ["loaded", "saved", "rendered", "saveAsTriggered", "error", "dataSelected", "buttonClicked"];
  static accessTokenAttribute = 'powerbi-access-token';
  static embedUrlAttribute = 'powerbi-embed-url';
  static nameAttribute = 'powerbi-name';
  static typeAttribute = 'powerbi-type';
  static defaultEmbedHostName = "https://app.powerbi.com";

  static type: string;

  static maxFrontLoadTimes: number = 2;

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
   * @type {IEmbedConfigurationBase}
   */
  config: IEmbedConfigurationBase;

  /**
   * Gets or sets the bootstrap configuration for the Power BI embed component received by powerbi.bootstrap().
   *
   * @type {IBootstrapEmbedConfiguration}
   */
  bootstrapConfig: IBootstrapEmbedConfiguration;

  /**
   * Gets or sets the configuration settings for creating report.
   *
   * @type {models.IReportCreateConfiguration}
   */
  createConfig: models.IReportCreateConfiguration;

  /**
   * Url used in the load request.
   */
  loadPath: string;

  /**
   * Url used in the load request.
   */
  phasedLoadPath: string;

  /**
   * Type of embed
   */
  embeType: string;

  /**
   * Handler function for the 'ready' event
   */
  frontLoadHandler: () => any;

  /**
   * Creates an instance of Embed.
   *
   * Note: there is circular reference between embeds and the service, because
   * the service has a list of all embeds on the host page, and each embed has a reference to the service that created it.
   *
   * @param {service.Service} service
   * @param {HTMLElement} element
   * @param {IEmbedConfigurationBase} config
   */
  constructor(service: service.Service, element: HTMLElement, config: IEmbedConfigurationBase, iframe?: HTMLIFrameElement, phasedRender?: boolean, isBootstrap?: boolean) {
    Array.prototype.push.apply(this.allowedEvents, Embed.allowedEvents);
    this.eventHandlers = [];
    this.service = service;
    this.element = element;
    this.iframe = iframe;
    this.embeType = config.type.toLowerCase();

    this.populateConfig(config, isBootstrap);

    if (this.embeType === 'create') {
      this.setIframe(false /*set EventListener to call create() on 'load' event*/, phasedRender, isBootstrap);
    } else {
      this.setIframe(true /*set EventListener to call load() on 'load' event*/, phasedRender, isBootstrap);
    }
  }

  /**
   * Sends createReport configuration data.
   *
   * ```javascript
   * createReport({
   *   datasetId: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
   *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
   * ```
   *
   * @param {models.IReportCreateConfiguration} config
   * @returns {Promise<void>}
   */
  createReport(config: models.IReportCreateConfiguration): Promise<void> {
    const errors = models.validateCreateReport(config);
    if (errors) {
      throw errors;
    }

    return this.service.hpm.post<void>("/report/create", config, { uid: this.config.uniqueId, sdkSessionId: this.service.getSdkSessionId() }, this.iframe.contentWindow)
      .then(response => {
        return response.body;
      },
      response => {
        throw response.body;
      });
  }

  /**
   * Saves Report.
   *
   * @returns {Promise<void>}
   */
  save(): Promise<void> {
    return this.service.hpm.post<models.IError[]>('/report/save', null, { uid: this.config.uniqueId }, this.iframe.contentWindow)
      .then(response => {
        return response.body;
      })
      .catch(response => {
        throw response.body;
      });
  }

  /**
   * SaveAs Report.
   *
   * @returns {Promise<void>}
   */
  saveAs(saveAsParameters: models.ISaveAsParameters): Promise<void> {
    return this.service.hpm.post<models.IError[]>('/report/saveAs', saveAsParameters, { uid: this.config.uniqueId }, this.iframe.contentWindow)
      .then(response => {
        return response.body;
      })
      .catch(response => {
        throw response.body;
      });
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
   * @param {boolean} phasedRender
   * @returns {Promise<void>}
   */
  load(config: IEmbedConfigurationBase, phasedRender?: boolean): Promise<void> {
    if (!config.accessToken) {
      return;
    }

    const path = phasedRender && config.type === 'report' ? this.phasedLoadPath : this.loadPath;
    const headers = {
      uid: this.config.uniqueId,
      sdkSessionId: this.service.getSdkSessionId(),
      bootstrapped: this.config.bootstrapped,
      sdkVersion: sdkConfig.default.version
    };

    return this.service.hpm.post<void>(path, config, headers, this.iframe.contentWindow)
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
   * Set accessToken.
   *
   * @returns {Promise<void>}
   */
  setAccessToken(accessToken: string): Promise<void> {
    var embedType = this.config.type;
    embedType = (embedType === 'create' || embedType === 'visual' || embedType === 'qna') ? 'report' : embedType;
    return this.service.hpm.post<models.IError[]>('/' + embedType + '/token', accessToken, { uid: this.config.uniqueId }, this.iframe.contentWindow)
      .then(response => {
        this.config.accessToken = accessToken;
        this.element.setAttribute(Embed.accessTokenAttribute, accessToken);
        this.service.accessToken = accessToken;
        return response.body;
      })
      .catch(response => {
        throw response.body;
      });
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
   * Populate config for create and load
   *
   * @param {IEmbedConfiguration}
   * @returns {void}
   */
  populateConfig(config: IBootstrapEmbedConfiguration, isBootstrap: boolean): void {
    if (this.bootstrapConfig) {
      this.config = utils.assign({}, this.bootstrapConfig, config);

      // reset bootstrapConfig because we do not want to merge it in re-embed scenario.
      this.bootstrapConfig = null;
    }
    else {
      // Copy config - important for multiple iframe scenario.
      // Otherwise, if a user uses the same config twice, same unique Id which will be used in different iframes.
      this.config = utils.assign({}, config);
    }

    this.config.embedUrl = this.getEmbedUrl(isBootstrap);
    this.config.groupId = this.getGroupId();
    this.addLocaleToEmbedUrl(config);
    this.config.uniqueId = this.getUniqueId();

    if (isBootstrap) {
      // save current config in bootstrapConfig to be able to merge it on next call to powerbi.embed
      this.bootstrapConfig = this.config;
      this.bootstrapConfig.bootstrapped = true;
    }
    else {
      this.config.accessToken = this.getAccessToken(this.service.accessToken);
    }

    this.configChanged(isBootstrap);
  }

  /**
   * Adds locale parameters to embedUrl
   *
   * @private
   * @param {IEmbedConfiguration} config
   */
  private addLocaleToEmbedUrl(config: IEmbedConfiguration): void {
      if (!config.settings) {
        return;
      }
      let localeSettings = config.settings.localeSettings
      if (localeSettings && localeSettings.language) {
        this.config.embedUrl = utils.addParamToUrl(this.config.embedUrl, 'language', localeSettings.language);
      }
      if (localeSettings && localeSettings.formatLocale) {
        this.config.embedUrl = utils.addParamToUrl(this.config.embedUrl, 'formatLocale', localeSettings.formatLocale);
      }
  }

  /**
   * Gets an embed url from the first available location: options, attribute.
   *
   * @private
   * @returns {string}
   */
  private getEmbedUrl(isBootstrap: boolean): string {
    let embedUrl = this.config.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);

    if (isBootstrap && !embedUrl) {
      // Prepare flow, embed url was not provided, use hostname to build embed url.
      embedUrl = this.getDefaultEmbedUrl(this.config.hostname);
    }

    if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
      throw new Error(`Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '${Embed.embedUrlAttribute}'.`);
    }

    return embedUrl;
  }

  private getDefaultEmbedUrl(hostname: string): string {
    if (!hostname) {
      hostname = Embed.defaultEmbedHostName;
    }

    let endpoint = this.getDefaultEmbedUrlEndpoint();

    // Trim spaces to fix user mistakes.
    hostname = hostname.toLowerCase().trim();

    if (hostname.indexOf("http://") === 0) {
      throw new Error("HTTP is not allowed. HTTPS is required");
    }

    if (hostname.indexOf("https://") === 0) {
      return `${hostname}/${endpoint}`;
    }

    return `https://${hostname}/${endpoint}`;
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
   * Gets the group ID from the first available location: options, embeddedUrl.
   *
   * @private
   * @returns {string}
   */
  private getGroupId(): string {
    return this.config.groupId || Embed.findGroupIdFromEmbedUrl(this.config.embedUrl);
  }

  /**
   * Gets the report ID from the first available location: options, attribute.
   *
   * @abstract
   * @returns {string}
   */
  abstract getId(): string;

  /**
   * Raise a config changed event.
   *
   * @returns {void}
   */
  abstract configChanged(isBootstrap: boolean): void;

  /**
   * Gets default embed endpoint for each entity.
   * For example: report embed endpoint is reportEmbed.
   * This will help creating a default embed URL such as: https://app.powerbi.com/reportEmbed
   *
   * @returns {string} endpoint.
   */
  abstract getDefaultEmbedUrlEndpoint(): string;

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

  /**
   * Validate load and create configuration.
   */
  abstract validate(config: IEmbedConfigurationBase): models.IError[];

  /**
   * Sets Iframe for embed
   */
  private setIframe(isLoad: boolean, phasedRender?: boolean, isBootstrap?: boolean): void {
    if (!this.iframe) {
      var iframeContent = document.createElement("iframe");
      var embedUrl = this.config.uniqueId ? utils.addParamToUrl(this.config.embedUrl, 'uid', this.config.uniqueId) : this.config.embedUrl;
      iframeContent.style.width = '100%';
      iframeContent.style.height = '100%';
      iframeContent.setAttribute("src", embedUrl);
      iframeContent.setAttribute("scrolling", "no");
      iframeContent.setAttribute("allowfullscreen", "true");
      var node = this.element;
      while(node.firstChild) {
          node.removeChild(node.firstChild);
      }
      node.appendChild(iframeContent);
      this.iframe = <HTMLIFrameElement>node.firstChild;
    }

    if (isLoad) {
      if (!isBootstrap) {
        // Validate config if it's not a bootstrap case.
        const errors = this.validate(this.config);
        if (errors) {
          throw errors;
        }
      }

      this.iframe.addEventListener('load', () => this.load(this.config, phasedRender), false);

      if (this.service.getNumberOfComponents() <= Embed.maxFrontLoadTimes) {
        this.frontLoadHandler = () => this.frontLoadSendConfig(this.config);

        // 'ready' event is fired by the embedded element (not by the iframe)
        this.element.addEventListener('ready', this.frontLoadHandler, false);
      }
    } else {
      this.iframe.addEventListener('load', () => this.createReport(this.createConfig), false);
    }
  }

  /**
   * Sets Iframe's title
   */
  setComponentTitle(title: string): void {
    if(!this.iframe) {
      return;
    }
    if(title == null) {
      this.iframe.removeAttribute("title");
    } else {
      this.iframe.setAttribute("title", title);
    }
  }

  /**
   * Sets element's tabindex attribute
   */
  setComponentTabIndex(tabIndex?: number): void {
    if(!this.element) {
      return;
    }
    this.element.setAttribute("tabindex", (tabIndex == null) ? "0" : tabIndex.toString());
  }

  /**
   * Removes element's tabindex attribute
   */
  removeComponentTabIndex(tabIndex?: number): void {
    if(!this.element) {
      return;
    }
    this.element.removeAttribute("tabindex");
  }

  /**
   * Adds the ability to get groupId from url.
   * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
   *
   * @static
   * @param {string} url
   * @returns {string}
   */
  static findGroupIdFromEmbedUrl(url: string): string {
      const groupIdRegEx = /groupId="?([^&]+)"?/
      const groupIdMatch = url.match(groupIdRegEx);

      let groupId;
      if (groupIdMatch) {
          groupId = groupIdMatch[1];
      }

      return groupId;
  }

  /**
   * Sends the config for front load calls, after 'ready' message is received from the iframe
   */
  private frontLoadSendConfig(config: IEmbedConfigurationBase): Promise<void> {
    if (!config.accessToken) {
      return;
    }

    const errors = this.validate(config);
    if (errors) {
      throw errors;
    }

    // contentWindow must be initialized
    if (this.iframe.contentWindow == null)
        return;

    return this.service.hpm.post<void>("/frontload/config", config, { uid: this.config.uniqueId }, this.iframe.contentWindow).then(response => {
      return response.body;
    },
    response => {
      throw response.body;
    });
  }
}
