module.exports = function (config) {
	/**
	 * Convert binary data to string.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file,
			data = file.data;

		if (data.length > 2
			&& !(data[0] ^ 0xEF) && !(data[1] ^ 0xBB) && !(data[2] ^ 0xBF)) {
			// Remove UTF-8 BOM.
			data = data.slice(3);
		}

		file.data = data.toString('binary');

		next();
	};
};