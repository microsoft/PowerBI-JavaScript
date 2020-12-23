import * as models from 'powerbi-models';
import { IHttpPostMessageResponse } from 'http-post-message';

/**
 * Decorates embed components that support filters
 * Examples include reports and pages
 * 
 * @export
 * @interface IFilterable
 */
export interface IFilterable {
  /**
   * Gets the filters currently applied to the object.
   * 
   * @returns {(Promise<models.IFilter[]>)}
   */
  getFilters(): Promise<models.IFilter[]>;
  /**
   * Replaces all filters on the current object with the specified filter values.
   * 
   * @param {(models.IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>>;
  /**
   * Removes all filters from the current object.
   * 
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  removeFilters(): Promise<IHttpPostMessageResponse<void>>;
}