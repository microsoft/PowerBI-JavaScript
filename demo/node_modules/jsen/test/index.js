'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('jsen', function () {
    it('is a function', function () {
        assert(typeof jsen === 'function');
    });

    it('throws if schema is not an object', function () {
        assert.throws(function () { jsen(); });
        assert.throws(function () { jsen(null); });
        assert.throws(function () { jsen(false); });
        assert.throws(function () { jsen(123); });
        assert.throws(function () { jsen('abc'); });
        assert.throws(function () { jsen([]); });
        assert.doesNotThrow(function () { jsen({}); });
    });

    it('produces a function', function () {
        var validate = jsen({});
        assert(typeof validate === 'function');
        assert(validate() === true);
        // assert(validate.error === null);
    });

    it('does not throw if nested schemas are invalid', function () {
        var schemas = [
            { properties: { foo: null } },
            { properties: { foo: 123 } },
            { items: { properties: { foo: undefined } } },
            { allOf: [{ properties: { foo: undefined }}] },
            { allOf: [{ properties: { foo: [] }}] }
        ];

        schemas.forEach(function (schema) {
            assert.doesNotThrow(function () {
                assert(jsen(schema)());
            });
        });
    });
});