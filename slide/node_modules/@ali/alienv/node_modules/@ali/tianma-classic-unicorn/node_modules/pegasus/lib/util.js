var iconv = require('iconv-lite'),
	mime = require('mime'),
	nativeUtil = require('util');

	// CustomError constructor.
var CheckedError = (function () {
		function ctor(err) {
			err.__proto__ = this.__proto__;

			return err;
		}

		ctor.prototype.__proto__ = Error.prototype;

		return ctor;
	}()),

	/**
	 * Throw a CustomError object.
	 * @param msg {string|Error}
	 */
	throwError = exports.throwError = function (err) {
		err = isError(err) ?
			err : new Error(format.apply(null, arguments));

		throw new CheckedError(err);
	},

	/**
	 * Format printf-like string.
	 * @param template {string}
	 * @param value {*}
	 * @return {string}
	 */
	format = exports.format = nativeUtil.format,

	/**
	 * Output message with time stamp on stdout.
	 * @param msg {string}
	 */
	log = exports.log = function (msg) {
		console.log('[%s] %s',
			new Date().toLocaleTimeString(), format.apply(null, arguments));
	},

	/**
	 * Output message with time stamp on stderr.
	 * @param msg {string}
	 */
	error = exports.error = function () {
		console.error('[%s] %s',
			new Date().toLocaleTimeString(), format.apply(null, arguments));
	},

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
	 * Test whether type of input value is CustomError.
	 * @param value {*}
	 * @return {boolean}
	 */
	isCheckedError = exports.isCheckedError = function (value) {
		return value instanceof CheckedError;
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
	 * @return {boolean}
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
	 * Remove duplicate items from an array.
	 * @param arr {Array}
	 * @return {Array}
	 */
	unique = exports.unique = function (arr) {
		return arr.filter(function (value, index, arr) {
			return arr.indexOf(value) === index;
		});
	},

	/**
	 * Test wildcard pattern on given value.
	 * @param pattern {string}
	 * @param value {string}
	 * @return {boolean}
	 */
	wildcard = exports.wildcard = (function () {
		var PATTERN_SPECIAL_CHAR = /([\$\(\)\+\.\[\]\\\/\^\{\}\|])/g,
			PATTERN_QUESTION = /\?/g,
			PATTERN_ASTERISK = /\*/g,
			PATTERN_CARET = /^/,
			PATTERN_DOLLAR = /$/,
			cache = {};

		return function (pattern, value) {
			if (!cache[pattern]) {
				cache[pattern] = new RegExp(pattern
					.replace(PATTERN_SPECIAL_CHAR, '\\$1')	// Escape special characters.
					.replace(PATTERN_QUESTION, '.')	// Change wildcard character "?" to regular expression.
					.replace(PATTERN_ASTERISK, '.*?')	// Change wildcard character "*" to regular expression.
					.replace(PATTERN_CARET, '^')
					.replace(PATTERN_DOLLAR, '$'));
			}
			return cache[pattern].test(value);
		};
	}()),

	/**
	 * Store multiple value with the same key.
	 * @param obj {Object}
	 * @param key {string}
	 * @param value {*}
	 */
	append = exports.append = function (obj, key, value) {
		if (!(key in obj)) {
			obj[key] = value;
		} else if (isArray(obj[key])) {
			obj[key].push(value);
		} else {
			obj[key] = [ obj[key], value ];
		}
	},

	/**
	 * Fill template with data.
	 * Modified version of Simple JavaScript Templating
	 * John Resig - http://ejohn.org/ - MIT Licensed
	 * @param str {string}
	 * @param [data] {Object}
	 * @return {string|Function}
	 */
	tmpl = exports.tmpl = (function () {
		var PATTERN_BACK_SLASH = /\\/g,
			PATTERN_LITERAL = /%>([\s\S]*?)<%/gm,
			PATTERN_QUOTE = /"/g,
			PATTERN_CR = /\r/g,
			PATTERN_LF = /\n/g,
			PATTERN_TAB = /\t/g,
			PATTERN_EXP = /<%=(.*?)%>/g,
			cache = {};

		return function (str, data) {
			var fn;

			if (!cache[str]) {
				cache[str] = new Function(
					'data',
					'var p=[],print=function(){p.push.apply(p,arguments);};' +
					'with(data){' +
						('%>' + str + '<%')
							.replace(PATTERN_LITERAL, function ($0, $1) {
								return '%>'
									+ $1.replace(PATTERN_BACK_SLASH, '\\\\')
										.replace(PATTERN_QUOTE, '\\"')
										.replace(PATTERN_CR, '\\r')
										.replace(PATTERN_LF, '\\n')
										.replace(PATTERN_TAB, '\\t')
									+ '<%';
							})
							.replace(PATTERN_EXP, '",$1,"')
							.replace(PATTERN_LITERAL, 'p.push("$1");') +
					'}return p.join("");'
				);
			}

			fn = cache[str];

			return data ? fn(data) : fn;
		};
	}()),

	/**
	 * Convert string to binary using specified charset.
	 * @param str {string}
	 * @param charset {string}
	 * @return {Buffer}
	 */
	encode = exports.encode = iconv.encode,

	/**
	 * Convert binary to string using specified charset.
	 * @param bin {Buffer}
	 * @param charset {string}
	 * @return {string}
	 */
	decode = exports.decode = iconv.decode,

	/**
	 * Lookup a mime type based on extension.
	 * @param extname {string}
	 * @return {string}
	 */
	mime = exports.mime = mime.lookup.bind(mime),

	/**
	 * Make a request.
	 * @param options {Object|string}
	 * @param callback {Function}
	 */
	request = exports.request = require('./request');
