// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  RelativeDateFilter,
  RelativeDateOperators,
  RelativeDateFilterTimeUnit
} from "powerbi-models";

import { FilterBuilder } from './filterBuilder';

/**
 * Power BI Relative Date filter builder component
 *
 * @export
 * @class RelativeDateFilterBuilder
 * @extends {FilterBuilder}
 */
export class RelativeDateFilterBuilder extends FilterBuilder {

  private operator: RelativeDateOperators;
  private timeUnitsCount: number;
  private timeUnitType: RelativeDateFilterTimeUnit;
  private isTodayIncluded = true;

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
   * const relativeDateFilterBuilder = new RelativeDateFilterBuilder().inNext(timeUnitsCount, timeUnitType);
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
