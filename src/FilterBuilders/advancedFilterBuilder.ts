// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AdvancedFilter,
  AdvancedFilterLogicalOperators,
  IAdvancedFilterCondition,
  AdvancedFilterConditionOperators
} from "powerbi-models";

import { FilterBuilder } from './filterBuilder';

/**
 * Power BI Advanced filter builder component
 *
 * @export
 * @class AdvancedFilterBuilder
 * @extends {FilterBuilder}
 */
export class AdvancedFilterBuilder extends FilterBuilder {

  private logicalOperator: AdvancedFilterLogicalOperators;
  private conditions: IAdvancedFilterCondition[] = [];

  /**
   * Sets And as logical operator for Advanced filter
   *
   * ```javascript
   *
   * const advancedFilterBuilder = new AdvancedFilterBuilder().and();
   * ```
   *
   * @returns {AdvancedFilterBuilder}
   */
  and(): AdvancedFilterBuilder {
    this.logicalOperator = "And";
    return this;
  }

  /**
   * Sets Or as logical operator for Advanced filter
   *
   * ```javascript
   *
   * const advancedFilterBuilder = new AdvancedFilterBuilder().or();
   * ```
   *
   * @returns {AdvancedFilterBuilder}
   */
  or(): AdvancedFilterBuilder {
    this.logicalOperator = "Or";
    return this;
  }

  /**
   * Adds a condition in Advanced filter
   *
   * ```javascript
   *
   * // Add two conditions
   * const advancedFilterBuilder = new AdvancedFilterBuilder().addCondition("Contains", "Wash").addCondition("Contains", "Park");
   * ```
   *
   * @returns {AdvancedFilterBuilder}
   */
  addCondition(operator: AdvancedFilterConditionOperators, value?: (string | number | boolean | Date)): AdvancedFilterBuilder {
    const condition: IAdvancedFilterCondition = {
      operator: operator,
      value: value
    };
    this.conditions.push(condition);
    return this;
  }

  /**
   * Creates Advanced filter
   *
   * ```javascript
   *
   * const advancedFilterBuilder = new AdvancedFilterBuilder().build();
   * ```
   *
   * @returns {AdvancedFilter}
   */
  build(): AdvancedFilter {
    const advancedFilter = new AdvancedFilter(this.target, this.logicalOperator, this.conditions);
    return advancedFilter;
  }
}
