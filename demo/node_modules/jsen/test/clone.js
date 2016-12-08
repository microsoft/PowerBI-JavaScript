'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js'),
    clone = jsen.clone;

describe('clone', function () {
    it('string', function () {
        assert.strictEqual(clone('abc'), 'abc');
    });

    it('number', function () {
        assert.strictEqual(clone(123), 123);
    });

    it('integer', function () {
        assert.strictEqual(clone(Math.PI), Math.PI);
    });

    it('boolean', function () {
        assert.strictEqual(clone(false), false);
    });

    it('function', function () {
        var func = function () { };
        assert.strictEqual(clone(func), func);
    });

    it('regexp', function () {
        var regex = /a/gim;
        assert.notStrictEqual(clone(regex), regex);
        assert.strictEqual(clone(regex).toString(), regex.toString());
    });

    it('date', function () {
        var today = new Date('05/14/2015');
        assert.notStrictEqual(clone(today), today);
        assert.strictEqual(clone(today).toJSON(), today.toJSON());
    });

    it('null', function () {
        assert.strictEqual(clone(null), null);
    });

    it('undefined', function () {
        assert.strictEqual(clone(undefined), undefined);
    });

    it('object', function () {
        var obj = { a: 1, b: 'a', c: false, d: { e: Math.PI, f: [1, 2, 3] } };
        assert.notStrictEqual(clone(obj), obj);
        assert.strictEqual(JSON.stringify(clone(obj)), JSON.stringify(obj));
    });

    it('array', function () {
        var arr = [1, 'a', false, { d: [1, 2, 3] }];
        assert.notStrictEqual(clone(arr), arr);
        assert.strictEqual(JSON.stringify(clone(arr)), JSON.stringify(arr));
    });
});