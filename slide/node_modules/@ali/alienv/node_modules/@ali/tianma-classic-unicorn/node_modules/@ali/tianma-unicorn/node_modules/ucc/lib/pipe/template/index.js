var	PATTERN_SPECIAL_CHAR = /["\\\r\n\t\f]/g,

	ESCAPE = {
		'"': '\\"',
		'\r': '\\r',
		'\n': '\\n',
		'\t': '\\t',
		'\f': '\\f'
	};

module.exports = function (config) {
	/**
	 * Convert text file to JS string.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file;

		file.data = '"'
			+ file.data.replace(PATTERN_SPECIAL_CHAR, function (char) {
				return ESCAPE[char];
			})
			+ '"';

		next();
	};
};