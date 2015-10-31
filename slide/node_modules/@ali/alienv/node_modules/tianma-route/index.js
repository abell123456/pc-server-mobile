'use strict';

var ptr = require('path-to-regexp');

var PATTERN_RULE = /^([a-z]+)?\s*(\/.*)?$/i;

/**
 * Middleware factory.
 * @param rules {Array|string...}
 * @return {Function}
 */
module.exports = function (rule) {
    var keys = [];
    var re = (rule || '/').match(PATTERN_RULE);
    var method = new RegExp('^' + (re[1] || '.*').toUpperCase() + '$');
    var pathname = ptr(re[2] || '/', keys);

    return function *(next) {
        var req = this.request;
        var re;

        if (re = req.method().match(method)) { // Method matching.
            if (re = req.pathname.match(pathname)) { // Pathname matching.
                req.params = {};

                keys.forEach(function (key, index) {
                    req.params[key.name] = re[index + 1];
                });

                yield next;
            }
        }
    };
};
