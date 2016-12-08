'use strict';

module.exports = function func() {
    var args = Array.apply(null, arguments),
        name = args.shift(),
        tab = '  ',
        lines = '',
        vars = '',
        ind = 1,    // indentation
        bs = '{[',  // block start
        be = '}]',  // block end
        space = function () {
            var sp = tab, i = 0;
            while (i++ < ind - 1) { sp += tab; }
            return sp;
        },
        add = function (line) {
            lines += space() + line + '\n';
        },
        builder = function (line) {
            var first = line[0],
                last = line[line.length - 1];

            if (be.indexOf(first) > -1 && bs.indexOf(last) > -1) {
                ind--;
                add(line);
                ind++;
            }
            else if (bs.indexOf(last) > -1) {
                add(line);
                ind++;
            }
            else if (be.indexOf(first) > -1) {
                ind--;
                add(line);
            }
            else {
                add(line);
            }

            return builder;
        };

    builder.def = function (id, def) {
        vars += (vars ? ',\n' + tab + '    ' : '') + id + (def !== undefined ? ' = ' + def : '');
        return builder;
    };

    builder.toSource = function () {
        return 'function ' + name + '(' + args.join(', ') + ') {\n' +
            tab + '"use strict"' + '\n' +
            (vars ? tab + 'var ' + vars + ';\n' : '') +
            lines + '}';
    };

    builder.compile = function (scope) {
        var src = 'return (' + builder.toSource() + ')',
            scp = scope || {},
            keys = Object.keys(scp),
            vals = keys.map(function (key) { return scp[key]; });

        return Function.apply(null, keys.concat(src)).apply(null, vals);
    };

    return builder;
};