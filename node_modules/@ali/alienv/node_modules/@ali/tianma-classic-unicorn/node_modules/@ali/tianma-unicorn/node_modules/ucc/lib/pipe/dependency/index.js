var path = require('path'),
    util = require('../../util');

var PATTERN_IMPORT = /^\s*\/\/\s*#import\s+([\w\/-]+\.js)\s*$/gm,

    PATTERN_REQUIRE = /^\s*\/[\/\*]\s*#require\s+(["<])([\w\/\.-]+)[">](?:\s*\*\/)?\s*$/gm,

    PATTERN_SLASH = /\\/g,

    /**
     * Normalize pathname.
     * @param base {string}
     * @param pathname {string}
     * @return {string}
     */
        normalize = function (base, pathname) {
        return path
            .join(base, pathname)
            .replace(PATTERN_SLASH, '/'); // Correct slash under windows.
    },

    /**
     * Parse lite dependencies.
     * @param file {Object}
     * @return {Object}
     */
        parse = function (file) {
        var data = file.data,
            type = path.extname(file.pathname),
            deps = [],
            re;

        if (type === '.js') {
            PATTERN_IMPORT.lastIndex = 0;

            while (re = PATTERN_IMPORT.exec(data)) { // Assign.
                deps.push(normalize('js/5v/', re[1]));
            }
        }

        PATTERN_REQUIRE.lastIndex = 0;

        while (re = PATTERN_REQUIRE.exec(data)) { // Assign.
            deps.push(normalize(re[1] === '"' ?
                path.dirname(file.pathname) : '.', re[2]));
        }

        return deps;
    };

module.exports = function (config) {
    /**
     * Parse dependencies comments.
     * @param context {Object}
     * @param next {Function}
     */
    return function (context, next) {
        var file = context.file,
            type = path.extname(file.pathname),
            deps = parse(file);

        deps = deps.filter(function (pathname) {
            if (path.extname(pathname) !== type) {
                context.error('Dependency extname inconsistent: "%s" -> "%s"',
                    file.pathname, pathname);
                return false;
            } else {
                return true;
            }
        });

        context.require(deps, function (files) {
            files.forEach(function (f, index) {
                if (f === null) {
                    context.error('Cannot read dependency: "%s" -> "%s"',
                        file.pathname, deps[index]);
                }
            });

            next();
        });
    };
};