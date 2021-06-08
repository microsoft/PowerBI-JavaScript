// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilterTarget,
  RelativeTimeFilter,
  RelativeDateOperators,
  RelativeDateFilterTimeUnit
} from "powerbi-models";

import { IFilterBuilder } from './filterBuilder';

/**
 * Power BI Relative Time filter builder component
 *
 * @export
 * @class RelativeTimeFilterBuilder
 * @implements {IFilterBuilder}
 */
export class RelativeTimeFilterBuilder implements IFilterBuilder {
  private target: IFilterTarget;
  private operator: RelativeDateOperators;
  private timeUnitsCount: number;
  private timeUnitType: RelativeDateFilterTimeUnit;

  /**
   * Sets target property for Relative Time filter
   *
   * ```javascript
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().withTarget(tableName, columnName);
   * ```
   *
   * @param {string} table - Defines the table on which filter will be applied
   * @param {string} column - Defines the column on which filter will be applied
   * @returns {RelativeTimeFilterBuilder}
   */
  withTarget(table: string, column: string): RelativeTimeFilterBuilder {
    this.target = { table: table, column: column };
    return this;
  }

  /**
   * Sets target property for Relative Time filter with target object
   *
   * ```javascript
   * const target = {
   *  table: 'table1',
   *  column: 'column1'
   * };
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().withTargetObject(target);
   * ```
   *
   * @param {IFilterTarget} target - Defines the target property
   * @returns {RelativeTimeFilterBuilder}
   */
  withTargetObject(target: IFilterTarget): RelativeTimeFilterBuilder {
    this.target = target;
    return this;
  }

  /**
   * Sets inLast as operator for Relative Time filter
   *
   * ```javascript
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().inLast(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeTimeFilterBuilder}
   */
  inLast(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeTimeFilterBuilder {
    this.operator = RelativeDateOperators.InLast;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Sets inThis as operator for Relative Time filter
   *
   * ```javascript
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().inThis(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeTimeFilterBuilder}
   */
  inThis(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeTimeFilterBuilder {
    this.operator = RelativeDateOperators.InThis;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Sets inNext as operator for Relative Time filter
   *
   * ```javascript
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().orderBy(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeTimeFilterBuilder}
   */
  inNext(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeTimeFilterBuilder {
    this.operator = RelativeDateOperators.InNext;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Creates Relative Time filter
   *
   * ```javascript
   *
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().build();
   * ```
   *
   * @returns {RelativeTimeFilter}
   */
  build(): RelativeTimeFilter {
    const relativeTimeFilter = new RelativeTimeFilter(this.target, this.operator, this.timeUnitsCount, this.timeUnitType);
    return relativeTimeFilter;
  }
}
