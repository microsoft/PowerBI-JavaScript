/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js'),
    unique = jsen.unique;

describe('unique', function () {
    it('filters unique values', function () {
        var inputs = [
                [1, 'a', 3, false, null, undefined],
                ['abc', 123, true, 123, false, Math.PI, 'abc', true, null, null]
            ],
            expected = [
                [1, 'a', 3, false, null, undefined],
                ['abc', 123, true, false, Math.PI, null]
            ],
            i;

        for (i = 0; i < inputs.length; i++) {
            assert.deepEqual(unique(inputs[i]), expected[i]);
        }
    });

    it('performs deep equality checks', function () {
        var input = [
                { },
                { a: 1 },
                { b: { c: { d: 123, f: null }, e: 'abc' } },
                [1, 2, 3],
                [{ a: 213 }],
                { b: 1 },
                { a: 1, b: undefined },
                { b: { e: 'abc', c: { f: null, d: 123 } } },
                [1, 2, 3],
                [{ a: 213 }]
            ],
            expected = [
                { },
                { a: 1 },
                { b: { c: { d: 123, f: null }, e: 'abc' } },
                [1, 2, 3],
                [{ a: 213 }],
                { b: 1 },
                { a: 1, b: undefined }
            ];

        assert.deepEqual(unique(input), expected);
    });
});

describe('unique.findIndex', function () {
    it('finds an item index with comparator', function () {
        var arr = [{ }, { a: 1 }, { a: 1, b: 2 }],
            expected = 2,
            comparator = function (obj1, obj2) {
                return obj1.a === obj2.a && obj1.b === obj2.b;
            };

        assert.strictEqual(unique.findIndex(arr, { a: 1, b: 2}, comparator), expected);
    });

    it('returns -1 when item cannot be found', function () {
        var arr = [{ }, { a: 1 }, { a: 1, b: 2 }],
            expected = -1,
            comparator = function (obj1, obj2) {
                return obj1.a === obj2.a && obj1.b === obj2.b;
            };

        assert.strictEqual(unique.findIndex(arr, { a: 1, b: null }, comparator), expected);
    });
});