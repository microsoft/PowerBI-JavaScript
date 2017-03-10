/* global describe, it */
'use strict';

var assert = assert || require('assert'),
    jsen = jsen || require('../index.js');

describe('missing $ref', function () {
    it('passes validation with ignore missing $ref', function () {
        var schema = {
                type: 'object',
                properties: {
                    test1: { $ref: '#external1'},
                    test2: {
                        type: 'number'
                    },
                    test3: { $ref: '#external3'}    //missing
                },
                additionalProperties: false
            },
            external1 = {
                type: 'object',
                properties: {
                    test11: { $ref: '#external11'}, //missing
                    test12: {
                        type: 'number'
                    },
                    test13: { $ref: '#external11'}  //duplicate
                }
            },
            validate = jsen(schema, {
                schemas: {
                    external1: external1
                },
                missing$Ref: true
            }),
            missingTest = {
                test1: {
                    test11: 'missing',
                    test12: 5,
                    test13: 'missing too'
                },
                test2: 2,
                test3: 3
            },
            invalidTest = {
                test1: {
                    test11: 'missing',
                    test12: 5,
                    test13: 'missing too'
                },
                test2: 'fail',
                test3: 3
            },
            ret;

        ret = validate(missingTest);
        assert(ret);    // true

        ret = validate(invalidTest);
        assert(!ret);   // !false
    });
});