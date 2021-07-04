// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FiltersOperations, IFilter } from 'powerbi-models';
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
   * @returns {(Promise<IFilter[]>)}
   */
  getFilters(): Promise<IFilter[]>;
  /**
   * Update the filters for the current instance according to the operation: Add, replace all, replace by target or remove.
   *
   * @param {(FiltersOperations)} operation
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  updateFilters(operation: FiltersOperations, filters?: IFilter[]): Promise<IHttpPostMessageResponse<void>>;
  /**
   * Removes all filters from the current object.
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  removeFilters(): Promise<IHttpPostMessageResponse<void>>;
  /**
   * Replaces all filters on the current object with the specified filter values.
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  setFilters(filters: IFilter[]): Promise<IHttpPostMessageResponse<void>>;
}
