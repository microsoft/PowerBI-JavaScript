import { IFilterable } from './ifilterable';
import { IReport } from './report';
import { Visual } from './visual';
import * as models from 'powerbi-models';

export interface IPage {
    report: IReport;
    name: string;
    displayName: string;
    setActive(): void;
}

export class Page implements IPage, IFilterable {
    report: IReport;
    name: string;
    // This can be undefined in cases where page is created manually
    displayName: string;

    constructor(report: IReport, name: string, displayName?: string) {
        this.report = report;
        this.name = name;
        this.displayName = displayName;
    }

    /**
     * Gets all page level filters within report
     * 
     * ```javascript
     * page.getFilters()
     *  .then(pages => { ... });
     * ```
     */
    getFilters() {
        return this.report.service.hpm.get<models.IFilter[]>(`/report/pages/${this.name}/filters`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
            .then(response => response.body,
            response => {
                throw response.body;
            });
    }

    /**
     * Gets all the visuals on the page.
     * 
     * ```javascript
     * page.getVisuals()
     *   .then(visuals => { ... });
     * ```
     */
    getVisuals(): Promise<Visual[]> {
        return this.report.service.hpm.get<models.IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
            .then(response => {
                return response.body
                    .map(visual => {
                        return new Visual(this, visual.name);
                    });
            }, response => {
                throw response.body;
            });
    }

    /**
     * Remove all filters on this page within the report
     * 
     * ```javascript
     * page.removeFilters();
     * ```
     */
    removeFilters() {
        return this.setFilters([]);
    }

    /**
     * Make the current page the active page of the report.
     * 
     * ```javascripot
     * page.setActive();
     * ```
     */
    setActive() {
        const page: models.IPage = {
            name: this.name,
            displayName: null
        };

        return this.report.service.hpm.put<models.IError[]>('/report/pages/active', page, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Sets all filters on the current page.
     * 
     * ```javascript
     * page.setFilters(filters);
     *   .catch(errors => { ... });
     * ```
     */
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]) {
        return this.report.service.hpm.put<models.IError[]>(`/report/pages/${this.name}/filters`, filters, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
            .catch(response => {
                throw response.body;
            });
    }

    /**
     * Creates new Visual object given a name of the visual.
     * 
     * Normally you would get Visual objects by calling `page.getVisuals()` but in the case
     * that the visual name is known and you want to perform an action on a visaul such as setting a filters
     * without having to retrieve it first you can create it directly.
     * 
     * Note: Since you are creating the visual manually there is no guarantee that the visual actually exists in the report and the subsequence requests could fail.
     * 
     * ```javascript
     * const visual = report.page('ReportSection1').visual('BarChart1');
     * visual.setFilters(filters);
     * ```
     */
    visual(name: string): Visual {
        return new Visual(this, name);
    }
}