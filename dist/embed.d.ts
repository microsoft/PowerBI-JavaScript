/*! powerbi-client v2.0.0-beta.12 | (c) 2016 Microsoft Corporation MIT */
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
export interface IEmbedConfiguration {
    type?: string;
    id?: string;
    uniqueId?: string;
    embedUrl?: string;
    accessToken?: string;
    settings?: models.ISettings;
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
export declare abstract class Embed {
    static allowedEvents: string[];
    static accessTokenAttribute: string;
    static embedUrlAttribute: string;
    static nameAttribute: string;
    static typeAttribute: string;
    static type: string;
    private static defaultSettings;
    allowedEvents: any[];
    eventHandlers: IInternalEventHandler<any>[];
    service: service.Service;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    config: IInternalEmbedConfiguration;
    /**
     * Note: there is circular reference between embeds and service
     * The service has list of all embeds on the host page, and each embed has reference to the service that created it.
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
     */
    on<T>(eventName: string, handler: service.IEventHandler<T>): void;
    /**
     * Get access token from first available location: config, attribute, global.
     */
    private getAccessToken(globalAccessToken);
    /**
     * Get embed url from first available location: options, attribute.
     */
    private getEmbedUrl();
    /**
     * Get unique id from first available location: options, attribute.
     * If neither is provided generate unique string.
     */
    private getUniqueId();
    /**
     * Get report id from first available location: options, attribute.
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
     */
    private isFullscreen(iframe);
}
