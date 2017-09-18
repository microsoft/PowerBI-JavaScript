## Changelog

### v0.6.6
* Fix browser build not updated to latest bits (#82)

### v0.6.5
* Fix schema bug with type "integer" and keywords "maximum" and/or "minimum" (#74)
* Fix broken required field validation when schema contains properties, but no sub-schema for required property (#81)

### v0.6.4
* `minLength` and `maxLength` keywords now properly calculate character length of Unicode surrogate pairs (#58)
* Add support for scope dereferencing with the `id` keyword (#70)
* Add support for remote schema references specified in the `schemas` option (#69)
* Enable full unit test support in the browser and add testling badge (#71)
* Improve performance - code generation and compiled validator execution (#73)
* Fix broken path values in error objects for some property names (#72)

### v0.6.3

* Add support for `build({ additionalProperties: 'always'})` (#60)
* Add `error.additionalProperties` that specify forbidden property keys (#54)
* Add support for NetSuite (#63)
* Fix schema validation gives a false positive when the type keyword does not specify a valid type string (#52)
* Fix validation error with arrays and oneOf (#55)
* Fix validation error when using the additionalProperties keyword (#56)
* Fix requiredMessage doesnt work when referencing external schema files (#51)

### v0.6.1

* Fix various RegExp escaping issues in node v4.0 and above (#47)
* Fix build() function doesn't apply default values or remove additional properties when using 'allOf' keyword (#40)
* Make $ref resolving conform strictly to JSON Pointer spec (#49)
* Fix errors resolving nested $refs (#50)

### v0.6.0

* Add an option to ignore missing references (#37)
* Performance improvement (#35)

### v0.5.0

* Add greedy mode (#32, #33)

### v0.4.1

* Fix recursive calls to the same cached $ref validator resets the errors array (#30)

### v0.4.0

* Add external schema references (#20)
* Fix cloning Date objects is broken in Firefox (#26)
* Fix broken tests under IE9 (#27)
* Fix `npm test` command to run mocha from the local node_modules

### v0.3.2

* Add in-browser support out of the box (#23)
* Fix broken inlining of regular expressions containing forward slashes when running in the browser (#25)

### v0.3.1

* Add support for IE8

### v0.3.0

* Add support for default value population (#10)
* Add support for custom messages per keyword (#18)

### v0.2.0

* Add support for custom format validators (#8, #9)
* Add support for validating javascipt Date objects (#17)

### v0.1.2

* Fix cannot dereference schema when ids change resolution scope (#14)

### v0.1.1

* Fix broken inlining of regular expressions containing slashes (#15)
* Fix code generation breaks when object properties in schema are not valid identifiers (#16)

### v0.1.0

* Custom error messages defined in the schema
* Append the required property name to the path in the error object for `required` and `dependencies` keywords (#7)
* Fix protocol-relative URIs are marked invalid (#13)
* Update [JSON-Schema-Test-Suite](https://github.com/json-schema/JSON-Schema-Test-Suite) tests (#12)

### v0.0.5

* Improve generated validation code (#4)
* Fail fast (#4)
* Error reporting (#5)
* Reduce the performance impact of logging validation errors (#4)

### v0.0.4

* Fix `multipleOf` doesn't validate data for decimal points (#1)

### v0.0.3

* Optimize performance of runtime code generation
* Optimize performance of generated code