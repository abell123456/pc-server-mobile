var qs = require('querystring'),
	util = require('../util');

	/**
	 * Parse urlencoded post request.
	 * @param bin {Buffer}
	 * @param parameter {string}
	 * @param charset {string}
	 * @return {Object}
	 */
var parse = function (bin, parameter, charset) {
		var text = decodeURIComponent(util.decode(bin, charset)),
			data = qs.parse(text);

		return data;
	};

exports.parse = parse;
