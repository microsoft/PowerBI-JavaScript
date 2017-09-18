'use strict';

var REGEX_ESCAPE_EXPR = /[\/]/g,
    STR_ESCAPE_EXPR = /(")/gim,
    VALID_IDENTIFIER_EXPR = /^[a-z_$][0-9a-z]*$/gi,
    INVALID_SCHEMA = 'jsen: invalid schema object',
    browser = typeof window === 'object' && !!window.navigator,   // jshint ignore: line
    regescape = new RegExp('/').source !== '/', // node v0.x does not properly escape '/'s in inline regex
    func = require('./func.js'),
    equal = require('./equal.js'),
    unique = require('./unique.js'),
    SchemaResolver = require('./resolver.js'),
    formats = require('./formats.js'),
    ucs2length = require('./ucs2length.js'),
    types = {},
    keywords = {};

function inlineRegex(regex) {
    regex = regex instanceof RegExp ? regex : new RegExp(regex);

    return regescape ?
        regex.toString() :
        '/' + regex.source.replace(REGEX_ESCAPE_EXPR, '\\$&') + '/';
}

function encodeStr(str) {
    return '"' + str.replace(STR_ESCAPE_EXPR, '\\$1') + '"';
}

function appendToPath(path, key) {
    VALID_IDENTIFIER_EXPR.lastIndex = 0;

    return VALID_IDENTIFIER_EXPR.test(key) ?
        path + '.' + key :
        path + '[' + encodeStr(key) + ']';
}

function type(obj) {
    if (obj === undefined) {
        return 'undefined';
    }

    var str = Object.prototype.toString.call(obj);
    return str.substr(8, str.length - 9).toLowerCase();
}

function isInteger(obj) {
    return (obj | 0) === obj;   // jshint ignore: line
}

types['null'] = function (path) {
    return path + ' === null';
};

types.boolean = function (path) {
    return 'typeof ' + path + ' === "boolean"';
};

types.string = function (path) {
    return 'typeof ' + path + ' === "string"';
};

types.number = function (path) {
    return 'typeof ' + path + ' === "number"';
};

types.integer = function (path) {
    return 'typeof ' + path + ' === "number" && !(' + path + ' % 1)';
};

types.array = function (path) {
    return 'Array.isArray(' + path + ')';
};

types.object = function (path) {
    return 'typeof ' + path + ' === "object" && ' + path + ' !== null && !Array.isArray(' + path + ')';
};

types.date = function (path) {
    return path + ' instanceof Date';
};

keywords.enum = function (context) {
    var arr = context.schema['enum'];

    context.code('if (!equalAny(' + context.path + ', ' + JSON.stringify(arr) + ')) {');
    context.error('enum');
    context.code('}');
};

keywords.minimum = function (context) {
    if (typeof context.schema.minimum === 'number') {
        context.code('if (' + context.path + ' < ' + context.schema.minimum + ') {');
        context.error('minimum');
        context.code('}');
    }
};

keywords.exclusiveMinimum = function (context) {
    if (context.schema.exclusiveMinimum === true && typeof context.schema.minimum === 'number') {
        context.code('if (' + context.path + ' === ' + context.schema.minimum + ') {');
        context.error('exclusiveMinimum');
        context.code('}');
    }
};

keywords.maximum = function (context) {
    if (typeof context.schema.maximum === 'number') {
        context.code('if (' + context.path + ' > ' + context.schema.maximum + ') {');
        context.error('maximum');
        context.code('}');
    }
};

keywords.exclusiveMaximum = function (context) {
    if (context.schema.exclusiveMaximum === true && typeof context.schema.maximum === 'number') {
        context.code('if (' + context.path + ' === ' + context.schema.maximum + ') {');
        context.error('exclusiveMaximum');
        context.code('}');
    }
};

keywords.multipleOf = function (context) {
    if (typeof context.schema.multipleOf === 'number') {
        var mul = context.schema.multipleOf,
            decimals = mul.toString().length - mul.toFixed(0).length - 1,
            pow = decimals > 0 ? Math.pow(10, decimals) : 1,
            path = context.path;

        if (decimals > 0) {
            context.code('if (+(Math.round((' + path + ' * ' + pow + ') + "e+" + ' + decimals + ') + "e-" + ' + decimals + ') % ' + (mul * pow) + ' !== 0) {');
        } else {
            context.code('if (((' + path + ' * ' + pow + ') % ' + (mul * pow) + ') !== 0) {');
        }

        context.error('multipleOf');
        context.code('}');
    }
};

keywords.minLength = function (context) {
    if (isInteger(context.schema.minLength)) {
        context.code('if (ucs2length(' + context.path + ') < ' + context.schema.minLength + ') {');
        context.error('minLength');
        context.code('}');
    }
};

keywords.maxLength = function (context) {
    if (isInteger(context.schema.maxLength)) {
        context.code('if (ucs2length(' + context.path + ') > ' + context.schema.maxLength + ') {');
        context.error('maxLength');
        context.code('}');
    }
};

keywords.pattern = function (context) {
    var pattern = context.schema.pattern;

    if (typeof pattern === 'string' || pattern instanceof RegExp) {
        context.code('if (!(' + inlineRegex(pattern) + ').test(' + context.path + ')) {');
        context.error('pattern');
        context.code('}');
    }
};

keywords.format = function (context) {
    if (typeof context.schema.format !== 'string' || !formats[context.schema.format]) {
        return;
    }

    context.code('if (!(' + formats[context.schema.format] + ').test(' + context.path + ')) {');
    context.error('format');
    context.code('}');
};

keywords.minItems = function (context) {
    if (isInteger(context.schema.minItems)) {
        context.code('if (' + context.path + '.length < ' + context.schema.minItems + ') {');
        context.error('minItems');
        context.code('}');
    }
};

keywords.maxItems = function (context) {
    if (isInteger(context.schema.maxItems)) {
        context.code('if (' + context.path + '.length > ' + context.schema.maxItems + ') {');
        context.error('maxItems');
        context.code('}');
    }
};

keywords.additionalItems = function (context) {
    if (context.schema.additionalItems === false && Array.isArray(context.schema.items)) {
        context.code('if (' + context.path + '.length > ' + context.schema.items.length + ') {');
        context.error('additionalItems');
        context.code('}');
    }
};

keywords.uniqueItems = function (context) {
    if (context.schema.uniqueItems) {
        context.code('if (unique(' + context.path + ').length !== ' + context.path + '.length) {');
        context.error('uniqueItems');
        context.code('}');
    }
};

keywords.items = function (context) {
    var index = context.declare(0),
        i = 0;

    if (type(context.schema.items) === 'object') {
        context.code('for (' + index + ' = 0; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');

        context.descend(context.path + '[' + index + ']', context.schema.items);

        context.code('}');
    }
    else if (Array.isArray(context.schema.items)) {
        for (; i < context.schema.items.length; i++) {
            context.code('if (' + context.path + '.length - 1 >= ' + i + ') {');

            context.descend(context.path + '[' + i + ']', context.schema.items[i]);

            context.code('}');
        }

        if (type(context.schema.additionalItems) === 'object') {
            context.code('for (' + index + ' = ' + i + '; ' + index + ' < ' + context.path + '.length; ' + index + '++) {');

            context.descend(context.path + '[' + index + ']', context.schema.additionalItems);

            context.code('}');
        }
    }
};

keywords.maxProperties = function (context) {
    if (isInteger(context.schema.maxProperties)) {
        context.code('if (Object.keys(' + context.path + ').length > ' + context.schema.maxProperties + ') {');
        context.error('maxProperties');
        context.code('}');
    }
};

keywords.minProperties = function (context) {
    if (isInteger(context.schema.minProperties)) {
        context.code('if (Object.keys(' + context.path + ').length < ' + context.schema.minProperties + ') {');
        context.error('minProperties');
        context.code('}');
    }
};

keywords.required = function (context) {
    var required = context.schema.required,
        properties = context.schema.properties,
        i;

    if (!Array.isArray(required)) {
        return;
    }

    for (i = 0; i < required.length; i++) {
        if (properties && properties[required[i]] && typeof properties[required[i]] === 'object') {
            continue;
        }

        context.code('if (' + appendToPath(context.path, required[i]) + ' === undefined) {');
        context.error('required', required[i]);
        context.code('}');
    }
};

keywords.properties = function (context) {
    var props = context.schema.properties,
        propKeys = type(props) === 'object' ? Object.keys(props) : [],
        required = Array.isArray(context.schema.required) ? context.schema.required : [],
        prop, i, nestedPath;

    if (!propKeys.length) {
        return;
    }

    for (i = 0; i < propKeys.length; i++) {
        prop = propKeys[i];
        nestedPath = appendToPath(context.path, prop);

        context.code('if (' + nestedPath + ' !== undefined) {');

        context.descend(nestedPath, props[prop]);

        context.code('}');

        if (required.indexOf(prop) > -1) {
            context.code('else {');
            context.error('required', prop);
            context.code('}');
        }
    }
};

keywords.patternProperties = keywords.additionalProperties = function (context) {
    var propKeys = type(context.schema.properties) === 'object' ?
            Object.keys(context.schema.properties) : [],
        patProps = context.schema.patternProperties,
        patterns = type(patProps) === 'object' ? Object.keys(patProps) : [],
        addProps = context.schema.additionalProperties,
        addPropsCheck = addProps === false || type(addProps) === 'object',
        props, keys, key, n, found, pattern, i;

    if (!patterns.length && !addPropsCheck) {
        return;
    }

    keys = context.declare('[]');
    key = context.declare('""');
    n = context.declare(0);

    if (addPropsCheck) {
        found = context.declare(false);
    }

    context.code(keys + ' = Object.keys(' + context.path + ')');

    context.code('for (' + n + ' = 0; ' + n + ' < ' + keys + '.length; ' + n + '++) {')
        (key + ' = ' + keys + '[' + n + ']')

        ('if (' + context.path + '[' + key + '] === undefined) {')
            ('continue')
        ('}');

    if (addPropsCheck) {
        context.code(found + ' = false');
    }

    // validate pattern properties
    for (i = 0; i < patterns.length; i++) {
        pattern = patterns[i];

        context.code('if ((' + inlineRegex(pattern) + ').test(' + key + ')) {');

        context.descend(context.path + '[' + key + ']', patProps[pattern]);

        if (addPropsCheck) {
            context.code(found + ' = true');
        }

        context.code('}');
    }

    // validate additional properties
    if (addPropsCheck) {
        if (propKeys.length) {
            props = context.declare(JSON.stringify(propKeys));

            // do not validate regular properties
            context.code('if (' + props + '.indexOf(' + key + ') > -1) {')
                ('continue')
            ('}');
        }

        context.code('if (!' + found + ') {');

        if (addProps === false) {
            // do not allow additional properties
            context.error('additionalProperties', undefined, key);
        }
        else {
            // validate additional properties
            context.descend(context.path + '[' + key + ']', addProps);
        }

        context.code('}');
    }

    context.code('}');
};

keywords.dependencies = function (context) {
    if (type(context.schema.dependencies) !== 'object') {
        return;
    }

    var depKeys = Object.keys(context.schema.dependencies),
        len = depKeys.length,
        key, dep, i = 0, k = 0;

    for (; k < len; k++) {
        key = depKeys[k];
        dep = context.schema.dependencies[key];

        context.code('if (' + appendToPath(context.path, key) + ' !== undefined) {');

        if (type(dep) === 'object') {
            //schema dependency
            context.descend(context.path, dep);
        }
        else {
            // property dependency
            for (i; i < dep.length; i++) {
                context.code('if (' + appendToPath(context.path, dep[i]) + ' === undefined) {');
                context.error('dependencies', dep[i]);
                context.code('}');
            }
        }

        context.code('}');
    }
};

keywords.allOf = function (context) {
    if (!Array.isArray(context.schema.allOf)) {
        return;
    }

    for (var i = 0; i < context.schema.allOf.length; i++) {
        context.descend(context.path, context.schema.allOf[i]);
    }
};

keywords.anyOf = function (context) {
    if (!Array.isArray(context.schema.anyOf)) {
        return;
    }

    var greedy = context.greedy,
        errCount = context.declare(0),
        initialCount = context.declare(0),
        found = context.declare(false),
        i = 0;

    context.code(initialCount + ' = errors.length');

    for (; i < context.schema.anyOf.length; i++) {
        context.code('if (!' + found + ') {');

        context.code(errCount + ' = errors.length');

        context.greedy = true;

        context.descend(context.path, context.schema.anyOf[i]);

        context.code(found + ' = errors.length === ' + errCount)
        ('}');
    }

    context.greedy = greedy;

    context.code('if (!' + found + ') {');

    context.error('anyOf');

    context.code('} else {')
        ('errors.length = ' + initialCount)
    ('}');
};

keywords.oneOf = function (context) {
    if (!Array.isArray(context.schema.oneOf)) {
        return;
    }

    var greedy = context.greedy,
        matching = context.declare(0),
        initialCount = context.declare(0),
        errCount = context.declare(0),
        i = 0;

    context.code(initialCount + ' = errors.length');
    context.code(matching + ' = 0');

    for (; i < context.schema.oneOf.length; i++) {
        context.code(errCount + ' = errors.length');

        context.greedy = true;

        context.descend(context.path, context.schema.oneOf[i]);

        context.code('if (errors.length === ' + errCount + ') {')
            (matching + '++')
        ('}');
    }

    context.greedy = greedy;

    context.code('if (' + matching + ' !== 1) {');

    context.error('oneOf');

    context.code('} else {')
        ('errors.length = ' + initialCount)
    ('}');
};

keywords.not = function (context) {
    if (type(context.schema.not) !== 'object') {
        return;
    }

    var greedy = context.greedy,
        errCount = context.declare(0);

    context.code(errCount + ' = errors.length');

    context.greedy = true;

    context.descend(context.path, context.schema.not);

    context.greedy = greedy;

    context.code('if (errors.length === ' + errCount + ') {');

    context.error('not');

    context.code('} else {')
        ('errors.length = ' + errCount)
    ('}');
};

function decorateGenerator(type, keyword) {
    keywords[keyword].type = type;
    keywords[keyword].keyword = keyword;
}

['minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', 'multipleOf']
    .forEach(decorateGenerator.bind(null, 'number'));

['minLength', 'maxLength', 'pattern', 'format']
    .forEach(decorateGenerator.bind(null, 'string'));

['minItems', 'maxItems', 'additionalItems', 'uniqueItems', 'items']
    .forEach(decorateGenerator.bind(null, 'array'));

['maxProperties', 'minProperties', 'required', 'properties', 'patternProperties', 'additionalProperties', 'dependencies']
    .forEach(decorateGenerator.bind(null, 'object'));

['enum', 'allOf', 'anyOf', 'oneOf', 'not']
    .forEach(decorateGenerator.bind(null, null));

function groupKeywords(schema) {
    var keys = Object.keys(schema),
        patIndex = keys.indexOf('patternProperties'),
        ret = {
            enum: Array.isArray(schema.enum) && schema.enum.length > 0,
            type: null,
            allType: [],
            perType: {}
        },
        key, gen, i;

    if (schema.type) {
        if (typeof schema.type === 'string') {
            ret.type = [schema.type];
        }
        else if (Array.isArray(schema.type) && schema.type.length) {
            ret.type = schema.type.slice(0);
        }
    }

    for (i = 0; i < keys.length; i++) {
        key = keys[i];

        if (key === 'enum' || key === 'type') {
            continue;
        }

        gen = keywords[key];

        if (!gen) {
            continue;
        }

        if (gen.type) {
            if (!ret.perType[gen.type]) {
                ret.perType[gen.type] = [];
            }

            if (!(patIndex > -1 && key === 'additionalProperties')) {
                ret.perType[gen.type].push(key);
            }
        }
        else {
            ret.allType.push(key);
        }
    }

    return ret;
}

function getPathExpression(path, key) {
    var path_ = path.substr(4),
        len = path_.length,
        tokens = [],
        token = '',
        isvar = false,
        char, i;

    for (i = 0; i < len; i++) {
        char = path_[i];

        switch (char) {
            case '.':
                if (token) {
                    token += char;
                }
                break;
            case '[':
                if (isNaN(+path_[i + 1])) {
                    isvar = true;

                    if (token) {
                        tokens.push('"' + token + '"');
                        token = '';
                    }
                }
                else {
                    isvar = false;

                    if (token) {
                        token += '.';
                    }
                }
                break;
            case ']':
                tokens.push(isvar ? token : '"' + token + '"');
                token = '';
                break;
            default:
                token += char;
        }
    }

    if (token) {
        tokens.push('"' + token + '"');
    }

    if (key) {
        tokens.push('"' + key + '"');
    }

    if (tokens.length === 1 && isvar) {
        return '"" + ' + tokens[0] + ' + ""';
    }

    return tokens.join(' + "." + ') || '""';
}

function clone(obj) {
    var cloned = obj,
        objType = type(obj),
        keys, len, key, i;

    if (objType === 'object') {
        cloned = {};
        keys = Object.keys(obj);

        for (i = 0, len = keys.length; i < len; i++) {
            key = keys[i];
            cloned[key] = clone(obj[key]);
        }
    }
    else if (objType === 'array') {
        cloned = [];

        for (i = 0, len = obj.length; i < len; i++) {
            cloned[i] = clone(obj[i]);
        }
    }
    else if (objType === 'regexp') {
        return new RegExp(obj);
    }
    else if (objType === 'date') {
        return new Date(obj.toJSON());
    }

    return cloned;
}

function equalAny(obj, options) {
    for (var i = 0, len = options.length; i < len; i++) {
        if (equal(obj, options[i])) {
            return true;
        }
    }

    return false;
}

function PropertyMarker() {
    this.objects = [];
    this.properties = [];
}

PropertyMarker.prototype.mark = function (obj, key) {
    var index = this.objects.indexOf(obj),
        prop;

    if (index < 0) {
        this.objects.push(obj);

        prop = {};
        prop[key] = 1;

        this.properties.push(prop);

        return;
    }

    prop = this.properties[index];

    prop[key] = prop[key] ? prop[key] + 1 : 1;
};

PropertyMarker.prototype.deleteDuplicates = function () {
    var props, keys, key, i, j;

    for (i = 0; i < this.properties.length; i++) {
        props = this.properties[i];
        keys = Object.keys(props);

        for (j = 0; j < keys.length; j++) {
            key = keys[j];

            if (props[key] > 1) {
                delete this.objects[i][key];
            }
        }
    }
};

PropertyMarker.prototype.dispose = function () {
    this.objects.length = 0;
    this.properties.length = 0;
};

function build(schema, def, additional, resolver, parentMarker) {
    var defType, defValue, key, i, propertyMarker, props, defProps;

    if (type(schema) !== 'object') {
        return def;
    }

    schema = resolver.resolve(schema);

    if (def === undefined && schema.hasOwnProperty('default')) {
        def = clone(schema['default']);
    }

    defType = type(def);

    if (defType === 'object' && type(schema.properties) === 'object') {
        props = Object.keys(schema.properties);

        for (i = 0; i < props.length; i++) {
            key = props[i];
            defValue = build(schema.properties[key], def[key], additional, resolver);

            if (defValue !== undefined) {
                def[key] = defValue;
            }
        }

        if (additional !== 'always') {
            defProps = Object.keys(def);

            for (i = 0; i < defProps.length; i++) {
                key = defProps[i];

                if (props.indexOf(key) < 0 &&
                    (schema.additionalProperties === false ||
                    (additional === false && !schema.additionalProperties))) {

                    if (parentMarker) {
                        parentMarker.mark(def, key);
                    }
                    else {
                        delete def[key];
                    }
                }
            }
        }
    }
    else if (defType === 'array' && schema.items) {
        if (type(schema.items) === 'array') {
            for (i = 0; i < schema.items.length; i++) {
                defValue = build(schema.items[i], def[i], additional, resolver);

                if (defValue !== undefined || i < def.length) {
                    def[i] = defValue;
                }
            }
        }
        else if (def.length) {
            for (i = 0; i < def.length; i++) {
                def[i] = build(schema.items, def[i], additional, resolver);
            }
        }
    }
    else if (type(schema.allOf) === 'array' && schema.allOf.length) {
        propertyMarker = new PropertyMarker();

        for (i = 0; i < schema.allOf.length; i++) {
            def = build(schema.allOf[i], def, additional, resolver, propertyMarker);
        }

        propertyMarker.deleteDuplicates();
        propertyMarker.dispose();
    }

    return def;
}

function ValidationContext(options) {
    this.path = 'data';
    this.schema = options.schema;
    this.formats = options.formats;
    this.greedy = options.greedy;
    this.resolver = options.resolver;
    this.id = options.id;
    this.funcache = options.funcache || {};
    this.scope = options.scope || {
        equalAny: equalAny,
        unique: unique,
        ucs2length: ucs2length,
        refs: {}
    };
}

ValidationContext.prototype.clone = function (schema) {
    var ctx = new ValidationContext({
        schema: schema,
        formats: this.formats,
        greedy: this.greedy,
        resolver: this.resolver,
        id: this.id,
        funcache: this.funcache,
        scope: this.scope
    });

    return ctx;
};

ValidationContext.prototype.declare = function (def) {
    var variname = this.id();
    this.code.def(variname, def);
    return variname;
};

ValidationContext.prototype.cache = function (cacheKey, schema) {
    var cached = this.funcache[cacheKey],
        context;

    if (!cached) {
        cached = this.funcache[cacheKey] = {
            key: this.id()
        };

        context = this.clone(schema);

        cached.func = context.compile(cached.key);

        this.scope.refs[cached.key] = cached.func;

        context.dispose();
    }

    return 'refs.' + cached.key;
};

ValidationContext.prototype.error = function (keyword, key, additional) {
    var schema = this.schema,
        path = this.path,
        errorPath = path !== 'data' || key ?
            '(path ? path + "." : "") + ' + getPathExpression(path, key) + ',' :
            'path,',
        res = key && schema.properties && schema.properties[key] ?
            this.resolver.resolve(schema.properties[key]) : null,
        message = res ? res.requiredMessage : schema.invalidMessage;

    if (!message) {
        message = (res && res.messages && res.messages[keyword]) ||
            (schema.messages && schema.messages[keyword]);
    }

    this.code('errors.push({');

    if (message) {
        this.code('message: ' + encodeStr(message) + ',');
    }

    if (additional) {
        this.code('additionalProperties: ' + additional + ',');
    }

    this.code('path: ' + errorPath)
        ('keyword: ' + encodeStr(keyword))
    ('})');

    if (!this.greedy) {
        this.code('return');
    }
};

ValidationContext.prototype.refactor = function (path, schema, cacheKey) {
    var parentPathExp = path !== 'data' ?
            '(path ? path + "." : "") + ' + getPathExpression(path) :
            'path',
        cachedRef = this.cache(cacheKey, schema),
        refErrors = this.declare();

    this.code(refErrors + ' = ' + cachedRef + '(' + path + ', ' + parentPathExp + ', errors)');

    if (!this.greedy) {
        this.code('if (errors.length) { return }');
    }
};

ValidationContext.prototype.descend = function (path, schema) {
    var origPath = this.path,
        origSchema = this.schema;

    this.path = path;
    this.schema = schema;

    this.generate();

    this.path = origPath;
    this.schema = origSchema;
};

ValidationContext.prototype.generate = function () {
    var path = this.path,
        schema = this.schema,
        context = this,
        scope = this.scope,
        encodedFormat,
        format,
        schemaKeys,
        typeKeys,
        typeIndex,
        validatedType,
        i;

    if (type(schema) !== 'object') {
        return;
    }

    if (schema.$ref !== undefined) {
        schema = this.resolver.resolve(schema);

        if (this.resolver.hasRef(schema)) {
            this.refactor(path, schema,
                this.resolver.getNormalizedRef(this.schema) || this.schema.$ref);

            return;
        }
        else {
            // substitute $ref schema with the resolved instance
            this.schema = schema;
        }
    }

    schemaKeys = groupKeywords(schema);

    if (schemaKeys.enum) {
        keywords.enum(context);

        return; // do not process the schema further
    }

    typeKeys = Object.keys(schemaKeys.perType);

    function generateForKeyword(keyword) {
        keywords[keyword](context);    // jshint ignore: line
    }

    var hasType = (schemaKeys.type && schemaKeys.type.length);
    if (hasType) {
        this.code('if (!(' + schemaKeys.type.map(function (type) {
            return types[type] ? types[type](path) : 'true';
        }).join(' || ') + ')) {');
        this.error('type');
        this.code('}');
    }

    for (i = 0; i < typeKeys.length; i++) {
        validatedType = typeKeys[i];

        this.code((hasType ? 'else ' : '') + 'if (' + types[validatedType](path) + ') {');

        schemaKeys.perType[validatedType].forEach(generateForKeyword);

        this.code('}');

        if (schemaKeys.type) {
            typeIndex = schemaKeys.type.indexOf(validatedType);

            if (typeIndex > -1) {
                schemaKeys.type.splice(typeIndex, 1);
            }
        }
    }

    if (schemaKeys.type && !schemaKeys.type.length) {
        this.code('else {');
        this.error('type');
        this.code('}');
    }

    schemaKeys.allType.forEach(function (keyword) {
        keywords[keyword](context);
    });

    if (schema.format && this.formats) {
        format = this.formats[schema.format];

        if (format) {
            if (typeof format === 'string' || format instanceof RegExp) {
                this.code('if (!(' + inlineRegex(format) + ').test(' + path + ')) {');
                this.error('format');
                this.code('}');
            }
            else if (typeof format === 'function') {
                (scope.formats || (scope.formats = {}))[schema.format] = format;
                (scope.schemas || (scope.schemas = {}))[schema.format] = schema;

                encodedFormat = encodeStr(schema.format);

                this.code('if (!formats[' + encodedFormat + '](' + path + ', schemas[' + encodedFormat + '])) {');
                this.error('format');
                this.code('}');
            }
        }
    }
};

ValidationContext.prototype.compile = function (id) {
    this.code = func('jsen_compiled' + (id ? '_' + id : ''), 'data', 'path', 'errors');
    this.generate();

    return this.code.compile(this.scope);
};

ValidationContext.prototype.dispose = function () {
    for (var key in this) {
        this[key] = undefined;
    }
};

function jsen(schema, options) {
    if (type(schema) !== 'object') {
        throw new Error(INVALID_SCHEMA);
    }

    options = options || {};

    var counter = 0,
        id = function () { return 'i' + (counter++); },
        resolver = new SchemaResolver(schema, options.schemas, options.missing$Ref || false),
        context = new ValidationContext({
            schema: schema,
            resolver: resolver,
            id: id,
            schemas: options.schemas,
            formats: options.formats,
            greedy: options.greedy || false
        }),
        compiled = func('validate', 'data')
            ('validate.errors = []')
            ('gen(data, "", validate.errors)')
            ('return validate.errors.length === 0')
            .compile({ gen: context.compile() });

    context.dispose();
    context = null;

    compiled.errors = [];

    compiled.build = function (initial, options) {
        return build(
            schema,
            (options && options.copy === false ? initial : clone(initial)),
            options && options.additionalProperties,
            resolver);
    };

    return compiled;
}

jsen.browser = browser;
jsen.clone = clone;
jsen.equal = equal;
jsen.unique = unique;
jsen.ucs2length = ucs2length;
jsen.SchemaResolver = SchemaResolver;
jsen.resolve = SchemaResolver.resolvePointer;

module.exports = jsen;
