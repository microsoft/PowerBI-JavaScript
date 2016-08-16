/*! powerbi-client v2.0.0-beta.12 | (c) 2016 Microsoft Corporation MIT */
import { IFilterable } from './ifilterable';
import { IReportNode } from './report';
import { Visual } from './visual';
import * as models from 'powerbi-models';
export interface IPageNode {
    report: IReportNode;
    name: string;
}
export declare class Page implements IPageNode, IFilterable {
    report: IReportNode;
    name: string;
    displayName: string;
    constructor(report: IReportNode, name: string, displayName?: string);
    /**
     * Gets all page level filters within report
     *
     * ```javascript
     * page.getFilters()
     *  .then(pages => { ... });
     * ```
     */
    getFilters(): Promise<models.IFilter[]>;
    /**
     * Gets all the visuals on the page.
     *
     * ```javascript
     * page.getVisuals()
     *   .then(visuals => { ... });
     * ```
     */
    getVisuals(): Promise<Visual[]>;
    /**
     * Remove all filters on this page within the report
     *
     * ```javascript
     * page.removeFilters();
     * ```
     */
    removeFilters(): Promise<void>;
    /**
     * Make the current page the active page of the report.
     *
     * ```javascripot
     * page.setActive();
     * ```
     */
    setActive(): Promise<void>;
    /**
     * Sets all filters on the current page.
     *
     * ```javascript
     * page.setFilters(filters);
     *   .catch(errors => { ... });
     * ```
     */
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
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
    visual(name: string): Visual;
}
