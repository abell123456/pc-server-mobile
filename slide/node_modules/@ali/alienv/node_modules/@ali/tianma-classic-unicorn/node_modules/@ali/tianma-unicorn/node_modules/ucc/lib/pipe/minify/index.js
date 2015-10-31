var cleanCSS = require('../../third/clean-css'),
	parser = require('../../third/uglify-js').parser,
	path = require('path'),
	uglify = require('../../third/uglify-js').uglify;

	/**
	 * Minify JS.
	 * @param context {Object}
	 */
var	minifyJS = function (context) {
		var file = context.file;

		try {
			var ast = parser.parse(file.data);

			ast = uglify.ast_mangle(ast, {
				except: [ 'require' ]
			});
			ast = uglify.ast_squeeze(ast);

			file.data = uglify.gen_code(ast) + ';';
		} catch (err) {
			context.error('JS syntax error: "%s" (line %s, col %s)',
				file.pathname, err.line, err.col);
			file.data += ';'
		}
	},

	/**
	 * Minify CSS.
	 * @param context {Object}
	 */
	minifyCSS = function (context) {
		var file = context.file;

		try {
			file.data = cleanCSS.process(file.data);
		} catch (err) {
			context.error('CSS syntax error: "%s"',
				file.pathname);
		}
	};

module.exports = function (config) {
	/**
	 * Minify JS and CSS.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		switch (path.extname(context.file.pathname)) {
		case '.js':
			minifyJS(context);
			break;
		case '.css':
			minifyCSS(context);
			break;
		default:
		}

		next();
	};
};