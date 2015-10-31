var fs = require('./fs'),
	util = require('../lib/util');

var Target = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._root = config.root;
		},

		/**
		 * Clean target directory.
		 */
		cleanup: function () {
			fs.empty(this._root, '.', false, [ '.meta' ]);
		},

        /**
         * remove file
         * @param pathname
         */
        remove: function (pathname){
            var root = this._root;

            fs.removeFile(root, pathname);
        },

		/**
		 * Read a file or directory.
		 * @param pathname {string}
		 * @return {Object|null}
		 */
		read: function (pathname) {
			var root = this._root;

			switch (fs.stat(root, pathname)) {
			case 'file':
				return {
					pathname: pathname,
					data: fs.readFile(root, pathname)
				};
			case 'dir':
				return {
					pathname: patname,
					data: null
				};
			default:
				return null;
			}
		},

		/**
		 * Write a file or make a directory.
		 * @param file {Object}
		 * @return {Error|null}
		 */
		write: function (file) {
			var root = this._root;

			if (file.data === null) {
				fs.makeDirectory(root, file.pathname);
			} else {
				fs.writeFile(root, file.pathname, file.data);
			}
		}
	});

module.exports = Target;