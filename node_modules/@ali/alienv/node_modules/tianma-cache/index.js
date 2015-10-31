'use strict';

var LRU = require('lru-cache');

/**
 * Filter factory.
 * @param [maxAge] {number}
 * @return {Function}
 */
module.exports = function (maxAge) {
    maxAge = (maxAge || 1800) * 1000;

    var lru = LRU({
        max: 1024,
        maxAge: maxAge
    });

    function *cache(req, res, next) {
        var key = req.url();
        var entry = lru.get(key);
        var now = Date.now();
            // No IMS header equals the client has a cache
            // as old as the universe.
        var ims = new Date(req.head('if-modified-since') || 0);
            // No LRU entry equals the server has a cache
            // as new as freshly baked break.
        var lm = new Date(entry ? entry.headers['last-modified'] : now);

        if (ims >= lm) {
            res.status(304)
                .head('last-modified', lm.toGMTString());
        } else if (entry) {
            res.status(200)
                .head(entry.headers)
                .data(entry.body);
        } else {
            yield next;

            if (res.status() === 200) {
                lm = new Date(res.head('last-modified') || now);

                res.head({
                    'last-modified': lm.toGMTString(),
                    'expires': new Date(now + maxAge).toGMTString(),
                    'cache-control': 'max-age=' + maxAge / 1000
                });

                lru.set(key, {
                    headers: res.head(),
                    body: new Buffer(res.data())
                });

                // Now the LRU cache is warmed, we can handle the request
                // with the corrent Last-Modifled time again.
                yield *cache(req, res, next);
            }
        }
    }

    return function *(next) {
        var req = this.request;
        var res = this.response;

        if (req.method() === 'GET') {
            yield *cache(req, res, next);
        } else {
            yield next;
        }
    };
};
