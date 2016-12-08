'use strict';

var url = require('url'),
    metaschema = require('./metaschema.json'),
    INVALID_SCHEMA_REFERENCE = 'jsen: invalid schema reference',
    DUPLICATE_SCHEMA_ID = 'jsen: duplicate schema id',
    CIRCULAR_SCHEMA_REFERENCE = 'jsen: circular schema reference';

function get(obj, path) {
    if (!path.length) {
        return obj;
    }

    var key = path.shift(),
        val;

    if (obj && typeof obj === 'object' && obj.hasOwnProperty(key)) {
        val = obj[key];
    }

    if (path.length) {
        if (val && typeof val === 'object') {
            return get(val, path);
        }

        return undefined;
    }

    return val;
}

function refToObj(ref) {
    var index = ref.indexOf('#'),
        ret = {
            base: ref.substr(0, index),
            path: []
        };

    if (index < 0) {
        ret.base = ref;
        return ret;
    }

    ref = ref.substr(index + 1);

    if (!ref) {
        return ret;
    }

    ret.path = ref.split('/').map(function (segment) {
        // Reference: http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-08#section-3
        return decodeURIComponent(segment)
            .replace(/~1/g, '/')
            .replace(/~0/g, '~');
    });

    if (ref[0] === '/') {
        ret.path.shift();
    }

    return ret;
}

// TODO: Can we prevent nested resolvers and combine schemas instead?
function SchemaResolver(rootSchema, external, missing$Ref, baseId) {  // jshint ignore: line
    this.rootSchema = rootSchema;
    this.resolvers = null;
    this.resolvedRootSchema = null;
    this.cache = {};
    this.idCache = {};
    this.refCache = { refs: [], schemas: [] };
    this.missing$Ref = missing$Ref;
    this.refStack = [];

    baseId = baseId || '';

    this._buildIdCache(rootSchema, baseId);

    // get updated base id after normalizing root schema id
    baseId = this.refCache.refs[this.refCache.schemas.indexOf(this.rootSchema)] || baseId;

    this._buildResolvers(external, baseId);
}

SchemaResolver.prototype._cacheId = function (id, schema, resolver) {
    if (this.idCache[id]) {
        throw new Error(DUPLICATE_SCHEMA_ID + ' ' + id);
    }

    this.idCache[id] = { resolver: resolver, schema: schema };
};

SchemaResolver.prototype._buildIdCache = function (schema, baseId) {
    var id = baseId,
        ref, keys, i;

    if (!schema || typeof schema !== 'object') {
        return;
    }

    if (typeof schema.id === 'string' && schema.id) {
        id = url.resolve(baseId, schema.id);

        this._cacheId(id, schema, this);
    }
    else if (schema === this.rootSchema && baseId) {
        this._cacheId(baseId, schema, this);
    }

    if (schema.$ref && typeof schema.$ref === 'string') {
        ref = url.resolve(id, schema.$ref);

        this.refCache.schemas.push(schema);
        this.refCache.refs.push(ref);
    }

    keys = Object.keys(schema);

    for (i = 0; i < keys.length; i++) {
        this._buildIdCache(schema[keys[i]], id);
    }
};

SchemaResolver.prototype._buildResolvers = function (schemas, baseId) {
    if (!schemas || typeof schemas !== 'object') {
        return;
    }

    var that = this,
        resolvers = {};

    Object.keys(schemas).forEach(function (key) {
        var id = url.resolve(baseId, key),
            resolver = new SchemaResolver(schemas[key], null, that.missing$Ref, id);

        that._cacheId(id, resolver.rootSchema, resolver);

        Object.keys(resolver.idCache).forEach(function (idKey) {
            that.idCache[idKey] = resolver.idCache[idKey];
        });

        resolvers[key] = resolver;
    });

    this.resolvers = resolvers;
};

SchemaResolver.prototype.getNormalizedRef = function (schema) {
    var index = this.refCache.schemas.indexOf(schema);
    return this.refCache.refs[index];
};

SchemaResolver.prototype._resolveRef = function (ref) {
    var err = new Error(INVALID_SCHEMA_REFERENCE + ' ' + ref),
        idCache = this.idCache,
        externalResolver, cached, descriptor, path, dest;

    if (!ref || typeof ref !== 'string') {
        throw err;
    }

    if (ref === metaschema.id) {
        dest = metaschema;
    }

    cached = idCache[ref];

    if (cached) {
        dest = cached.resolver.resolve(cached.schema);
    }

    if (dest === undefined) {
        descriptor = refToObj(ref);
        path = descriptor.path;

        if (descriptor.base) {
            cached = idCache[descriptor.base] || idCache[descriptor.base + '#'];

            if (cached) {
                dest = cached.resolver.resolve(get(cached.schema, path.slice(0)));
            }
            else {
                path.unshift(descriptor.base);
            }
        }
    }

    if (dest === undefined && this.resolvedRootSchema) {
        dest = get(this.resolvedRootSchema, path.slice(0));
    }

    if (dest === undefined) {
        dest = get(this.rootSchema, path.slice(0));
    }

    if (dest === undefined && path.length && this.resolvers) {
        externalResolver = get(this.resolvers, path);

        if (externalResolver) {
            dest = externalResolver.resolve(externalResolver.rootSchema);
        }
    }

    if (dest === undefined || typeof dest !== 'object') {
        if (this.missing$Ref) {
            dest = {};
        } else {
            throw err;
        }
    }

    if (this.cache[ref] === dest) {
        return dest;
    }

    this.cache[ref] = dest;

    if (dest.$ref !== undefined) {
        dest = this.resolve(dest);
    }

    return dest;
};

SchemaResolver.prototype.resolve = function (schema) {
    if (!schema || typeof schema !== 'object' || schema.$ref === undefined) {
        return schema;
    }

    var ref = this.getNormalizedRef(schema) || schema.$ref,
        resolved = this.cache[ref];

    if (resolved !== undefined) {
        return resolved;
    }

    if (this.refStack.indexOf(ref) > -1) {
        throw new Error(CIRCULAR_SCHEMA_REFERENCE + ' ' + ref);
    }

    this.refStack.push(ref);

    resolved = this._resolveRef(ref);

    this.refStack.pop();

    if (schema === this.rootSchema) {
        // cache the resolved root schema
        this.resolvedRootSchema = resolved;
    }

    return resolved;
};

SchemaResolver.prototype.hasRef = function (schema) {
    var keys = Object.keys(schema),
        len, key, i, hasChildRef;

    if (keys.indexOf('$ref') > -1) {
        return true;
    }

    for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];

        if (schema[key] && typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
            hasChildRef = this.hasRef(schema[key]);

            if (hasChildRef) {
                return true;
            }
        }
    }

    return false;
};

SchemaResolver.resolvePointer = function (obj, pointer) {
    var descriptor = refToObj(pointer),
        path = descriptor.path;

    if (descriptor.base) {
        path = [descriptor.base].concat(path);
    }

    return get(obj, path);
};

module.exports = SchemaResolver;