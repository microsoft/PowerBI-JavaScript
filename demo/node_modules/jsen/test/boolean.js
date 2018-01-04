/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: boolean', function () {
    it('required', function () {
        var schema = { type: 'boolean' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));

        assert(validate(false));
        assert(validate(true));
    });

    it('nullable', function () {
        var schema = { type: ['boolean', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(true));
        assert(validate(false));
        assert(validate(null));
    });

    it('type', function () {
        var schema = { type: 'boolean' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate([]));
        assert(!validate({}));
        assert(!validate(Math.PI));

        assert(validate(true));
        assert(validate(false));
    });
});