'use strict';

var PATTERN_COMBO_URL = /^(\/.*?)(?:\?|%3F){2}(.*?)(\?.*)?$/i;
var PATTERN_COMMA = /(?:,|%2C)/i;

/**
 * Parse the combo style URL.
 * @param url {string}
 * @return {Array|null}
 */
function parseURL(url) {
    var re;

    if (re = url.match(PATTERN_COMBO_URL)) {
        return re[2].split(PATTERN_COMMA).map(function (pathname) {
            return re[1] + pathname + (re[3] || '?');
        });
    }

    return null;
}

/**
 * Filter factory.
 * @param [delimiter] {Object}
 * @return {Function}
 */
module.exports = function (delimiter) {
    delimiter = delimiter || {
        'application/javascript': '\n',
        'text/css': '\n'
    };

    return function *(next) {
        var req = this.request;
        var res = this.response;
        var original = req.path;
        var datum = [];
        var paths, type, mtime;

        if (req.method() === 'GET' && (paths = parseURL(original))) {
            for (var i = 0, len = paths.length; i < len; ++i) {
                req.url(paths[i]);

                yield next;

                if (res.status() !== 200) {
                    throw new Error('Failed to get "' + req.pathname + '"');
                }

                if (!type) {
                    type = res.type();
                } else if (type !== res.type()) {
                    throw new Error('MIME of "' + req.pathname + '" is inconsistent with others');
                }

                if (res.head('last-modified')) {
                    if (mtime) {
                        mtime = Math.max(new Date(res.head('last-modified')), mtime);
                    } else {
                        mtime = new Date(res.head('last-modified')).getTime();
                    }
                }

                datum.push(res.data());

                if (delimiter[type]) {
                    datum.push(delimiter[type]);
                }
            }

            // Restore the original URL.
            req.url(original);

            // Use the latest mtime.
            if (mtime) {
                res.head('last-modified', new Date(mtime).toGMTString());
            }

            res.data(datum);
        } else {
            yield next;
        }
    };
};
