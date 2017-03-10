/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js'),
    equal = jsen.equal;

describe('equal', function () {
    it('string', function () {
        assert(equal('a', 'a'));
        assert(!equal('a', 'b'));
    });

    it('number', function () {
        assert(equal(123, 123));
        assert(equal(Math.PI, Math.PI));
        assert(!equal(Math.PI, Math.E));
    });

    it('boolean', function () {
        assert(equal(true, true));
        assert(!equal(true, false));
    });

    it('null', function () {
        assert(equal(null, null));
        assert(!equal(null, undefined));
    });

    it('undefined', function () {
        assert(equal(undefined, undefined));
        assert(!equal(null, undefined));
    });

    it('function', function () {
        var f1 = function () { },
            f2 = function () { },
            f3 = f1;

        // two functions are only equal if they
        // reference the same function object
        assert(equal(f1, f3));
        assert(!equal(f1, f2));
    });

    it('array', function () {
        var f = function () { },
            obj1 = { a: 123, b: 'abc', c: f },
            obj2 = { a: 123, b: 'abc', c: f },
            arr1 = [1, 'a', f, obj1],
            arr2 = [1, 'a', f, obj1],
            arr3 = [1, 'a', f],
            arr4 = [1, 'a', f, obj2];

        assert(equal(arr1, arr2));
        assert(equal(arr1, arr4));

        assert(!equal(arr1, arr3));
    });

    it('object', function () {
        var a = { a: 123, b: ['abc'], c: { } },
            b = { b: ['abc'], c: { }, a: 123 },
            c = a,
            d = { a: 123, b: ['abc'], c: { d: undefined } };

        assert(equal(a, b));
        assert(equal(a, c));

        assert(!equal(a, d));
    });

    it('regexp', function () {
        var a = /a+/gim,
            b = new RegExp('a+', 'gim'),
            c = /a/gim,
            d = a;

        assert(equal(a, b));
        assert(equal(a, d));

        assert(!equal(a, c));
    });
});