'use strict';

var nutil = require('util'),

	Stream = require('stream').Stream,

	toString = Object.prototype.toString;

/**
 * Format printf-like string.
 * @param template {string}
 * @param value {*}
 * @return {string}
 */
var	format = exports.format = nutil.format;

/**
 * Test whether type of input value is Array.
 * @param value {*}
 * @return {boolean}
 */
var isArray = exports.isArray = nutil.isArray;

/**
 * Test whether type of input value is Boolean.
 * @param value {*}
 * @return {boolean}
 */
var isBoolean = exports.isBoolean = function (value) {
	return typeof value === 'boolean';
};

/**
 * Test whether type of input value is Buffer.
 * @param value {*}
 * @return {boolean}
 */
var isBuffer = exports.isBuffer = function (value) {
	return value instanceof Buffer;
};

/**
 * Test whether type of input value is Date.
 * @param value {*}
 * @return {boolean}
 */
var isDate = exports.isDate = nutil.isDate;

/**
 * Test whether type of input value is Error.
 * @param value {*}
 * @return {boolean}
 */
var isError = exports.isError = nutil.isError;

/**
 * Test whether type of input value is Function.
 * @param value {*}
 * @return {boolean}
 */
var isFunction = exports.isFunction = function (value) {
	return typeof value === 'function';
};

/**
 * Test whether type of input value is Generator.
 * @param value {*}
 * @return {boolean}
 */
var isGenerator = exports.isGenerator = function (value) {
	return (Object(value).constructor || {}).name === 'GeneratorFunction';
};

/**
 * Test whether type of input value is Null.
 * @param value {*}
 * @return {boolean}
 */
var isNull = exports.isNull = function (value) {
	return value === null;
};

/**
 * Test whether type of input value is Number.
 * @param value {*}
 * @return {boolean}
 */
var isNumber = exports.isNumber = function (value) {
	return typeof value === 'number' && isFinite(value);
};

/**
 * Test whether type of input value is Object.
 * @param value {*}
 * @return {boolean}
 */
var isObject = exports.isObject = function (value) {
	return toString.call(value) === '[object Object]';
};

/**
 * Test whether type of input value is RegExp.
 * @param value {*}
 * @return {boolean}
 */
var isRegExp = exports.isRegExp = nutil.isRegExp;

/**
 * Test whether type of input value is Buffer.
 * @param value {*}
 * @return {boolean}
 */
var isStream = exports.isStream = function (value) {
	return value instanceof Stream;
};

/**
 * Test whether type of input value is String.
 * @param value {*}
 * @return {boolean}
 */
var isString = exports.isString = function (value) {
	return typeof value === 'string';
};

/**
 * Test whether type of input value is Undefined.
 * @param value {*}
 * @return {boolean}
 */
var isUndefined = exports.isUndefined = function(value) {
	return typeof value === 'undefined';
};

/**
 * Convert array-like object to array.
 * @param value {*}
 * @return {boolean}
 */
var toArray = exports.toArray = (function () {
	var slice = Array.prototype.slice;

	return function (obj) {
		return slice.call(obj);
	};
}());

/**
 * Create a child constructor.
 * @param parent {Function}
 * @param prototype {Object}
 * @return {Function}
 */
var inherit = exports.inherit = function (parent, prototype) {
	var ctor = prototype.hasOwnProperty('constructor') ?
			prototype.constructor : function () {};

	prototype.__proto__ = parent.prototype;

	Object.defineProperty(prototype, 'constructor', {
		enumerable: false,
		value: ctor
	});

	ctor.prototype = prototype;
	ctor.super = parent.prototype;

	return ctor;
};

/**
 * Shallow copy properties from souce object to target object.
 * @param target {Object}
 * @param source {Object+}
 * @param [overwrite] {boolean}
 * @return {Object}
 */
var mix = exports.mix = function () {
	var args = toArray(arguments),
		target = args.shift() || {},
		overwrite = isBoolean(args[args.length - 1]) ? args.pop() : true,
		i, len1, source, arr, key, j, len2;

	for (i = 0, len1 = args.length; i < len1; ++i) {
		if (source = args[i]) { // Assign
			arr = keys(source);
			for (j = 0, len2 = arr.length; j < len2; ++j) {
				key = arr[j];
				if (!target.hasOwnProperty(key) || overwrite) {
					target[key] = source[key];
				}
			}
		}
	}

	return target;
};

/**
 * Shallow copy properties from souce object to new-created empty object.
 * @param source {Object+}
 * @param [overwrite] {boolean}
 * @return {Object}
 */
var merge = exports.merge = function () {
	var args = toArray(arguments);

	args.unshift({});

	return mix.apply(null, args);
};

/**
 * Iterate key-value pair in object or array.
 * @param obj {Object}
 * @param iterator {Function}
 * @param context {Object}
 */
var each = exports.each = function (obj, iterator, context) {
	var arr = keys(obj),
		len = arr.length,
		i = 0,
		key;

	for (; i < len; ++i) {
		key = arr[i];
		iterator.call(context || null, obj[key], key, obj);
	}
};

/**
 * Get keys of an object.
 * @param obj {Object}
 * @return {Array}
 */
var keys = exports.keys = Object.keys;

/**
 * Get values of an object.
 * @param obj {Object}
 * @return {Array}
 */
var values = exports.values = function (obj) {
	var result = [];

	each(obj, function (value) {
		result.push(value);
	});

	return result;
};
