/*! powerbi-client v2.0.0-beta.6 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
export declare class Report extends embed.Embed {
    static allowedEvents: string[];
    static reportIdAttribute: string;
    static type: string;
    constructor(service: service.Service, hpmFactory: service.IHpmFactory, element: HTMLElement, config: embed.IEmbedConfiguration);
    /**
     * This adds backwards compatibility for older config which used the reportId query param to specify report id.
     * E.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1
     *
     * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
     */
    static findIdFromEmbedUrl(url: string): string;
    /**
     * Add filter to report
     * An optional target may be passed to apply the filter to specific page or visual.
     *
     * ```javascript
     * // Add filter to report
     * const filter = new models.BasicFilter(...);
     * report.addFilter(filter);
     *
     * // Add advanced filter to specific visual;
     * const target = ...
     * const filter = new models.AdvancedFilter(...);
     * report.addFilter(filter, target);
     * ```
     */
    addFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void>;
    /**
     * Get filters that are applied to the report
     * An optional target may be passed to get filters applied to a specific page or visual
     *
     * ```javascript
     * // Get filters applied at report level
     * report.getFilters()
     *      .then(filters => {
     *          ...
     *      });
     *
     * // Get filters applied at page level
     * const pageTarget = {
     *   type: "page",
     *   name: "reportSection1"
     * };
     *
     * report.getFilters(pageTarget)
     *      .then(filters => {
     *          ...
     *      });
     * ```
     */
    getFilters(target?: models.IPageTarget | models.IVisualTarget): Promise<models.IFilter[]>;
    /**
     * Get report id from first available location: options, attribute, embed url.
     */
    getId(): string;
    /**
     * Get the list of pages within the report
     *
     * ```javascript
     * report.getPages()
     *  .then(pages => {
     *      ...
     *  });
     * ```
     */
    getPages(): Promise<models.IPage[]>;
    /**
     * Set the active page
     */
    setPage(pageName: string): Promise<void>;
    /**
     * Remove specific filter from report, page, or visual
     */
    removeFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void>;
    /**
     * Remove all filters across the report, pages, and visuals
     *
     * ```javascript
     * report.removeAllFilters();
     * ```
     */
    removeAllFilters(): Promise<void>;
    /**
     * Update existing filter applied to report, page, or visual.
     *
     * The existing filter will be replaced with the new filter.
     */
    updateFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void>;
    /**
     * Update settings of report (filter pane visibility, page navigation visibility)
     */
    updateSettings(settings: models.ISettings): Promise<void>;
    /**
     * Translate target into url
     * Target may be to the whole report, speific page, or specific visual
     */
    private getTargetUrl(target?);
}
