/*! powerbi-client v1.1.0 | (c) 2016 Microsoft Corporation MIT */
export declare class Utils {
    static raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void;
    static findIndex<T>(predicate: (T) => boolean, xs: T[]): number;
    static find<T>(predicate: (T) => boolean, xs: T[]): T;
    static remove<T>(predicate: (T) => boolean, xs: T[]): void;
    static assign: (...args: any[]) => any;
}

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
export interface ILoadMessage {
    action: string;
    accessToken: string;
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
    new (...args: any[]): Embed;
}
export declare abstract class Embed {
    static embedUrlAttribute: string;
    static accessTokenAttribute: string;
    static typeAttribute: string;
    /**
     * Attribute used to specify type of visual.
     * Example: `<div powerbi-type="report"></div>`
     */
    static name: string;
    /**
     * Default options for embeddable component.
     */
    private static defaultOptions;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    options: IEmbedOptions;
    constructor(element: HTMLElement, options: IEmbedOptions);
    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration options such as access token, loadAction, etc
     * which allow iframe to load the actual report with authentication.
     */
    load(options: IEmbedOptions, requireId?: boolean, message?: ILoadMessage): void;
    /**
     * Get access token from first available location: options, attribute, global.
     */
    private getAccessToken();
    /**
     * Get embed url from first available location: options, attribute.
     */
    protected getEmbedUrl(): string;
    /**
     * Request the browser to make the components iframe fullscreen.
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
export {};


export interface IReportLoadMessage extends ILoadMessage {
    reportId: string;
}
export declare class Report extends Embed {
    static name: string;
    getEmbedUrl(): string;
    load(options: IEmbedOptions, requireId?: boolean): void;
}


export interface ITileLoadMessage extends ILoadMessage {
    tileId: string;
}
export declare class Tile extends Embed {
    static name: string;
    getEmbedUrl(): string;
    load(options: IEmbedOptions, requireId?: boolean): void;
}


export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: Embed;
}
export interface IPowerBiConfiguration {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}
export declare class PowerBi {
    /**
     * List of components this service can embed.
     */
    private static components;
    /**
     * Mapping of event names from iframe postMessage to their name percieved by parent DOM.
     * Example: User clicks on embeded report which is inside iframe. The iframe code resends
     * event as postMessage with { event: 'reportClicked', ... } and this name is converted to hyphenated
     * name and dispatched from the parent element of the iframe to simulate the event bubbling through two
     * different windows / DOMs
     */
    private static eventMap;
    /**
     * Default configuration for service.
     */
    private static defaultConfig;
    /** Save access token as fallback/global token to use when local token for report/tile is not provided. */
    accessToken: string;
    /** Configuration object */
    private config;
    /** List of components (Reports/Tiles) that have been embedded using this service instance. */
    private embeds;
    constructor(config?: IPowerBiConfiguration);
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container?: HTMLElement): void;
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     */
    embed(element: HTMLElement, config?: IEmbedOptions): Embed;
    /**
     * Given an html element embed component base configuration.
     * Save component instance on element for later lookup.
     */
    private embedNew(element, config);
    private embedExisting(element, config);
    /**
     * Adds event handler for DOMContentLoaded which finds all elements in DOM with attribute powerbi-embed-url
     * then attempts to initiate the embed process based on data from other powerbi-* attributes.
     * (This is usually only useful for applications rendered on by the server since all the data needed will be available by the time the handler is called.)
     */
    enableAutoEmbed(): void;
    /**
     * Returns instance of component associated with element.
     */
    get(element: HTMLElement): Embed;
    /**
     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
     */
    reset(element: HTMLElement): void;
    /**
     * Handler for window message event.
     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
     * to simulate the event bubbling through the two separate windows / DOMs.
     *
     * If an error occurs when parsing event.data call error handler provided during configuration.
     */
    private onReceiveMessage(event);
}


declare global  {
    interface Window {
        Powerbi: typeof PowerBi;
        powerbi: PowerBi;
    }
}
