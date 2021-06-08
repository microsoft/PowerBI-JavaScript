// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Filter } from "powerbi-models";

/**
 * Generic filter builder for BasicFilter, AdvancedFilter, RelativeDate, RelativeTime and TopN
 *
 * @interface IFilterBuilder
 */
export interface IFilterBuilder {
  withTarget(table: string, column: string): IFilterBuilder;
  build(): Filter;
}
