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
   * @returns {Promise<models.IBaseFilter[]>}
   */
  getFilters(): Promise<models.IBaseFilter[]>;
  /**
   * Replaces all filters on the current object with the specified filter values
   * 
   * @param {models.IBaseFilter[]} filters
   * @returns {Promise<void>}
   */
  setFilters(filters: models.IBaseFilter[]): Promise<void>;
  /**
   * Removes all filters from the current object
   * 
   * @returns {Promise<void>}
   */
  removeFilters(): Promise<void>;
}