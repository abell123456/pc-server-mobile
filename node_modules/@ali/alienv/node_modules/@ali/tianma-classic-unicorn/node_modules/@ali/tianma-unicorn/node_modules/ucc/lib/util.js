var nativeUtil = require('util');

	/**
	 * Format printf-like string.
	 * @param template {string}
	 * @param value {*}
	 * @return {string}
	 */
var	format = exports.format = nativeUtil.format,

	/**
	 * Test whether type of input value is Array.
	 * @param value {*}
	 * @return {boolean}
	 */
	isArray = exports.isArray = nativeUtil.isArray,

	/**
	 * Test whether type of input value is Boolean.
	 * @param value {*}
	 * @return {boolean}
	 */
	isBoolean = exports.isBoolean = function (value) {
		return typeof value === 'boolean';
	},

	/**
	 * Test whether type of input value is Date.
	 * @param value {*}
	 * @return {boolean}
	 */
	isDate = exports.isDate = nativeUtil.isDate,

	/**
	 * Test whether type of input value is Error.
	 * @param value {*}
	 * @return {boolean}
	 */
	isError = exports.isError = nativeUtil.isError,

	/**
	 * Test whether type of input value is Function.
	 * @param value {*}
	 * @return {boolean}
	 */
	isFunction = exports.isFunction = function (value) {
		return typeof value === 'function';
	},

	/**
	 * Test whether type of input value is Null.
	 * @param value {*}
	 * @return {boolean}
	 */
	isNull = exports.isNull = function (value) {
		return value === null;
	},

	/**
	 * Test whether type of input value is Number.
	 * @param value {*}
	 * @return {boolean}
	 */
	isNumber = exports.isNumber = function (value) {
		return typeof value === 'number' && isFinite(value);
	},

	/**
	 * Test whether type of input value is Object.
	 * @param value {*}
	 * @return {boolean}
	 */
	isObject = exports.isObject = function (value) {
		return value === Object(value);
	},

	/**
	 * Test whether type of input value is RegExp.
	 * @param value {*}
	 * @return {boolean}
	 */
	isRegExp = exports.isRegExp = nativeUtil.isRegExp,

	/**
	 * Test whether type of input value is String.
	 * @param value {*}
	 * @return {boolean}
	 */
	isString = exports.isString = function (value) {
		return typeof value === 'string';
	},

	/**
	 * Test whether type of input value is Undefined.
	 * @param value {*}
	 * @return {boolean}
	 */
	isUndefined = exports.isUndefined = function(value) {
		return typeof value === 'undefined';
	},

	/**
	 * Convert array-like object to array.
	 * @param value {*}
	 * @return {Array}
	 */
	toArray = exports.toArray = (function () {
		var slice = Array.prototype.slice;

		return function (obj) {
			return slice.call(obj);
		};
	}()),

	/**
	 * Get type of input value.
	 * Copyright 2011 Yahoo! Inc. All rights reserved.
	 * @param value {*}
	 * @return {string}
	 */
	type = exports.type = (function () {
		var TYPES = {
				'undefined'        : 'undefined',
				'number'           : 'number',
				'boolean'          : 'boolean',
				'string'           : 'string',
				'[object Function]': 'function',
				'[object RegExp]'  : 'regexp',
				'[object Array]'   : 'array',
				'[object Date]'    : 'date',
				'[object Error]'   : 'error'
			},
			toString = Object.prototype.toString;

		return function (value) {
			return TYPES[typeof value]
				|| TYPES[toString.call(value)]
				|| (value ? 'object' : 'null');
		};
	}()),

	/**
	 * Create a child constructor.
	 * @param parent {Function}
	 * @param prototype {Object}
	 * @return {Function}
	 */
	inherit = exports.inherit = function (parent, prototype) {
		var child = function () {
				if (isFunction(this._initialize)) {
					this._initialize.apply(this, arguments);
				}
			};

		prototype.__proto__ = parent.prototype;

		Object.defineProperty(prototype, 'constructor', {
			enumerable: false,
			value: child
		});

		child.prototype = prototype;
		child.superclass = parent.prototype;
		child.extend = inherit.bind(null, child);

		return child;
	},

	/**
	 * Shallow copy properties from souce object to target object.
	 * @param target {Object}
	 * @param source {Object+}
	 * @param [overwrite] {boolean}
	 * @return {Object}
	 */
	mix = exports.mix = function () {
		var args = toArray(arguments),
			target = args.shift() || {},
			overwrite = isBoolean(args[args.length - 1]) ? args.pop() : true;

		args.forEach(function (source) {
			if (source) {
				keys(source).forEach(function (key) {
					if (!target.hasOwnProperty(key) || overwrite) {
						target[key] = source[key];
					}
				});
			}
		});

		return target;
	},

	/**
	 * Shallow copy properties from souce object to new-created empty object.
	 * @param source {Object+}
	 * @return {Object}
	 */
	merge = exports.merge = function () {
		var args = toArray(arguments);

		args.unshift({});

		return mix.apply(null, args);
	},

	/**
	 * Iterate key-value pair in object or array.
	 * @param obj {Object}
	 * @param iterator {Function}
	 * @param context {Object}
	 */
	each = exports.each = function (obj, iterator, context) {
		keys(obj).forEach(function (key) {
			iterator.call(context || null, obj[key], key, obj);
		});
	},

	/**
	 * Get keys of an object.
	 * @param obj {Object}
	 * @return {Array}
	 */
	keys = exports.keys = Object.keys,

	/**
	 * Get values of an object.
	 * @param obj {Object}
	 * @return {Array}
	 */
	values = exports.values = function (obj) {
		var result = [];

		each(obj, function (value) {
			result.push(value);
		});

		return result;
	},

	/**
	 * Remove duplicate string value from an array.
	 * @param arr {Array}
	 * @return {Array}
	 */
	unique = exports.unique = function (arr) {
		var visited = {},
			output = [],
			i = 0,
			len = arr.length,
			value;

		for (; i < len; ++i) {
			value = arr[i];

			if (!(visited[value])) {
				visited[value] = true;
				output.push(value);
			}
		}

		return output;
	};