var fs = require('fs'),
	util = require('./util');

var PATTERN_SHARP = /##?/g,

	/**
	 * Compile filter string to function.
	 * @param filter {string}
	 */
	compile = (function () {
		var cache = {
			'': function () { return true; }
		};

		return function (filter) {
			filter = filter || '';
			if (!cache[filter]) {
				filter = 'return ('
					+ filter.replace(PATTERN_SHARP, function (sharp) {
							return sharp === '#' ? '__index' : '#';
						})
					+ ');'
				cache[filter] = new Function('$', '__index', filter);
			}
			return cache[filter];
		};
	}()),

	/**
	 * Create a Storage instance.
	 * @param filename {string}
	 */
	factory = (function () {
		var cache = {};

		return function (filename) {
			var instance = cache[filename];

			if (!instance) {
				instance = cache[filename] = new Storage({
					filename: filename
				});
			}

			return instance;
		};
	}()),

	/**
	 * Test whether an array value matches a filter.
	 * @param filter {string}
	 * @param value {*}
	 * @param index {number}
	 * @return {boolean}
	 */
	match = function (filter, value, index) {
		return !!compile(filter)(value, index);
	},

	// Storage constructor.
	Storage = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			var filename = this._filename = config.filename;

			if (!fs.existsSync(filename)) {
				fs.writeFileSync(filename, '{}');
			}

			this._data = JSON.parse(
				fs.readFileSync(filename, 'utf-8'));
		},

		/**
		 * Save change to disk.
		 */
		_save: function () {
			var filename = this._filename,
				data = this._data;

			fs.writeFile(filename, JSON.stringify(data), function (err) {
				if (err) {
					throw err;
				}
			});
		},

		/**
		 * Insert a new record.
		 * @param key {string}
		 * @param value {*}
		 * @return {Object}
		 */
		insert: function (key, value) {
			var data = this._data;

			if (!data[key]) {
				data[key] = [ value ];
			} else {
				data[key].push(value);
			}

			this._save();

			return this;
		},

		/**
		 * Remove records.
		 * @param key {string}
		 * @param [filter] {string}
		 * @return {Object}
		 */
		remove: function (key, filter) {
			var data = this._data,
				arr = data[key],
				i;

			if (arr) {
				for (i = 0; i < arr.length; ++i) {
					if (match(filter, arr[i], i)) {
						// Set to undefined first to keep indexes of other value unchanged.
						arr[i] = undefined;
					}
				}

				arr = arr.filter(function (value) { // Compact array.
					return value !== undefined;
				});

				if (arr.length === 0) {
					// Delete empty property.
					delete data[key];
				} else {
					data[key] = arr;
				}
			}

			this._save();

			return this;
		},

		/**
		 * Select records.
		 * @param key {string}
		 * @param [filter] {string}
		 * @return {Array}
		 */
		select: function (key, filter) {
			var data = this._data,
				arr = data[key],
				result = [],
				i, len;

			if (arr) {
				for (i = 0, len = arr.length; i < len; ++i) {
					if (match(filter, arr[i], i)) {
						result.push(arr[i]);
					}
				}
			}

			return result;
		},

		/**
		 * Update records.
		 * @param key {string}
		 * @param value {*}
		 * @param [filter] {string}
		 * @return {Object}
		 */
		update: function (key, value, filter) {
			var data = this._data,
				arr = data[key],
				i, len;

			if (arr) {
				for (i = 0, len = arr.length; i < len; ++i) {
					if (match(filter, arr[i], i)) {
						arr[i] = value;
					}
				}
			}

			this._save();

			return this;
		}
	});

module.exports = factory;
