// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BasicFilterBuilder, AdvancedFilterBuilder, TopNFilterBuilder, RelativeDateFilterBuilder, RelativeTimeFilterBuilder } from '../src/FilterBuilders';
import * as models from 'powerbi-models';

describe('filter builders', function () {
  const target: models.IFilterTarget = {
    table: 'table1',
    column: 'column1'
  };
  const measureTarget: models.IMeasureTarget = {
    table: 'table',
    measure: 'measure'
  };
  const columnTarget: models.IColumnTarget = {
    table: 'table',
    column: 'column'
  };
  const hierarchyLevelTarget: models.IHierarchyLevelTarget = {
    table: 'table',
    hierarchy: 'hierarchy',
    hierarchyLevel: 'hierarchy level name',
  };
  const columnAggregationTarget: models.IColumnAggrTarget = {
    table: 'table',
    column: 'column',
    aggregationFunction: 'Avg'
  };
  const hierarchyLevelAggregationTarget: models.IHierarchyLevelAggrTarget = {
    table: 'table',
    hierarchy: 'hierarchy',
    hierarchyLevel: 'hierarchy level name',
    aggregationFunction: 'Avg'
  };

  describe('Basic filter builder', function () {
    it('validates Basic filter with target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(target, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withTargetObject(target)
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });

    it('validates Basic filter with column target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(columnTarget, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withColumnTarget('table', 'column')
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });

    it('validates Basic filter with measure target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(measureTarget, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withMeasureTarget('table', 'measure')
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });

    it('validates Basic filter with hierarchy level target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(hierarchyLevelTarget, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withHierarchyLevelTarget('table', 'hierarchy', 'hierarchy level name')
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });

    it('validates Basic filter with column aggregation target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(columnAggregationTarget, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withColumnAggregation('table', 'column', 'Avg')
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });

    it('validates Basic filter with hierarchy level aggregation target object', function () {
      // Arrange
      const values = [1, 2, 3];
      const operator: models.BasicFilterOperators = 'In';
      const basicFilter: models.BasicFilter = new models.BasicFilter(hierarchyLevelAggregationTarget, operator, values);
      basicFilter.requireSingleSelection = false;

      // Act
      const basicFilterWithBuilder: models.BasicFilter = new BasicFilterBuilder()
        .withHierarchyLevelAggregationTarget('table', 'hierarchy', 'hierarchy level name', 'Avg')
        .in(values)
        .build();

      // Assert
      expect(basicFilterWithBuilder).toBeDefined();
      expect(basicFilterWithBuilder).toEqual(basicFilter);
    });
  });

  describe('Advanced filter builder', function () {
    it('validates Advanced filter with target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(target, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withTargetObject(target)
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });

    it('validates Advanced filter with column target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(columnTarget, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withColumnTarget('table', 'column')
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });

    it('validates Advanced filter with measure target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(measureTarget, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withMeasureTarget('table', 'measure')
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });

    it('validates Advanced filter with hierarchy level target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(hierarchyLevelTarget, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withHierarchyLevelTarget('table', 'hierarchy', 'hierarchy level name')
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });

    it('validates Advanced filter with column aggregation target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(columnAggregationTarget, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withColumnAggregation('table', 'column', 'Avg')
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });

    it('validates Advanced filter with hierarchy level aggregation target object', function () {
      // Arrange
      const logicalOperator: models.AdvancedFilterLogicalOperators = 'And';
      const conditions: models.IAdvancedFilterCondition[] = [
        {
          operator: 'Contains',
          value: 'value1'
        },
        {
          operator: 'Contains',
          value: 'value2'
        }
      ];
      const advancedFilter: models.AdvancedFilter = new models.AdvancedFilter(hierarchyLevelAggregationTarget, logicalOperator, conditions);

      // Act
      const advancedFilterWithBuilder: models.AdvancedFilter = new AdvancedFilterBuilder()
        .withHierarchyLevelAggregationTarget('table', 'hierarchy', 'hierarchy level name', 'Avg')
        .addCondition(conditions[0].operator, conditions[0].value)
        .and()
        .addCondition(conditions[1].operator, conditions[1].value)
        .build();

      // Assert
      expect(advancedFilterWithBuilder).toBeDefined();
      expect(advancedFilterWithBuilder).toEqual(advancedFilter);
    });
  });

  describe('TopN filter builder', function () {
    const orderByTarget: models.ITarget = {
      table: 'table1',
      measure: 'measure1'
    };

    it('validates TopN filter with target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(target, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withTargetObject(target)
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });

    it('validates TopN filter with column target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(columnTarget, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withColumnTarget('table', 'column')
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });

    it('validates TopN filter with measure target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(measureTarget, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withMeasureTarget('table', 'measure')
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });

    it('validates TopN filter with hierarchy level target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(hierarchyLevelTarget, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withHierarchyLevelTarget('table', 'hierarchy', 'hierarchy level name')
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });

    it('validates TopN filter with column aggregation target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(columnAggregationTarget, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withColumnAggregation('table', 'column', 'Avg')
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });

    it('validates TopN filter with hierarchy level aggregation target object', function () {
      // Arrange
      const operator: models.TopNFilterOperators = 'Top';
      const itemCount = 10;
      const topNFilter: models.TopNFilter = new models.TopNFilter(hierarchyLevelAggregationTarget, operator, itemCount, orderByTarget);

      // Act
      const topNFilterWithBuilder: models.TopNFilter = new TopNFilterBuilder()
        .withHierarchyLevelAggregationTarget('table', 'hierarchy', 'hierarchy level name', 'Avg')
        .top(itemCount)
        .orderByTarget({ table: orderByTarget.table, measure: orderByTarget.measure })
        .build();

      // Assert
      expect(topNFilterWithBuilder).toBeDefined();
      expect(topNFilterWithBuilder).toEqual(topNFilter);
    });
  });

  describe("Realtive date filter builder", function () {

    it('validates relative date with target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(target, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withTargetObject(target)
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });

    it('validates relative date with column target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(columnTarget, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withColumnTarget('table', 'column')
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });

    it('validates relative date with measure target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(measureTarget, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withMeasureTarget('table', 'measure')
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });

    it('validates relative date with hierarchy level target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(hierarchyLevelTarget, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withHierarchyLevelTarget('table', 'hierarchy', 'hierarchy level name')
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });

    it('validates relative date with column aggregation target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(columnAggregationTarget, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withColumnAggregation('table', 'column', 'Avg')
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });

    it('validates relative date with hierarchy level aggregation target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Days;
      const includeToday = true;
      const relativeDateFilter: models.RelativeDateFilter = new models.RelativeDateFilter(hierarchyLevelAggregationTarget, operator, timeUnitsCount, timeUnitType, includeToday);

      // Act
      const relativeDateFilterWithBuilder: models.RelativeDateFilter = new RelativeDateFilterBuilder()
        .withHierarchyLevelAggregationTarget('table', 'hierarchy', 'hierarchy level name', 'Avg')
        .inLast(timeUnitsCount, timeUnitType)
        .includeToday(true)
        .build();

      // Assert
      expect(relativeDateFilterWithBuilder).toBeDefined();
      expect(relativeDateFilterWithBuilder).toEqual(relativeDateFilter);
    });
  });

  describe("Realtive time filter builder", function () {

    it('validates time with target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(target, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withTargetObject(target)
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });

    it('validates time with column target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(columnTarget, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withColumnTarget('table', 'column')
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });

    it('validates time with measure target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(measureTarget, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withMeasureTarget('table', 'measure')
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });

    it('validates time with hierarchy level target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(hierarchyLevelTarget, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withHierarchyLevelTarget('table', 'hierarchy', 'hierarchy level name')
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });

    it('validates time with column aggregation target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(columnAggregationTarget, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withColumnAggregation('table', 'column', 'Avg')
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });

    it('validates time with hierarchy level aggregation target object', function () {
      // Arrange
      const operator: models.RelativeDateOperators = models.RelativeDateOperators.InLast;
      const timeUnitsCount = 10;
      const timeUnitType = models.RelativeDateFilterTimeUnit.Hours;
      const relativeTimeFilter: models.RelativeTimeFilter = new models.RelativeTimeFilter(hierarchyLevelAggregationTarget, operator, timeUnitsCount, timeUnitType);

      // Act
      const relativeTimeFilterWithBuilder: models.RelativeTimeFilter = new RelativeTimeFilterBuilder()
        .withHierarchyLevelAggregationTarget('table', 'hierarchy', 'hierarchy level name', 'Avg')
        .inLast(timeUnitsCount, timeUnitType)
        .build();

      // Assert
      expect(relativeTimeFilterWithBuilder).toBeDefined();
      expect(relativeTimeFilterWithBuilder).toEqual(relativeTimeFilter);
    });
  });
});
