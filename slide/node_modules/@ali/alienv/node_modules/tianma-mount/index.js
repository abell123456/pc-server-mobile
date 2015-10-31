'use strict';

var PATTERN_RULE = /^([^\/]+?)?(\/.*?)?$/;

/**
 * Whether the expect array could left align with the input array.
 * @param expect {Array}
 * @param input {Array}
 * @return {boolean}
 */
function match(expect, input) {
    return expect.every(function (value, index) {
        return value === input[index];
    });
}

/**
 * Split a string into an Array.
 * @param str {string}
 * @param delimiter {string}
 * @param [reverse] {boolean}
 * @return {Array}
 */
function split(str, delimiter, reverse) {
    var parts = str.split(delimiter).filter(function (value) {
        return value;
    })

    if (delimiter === '.') {
        parts.reverse();
    }

    return parts;
}

/**
 * Parse the mount rules.
 * @param rules {Array}
 * @return {Array}
 */
function parse(rules) {
    return rules.map(function (rule) {
        var re = (rule || '').match(PATTERN_RULE);

        // "www.example.com" => [ "com", "example", "www" ]
        var hostname = split(re[1] || '', '.', true);

        // "/foo/bar/baz" => [ "foo", "bar", "baz" ]
        var pathname = split(re[2] || '', '/');

        // base should be "", "/foo", "/foo/bar", etc..
        var base = pathname.length === 0 ? '' : '/' + pathname.join('/');

        return {
            hostname: hostname,
            pathname: pathname,
            base: base
        };
    });
}

/**
 * Middleware factory.
 * @param rules {Array|string...}
 * @return {Function}
 */
module.exports = function (rules) {
    // Accept array-style of arguments-style rules.
    if (!Array.isArray(rules)) {
        rules = [].slice.call(arguments);
    }

    rules = parse(rules);

    return function *(next) {
        var req = this.request,
            originalBase = req.base,
            base;

        if (rules.some(function (rule) {
            // Match hostname at first.
            if (!match(rule.hostname, split(req.hostname, '.', true))) {
                return false;
            }

            // Match pathname at last.
            if (!match(rule.pathname, split(req.pathname, '/'))) {
                return false;
            }

            base = rule.base;

            return true;
        })) {
            // Trim the base so the sub middlewares won't cara about the mount path.
            req.url(req.pathname.replace(base, '') || '/');
            req.base = base;

            yield next;

            // Restore the original pathname.
            req.base = originalBase;
            req.url(base + req.pathname);
        }
    };
};
