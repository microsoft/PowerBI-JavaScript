// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ITarget,
  TopNFilter,
  TopNFilterOperators
} from "powerbi-models";

import { FilterBuilder } from './filterBuilder';

/**
 * Power BI Top N filter builder component
 *
 * @export
 * @class TopNFilterBuilder
 * @extends {FilterBuilder}
 */
export class TopNFilterBuilder extends FilterBuilder {

  private itemCount: number;
  private operator: TopNFilterOperators;
  private orderByTargetValue: ITarget;

  /**
   * Sets Top as operator for Top N filter
   *
   * ```javascript
   *
   * const topNFilterBuilder = new TopNFilterBuilder().top(itemCount);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  top(itemCount: number): TopNFilterBuilder {
    this.operator = "Top";
    this.itemCount = itemCount;
    return this;
  }

  /**
   * Sets Bottom as operator for Top N filter
   *
   * ```javascript
   *
   * const topNFilterBuilder = new TopNFilterBuilder().bottom(itemCount);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  bottom(itemCount: number): TopNFilterBuilder {
    this.operator = "Bottom";
    this.itemCount = itemCount;
    return this;
  }

  /**
   * Sets order by for Top N filter
   *
   * ```javascript
   *
   * const topNFilterBuilder = new TopNFilterBuilder().orderByTarget(target);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  orderByTarget(target: ITarget): TopNFilterBuilder {
    this.orderByTargetValue = target;
    return this;
  }

  /**
   * Creates Top N filter
   *
   * ```javascript
   *
   * const topNFilterBuilder = new TopNFilterBuilder().build();
   * ```
   *
   * @returns {TopNFilter}
   */
  build(): TopNFilter {
    const topNFilter = new TopNFilter(this.target, this.operator, this.itemCount, this.orderByTargetValue);
    return topNFilter;
  }
}
