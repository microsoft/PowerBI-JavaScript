import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as utils from './util';

export class Report extends embed.Embed {
    static allowedEvents = ["dataSelected", "filterAdded", "filterUpdated", "filterRemoved", "pageChanged", "error"];
    static reportIdAttribute = 'powerbi-report-id';
    static filterPaneEnabledAttribute = 'powerbi-settings-filter-pane-enabled';
    static navContentPaneEnabledAttribute = 'powerbi-settings-nav-content-pane-enabled';
    static typeAttribute = 'powerbi-type';
    static type = "Report";

    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration) {
        const filterPaneEnabled = (config.settings && config.settings.filterPaneEnabled) || !(element.getAttribute(Report.filterPaneEnabledAttribute) === "false");
        const navContentPaneEnabled = (config.settings && config.settings.navContentPaneEnabled) || !(element.getAttribute(Report.navContentPaneEnabledAttribute) === "false");
        const settings = utils.assign({
            filterPaneEnabled,
            navContentPaneEnabled
        }, config.settings);
        const configCopy = utils.assign({ settings }, config);

        super(service, element, configCopy);
        Array.prototype.push.apply(this.allowedEvents, Report.allowedEvents);
    }

    /**
     * This adds backwards compatibility for older config which used the reportId query param to specify report id.
     * E.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1
     * 
     * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
     */
    static findIdFromEmbedUrl(url: string): string {
        const reportIdRegEx = /reportId="?([^&]+)"?/
        const reportIdMatch = url.match(reportIdRegEx);
        
        let reportId;
        if(reportIdMatch) {
            reportId = reportIdMatch[1];
        }

        return reportId;
    }

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
    addFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.service.hpm.post<void>(`${targetUrl}/filters`, filter, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Get filters that are applied to the report
     * An optional target may be passed to get filters applied to a specific page or visual
     * 
     * ```javascript
     * // Get filters applied at report level
     * report.getFilters()
     *   .then(filters => {
     *     ...
     *   });
     * 
     * // Get filters applied at page level
     * const pageTarget = {
     *   name: "reportSection1"
     * };
     * 
     * report.getFilters(pageTarget)
     *   .then(filters => {
     *       ...
     *   });
     * ```
     */
    getFilters(target?: models.IPageTarget | models.IVisualTarget): Promise<models.IFilter[]> {
        const targetUrl = this.getTargetUrl(target);
        return this.service.hpm.get<models.IFilter[]>(`${targetUrl}/filters`, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .then(response => response.body,
                response => {
                    throw response.body;
                });
    }

    /**
     * Get report id from first available location: options, attribute, embed url.
     */
    getId(): string {
        const reportId = this.config.id || this.element.getAttribute(Report.reportIdAttribute) || Report.findIdFromEmbedUrl(this.config.embedUrl);

        if (typeof reportId !== 'string' || reportId.length === 0) {
            throw new Error(`Report id is required, but it was not found. You must provide an id either as part of embed configuration or as attribute '${Report.reportIdAttribute}'.`);
        }

        return reportId;
    }

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
    getPages(): Promise<models.IPage[]> {
        return this.service.hpm.get<models.IPage[]>('/report/pages', { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .then(response => response.body,
                response => {
                    throw response.body;
                });
    }
    
    /**
     * Set the active page
     * 
     * ```javascript
     * report.setPage("page2")
     *  .catch(error => { ... });
     * ```
     */
    setPage(pageName: string): Promise<void> {
        const page: models.IPage = {
            name: pageName,
            displayName: null
        };

        return this.service.hpm.put<models.IError[]>('/report/pages/active', page, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Remove specific filter from report, page, or visual
     * 
     * ```javascript
     * const filter = new models.ValueFilter(...);
     * 
     * report.removeFilter(filter)
     *  .catch(error => { ... });
     * ```
     */
    removeFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.service.hpm.delete<models.IError[]>(`${targetUrl}/filters`, filter, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Remove all filters across the report, pages, and visuals
     * 
     * ```javascript
     * report.removeAllFilters();
     * ```
     */
    removeAllFilters(target?: models.IPageTarget | models.IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.service.hpm.delete<models.IError[]>(`${targetUrl}/allfilters`, null, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }
    
    /**
     * Update existing filter applied to report, page, or visual.
     * 
     * The existing filter will be replaced with the new filter.
     * 
     * ```javascript
     * const filter = new models.ValueFilter(...);
     * const target = {
     *   type: "page",
     *   name: "ReportSection2"
     * };
     * 
     * report.updateFilter(filter, target)
     *  .catch(errors => { ... });
     */
    updateFilter(filter: models.IFilter, target?: models.IPageTarget | models.IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.service.hpm.put<models.IError[]>(`${targetUrl}/filters`, filter, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Update settings of report (filter pane visibility, page navigation visibility)
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
     */
    updateSettings(settings: models.ISettings): Promise<void> {
        return this.service.hpm.patch<models.IError[]>('/report/settings', settings, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Translate target into url
     * Target may be to the whole report, speific page, or specific visual
     */
    private getTargetUrl(target?: models.IPageTarget | models.IVisualTarget): string {
        let targetUrl;

        /**
         * TODO: I mentioned this issue in the protocol test, but we're tranlating targets from objects
         * into parts of the url, and then back to objects. It is a trade off between complixity in this code vs semantic URIs
         * 
         * We could come up with a different idea which passed the target as part of the body
         */
        if(!target) {
            targetUrl = '/report';
        }
        else if(target.type === "page") {
            targetUrl = `/report/pages/${(<models.IPageTarget>target).name}`;
        }
        else if(target.type === "visual") {
            targetUrl = `/report/visuals/${(<models.IVisualTarget>target).id}`;
        }
        else {
            throw new Error(`target.type must be either 'page' or 'visual'. You passed: ${target.type}`);
        }

        return targetUrl;
    }
}