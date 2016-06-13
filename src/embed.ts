import { Utils } from './util';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';
import * as filters from 'powerbi-filters';

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
 * TODO: Consider adding type: "report" | "tile" property to indicate what type of object to embed
 * 
 * This would align with goal of having single embed page which adapts to the thing being embedded
 * instead of having M x N embed pages where M is type of object (report, tile) and N is authorization
 * type (PaaS, SaaS, Anonymous)
 */
export interface ILoadMessage {
    accessToken: string;
    id: string;
}

export interface IEmbedOptions {
    type?: string;
    id?: string;
    accessToken?: string;
    embedUrl?: string;
    webUrl?: string;
    name?: string;
    filterPaneEnabled?: boolean;
    getGlobalAccessToken?: () => string;
}

export interface IEmbedConstructor {
    new(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, element: HTMLElement, options: IEmbedOptions): Embed;
}

export interface IHpmFactory {
    (wpmp: wpmp.WindowPostMessageProxy): hpm.HttpPostMessage;
}

export interface IWpmpFactory {
    (window: Window, name?: string, logMessages?: boolean): wpmp.WindowPostMessageProxy;
}

export interface IRouterFactory {
    (wpmp: wpmp.WindowPostMessageProxy): router.Router;
}

export abstract class Embed {
    public static embedUrlAttribute = 'powerbi-embed-url';
    public static accessTokenAttribute = 'powerbi-access-token';
    public static typeAttribute = 'powerbi-type';
    
    /**
     * Attribute used to specify type of visual.
     * Example: `<div powerbi-type="report"></div>`
     */
    public static type: string;
    /**
     * Default options for embeddable component.
     */
    private static defaultOptions: IEmbedOptions = {
        filterPaneEnabled: true
    };
    
    wpmp: wpmp.WindowPostMessageProxy;
    hpm: hpm.HttpPostMessage;
    router: router.Router;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    options: IEmbedOptions;
    
    constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, element: HTMLElement, options: IEmbedOptions) {
        this.element = element;
        
        // TODO: Change when Object.assign is available.
        this.options = Utils.assign({}, Embed.defaultOptions, options);
        this.options.accessToken = this.getAccessToken();
        this.options.embedUrl = this.getEmbedUrl();
        
        const iframeHtml = `<iframe style="width:100%;height:100%;" src="${this.options.embedUrl}" scrolling="no" allowfullscreen="true"></iframe>`;
        
        this.element.innerHTML = iframeHtml;
        this.iframe = <HTMLIFrameElement>this.element.childNodes[0];
        this.iframe.addEventListener('load', () => this.load(this.options, false), false);

        this.wpmp = wpmpFactory(this.iframe.contentWindow, 'SdkReportWpmp', true);
        this.hpm = hpmFactory(this.wpmp);
        this.router = routerFactory(this.wpmp);
    }
    
    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration options such as access token, loadAction, etc
     * which allow iframe to load the actual report with authentication.
     */
    load(options: IEmbedOptions, requireId: boolean = false, message: ILoadMessage = null): Promise<void> {
        if(!message) {
            throw new Error(`You called load without providing message properties from the concrete embeddable class.`);
        }
        
        const baseMessage = <ILoadMessage>{
            accessToken: options.accessToken
        };
        
        Utils.assign(message, baseMessage);
        
        return this.hpm.post('/report/load', message)
            .catch((response: hpm.IResponse) => {
                throw response.body;
            });
    }
    
    /**
     * Get access token from first available location: options, attribute, global.
     */
    private getAccessToken(): string {
        const accessToken = this.options.accessToken || this.element.getAttribute(Embed.accessTokenAttribute) || this.options.getGlobalAccessToken();
        
        if (!accessToken) {
            throw new Error(`No access token was found for element. You must specify an access token directly on the element using attribute '${Embed.accessTokenAttribute}' or specify a global token at: powerbi.accessToken.`);
        }
        
        return accessToken;
    }
    
    /**
     * Get embed url from first available location: options, attribute.
     */
    protected getEmbedUrl(): string {
        const embedUrl = this.options.embedUrl || this.element.getAttribute(Embed.embedUrlAttribute);
        
        if(typeof embedUrl !== 'string' || embedUrl.length === 0) {
            throw new Error(`Embed Url is required, but it was not found. You must provide an embed url either as part of embed configuration or as attribute '${Embed.embedUrlAttribute}'.`);
        }
        
        return embedUrl; 
    }

    /**
     * Request the browser to make the components iframe fullscreen.
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