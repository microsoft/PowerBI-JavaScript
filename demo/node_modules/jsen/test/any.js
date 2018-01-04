/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('any', function () {
    it('passes validation on any type', function () {
        var schema = { type: 'any' },
            validate  = jsen(schema);

        assert(validate(null));
        assert(validate(undefined));
        assert(validate(0));
        assert(validate(''));
        assert(validate(Math.PI));
        assert(validate('abc'));
        assert(validate(77));
        assert(validate(false));
        assert(validate(true));
        assert(validate({}));
        assert(validate([]));
    });
});