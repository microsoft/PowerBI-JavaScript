// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Filter, IFilterTarget } from "powerbi-models";

/**
 * Generic filter builder for BasicFilter, AdvancedFilter, RelativeDate, RelativeTime and TopN
 *
 * @interface IFilterBuilder
 */
export interface IFilterBuilder {
  withTargetObject(target: IFilterTarget): IFilterBuilder;
  build(): Filter;
}
