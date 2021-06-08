// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilterTarget,
  RelativeDateFilter,
  RelativeDateOperators,
  RelativeDateFilterTimeUnit
} from "powerbi-models";

import { IFilterBuilder } from './filterBuilder';

/**
 * Power BI Relative Date filter builder component
 *
 * @export
 * @class RelativeDateFilterBuilder
 * @implements {IFilterBuilder}
 */
export class RelativeDateFilterBuilder implements IFilterBuilder {
  private target: IFilterTarget;
  private operator: RelativeDateOperators;
  private timeUnitsCount: number;
  private timeUnitType: RelativeDateFilterTimeUnit;
  private isTodayIncluded = true;

  /**
   * Sets target property for Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().withTarget(tableName, columnName);
   * ```
   *
   * @param {string} table - Defines the table on which filter will be applied
   * @param {string} column - Defines the column on which filter will be applied
   * @returns {RelativeDateFilterBuilder}
   */
  withTarget(table: string, column: string): RelativeDateFilterBuilder {
    this.target = { table: table, column: column };
    return this;
  }

  /**
   * Sets target property for Relative Date filter with target object
   *
   * ```javascript
   * const target = {
   *  table: 'table1',
   *  column: 'column1'
   * };
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().withTargetObject(target);
   * ```
   *
   * @param {IFilterTarget} target - Defines the target property
   * @returns {RelativeDateFilterBuilder}
   */
  withTargetObject(target: IFilterTarget): RelativeDateFilterBuilder {
    this.target = target;
    return this;
  }

  /**
   * Sets inLast as operator for Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().inLast(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeDateFilterBuilder}
   */
  inLast(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeDateFilterBuilder {
    this.operator = RelativeDateOperators.InLast;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Sets inThis as operator for Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().inThis(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeDateFilterBuilder}
   */
  inThis(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeDateFilterBuilder {
    this.operator = RelativeDateOperators.InThis;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Sets inNext as operator for Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().orderBy(timeUnitsCount, timeUnitType);
   * ```
   *
   * @param {number} timeUnitsCount - The amount of time units
   * @param {RelativeDateFilterTimeUnit} timeUnitType - Defines the unit of time the filter is using
   * @returns {RelativeDateFilterBuilder}
   */
  inNext(timeUnitsCount: number, timeUnitType: RelativeDateFilterTimeUnit): RelativeDateFilterBuilder {
    this.operator = RelativeDateOperators.InNext;
    this.timeUnitsCount = timeUnitsCount;
    this.timeUnitType = timeUnitType;
    return this;
  }

  /**
   * Sets includeToday for Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().includeToday(includeToday);
   * ```
   *
   * @param {boolean} includeToday - Denotes if today is included or not
   * @returns {RelativeDateFilterBuilder}
   */
  includeToday(includeToday: boolean): RelativeDateFilterBuilder {
    this.isTodayIncluded = includeToday;
    return this;
  }

  /**
   * Creates Relative Date filter
   *
   * ```javascript
   *
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().build();
   * ```
   *
   * @returns {RelativeDateFilter}
   */
  build(): RelativeDateFilter {
    const relativeDateFilter = new RelativeDateFilter(this.target, this.operator, this.timeUnitsCount, this.timeUnitType, this.isTodayIncluded);
    return relativeDateFilter;
  }
}
