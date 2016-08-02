/*! powerbi-client v2.0.0-beta.9 | (c) 2016 Microsoft Corporation MIT */
import * as models from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IPageNode } from './page';
export interface IVisualNode {
    name: string;
    page: IPageNode;
}
export declare class Visual implements IVisualNode, IFilterable {
    name: string;
    page: IPageNode;
    constructor(page: IPageNode, name: string);
    /**
     * Gets all page level filters within report
     *
     * ```javascript
     * visual.getFilters()
     *  .then(pages => { ... });
     * ```
     */
    getFilters(): Promise<models.IFilter[]>;
    /**
     * Remove all filters on this page within the report
     *
     * ```javascript
     * visual.removeFilters();
     * ```
     */
    removeFilters(): Promise<void>;
    /**
     * Set all filters at the visual level of the page
     *
     * ```javascript
     * visual.setFilters(filters)
     *  .catch(errors => { ... });
     * ```
     */
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
}
