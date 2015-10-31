'use strict';

var fs = require('co-fs');
var path = require('path');
var util = require('util');

var TEMPLATE = [
    '<!DOCTYPE html>',
    '<meta charset="UTF-8"/>',
    '<title>%s</title>',
    '<style>',
    'body { font: 10pt monospace; }',
    'li { line-height: 160%; list-style: none; }',
    '</style>',
    '<h2>Index of %s</h2>',
    '<hr />',
    '<ul>',
    '%s',
    '</ul>'
].join('\n');

/**
 * Get the absolute pathname of the requested file.
 * @param root {string}
 * @param pathname {string}
 * @return {string}
 */
function resolve(root, pathname) {
    pathname = path.normalize(pathname);
    pathname = path.join(root, pathname);

    return pathname < root ? root : pathname;
}

/**
 * Join two pathnames and normalize the slash.
 * @param base {string}
 * @param pathname {string}
 * @return {string}
 */
function join(base, pathname) {
    return path.join(base, pathname).replace(/\\/g, '/');
}

/**
 * Get the sorted directory list.
 * @param base {string}
 * @param dir {string}
 * @param filenames {Array}
 * @return {string}
 */
function *list(base, dir, filenames) {
    var d = [ '..' ];
    var f = [];

    for (var i = 0, len = filenames.length; i < len; ++i) {
        var filename = filenames[i];
        var stats;

        if (filename[0] !== '.') { // Skip hidden files.
            stats = yield fs.stat(path.join(dir, filename));
            if (stats.isDirectory()) {
                d.push(filename + '/');
            } else {
                f.push(filename);
            }
        }
    }

    d.sort();
    f.sort();

    var list = d.concat(f).map(function (filename) {
        return '<li><a href="' + encodeURI(join(base, filename)) + '">'
            + filename
            + '</a></li>';
    }).join('\n');

    return util.format(TEMPLATE, base, base, list);
}

/**
 * Find a possible index file among the given filenames.
 * @param filenames {Array}
 * @pararm indexes {Array}
 * @return {string|null}
 */
function findIndex(filenames, indexes) {
    var len = indexes.length,
        i = 0,
        index;

    for (; i < len; ++i) {
        index = indexes[i];
        if (filenames.indexOf(index) !== -1) {
            return index;
        }
    }

    return null;
}

/**
 * Filter factory.
 * @param [config] {Object}
 * @return {Function}
 */
module.exports = function (config) {
    config = config || {};

    if (typeof config == 'string') {
        config = {
            root: config
        };
    }

    var root = config.root || './';
    var indexes = 'indexes' in config ? config.indexes : [];

    /**
     * Read something.
     * @param pathname {string}
     * @return {Object}
     */
    function *read(pathname) {
        var absolute = resolve(root, pathname);
        var stats = yield fs.stat(absolute);

        if (stats.isFile()) {
            return {
                pathname: pathname,
                stats: stats,
                data: yield fs.readFile(absolute)
            };
        } else if (indexes && stats.isDirectory()) {
            var filenames = yield fs.readdir(absolute);
            var index = findIndex(filenames, indexes);

            if (index) {
                return yield *read(join(pathname, index));
            } else {
                return {
                    pathname: pathname,
                    stats: stats,
                    data: yield *list(pathname, absolute, filenames)
                };
            }
        } else {
            var err = new Error();
            err.code = 'ENOENT';
            throw err;
        }
    }

    return function *(next) {
        var req = this.request;
        var res = this.response;

        try {
            var result = yield *read(decodeURI(req.pathname));

            res.status(200)
                .type(result.stats.isDirectory() ?
                    'html': path.extname(result.pathname) || 'txt')
                .head('last-modified',
                    result.stats.mtime.toGMTString())
                .data(result.data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                res.status(404);
                yield next;
            } else {
                throw err;
            }
        }
    };
};
