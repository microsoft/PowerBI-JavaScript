/* global describe, it */
'use strict';

var dir = '../node_modules/json-schema-test-suite/tests/draft4',
    assert = assert || require('assert'),
    jsen = jsen || require('../index.js'),
    path = jsen.browser ? null : require('path'),
    fs = jsen.browser ? null : require('fs'),
    testDir = jsen.browser ? dir + '/' : path.resolve(__dirname, dir),
    files,
    testCategories = [],
    error,
    excludedFiles = [
        'zeroTerminatedFloats'
    ],
    refs = {
        'http://localhost:1234/integer.json': '../node_modules/json-schema-test-suite/remotes/integer.json',
        'http://localhost:1234/subSchemas.json': '../node_modules/json-schema-test-suite/remotes/subSchemas.json',
        'http://localhost:1234/folder/folderInteger.json': '../node_modules/json-schema-test-suite/remotes/folder/folderInteger.json'
    },
    httpGet = function (url, onload) {
        var xhr = new XMLHttpRequest();     // jshint ignore: line
        xhr.onload = function () {
            onload(JSON.parse(this.responseText));
        };
        xhr.open('GET', url, false);
        xhr.send(null);
    },
    walk;

if (jsen.browser) {
    walk = function (dir) {
        var specs = [
                'optional/bignum',
                'optional/format',
                'additionalItems',
                'additionalProperties',
                'allOf',
                'anyOf',
                'default',
                'definitions',
                'dependencies',
                'enum',
                'items',
                'maxItems',
                'maxLength',
                'maxProperties',
                'maximum',
                'minItems',
                'minLength',
                'minProperties',
                'minimum',
                'multipleOf',
                'not',
                'oneOf',
                'pattern',
                'patternProperties',
                'properties',
                'ref',
                'refRemote',
                'required',
                'type',
                'uniqueItems'
            ],
            spec;

        function onXhrLoad(data) {
            testCategories.push({
                name: spec,
                testGroups: data    // jshint ignore: line
            });
        }

        while (specs.length) {
            spec = specs.shift();
            httpGet(dir + spec + '.json', onXhrLoad);
        }

    };

    Object.keys(refs).forEach(function (key) {
        httpGet(refs[key], function (data) {
            refs[key] = data;
        });
    });
}
else {
    walk = function (dir) {
        files = fs.readdirSync(dir);

        files.forEach(function (filename) {
            var fullpath = path.resolve(dir, filename),
                stat = fs.statSync(fullpath);

            if (stat.isFile() && path.extname(filename) === '.json' &&
                excludedFiles.indexOf(path.basename(filename, '.json')) < 0) {
                testCategories.push({
                    name: path.basename(filename, '.json'),
                    testGroups: require(fullpath)
                });
            }
            else if (stat.isDirectory()) {
                walk(path.resolve(dir, filename));
            }
        });
    };

    Object.keys(refs).forEach(function (key) {
        refs[key] = require(refs[key]);
    });
}

try {
    walk(testDir);
}
catch (e) {
    error = e;
}

function addTestCase(schema, testCase) {
    if (testCase.skip) {
        return;
    }

    var test = testCase.only ? it.only : it;

    test(testCase.description, function () {
        var prejson = JSON.stringify(schema);

        assert.strictEqual(jsen(schema, { schemas: refs })(testCase.data), testCase.valid);

        assert.strictEqual(JSON.stringify(schema), prejson,
            'validator does not modify original JSON');
    });
}

function addTestGroup(testGroup) {
    describe(testGroup.description, function () {
        testGroup.tests.forEach(addTestCase.bind(null, testGroup.schema));
    });
}

function addTestCategory(testCategory) {
    describe(testCategory.name, function () {
        testCategory.testGroups.forEach(addTestGroup);
    });
}

describe('JSON-schema test suite', function () {
    if (error) {
        it('error', function () {
            assert.fail(error.message);
        });
    }
    else {
        testCategories.forEach(addTestCategory);
    }
});