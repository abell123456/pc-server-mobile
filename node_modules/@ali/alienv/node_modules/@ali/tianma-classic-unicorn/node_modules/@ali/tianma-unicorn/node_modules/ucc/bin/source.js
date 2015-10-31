var fs = require('./fs'),
	util = require('../lib/util');

var Source = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._patch = config.patch;
			this._root = config.root;

			this._map = fs.readDirectory(this._patch, '.', true);
		},

		/**
		 * Determine file type.
		 * @param pathname {string}
		 * @return {string|null}
		 */
		_stat: function (pathname) {
			var root = this._root,
				patch = this._patch,
				map = this._map;

			if (map.hasOwnProperty(pathname)) {
				return map[pathname] ?
					'dir' : 'file';
			} else {
				return fs.stat(root, pathname);
			}
		},

		/**
		 * Clean patch directory.
		 */
		cleanup: function () {
			fs.empty(this._patch, '.', true);
		},
        /**
         * remove file from source
         * @param pathname
         */
        remove: function (pathname){
            var root = this._root;

            fs.removeFile(root, pathname);
        },

		/**
		 * Copy files in patch directory into source directory.
		 */
		merge: function () {
			fs.mix(this._root, this._patch);
		},

		/**
		 * Determine compiling range.
		 * @param [deps] {Object}
		 * @return {Array}
		 */
		range: function (deps) {
			if (deps) {
				var patchList = this._map,
					range = [],
					tmp = {};

				// Reversed dependencies data.
				util.each(deps, function (deps, pathname) {
					deps.forEach(function (dep) {
						if (!tmp[dep]) {
							tmp[dep] = [ pathname ];
						} else {
							tmp[dep].push(pathname);
						}
					});
				});
				deps = tmp;

				// Determine affected files.
				util.each(patchList, function (isDirectory, pathname) {
					range = range.concat(
						isDirectory ? [] : pathname,
						deps[pathname] || []
					);
				});
			} else {
				var sourceList = fs.readDirectory(this._root, '.', true),
					mixedList = util.mix(sourceList, this._map),
					range = [];

				util.each(mixedList, function (isDirectory, pathname) {
					if (!isDirectory) {
						range.push(pathname);
					}
				});
			}

			return range;
		},

		/**
		 * Read a file or directory.
		 * @param pathname {string}
		 * @return {Object|null}
		 */
		read: function (pathname) {
			var root = this._root,
				patch = this._patch,
				map = this._map;

			switch (this._stat(pathname)) {
			case 'file':
				return {
					pathname: pathname,
					data: fs.readFile(map.hasOwnProperty(pathname) ?
						patch : root, pathname)
				};
			case 'dir':
				return {
					pathname: pathname,
					data: null
				};
			default:
				return null;
			}
		},

		/**
		 * Write a file or make a directory.
		 * @param file {Object}
		 */
		write: function (file) {
			var root = this._root;

			if (file.data) {
				fs.writeFile(root, file.pathname, file.data);
			} else {
				fs.makeDirectory(root, file.pathname);
			}
		}
	});

module.exports = Source;
