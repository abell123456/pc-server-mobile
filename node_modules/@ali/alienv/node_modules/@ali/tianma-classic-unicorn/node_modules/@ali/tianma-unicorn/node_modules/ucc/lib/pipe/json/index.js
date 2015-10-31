module.exports = function (config) {
	/**
	 * Validate and minify JSON data.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file;

		try {
			file.data = JSON.stringify(JSON.parse(file.data));
		} catch (err) {
			context.error('JSON syntax error: "%s"',
				file.pathname);
			file.data = '{}';
		}

		next();
	};
};