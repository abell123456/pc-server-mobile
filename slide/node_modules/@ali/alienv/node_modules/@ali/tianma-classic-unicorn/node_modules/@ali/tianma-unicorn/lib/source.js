var fs = require('fs'),
	path = require('path'),
	util = require('pegasus').util,
	CascadeFile = require('./cascade-file');

var GLOBAL_FILE = 'js/5v/lib/ae/debug/global-img-server.js',

	// Source constructor.
	Source = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._cFile = new CascadeFile(config);
			this._meta = {};
			this._metaModifiedTime = 0;
		},

		/**
		 * Calculate CRC32 value.
		 * @param input {Object}
		 * @return {string}
		 */
		_crc32: (function () {
			var divisor = 0xEDB88320,

				table = [],

				byteCRC = function (input) {
					var i = 8,
						tmp = input;

					while (i--) {
						tmp = tmp & 1 ? (tmp >>> 1) ^ divisor : tmp >>> 1;
					}

					table[input] = tmp;
				},

				i = 0;

			for (i = 0; i < 256; ++i) {
				byteCRC(i);
			}

			return function (input) {
				var len = input.length,
					i = 0,
					crc = -1;

				for (; i < len; ++i) {
					crc = table[(crc ^ input[i]) & 0xFF] ^ (crc >>> 8);
				}

				return ((crc ^ -1) >>> 0);
			};
		}()),

		/**
		 * Flat all dependencies.
		 * @param pathnames {Array}
		 * @param extname {string}
		 * @return {Array}
		 */
		_expand: function (pathnames, extname) {
			var meta = this._meta,
				expanded = [];

			pathnames.forEach(function (pathname) {
				var data = meta[pathname];

				if (data) {
					expanded = expanded.concat(data.requires, pathname)
				}
			});

			if (expanded.length > 0 && extname === '.js' && meta[GLOBAL_FILE]) {
				expanded.unshift(GLOBAL_FILE);
			}

			return util.unique(expanded);
		},

		/**
		 * Update metadata.
		 * @param pathnames {Array}
		 * @param callback {Function}
		 */
		_refresh: function (callback) {
			var metaModifiedTime = this._metaModifiedTime,
				cFile = this._cFile,
				self = this;

			cFile.stat('.meta', function (file) {
				if (file.mtime !== metaModifiedTime) {
					self._metaModifiedTime = file.mtime;
					cFile.read('.meta', function (file) {
						try {
							self._meta = JSON.parse(file.data.toString('utf-8'));
						} catch (err) {
							util.throwError('JSON syntax error in ".meta"');
						}
						callback();
					});
				} else {
					callback();
				}
			});
		},

		/**
		 * Calculate stamp.
		 * @param pathnames {Array}
		 * @param [stamp] {string}
		 * @return {number}
		 */
		_stamp: function (pathnames) {
			var meta = this._meta,
				dataHash = 0,
				depsHash = 0;

			pathnames.forEach(function (pathname) {
				if (meta[pathname]) {
					dataHash += parseInt(meta[pathname].dataHash, 16);
					depsHash += parseInt(meta[pathname].depsHash, 16);
				}
			});

			return dataHash.toString(16) + '_' + depsHash.toString(16);
		},

		/**
		 * Load files and all dependencies.
		 * @param url {Object}
		 * @param callback {Function}
		 */
		load: function (url, callback) {
			var cFile = this._cFile,
				mtimes = [],
				self = this,
				mtime, stamp;

			this._refresh(function () {
				cFile.read(self._expand(url.pathnames, url.type), function (files) {
					files.forEach(function (file) {
						mtimes.push(file.mtime);
					});

					mtime = new Date(Math.max.apply(Math, mtimes));
					stamp = self._stamp(url.pathnames);

					callback(stamp, mtime, files);
				});
			});
		}
	});

module.exports = Source;
