var fs = require('fs'),
	path = require('path'),
	util = require('../lib/util');

var PATTERN_BACKSLASH = /\\/g,

	/**
	 * Remove all contents in a directory.
	 * @root {string}
	 * @param [pathname] {string}
	 * @param [removeRoot] {boolean}
	 * @param [whitelist] {Array}
	 */
	empty = exports.empty = function (root, pathname, removeRoot, whitelist) {
		var tmp = {};

		tmp[pathname] = !removeRoot;

		(whitelist || []).forEach(function (pathname) {
			var parts = pathname
					.replace(PATTERN_BACKSLASH, '/')
					.split('/');

			while (parts.length > 0) {
				tmp[parts.join('/')] = true;
				parts.pop();
			}

			tmp['.'] = true;
		});

		whitelist = tmp;

		(function next(current) {
			// Empty child directory first.
			var result = readDirectory(root, current, false, true);

			delete result[current];

			util.each(result, function (isDirectory, pathname) {
				if (isDirectory) {
					next(pathname);
				} else if (!whitelist[pathname]) {
					fs.unlinkSync(path.join(root, pathname));
				}
			});

			// Remove self.
			if (!whitelist[current]) {
				fs.rmdirSync(path.join(root, current));
			}
		}(pathname));
	},

	/**
	 * Make directory and all parents.
	 * @param pathname {string}
	 */
	makeDirectory = exports.makeDirectory = function (root, pathname) {
		(function next(pathname) {
			if (!fs.existsSync(pathname)) {
				// At first, make parent directory.
				next(path.resolve(pathname, '..'));
				// Then, make current directory.
				fs.mkdirSync(pathname);
			}
		}(path.join(root, pathname)));
	},

	/**
	 * Mix two directories.
	 * @param target {string}
	 * @param source {string}
	 */
	mix = exports.mix = function (target, source) {
		util.each(readDirectory(source, '.', true), function (isDirectory, pathname) {
			if (isDirectory) {
				makeDirectory(target, pathname);
			} else {
				writeFile(target, pathname, readFile(source, pathname));
			}
		});
	},

	/**
	 * Read a directory.
	 * @param root {string}
	 * @param pathname {string}
	 * @param [recursive] {boolean}
	 * @param [all] {boolean}
	 * @return {Object}
	 */
	readDirectory = exports.readDirectory = function (root, pathname, recursive, all) {
		var result = {};

		result[pathname] = true;

		(function next(current) {
			fs.readdirSync(path.join(root, current)).forEach(function (pathname) {
				if (all || pathname[0] !== '.') { // Ignore hidden file.
					pathname = path.join(current, pathname)
						.replace(PATTERN_BACKSLASH, '/');

					if ((result[pathname] = (stat(root, pathname) === 'dir')) && recursive) {
						next(pathname); // List sub directory.
					}
				}
			});
		}(pathname));

		return result;
	},

	/**
	 * Read a file.
	 * @param root {string}
	 * @param pathname {string}
	 * @return {Object}
	 */
	readFile = exports.readFile = function (root, pathname) {
		return fs.readFileSync(path.join(root, pathname));
	},
    /**
     * remove a file
     * @param root {string}
     * @param pathname {string}
     */
    removeFile = exports.removeFile = function (root, pathname){
        return fs.unlinkSync(path.join(root, pathname));
    },

	/**
	 * Determine file type.
	 * @param root {string}
	 * @param pathname {string}
	 * @return {string|null}
	 */
	stat = exports.stat = function (root, pathname) {
		pathname = path.join(root, pathname);

		if (fs.existsSync(pathname)) {
			if (fs.statSync(pathname).isDirectory()) {
				return 'dir';
			} else {
				return 'file';
			}
		} else {
			return null;
		}
	},

	/**
	 * Write file or directory.
	 * @param root {string}
	 * @param pathname {string}
	 * @param data {Object}
	 */
	writeFile = exports.writeFile = function (root, pathname, data) {
		// Create parent directory first.
		makeDirectory(root, path.dirname(pathname));

		// Write file.
		fs.writeFileSync(path.join(root, pathname), data);
	};
