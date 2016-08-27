/*! powerbi-client v2.0.0-beta.13 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as models from 'powerbi-models';
declare global  {
    interface Document {
        mozCancelFullScreen: Function;
        msExitFullscreen: Function;
    }
    interface HTMLIFrameElement {
        mozRequestFullScreen: Function;
        msRequestFullscreen: Function;
    }
}
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
    filters?: (models.IBasicFilter | models.IAdvancedFilter)[];
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
export declare abstract class Embed {
    static allowedEvents: string[];
    static accessTokenAttribute: string;
    static embedUrlAttribute: string;
    static nameAttribute: string;
    static typeAttribute: string;
    static type: string;
    private static defaultSettings;
    allowedEvents: any[];
    /**
     * Gets or set the event handler registered for this embed component
     *
     * @type {IInternalEventHandler<any>[]}
     */
    eventHandlers: IInternalEventHandler<any>[];
    /**
     * Gets or sets the Power BI embed service
     *
     * @type {service.Service}
     */
    service: service.Service;
    /**
     * Gets or sets the HTML element containing the Power BI embed component
     *
     * @type {HTMLElement}
     */
    element: HTMLElement;
    /**
     * Gets or sets the HTML iframe element that renders the Power BI embed component
     *
     * @type {HTMLIFrameElement}
     */
    iframe: HTMLIFrameElement;
    /**
     * Gets or sets the configuration settings for the embed component
     *
     * @type {IInternalEmbedConfiguration}
     */
    config: IInternalEmbedConfiguration;
    /**
     * Creates an instance of Embed.
     *
     * Note: there is circular reference between embeds and service
     * The service has list of all embeds on the host page, and each embed has reference to the service that created it.
     *
     * @param {service.Service} service
     * @param {HTMLElement} element
     * @param {IEmbedConfiguration} config
     */
    constructor(service: service.Service, element: HTMLElement, config: IEmbedConfiguration);
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
    load(config: models.ILoadConfiguration): Promise<void>;
    /**
     * Removes event handler(s) from list of handlers.
     *
     * If reference to existing handle function is specified remove specific handler.
     * If handler is not specified, remove all handlers for the event name specified.
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
    off<T>(eventName: string, handler?: service.IEventHandler<T>): void;
    /**
     * Adds event handler for specific event.
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
    on<T>(eventName: string, handler: service.IEventHandler<T>): void;
    /**
     * Get access token from first available location: config, attribute, global.
     *
     * @private
     * @param {string} globalAccessToken
     * @returns {string}
     */
    private getAccessToken(globalAccessToken);
    /**
     * Get embed url from first available location: options, attribute.
     *
     * @private
     * @returns {string}
     */
    private getEmbedUrl();
    /**
     * Get unique id from first available location: options, attribute.
     * If neither is provided generate unique string.
     *
     * @private
     * @returns {string}
     */
    private getUniqueId();
    /**
     * Get report id from first available location: options, attribute.
     *
     * @abstract
     * @returns {string}
     */
    abstract getId(): string;
    /**
     * Request the browser to make the component's iframe fullscreen.
     */
    fullscreen(): void;
    /**
     * Exit fullscreen.
     */
    exitFullscreen(): void;
    /**
     * Return true if iframe is fullscreen,
     * otherwise return false
     *
     * @private
     * @param {HTMLIFrameElement} iframe
     * @returns {boolean}
     */
    private isFullscreen(iframe);
}
