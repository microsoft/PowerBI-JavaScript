/*! powerbi-client v2.0.0-beta.13 | (c) 2016 Microsoft Corporation MIT */
import * as models from 'powerbi-models';
/**
 * Decorates embed components that support filters
 * Examples include reports, pages and visuals
 *
 * @export
 * @interface IFilterable
 */
export interface IFilterable {
    /**
     * Gets the filters currently applied to the object
     *
     * @returns {(Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>)}
     */
    getFilters(): Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>;
    /**
     * Replaces all filters on the current object with the specified filter values
     *
     * @param {((models.IBasicFilter | models.IAdvancedFilter)[])} filters
     * @returns {Promise<void>}
     */
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
    /**
     * Removes all filters from the current object
     *
     * @returns {Promise<void>}
     */
    removeFilters(): Promise<void>;
}
