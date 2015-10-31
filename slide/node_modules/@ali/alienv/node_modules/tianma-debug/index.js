'use strict';

var PATTERN_DEBUG = /\/\*@debug\b([\s\S]*?)\*\//gm;

/**
 * Middleware factory.
 * @return {Function}
 */
module.exports = function () {
    return function *(next) {
        var res = this.response;

        yield next;

        if (res.status() === 200 && res.is('js', 'css')) {
            res.data(res.data().toString()
                .replace(PATTERN_DEBUG, '$1'));
        }
    };
};
