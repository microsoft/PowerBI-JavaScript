/*! powerbi-client v2.0.0-beta.13 | (c) 2016 Microsoft Corporation MIT */
import * as embed from './embed';
import { Report } from './report';
import { Tile } from './tile';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';
export interface IEvent<T> {
    type: string;
    id: string;
    name: string;
    value: T;
}
export interface ICustomEvent<T> extends CustomEvent {
    detail: T;
}
export interface IEventHandler<T> {
    (event: ICustomEvent<T>): any;
}
export interface IHpmFactory {
    (wpmp: wpmp.WindowPostMessageProxy, targetWindow?: Window, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
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
}
export interface IServiceConfiguration extends IDebugOptions {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
    version?: string;
    type?: string;
}
export interface IService {
    hpm: hpm.HttpPostMessage;
}
/**
 * The Power BI embed service.  This is the entry point to embed Power BI components intor your application.
 *
 * @export
 * @class Service
 * @implements {IService}
 */
export declare class Service implements IService {
    /**
     * List of components this service can embed.
     */
    private static components;
    /**
     * Default configuration for service.
     */
    private static defaultConfig;
    /**
     * Gets or sets the access token as fallback/global token to use when local token for report/tile is not provided.
     *
     * @type {string}
     */
    accessToken: string;
    /** Configuration object */
    private config;
    /** List of components (Reports/Tiles) that have been embedded using this service instance. */
    private embeds;
    /** TODO: Look for way to make hpm private without sacraficing ease of maitenance. This should be private but in embed needs to call methods. */
    hpm: hpm.HttpPostMessage;
    /** TODO: Look for way to make wpmp private.  This is only public to allow stopping the wpmp in tests */
    wpmp: wpmp.WindowPostMessageProxy;
    private router;
    /**
     * Creates an instance of Power BI embed service.
     *
     * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
     * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
     * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
     * @param {IServiceConfiguration} [config={}]
     */
    constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config?: IServiceConfiguration);
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     *
     * @param {HTMLElement} [container]
     * @param {embed.IEmbedConfiguration} [config=undefined]
     * @returns {embed.Embed[]}
     */
    init(container?: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed[];
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     *
     * @param {HTMLElement} element
     * @param {embed.IEmbedConfiguration} [config={}]
     * @returns {embed.Embed}
     */
    embed(element: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed;
    /**
     * Given an html element embed component base configuration.
     * Save component instance on element for later lookup.
     *
     * @private
     * @param {IPowerBiElement} element
     * @param {embed.IEmbedConfiguration} config
     * @returns {embed.Embed}
     */
    private embedNew(element, config);
    /**
     * Given and element which arleady contains embed, load with new configuration
     *
     * @private
     * @param {IPowerBiElement} element
     * @param {embed.IEmbedConfiguration} config
     * @returns {embed.Embed}
     */
    private embedExisting(element, config);
    /**
     * Adds event handler for DOMContentLoaded which finds all elements in DOM with attribute powerbi-embed-url
     * then attempts to initiate the embed process based on data from other powerbi-* attributes.
     * (This is usually only useful for applications rendered on by the server since all the data needed will be available by the time the handler is called.)
     */
    enableAutoEmbed(): void;
    /**
     * Returns instance of component associated with element.
     *
     * @param {HTMLElement} element
     * @returns {(Report | Tile)}
     */
    get(element: HTMLElement): Report | Tile;
    /**
     * Find embed instance by name / unique id provided.
     *
     * @param {string} uniqueId
     * @returns {(Report | Tile)}
     */
    find(uniqueId: string): Report | Tile;
    /**
     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
     *
     * @param {HTMLElement} element
     * @returns {void}
     */
    reset(element: HTMLElement): void;
    /**
     * Given an event object, find embed with matching type and id and invoke its handleEvent method with event.
     *
     * @private
     * @param {IEvent<any>} event
     */
    private handleEvent(event);
}
