var Compiler = require('./compiler'),
	Preprocessor = require('./preprocessor');

var PATTERN_DEFINE = /^\s*define\s*\(\s*(?:function|\{)/m;

module.exports = function (config) {
	var whitelist = config.whitelist || [],
		preprocessor = new Preprocessor(config),
		compiler = new Compiler(config);

	/**
	 * Compile anonymous CMD module.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file,
			match = whitelist.some(function (value) {
				return file.pathname.indexOf(value) === 0
					&& PATTERN_DEFINE.test(file.data);
			});

		if (match) {
			preprocessor.process(context, function () {
				compiler.compile(context, next);
			});
		} else {
			next();
		}
	};
};
