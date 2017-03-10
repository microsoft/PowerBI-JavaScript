/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: null', function () {
    it('required', function () {
        var schema = { type: 'null' },
            validate = jsen(schema);

        assert(!validate(undefined));
        assert(validate(null));
    });

    it('type', function () {
        var schema = { type: 'null' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate([]));
        assert(!validate({}));
        assert(!validate(Math.PI));

        assert(validate(null));
    });
});