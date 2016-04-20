import Utils from './util';

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

export interface IEmbedOptions {
    type?: string;
    id?: string;
    accessToken?: string;
    loadAction?: string;
    embedUrl?: string;
    webUrl?: string;
    name?: string;
    filterPaneEnabled?: boolean;
    getGlobalAccessToken?: () => string;
    overwrite?: boolean;
}

export interface IEmbedConstructor {
    new(...args: any[]): Embed;
}

abstract class Embed {
    public static embedUrlAttribute = 'powerbi-embed-url';
    public static accessTokenAttribute = 'powerbi-access-token';
    public static typeAttribute = 'powerbi-type';
    
    /**
     * Attribute used to specify type of visual.
     * Example: `<div powerbi-type="report"></div>`
     */
    public static name: string;
    /**
     * Default options for embeddable component.
     */
    private static defaultOptions: IEmbedOptions = {
        filterPaneEnabled: true,
        overwrite: true
    };
    
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    options: IEmbedOptions;
    
    constructor(element: HTMLElement, options: IEmbedOptions) {
        this.element = element;
        
        // TODO: Change when Object.assign is available.
        this.options = Utils.assign({}, Embed.defaultOptions, options);
        this.options.accessToken = this.getAccessToken();
        this.options.embedUrl = this.getEmbedUrl();
        
        const iframeHtml = `<iframe style="width:100%;height:100%;" src="${this.options.embedUrl}" scrolling="no" allowfullscreen="true"></iframe>`;
        
        this.element.innerHTML = iframeHtml;
        this.iframe = <HTMLIFrameElement>this.element.childNodes[0];
        this.iframe.addEventListener('load', this.load.bind(this), false);
    }
    
    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration options such as access token, loadAction, etc
     * which allow iframe to load the actual report with authentication.
     */
    private load(): void {
        const computedStyle = window.getComputedStyle(this.element);
        const initEventArgs = {
            message: {
                action: this.options.loadAction,
                accessToken: this.options.accessToken,
                width: computedStyle.width,
                height: computedStyle.height
            }
        };
        
        Utils.raiseCustomEvent(this.element, 'embed-init', initEventArgs);
        this.iframe.contentWindow.postMessage(JSON.stringify(initEventArgs.message), '*');
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

export default Embed;