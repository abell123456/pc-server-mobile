var util = require('../util');

	/**
	 * Parse JSON ajax request.
	 * @param bin {Buffer}
	 * @param parameter {string}
	 * @param charset {string}
	 * @return {Object|null}
	 */
var parse = function (bin, parameter, charset) {
		var json = util.decode(bin, charset),
			data = null;

		try {
			data = JSON.parse(json);
		} catch (err) {
			// Ignore invalid data.
		}

		return data;
	};

exports.parse = parse;
