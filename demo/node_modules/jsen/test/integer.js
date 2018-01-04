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
    });

    it('multipleOf', function () {
        var schema = { type: 'integer', multipleOf: 7 },
            validate = jsen(schema);

        assert(!validate(8));

        assert(validate(14));
        assert(validate(-49));
        assert(validate(77));
    });
});