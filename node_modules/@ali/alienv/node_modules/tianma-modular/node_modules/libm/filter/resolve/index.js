'use strict';

var ar = require('async-replace');
var async = require('async');
var fs = require('fs');
var path = require('path');
var	url = require('url');
var	resolve = require('resolve');

var PATTERN_SLASH = /\\/g;
var PATTERN_PROTOCOL = /^(?:\w+:|\/\/)/;
var	PATTERN_REQUIRE_JS = /((?:^|[^\.])\brequire\s*\(\s*['"])([^'"]+?)(['"]\s*\))/g;
var	PATTERN_ASYNC_S = /((?:^|[^\.])\brequire\.async\s*\(\s*['"])([^'"]+?)(['"])/g;
var	PATTERN_ASYNC_M = /((?:^|[^\.])\brequire\.async\s*\(\s*\[)(.*?)(\])/g;
var	PATTERN_ID = /(['"])([^'"]+?)(\1)/g;
var	PATTERN_REQUIRE_CSS = /(@require\s+['"])([^'"]+?)(['"]\s*;?)/g;
var	PATTERN_IMPORT = /(@import\s+['"])([^'"]+?)(['"]\s*;?)/g;
var	PATTERN_URL = /(url\s*\(\s*['"]?)([^'"]+?)(['"]?\s*\))/g;
var PATTERN_URL_WITH_PARAMETER = /^(.*?)([#\?].*)?$/;


module.exports = function (scope, moduledir) {
	scope = scope ? scope + '/' : '';
	moduledir = moduledir || 'node_modules';

	/**
	 * @param id {string}
	 * @param basedir {string}
	 * @param callback {Function}
	 */
	function rebase(id, basedir, callback) {
		if (id[0] === '/') {
			(function next(dir) {
				async.some([
					path.join(dir, 'package.json'),
					path.join(dir, 'bower.json')
				], fs.exists, function (exists) {
					var parent, relative;
					if (exists || (parent = path.join(dir, '..')) === dir) {
	                    relative = (path.relative(basedir, dir) || '.')
	                        .replace(PATTERN_SLASH, '/');
						callback(relative + id);
					} else {
						next(parent);
					}
				});
			}(basedir));
		} else if (id[0] === '.') {
			callback(id);
		} else {
			callback(scope + id)
		}
	}

	/**
	 * @param id {string}
	 * @param basedir {string}
	 * @param relative {string}
	 * @param type {string}
	 * @param callback {Function}
	 */
	function resolveId(id, basedir, relative, type, callback) {
		if (PATTERN_PROTOCOL.test(id)) {
			return callback(null, id);
		}

		var parts = id.match(PATTERN_URL_WITH_PARAMETER),
			parameter = parts[2] || '';

		rebase(parts[1], basedir, function (id) {
			resolve(id, {
				moduleDirectory: moduledir,
				basedir: basedir,
				extensions: [ type ]
			}, function (err, pathname) {
			    if (err) {
			    	callback(err);
			    } else {
			    	relative = path.dirname(relative);
			    	pathname = path.relative(basedir, pathname);
			    	id = path.join(relative, pathname).replace(PATTERN_SLASH, '/');
			    	callback(null, id + parameter);
			    }
			});
		});
	}

	/**
	 * @param pattern {RegExp}
	 * @param basedir {string}
	 * @param relative {string}
	 * @param type {string}
	 */
	function replace(pattern, basedir, relative, type) {
		return function (code, callback) {
			ar(code, pattern, function (match, prefix, id, suffix, offset, str, done) {
				resolveId(id, basedir, relative, type, function (err, id) {
					done(err, err || prefix + id + suffix);
				});
			}, callback);
		};
	}

	/**
	 * @param basedir {string}
	 * @param relative {string}
	 * @param type {string}
	 */
	function replaceM(basedir, relative, type) {
		return function (code, callback) {
			ar(code, PATTERN_ASYNC_M, function (match, prefix, ids, suffix, offset, str, done) {
				replace(PATTERN_ID, basedir, relative, type)(ids, function (err, ids) {
					done(err, err || prefix + ids + suffix);
				});
			}, callback);
		};
	}

	return function (next, done) {
		var basedir = this.basedir;
		var relative = this.relative;
		var type = this.type;
		var data = this.data;
		var context = this;
	
		function source(callback) {
			callback(null, data);
		}
	
		function target(err, data) {
			if (err) {
				err.message += '(' + relative + ')';
				done(err);
			} else {
				context.data = data;
				next(done);
			}
		}
	
		if (type === '.js') {
			async.waterfall([
				source,
				// require('id')
				replace(PATTERN_REQUIRE_JS, basedir, relative, type),
				// require.async('id', cb)
				replace(PATTERN_ASYNC_S, basedir, relative, type),
				// require.async([ 'id', 'id' ], cb)
				replaceM(basedir, relative, type)
			], target)
		} else if (this.type === '.css') {
			async.waterfall([
				source,
				// @require "id"
				replace(PATTERN_REQUIRE_CSS, basedir, '.', type),
				// @import "id"
				replace(PATTERN_IMPORT, basedir, '.', type),
				// url("foo/bar")
				replace(PATTERN_URL, basedir, '.', type)
			], target)
		} else {
			next(done);
		}
	};
};