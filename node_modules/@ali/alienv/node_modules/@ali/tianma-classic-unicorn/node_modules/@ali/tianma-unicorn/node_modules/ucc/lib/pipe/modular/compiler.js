var compiler = require('../../compiler'),
	path = require('path'),
	util = require('../../util');

var PATTERN_DEFINE = /^[ \f\t\v]*define\s*\(\s*(function\s*\(.*?\)|\{)/m,

	PATTERN_REQUIRE = /[^\.]require\s*\(\s*['"]([^'"]+?)['"]\s*\)/g,

	PATTERN_VAR = /\{[\w\-\.]+\}/,

	Compiler = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._cache = {};
		},

		/**
		 * Parse lite dependencies.
		 * @param file {Object}
		 * @return {Array}
		 */
		_parse: function (file) {
			var data = file.data,
				deps = [];

			PATTERN_REQUIRE.lastIndex = 0;

			while (re = PATTERN_REQUIRE.exec(data)) { // Assign.
				deps.push(re[1]);
			}

			return deps;
		},

		/**
		 * Expand lite dependencies to full dependencies.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		_expand: function (context, callback) {
			var cache = this._cache,
				lite = this._parse(context.file),
				full = [],
				file = context.file,
				dirname = path.dirname(file.pathname),
				requires = [],
				self = this;

			(function next(i) {
				if (i < lite.length) {
					var id = lite[i],
						pathname = id.split('?')[0];

					if (PATTERN_VAR.test(pathname)) {
						full.push(id);
						next(i + 1);
					} else {
						context.use(pathname, function (f) {
							if (f === null) {
								context.error('Cannot read dependency: "%s" -> "%s"',
									file.pathname, pathname);
							} else if (!cache[pathname]) {
								context.error('Invalid CMD module: "%s" -> "%s"',
									file.pathname, pathname);
							} else {
								var fn = function (id) {
										var pathname = id.split('?')[0],
											relation = self._relative(dirname, pathname);

										if (PATTERN_VAR.test(pathname)) {
											// Include variable private module.
											full.push(id);
										} else if (relation.indexOf('/_') === 0) {
											// Add private module to dependencies
											requires.push(pathname);
										}  else {
                                            var relations = relation.split('/'),
                                                isForbidden = relations.some(function (rel) {
                                                    return rel.charAt(0) === '_';
                                                });

                                            if (isForbidden) {
                                                context.error('Forbidden to accessing private module: "%s" -> "%s"',
                                                    file.pathname, pathname);
                                            }
                                            full.push(id);
										}
									};

								cache[pathname].forEach(fn);
								fn(id);
							}

							next(i + 1);
						});
					}
				} else {
					context.require(requires, function (files) {
						files.forEach(function (f, index) {
							if (f === null) {
								context.error('Cannot read dependency: "%s" -> "%s"',
									file.pathname, requires[index]);
							}
						});

						cache[file.pathname] = util.unique(full);
						callback();
					});
				}
			}(0));
		},

		/**
		 * Get relation of two pathnames.
		 * @param from {string}
		 * @param to {string}
		 * @return {string}
		 */
		_relative: function (from, to) {
			var i = 0,
				len = Math.min(from.length, to.length);

			for (; i < len; ++i) {
				if (from[i] !== to[i]) {
					break;
				}
			}

			return to.substring(i);
		},

		/**
		 * Compile CMD module.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		compile: function (context, callback) {
			var file = context.file,
				cache = this._cache;

			this._expand(context, function () {
				var requires = cache[file.pathname];

				requires = requires.length === 0 ?
					'[]' : '[ "' + requires.join('", "') + '" ]';

				file.data = file.data
					.replace(PATTERN_DEFINE, function (all, suffix) {
						if (suffix === '{') {
							return util.format('define("%s", %s, {',
								file.pathname, requires);
						} else {
							return util.format('define("%s", %s, function (require, exports, module)',
								file.pathname, requires);
						}
					});

				callback();
			});
		}
	});

module.exports = Compiler;
