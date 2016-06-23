import { Utils } from './util';
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

export interface IDebugOptions {
    logMessages?: boolean;
    wpmpName?: string;
}

export interface IEmbedConfiguration extends IDebugOptions {
    type?: string;
    id?: string;
    embedUrl?: string;
    accessToken?: string;
    settings?: models.ISettings;
}

export type IGetGlobalAccessToken = () => string;

export interface IInternalEmbedConfiguration extends models.ILoadConfiguration, IDebugOptions {
    type: string;
    embedUrl: string;
    getGlobalAccessToken: IGetGlobalAccessToken;
}

export interface IInternalEventHandler<T> {
    test(event: service.IEvent<T>): boolean;
    handle(event: service.IEvent<T>): void;
}

export interface IEmbedConstructor {
    new (service: service.PowerBi, hpmFactory: service.IHpmFactory, element: HTMLElement, config: IEmbedConfiguration): Embed;
    type: string;
}

export abstract class Embed {
    public static embedUrlAttribute = 'powerbi-embed-url';
    public static accessTokenAttribute = 'powerbi-access-token';
    public static typeAttribute = 'powerbi-type';
    public static type: string;

    private static defaultSettings: models.ISettings = {
        filterPaneEnabled: true
    };

    eventHandlers: IInternalEventHandler<any>[];
    hpm: hpm.HttpPostMessage;
    service: service.PowerBi;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    config: IInternalEmbedConfiguration;

    /**
     * Note: there is circular reference between embeds and service
     * The service has list of all embeds on the host page, and each embed has reference to the service that created it.
     */
    constructor(service: service.PowerBi, hpmFactory: service.IHpmFactory, element: HTMLElement, config: IEmbedConfiguration) {
        this.eventHandlers = [];
        this.service = service;
        this.element = element;

        // TODO: Change when Object.assign is available.
        config.settings = Utils.assign({}, Embed.defaultSettings, config.settings);
        this.config = Utils.assign({}, config);
        this.config.accessToken = this.getAccessToken(service.accessToken);
        this.config.embedUrl = this.getEmbedUrl();

        // TODO: The findIdFromEmbedUrl method is specific to Reports so it should be in the Report class, but it can't be called until
        // after we have fetched the embedUrl from the attributes

        /**
         * This adds backwards compatibility for older config which used the reportId query param to specify report id.
         * E.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1
         * 
         * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
         */
        const id = Embed.findIdFromEmbedUrl(this.config.embedUrl);
        if(id) {
            this.config.id = id;
        }

        const iframeHtml = `<iframe style="width:100%;height:100%;" src="${this.config.embedUrl}" scrolling="no" allowfullscreen="true"></iframe>`;

        this.element.innerHTML = iframeHtml;
        this.iframe = <HTMLIFrameElement>this.element.childNodes[0];
        this.iframe.addEventListener('load', () => this.load(this.config), false);

        this.hpm = hpmFactory(this.iframe.contentWindow, this.service.wpmp);
    }

    getConfig(): IInternalEmbedConfiguration {
        return this.config;
    }

    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration data such as id, access token, and settings etc
     * which allow iframe to load the actual report with authentication.
     */
    load(config: models.ILoadConfiguration): Promise<void> {
        const errors = models.validateLoad(config);
        if(errors) {
            throw errors;
        }

        return this.hpm.post<void>('/report/load', config)
            .catch(response => {
                throw response.body;
            });
    }
    
    handleEvent(event: service.IEvent<any>): void {
        this.eventHandlers
            .filter(handler => handler.test(event))
            .forEach(handler => {
                handler.handle(event.value);
            });
    }

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
    off<T>(eventName: string, handler?: service.IEventHandler<T>): void {
        const fakeEvent: service.IEvent<any> = { name: eventName, type: null, id: null, value: null };
        if(handler) {
            Utils.remove(eventHandler => eventHandler.test(fakeEvent) && (eventHandler.handle === handler), this.eventHandlers);
        }
        else {
            const eventHandlersToRemove = this.eventHandlers
                .filter(eventHandler => eventHandler.test(fakeEvent));
                
            eventHandlersToRemove
                .forEach(eventHandlerToRemove => {
                    Utils.remove(eventHandler => eventHandler === eventHandlerToRemove, this.eventHandlers);
                })
        }
    }

    /**
     * Adds event handler for specific event.
     * 
     * ```javascript
     * report.on('pageChanged', (event) => {
     *   console.log('PageChanged: ', event.page.name);
     * });
     * ```
     */
    on<T>(eventName: string, handler: service.IEventHandler<T>): void {
        this.eventHandlers.push({
            test: (event: service.IEvent<T>) => event.name === eventName,
            handle: handler
        });
    }

    /**
     * Get access token from first available location: config, attribute, global.
     */
    private getAccessToken(globalAccessToken: string): string {
        const accessToken = this.config.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || globalAccessToken;

        if (!accessToken) {
            throw new Error(`No access token was found for element. You must specify an access token directly on the element using attribute '${Embed.accessTokenAttribute}' or specify a global token at: powerbi.accessToken.`);
        }

        return accessToken;
    }

    /**
     * Get embed url from first available location: options, attribute.
     */
    private getEmbedUrl(): string {
        const embedUrl = this.config.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);

        if (typeof embedUrl !== 'string' || embedUrl.length === 0) {
            throw new Error(`Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '${Embed.embedUrlAttribute}'.`);
        }

        return embedUrl;
    }

    /**
     * Request the browser to make the component's iframe fullscreen.
     */
    fullscreen(): void {
        const requestFullScreen = this.iframe.requestFullscreen || this.iframe.msRequestFullscreen || this.iframe.mozRequestFullScreen || this.iframe.webkitRequestFullscreen;
        requestFullScreen.call(this.iframe);
    }

    /**
     * Exit fullscreen.
     */
    exitFullscreen(): void {
        if (!this.isFullscreen(this.iframe)) {
            return;
        }

        const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
        exitFullscreen.call(document);
    }

    private static findIdFromEmbedUrl(url: string): string {
        const reportIdRegEx = /reportId="?([^&]+)"?/
        const reportIdMatch = url.match(reportIdRegEx);
        
        let reportId;
        if(reportIdMatch) {
            reportId = reportIdMatch[1];
        }

        return reportId;
    }

    /**
     * Return true if iframe is fullscreen,
     * otherwise return false
     */
    private isFullscreen(iframe: HTMLIFrameElement): boolean {
        const options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];

        return options.some(option => document[option] === iframe);
    }
}