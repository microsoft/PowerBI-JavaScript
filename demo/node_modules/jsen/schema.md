A Short Guide to JSON Schema
=================

This document provides a short introduction guide to [JSON Schema](http://json-schema.org/) and is based on the version 4 of the JSON Schema draft.

### Table of Contents

<!-- MarkdownTOC -->

- [JSON Schema](#json-schema)
- [Keywords](#keywords)
- [Type Validation](#type-validation)
    - [`string`](#string)
    - [`number`](#number)
    - [`integer`](#integer)
    - [`boolean`](#boolean)
    - [`object`](#object)
    - [`array`](#array)
    - [`null`](#null)
    - [`any`](#any)
- [Multi Schema Validation & Negation](#multi-schema-validation--negation)
    - [`allOf`](#allof)
    - [`anyOf`](#anyof)
    - [`oneOf`](#oneof)
    - [`not`](#not)
- [Schema Reference Using `$ref`](#schema-reference-using-ref)
- [Value Equality](#value-equality)
- [Further Reading](#further-reading)

<!-- /MarkdownTOC -->


## JSON Schema

A JSON schema is a JSON object that specifies the type and structure of another JSON object or value. In JavaScript runtime environments, a JSON object can be represented by a JavaScript object literal. This guide uses the terms JSON object and JavaScript object interchangeably. Here are some valid schema objects:

Schema | Matches
------ | -------
`{}` | any value
`{ type: 'string' }` | a JavaScript string
`{ type: 'number' } ` | a JavaScript number
`{ type: ['string', 'null'] }` | either a string or `null`
`{ type: 'object' }` | a JavaScript object
`{ type: 'array', items: { type: 'string' } }` | an array containing strings

A JSON schema describes a JSON object through a set of keywords. These keywords specify the format the target JSON object must fit into.

## Keywords

A schema is a JSON object whose members are `keywords` as specified by the JSON Schema spec. The following table lists all validation keywords supported by [JSON Schema v4](http://json-schema.org/documentation.html).

Column `Type` specifies the type of the valid values for this keyword.
Column `Target Type` specifies the type of the validated JSON object, for which validation applies according to the specified keyword.

Keyword | Type | Target Type | Description
------- | ---- | ----------- | -----------
`type` | `string` `array` | `any` | Defines the primitive type of a JSON object. See [Type Validation](#type-validation).
`enum` | `array [of any]` | `any` | Enumerates the set of values a JSON object may equal. See [Value Equality](#value-equality).
`minimum` | `number` | `number` `integer` | Specifies the minimum value of a numeric JSON value.
`exclusiveMinimum` | `boolean` | `number` `integer` | Specifies inclusive or exclusive minimum value. Default: `false`.
`maximum` | `number` | `number` `integer` | Specifies the maximum value of a numeric JSON value.
`exclusiveMaximum` | `boolean` | `number` `integer` | Specifies inclusive or exclusive maximum value. Default: `false`
`multipleOf` | `number` | `number` `integer` | Specifies the value to divide by to check if a numeric JSON value is divisible by that number (result of division is an integer).
`minLength` | `integer` | `string` | Specifies the minimum required length of a JSON string value.
`maxLength` | `integer` | `string` | Specifies the maximum required length of a JSON string value.
`pattern` | `string` | `string` | Specifies the regular expression pattern to match a string JSON value against.
`format` | `string` | `string` | Specifies the format a valid JSON string value must conform to. See [Format Validation](README.md#format-validation)
`minItems` | `integer` | `array` | Specifies the minimum number of items a JSON array must contain.
`maxItems` | `integer` | `array` | Specifies the maximum number of items a JSON array must contain.
`additionalItems` | `boolean` | `array` | Specifies whether a JSON array is allowed to have additional items other than specified by the `items` keyword. Default: `true`.
`uniqueItems` | `boolean` | `array` | Specifies whether items in a JSON array must be unique. See [Value Equality](#value-equality). Default: `false`.
`items` | `array` `object` | `array` | Ala bala
`maxProperties` | `integer` | `object` | Specifies the maximum number of properties a JSON object can contain.
`minProperties` | `integer` | `object` | Specifies the minimum number of properties a JSON object must contain.
`required` | `array [of string]` | `object` | Specifies the names of the properties a JSON object must contain.
`properties` | `object` | `object` | Specifies the child properties (as keys) and the respective JSON schemas (as values) a JSON object must conform to.
`patternProperties` | `object` | `object` | Specifies the patterns (as keys) and the respective JSON schemas (as values) a JSON object's keys and values must conform to, respectively.
`additionalProperties` | `boolean` `object` | `object` | If `false`, no additional properties (besides the ones specified by `properties` and `patternProperties`) are allowed in a JSON object. If set to an `object`, specifies the schema to which a JSON object's additional properties must conform to. Default: `true`.
`dependencies` | `array [of object]` | `object` | Specifies the property dependencies a JSON object must conform to. See [`object`](#object).
`allOf` | `array [of object]` | `any` | JSON value must conform to all specified schemas. See [Multi Schema Validation & Negation](#multi-schema-validation--negation).
`anyOf` | `array [of object]` | `any` | JSON value must conform to at least one of the specified schemas. See [Multi Schema Validation & Negation](#multi-schema-validation--negation).
`oneOf` | `array [of object]` | `any` | JSON value must conform to at most one of the specified schemas. See [Multi Schema Validation & Negation](#multi-schema-validation--negation).
`not` | `object` | `any` | JSON value must not conform the specified schema. See [Multi Schema Validation & Negation](#multi-schema-validation--negation).
`$ref` | `string` | `any` | Specifies a reference to a JSON schema a JSON value must conform to. See [Schema Reference Using `$ref`](#schema-reference-using-ref).


## Type Validation

### `string`

```javascript
{
    type: 'string',     // match a string
    minLength: 3,       // with minimum length 3 characters
    maxLength: 10,      // with maximum length 10 character
    pattern: '^\\w$'    // matching the regex /^\w$/
}
```


### `number`

```javascript
{
    type: 'number',         // match a number
    minimum: 0,             // with minimum value 0
    maximum: 10,            // with maximum value 10
    exclusiveMinimum: true, // exclude the min value (default: false)
    exclusiveMaximum: true, // exclude the max value (default: false)
    multipleOf: 2           // the number must be a multiple of 2
}
```

### `integer`

Same as `number`, but matches integers only.

```javascript
{
    type: 'integer',        // match an integer number
    minimum: 0,             // with minimum value 0
    maximum: 10,            // with maximum value 10
    exclusiveMinimum: true, // exclude the min value (default: false)
    exclusiveMaximum: true, // exclude the max value (default: false)
    multipleOf: 2           // the number must be a multiple of 2
}
```

### `boolean`

```javascript
{
    type: 'boolean'     // match a Boolean value
}
```

### `object`

```javascript
{
    type: 'object',                     // match a JavaScript object
    minProperties: 2,                   // having at least 2 properties
    maxProperties: 5,                   // and at most 5 properties
    required: ['id', 'name'],           // where `id` and `name` are required
    properties: {                       // and the properties are as follows
        id: { type: 'string' },
        name: { type: 'string' },
        price: { 
            type: 'number',
            mininum: 0
        },
        available: { type: 'boolean' }
    },
    patternProperties: {                // with additional properties, where
        '^unit-\w+$': {                 // the keys match the given regular
            type: 'number',             // expression and the values are
            minimum: 0                  // numbers with minimum value of 0
        }                               
    },
    additionalProperties: false         // do not allow any other properties
}                                       // (default: true)
```

Alternatively `additionalProperties` can be an object defining a schema, where each additional property must conform to the specified schema.

```javascript
{
    type: 'object',             // match a JavaScript object
    additionalProperties: {     // with all properties containing
        type: 'string'          // string values
    }
}
```

You can additionally specify `dependencies` in an object schema. There are two types of dependencies:

1. property dependency

    ```javascript
    {
        type: 'object',             // if `price` is defined, then
        dependencies: {             // these two must also be defined
            price: ['unitsInStock', 'quantityPerUnit']
        }
    }
    ```

2. schema dependency
    
    ``` javascript
    {
        type: 'object',
        dependencies: {                     // if `price` is defined,
            price: {                        // then the object must also
                type: 'object',             // match the specified schema
                properties: {
                    unitsInStock: {
                        type: 'integer',
                        minimum: 0
                    }
                }
            }
        }
    }
    ```

### `array`

```javascript
{
    type: 'array',          // match a JavaScript array
    minItems: 1,            // with minimum 1 item
    maxItems: 5,            // and maximum 5 items
    uniqueItems: true,      // where items are unique
    items: {                // and each item is a number
        type: 'number'
    }
}
```

Alternatively, you can specify multiple item schemas for positional matching.

```javascript
{
    type: 'array',              // match a JavaScript array
    items: [                    // containing exactly 3 items
        { type: 'string' },     // where first item is a string
        { type: 'number' },     // and second item is a number
        { type: 'boolean' }     // and third item is a Boolean value
    ]
}
```

### `null`

```javascript
{
    type: 'null'    // match a null value
}
```

### `any`

```javascript
{
    type: 'any'     // equivalent to `{}` (matches any value)
}
```

## Multi Schema Validation & Negation

### `allOf`

```javascript
{
    allOf: [                    // match a number conforming to both schemas,
        {                       // i.e. a numeric value between 3 and 5
            type: 'number',
            minimum: 0,
            maximum: 5
        },
        { 
            type: 'number',
            minimum: 3,
            maximum: 10
        }
    ]
}
```

### `anyOf`

```javascript
{
    anyOf: [                    // match either a string or a number
        { type: 'string' },
        { type: 'number' }
    ]
}
```

### `oneOf`

```javascript
{
    oneOf: [                    // match exacly one of those schemas,
        {                       // i.e. a number that is less than 3
            type: 'number',     // or greater than 5, 
            maximum: 52         // but not between 3 and 5
        },
        { 
            type: 'number', 
            minimum: 3 
        }
    ]
}
```

### `not`

```javascript
{
    not: {                  // match a value that is not a JavaScript object
        type: 'object'
    }
}
```

## Schema Reference Using `$ref`

You can refer to types defined in other parts of the schema using the `$ref` property. This approach is often combined with the `definitions` section in the schema that contains reusable schema definitions.

```javascript
{
    type: 'array',                              // match an array containing
    items: {                                    // items that are positive
        $ref: '#/definitions/positiveInteger'   // integers
    },
    definitions: {
        positiveInteger: {
            type: 'integer',
            minimum: 0,
            exclusiveMinimum: true
        }
    }
}
```

Using references, it becomes possible to validate complex object graphs using recursive schema definitions. For example, the validator itself validates the user schema against the [JSON meta-schema](http://json-schema.org/schema).

## Value Equality

According to the [JSON Schema spec](http://json-schema.org/latest/json-schema-core.html#anchor9), two JSON values are equal if and only if:

* both are `null`s; or
* both are `boolean`s and have the same value; or
* both are `string`s and have the same value; or
* both are `number`s and have the same mathematical value; or
* both are `array`s and:
    - have the same number of items; and
    - items at the same index are equal according to this definition; or
* both are objects and:
    - have the same set of property names; and
    - values for a same property name are equal according to this definition.

## Further Reading

* [Understanding JSON Schema](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf)
* [The JSON Schema Spec](http://json-schema.org/)