// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BasicFilterBuilder, AdvancedFilterBuilder, TopNFilterBuilder, RelativeDateFilterBuilder, RelativeTimeFilterBuilder } from '../src/FilterBuilders';
import * as models from 'powerbi-models';

describe('filter builders', function () {
  const target: models.IFilterTarget = {
    table: 'table1',
    column: 'column1'
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
    });
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
  });
});