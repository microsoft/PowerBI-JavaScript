/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: integer', function () {
    it('required', function () {
        var schema = { type: 'integer' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));
        assert(validate(123));
    });

    it('nullable', function () {
        var schema = { type: ['integer', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(null));
        assert(validate(123));
    });

    it('boolean-able', function () {
        var schema = { type: ['integer', 'boolean'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(true));
        assert(validate(false));
        assert(validate(123));
        assert(!validate(123.123));
    });

    it('boolean-able with minimum', function () {
        var schema = { type: ['integer', 'boolean'], minimum: 0 },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(true));
        assert(validate(false));
        assert(validate(123));
        assert(!validate(123.123));
        assert(!validate(-10));
    });

    it('boolean-able with maximum', function () {
        var schema = { type: ['integer', 'boolean'], maximum: 124 },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(true));
        assert(validate(false));
        assert(validate(123));
        assert(!validate(123.123));
        assert(!validate(125));
    });

    it('boolean-able with maximum and minimum', function () {
        var schema = { type: ['integer', 'boolean'], maximum: 124, minimum: 0 },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(true));
        assert(validate(false));
        assert(validate(123));
        assert(!validate(123.123));
        assert(!validate(125));
        assert(!validate(-10));
    });

    it('type', function () {
        var schema = { type: 'integer' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate(true));
        assert(!validate(false));
        assert(!validate([]));
        assert(!validate({}));
        assert(!validate(Math.PI));

        assert(validate(13));
    });

    it('enum', function () {
        var schema = { type: 'integer', enum: [1, 3, 5, 7] },
            validate = jsen(schema);

        assert(!validate(4));
        assert(validate(5));
    });

    it('minimum', function () {
        var schema = { type: 'integer', minimum: 7 },
            validate = jsen(schema);

        assert(!validate(6));

        assert(validate(7));
        assert(validate(999));
        assert(!validate(7.7));
    });

    it('exclusiveMinimum', function () {
        var schema = {
                type: 'integer',
                minimum: 7,
                exclusiveMinimum: true
            },
            validate = jsen(schema);

        assert(!validate(6));
        assert(!validate(7));

        assert(validate(8));
        assert(validate(999));
    });

    it('maximum', function () {
        var schema = { type: 'integer', maximum: 77 },
            validate = jsen(schema);

        assert(!validate(78));

        assert(validate(-12));
        assert(validate(76));
        assert(validate(77));
        assert(!validate(76.77));
    });

    it('exclusiveMaximum', function () {
        var schema = {
                type: 'integer',
                maximum: 77,
                exclusiveMaximum: true
            },
            validate = jsen(schema);

        assert(!validate(77));
        assert(!validate(78));

        assert(validate(-12));
        assert(validate(75));
        assert(validate(76));
        assert(!validate(75.123));
    });

    it('multipleOf', function () {
        var schema = { type: 'integer', multipleOf: 7 },
            validate = jsen(schema);

        assert(!validate(8));

        assert(validate(14));
        assert(validate(-49));
        assert(validate(77));
        assert(!validate(77.000000000001));
    });
});
