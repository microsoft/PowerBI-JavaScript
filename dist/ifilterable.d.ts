/*! powerbi-client v2.0.0-beta.10 | (c) 2016 Microsoft Corporation MIT */
import * as models from 'powerbi-models';
export interface IFilterable {
    getFilters(): Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>;
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
    removeFilters(): Promise<void>;
}
