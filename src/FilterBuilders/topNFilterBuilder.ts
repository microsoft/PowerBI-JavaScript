// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilterTarget,
  ITarget,
  TopNFilter,
  TopNFilterOperators
} from "powerbi-models";

import { IFilterBuilder } from './filterBuilder';

/**
 * Power BI Top N filter builder component
 *
 * @export
 * @class TopNFilterBuilder
 * @implements {IFilterBuilder}
 */
export class TopNFilterBuilder implements IFilterBuilder {
  private target: IFilterTarget;
  private itemCount: number;
  private operator: TopNFilterOperators;
  private orderByTarget: ITarget;

  /**
   * Sets target property for Top N filter
   *
   * ```javascript
   *
   * const topNFilterBuilder = new TopNFilterBuilder().withTarget(tableName, columnName);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  withTarget(table: string, column: string): TopNFilterBuilder {
    this.target = { table: table, column: column };
    return this;
  }

  /**
   * Sets target property for Top N filter with target object
   *
   * ```javascript
   * const target = {
   *  table: 'table1',
   *  column: 'column1'
   * };
   *
   * const topNFilterBuilder = new TopNFilterBuilder().withTargetObject(target);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  withTargetObject(target: IFilterTarget): TopNFilterBuilder {
    this.target = target;
    return this;
  }

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
   * const topNFilterBuilder = new TopNFilterBuilder().orderBy(table, measure);
   * ```
   *
   * @returns {TopNFilterBuilder}
   */
  orderBy(table: string, measure: string): TopNFilterBuilder {
    this.orderByTarget = { table: table, measure: measure };
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
    const topNFilter = new TopNFilter(this.target, this.operator, this.itemCount, this.orderByTarget);
    return topNFilter;
  }
}
