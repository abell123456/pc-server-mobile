var crc32 = require('./crc32'),
	path = require('path'),
	util = require('./util');

	// Compiler constructor.
var	Compiler = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			var self = this;

			this.errors = [];

			this._reader = config.reader;
			this._writer = config.writer;
			this._options = config.options || {};

			this._cache = {};
			this._footprint = [];
			this._mountTable = {};
			this._pipe = {};

			// Context object prototype.
			this._context = {
				error: this._error.bind(this),

				require: function (pathnames, callback) {
					this.use(pathnames, callback, true);
				},

				use: function (pathnames, callback, _required) {
					var file = this.file;

					self.compile(pathnames, function (files) {
						(util.isArray(files) ? files : [ files ])
							.forEach(function (f) {
								if (f !== null) {
									file.meta.dependencies.push(f.pathname);
									if (_required) {
										file.meta.requires.push(f.pathname);
									}
								}
							});

						callback(files);
					});
				}
			};

			// Create pipe module instances.
			this._loadPipes([
				'decode',
				'dependency',
				'encode',
				'json',
				'minify',
				'modular',
				'nocomment',
				'stamp',
				'template'
			]);
		},

		/**
		 * Compile a file.
		 * @param pathname {string}
		 * @param callback {Function}
		 */
		_compile: function (pathname, callback) {
			var cache = this._cache,
				footprint = this._footprint,
				read = this._reader,
				write = this._writer,
				self = this;

			if (cache[pathname]) { // Return cached result.
				callback(cache[pathname]);
			} else if (footprint.indexOf(pathname) !== -1) { // Circular check.
				this._error('Circular reference: "%s"',
					footprint.concat(pathname).join('" -> "'));
				callback(null);
			} else {
				footprint.push(pathname);

				read(pathname, function (file) {
					if (file === null) {
						footprint.pop();
						callback(null);
					} else {
						file.meta = {
							dependencies: [],
							requires: []
						};

						self._dispatch(file, function () {
							footprint.pop();

							self._flat(file);
							self._hash(file);

							write(file, function () {
								callback(cache[pathname] = file);
							});
						});
					}
				});
			}
		},

		/**
		 * Dispath a file to pipeline.
		 * @param file {Object}
		 * @param callback {Function}
		 */
		_dispatch: function (file, callback) {
			var mountTable = this._mountTable,
				context = Object.create(this._context),
				extname = path.extname(file.pathname),
				pipeline = mountTable[extname] || mountTable['*'] || [],
				context = Object.create(this._context),
				i = 0,
				len = pipeline.length;

			context.file = file;

			(function next() {
				if (i < len) {
					pipeline[i++].call(null, context, next);
				} else {
					callback();
				}
			}());
		},

		/**
		 * Log error messages.
		 * @param template {string}
		 * @param values {Object*}
		 */
		_error: function () {
			this.errors.push(util.format.apply(util, arguments));
		},

		/**
		 * Flat dependencies.
		 * @param file {Object}
		 */
		_flat: function (file) {
			var cache = this._cache,
				meta = file.meta;

			[ 'requires', 'dependencies' ].forEach(function (field) {
				var pathnames = meta[field],
					tmp = [];

				pathnames.forEach(function (pathname) {
					cache[pathname].meta[field].forEach(function (pathname) {
						tmp.push(pathname);
					});
					tmp.push(pathname);
				});

				meta[field] = util.unique(tmp);
			});
		},

		/**
		 * Calculate Hash.
		 * @param file {Object}
		 */
		_hash: function (file) {
			var cache = this._cache,
				meta = file.meta,
				self = this;

			meta.nameHash = crc32(new Buffer(file.pathname));
			meta.dataHash = crc32(file.data);
			meta.depsHash = 0;

			meta.dependencies.forEach(function (pathname) {
				meta.depsHash += cache[pathname].meta.dataHash;
			});
		},

		/**
		 * Load internal pipe modules.
		 * @param name {string}
		 * @return {Object}
		 */
		_loadPipes: function (names) {
			var pipe = this._pipe,
				options = this._options;

			names.forEach(function (name) {
				pipe[name] = require('./pipe/' + name)(options[name] || {});
			});
		},

		/**
		 * Compile one or more files.
		 * @param pathname {string|Array}
		 * @param callback {Function}
		 */
		compile: function (pathname, callback) {
			var single = util.isString(pathname),
				result = [];

			if (single) {
				pathname = [ pathname ];
			}

			var i = 0,
				len = pathname.length,
				self = this;

			(function next() {
				if (i < len) {
					self._compile(pathname[i++], function (file) {
						result.push(file);
						setImmediate(next);
					});
				} else {
					callback(single ? result[0] : result);
				}
			}());
		},

		/**
		 * Assemble a pipeline.
		 * @param extname {string}
		 * @param pipeline {Array}
		 * @return {Object}
		 */
		mount: function (extname, pipeline) {
			var pipe = this._pipe,
				mountTable = this._mountTable;

			pipeline = pipeline.map(function (name) {
				return util.isFunction(name) ? name :
					(pipe[name] || function (context, next) {
						next();
					});
			});

			extname.split('|').forEach(function (extname) {
				mountTable[extname] = pipeline;
			});

			return this;
		}
	});

module.exports = Compiler;