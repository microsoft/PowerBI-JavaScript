import * as models from 'powerbi-models';

export interface IFilterable {
    getFilters(): Promise<(models.IBasicFilter | models.IAdvancedFilter)[]>;
    setFilters(filters: (models.IBasicFilter | models.IAdvancedFilter)[]): Promise<void>;
    removeFilters(): Promise<void>;
}