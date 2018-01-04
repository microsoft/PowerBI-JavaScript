/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('option: greedy', function () {
    it('validates as many keywords as possible', function () {
        var schema = {
                type: 'object',
                properties: {
                    test1: {
                        type: 'string'
                    },
                    test2: {
                        type: 'object',
                        properties: {
                            test21: {
                                type: 'number'
                            }
                        }
                    },
                    test3: {
                        type: 'number'
                    },
                    test4: { $ref: '#external'}
                },
                additionalProperties: false
            },
            options = {
                greedy: true,
                schemas: {
                    external: {
                        type: 'string'
                    }
                }
            },
            validate = jsen(schema, options),
            invalidTest = {
                test1: 1,
                test2: '2',
                test3: 'j',
                test4: 4
            },
            ret = validate(invalidTest);

        assert(!ret);    // false
        assert.deepEqual(validate.errors, [
            { path: 'test1', keyword: 'type' },
            { path: 'test2', keyword: 'type' },
            { path: 'test3', keyword: 'type' },
            { path: 'test4', keyword: 'type' }
        ]);

        delete options.greedy;

        validate = jsen(schema, options);

        ret = validate(invalidTest);

        assert(!ret);    // false
        assert.deepEqual(validate.errors, [{ path: 'test1', keyword: 'type' }]);
    });

    it('does not descend into invalid objects', function () {
        var schema = {
                type: 'object',
                properties: {
                    test1: { type: 'object' },
                    test2: {
                        required: ['foo']
                    },
                    test3: {
                        properties: {
                            foo: { type: 'string' }
                        }
                    },
                    test4: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['foo']
                        }
                    }
                }
            },
            options = { greedy: true },
            data = {
                test1: 123,
                test2: {},
                test3: 123,
                test4: [{}, { foo: 123 }, null]
            },
            validate = jsen(schema, options),
            ret = validate(data);

        assert(!ret);
        assert.deepEqual(validate.errors, [
            { path: 'test1', keyword: 'type' },
            { path: 'test2.foo', keyword: 'required' },
            { path: 'test4.0.foo', keyword: 'required' },
            { path: 'test4.2', keyword: 'type' }
        ]);
    });
});