/*! powerbi-client v2.1.0 | (c) 2016 Microsoft Corporation MIT */
import * as models from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IPageNode } from './page';
/**
 * A Visual node within a report hierarchy
 *
 * @export
 * @interface IVisualNode
 */
export interface IVisualNode {
    name: string;
    page: IPageNode;
}
/**
 * A Power BI visual within a page
 *
 * @export
 * @class Visual
 * @implements {IVisualNode}
 * @implements {IFilterable}
 */
export declare class Visual implements IVisualNode, IFilterable {
    /**
     * The visual name
     *
     * @type {string}
     */
    name: string;
    /**
     * The parent Power BI page that contains this visual
     *
     * @type {IPageNode}
     */
    page: IPageNode;
    constructor(page: IPageNode, name: string);
    /**
     * Gets all page level filters within a report.
     *
     * ```javascript
     * visual.getFilters()
     *  .then(pages => { ... });
     * ```
     *
     * @returns {(Promise<models.IFilter[]>)}
     */
    getFilters(): Promise<models.IFilter[]>;
    /**
     * Removes all filters on this page of the report.
     *
     * ```javascript
     * visual.removeFilters();
     * ```
     *
     * @returns {Promise<void>}
     */
    removeFilters(): Promise<void>;
    /**
     * Sets all filters at the visual level of the page.
     *
     * ```javascript
     * visual.setFilters(filters)
     *  .catch(errors => { ... });
     * ```
     *
     * @param {(models.IFilter[])} filters
     * @returns {Promise<void>}
     */
    setFilters(filters: models.IFilter[]): Promise<void>;
}
