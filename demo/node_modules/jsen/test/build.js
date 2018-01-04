'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('build', function () {
    it('validator function has a build property', function () {
        var validate = jsen({});

        assert(typeof validate.build === 'function');
        assert.strictEqual(validate.build.length, 2);
    });

    it('returns default value from schema if initial undefined', function () {
        var validate = jsen({ type: 'string', default: 'abc' });

        assert.strictEqual(validate.build(), 'abc');
        assert.strictEqual(validate.build(undefined), 'abc');
    });

    it('does not modify initial defined value', function () {
        var validate = jsen({ type: 'string', default: 'abc' }),
            initials = [
                null,
                '',
                'string value',
                true,
                false,
                123,
                Math.PI
            ],
            obj;

        initials.forEach(function (initial) {
            obj = validate.build(initial);
            assert.strictEqual(obj, initial);
        });
    });

    it('returns a copy of initial defined value', function () {
        var validate = jsen({ type: 'string', default: 'abc' }),
            initials = [
                {},
                [],
                new Date()
            ],
            obj;

        initials.forEach(function (initial) {
            obj = validate.build(initial);
            assert.notStrictEqual(obj, initial);
            assert.deepEqual(obj, initial);
        });
    });

    it('returns initial if no default in schema', function () {
        var validate = jsen({}),
            initials = [
                undefined,
                null,
                '',
                'string value',
                true,
                false,
                123,
                Math.PI,
                {},
                [],
                new Date()
            ],
            obj;

        initials.forEach(function (initial) {
            obj = validate.build(initial);

            assert.deepEqual(obj, initial);
        });
    });

    it('returns the default value specified in schema', function () {
        var schemas = [
                { default: null },
                { default: undefined },
                { default: '' },
                { default: 'abc' },
                { default: true },
                { default: false },
                { default: 123 },
                { default: Math.PI }
            ],
            validate;

        schemas.forEach(function (schema) {
            validate = jsen(schema);
            assert.strictEqual(validate.build(), schema.default);
        });
    });

    it('returns a copy of a default object or array in schema', function () {
        var schemas = [
                { default: { a: { b: 123 } } },
                { default: [[1, 2, 3], { a: { b: 123 } }] },
                { default: /\d+/ },
                { default: new Date('05/14/2015') }
            ],
            validate,
            def;

        schemas.forEach(function (schema) {
            validate = jsen(schema);
            def = validate.build();

            assert.notStrictEqual(def, schema.default);
            assert.deepEqual(def, schema.default);
        });
    });

    it('recursively collects default values', function () {
        var schema = {
                type: 'object',
                default: {},
                properties: {
                    a: {
                        type: 'array',
                        default: [],
                        items: {
                            type: 'string'
                        }
                    },
                    b: {
                        type: 'array',
                        default: [],
                        items: {
                            type: 'string',
                            default: 'abc'
                        }
                    },
                    c: {
                        type: 'object',
                        default: {},
                        properties: {
                            d: {
                                type: 'boolean',
                                default: false
                            },
                            e: {
                                type: 'date',
                                default: new Date('05/14/2015')
                            },
                            f: {
                                type: 'array',
                                default: [{}, {}],
                                items: [{
                                    type: 'object',
                                    properties: {
                                        g: {
                                            type: 'string',
                                            default: 'yes'
                                        }
                                    }
                                }, {
                                    type: 'object',
                                    properties: {
                                        g: {
                                            type: 'integer',
                                            default: 0
                                        }
                                    }
                                }, {
                                    type: 'object',
                                    properties: {
                                        g: {
                                            type: 'boolean',
                                            default: true
                                        }
                                    }
                                }]
                            },
                            h: {
                                type: 'array',
                                default: [{}, {}],
                                items: {
                                    type: 'object',
                                    properties: {
                                        i: {
                                            type: 'object',
                                            default: { foo: 'bar' }
                                        }
                                    }
                                }
                            },
                            i: {
                                type: 'object',
                                default: null,
                                properties: {
                                    j: {
                                        type: 'string',
                                        default: 'baz'
                                    }
                                }
                            }
                        }
                    },
                    j: {
                        type: 'object',
                        properties: {
                            k: {
                                type: 'boolean',
                                default: false
                            }
                        }
                    }
                }
            },
            expected = {
                a: [],
                b: [],
                c: {
                    d: false,
                    e: new Date('05/14/2015'),
                    f: [
                        { g: 'yes' },
                        { g: 0 }
                    ],
                    h: [
                        { i: { foo: 'bar' } },
                        { i: { foo: 'bar' } }
                    ],
                    i: null
                }
            },
            validate = jsen(schema);

        assert.deepEqual(validate.build(), expected);
    });

    it('merges default values with the initial values', function () {
        var schemas = [
                {
                    properties: {
                        foo: { default: 'bar' }
                    }
                },
                {
                    properties: {
                        foo: { default: 'bar' }
                    }
                },
                {
                    properties: {
                        foo: { default: 'bar' }
                    }
                },
                {
                    items: {
                        properties: {
                            foo: { default: 'bar' }
                        }
                    }
                },
                {
                    items: {
                        properties: {
                            foo: { default: 'bar' }
                        }
                    }
                },
                {
                    items: [
                        { default: 'foo' },
                        { default: 'bar' },
                        { default: 'baz' }
                    ]
                },
                {
                    items: [
                        { default: 'foo' },
                        { default: 'bar' },
                        { default: 'baz' }
                    ]
                }
            ],
            defaults = [
                {},
                { foo: 'baz' },
                { x: 'yz' },
                [],
                [{}],
                [],
                [null, {}, undefined, false]
            ],
            expected = [
                { foo: 'bar' },
                { foo: 'baz' },
                { foo: 'bar', x: 'yz' },
                [],
                [{ foo: 'bar' }],
                ['foo', 'bar', 'baz'],
                [null, {}, 'baz', false]
            ],
            validate;

        schemas.forEach(function (schema, index) {
            validate = jsen(schema);

            assert.deepEqual(validate.build(defaults[index]), expected[index]);
        });
    });

    it('$ref', function () {
        var schema = {
                definitions: {
                    positiveInteger: {
                        type: 'integer',
                        minimum: 1,
                        default: 7
                    }
                },
                $ref: '#definitions/positiveInteger'
            },
            validate = jsen(schema);

        assert.strictEqual(validate.build(), 7);
    });

    describe('object', function () {
        it('clones default object and subproperties recursively', function () {
            var schema = {
                    default: {},
                    properties: {
                        foo: {
                            type: 'string',
                            default: 'bar'
                        }
                    }
                },
                expected = { foo: 'bar' },
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });

        it('does not recursively assign defaults of children if parent default is not an object', function () {
            var schema = {
                    default: [],
                    properties: {
                        foo: {
                            type: 'string',
                            default: 'bar'
                        }
                    }
                },
                expected = [],
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });
    });

    describe('array', function () {
        it('does not add new elements to default array: items schema is an object', function () {
            var schema = {
                    default: [],
                    items: {
                        type: 'string',
                        default: 'bar'
                    }
                },
                expected = [],
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });

        it('adds new elements to default array: items schema is an array', function () {
            var schema = {
                    default: [],
                    items: [{
                        type: 'string',
                        default: 'bar'
                    }]
                },
                expected = ['bar'],
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });

        it('adds default values to already existing child items of compatible type only: items schema is an object', function () {
            var schema = {
                    default: [{}, null, []],
                    items: {
                        properties: {
                            foo: {
                                type: 'string',
                                default: 'bar'
                            }
                        }
                    }
                },
                expected = [{ foo: 'bar' }, null, []],
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });

        it('adds default values to already existing child items of compatible type only: items schema is an array', function () {
            var schema = {
                    default: [{}, null, {}, undefined],
                    items:[
                        {
                            properties: {
                                foo: {
                                    type: 'string',
                                    default: 'bar'
                                }
                            }
                        },
                        { default: 'abc' },
                        { default: 123 },
                        { default: 123 }
                    ]
                },
                expected = [{ foo: 'bar' }, null, {}, 123],
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });

        it('does not assign default child items if parent default is not an array', function () {
            var schema = {
                    default: 'foobar',
                    items: {
                        type: 'string',
                        default: 'bar'
                    }
                },
                expected = 'foobar',
                validate = jsen(schema);

            assert.deepEqual(validate.build(), expected);
        });
    });

    describe('allOf', function () {
        var cases = {
            'basic types - first value wins': {
                schema: {
                    allOf: [
                        { default: 'foo' },
                        { default: 'baz' }
                    ]
                },
                expected: 'foo'
            },
            'objects - properties are combined': {
                schema: {
                    allOf: [{
                        default: {},
                        properties: {
                            foo: { default: 123 }
                        }
                    }, {
                        default: {},
                        properties: {
                            bar: { default: 'abc' }
                        }
                    }, {
                        default: {},
                        properties: {
                            baz: { default: false }
                        }
                    }]
                },
                expected: {
                    foo: 123,
                    bar: 'abc',
                    baz: false
                }
            },
            'nested objects - properties are combined': {
                schema: {
                    allOf: [{
                        default: {},
                        properties: {
                            foo: {
                                default: { bar: 'baz' }
                            }
                        }
                    }, {
                        default: {},
                        properties: {
                            foo: {
                                properties: {
                                    name: { default: 'John' }
                                }
                            }
                        }
                    }]
                },
                expected: {
                    foo: {
                        bar: 'baz',
                        name: 'John'
                    }
                }
            },
            'objects - duplicate keys - first value wins': {
                schema: {
                    allOf: [{
                        default: {},
                        properties: {
                            foo: { default: '123' },
                            bar: { default: true }
                        }
                    }, {
                        default: {},
                        properties: {
                            foo: { default: null },
                            baz: { default: false }
                        }
                    }]
                },
                expected: {
                    foo: '123',
                    bar: true,
                    baz: false
                }
            },
            'arrays - fixed item count - first defined item wins': {
                schema: {
                    allOf: [{
                        default: [],
                        items: [
                            { default: 123 },
                            { default: { foo: 'bar', name: 'John' } }
                        ]
                    }, {
                        default: [],
                        items: [
                            { default: 'abc' },
                            { default: { foo: 'baz' } },
                            { default: true }
                        ]
                    }]
                },
                expected: [123, { foo: 'bar', name: 'John' }, true]
            },
            'arrays - variable item count - items are combined': {
                schema: {
                    allOf: [{
                        default: [{}, undefined, {}, 123],
                        items: {
                            properties: {
                                foo: {
                                    default: 'abc'
                                },
                                bar: {
                                    default: null
                                }
                            }
                        }
                    }, {
                        default: [{}, {}],
                        items: {
                            default: {},
                            properties: {
                                foo: {
                                    default: 123
                                },
                                baz: {
                                    default: false
                                }
                            }
                        }
                    }]
                },
                expected: [
                    { foo: 'abc', bar: null, baz: false },
                    { foo: 123, baz: false },
                    { foo: 'abc', bar: null, baz: false },
                    123
                ]
            }
        };

        Object.keys(cases).forEach(function (name) {
            it(name, function () {
                var validate = jsen(cases[name].schema);
                assert.deepEqual(validate.build(cases[name].initial), cases[name].expected);
            });
        });
    });

    describe('option: copy', function () {
        it('returns deep copy of the initial object by default', function () {
            var schema = {},
                initial = {},
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial), initial);
            assert.notStrictEqual(validate.build(initial), initial);
        });

        it('modifies the initial object when copy = false', function () {
            var schema = {
                    properties: {
                        a: { default: 'foo' },
                        b: {
                            items: {
                                properties: {
                                    c: { default: 'bar' },
                                    d: { default: 'baz' }
                                }
                            }
                        }
                    }
                },
                initial = { b: [{ d: 'xyz' }] },
                expected = { a: 'foo', b: [{ c: 'bar', d: 'xyz' }]},
                validate = jsen(schema),
                actual = validate.build(initial, { copy: false });

            assert.deepEqual(actual, expected);
            assert.strictEqual(actual, initial);
        });
    });

    describe('option: additionalProperties', function () {
        it('includes by default', function () {
            var schema = {
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1, bar: 2 },
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial), expected);
        });

        it('excludes when schema.additionalProperties = false', function () {
            var schema = {
                    additionalProperties: false,
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1 },
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial), expected);
        });

        it('excludes when options.additionalProperties = false', function () {
            var schema = {
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1 },
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial, { additionalProperties: false }), expected);
        });

        it('removes from the initial object when schema.additionalProperties = false and options.copy = false', function () {
            var schema = {
                    additionalProperties: false,
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1 },
                validate = jsen(schema),
                actual;

            actual = validate.build(initial, { copy: false });

            assert.strictEqual(actual, initial);
            assert.deepEqual(actual, expected);
        });

        it('removes from the initial object when options.additionalProperties = false and options.copy = false', function () {
            var schema = {
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1 },
                validate = jsen(schema),
                actual;

            actual = validate.build(initial, {
                copy: false,
                additionalProperties: false
            });

            assert.strictEqual(actual, initial);
            assert.deepEqual(actual, expected);
        });

        it('schema.additionalProperties takes precedence', function () {
            var schema = {
                    additionalProperties: true,
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1, bar: 2 },
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial, { additionalProperties: false }), expected);
        });

        it('"always" takes precedence over schema.additionalProperties', function () {
            var schema = {
                    additionalProperties: false,
                    properties: {
                        foo: {}
                    }
                },
                initial = { foo: 1, bar: 2 },
                expected = { foo: 1, bar: 2 },
                validate = jsen(schema);

            assert.deepEqual(validate.build(initial, { additionalProperties: 'always' }), expected);
        });
    });
});