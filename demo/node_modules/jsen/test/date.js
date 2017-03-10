'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('type: date', function () {
    it('required', function () {
        var schema = { type: 'date' },
            validate = jsen(schema);

        assert(!validate());
        assert(!validate(null));

        assert(validate(new Date()));
    });

    it('nullable', function () {
        var schema = { type: ['date', 'null'] },
            validate = jsen(schema);

        assert(!validate(undefined));

        assert(validate(new Date()));
        assert(validate(null));
    });

    it('type', function () {
        var schema = { type: 'date' },
            validate = jsen(schema);

        assert(!validate('123'));
        assert(!validate([]));
        assert(!validate({}));
        assert(!validate(Math.PI));

        assert(validate(new Date()));
    });
});