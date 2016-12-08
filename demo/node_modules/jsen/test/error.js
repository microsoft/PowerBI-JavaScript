'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('errors', function () {
    it('errors is empty array before validation', function () {
        var schema = { type: 'number' },
            validate = jsen(schema);

        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 0);
    });

    it('no errors on successful validation', function () {
        var schema = { type: 'number' },
            validate = jsen(schema),
            valid = validate(123);

        assert(valid);
        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 0);
    });

    it('has errors when validation unsuccessful', function () {
        var schema = { type: 'number' },
            validate = jsen(schema),
            valid = validate('123');

        assert(!valid);
        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 1);
    });

    it('clears errors on successive validation calls', function () {
        var schema = { type: 'number' },
            validate = jsen(schema);

        validate('123');
        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 1);

        validate(123);
        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 0);

        validate('123');
        assert(Array.isArray(validate.errors));
        assert.strictEqual(validate.errors.length, 1);
    });

    it('two successive runs return different arrays', function () {
        var schema = { type: 'number' },
            validate = jsen(schema),
            previous;

        validate('123');
        assert.strictEqual(validate.errors.length, 1);
        previous = validate.errors;

        validate('123');
        assert.strictEqual(validate.errors.length, 1);

        assert.notStrictEqual(validate.errors, previous);
        assert.deepEqual(validate.errors, previous);
    });

    describe('error object', function () {
        var schemas = [
                {
                    type: 'number'
                },

                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                },

                {
                    type: 'array',
                    uniqueItems: true
                },

                {
                    type: 'array',
                    items: {
                        maximum: 10
                    }
                },

                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'array',
                            items: [{
                                type: 'object',
                                properties: {
                                    b: {
                                        multipleOf: 7
                                    }
                                }
                            }]
                        }
                    }
                },

                {
                    allOf: [
                        { minimum: 5 },
                        { maximum: 10 }
                    ]
                },

                {
                    type: 'object',
                    properties: {
                        a: {
                            anyOf: [
                                { type: 'string' },
                                { type: 'number' }
                            ]
                        }
                    }
                },

                {
                    type: 'array',
                    items: [{
                        type: 'object',
                        properties: {
                            a: {
                                oneOf: [
                                    { type: 'boolean' },
                                    { type: 'null' }
                                ]
                            }
                        }
                    }]
                },

                {
                    type: 'object',
                    properties: {
                        a: {
                            not: {
                                type: 'string'
                            }
                        }
                    }
                },

                {
                    definitions: {
                        positiveInteger: {
                            type: 'integer',
                            minimum: 0,
                            exclusiveMinimum: true
                        }
                    },
                    type: 'object',
                    properties: {
                        a: {
                            type: 'object',
                            properties: {
                                b: {
                                    type: 'object',
                                    properties: {
                                        c: {
                                            $ref: '#/definitions/positiveInteger'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },

                {
                    type: 'object',
                    required: ['a', 'b']
                },

                {
                    type: 'object',
                    dependencies: {
                        a: {
                            required: ['b']
                        }
                    }
                },

                {
                    type: 'object',
                    dependencies: {
                        a: ['b']
                    }
                }
            ],
            data = [
                '123',
                { a: 123 },
                [7, 11, 7],
                [10, 11, 9],
                { a: [{ b: 8 }] },
                12,
                { a: false },
                [{ a: 123 }],
                { a: 'abc' },
                { a: { b: { c: 0 }}},
                {},
                { a: 123 },
                { a: 123 }
            ];

        it ('property: path', function () {
            var expectedPaths = [
                    [''],
                    ['a'],
                    [''],
                    ['1'],
                    ['a.0.b'],
                    [''],
                    ['a', 'a'],
                    ['0.a', '0.a', '0.a'],
                    ['a'],
                    ['a.b.c'],
                    ['a'],
                    ['b'],
                    ['b']
                ],
                validate, valid;

            schemas.forEach(function (schema, index) {
                validate = jsen(schema);
                valid = validate(data[index]);

                assert(!valid);

                expectedPaths[index].forEach(function (path, pindex) {
                    try {
                        assert.strictEqual(validate.errors[pindex].path, path);
                    }
                    catch (e) {
                        // console.log(index);
                        // console.log(validate.errors);
                        throw e;
                    }
                });
            });
        });

        it ('property: keyword', function () {
            var expectedKeywords = [
                    ['type'],
                    ['type'],
                    ['uniqueItems'],
                    ['maximum'],
                    ['multipleOf'],
                    ['maximum'],
                    ['type', 'type', 'anyOf'],
                    ['type', 'type', 'oneOf'],
                    ['not'],
                    ['exclusiveMinimum'],
                    ['required'],
                    ['required'],
                    ['dependencies']
                ],
                validate, valid;

            schemas.forEach(function (schema, index) {
                validate = jsen(schema);
                valid = validate(data[index]);

                assert(!valid);

                expectedKeywords[index].forEach(function (keyword, kindex) {
                    try {
                        assert.strictEqual(validate.errors[kindex].keyword, keyword);
                    }
                    catch (e) {
                        // console.log(index);
                        // console.log(validate.errors);
                        throw e;
                    }
                });
            });
        });

        it('adds required property name to path', function () {
            var schema = { type: 'object', required: ['a'] },
                validate = jsen(schema),
                valid = validate({});

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].path, 'a');
            assert.strictEqual(validate.errors[0].keyword, 'required');

            schema = {
                type: 'object',
                properties: {
                    a: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['b']
                        }
                    }
                }
            };

            validate = jsen(schema);
            valid = validate({ a: [{}] });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].path, 'a.0.b');
            assert.strictEqual(validate.errors[0].keyword, 'required');
        });

        it('adds required dependency property to path', function () {
            var schema = {
                    type: 'object',
                    dependencies: {
                        a: ['b']
                    }
                },
                validate = jsen(schema),
                valid = validate({ a: 123 });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].path, 'b');
            assert.strictEqual(validate.errors[0].keyword, 'dependencies');

            schema = {
                type: 'object',
                properties: {
                    a: {
                        type: 'array',
                        items: {
                            type: 'object',
                            dependencies: {
                                a: ['b']
                            }
                        }
                    }
                }
            };

            validate = jsen(schema);
            valid = validate({ a: [{ a: 123 }] });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].path, 'a.0.b');
            assert.strictEqual(validate.errors[0].keyword, 'dependencies');
        });

        it('adds additionalProperties to object', function () {
            var schema = {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'object',
                            properties: {
                                foo: {}
                            },
                            additionalProperties: false
                        }
                    }
                },
                data = {
                    a: {
                        foo: 'foo',
                        bar: 'bar',
                        baz: 'baz'
                    }
                },
                validate = jsen(schema),
                valid = validate(data);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].path, 'a');
            assert.strictEqual(validate.errors[0].keyword, 'additionalProperties');
            assert.strictEqual(validate.errors[0].additionalProperties, 'bar');

            validate = jsen(schema, { greedy: true });
            valid = validate(data);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 2);
            assert.strictEqual(validate.errors[0].path, 'a');
            assert.strictEqual(validate.errors[0].keyword, 'additionalProperties');
            assert.strictEqual(validate.errors[0].additionalProperties, 'bar');
            assert.strictEqual(validate.errors[1].path, 'a');
            assert.strictEqual(validate.errors[1].keyword, 'additionalProperties');
            assert.strictEqual(validate.errors[1].additionalProperties, 'baz');

            assert.notStrictEqual(validate.errors[0], validate.errors[1]);
        });
    });

    describe('multiple errors', function () {
        it('returns multiple errors', function () {
            var schema = {
                    definitions: {
                        array: {
                            maxItems: 1
                        }
                    },
                    type: 'object',
                    properties: {
                        a: {
                            anyOf: [
                                { items: { type: 'integer' } },
                                { $ref: '#/definitions/array' },
                                { items: [{ maximum: 3 }] }
                            ]
                        }
                    }
                },
                data = { a: [Math.PI, Math.E] },
                validate = jsen(schema),
                valid = validate(data);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 5);
        });
    });

    describe('custom errors', function () {
        var schemas = [
                {
                    type: 'string',
                    invalidMessage: 'string is invalid',
                    requiredMessage: 'string is required'
                },
                {
                    type: 'object',
                    required: ['a'],
                    properties: {
                        a: {
                            invalidMessage: 'a is invalid',
                            requiredMessage: 'a is required'
                        }
                    }
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            a: {
                                type: 'object',
                                properties: {
                                    b: {
                                        invalidMessage: 'b is invalid',
                                        requiredMessage: 'b is required'
                                    }
                                },
                                required: ['b']
                            }
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'object',
                            properties: {
                                c: {
                                    type: 'string',
                                    invalidMessage: 'c is invalid',
                                    requiredMessage: 'c is required'
                                }
                            }
                        }
                    }
                }
            ],
            data = [
                undefined,
                {},
                [{ a: {} }],
                { a: { c: 123 }}
            ],
            expectedMessages = [
                'string is invalid',
                'a is required',
                'b is required',
                'c is invalid'
            ],
            validate,
            valid;

        schemas.forEach(function (schema, index) {
            it (expectedMessages[index], function () {
                validate = jsen(schema);

                valid = validate(data[index]);

                assert(!valid);
                assert.strictEqual(validate.errors.length, 1);
                assert.strictEqual(validate.errors[0].message, expectedMessages[index]);
            });
        });
    });

    describe('custom keyword messages', function () {
        it('uses custom messages on keywords', function () {
            var schemas = [
                    {
                        type: 'string',
                        messages: { type: 'custom message for keyword "type"' }
                    },
                    {
                        enum: [1, 2, 3],
                        messages: { enum: 'custom message for keyword "enum"' }
                    },
                    {
                        minimum: 3,
                        messages: { minimum: 'custom message for keyword "minimum"' }
                    },
                    {
                        minimum: 3,
                        exclusiveMinimum: true,
                        messages: { exclusiveMinimum: 'custom message for keyword "exclusiveMinimum"' }
                    },
                    {
                        maximum: 10,
                        messages: { maximum: 'custom message for keyword "maximum"' }
                    },
                    {
                        maximum: 10,
                        exclusiveMaximum: true,
                        messages: { exclusiveMaximum: 'custom message for keyword "exclusiveMaximum"' }
                    },
                    {
                        multipleOf: 5,
                        messages: { multipleOf: 'custom message for keyword "multipleOf"' }
                    },
                    {
                        minLength: 3,
                        messages: { minLength: 'custom message for keyword "minLength"' }
                    },
                    {
                        maxLength: 5,
                        messages: { maxLength: 'custom message for keyword "maxLength"' }
                    },
                    {
                        pattern: '\\d+',
                        messages: { pattern: 'custom message for keyword "pattern"' }
                    },
                    {
                        format: 'email',
                        messages: { format: 'custom message for keyword "format"' }
                    },
                    {
                        minItems: 1,
                        messages: { minItems: 'custom message for keyword "minItems"' }
                    },
                    {
                        maxItems: 1,
                        messages: { maxItems: 'custom message for keyword "maxItems"' }
                    },
                    {
                        additionalItems: false,
                        items: [{ type: 'string' }],
                        messages: { additionalItems: 'custom message for keyword "additionalItems"' }
                    },
                    {
                        uniqueItems: true,
                        messages: { uniqueItems: 'custom message for keyword "uniqueItems"' }
                    },
                    {
                        minProperties: 1,
                        messages: { minProperties: 'custom message for keyword "minProperties"' }
                    },
                    {
                        maxProperties: 1,
                        messages: { maxProperties: 'custom message for keyword "maxProperties"' }
                    },
                    {
                        required: ['foo'],
                        messages: { required: 'custom message for keyword "required"' }
                    },
                    {
                        required: ['foo'],
                        properties: {
                            foo: {
                                messages: {
                                    required: 'custom message for keyword "required"'
                                }
                            }
                        }
                    },
                    {
                        required: ['foo'],
                        properties: {
                            foo: {
                                messages: {
                                    required: 'this custom message for keyword "required" is assigned'
                                }
                            }
                        },
                        messages: { required: 'this custom message for keyword "required" is NOT assigned' }
                    },
                    {
                        additionalProperties: false,
                        messages: { additionalProperties: 'custom message for keyword "additionalProperties"' }
                    },
                    {
                        dependencies: {
                            foo: ['bar']
                        },
                        messages: { dependencies: 'custom message for keyword "dependencies"' }
                    },
                    {
                        anyOf: [
                            { type: 'string' },
                            { type: 'integer' }
                        ],
                        messages: { anyOf: 'custom message for keyword "anyOf"' }
                    },
                    {
                        oneOf: [
                            { type: 'string' },
                            { type: 'integer' }
                        ],
                        messages: { oneOf: 'custom message for keyword "oneOf"' }
                    },
                    {
                        not: {
                            type: 'string'
                        },
                        messages: { not: 'custom message for keyword "not"' }
                    }
                ],
                data = [
                    123,
                    5,
                    1,
                    3,
                    11,
                    10,
                    12,
                    'ab',
                    'abcdef',
                    'abc',
                    'invalid email',
                    [],
                    [1, 2, 3],
                    ['abc', 'def'],
                    [1, 2, 2],
                    {},
                    { foo: 1, bar: 2 },
                    {},
                    {},
                    {},
                    { foo: 'bar' },
                    { foo: 'abc' },
                    null,
                    null,
                    'abc'
                ],
                expectedMessages = [
                    schemas[0].messages.type,
                    schemas[1].messages.enum,
                    schemas[2].messages.minimum,
                    schemas[3].messages.exclusiveMinimum,
                    schemas[4].messages.maximum,
                    schemas[5].messages.exclusiveMaximum,
                    schemas[6].messages.multipleOf,
                    schemas[7].messages.minLength,
                    schemas[8].messages.maxLength,
                    schemas[9].messages.pattern,
                    schemas[10].messages.format,
                    schemas[11].messages.minItems,
                    schemas[12].messages.maxItems,
                    schemas[13].messages.additionalItems,
                    schemas[14].messages.uniqueItems,
                    schemas[15].messages.minProperties,
                    schemas[16].messages.maxProperties,
                    schemas[17].messages.required,
                    schemas[18].properties.foo.messages.required,
                    schemas[19].properties.foo.messages.required,
                    schemas[20].messages.additionalProperties,
                    schemas[21].messages.dependencies,
                    schemas[22].messages.anyOf,
                    schemas[23].messages.oneOf,
                    schemas[24].messages.not
                ],
                validate,
                valid;

            schemas.forEach(function (schema, index) {
                validate = jsen(schema);

                valid = validate(data[index]);

                assert(!valid);
                assert.strictEqual(validate.errors[validate.errors.length - 1].message, expectedMessages[index]);
            });
        });

        it('does not use custom messages on keyword: items (object)', function () {
            var schema = {
                    items: {
                        type: 'string',
                        messages: {
                            type: 'will be assigned'
                        }
                    },
                    messages: {
                        items: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate([123]);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });

        it('does not use custom messages on keyword: items (array)', function () {
            var schema = {
                    items: [{
                        type: 'string',
                        messages: {
                            type: 'will be assigned'
                        }
                    }],
                    messages: {
                        items: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate([123, 123]);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });

        it('does not use custom messages on keyword: properties', function () {
            var schema = {
                    properties: {
                        foo: {
                            type: 'number',
                            messages: {
                                type: 'will be assigned'
                            }
                        }
                    },
                    messages: {
                        properties: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate({ foo: 'bar' });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });

        it('does not use custom messages on keyword: patternProperties', function () {
            var schema = {
                    patternProperties: {
                        '^foo$': {
                            type: 'number',
                            messages: {
                                type: 'will be assigned'
                            }
                        }
                    },
                    messages: {
                        patternProperties: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate({ foo: 'bar' });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });

        it('does not use custom messages on keyword: dependencies (schema)', function () {
            var schema = {
                    dependencies: {
                        foo: {
                            minProperties: 2,
                            messages: {
                                minProperties: 'will be assigned'
                            }
                        }
                    },
                    messages: {
                        dependencies: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate({ foo: 'bar' });

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });

        it('does not use custom messages on keyword: allOf', function () {
            var schema = {
                    dependencies: {
                        foo: {
                            minProperties: 2,
                            messages: {
                                minProperties: 'will be assigned'
                            }
                        }
                    },
                    allOf: [
                        {
                            minimum: 2,
                            messages: {
                                minimum: 'will not be assigned'
                            }
                        },
                        {
                            maximum: 5,
                            messages: {
                                maximum: 'will be assigned'
                            }
                        }
                    ],
                    messages: {
                        allOf: 'will not be assigned'
                    }
                },
                validate = jsen(schema),
                valid = validate(6);

            assert(!valid);
            assert.strictEqual(validate.errors.length, 1);
            assert.strictEqual(validate.errors[0].message, 'will be assigned');
        });
    });
});