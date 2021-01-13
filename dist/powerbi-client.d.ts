/*! powerbi-client v2.16.5 | (c) 2016 Microsoft Corporation MIT */
declare module "util" {
    import { HttpPostMessage } from 'http-post-message';
    /**
     * Raises a custom event with event data on the specified HTML element.
     *
     * @export
     * @param {HTMLElement} element
     * @param {string} eventName
     * @param {*} eventData
     */
    export function raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void;
    /**
     * Finds the index of the first value in an array that matches the specified predicate.
     *
     * @export
     * @template T
     * @param {(x: T) => boolean} predicate
     * @param {T[]} xs
     * @returns {number}
     */
    export function findIndex<T>(predicate: (x: T) => boolean, xs: T[]): number;
    /**
     * Finds the first value in an array that matches the specified predicate.
     *
     * @export
     * @template T
     * @param {(x: T) => boolean} predicate
     * @param {T[]} xs
     * @returns {T}
     */
    export function find<T>(predicate: (x: T) => boolean, xs: T[]): T;
    export function remove<T>(predicate: (x: T) => boolean, xs: T[]): void;
    /**
     * Copies the values of all enumerable properties from one or more source objects to a target object, and returns the target object.
     *
     * @export
     * @param {any} args
     * @returns
     */
    export function assign(...args: any[]): any;
    /**
     * Generates a random 5 to 6 character string.
     *
     * @export
     * @returns {string}
     */
    export function createRandomString(): string;
    /**
     * Generates a 20 character uuid.
     *
     * @export
     * @returns {string}
     */
    export function generateUUID(): string;
    /**
     * Adds a parameter to the given url
     *
     * @export
     * @param {string} url
     * @param {string} paramName
     * @param {string} value
     * @returns {string}
     */
    export function addParamToUrl(url: string, paramName: string, value: string): string;
    /**
     * Checks if the report is saved.
     *
     * @export
     * @param {HttpPostMessage} hpm
     * @param {string} uid
     * @param {Window} contentWindow
     * @returns {Promise<boolean>}
     */
    export function isSavedInternal(hpm: HttpPostMessage, uid: string, contentWindow: Window): Promise<boolean>;
    /**
     * Checks if the embed url is for RDL report.
     *
     * @export
     * @param {string} embedUrl
     * @returns {boolean}
     */
    export function isRDLEmbed(embedUrl: string): boolean;
    /**
     * Checks if the embed url contains autoAuth=true.
     *
     * @export
     * @param {string} embedUrl
     * @returns {boolean}
     */
    export function autoAuthInEmbedUrl(embedUrl: string): boolean;
    /**
     * Returns random number
     */
    export function getRandomValue(): number;
    /**
     * Returns the time interval between two dates in milliseconds
     * @export
     * @param {Date} start
     * @param {Date} end
     * @returns {number}
     */
    export function getTimeDiffInMilliseconds(start: Date, end: Date): number;
}
declare module "config" {
    /** @ignore */ /** */
    const config: {
        version: string;
        type: string;
    };
    export default config;
}
declare module "errors" {
    export let APINotSupportedForRDLError: string;
    export let EmbedUrlNotSupported: string;
}
declare module "embed" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    global {
        interface Document {
            mozCancelFullScreen: any;
            msExitFullscreen: any;
            webkitExitFullscreen: void;
        }
        interface HTMLIFrameElement {
            mozRequestFullScreen: Function;
            msRequestFullscreen: Function;
            webkitRequestFullscreen: {
                (): void;
            };
        }
    }
    export type IBootstrapEmbedConfiguration = models.IBootstrapEmbedConfiguration;
    export type IEmbedConfigurationBase = models.IEmbedConfigurationBase;
    export type IEmbedConfiguration = models.IEmbedConfiguration;
    export type IVisualEmbedConfiguration = models.IVisualEmbedConfiguration;
    export type IReportEmbedConfiguration = models.IReportEmbedConfiguration;
    export type IDashboardEmbedConfiguration = models.IDashboardEmbedConfiguration;
    export type ITileEmbedConfiguration = models.ITileEmbedConfiguration;
    export type IQnaEmbedConfiguration = models.IQnaEmbedConfiguration;
    export type ILocaleSettings = models.ILocaleSettings;
    export type IQnaSettings = models.IQnaSettings;
    export type IEmbedSettings = models.ISettings;
    /** @hidden */
    export interface IInternalEventHandler<T> {
        test(event: service.IEvent<T>): boolean;
        handle(event: service.ICustomEvent<T>): void;
    }
    /**
     * Base class for all Power BI embed components
     *
     * @export
     * @abstract
     * @hidden
     * @class Embed
     */
    export abstract class Embed {
        /** @hidden */
        static allowedEvents: string[];
        /** @hidden */
        static accessTokenAttribute: string;
        /** @hidden */
        static embedUrlAttribute: string;
        /** @hidden */
        static nameAttribute: string;
        /** @hidden */
        static typeAttribute: string;
        /** @hidden */
        static defaultEmbedHostName: string;
        /** @hidden */
        static type: string;
        /** @hidden */
        static maxFrontLoadTimes: number;
        /** @hidden */
        allowedEvents: any[];
        /**
         * Gets or sets the event handler registered for this embed component.
         *
         * @type {IInternalEventHandler<any>[]}
         * @hidden
         */
        eventHandlers: IInternalEventHandler<any>[];
        /**
         * Gets or sets the Power BI embed service.
         *
         * @type {service.Service}
         * @hidden
         */
        service: service.Service;
        /**
         * Gets or sets the HTML element that contains the Power BI embed component.
         *
         * @type {HTMLElement}
         * @hidden
         */
        element: HTMLElement;
        /**
         * Gets or sets the HTML iframe element that renders the Power BI embed component.
         *
         * @type {HTMLIFrameElement}
         * @hidden
         */
        iframe: HTMLIFrameElement;
        /**
         * Saves the iframe state. Each iframe should be loaded only once.
         * After first load, .embed will go into embedExisting path which will send
         * a postMessage of /report/load instead of creating a new iframe.
         *
         * @type {boolean}
         * @hidden
         */
        iframeLoaded: boolean;
        /**
         * Gets or sets the configuration settings for the Power BI embed component.
         *
         * @type {IEmbedConfigurationBase}
         * @hidden
         */
        config: IEmbedConfigurationBase;
        /**
         * Gets or sets the bootstrap configuration for the Power BI embed component received by powerbi.bootstrap().
         *
         * @type {IBootstrapEmbedConfiguration}
         * @hidden
         */
        bootstrapConfig: IBootstrapEmbedConfiguration;
        /**
         * Gets or sets the configuration settings for creating report.
         *
         * @type {models.IReportCreateConfiguration}
         * @hidden
         */
        createConfig: models.IReportCreateConfiguration;
        /**
         * Url used in the load request.
         * @hidden
         */
        loadPath: string;
        /**
         * Url used in the load request.
         * @hidden
         */
        phasedLoadPath: string;
        /**
         * Type of embed
         * @hidden
         */
        embedtype: string;
        /**
         * Handler function for the 'ready' event
         * @hidden
         */
        frontLoadHandler: () => any;
        /**
         * The time the last /load request was sent
         * @hidden
         */
        lastLoadRequest: Date;
        /**
         * Creates an instance of Embed.
         *
         * Note: there is circular reference between embeds and the service, because
         * the service has a list of all embeds on the host page, and each embed has a reference to the service that created it.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {IEmbedConfigurationBase} config
         * @hidden
         */
        constructor(service: service.Service, element: HTMLElement, config: IEmbedConfigurationBase, iframe?: HTMLIFrameElement, phasedRender?: boolean, isBootstrap?: boolean);
        /**
         * Sends createReport configuration data.
         *
         * ```javascript
         * createReport({
         *   datasetId: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
         *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
         * ```
         * @hidden
         * @param {models.IReportCreateConfiguration} config
         * @returns {Promise<void>}
         */
        createReport(config: models.IReportCreateConfiguration): Promise<void>;
        /**
         * Saves Report.
         *
         * @returns {Promise<void>}
         */
        save(): Promise<void>;
        /**
         * SaveAs Report.
         *
         * @returns {Promise<void>}
         */
        saveAs(saveAsParameters: models.ISaveAsParameters): Promise<void>;
        /**
         * Get the correlationId for the current embed session.
         *
         * ```javascript
         * // Get the correlationId for the current embed session
         * report.getCorrelationId()
         *   .then(correlationId => {
         *     ...
         *   });
         * ```
         *
         * @returns {Promise<string>}
         */
        getCorrelationId(): Promise<string>;
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
         * @hidden
         * @param {models.ILoadConfiguration} config
         * @param {boolean} phasedRender
         * @returns {Promise<void>}
         */
        load(phasedRender?: boolean): Promise<void>;
        /**
         * Removes one or more event handlers from the list of handlers.
         * If a reference to the existing handle function is specified, remove the specific handler.
         * If the handler is not specified, remove all handlers for the event name specified.
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
         * Adds an event handler for a specific event.
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
         * Reloads embed using existing configuration.
         * E.g. For reports this effectively clears all filters and makes the first page active which simulates resetting a report back to loaded state.
         *
         * ```javascript
         * report.reload();
         * ```
         */
        reload(): Promise<void>;
        /**
         * Set accessToken.
         *
         * @returns {Promise<void>}
         */
        setAccessToken(accessToken: string): Promise<void>;
        /**
         * Gets an access token from the first available location: config, attribute, global.
         *
         * @private
         * @param {string} globalAccessToken
         * @returns {string}
         * @hidden
         */
        private getAccessToken;
        /**
         * Populate config for create and load
         *
         * @hidden
         * @param {IEmbedConfiguration}
         * @returns {void}
         */
        populateConfig(config: IBootstrapEmbedConfiguration, isBootstrap: boolean): void;
        /**
         * Adds locale parameters to embedUrl
         *
         * @private
         * @param {IEmbedConfiguration | models.ICommonEmbedConfiguration} config
         * @hidden
         */
        private addLocaleToEmbedUrl;
        /**
         * Gets an embed url from the first available location: options, attribute.
         *
         * @private
         * @returns {string}
         * @hidden
         */
        private getEmbedUrl;
        /**
         * @hidden
         */
        private getDefaultEmbedUrl;
        /**
         * Gets a unique ID from the first available location: options, attribute.
         * If neither is provided generate a unique string.
         *
         * @private
         * @returns {string}
         * @hidden
         */
        private getUniqueId;
        /**
         * Gets the group ID from the first available location: options, embeddedUrl.
         *
         * @private
         * @returns {string}
         * @hidden
         */
        private getGroupId;
        /**
         * Gets the report ID from the first available location: options, attribute.
         *
         * @abstract
         * @returns {string}
         */
        abstract getId(): string;
        /**
         * Raise a config changed event.
         *
         * @hidden
         * @returns {void}
         */
        abstract configChanged(isBootstrap: boolean): void;
        /**
         * Gets default embed endpoint for each entity.
         * For example: report embed endpoint is reportEmbed.
         * This will help creating a default embed URL such as: https://app.powerbi.com/reportEmbed
         *
         * @hidden
         * @returns {string} endpoint.
         */
        abstract getDefaultEmbedUrlEndpoint(): string;
        /**
         * Requests the browser to render the component's iframe in fullscreen mode.
         */
        fullscreen(): void;
        /**
         * Requests the browser to exit fullscreen mode.
         */
        exitFullscreen(): void;
        /**
         * Returns true if the iframe is rendered in fullscreen mode,
         * otherwise returns false.
         *
         * @private
         * @param {HTMLIFrameElement} iframe
         * @returns {boolean}
         * @hidden
         */
        private isFullscreen;
        /**
         * Validate load and create configuration.
         *
         * @hidden
         */
        abstract validate(config: IEmbedConfigurationBase): models.IError[];
        /**
         * Sets Iframe for embed
         * @hidden
         */
        private setIframe;
        /**
         * Set the component title for accessibility. In case of iframes, this method will change the iframe title.
         */
        setComponentTitle(title: string): void;
        /**
         * Sets element's tabindex attribute
         */
        setComponentTabIndex(tabIndex?: number): void;
        /**
         * Removes element's tabindex attribute
         */
        removeComponentTabIndex(tabIndex?: number): void;
        /**
         * Adds the ability to get groupId from url.
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
         *
         * @hidden
         * @static
         * @param {string} url
         * @returns {string}
         */
        static findGroupIdFromEmbedUrl(url: string): string;
        /**
         * Sends the config for front load calls, after 'ready' message is received from the iframe
         * @hidden
         */
        private frontLoadSendConfig;
    }
}
declare module "ifilterable" {
    import * as models from 'powerbi-models';
    import { IHttpPostMessageResponse } from 'http-post-message';
    /**
     * Decorates embed components that support filters
     * Examples include reports and pages
     *
     * @export
     * @interface IFilterable
     */
    export interface IFilterable {
        /**
         * Gets the filters currently applied to the object.
         *
         * @returns {(Promise<models.IFilter[]>)}
         */
        getFilters(): Promise<models.IFilter[]>;
        /**
         * Replaces all filters on the current object with the specified filter values.
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Removes all filters from the current object.
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        removeFilters(): Promise<IHttpPostMessageResponse<void>>;
    }
}
declare module "visualDescriptor" {
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    import { IPageNode } from "page";
    import { IHttpPostMessageResponse } from 'http-post-message';
    /**
     * A Visual node within a report hierarchy
     *
     * @export
     * @interface IVisualNode
     */
    export interface IVisualNode {
        name: string;
        title: string;
        type: string;
        layout: models.IVisualLayout;
        page: IPageNode;
    }
    /**
     * A Power BI visual within a page
     *
     * @export
     * @class VisualDescriptor
     * @implements {IVisualNode}
     */
    export class VisualDescriptor implements IVisualNode, IFilterable {
        /**
         * The visual name
         *
         * @type {string}
         */
        name: string;
        /**
         * The visual title
         *
         * @type {string}
         */
        title: string;
        /**
         * The visual type
         *
         * @type {string}
         */
        type: string;
        /**
         * The visual layout: position, size and visibility.
         *
         * @type {string}
         */
        layout: models.IVisualLayout;
        /**
         * The parent Power BI page that contains this visual
         *
         * @type {IPageNode}
         */
        page: IPageNode;
        /**
         * @hidden
         */
        constructor(page: IPageNode, name: string, title: string, type: string, layout: models.IVisualLayout);
        /**
         * Gets all visual level filters of the current visual.
         *
         * ```javascript
         * visual.getFilters()
         *  .then(filters => { ... });
         * ```
         *
         * @returns {(Promise<models.IFilter[]>)}
         */
        getFilters(): Promise<models.IFilter[]>;
        /**
         * Removes all filters from the current visual.
         *
         * ```javascript
         * visual.removeFilters();
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        removeFilters(): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Sets the filters on the current visual to 'filters'.
         *
         * ```javascript
         * visual.setFilters(filters);
         *   .catch(errors => { ... });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Exports Visual data.
         * Can export up to 30K rows.
         * @param rows: Optional. Default value is 30K, maximum value is 30K as well.
         * @param exportDataType: Optional. Default is models.ExportDataType.Summarized.
         * ```javascript
         * visual.exportData()
         *  .then(data => { ... });
         * ```
         *
         * @returns {(Promise<models.IExportDataResult>)}
         */
        exportData(exportDataType?: models.ExportDataType, rows?: number): Promise<models.IExportDataResult>;
        /**
         * Set slicer state.
         * Works only for visuals of type slicer.
         * @param state: A new state which contains the slicer filters.
         * ```javascript
         * visual.setSlicerState()
         *  .then(() => { ... });
         * ```
         */
        setSlicerState(state: models.ISlicerState): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Get slicer state.
         * Works only for visuals of type slicer.
         *
         * ```javascript
         * visual.getSlicerState()
         *  .then(state => { ... });
         * ```
         *
         * @returns {(Promise<models.ISlicerState>)}
         */
        getSlicerState(): Promise<models.ISlicerState>;
        /**
         * Clone existing visual to a new instance.
         *
         * @returns {(Promise<models.ICloneVisualResponse>)}
         */
        clone(request?: models.ICloneVisualRequest): Promise<models.ICloneVisualResponse>;
        /**
         * Sort a visual by dataField and direction.
         *
         * @param request: Sort by visual request.
         *
         * ```javascript
         * visual.sortBy(request)
         *  .then(() => { ... });
         * ```
         */
        sortBy(request: models.ISortByVisualRequest): Promise<IHttpPostMessageResponse<void>>;
    }
}
declare module "page" {
    import { IHttpPostMessageResponse } from 'http-post-message';
    import { IFilterable } from "ifilterable";
    import { IReportNode } from "report";
    import { VisualDescriptor } from "visualDescriptor";
    import * as models from 'powerbi-models';
    /**
     * A Page node within a report hierarchy
     *
     * @export
     * @interface IPageNode
     */
    export interface IPageNode {
        report: IReportNode;
        name: string;
    }
    /**
     * A Power BI report page
     *
     * @export
     * @class Page
     * @implements {IPageNode}
     * @implements {IFilterable}
     */
    export class Page implements IPageNode, IFilterable {
        /**
         * The parent Power BI report that this page is a member of
         *
         * @type {IReportNode}
         */
        report: IReportNode;
        /**
         * The report page name
         *
         * @type {string}
         */
        name: string;
        /**
         * The user defined display name of the report page, which is undefined if the page is created manually
         *
         * @type {string}
         */
        displayName: string;
        /**
         * Is this page is the active page
         *
         * @type {boolean}
         */
        isActive: boolean;
        /**
         * The visibility of the page.
         * 0 - Always Visible
         * 1 - Hidden in View Mode
         *
         * @type {models.SectionVisibility}
         */
        visibility: models.SectionVisibility;
        /**
         * Page size as saved in the report.
         * @type {models.ICustomPageSize}
         */
        defaultSize: models.ICustomPageSize;
        /**
         * Page display options as saved in the report.
         * @type {models.ICustomPageSize}
         */
        defaultDisplayOption: models.DisplayOption;
        /**
         * Creates an instance of a Power BI report page.
         *
         * @param {IReportNode} report
         * @param {string} name
         * @param {string} [displayName]
         * @param {boolean} [isActivePage]
         * @param {models.SectionVisibility} [visibility]
         * @hidden
         */
        constructor(report: IReportNode, name: string, displayName?: string, isActivePage?: boolean, visibility?: models.SectionVisibility, defaultSize?: models.ICustomPageSize, defaultDisplayOption?: models.DisplayOption);
        /**
         * Gets all page level filters within the report.
         *
         * ```javascript
         * page.getFilters()
         *  .then(filters => { ... });
         * ```
         *
         * @returns {(Promise<models.IFilter[]>)}
         */
        getFilters(): Promise<models.IFilter[]>;
        /**
         * Delete the page from the report
         *
         * ```javascript
         * // Delete the page from the report
         * page.delete();
         * ```
         *
         * @returns {Promise<void>}
         */
        delete(): Promise<void>;
        /**
         * Removes all filters from this page of the report.
         *
         * ```javascript
         * page.removeFilters();
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        removeFilters(): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Makes the current page the active page of the report.
         *
         * ```javascript
         * page.setActive();
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setActive(): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Sets all filters on the current page.
         *
         * ```javascript
         * page.setFilters(filters);
         *   .catch(errors => { ... });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Set displayName to the current page.
         *
         * ```javascript
         * page.setName(displayName);
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setDisplayName(displayName: string): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Gets all the visuals on the page.
         *
         * ```javascript
         * page.getVisuals()
         *   .then(visuals => { ... });
         * ```
         *
         * @returns {Promise<VisualDescriptor[]>}
         */
        getVisuals(): Promise<VisualDescriptor[]>;
        /**
         * Checks if page has layout.
         *
         * ```javascript
         * page.hasLayout(layoutType)
         *  .then(hasLayout: boolean => { ... });
         * ```
         *
         * @returns {(Promise<boolean>)}
         */
        hasLayout(layoutType: any): Promise<boolean>;
    }
}
declare module "report" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    import { Page } from "page";
    import { IReportLoadConfiguration, IReportEmbedConfiguration } from 'powerbi-models';
    import { BookmarksManager } from "bookmarksManager";
    import { IHttpPostMessageResponse } from 'http-post-message';
    /**
     * A Report node within a report hierarchy
     *
     * @export
     * @interface IReportNode
     */
    export interface IReportNode {
        iframe: HTMLIFrameElement;
        service: service.IService;
        config: embed.IEmbedConfiguration | IReportEmbedConfiguration;
    }
    /**
     * The Power BI Report embed component
     *
     * @export
     * @class Report
     * @extends {embed.Embed}
     * @implements {IReportNode}
     * @implements {IFilterable}
     */
    export class Report extends embed.Embed implements IReportNode, IFilterable {
        /** @hidden */
        static allowedEvents: string[];
        /** @hidden */
        static reportIdAttribute: string;
        /** @hidden */
        static filterPaneEnabledAttribute: string;
        /** @hidden */
        static navContentPaneEnabledAttribute: string;
        /** @hidden */
        static typeAttribute: string;
        /** @hidden */
        static type: string;
        bookmarksManager: BookmarksManager;
        /**
         * Creates an instance of a Power BI Report.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} config
         * @hidden
         */
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement);
        /**
         * Adds backwards compatibility for the previous load configuration, which used the reportId query parameter to specify the report ID
         * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
         *
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
         * @hidden
         * @static
         * @param {string} url
         * @returns {string}
         */
        static findIdFromEmbedUrl(url: string): string;
        /**
         * Render a preloaded report, using phased embedding API
         *
         * ```javascript
         * // Load report
         * var report = powerbi.load(element, config);
         *
         * ...
         *
         * // Render report
         * report.render()
         * ```
         *
         * @returns {Promise<void>}
         */
        render(config?: IReportLoadConfiguration | embed.IReportEmbedConfiguration): Promise<void>;
        /**
         * Add an empty page to the report
         *
         * ```javascript
         * // Add a page to the report with "Sales" as the page display name
         * report.addPage("Sales");
         * ```
         *
         * @returns {Promise<Page>}
         */
        addPage(displayName?: string): Promise<Page>;
        /**
         * Delete a page from a report
         *
         * ```javascript
         * // Delete a page from a report by pageName (PageName is different than the display name and can be acquired from the getPages API)
         * report.deletePage("ReportSection145");
         * ```
         *
         * @returns {Promise<void>}
         */
        deletePage(pageName: string): Promise<void>;
        /**
         * Rename a page from a report
         *
         * ```javascript
         * // Rename a page from a report by changing displayName (pageName is different from the display name and can be acquired from the getPages API)
         * report.renamePage("ReportSection145", "Sales");
         * ```
         *
         * @returns {Promise<void>}
         */
        renamePage(pageName: string, displayName: string): Promise<void>;
        /**
         * Gets filters that are applied at the report level.
         *
         * ```javascript
         * // Get filters applied at report level
         * report.getFilters()
         *   .then(filters => {
         *     ...
         *   });
         * ```
         *
         * @returns {Promise<models.IFilter[]>}
         */
        getFilters(): Promise<models.IFilter[]>;
        /**
         * Gets the report ID from the first available location: options, attribute, embed url.
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Gets the list of pages within the report.
         *
         * ```javascript
         * report.getPages()
         *  .then(pages => {
         *      ...
         *  });
         * ```
         *
         * @returns {Promise<Page[]>}
         */
        getPages(): Promise<Page[]>;
        /**
         * Creates an instance of a Page.
         *
         * Normally you would get Page objects by calling `report.getPages()`, but in the case
         * that the page name is known and you want to perform an action on a page without having to retrieve it
         * you can create it directly.
         *
         * Note: Because you are creating the page manually there is no guarantee that the page actually exists in the report, and subsequent requests could fail.
         *
         * @param {string} name
         * @param {string} [displayName]
         * @param {boolean} [isActive]
         * @returns {Page}
         * @hidden
         */
        page(name: string, displayName?: string, isActive?: boolean, visibility?: models.SectionVisibility): Page;
        /**
         * Prints the active page of the report by invoking `window.print()` on the embed iframe component.
         */
        print(): Promise<void>;
        /**
         * Removes all filters at the report level.
         *
         * ```javascript
         * report.removeFilters();
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        removeFilters(): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Sets the active page of the report.
         *
         * ```javascript
         * report.setPage("page2")
         *  .catch(error => { ... });
         * ```
         *
         * @param {string} pageName
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setPage(pageName: string): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Sets filters at the report level.
         *
         * ```javascript
         * const filters: [
         *    ...
         * ];
         *
         * report.setFilters(filters)
         *  .catch(errors => {
         *    ...
         *  });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Updates visibility settings for the filter pane and the page navigation pane.
         *
         * ```javascript
         * const newSettings = {
         *   navContentPaneEnabled: true,
         *   filterPaneEnabled: false
         * };
         *
         * report.updateSettings(newSettings)
         *   .catch(error => { ... });
         * ```
         *
         * @param {models.ISettings} settings
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        updateSettings(settings: models.ISettings): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Validate load configuration.
         *
         * @hidden
         */
        validate(config: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Handle config changes.
         *
         * @returns {void}
         */
        configChanged(isBootstrap: boolean): void;
        /**
         * @hidden
         * @returns {string}
         */
        getDefaultEmbedUrlEndpoint(): string;
        /**
         * Switch Report view mode.
         *
         * @returns {Promise<void>}
         */
        switchMode(viewMode: models.ViewMode | string): Promise<void>;
        /**
        * Refreshes data sources for the report.
        *
        * ```javascript
        * report.refresh();
        * ```
        */
        refresh(): Promise<void>;
        /**
         * checks if the report is saved.
         *
         * ```javascript
         * report.isSaved()
         * ```
         *
         * @returns {Promise<boolean>}
         */
        isSaved(): Promise<boolean>;
        /**
         * Apply a theme to the report
         *
         * ```javascript
         * report.applyTheme(theme);
         * ```
         */
        applyTheme(theme: models.IReportTheme): Promise<void>;
        /**
        * Reset and apply the default theme of the report
        *
        * ```javascript
        * report.resetTheme();
        * ```
        */
        resetTheme(): Promise<void>;
        /**
        * Reset user's filters, slicers, and other data view changes to the default state of the report
        *
        * ```javascript
        * report.resetPersistentFilters();
        * ```
        */
        resetPersistentFilters(): Promise<IHttpPostMessageResponse<void>>;
        /**
        * Save user's filters, slicers, and other data view changes of the report
        *
        * ```javascript
        * report.savePersistentFilters();
        * ```
        */
        savePersistentFilters(): Promise<IHttpPostMessageResponse<void>>;
        /**
          * Returns if there are user's filters, slicers, or other data view changes applied on the report.
          * If persistent filters is disable, returns false.
          *
          * ```javascript
          * report.arePersistentFiltersApplied();
          * ```
          *
          * @returns {Promise<boolean>}
          */
        arePersistentFiltersApplied(): Promise<boolean>;
        /**
         * @hidden
         */
        private applyThemeInternal;
        /**
         * @hidden
         */
        private viewModeToString;
        /**
         * @hidden
         */
        private isMobileSettings;
    }
}
declare module "create" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    import * as embed from "embed";
    /**
     * A Power BI Report creator component
     *
     * @export
     * @class Create
     * @extends {embed.Embed}
     */
    export class Create extends embed.Embed {
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration | models.IReportCreateConfiguration, phasedRender?: boolean, isBootstrap?: boolean);
        /**
         * Gets the dataset ID from the first available location: createConfig or embed url.
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Validate create report configuration.
         */
        validate(config: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Handle config changes.
         *
         * @hidden
         * @returns {void}
         */
        configChanged(isBootstrap: boolean): void;
        /**
         * @hidden
         * @returns {string}
         */
        getDefaultEmbedUrlEndpoint(): string;
        /**
         * checks if the report is saved.
         *
         * ```javascript
         * report.isSaved()
         * ```
         *
         * @returns {Promise<boolean>}
         */
        isSaved(): Promise<boolean>;
        /**
         * Adds the ability to get datasetId from url.
         * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?datasetId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
         *
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the create configuration.
         *
         * @static
         * @param {string} url
         * @returns {string}
         * @hidden
         */
        static findIdFromEmbedUrl(url: string): string;
    }
}
declare module "dashboard" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    /**
     * A Dashboard node within a dashboard hierarchy
     *
     * @export
     * @interface IDashboardNode
     */
    export interface IDashboardNode {
        iframe: HTMLIFrameElement;
        service: service.IService;
        config: embed.IEmbedConfigurationBase;
    }
    /**
     * A Power BI Dashboard embed component
     *
     * @export
     * @class Dashboard
     * @extends {embed.Embed}
     * @implements {IDashboardNode}
     */
    export class Dashboard extends embed.Embed implements IDashboardNode {
        /** @hidden */
        static allowedEvents: string[];
        /** @hidden */
        static dashboardIdAttribute: string;
        /** @hidden */
        static typeAttribute: string;
        /** @hidden */
        static type: string;
        /**
         * Creates an instance of a Power BI Dashboard.
         *
         * @param {service.Service} service
         * @hidden
         * @param {HTMLElement} element
         */
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean);
        /**
         * This adds backwards compatibility for older config which used the dashboardId query param to specify dashboard id.
         * E.g. https://powerbi-df.analysis-df.windows.net/dashboardEmbedHost?dashboardId=e9363c62-edb6-4eac-92d3-2199c5ca2a9e
         *
         * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
         * @hidden
         * @static
         * @param {string} url
         * @returns {string}
         */
        static findIdFromEmbedUrl(url: string): string;
        /**
         * Get dashboard id from first available location: options, attribute, embed url.
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Validate load configuration.
         *
         * @hidden
         */
        validate(baseConfig: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Handle config changes.
         * @hidden
         * @returns {void}
         */
        configChanged(isBootstrap: boolean): void;
        /**
         * @hidden
         * @returns {string}
         */
        getDefaultEmbedUrlEndpoint(): string;
        /**
         * Validate that pageView has a legal value: if page view is defined it must have one of the values defined in models.PageView
         * @hidden
         */
        private ValidatePageView;
    }
}
declare module "tile" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    import * as embed from "embed";
    /**
     * The Power BI tile embed component
     *
     * @export
     * @class Tile
     * @extends {Embed}
     */
    export class Tile extends embed.Embed {
        /** @hidden */
        static type: string;
        /** @hidden */
        static allowedEvents: string[];
        /**
         * @hidden
         */
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean);
        /**
         * The ID of the tile
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Validate load configuration.
         */
        validate(config: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Handle config changes.
         *
         * @returns {void}
         */
        configChanged(isBootstrap: boolean): void;
        /**
         * @hidden
         * @returns {string}
         */
        getDefaultEmbedUrlEndpoint(): string;
        /**
         * Adds the ability to get tileId from url.
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
         *
         * @hidden
         * @static
         * @param {string} url
         * @returns {string}
         */
        static findIdFromEmbedUrl(url: string): string;
    }
}
declare module "qna" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    import * as embed from "embed";
    import { IHttpPostMessageResponse } from 'http-post-message';
    /**
     * The Power BI Q&A embed component
     *
     * @export
     * @class Qna
     * @extends {Embed}
     */
    export class Qna extends embed.Embed {
        /** @hidden */
        static type: string;
        /** @hidden */
        static allowedEvents: string[];
        /**
         * @hidden
         */
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean);
        /**
         * The ID of the Q&A embed component
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Change the question of the Q&A embed component
         *
         * @param {string} question - question which will render Q&A data
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setQuestion(question: string): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Handle config changes.
         *
         * @returns {void}
         */
        configChanged(isBootstrap: boolean): void;
        /**
         * @hidden
         * @returns {string}
         */
        getDefaultEmbedUrlEndpoint(): string;
        /**
         * Validate load configuration.
         */
        validate(config: embed.IEmbedConfigurationBase): models.IError[];
    }
}
declare module "visual" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    import { Report } from "report";
    import { Page } from "page";
    import { VisualDescriptor } from "visualDescriptor";
    import { IHttpPostMessageResponse } from 'http-post-message';
    import { IReportLoadConfiguration } from 'powerbi-models';
    /**
     * The Power BI Visual embed component
     *
     * @export
     * @class Visual
     */
    export class Visual extends Report {
        /** @hidden */
        static type: string;
        /** @hidden */
        static GetPagesNotSupportedError: string;
        /** @hidden */
        static SetPageNotSupportedError: string;
        /** @hidden */
        static RenderNotSupportedError: string;
        /**
         * Creates an instance of a Power BI Single Visual.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} config
         * @hidden
         */
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement);
        /**
         * @hidden
         */
        load(phasedRender?: boolean): Promise<void>;
        /**
         * Gets the list of pages within the report - not supported in visual embed.
         *
         * @returns {Promise<Page[]>}
         */
        getPages(): Promise<Page[]>;
        /**
         * Sets the active page of the report - not supported in visual embed.
         *
         * @param {string} pageName
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setPage(pageName: string): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Render a preloaded report, using phased embedding API
         *
         * @hidden
         * @returns {Promise<void>}
         */
        render(config?: IReportLoadConfiguration | embed.IReportEmbedConfiguration): Promise<void>;
        /**
         * Gets the embedded visual descriptor object that contains the visual name, type, etc.
         *
         * ```javascript
         * visual.getVisualDescriptor()
         *   .then(visualDetails => { ... });
         * ```
         *
         * @returns {Promise<VisualDescriptor>}
         */
        getVisualDescriptor(): Promise<VisualDescriptor>;
        /**
         * Gets filters that are applied to the filter level.
         * Default filter level is visual level.
         *
         * ```javascript
         * visual.getFilters(filtersLevel)
         *   .then(filters => {
         *     ...
         *   });
         * ```
         *
         * @returns {Promise<models.IFilter[]>}
         */
        getFilters(filtersLevel?: models.FiltersLevel): Promise<models.IFilter[]>;
        /**
         * Sets filters at the filter level.
         * Default filter level is visual level.
         *
         * ```javascript
         * const filters: [
         *    ...
         * ];
         *
         * visual.setFilters(filters, filtersLevel)
         *  .catch(errors => {
         *    ...
         *  });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        setFilters(filters: models.IFilter[], filtersLevel?: models.FiltersLevel): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Removes all filters from the current filter level.
         * Default filter level is visual level.
         *
         * ```javascript
         * visual.removeFilters(filtersLevel);
         * ```
         *
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        removeFilters(filtersLevel?: models.FiltersLevel): Promise<IHttpPostMessageResponse<void>>;
        /**
         * @hidden
         */
        private getFiltersLevelUrl;
    }
}
declare module "service" {
    import * as embed from "embed";
    import * as wpmp from 'window-post-message-proxy';
    import * as hpm from 'http-post-message';
    import * as router from 'powerbi-router';
    import * as models from 'powerbi-models';
    export interface IEvent<T> {
        type: string;
        id: string;
        name: string;
        value: T;
    }
    /**
     * @hidden
     */
    export interface ICustomEvent<T> extends CustomEvent {
        detail: T;
    }
    /**
     * @hidden
     */
    export interface IEventHandler<T> {
        (event: ICustomEvent<T>): any;
    }
    /**
     * @hidden
     */
    export interface IHpmFactory {
        (wpmp: wpmp.WindowPostMessageProxy, targetWindow?: Window, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
    }
    /**
     * @hidden
     */
    export interface IWpmpFactory {
        (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window): wpmp.WindowPostMessageProxy;
    }
    /**
     * @hidden
     */
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
    export type IComponentEmbedConfiguration = embed.IReportEmbedConfiguration | embed.IDashboardEmbedConfiguration | embed.ITileEmbedConfiguration | embed.IVisualEmbedConfiguration | embed.IQnaEmbedConfiguration;
    /**
     * The Power BI Service embed component, which is the entry point to embed all other Power BI components into your application
     *
     * @export
     * @class Service
     * @implements {IService}
     */
    export class Service implements IService {
        /**
         * A list of components that this service can embed
         */
        private static components;
        /**
         * The default configuration for the service
         */
        private static defaultConfig;
        /**
         * Gets or sets the access token as the global fallback token to use when a local token is not provided for a report or tile.
         *
         * @type {string}
         * @hidden
         */
        accessToken: string;
        /**The Configuration object for the service*/
        private config;
        /** A list of Dashboard, Report and Tile components that have been embedded using this service instance. */
        private embeds;
        /** TODO: Look for way to make hpm private without sacrificing ease of maintenance. This should be private but in embed needs to call methods.
         * @hidden
        */
        hpm: hpm.HttpPostMessage;
        /** TODO: Look for way to make wpmp private.  This is only public to allow stopping the wpmp in tests
         * @hidden
        */
        wpmp: wpmp.WindowPostMessageProxy;
        private router;
        private uniqueSessionId;
        /**
         * Creates an instance of a Power BI Service.
         *
         * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
         * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
         * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
         * @param {IServiceConfiguration} [config={}]
         * @hidden
         */
        constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config?: IServiceConfiguration);
        /**
         * Creates new report
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} [config={}]
         * @returns {embed.Embed}
         */
        createReport(element: HTMLElement, config: embed.IEmbedConfiguration | models.IReportCreateConfiguration): embed.Embed;
        /**
         * TODO: Add a description here
         *
         * @param {HTMLElement} [container]
         * @param {embed.IEmbedConfiguration} [config=undefined]
         * @returns {embed.Embed[]}
         * @hidden
         */
        init(container?: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed[];
        /**
         * Given a configuration based on an HTML element,
         * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
         * otherwise creates a new component instance.
         *
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfigurationBase} [config={}]
         * @returns {embed.Embed}
         */
        embed(element: HTMLElement, config?: IComponentEmbedConfiguration | embed.IEmbedConfigurationBase): embed.Embed;
        /**
         * Given a configuration based on an HTML element,
         * if the component has already been created and attached to the element, reuses the component instance and existing iframe,
         * otherwise creates a new component instance.
         * This is used for the phased embedding API, once element is loaded successfully, one can call 'render' on it.
         *
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfigurationBase} [config={}]
         * @returns {embed.Embed}
         */
        load(element: HTMLElement, config?: IComponentEmbedConfiguration | embed.IEmbedConfigurationBase): embed.Embed;
        /**
         * Given an HTML element and entityType, creates a new component instance, and bootstrap the iframe for embedding.
         *
         * @param {HTMLElement} element
         * @param {embed.IBootstrapEmbedConfiguration} config: a bootstrap config which is an embed config without access token.
         */
        bootstrap(element: HTMLElement, config: IComponentEmbedConfiguration | embed.IBootstrapEmbedConfiguration): embed.Embed;
        /** @hidden */
        embedInternal(element: HTMLElement, config?: IComponentEmbedConfiguration | embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean): embed.Embed;
        /** @hidden */
        getNumberOfComponents(): number;
        /** @hidden */
        getSdkSessionId(): string;
        /**
         * Given a configuration based on a Power BI element, saves the component instance that reference the element for later lookup.
         *
         * @private
         * @param {IPowerBiElement} element
         * @param {embed.IEmbedConfigurationBase} config
         * @returns {embed.Embed}
         * @hidden
         */
        private embedNew;
        /**
         * Given an element that already contains an embed component, load with a new configuration.
         *
         * @private
         * @param {IPowerBiElement} element
         * @param {embed.IEmbedConfigurationBase} config
         * @returns {embed.Embed}
         * @hidden
         */
        private embedExisting;
        /**
         * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
         * and automatically attempts to embed a powerbi component based on information from other powerbi-* attributes.
         *
         * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
         * This handler is typically useful only for applications that are rendered on the server so that all required data is available when the handler is called.
         *
         * @hidden
         */
        enableAutoEmbed(): void;
        /**
         * Returns an instance of the component associated with the element.
         *
         * @param {HTMLElement} element
         * @returns {(Report | Tile)}
         */
        get(element: HTMLElement): embed.Embed;
        /**
         * Finds an embed instance by the name or unique ID that is provided.
         *
         * @param {string} uniqueId
         * @returns {(Report | Tile)}
         * @hidden
         */
        find(uniqueId: string): embed.Embed;
        /**
         * Removes embed components whose container element is same as the given element
         *
         * @param {Embed} component
         * @param {HTMLElement} element
         * @returns {void}
         * @hidden
         */
        addOrOverwriteEmbed(component: embed.Embed, element: HTMLElement): void;
        /**
         * Given an HTML element that has a component embedded within it, removes the component from the list of embedded components, removes the association between the element and the component, and removes the iframe.
         *
         * @param {HTMLElement} element
         * @returns {void}
         */
        reset(element: HTMLElement): void;
        /**
         * handles tile events
         *
         * @param {IEvent<any>} event
         * @hidden
         */
        handleTileEvents(event: IEvent<any>): void;
        /**
         * Given an event object, finds the embed component with the matching type and ID, and invokes its handleEvent method with the event object.
         *
         * @private
         * @param {IEvent<any>} event
         * @hidden
         */
        private handleEvent;
        /**
         * API for warm starting powerbi embedded endpoints.
         * Use this API to preload Power BI Embedded in the background.
         *
         * @public
         * @param {embed.IEmbedConfigurationBase} [config={}]
         * @param {HTMLElement} [element=undefined]
         */
        preload(config: IComponentEmbedConfiguration | embed.IEmbedConfigurationBase, element?: HTMLElement): HTMLIFrameElement;
    }
}
declare module "bookmarksManager" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    import { IHttpPostMessageResponse } from 'http-post-message';
    /**
     * APIs for managing the report bookmarks.
     *
     * @export
     * @interface IBookmarksManager
     */
    export interface IBookmarksManager {
        getBookmarks(): Promise<models.IReportBookmark[]>;
        apply(bookmarkName: string): Promise<IHttpPostMessageResponse<void>>;
        play(playMode: models.BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>>;
        capture(options?: models.ICaptureBookmarkOptions): Promise<models.IReportBookmark>;
        applyState(state: string): Promise<IHttpPostMessageResponse<void>>;
    }
    /**
     * Manages report bookmarks.
     *
     * @export
     * @class BookmarksManager
     * @implements {IBookmarksManager}
     */
    export class BookmarksManager implements IBookmarksManager {
        private service;
        private config;
        private iframe?;
        /**
         * @hidden
         */
        constructor(service: service.Service, config: embed.IEmbedConfigurationBase, iframe?: HTMLIFrameElement);
        /**
         * Gets bookmarks that are defined in the report.
         *
         * ```javascript
         * // Gets bookmarks that are defined in the report
         * bookmarksManager.getBookmarks()
         *   .then(bookmarks => {
         *     ...
         *   });
         * ```
         *
         * @returns {Promise<models.IReportBookmark[]>}
         */
        getBookmarks(): Promise<models.IReportBookmark[]>;
        /**
         * Apply bookmark by name.
         *
         * ```javascript
         * bookmarksManager.apply(bookmarkName)
         * ```
         *
         * @param {string} bookmarkName The name of the bookmark to be applied
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        apply(bookmarkName: string): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Play bookmarks: Enter or Exit bookmarks presentation mode.
         *
         * ```javascript
         * // Enter presentation mode.
         * bookmarksManager.play(models.BookmarksPlayMode.Presentation)
         * ```
         *
         * @param {models.BookmarksPlayMode} playMode Play mode can be either `Presentation` or `Off`
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        play(playMode: models.BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>>;
        /**
         * Capture bookmark from current state.
         *
         * ```javascript
         * bookmarksManager.capture(options)
         * ```
         *
         * @param {models.ICaptureBookmarkOptions} [options] Options for bookmark capturing
         * @returns {Promise<models.IReportBookmark>}
         */
        capture(options?: models.ICaptureBookmarkOptions): Promise<models.IReportBookmark>;
        /**
         * Apply bookmark state.
         *
         * ```javascript
         * bookmarksManager.applyState(bookmarkState)
         * ```
         *
         * @param {string} state A base64 bookmark state to be applied
         * @returns {Promise<IHttpPostMessageResponse<void>>}
         */
        applyState(state: string): Promise<IHttpPostMessageResponse<void>>;
    }
}
declare module "factories" {
    /**
     * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
     */
    import { IHpmFactory, IWpmpFactory, IRouterFactory } from "service";
    export { IHpmFactory, IWpmpFactory, IRouterFactory };
    export const hpmFactory: IHpmFactory;
    export const wpmpFactory: IWpmpFactory;
    export const routerFactory: IRouterFactory;
}
declare module "powerbi-client" {
    /**
     * @hidden
     */
    import * as service from "service";
    import * as factories from "factories";
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    export { IFilterable, service, factories, models };
    export { Report } from "report";
    export { Dashboard } from "dashboard";
    export { Tile } from "tile";
    export { IEmbedConfiguration, IQnaEmbedConfiguration, IVisualEmbedConfiguration, IReportEmbedConfiguration, IDashboardEmbedConfiguration, ITileEmbedConfiguration, Embed, ILocaleSettings, IEmbedSettings, IQnaSettings, } from "embed";
    export { Page } from "page";
    export { Qna } from "qna";
    export { Visual } from "visual";
    export { VisualDescriptor } from "visualDescriptor";
    global {
        interface Window {
            powerbi: service.Service;
        }
    }
}
