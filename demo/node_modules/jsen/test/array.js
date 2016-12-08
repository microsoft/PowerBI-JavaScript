/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: array', function () {
    it('required', function () {
        var schema = { type: 'array' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));

        assert(validate([]));
    });

    it('nullable', function () {
        var schema = { type: ['array', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(null));
        assert(validate([]));
    });

    it('type', function () {
        var schema = { type: 'array' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate(false));
        assert(!validate({}));
        assert(!validate(Math.PI));

        assert(validate([]));
    });

    it('minItems', function () {
        var schema = { type: 'array', minItems: 3 },
            validate = jsen(schema);

        assert(!validate([]));
        assert(!validate([1, 2]));

        assert(validate([1, 2, 3]));
        assert(validate([1, 2, 3, 4]));
    });

    it('maxItems', function () {
        var schema = { type: 'array', maxItems: 3 },
            validate = jsen(schema);

        assert(!validate([1, 2, 3, 4]));

        assert(validate([]));
        assert(validate([1, 2, 3]));
    });

    it('items: object', function () {
        var schema = { type: 'array', items: { type: 'string' } },
            validate = jsen(schema);

        assert(!validate(null));
        assert(!validate([1]));
        assert(!validate(['a', false, 'b']));
        assert(!validate(['a', 'b', 1]));

        assert(validate([]));
        assert(validate(['a']));
        assert(validate(['a', 'b', 'c']));

        schema = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    strProp: { type: 'string' },
                    boolProp: { type: 'boolean' }
                },
                required: ['strProp']
            }
        };

        validate = jsen(schema);

        assert(!validate([123]));
        assert(!validate([{}]));
        assert(!validate([{
            strProp: 'value',
            boolProp: 123
        }]));

        assert(validate([{
            strProp: 'value',
            boolProp: false
        }]));
    });

    it('items: array', function () {
        var schema = {
                type: 'array',
                items: [
                    { type: 'string' },
                    { type: 'number' }
                ]
            },
            validate = jsen(schema);

        assert(!validate([1]));
        assert(!validate([1, 'a']));

        assert(validate([]));
        assert(validate(['a']));
        assert(validate(['a', 1]));
        assert(validate(['a', 1, null, 'b', 2]));
    });

    it('additionalItems: boolean', function () {
        var schema = { type: 'array', additionalItems: false },
            validate = jsen(schema);

        assert(validate([]));
        assert(validate([1]));
        assert(validate([1, 'a', true]));

        schema.items = { type: 'number' };
        validate = jsen(schema);

        assert(!validate(['a']));

        assert(validate([]));
        assert(validate([1]));
        assert(validate([1, 2, 3]));

        schema.items = [
            { type: 'string' },
            { type: 'number' }
        ];
        validate = jsen(schema);

        assert(!validate(['a', 1, 2]));

        assert(validate([]));
        assert(validate(['a']));
        assert(validate(['a', 1]));
    });

    it('additionalItems: object', function () {
        // when `items` is an object schema, `additionalItems`
        // is ignored and must not validate against
        var schema = {
                type: 'array',
                items: {
                    type: 'string'
                },
                additionalItems: {
                    type: 'number'
                }
            },
            validate = jsen(schema);

        assert(!validate(['abc', 'def', 123]));

        // same as above description - only strings are valid
        assert(validate(['abc', 'def']));

        // when `items` is an array, any other positional
        // data item must validate against `additionalItems`
        schema.items = [
            { type: 'string' },
            { type: 'boolean' }
        ];
        validate = jsen(schema);

        assert(!validate(['abc', false, 'def']));

        assert(validate(['abc', false]));
        assert(validate(['abc', false, 123]));
        assert(validate(['abc', false, 123, Math.PI]));

        // when `additionalItems` is an empty object, anything is valid
        schema.additionalItems = {};
        validate = jsen(schema);

        assert(validate(['abc', false, 'def', 123, {}, null]));
    });

    it('uniqueItems', function () {
        var schema = {
                type: 'array',
                items: { type: 'number' },
                uniqueItems: false
            },
            validate = jsen(schema);

        assert(validate([1, 2, 1]));

        schema.uniqueItems = true;
        validate = jsen(schema);

        assert(!validate([1, 2, 1]));

        assert(validate([1, 2, 3]));
    });
});