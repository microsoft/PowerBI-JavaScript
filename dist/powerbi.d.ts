/*! powerbi-client v2.0.0-beta.6 | (c) 2016 Microsoft Corporation MIT */
export declare class Utils {
    static raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void;
    static findIndex<T>(predicate: (x: T) => boolean, xs: T[]): number;
    static find<T>(predicate: (x: T) => boolean, xs: T[]): T;
    static remove<T>(predicate: (x: T) => boolean, xs: T[]): void;
    static assign: (...args: any[]) => any;
}


export declare class Tile extends Embed {
    static type: string;
}


import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';
export interface IEvent<T> {
    type: string;
    id: string;
    name: string;
    value: T;
}
export interface IEventHandler<T> {
    (event: IEvent<T>): any;
}
export interface IHpmFactory {
    (targetWindow: Window, wpmp: wpmp.WindowPostMessageProxy, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
}
export interface IWpmpFactory {
    (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window): wpmp.WindowPostMessageProxy;
}
export interface IRouterFactory {
    (wpmp: wpmp.WindowPostMessageProxy): router.Router;
}
export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: embed.Embed;
}
export interface IDebugOptions {
    logMessages?: boolean;
    wpmpName?: string;
    eventSourceOverrideWindow?: Window;
}
export interface IServiceConfiguration extends IDebugOptions {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}
export declare class Service {
    /**
     * List of components this service can embed.
     */
    /**
     * TODO: See if it's possible to remove need for this interface and just use Embed base object as common between Tile and Report
     * This was only put it to allow both types of components to be in the same list
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
    private hpmFactory;
    /** TODO: Look for way to make this private. This should be private but in embed constructor needs to pass the wpmp instance to the hpm factory. */
    wpmp: wpmp.WindowPostMessageProxy;
    private router;
    constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config?: IServiceConfiguration);
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container?: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed[];
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     */
    embed(element: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed;
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
    get(element: HTMLElement): embed.Embed;
    /**
     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
     */
    reset(element: HTMLElement): void;
    handleEvent(event: IEvent<any>): void;
    /**
     * Translate target into url
     * Target may be to the whole report, speific page, or specific visual
     */
    private getTargetUrl(target?);
}

/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 */

export { IHpmFactory, IWpmpFactory, IRouterFactory };
/**
 * TODO: Need to get sdk version and settings from package.json, Generate config file via gulp task?
 */
export declare const hpmFactory: IHpmFactory;
export declare const wpmpFactory: IWpmpFactory;
export declare const routerFactory: IRouterFactory;


declare global  {
    interface Window {
        Powerbi: typeof Service;
        powerbi: Service;
    }
}
