/*! powerbi-client v2.5.1 | (c) 2016 Microsoft Corporation MIT */
declare module "util" {
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
     * Generates a random 7 character string.
     *
     * @export
     * @returns {string}
     */
    export function createRandomString(): string;
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
}
declare module "embed" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    global  {
        interface Document {
            mozCancelFullScreen: Function;
            msExitFullscreen: Function;
        }
        interface HTMLIFrameElement {
            mozRequestFullScreen: Function;
            msRequestFullscreen: Function;
        }
    }
    /**
     * Base Configuration settings for Power BI embed components
     *
     * @export
     * @interface IEmbedConfigurationBase
     */
    export interface IEmbedConfigurationBase {
        settings?: ISettings;
        embedUrl?: string;
        uniqueId?: string;
        type?: string;
        accessToken?: string;
        tokenType?: models.TokenType;
    }
    /**
     * Configuration settings for Power BI embed components
     *
     * @export
     * @interface IEmbedConfiguration
     */
    export interface IEmbedConfiguration extends IEmbedConfigurationBase {
        id?: string;
        settings?: IEmbedSettings;
        pageName?: string;
        filters?: models.IFilter[];
        pageView?: models.PageView;
        datasetId?: string;
        permissions?: models.Permissions;
        viewMode?: models.ViewMode;
        action?: string;
        dashboardId?: string;
        height?: number;
        width?: number;
    }
    export interface IVisualEmbedConfiguration extends IEmbedConfiguration {
        visualName: string;
    }
    /**
     * Configuration settings for Power BI QNA embed component
     *
     * @export
     * @interface IEmbedConfiguration
     */
    export interface IQnaEmbedConfiguration extends IEmbedConfigurationBase {
        datasetIds: string[];
        question?: string;
        viewMode?: models.QnaMode;
    }
    export interface ILocaleSettings {
        language?: string;
        formatLocale?: string;
    }
    export interface ISettings {
        localeSettings?: ILocaleSettings;
    }
    export interface IEmbedSettings extends models.ISettings, ISettings {
    }
    export interface IQnaSettings extends models.IQnaSettings, ISettings {
    }
    export interface IInternalEventHandler<T> {
        test(event: service.IEvent<T>): boolean;
        handle(event: service.ICustomEvent<T>): void;
    }
    /**
     * Base class for all Power BI embed components
     *
     * @export
     * @abstract
     * @class Embed
     */
    export abstract class Embed {
        static allowedEvents: string[];
        static accessTokenAttribute: string;
        static embedUrlAttribute: string;
        static nameAttribute: string;
        static typeAttribute: string;
        static type: string;
        allowedEvents: any[];
        /**
         * Gets or sets the event handler registered for this embed component.
         *
         * @type {IInternalEventHandler<any>[]}
         */
        eventHandlers: IInternalEventHandler<any>[];
        /**
         * Gets or sets the Power BI embed service.
         *
         * @type {service.Service}
         */
        service: service.Service;
        /**
         * Gets or sets the HTML element that contains the Power BI embed component.
         *
         * @type {HTMLElement}
         */
        element: HTMLElement;
        /**
         * Gets or sets the HTML iframe element that renders the Power BI embed component.
         *
         * @type {HTMLIFrameElement}
         */
        iframe: HTMLIFrameElement;
        /**
         * Gets or sets the configuration settings for the Power BI embed component.
         *
         * @type {IEmbedConfigurationBase}
         */
        config: IEmbedConfigurationBase;
        /**
         * Gets or sets the configuration settings for creating report.
         *
         * @type {models.IReportCreateConfiguration}
         */
        createConfig: models.IReportCreateConfiguration;
        /**
         * Url used in the load request.
         */
        loadPath: string;
        /**
         * Url used in the load request.
         */
        phasedLoadPath: string;
        /**
         * Type of embed
         */
        embeType: string;
        /**
         * Creates an instance of Embed.
         *
         * Note: there is circular reference between embeds and the service, because
         * the service has a list of all embeds on the host page, and each embed has a reference to the service that created it.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {IEmbedConfigurationBase} config
         */
        constructor(service: service.Service, element: HTMLElement, config: IEmbedConfigurationBase, iframe?: HTMLIFrameElement, phasedRender?: boolean);
        /**
         * Sends createReport configuration data.
         *
         * ```javascript
         * createReport({
         *   datasetId: '5dac7a4a-4452-46b3-99f6-a25915e0fe55',
         *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
         * ```
         *
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
         *
         * @param {models.ILoadConfiguration} config
         * @param {boolean} phasedRender
         * @returns {Promise<void>}
         */
        load(config: IEmbedConfigurationBase, phasedRender?: boolean): Promise<void>;
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
         */
        private getAccessToken(globalAccessToken);
        /**
         * Populate config for create and load
         *
         * @param {IEmbedConfiguration}
         * @returns {void}
         */
        populateConfig(config: IEmbedConfigurationBase): void;
        /**
         * Adds locale parameters to embedUrl
         *
         * @private
         * @param {IEmbedConfiguration} config
         */
        private addLocaleToEmbedUrl(config);
        /**
         * Gets an embed url from the first available location: options, attribute.
         *
         * @private
         * @returns {string}
         */
        private getEmbedUrl();
        /**
         * Gets a unique ID from the first available location: options, attribute.
         * If neither is provided generate a unique string.
         *
         * @private
         * @returns {string}
         */
        private getUniqueId();
        /**
         * Gets the report ID from the first available location: options, attribute.
         *
         * @abstract
         * @returns {string}
         */
        abstract getId(): string;
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
         */
        private isFullscreen(iframe);
        /**
         * Validate load and create configuration.
         */
        abstract validate(config: IEmbedConfigurationBase): models.IError[];
        /**
         * Sets Iframe for embed
         */
        private setIframe(isLoad, phasedRender?);
    }
}
declare module "ifilterable" {
    import * as models from 'powerbi-models';
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
         * @returns {Promise<void>}
         */
        setFilters(filters: models.IFilter[]): Promise<void>;
        /**
         * Removes all filters from the current object.
         *
         * @returns {Promise<void>}
         */
        removeFilters(): Promise<void>;
    }
}
declare module "visualDescriptor" {
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    import { IPageNode } from "page";
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
         * The visual layout: position, size and visiblity.
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
         * @returns {Promise<void>}
         */
        removeFilters(): Promise<void>;
        /**
         * Sets the filters on the current visual to 'filters'.
         *
         * ```javascript
         * visual.setFilters(filters);
         *   .catch(errors => { ... });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<void>}
         */
        setFilters(filters: models.IFilter[]): Promise<void>;
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
         * @returns {(Promise<string>)}
         */
        exportData(exportDataType?: models.ExportDataType, rows?: number): Promise<string>;
    }
}
declare module "page" {
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
         * Creates an instance of a Power BI report page.
         *
         * @param {IReportNode} report
         * @param {string} name
         * @param {string} [displayName]
         * @param {boolean} [isActivePage]
         */
        constructor(report: IReportNode, name: string, displayName?: string, isActivePage?: boolean);
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
         * Removes all filters from this page of the report.
         *
         * ```javascript
         * page.removeFilters();
         * ```
         *
         * @returns {Promise<void>}
         */
        removeFilters(): Promise<void>;
        /**
         * Makes the current page the active page of the report.
         *
         * ```javascripot
         * page.setActive();
         * ```
         *
         * @returns {Promise<void>}
         */
        setActive(): Promise<void>;
        /**
         * Sets all filters on the current page.
         *
         * ```javascript
         * page.setFilters(filters);
         *   .catch(errors => { ... });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<void>}
         */
        setFilters(filters: models.IFilter[]): Promise<void>;
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
declare module "defaults" {
    import * as models from 'powerbi-models';
    export abstract class Defaults {
        static defaultSettings: models.ISettings;
        static defaultQnaSettings: models.IQnaSettings;
    }
}
declare module "report" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    import { Page } from "page";
    import { IReportLoadConfiguration } from 'powerbi-models';
    import { BookmarksManager } from "bookmarksManager";
    /**
     * A Report node within a report hierarchy
     *
     * @export
     * @interface IReportNode
     */
    export interface IReportNode {
        iframe: HTMLIFrameElement;
        service: service.IService;
        config: embed.IEmbedConfiguration;
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
        static allowedEvents: string[];
        static reportIdAttribute: string;
        static filterPaneEnabledAttribute: string;
        static navContentPaneEnabledAttribute: string;
        static typeAttribute: string;
        static type: string;
        bookmarksManager: BookmarksManager;
        /**
         * Creates an instance of a Power BI Report.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} config
         */
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, iframe?: HTMLIFrameElement);
        /**
         * Adds backwards compatibility for the previous load configuration, which used the reportId query parameter to specify the report ID
         * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
         *
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
         *
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
        render(config?: IReportLoadConfiguration): Promise<void>;
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
         * ```javascript
         * const page = report.page('ReportSection1');
         * page.setActive();
         * ```
         *
         * @param {string} name
         * @param {string} [displayName]
         * @param {boolean} [isActive]
         * @returns {Page}
         */
        page(name: string, displayName?: string, isActive?: boolean): Page;
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
         * @returns {Promise<void>}
         */
        removeFilters(): Promise<void>;
        /**
         * Sets the active page of the report.
         *
         * ```javascript
         * report.setPage("page2")
         *  .catch(error => { ... });
         * ```
         *
         * @param {string} pageName
         * @returns {Promise<void>}
         */
        setPage(pageName: string): Promise<void>;
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
         * @returns {Promise<void>}
         */
        setFilters(filters: models.IFilter[]): Promise<void>;
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
         * @returns {Promise<void>}
         */
        updateSettings(settings: models.ISettings): Promise<void>;
        /**
         * Validate load configuration.
         */
        validate(config: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Populate config for load config
         *
         * @param {IEmbedConfigurationBase}
         * @returns {void}
         */
        populateConfig(baseConfig: embed.IEmbedConfigurationBase): void;
        /**
         * Switch Report view mode.
         *
         * @returns {Promise<void>}
         */
        switchMode(viewMode: models.ViewMode): Promise<void>;
        /**
        * Refreshes data sources for the report.
        *
        * ```javascript
        * report.refresh();
        * ```
        */
        refresh(): Promise<void>;
    }
}
declare module "create" {
    import * as service from "service";
    import * as models from 'powerbi-models';
    import * as embed from "embed";
    export class Create extends embed.Embed {
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration, phasedRender?: boolean);
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
         * Populate config for create
         *
         * @param {IEmbedConfigurationBase}
         * @returns {void}
         */
        populateConfig(baseConfig: embed.IEmbedConfigurationBase): void;
        /**
         * Adds the ability to get datasetId from url.
         * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?datasetId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
         *
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the create configuration.
         *
         * @static
         * @param {string} url
         * @returns {string}
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
     * @implements {IFilterable}
     */
    export class Dashboard extends embed.Embed implements IDashboardNode {
        static allowedEvents: string[];
        static dashboardIdAttribute: string;
        static typeAttribute: string;
        static type: string;
        /**
         * Creates an instance of a Power BI Dashboard.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         */
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean);
        /**
         * This adds backwards compatibility for older config which used the dashboardId query param to specify dashboard id.
         * E.g. https://powerbi-df.analysis-df.windows.net/dashboardEmbedHost?dashboardId=e9363c62-edb6-4eac-92d3-2199c5ca2a9e
         *
         * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
         *
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
         */
        validate(baseConfig: embed.IEmbedConfigurationBase): models.IError[];
        /**
         * Populate config for load config
         *
         * @param {IEmbedConfigurationBase}
         * @returns {void}
         */
        populateConfig(baseConfig: embed.IEmbedConfigurationBase): void;
        /**
         * Validate that pageView has a legal value: if page view is defined it must have one of the values defined in models.PageView
         */
        private ValidatePageView(pageView);
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
        static type: string;
        static allowedEvents: string[];
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean);
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
         * Populate config for load config
         *
         * @param {IEmbedConfigurationBase}
         * @returns {void}
         */
        populateConfig(baseConfig: embed.IEmbedConfigurationBase): void;
        /**
         * Adds the ability to get tileId from url.
         * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
         *
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
    /**
     * The Power BI Qna embed component
     *
     * @export
     * @class Qna
     * @extends {Embed}
     */
    export class Qna extends embed.Embed {
        static type: string;
        static allowedEvents: string[];
        constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean);
        /**
         * The ID of the Qna embed component
         *
         * @returns {string}
         */
        getId(): string;
        /**
         * Change the question of the Q&A embed component
         *
         * @param question - question which will render Q&A data
         * @returns {string}
         */
        setQuestion(question: string): Promise<void>;
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
    /**
     * The Power BI Visual embed component
     *
     * @export
     * @class Visual
     */
    export class Visual extends Report {
        static type: string;
        static GetFiltersNotSupportedError: string;
        static SetFiltersNotSupportedError: string;
        static GetPagesNotSupportedError: string;
        static SetPageNotSupportedError: string;
        /**
         * Creates an instance of a Power BI Single Visual.
         *
         * @param {service.Service} service
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} config
         */
        constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, iframe?: HTMLIFrameElement);
        load(baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean): Promise<void>;
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
         * @returns {Promise<void>}
         */
        setPage(pageName: string): Promise<void>;
        /**
         * Gets filters that are applied at the visual level.
         *
         * ```javascript
         * // Get filters applied at visual level
         * visual.getFilters()
         *   .then(filters => {
         *     ...
         *   });
         * ```
         *
         * @returns {Promise<models.IFilter[]>}
         */
        getFilters(): Promise<models.IFilter[]>;
        /**
         * Sets filters at the visual level.
         *
         * ```javascript
         * const filters: [
         *    ...
         * ];
         *
         * visual.setFilters(filters)
         *  .catch(errors => {
         *    ...
         *  });
         * ```
         *
         * @param {(models.IFilter[])} filters
         * @returns {Promise<void>}
         */
        setFilters(filters: models.IFilter[]): Promise<void>;
    }
}
declare module "service" {
    import * as embed from "embed";
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
         */
        accessToken: string;
        /**The Configuration object for the service*/
        private config;
        /** A list of Dashboard, Report and Tile components that have been embedded using this service instance. */
        private embeds;
        /** TODO: Look for way to make hpm private without sacraficing ease of maitenance. This should be private but in embed needs to call methods. */
        hpm: hpm.HttpPostMessage;
        /** TODO: Look for way to make wpmp private.  This is only public to allow stopping the wpmp in tests */
        wpmp: wpmp.WindowPostMessageProxy;
        private router;
        private static DefaultInitEmbedUrl;
        /**
         * Creates an instance of a Power BI Service.
         *
         * @param {IHpmFactory} hpmFactory The http post message factory used in the postMessage communication layer
         * @param {IWpmpFactory} wpmpFactory The window post message factory used in the postMessage communication layer
         * @param {IRouterFactory} routerFactory The router factory used in the postMessage communication layer
         * @param {IServiceConfiguration} [config={}]
         */
        constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config?: IServiceConfiguration);
        /**
         * Creates new report
         * @param {HTMLElement} element
         * @param {embed.IEmbedConfiguration} [config={}]
         * @returns {embed.Embed}
         */
        createReport(element: HTMLElement, config: embed.IEmbedConfiguration): embed.Embed;
        /**
         * TODO: Add a description here
         *
         * @param {HTMLElement} [container]
         * @param {embed.IEmbedConfiguration} [config=undefined]
         * @returns {embed.Embed[]}
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
        embed(element: HTMLElement, config?: embed.IEmbedConfigurationBase): embed.Embed;
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
        load(element: HTMLElement, config?: embed.IEmbedConfigurationBase): embed.Embed;
        embedInternal(element: HTMLElement, config?: embed.IEmbedConfigurationBase, phasedRender?: boolean): embed.Embed;
        /**
         * Given a configuration based on a Power BI element, saves the component instance that reference the element for later lookup.
         *
         * @private
         * @param {IPowerBiElement} element
         * @param {embed.IEmbedConfigurationBase} config
         * @returns {embed.Embed}
         */
        private embedNew(element, config, phasedRender?);
        /**
         * Given an element that already contains an embed component, load with a new configuration.
         *
         * @private
         * @param {IPowerBiElement} element
         * @param {embed.IEmbedConfigurationBase} config
         * @returns {embed.Embed}
         */
        private embedExisting(element, config, phasedRender?);
        /**
         * Adds an event handler for DOMContentLoaded, which searches the DOM for elements that have the 'powerbi-embed-url' attribute,
         * and automatically attempts to embed a powerbi component based on information from other powerbi-* attributes.
         *
         * Note: Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
         * This handler is typically useful only for applications that are rendered on the server so that all required data is available when the handler is called.
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
         */
        find(uniqueId: string): embed.Embed;
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
         */
        handleTileEvents(event: IEvent<any>): void;
        /**
         * Given an event object, finds the embed component with the matching type and ID, and invokes its handleEvent method with the event object.
         *
         * @private
         * @param {IEvent<any>} event
         */
        private handleEvent(event);
        /**
         * API for warm starting powerbi embedded endpoints.
         * Use this API to preload Power BI Embedded in the background.
         *
         * @public
         * @param {embed.IEmbedConfigurationBase} [config={}]
         * @param {HTMLElement} [element=undefined]
         */
        preload(config: embed.IEmbedConfigurationBase, element?: HTMLElement): HTMLIFrameElement;
    }
}
declare module "bookmarksManager" {
    import * as service from "service";
    import * as embed from "embed";
    import * as models from 'powerbi-models';
    /**
     * Report bookmarks management APIs.
     *
     * @export
     * @interface IBookmarksManager
     */
    export interface IBookmarksManager {
        getBookmarks(): Promise<models.IReportBookmark[]>;
        apply(bookmarkName: string): Promise<void>;
        play(playMode: models.BookmarksPlayMode): Promise<void>;
        capture(): Promise<models.IReportBookmark>;
        applyState(state: string): Promise<void>;
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
        private iframe;
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
         * Apply bookmark By name.
         *
         * ```javascript
         * bookmarksManager.apply(bookmarkName)
         * ```
         *
         * @returns {Promise<void>}
         */
        apply(bookmarkName: string): Promise<void>;
        /**
         * Play bookmarks: Enter or Exit bookmarks presentation mode.
         *
         * ```javascript
         * // Enter presentation mode.
         * bookmarksManager.play(true)
         * ```
         *
         * @returns {Promise<void>}
         */
        play(playMode: models.BookmarksPlayMode): Promise<void>;
        /**
         * Capture bookmark from current state.
         *
         * ```javascript
         * bookmarksManager.capture()
         * ```
         *
         * @returns {Promise<models.IReportBookmark>}
         */
        capture(): Promise<models.IReportBookmark>;
        /**
         * Apply bookmark state.
         *
         * ```javascript
         * bookmarksManager.applyState(bookmarkName)
         * ```
         *
         * @returns {Promise<void>}
         */
        applyState(state: string): Promise<void>;
    }
}
declare module "config" {
    const config: {
        version: string;
        type: string;
    };
    export default config;
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
    import * as service from "service";
    import * as factories from "factories";
    import * as models from 'powerbi-models';
    import { IFilterable } from "ifilterable";
    export { IFilterable, service, factories, models };
    export { Report } from "report";
    export { Dashboard } from "dashboard";
    export { Tile } from "tile";
    export { IEmbedConfiguration, Embed, ILocaleSettings, IEmbedSettings } from "embed";
    export { Page } from "page";
    export { Qna } from "qna";
    export { Visual } from "visual";
    export { VisualDescriptor } from "visualDescriptor";
    global  {
        interface Window {
            powerbi: service.Service;
        }
    }
}
