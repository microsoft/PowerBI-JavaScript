// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicFilter,
  BasicFilterOperators
} from "powerbi-models";

import { FilterBuilder } from './filterBuilder';

/**
 * Power BI Basic filter builder component
 *
 * @export
 * @class BasicFilterBuilder
 * @extends {FilterBuilder}
 */
export class BasicFilterBuilder extends FilterBuilder {

  private values: Array<(string | number | boolean)>;
  private operator: BasicFilterOperators;
  private isRequireSingleSelection = false;

  /**
   * Sets In as operator for Basic filter
   *
   * ```javascript
   *
   * const basicFilterBuilder = new BasicFilterBuilder().in([values]);
   * ```
   *
   * @returns {BasicFilterBuilder}
   */
  in(values: Array<(string | number | boolean)>): BasicFilterBuilder {
    this.operator = "In";
    this.values = values;
    return this;
  }

  /**
   * Sets NotIn as operator for Basic filter
   *
   * ```javascript
   *
   * const basicFilterBuilder = new BasicFilterBuilder().notIn([values]);
   * ```
   *
   * @returns {BasicFilterBuilder}
   */
  notIn(values: Array<(string | number | boolean)>): BasicFilterBuilder {
    this.operator = "NotIn";
    this.values = values;
    return this;
  }

  /**
   * Sets All as operator for Basic filter
   *
   * ```javascript
   *
   * const basicFilterBuilder = new BasicFilterBuilder().all();
   * ```
   *
   * @returns {BasicFilterBuilder}
   */
  all(): BasicFilterBuilder {
    this.operator = "All";
    this.values = [];
    return this;
  }

  /**
   * Sets required single selection property for Basic filter
   *
   * ```javascript
   *
   * const basicFilterBuilder = new BasicFilterBuilder().requireSingleSelection(isRequireSingleSelection);
   * ```
   *
   * @returns {BasicFilterBuilder}
   */
  requireSingleSelection(isRequireSingleSelection = false): BasicFilterBuilder {
    this.isRequireSingleSelection = isRequireSingleSelection;
    return this;
  }

  /**
   * Creates Basic filter
   *
   * ```javascript
   *
   * const basicFilterBuilder = new BasicFilterBuilder().build();
   * ```
   *
   * @returns {BasicFilter}
   */
  build(): BasicFilter {
    const basicFilter = new BasicFilter(this.target, this.operator, this.values);
    basicFilter.requireSingleSelection = this.isRequireSingleSelection;
    return basicFilter;
  }
}
