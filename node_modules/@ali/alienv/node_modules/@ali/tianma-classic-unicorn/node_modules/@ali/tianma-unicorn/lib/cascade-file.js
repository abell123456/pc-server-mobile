var fs = require('fs'),
	path = require('path'),
	util = require('pegasus').util;

	/**
	 * Enable concurrent fs actions to share one disk IO operation.
	 * @param fn {Function}
	 * @return {Function}
	 */
var share = function (fn) {
		var pending = [];

		return function (pathname, callback) {
			var queue = pending[pathname];

			if (!queue) { // Create a callback queue for the same actions.
				queue = pending[pathname] = [];
			}

			// The saved callbacks will be called later in batch.
			queue.push(callback);

			// Only one disk IO for all concurrent actions.
			if (queue.length === 1) {
				fn(pathname, function () {
					// Reuse data between all concurrent actions.
					while (queue.length !== 0) {
						queue.pop().apply(null, arguments);
					}

					// Avoid too many object keys to fill up the memory.
					delete pending[pathname];
				});
			}
		};
	},

	readFile = share(fs.readFile),

	stat = share(fs.stat),

	exists = share(fs.exists),

	CascadeFile = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._source = config.source;
			this._patch = config.patch;
			this._mergeTag = path.join(config.source, '.merging');
		},

		/**
		 * Read the first available candidates.
		 * @param bases {Array} The alternative directory of reading files.
		 * @param pathnames {Array} The file path.
		 * @param callback {Function} Execute the function after reading files.
		 * @param needContent {boolean} Determine whether the content is needed.
		 */
		_read: function (bases, pathnames, callback, needContent) {
			var files = [],
				len1 = pathnames.length,
				len2 = bases.length;

			(function nextFile(i) {
				if (i < len1) {
					(function nextCandidate(j, pathname, lastError) {
						if (j < len2) {
							var fullPath = path.join(bases[j], pathname);

							stat(fullPath, function (err, status) {
								if (err) {
									if (err.code === 'ENOENT') {
										nextCandidate(j + 1, pathname, err);
									} else {
										util.throwError(new Error(err.message));
									}
								} else {
									if (needContent) {
										readFile(fullPath, function (err, data) {
											if (err) {
												if (err.code === 'ENOENT') {
													nextCandidate(j + 1, pathname, err);
												} else {
													util.throwError(new Error(err.message));
												}
											} else {
												files.push({
													data: data,
													mtime: status.mtime.getTime(),
													pathname: pathname
												});
												nextFile(i + 1);
											}
										});
									} else {
										files.push({
											mtime: status.mtime.getTime(),
											pathname: pathname
										});
										nextFile(i + 1);
									}
								}
							});
						} else {
							util.throwError(new Error(lastError.message));
						}
					}(0, pathnames[i], null));
				} else {
					callback(files);
				}
			}(0));
		},

		/**
		 * Read files or Stat files.
		 * @param pathnames {Array} The file path.
		 * @param callback {Function} Execute the function after reading files.
		 * @param needContent {boolean} Determine whether the content is needed.
		 */
		_getFiles: function (pathnames, callback, needContent) {
			var source = this._source,
				patch = this._patch,
				mergeTag = this._mergeTag,
				single = false,
				self = this;

			if (util.isString(pathnames)) {
				single = true;
				pathnames = [ pathnames ];
			}

			exists(mergeTag, function (exists) {
				var bases = exists ? [ patch, source ] : [ source ];

				self._read(bases, pathnames, function (files) {
					callback(single ? files[0] : files);
				}, needContent);
			});
		},

		/**
		 * Read files and get contents.
		 * @param pathnames {Array} The file path.
		 * @param callback {Function} Execute the function after reading files.
		 */
		read: function (pathnames, callback) {
			this._getFiles(pathnames, callback, true);
		},

		/**
		 * Read files meta.
		 * @param pathnames {Array} The file path.
		 * @param callback {Function} Execute the function after reading files.
		 */
		stat: function (pathnames, callback) {
			this._getFiles(pathnames, callback, false);
		}

	});

module.exports = CascadeFile;
