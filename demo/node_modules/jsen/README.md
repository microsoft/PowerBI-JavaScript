[![JSEN][jsen-img]][jsen-web]
=================

[![Build][travis-img]][travis-url] [![Coverage][coveralls-img]][coveralls-url] [![Downloads][downloads-img]][npm-url] [![JSEN][jsen-web-badge]][jsen-web]

[![NPM][npm-img]][npm-url]

<!-- [![testling][testling-img]][testling-url] -->

jsen (JSON Sentinel) validates your JSON objects using [JSON-Schema](http://json-schema.org/documentation.html).

Website: [http://bugventure.github.io/jsen][jsen-web]

### Table of Contents

<!-- MarkdownTOC -->

- [Getting Started](#getting-started)
- [Performance & Benchmarks](#performance--benchmarks)
- [JSON Schema](#json-schema)
- [Format Validation](#format-validation)
    - [Custom Formats](#custom-formats)
- [External Schemas](#external-schemas)
    - [Remote Schemas](#remote-schemas)
- [Errors](#errors)
    - [Custom Errors](#custom-errors)
    - [Custom Errors for Keywords](#custom-errors-for-keywords)
    - [Greedy Validation](#greedy-validation)
- [Gathering Default Values](#gathering-default-values)
    - [options.copy](#optionscopy)
    - [options.additionalProperties](#optionsadditionalproperties)
- [In-Browser Usage](#in-browser-usage)
- [Tests](#tests)
- [Contributing](#contributing)
- [Issues](#issues)
- [Changelog](#changelog)
- [License](#license)

<!-- /MarkdownTOC -->

## Getting Started

Install through NPM in node.

```bash
$ npm install jsen --save
```

```javascript
var jsen = require('jsen');
var validate = jsen({ type: 'string' });
var valid = validate('some value');             // true
```

Install through Bower in your HTML page.

```bash
$ bower install jsen
```

```javascript
<script src="bower_components/jsen/dist/jsen.min.js"></script>
<script>
    var validate = jsen({ type: 'string' });    // under window.jsen
    var valid = validate('some value');         // true
</script>
```

Validation works by passing a JSON schema to build a validator function that can be used to validate a JSON object.

The validator builder function (`jsen`) throws an error if the first parameter is not a schema object:

```javascript
try {
    // cannot use this string as a schema
    jsen('not a valid schema');
}
catch (e) {
    console.log(e);
}
```

`jsen` will not throw an error if the provided schema is not compatible with the [JSON-schema version 4 spec](http://json-schema.org/documentation.html). In this case, as per the spec, validation will always succeed for every schema keyword that is incorrectly defined.

```javascript

// this will not throw, but validation will be incorrect
var validate = jsen({ type: 'object', properties: ['string', 'number'] });

// validation erroneously passes, because keyword `properties` is ignored
var valid = validate({});   // true
```

If you need to validate your schema object, you can use a reference to the [JSON meta schema](http://json-schema.org/draft-04/schema). Internally, `jsen` will recognize and validate against the metaschema.

```javascript
var validateSchema = jsen({"$ref": "http://json-schema.org/draft-04/schema#"});
var isSchemaValid = validateSchema({ type: 'object' }); // true

isSchemaValid = validateSchema({
    type: 'object',
    properties: ['string', 'number']
});
// false, because properties is not in correct format
```

## Performance & Benchmarks

JSEN uses dynamic code generation to produce a validator function that the V8 engine can optimize for performance. Following is a set of benchmarks where JSEN is compared to other JSON Schema validators for node.

* [json-schema-benchmark](https://github.com/ebdrup/json-schema-benchmark)
* [z-schema bencrhmark](https://rawgit.com/zaggino/z-schema/master/benchmark/results.html)
* [jsck benchmark](https://github.com/pandastrike/jsck)
* [themis benchmark](https://github.com/playlyfe/themis)
* [cosmicrealms.com benchmark](https://github.com/Sembiance/cosmicrealms.com)

More on V8 optimization: [Performance Tips for JavaScript in V8](http://www.html5rocks.com/en/tutorials/speed/v8/)

## JSON Schema

To get started with JSON Schema, check out the [JSEN schema guide](http://bugventure.github.io/jsen/json-schema).

For further reading, check out this [excellent guide to JSON Schema](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf) by Michael Droettboom, et al.

JSEN fully implements draft 4 of the [JSON Schema specification](http://json-schema.org/documentation.html).

## Format Validation

JSEN supports a few built-in formats, as defined by the [JSON Schema spec](http://json-schema.org/latest/json-schema-validation.html#anchor107):

* `date-time`
* `uri`
* `email`
* `ipv4`
* `ipv6`
* `hostname`

These formats are validated against string values only. As per the spec, format validation passes successfully for any non-string value.

```javascript
var schema = { format: 'uri' },
    validate = jsen(schema);

validate('invalid/uri');    // false - format validation kicks in for strings
validate({});               // true - does not kick in for non-strings
```

### Custom Formats

JSEN additionally supports custom format validation. Custom formats are passed in `options.formats` as a second argument to the `jsen` validator builder function.

```javascript
var schema = { format: 'uuid' },
    uuidRegex = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$',
    validate = jsen(schema, {
        formats: {
            uuid: uuidRegex
        }
    });

validate('fad2b4f5-bc3c-44ca-8e17-6d30cf62bdb1');   // true
validate('not-a-valid-UUID');                       // false
```

A custom format validator can be specified as:

* a regular expression `string`
* a regular expression `object`
* a `function (value, schema)` that must return a truthy value if validation passes

Unlike built-in format validators, custom format validators passed in the `options` are run for all data types, not only strings. This allows implementing custom validation behavior for arrays and objects in scenarios, where it is not possible or practical to use only JSON Schema keywords for validation rules.

Custom format validation runs after all built-in keyword validators. This means that an error in any previous keyword validator will stop execution and any custom format validators won't run.

## External Schemas

You can use references to external schema objects through the `$ref` keyword. You pass external schemas in the `options.schemas` object:

```javascript
var external = { type: 'string' },
    schema = { $ref: '#external' },
    validate = jsen(schema, {
        schemas: {
            external: external
        }
    });

validate('abc');    // true
validate(123);      // false
```

If you expect to have `$ref`s pointing to missing schemas, you can tell JSEN to ignore invalid schema references with the `options.missing$Ref` flag.

```javascript
var schema = { $ref: '#missing' },
    validate;

validate = jsen(schema);    // Error: jsen: invalid schema reference #missing

validate = jsen(schema, {   // OK, will ignore missing references
    missing$Ref: true
})
```

### Remote Schemas

Although JSEN does not automatically fetch remote schemas by making HTTP requests, you can fetch and provide them through the `schemas` option by giving their URIs as object keys.

```javascript
var schema = { $ref: 'http://localhost:1234/integer.json' },
    externalSchema = { type: 'integer' }, // Downloaded from http://localhost:1234/integer.json
    validate = jsen(schema, {
        schemas: {
            'http://localhost:1234/integer.json': externalSchema
        }
    });
```

## Errors

The validator function (the one called with the object to validate) provides an `errors` array containing all reported errors in a single validation run.

```javascript
var validate = jsen({ type: 'string' });

validate(123);      // false
console.log(validate.errors)
// Output: [{ path: '', keyword: 'type' }]

// path - deep (dot-delimited) path to the property that failed validation
// keyword - the JSON schema keyword that failed validation

validate('abc');    // true
// Output: []
```

The `errors` array may contain multiple errors from a single run.

```javascript
var validate = jsen({
    anyOf: [
        {
            type: 'object',
            properties: {
                tags: { type: 'array' }
            }
        },
        {
            type: 'object',
            properties: {
                comment: { minLength: 1 }
            }
        }
    ]
});

validate({ tags: null, comment: '' });

console.log(validate.errors);
/* Output:
[ { path: 'tags', keyword: 'type' },
  { path: 'comment', keyword: 'minLength' },
  { path: '', keyword: 'anyOf' } ]
*/
```

When the `additionalProperties` keyword fails validation, the respective error object contains a key by the same name, specifying the property name that was found in the validated object, but was fobidden in the schema:

```javascript
var schema = {
    properties: { foo: {} },
    additionalProperties: false
}

var validate = jsen(schema);

validate({ foo: 'foo', bar: 'bar' });   // false

console.log(validate.errors);
/* Output:
[ { path: '',
    keyword: 'additionalProperties',
    additionalProperties: 'bar' } ]
*/
```

The errors array is replaced on every call of the validator function. You can safely modify the array without affecting successive validation runs.

### Custom Errors

You can define your custom error messages in the schema object through the `invalidMessage` and `requiredMessage` keywords.

```javascript
var schema = {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                minLength: 5,
                invalidMessage: 'Invalid username',
                requiredMessage: 'Username is required'
            }
        },
        required: ['username']
    };
var validate = jsen(schema);

validate({});
console.log(validate.errors);
/* Output:
[ { path: 'username',
    keyword: 'required',
    message: 'Username is required' } ]
*/

validate({ username: '' });
console.log(validate.errors);
/* Output:
[ { path: 'username',
    keyword: 'minLength',
    message: 'Invalid username' } ]
*/
```

Custom error messages are assigned to error objects by path, meaning multiple failed JSON schema keywords on the same path will show the same custom error message.

```javascript
var schema = {
        type: 'object',
        properties: {
            age: {
                type: 'integer',
                minimum: 0,
                maximum: 100,
                invalidMessage: 'Invalid age specified'
            }
        }
    };
var validate = jsen(schema);

validate({ age: 13.3 });
console.log(validate.errors);
/* Output:
[ { path: 'age',
    keyword: 'type',
    message: 'Invalid age specified' } ]
*/

validate({ age: -5 });
console.log(validate.errors);
/* Output:
[ { path: 'age',
    keyword: 'minimum',
    message: 'Invalid age specified' } ]
*/

validate({ age: 120 });
console.log(validate.errors);
/* Output:
[ { path: 'age',
    keyword: 'maximum',
    message: 'Invalid age specified' } ]
*/
```

The `requiredMessage` is assigned to errors coming from the `required` and `dependencies` keywords. For all other validation keywords, the `invalidMessage` is used.

### Custom Errors for Keywords

You can assign custom error messages to keywords through the `messages` object in the JSON schema.

```javascript
var schema = {
    type: 'object',
    messages: {
        type: 'Invalid data type where an object is expected'
    }
}
var validate = jsen(schema);

validate('this is a string, not an object');
console.log(validate.errors);
/* Output:
[ { path: '',
    keyword: 'type',
    message: 'Invalid data type where an object is expected' } ]
*/
```

**NOTE**: The following keywords are never assigned to error objects, and thus do not support custom error messages: `items`, `properties`, `patternProperties`, `dependecies` (when defining a [schema dependency](http://json-schema.org/latest/json-schema-validation.html#anchor70)) and `allOf`.

### Greedy Validation

For performance, by default, JSEN returns the first encountered error and bails out any further execution.

With the `options.greedy` flag passed to the builder function, the compiled validator will try to validate as much as possible, providing more info in the `errors` array.

```javascript
var schema = {
        type: 'object',
        properties: {
            firstName: {
                type: 'string',
                minLength: 1,
                maxLength: 20
            },
            lastName: {
                type: 'string',
                minLength: 2,
                maxLength: 50
            },
            age: {
                type: 'number',
                minimum: 18,
                maximum: 100
            }
        },
        required: ['firstName', 'lastName', 'age']
    };

var validate = jsen(schema, { greedy: true });  // enable greedy validation

validate({ firstName: null, lastName: '' });

console.log(validate.errors);
/* Output:
[ { path: 'firstName', keyword: 'type' },
  { path: 'lastName', keyword: 'minLength' },
  { path: 'age', keyword: 'required' } ]
*/
```

## Gathering Default Values

JSEN can collect default values from the schema. The `build(initial, options)` method in the dynamic validator function recursively walks the schema object and compiles the default values into a single object or array.

```javascript
var validate = jsen({ type: 'string', default: 'abc' });
console.log(validate.build());      // 'abc'

var validate = jsen({
    default: {},
    properties: {
        foo: { default: 'bar' },
        arr: {
            default: [],
            items: [
                { default: 1 },
                { default: 1 },
                { default: 2 }
            ]
        }
    }
});
console.log(validate.build());      // { foo: 'bar', arr: [1, 2, 3] }
```

The `build` function can additionally merge the default values with an initially provided data object.

```javascript
var validate = jsen({
    properties: {
        rememberMe: {
            default: 'true'
        }
    }
});

var initial = { username: 'John', password: 'P@$$w0rd' };

initial = validate.build(initial);

console.log(initial);
// { username: 'John', password: 'P@$$w0rd', rememberMe: true }
```

### options.copy

By default, the `build` function creates a copy of the initial data object. You can opt to modify the object in-place by passing `{ copy: false }` as a second argument.

```javascript
var initial = { username: 'John', password: 'P@$$w0rd' };
var validate = jsen({
    properties: {
        rememberMe: {
            default: 'true'
        }
    }
});

var withDefaults = validate.build(initial);
console.log(withDefaults === initial);      // false (initial is cloned)

withDefaults = validate.build(initial, { copy: false });
console.log(withDefaults === initial);      // true (initial is modified)
```

### options.additionalProperties

The JSON schema spec allows additional properties by default. In many cases, however, this default behavior may be undesirable, forcing developers to specify `additionalProperties: false` everywhere in their schema objects. JSEN's `build` function can filter out additional properties by specifying `{ additionalProperties: false }` as a second argument.

```javascript
var validate = jsen({
    properties: {
        foo: {},
        bar: {}
    }
});

var initial = { foo: 1, bar: 2, baz: 3};

initial = validate.build(initial, { additionalProperties: false });

console.log(initial);   // { foo: 1, bar: 2 }
```

When both `options.additionalProperties` and `schema.additionalProperties` are specified, the latter takes precedence.

```javascript
var validate = jsen({
    additionalProperties: true,
    properties: {
        foo: {},
        bar: {}
    }
});

var initial = { foo: 1, bar: 2, baz: 3};

initial = validate.build(initial, { additionalProperties: false });

console.log(initial);   // { foo: 1, bar: 2, baz: 3 }
```

NOTE: When `{ additionalProperties: false, copy: false }` is specified in the `build` options, any additional properties will be deleted from the initial data object.

In some scenarios, you may want to disallow additional properties in the schema, but still keep them when gathering default values with `build()`. This may be required, for example, when you want to explicitly fail validation and display a message to the user, listing any excessive properties that are forbidden by the schema. Setting `{ additionalProperties: 'always' }` will prevent the `build()` function from removing any properties in the initial object.

```javascript
var schema = {
        additionalProperties: false,
        properties: {
            foo: {}
        }
    };
var initial = { foo: 1, bar: 2 };
var validate = jsen(schema);

var withDefaults = validate.build(initial, { additionalProperties: 'always' });
// withDefaults has both 'foo' and 'bar' keys
```

## In-Browser Usage

Browser-compatible builds of `jsen` (with the help of [browserify](http://npmjs.com/package/browserify)) can be found in the `dist` folder. These are built with the [standalone](https://github.com/substack/browserify-handbook#standalone) option of browserify, meaning they will work in node, the browser with globals, and AMD loader environments. In the browser, the `window.jsen` global object will refer to the validator builder function.

Load from CDN, courtesy of [rawgit](https://rawgit.com/):

```
//cdn.rawgit.com/bugventure/jsen/v0.6.6/dist/jsen.js
//cdn.rawgit.com/bugventure/jsen/v0.6.6/dist/jsen.min.js
```

## Tests

To run [mocha][mocha] tests in node:

```bash
[~/github/jsen] $ npm test
```

To run the same test suite in the browser, serve the `test/index.html` page in your node web server and navitate to `/test/` path from your browser. The example below uses [node-static](https://www.npmjs.com/package/node-static):

```bash
[~/github/jsen] $ npm install -g node-static
...
[~/github/jsen] $ static .
serving "." at http://127.0.0.1:8080
# navigate to http://127.0.0.1:8080/test/ in your browser
```

`jsen` passes all draft 4 test cases specified by the [JSON-Schema-Test-Suite](https://github.com/json-schema/JSON-Schema-Test-Suite) with the exception of zero-terminated float tests.

Source code coverage is provided by [istanbul][istanbul] and visible on [coveralls.io][coveralls-url].

## Contributing

To contribute to the project, fork the repo, edit and send a Pull Request. Please adhere to the coding guidelines enforced by the [jshint](https://github.com/bugventure/jsen/blob/master/.jshintrc) and [jscs](https://github.com/bugventure/jsen/blob/master/.jscsrc) code checkers.

```bash
[~/github/jsen] $ jshint lib/ && jscs lib/
No code style errors found.
```

All tests must pass both in node and in the browser.

```bash
[~/github/jsen] $ npm test
```

To build the jsen browser-compatible distribution files, run:

```bash
[~/github/jsen] $ npm run build
```

This will update the files in the `/dist` folder.

## Issues

Please submit issues to the [jsen issue tracker in GitHub](https://github.com/bugventure/jsen/issues).

## Changelog

Read [changelog.md](changelog.md)

## License

[MIT](LICENSE)

[jsen-web]: http://bugventure.github.io/jsen
[jsen-img]: http://bugventure.github.io/jsen/assets/images/jsen.png
[jsen-web-badge]: https://img.shields.io/badge/www-github.io/jsen-40babd.svg
[travis-url]: https://travis-ci.org/bugventure/jsen
[travis-img]: https://travis-ci.org/bugventure/jsen.svg?branch=master
[npm-url]: https://www.npmjs.org/package/jsen
[npm-img]: https://nodei.co/npm/jsen.png?downloads=true
[downloads-img]: http://img.shields.io/npm/dm/jsen.svg
[coveralls-img]: https://img.shields.io/coveralls/bugventure/jsen.svg
[coveralls-url]: https://coveralls.io/r/bugventure/jsen
[istanbul]: https://www.npmjs.org/package/istanbul
[mocha]: http://mochajs.org/
[testling-img]: https://ci.testling.com/bugventure/jsen.png
[testling-url]: https://ci.testling.com/bugventure/jsen