/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js'),
    ucs2length = jsen.ucs2length;

// Reference: https://github.com/bestiejs/punycode.js/blob/master/tests/tests.js
describe('ucs2length', function () {
    var ucs2Data = [
        {
            description: 'Consecutive astral symbols',
            decoded: [127829, 119808, 119558, 119638],
            encoded: '\uD83C\uDF55\uD835\uDC00\uD834\uDF06\uD834\uDF56'
        },
        {
            description: 'U+D800 (high surrogate) followed by non-surrogates',
            decoded: [55296, 97, 98],
            encoded: '\uD800ab'
        },
        {
            description: 'U+DC00 (low surrogate) followed by non-surrogates',
            decoded: [56320, 97, 98],
            encoded: '\uDC00ab'
        },
        {
            description: 'High surrogate followed by another high surrogate',
            decoded: [0xD800, 0xD800],
            encoded: '\uD800\uD800'
        },
        {
            description: 'Unmatched high surrogate, followed by a surrogate pair, followed by an unmatched high surrogate',
            decoded: [0xD800, 0x1D306, 0xD800],
            encoded: '\uD800\uD834\uDF06\uD800'
        },
        {
            description: 'Low surrogate followed by another low surrogate',
            decoded: [0xDC00, 0xDC00],
            encoded: '\uDC00\uDC00'
        },
        {
            description: 'Unmatched low surrogate, followed by a surrogate pair, followed by an unmatched low surrogate',
            decoded: [0xDC00, 0x1D306, 0xDC00],
            encoded: '\uDC00\uD834\uDF06\uDC00'
        }
    ];

    it('calculates character length of Unicode surrogate pairs', function () {
        ucs2Data.forEach(function (obj) {
            assert.strictEqual(ucs2length(obj.encoded), obj.decoded.length, obj.description);
        });
    });
});