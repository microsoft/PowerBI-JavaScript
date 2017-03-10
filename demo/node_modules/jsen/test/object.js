/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: object', function () {
    it('required', function () {
        var schema = { type: 'object' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));

        assert(validate({}));
    });

    it('nullable', function () {
        var schema = { type: ['object', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(null));
        assert(validate({}));
    });

    it('type', function () {
        var schema = { type: 'object' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate(false));
        assert(!validate([]));
        assert(!validate(Math.PI));

        assert(validate({}));
        assert(jsen({ type: 'object', properties: {} }, {}));
    });

    it('maxProperties', function () {
        var schema = { type: 'object', maxProperties: 3 },
            validate = jsen(schema);

        assert(!validate({ a: 1, b: 2, c: 3, d: 4}));

        assert(validate({}));
        assert(validate({ a: 1 }));
        assert(validate({ a: 1, b: 2 }));
        assert(validate({ a: 1, b: 2, c: 3 }));
    });

    it('minProperties', function () {
        var schema = { type: 'object', minProperties: 2 },
            validate = jsen(schema);

        assert(!validate({}));
        assert(!validate({ a: 1 }));

        assert(validate({ a: 1, b: 2 }));
        assert(validate({ a: 1, b: 2, c: 3 }));
    });

    it('required properties', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' },
                    c: { type: 'boolean'}
                },
                required: ['a', 'b']
            },
            validate = jsen(schema);

        assert(!validate({}));
        assert(!validate({ c: true }));
        assert(!validate({ a: 'abc', c: true }));
        assert(!validate({ b: 123, c: true }));
        assert(!validate({ a: 'abc', b: undefined }));

        assert(validate({ a: 'abc', b: 123 }));
        assert(validate({ a: 'abc', b: 123, c: true }));
    });

    it('additionalProperties', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' }
                },
                additionalProperties: true
            },
            validate = jsen(schema);

        assert(validate({ a: 'abc' }));
        assert(validate({ b: 123 }));
        assert(validate({ a: 'abc', b: 123 }));
        assert(validate({ a: 'abc', b: 123, c: true }));

        schema.additionalProperties = false;
        validate = jsen(schema);

        assert(!validate({ c: true }));
        assert(!validate({ a: 'abc', b: 123, c: true }));

        assert(validate({ a: 'abc', b: 123 }));
        assert(jsen({ type: 'object', additionalProperties: false })({}));
    });

    it('additionalProperties as schema', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' }
                },
                additionalProperties: {
                    type: 'boolean'
                }
            },
            validate = jsen(schema);

        assert(!validate({ a: 'abc', b: 123, c: 123 }));

        assert(validate({ a: 'abc', b: 123, c: false }));
    });

    it('additionalProperties with patternProperties', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' }
                },
                patternProperties: {
                    '^b': { type: 'number' }
                },
                additionalProperties: true
            },
            validate = jsen(schema);

        assert(validate({ a: 'abc' }));
        assert(validate({ b: 123 }));
        assert(validate({ a: 'abc', b: 123, bar: Math.E, baz: Math.PI }));
        assert(validate({ a: 'abc', baz: 123, c: true }));

        schema.additionalProperties = false;
        validate = jsen(schema);

        assert(!validate({ c: true }));
        assert(!validate({ a: 'abc', bar: 123, c: true }));

        assert(validate({ a: 'abc', baz: 123 }));
        assert(jsen({ type: 'object', additionalProperties: false })({}));
    });

    it('patternProperties', function () {
        var schema = {
                type: 'object',
                patternProperties: {
                    '^a': { type: 'string' },
                    '^b': { type: 'number' }
                }
            },
            validate = jsen(schema);

        assert(!validate({ a: 123 }));
        assert(!validate({ b: 'abc' }));

        assert(validate({}));
        assert(validate({ a: 'abc' }));
        assert(validate({ b: 123 }));
        assert(validate({ a: 'abc', b: 123 }));
    });

    it('dependencies: schema', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' }
                },
                dependencies: {
                    a: {
                        type: 'object',
                        required: ['c'],
                        properties: {
                            c: { type: 'boolean' }
                        }
                    },
                    b: {
                        type: 'object',
                        required: ['f'],
                        properties: {
                            f: { type: 'null' }
                        }
                    },
                    g: {
                        type: 'object',
                        required: ['b'],
                        properties: {
                            b: {
                                type: 'integer'
                            }
                        }
                    }
                }
            },
            validate = jsen(schema);

        assert(!validate({ a: 'abc' }));
        assert(!validate({ a: 'abc', c: 123 }));
        assert(!validate({ b: Math.PI, f: false }));
        assert(!validate({ b: Math.PI, g: null }));

        assert(validate({}));
        assert(validate({ a: 'abc', c: false }));
        assert(validate({ b: Math.PI, f: null }));
        assert(validate({ b: 123, g: 'any value', f: null }));
    });

    it('dependencies: property', function () {
        var schema = {
                type: 'object',
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' },
                    c: { type: 'boolean' }
                },
                dependencies: {
                    a: ['b', 'c']
                }
            },
            validate = jsen(schema);

        assert(!validate({ a: 'abc' }));
        assert(!validate({ a: 'abc', b: 123 }));

        assert(validate({}));
        assert(validate({ a: 'abc', b: 123, c: false }));
    });

    it('nested graph', function () {
        var schema = {
                type: ['object', 'null'],
                properties: {
                    a: { type: 'string' },
                    b: { type: 'number' },
                    c: {
                        type: 'array',
                        items: { type: 'boolean' }
                    }
                },
                required: ['a']
            },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate({}));
        assert(!validate({ a: 123 }));
        assert(!validate({ a: 'abc', b: false }));
        assert(!validate({ a: 'abc', c: [null] }));

        assert(validate(null));
        assert(validate({ a: 'abc', b: 123.4, c: [true, false] }));
        assert(validate({ a: 'abc', b: 0 }));
        assert(validate({ a: 'abc', c: [true, false] }));
        assert(validate({ a: 'abc', c: [] }));
    });
});