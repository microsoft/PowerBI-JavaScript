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
    eventHandlers: IInternalEventHandler<any>[];
    service: service.Service;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    config: IInternalEmbedConfiguration;

    /**
     * Note: there is circular reference between embeds and service
     * The service has list of all embeds on the host page, and each embed has reference to the service that created it.
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
     *   filte: "DefaultReportFilter"
     * })
     *   .catch(error => { ... });
     * ```
     */
    load(config: models.ILoadConfiguration): Promise<void> {
        const errors = models.validateLoad(config);
        if(errors) {
            throw errors;
        }

        return this.service.hpm.post<void>('/report/load', config, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }
    
    /**
     * Given an event object, find all event handlers for the event, and invoke them with the event value.
     */
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
            this.element.removeEventListener(eventName, <any>handler);
        }
        else {
            const eventHandlersToRemove = this.eventHandlers
                .filter(eventHandler => eventHandler.test(fakeEvent));
                
            eventHandlersToRemove
                .forEach(eventHandlerToRemove => {
                    this.element.removeEventListener(eventName, <any>eventHandlerToRemove.handle);
                });
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
        if(this.allowedEvents.indexOf(eventName) === -1) {
            throw new Error(`eventName is must be one of ${this.allowedEvents}. You passed: ${eventName}`);
        }

        this.eventHandlers.push({
            test: (event: service.IEvent<T>) => event.name === eventName,
            handle: handler
        });

        this.element.addEventListener(eventName, <any>handler)
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
     * Get unique id from first available location: options, attribute.
     * If neither is provided generate unique string.
     */
    private getUniqueId(): string {
        return this.config.uniqueId || this.element.getAttribute(Embed.nameAttribute) || utils.createRandomString();
    }

    /**
     * Get report id from first available location: options, attribute.
     */
    abstract getId(): string;

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


    /**
     * Return true if iframe is fullscreen,
     * otherwise return false
     */
    private isFullscreen(iframe: HTMLIFrameElement): boolean {
        const options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];

        return options.some(option => document[option] === iframe);
    }
}