'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('fixes', function () {
    it('Fix broken inlining of regular expressions containing slashes (#15, #25)', function () {
        var schema = {
            type: 'string',
            pattern: '^/dev/[^/]+(/[^/]+)*$'
        };

        assert.doesNotThrow(function () {
            jsen(schema);
        });
    });

    it('Fix broken inlining of regular expressions containing slashes 2 (#46)', function () {
        var schema = {
            type: 'string',
            pattern: '^(/[^/ ]*)+/?$'
        };

        assert.doesNotThrow(function () {
            jsen(schema);
        });
    });

    it('Fix code generation breaks when object properties in schema are not valid identifiers (#16)', function () {
        var schema = {
                type: 'object',
                properties: {
                    123: {
                        type: 'boolean'
                    }
                }
            },
            validate;

        assert.doesNotThrow(function () {
            validate = jsen(schema);
        });

        assert(validate({ 123: true }));
    });

    it('Fix cannot dereference schema when ids change resolution scope (#14)', function () {
        var schema = {
                $ref: '#child',
                definitions: {
                    child: {
                        id: '#child',
                        type: 'string'
                    }
                }
            },
            validate;

        assert.doesNotThrow(function () {
            validate = jsen(schema);
        });

        assert(validate('abc'));
        assert(!validate(123));

        schema = {
            $ref: '#child/definitions/subchild',
            definitions: {
                child: {
                    id: '#child',
                    definitions: {
                        subchild: {
                            type: 'number'
                        }
                    }
                }
            }
        };

        assert.throws(function () {
            // cannot dereference a URI, part of which is an ID
            validate = jsen(schema);
        });
    });

    it('Fix recursive calls to the same cached $ref validator resets the error object', function () {
        var schema = {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        foo: { $ref: '#' }
                    },
                    required: ['foo']
                }
            },
            validate = jsen(schema);

        assert(validate([{ foo: [] }]));
        assert(validate([{ foo: [{ foo: [] }] }]));
        assert(!validate([{ bar: [] }]));
        assert(!validate([{ foo: [{ foo: [] }, { bar: [] }] }]));   // Bug! False positive
    });

    it('Fix cannot build validator function with nested refs (#48, #50)', function () {
        assert.doesNotThrow(function () {
            jsen({
                a: {
                    properties: {
                        b: {
                            $ref: '#/c'
                        }
                    }
                },
                c: {
                    type: 'any'
                },
                $ref: '#/a'
            });
        });
    });

    it('Fix build() doesn\'t work with allOf (#40)', function () {
        var schemaA = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                id: 'http://jsen.bis/schemaA',
                type: 'object',
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string'}
                },
                required: ['firstName', 'lastName']
            },
            schemaB = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                id: 'http://jsen.bis/schemaB',
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    contactType: { type: 'string', default: 'personal' }
                },
                required: ['email']
            },
            mySchema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                id: 'http://jsen.biz/mySchema',
                type: 'object',
                allOf: [
                    { $ref: 'http://jsen.bis/schemaA' },
                    { $ref: 'http://jsen.bis/schemaB' }
                ]
            },
            baseSchemas = {
                'http://jsen.bis/schemaA': schemaA,
                'http://jsen.bis/schemaB': schemaB
            },
            data = {
                firstName: 'bunk',
                lastName: 'junk',
                email: 'asdf@biz',
                funky: true
            },
            validator = jsen(mySchema, { schemas: baseSchemas, greedy: true });

        assert(validator(data));

        validator.build(data, { additionalProperties: false, copy: false });

        assert.deepEqual(data, {
            firstName: 'bunk',
            lastName: 'junk',
            email: 'asdf@biz',
            contactType: 'personal'
        });
    });

    it('Fix requiredMessage doesn\'t work with external schema', function () {
        var personSchema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                properties: {
                    name: {
                        $ref: '#/name'
                    }
                },
                required: ['name']
            },
            definitions = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                name: {
                    type: 'string',
                    maxLength: 100,
                    pattern: '^[a-zA-Z]+$',
                    invalidMessage: 'Error: Name is invalid - must be <= 100 in length and contain alphabetic characters only',
                    requiredMessage: 'Error: Missing name'
                }
            },
            validate = jsen(personSchema, { schemas: definitions }),
            valid = validate({});

        assert(!valid);
        assert.strictEqual(validate.errors[0].message, definitions.name.requiredMessage);

        valid = validate({ name: '123' });
        assert(!valid);
        assert.strictEqual(validate.errors[0].message, definitions.name.invalidMessage);
    });

    it('Fix validation error when usign additionalProperties (#56)', function () {
        var schema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                additionalProperties: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string'
                        }
                    },
                    additionalProperties: false
                }
            },
            data = {
                one: { label: '1' },
                two: { number: '2' }
            },
            validate = jsen(schema);

        assert(!validate(data));

        data = {
            one: { number: '1' },
            two: { label: '2' }
        };

        assert(!validate(data));
    });

    it('Fix validation error with arrays and oneOf (#55)', function () {
        var schema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                definitions: {
                    array_of_elements: {
                        properties: {
                            the_array: {
                                type: 'array',
                                items: {
                                    oneOf: [
                                        { $ref: '#/definitions/element_of_type_one' },
                                        { $ref: '#/definitions/element_of_type_two' }
                                    ]
                                }
                            }
                        }
                    },
                    element_of_type_one: {
                        type: 'object',
                        properties: {
                            type: {
                                enum: ['one']
                            }
                        }
                    },
                    element_of_type_two: {
                        type: 'object',
                        properties: {
                            type: {
                                enum: ['two']
                            }
                        }
                    }
                },
                $ref: '#/definitions/array_of_elements'
            },
            data = {
                the_array: [
                    { type: 'two' },
                    { type: 'one' }
                ]
            },
            validate = jsen(schema);

        assert(validate(data));
    });

    it('Fix validation error with arrays and oneOf no.2 (#55)', function () {
        var schema = {
                definitions: {
                    myObjectDef: {
                        type: 'number'
                    }
                },
                type: 'array',
                items: {
                    oneOf: [
                        { $ref: '#/definitions/myObjectDef' },
                        { type: 'string' }
                    ]
                }
            },
            data = [
                123,
                'abc'
            ],
            validate = jsen(schema);

        assert(validate(data));
    });

    it('Fix schema validation gives a false positive when the type keyword does not specify a valid type string (#52)', function () {
        var schema = {
                properties:{
                    foo: { type: 'bar' }
                }
            },
            validateSchema = jsen({ $ref: 'http://json-schema.org/draft-04/schema#' });

        assert(!validateSchema(schema));
    });

    it('Fix path values in error objects have unnecessary quotes and brackets (#72)', function () {
        var schema = {
                properties: {
                    first_name: { type: 'string' }
                }
            },
            data = { first_name: null },
            validate = jsen(schema);

        assert(!validate(data));
        assert.strictEqual(validate.errors[0].path, 'first_name');
    });

    it('Fix broken required field validation when schema contains properties, but no sub-schema for required property (#81)', function () {
        var schema = {
                required: ['b'],
                properties: { }
            },
            validate = jsen(schema),
            valid = validate({ a: '123' });

        assert(!valid);
    });
});