'use strict';

var util = require('mini-util');
var request = require('./lib/request');

var PATTERN_REPLACEMENT = /\$(\d+)/g;
var	PATTERN_URL = /^(\w+\:)?\/\//;

/**
 * Filter factory.
 * @param [rule] {Object}
 * @return {Function}
 */
module.exports = function (rule) {
	rule = rule || {};

	/**
	 * Apply a matched rule.
	 * @param path {string}
	 * @return {string|null}
	 */
	function match(path) {
		var keys = util.keys(rule);
		var replacement, pattern, re;

		for (var i = 0, len = keys.length; i < len; ++i) {
			replacement = keys[i];
			pattern = rule[replacement];

			if (re = path.match(pattern)) { // Assign.
				return replacement
					.replace(PATTERN_REPLACEMENT, function (all, index) {
						return re[index];
					});
			}
		}

		return null;
	}

	return function *(next) {
		var req = this.request;
		var res = this.response;
		var original = req.url();
		var href = match(req.path);

		if (href) {
			if (PATTERN_URL.test(href)) { // Proxy.
				var response = yield request({
					method: req.method(),
					href: href,
					headers: util.merge(req.head()), // Make a copy.
					body: req.data()
				});

				res.status(response.statusCode)
					.head(response.headers)
					.data(response.body);

				if (res.status() !== 200) { // Let the follows do.
					yield next;
				}
			} else { // Redirect.
				req.url(href);
				yield next;
				req.url(original);
			}
		} else { // Bypass.
			yield next;
		}
	};
};
