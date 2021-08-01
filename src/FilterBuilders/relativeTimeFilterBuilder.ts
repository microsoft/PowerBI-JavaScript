// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  RelativeTimeFilter,
  RelativeDateOperators,
  RelativeDateFilterTimeUnit
} from "powerbi-models";

import { FilterBuilder } from './filterBuilder';

/**
 * Power BI Relative Time filter builder component
 *
 * @export
 * @class RelativeTimeFilterBuilder
 * @extends {FilterBuilder}
 */
export class RelativeTimeFilterBuilder extends FilterBuilder {

  private operator: RelativeDateOperators;
  private timeUnitsCount: number;
  private timeUnitType: RelativeDateFilterTimeUnit;

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
   * const relativeTimeFilterBuilder = new RelativeTimeFilterBuilder().inNext(timeUnitsCount, timeUnitType);
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
