'use strict';

var util = require('util');
var url = require('url');
var path = require('path');

var	PATTERN_REQUIRE_CSS = /@require\s+(['"])([^'"]+?)\1\s*;?/g;

module.exports = function () {
	return function (next, done) {
		this.data = this.data.replace(PATTERN_REQUIRE_CSS, function (match, quote, id) {
			return '@import url(' + quote + id + quote + ');';
		});

		next(done);
	};
};