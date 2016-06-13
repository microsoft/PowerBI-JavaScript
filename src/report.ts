import { Embed, IEmbedOptions, ILoadMessage } from './embed';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as filters from 'powerbi-filters';

export interface IPageTarget {
    type: "page";
    name: string;
}

export interface IVisualTarget {
    type: "visual";
    id: string;
}

export interface IEvent<T> {
    data: T
}

export interface IEventHandler<T> {
    (event: IEvent<T>): any;
}

export interface ISettings {
    filterPaneEnabled?: boolean;
    pageNavigationEnabled?: boolean;
}

export interface IPage {
    name: string;
    displayName: string;
}

export class Report extends Embed {
    static allowedEvents = ["dataSelected", "filterAdded", "filterUpdated", "filterRemoved", "pageChanged", "error"];
    static type = "Report";
    
    /**
     * Add filter to report
     * An optional target may be passed to apply the filter to specific page or visual.
     * 
     * ```javascript
     * // Add filter to report
     * const filter = new filters.BasicFilter(...);
     * report.addFilter(filter);
     * 
     * // Add advanced filter to specific visual;
     * const target = ...
     * const filter = new filters.AdvancedFilter(...);
     * report.addFilter(filter, target);
     * ```
     */
    addFilter(filter: filters.IFilter, target?: IPageTarget | IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.hpm.post(`${targetUrl}/filters`, filter)
            .catch((response: hpm.IResponse) => {
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
    getFilters(target?: IPageTarget | IVisualTarget): Promise<filters.IFilter> {
        const targetUrl = this.getTargetUrl(target);
        return this.hpm.get(`${targetUrl}/filters`)
            .then((response: hpm.IResponse) => response.body,
                (response: hpm.IResponse) => {
                    throw response.body;
                });
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
    getPages(): Promise<IPage> {
        return this.hpm.get('/report/pages')
            .then((response: hpm.IResponse) => response.body,
                (response: hpm.IResponse) => {
                    throw response.body;
                });
    }

    getEmbedUrl(): string {
        let embedUrl = super.getEmbedUrl();
        
        // TODO: Need safe way to add url parameters.
        // We are assuming embedUrls use query parameters to supply id of visual
        // so must prefix with '&'.
        if(!this.options.filterPaneEnabled) {
            embedUrl += `&filterPaneEnabled=false`;
        }

        return embedUrl;
    }

    load(options: IEmbedOptions, requireId: boolean = false) {
        if(requireId && typeof options.id !== 'string') {
            throw new Error(`id must be specified when loading reports on existing elements.`);
        }
        
        const message: ILoadMessage = {
            id: options.id,
            accessToken: null
        };
        
        return super.load(options, requireId, message);
    }
    
    on<T>(eventName: string, handler: IEventHandler<T>): void {
        if(Report.allowedEvents.indexOf(eventName) === -1) {
            throw new Error(`eventName is must be one of ${Report.allowedEvents}. You passed: ${eventName}`);
        }
        
        this.router.post(`/report/events/${eventName}`, (res, req) => {
            handler(res.body);
        });
    } 

    /**
     * Set the active page
     */
    setActivePage(page: IPage): Promise<void> {
        return this.hpm.put('/report/pages/active', page)
            .catch((response: hpm.IResponse) => {
                throw response.body;
            });
    }

    /**
     * Remove specific filter from report, page, or visual
     */
    removeFilter(filter: filters.IFilter, target?: IPageTarget | IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.hpm.delete(`${targetUrl}/filters`, filter)
            .catch((response: hpm.IResponse) => {
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
    removeAllFilters(): Promise<void> {
        return this.hpm.delete('/report/filters')
            .catch((response: hpm.IResponse) => {
                throw response.body;
            });
    }
    
    /**
     * Update existing filter applied to report, page, or visual.
     * 
     * The existing filter will be replaced with the new filter.
     */
    updateFilter(filter: filters.IFilter, target?: IPageTarget | IVisualTarget): Promise<void> {
        const targetUrl = this.getTargetUrl(target);
        return this.hpm.put(`${targetUrl}/filters`, filter)
            .catch((response: hpm.IResponse) => {
                throw response.body;
            });
    }

    /**
     * Update settings of report (filter pane visibility, page navigation visibility)
     */
    updateSettings(settings: ISettings): Promise<void> {
        return this.hpm.patch('/report/settings', settings)
            .catch((response: hpm.IResponse) => {
                throw response.body;
            });
    }

    /**
     * Translate target into url
     * Target may be to the whole report, speific page, or specific visual
     */
    private getTargetUrl(target?: IPageTarget | IVisualTarget): string {
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
            targetUrl = `/report/pages/${(<IPageTarget>target).name}`;
        }
        else if(target.type === "visual") {
            targetUrl = `/report/visuals/${(<IVisualTarget>target).id}`;
        }
        else {
            throw new Error(`target.type must be either 'page' or 'visual'. You passed: ${target.type}`);
        }

        return targetUrl;
    }
}