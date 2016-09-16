/*! powerbi-client v2.0.0-beta.13 | (c) 2016 Microsoft Corporation MIT */
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
     * The parent Power BI page containing this visual
     *
     * @type {IPageNode}
     */
    page: IPageNode;
    constructor(page: IPageNode, name: string);
    /**
     * Gets all page level filters within report
     *
     * ```javascript
     * visual.getFilters()
     *  .then(pages => { ... });
     * ```
     *
     * @returns {(Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>)}
     */
    getFilters(): Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>;
    /**
     * Remove all filters on this page within the report
     *
     * ```javascript
     * visual.removeFilters();
     * ```
     *
     * @returns {Promise<void>}
     */
    removeFilters(): Promise<void>;
    /**
     * Set all filters at the visual level of the page
     *
     * ```javascript
     * visual.setFilters(filters)
     *  .catch(errors => { ... });
     * ```
     *
     * @param {((models.IBasicFilter | models.IAdvancedFilter)[])} filters
     * @returns {Promise<void>}
     */
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
}
