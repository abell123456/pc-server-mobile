var util = require('../util');

var PATTERN_CONTENT_TYPE = /^(.*?)\s*(?:;\s*(.*))?$/,

	PARSER = {
		'application/json': require('./json'),
		'application/x-www-form-urlencoded': require('./urlencoded'),
		'multipart/form-data': require('./multipart')
	},

	/**
	 * Parse request body.
	 * @param bin {Buffer}
	 * @param contentType {string}
	 * @param charset {string}
	 * @return {Object|null}
	 */
	parse = function (bin, contentType, charset) {
		var re = contentType.match(PATTERN_CONTENT_TYPE),
			type,
			parameter,
			parser,
			data;

		if (re) {
			type = re[1];
			parameter = re[2] || '';
			parser = PARSER[type];
			data = parser && parser.parse(bin, parameter, charset);
			if (data) {
				return {
					data: data,
					type: type
				};
			}
		}

		return null;
	};

exports.parse = parse;