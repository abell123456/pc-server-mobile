var compiler = require('./compiler'),
	util = require('pegasus').util,
	Source = require('./source');

var GLOBAL_FILE = 'js/5v/lib/ae/debug/global-img-server.js',

	// SourceJIT constructor.
	SourceJIT = Source.extend({
		/**
		 * Initializer.
		 * @override
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._config = config;
			this._cache = {};
			this._meta = {};
		},

		/**
		 * Create a compiler.
		 * @param callback {Function}
		 */
		_createCompiler: function (callback) {
			var config = this._config,
				cache = this._cache,
				meta = this._meta,
				load = config.loader;

			load('unicorn.json', function (file) {
				var options = {
						alias: {},
						modules: []
					},
					obj, c;

				if (file !== null) {
					try {
						obj = JSON.parse(file.data.toString('utf-8'));
					} catch (err) {
						util.throwError('JSON syntax error in "unicorn.json"');
					}
					options.alias = obj.alias;
					options.modules = obj.modules;
				}

				c = compiler.generate({
					alias: options.alias,
					modules: options.modules,
					cache: cache,
					loader: load,
					mode: config.mode
				});

				c.compile(GLOBAL_FILE, function (file) {
					if (file !== null) {
						meta[file.pathname] = {
							dataHash: file.meta.dataHash.toString(16),
							depsHash: file.meta.depsHash.toString(16),
							nameHash: file.meta.nameHash.toString(16),
							requires: file.meta.requires
						};
					}
					callback(c);
				});
			});
		},

		/**
		 * Update metadata.
		 * @override
		 * @param base {Array}
		 * @param pathnames {Array}
		 * @param callback {Array}
		 */
		_refresh: function (base, pathnames, callback) {
			var meta = this._meta,
				filtered = [];

			this._createCompiler(function (compiler) {
				(function nextFile(i) {
					if (i < pathnames.length) {
						(function nextCandidate(j) {
							if (j < base.length) {
								compiler.compile(base[j] + pathnames[i], function (file) {
									if (file !== null) {
										meta[file.pathname] = {
											dataHash: file.meta.dataHash.toString(16),
											depsHash: file.meta.depsHash.toString(16),
											nameHash: file.meta.nameHash.toString(16),
											requires: file.meta.requires
										};
										filtered.push(file.pathname);
										nextFile(i + 1);
									} else {
										nextCandidate(j + 1);
									}
								});
							} else {
								nextFile(i + 1);
							}
						}(0));
					} else {
						if (compiler.errors.length > 0) {
							util.throwError(compiler.errors[0]);
						}
						callback(filtered);
					}
				}(0));
			});
		},

		/**
		 * Load files and all dependencies.
		 * @override
		 * @param url {Object}
		 * @param callback {Function}
		 */
		load: function (url, callback) {
			var cache = this._cache,
				files = [],
				mtimes = [],
				self = this,
				mtime, stamp;

			this._refresh(url.base, url.pathnames, function (filtered) {
				self._expand(filtered, url.type).forEach(function (pathname, index) {
					files[index] = {
						pathname: pathname,
						data: cache[pathname].data
					};
                    mtimes.push(cache[pathname].mtime);
				});
                mtime = new Date(Math.max.apply(Math, mtimes));
				stamp = self._stamp(filtered);
				callback(stamp, mtime, files);
			});
		}
	});

module.exports = SourceJIT;
