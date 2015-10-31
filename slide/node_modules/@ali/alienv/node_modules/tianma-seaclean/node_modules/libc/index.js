"use strict";

var	util = require('util');

var PATTERN_REQUIRE = /(^|[^\.])\brequire\s*\(\s*['"]([^'"]+?)['"]\s*\)/g;
var PATTERN_FN = /^\s*function.*?\{([\s\S]*)\}\s*$/;
var PATTERN_ILLEGAL = /[^\w]/g;

var TEMPLATE_FN = [
	'var %s = function () {',
		'var exports = {}, module = { exports: exports };',
		'%s',
		'%s = function () { return module.exports; };',
		'return module.exports;',
	'};'
].join('\n');

var TEMPLATE_REQUIRE = [
	'window.require = function (require) {',
	'    var modules = {',
	'        %s',
	'    };',
	'    return function (id) {',
	'        return modules[id] ? modules[id]() : (require ? require(id) : null);',
	'    };',
	'}(window.require);'
].join('\n');

var TEMPLATE_WRAPPER = [
	'(function () {',
		'%s',
	'}());'
].join('\n');

/**
 * Convert module id to an automatic name.
 * @param id {string}
 * @return {string}
 */
function $(id) {
	return '$' + id.replace(PATTERN_ILLEGAL, '_');
}

/**
 * Parse module dependencies tree.
 * @param module {Array}
 * @return {Object}
 */
function parse(modules) {
	var map = {};
	var externals = [];
	var roots = [];
	
	modules.forEach(function (module) {
		map[module.id] = map[module.id] ? 'internal' : 'root';
		
		module.dependencies.forEach(function (id) {
			if (!map[id]) {
				map[id] = 'external';
			} else if (map[id] !== 'external') {
				map[id] = 'internal';
			}
		});
	});
	
	Object.keys(map).forEach(function (id) {
		switch (map[id]) {
		case 'root':
			roots[id] = true;
			roots.push(id);
			break;
		case 'external':
			externals[id] = true;
			externals.push(id);
			break;
		}
	});
	
	return {
		externals: externals,
		roots: roots
	};
}

/**
 * Split an AMD bundle into separate modules.
 * @param code {string}
 * @return {Array}
 */
function split(code) {
	var queue = [];
		
	new Function('define', code).call(null, function (id, deps, fn) {
		queue.push({
			id: id,
			dependencies: deps,
			code: fn.toString().match(PATTERN_FN)[1]
		});
		queue[id] = queue[queue.length - 1];
	});
	
	return queue;
}

/**
 * Repackage CommonJS modules into function form.
 * @param modules {Array}
 * @param externals {Object}
 * @return {string}
 */
function transform(modules, externals) {
	return modules.map(function (module) {
		var id = module.id;

		var dependencies =
			module.dependencies.filter(function (id) {
				return externals[id];
			});

		var code =
			module.code.replace(PATTERN_REQUIRE, function (all, prefix, id) {
				return externals[id] ?
					all : prefix + $(id) + '()';
			});

		return util.format(TEMPLATE_FN, $(id), code, $(id));
	}).join('\n');
}

/**
 * Convert an AMD bundle to self-run code.
 * @param code {string}
 * @param [options] {Object|string}
 * @return {string}
 */
module.exports = function (code, options) {		
	options = options || {};

	var modules = split(code);
	var exports = (options.exports || []).filter(function (id) {
		return modules[id];
	});
	var tree = parse(modules);

	code = [ transform(modules, tree.externals) ];

	// Supply a global require function to export some modules.
	if (exports.length > 0) {
		code.push(util.format(
			TEMPLATE_REQUIRE,
			exports.map(function (id) {
				return '"' + id + '" : ' + $(id)
			}).join(', ')
		));
	}

	// Make unexported entry modules self-run.
	tree.roots.forEach(function (id) {
		if (exports.indexOf(id) === -1) {
			code.push($(id) + '();');
		}
	});

	// Wrap all code in a function scope.
	return util.format(TEMPLATE_WRAPPER, code.join('\n'));
};