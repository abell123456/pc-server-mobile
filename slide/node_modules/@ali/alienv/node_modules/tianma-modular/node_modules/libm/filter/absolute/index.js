'use strict';

var util = require('util');
var url = require('url');
var path = require('path');

var	PATTTEN_URL = /url\s*\(\s*(['"]?)([^'"]+?)\1\s*\)/g;
var	PATTTEN_IMPORT_SIMPLE = /@import\s+(['"])([^'"]+?)\1\s*;/g;

module.exports = function () {
	return function (next, done) {
		var relative = '/' + this.relative;

		this.data = this.data.replace(PATTTEN_URL, function (all, quote, id) {
			id = url.resolve(relative, id);
			return 'url(' + id + ')';
		}).replace(PATTTEN_IMPORT_SIMPLE, function (all, quote, id) {
			id = url.resolve(relative, id);
			return '@import ' + quote + id + quote + ';';
		});

		next(done);
	};
};