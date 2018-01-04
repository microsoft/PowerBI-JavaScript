/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('schema', function () {
    it('ignores invalid keywords', function () {
        var schemas = [
            { type: '' },
            { type: 'invalid' },
            { type: null },
            { type: undefined },
            { type: {} },
            { type: [] },
            { type: ['invalid'] },
            { enum: null },
            { enum: 123 },
            { enum: {} },
            { enum: [] },
            { minimum: 'abc' },
            { exclusiveMinimum: 'abc' },
            { maximum: 'abc' },
            { exclusiveMaximum: 'abc' },
            { multipleOf: 'abc' },
            { minLength: 'abc' },
            { maxLength: 'abc' },
            { pattern: 123 },
            { minItems: 12.3 },
            { maxItems: 12.3 },
            { items: 'abc' },
            { maxProperties: 'abc' },
            { minProperties: 'abc' },
            { required: null },
            { properties: [] },
            { patternProperties: {} },
            { dependencies: [] },
            { allOf: {} },
            { anyOf: {} },
            { oneOf: {} },
            { not: [] },
            { properties: { foo: null } }
        ];

        schemas.forEach(function (schema) {
            assert(jsen(schema)());
        });

        assert(jsen({ format: 'custom' }, { formats: { custom: null } })());
        assert(jsen({ format: 'custom' }, { formats: { custom: {} } })());
    });

    it('ignores invalid schema on build', function () {
        var schema = { properties: { foo: [] } },
            validate = jsen(schema);

        assert.deepEqual(validate.build({}), {});
    });
});