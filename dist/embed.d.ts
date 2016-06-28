/*! powerbi-client v2.0.0-beta.6 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as models from 'powerbi-models';
import * as hpm from 'http-post-message';
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
    handle(event: service.IEvent<T>): void;
}
export declare abstract class Embed {
    static accessTokenAttribute: string;
    static embedUrlAttribute: string;
    static nameAttribute: string;
    static typeAttribute: string;
    static type: string;
    private static defaultSettings;
    eventHandlers: IInternalEventHandler<any>[];
    hpm: hpm.HttpPostMessage;
    service: service.Service;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    config: IInternalEmbedConfiguration;
    /**
     * Note: there is circular reference between embeds and service
     * The service has list of all embeds on the host page, and each embed has reference to the service that created it.
     */
    constructor(service: service.Service, hpmFactory: service.IHpmFactory, element: HTMLElement, config: IEmbedConfiguration);
    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration data such as id, access token, and settings etc
     * which allow iframe to load the actual report with authentication.
     */
    load(config: models.ILoadConfiguration): Promise<void>;
    handleEvent(event: service.IEvent<any>): void;
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
