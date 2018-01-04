/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: string', function () {
    it('required', function () {
        var schema = { type: 'string' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));

        assert(validate('abc'));
    });

    it('nullable', function () {
        var schema = { type: ['string', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(null));
        assert(validate(''));
    });

    it('type', function () {
        var schema = { type: 'string' },
            validate = jsen(schema);

        assert(!validate(123));
        assert(!validate(true));
        assert(!validate(false));
        assert(!validate(0));
        assert(!validate([]));
        assert(!validate({}));

        assert(validate('abc'));
    });

    it('enum', function () {
        var schema = { type: 'string', enum: ['a', 'b', 'c'] },
            validate = jsen(schema);

        assert(!validate('not in enum'));

        assert(validate('b'));
    });

    it('minLength', function () {
        var schema = { type: 'string', minLength: 10 },
            validate = jsen(schema);

        assert(!validate('too short'));

        assert(validate('just long enough'));
    });

    it('maxLength', function () {
        var schema = { type: 'string', maxLength: 12 },
            validate = jsen(schema);

        assert(!validate('this string is too long'));

        assert(validate('short enough'));
    });

    it('pattern', function () {
        var schema = { type: 'string', pattern: '\\d' },
            validate = jsen(schema);

        assert(!validate('a'));

        assert(validate('1'));

        schema = { type: 'string', pattern: /\d/ };
        validate = jsen(schema);

        assert(!validate('a'));

        assert(validate('1'));
    });
});