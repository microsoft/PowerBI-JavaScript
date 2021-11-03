// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilterTarget } from "powerbi-models";

/**
 * Generic filter builder for BasicFilter, AdvancedFilter, RelativeDate, RelativeTime and TopN
 *
 * @class
 */
export class FilterBuilder {

  public target: IFilterTarget;

  /**
   * Sets target property for filter with target object
   *
   * ```javascript
   * const target = {
   *  table: 'table1',
   *  column: 'column1'
   * };
   *
   * const filterBuilder = new FilterBuilder().withTargetObject(target);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withTargetObject(target: IFilterTarget): this {
    this.target = target;
    return this;
  }

  /**
   * Sets target property for filter with column target object
   *
   * ```
   * const filterBuilder = new FilterBuilder().withColumnTarget(tableName, columnName);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withColumnTarget(tableName: string, columnName: string): this {
    this.target = { table: tableName, column: columnName };
    return this;
  }

  /**
   * Sets target property for filter with measure target object
   *
   * ```
   * const filterBuilder = new FilterBuilder().withMeasureTarget(tableName, measure);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withMeasureTarget(tableName: string, measure: string): this {
    this.target = { table: tableName, measure: measure };
    return this;
  }

  /**
   * Sets target property for filter with hierarchy level target object
   *
   * ```
   * const filterBuilder = new FilterBuilder().withHierarchyLevelTarget(tableName, hierarchy, hierarchyLevel);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withHierarchyLevelTarget(tableName: string, hierarchy: string, hierarchyLevel: string): this {
    this.target = { table: tableName, hierarchy: hierarchy, hierarchyLevel: hierarchyLevel };
    return this;
  }

  /**
   * Sets target property for filter with column aggregation target object
   *
   * ```
   * const filterBuilder = new FilterBuilder().withColumnAggregation(tableName, columnName, aggregationFunction);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withColumnAggregation(tableName: string, columnName: string, aggregationFunction: string): this {
    this.target = { table: tableName, column: columnName, aggregationFunction: aggregationFunction };
    return this;
  }

  /**
   * Sets target property for filter with hierarchy level aggregation target object
   *
   * ```
   * const filterBuilder = new FilterBuilder().withHierarchyLevelAggregationTarget(tableName, hierarchy, hierarchyLevel, aggregationFunction);
   * ```
   *
   * @returns {FilterBuilder}
   */
  withHierarchyLevelAggregationTarget(tableName: string, hierarchy: string, hierarchyLevel: string, aggregationFunction: string): this {
    this.target = { table: tableName, hierarchy: hierarchy, hierarchyLevel: hierarchyLevel, aggregationFunction: aggregationFunction };
    return this;
  }
}
