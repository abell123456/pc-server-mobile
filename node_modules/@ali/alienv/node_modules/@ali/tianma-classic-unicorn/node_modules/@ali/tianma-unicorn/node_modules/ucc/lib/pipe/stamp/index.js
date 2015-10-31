var PATTERN_STAMP = /(['"])((?:\w+\:)?(?:\/\/[^\/'"]*)?\/?)([^'"]+?\.(?:js|css))\?\{stamp\}\1/g,
	PATTERN_IMAGE_FONT_DEPS = /url\s*\(\s*(["']?)\/([^\/][^"'\)]*?\.(?:png|jpg|gif|jpeg|eot|woff|ttf|svg))(?:\?[^"']+?)?\1\s*\)/g,
	path = require('path');

//stamp JS file
var stampJS = function (context, next, pattern) {
	var file = context.file,
		data = file.data,
		pathnames = [],
		re;

	pattern.lastIndex = 0;

	while (re = pattern.exec(data)) { // Assign.
		pathnames.push(re[3]);
	}

	context.use(pathnames, function (files) {
		file.data = data
			.replace(pattern, function (all, quote, prefix, pathname) {
				var f = files.shift();

				if (f === null) {
					context.error('Cannot read stamped file: "%s" -> "%s"',
						file.pathname, pathname);
					return quote + prefix + pathname + quote;
				} else {
					return quote
						+ prefix
						+ pathname
						+ '?t='
						+ f.meta.dataHash.toString(16)
						+ '_'
						+ f.meta.depsHash.toString(16)
						+ quote;
				}
			});

		next();
	});
};

var stampCSS = function (context, next, pattern) {
	var file = context.file,
		data = file.data,
		pathnames = [],
		re;

	pattern.lastIndex = 0;

	while (re = pattern.exec(data)) {
		pathnames.push(re[2]);
	}

	context.use(pathnames, function (files) {
		file.data = data
			.replace(pattern, function (all, quote, pathname) {
				var f = files.shift();
				if (f === null) {
					context.error('Cannot read css refrence image: "%s" -> "%s"',
						file.pathname, pathname);
					return all;
				} else {
					return 'url(/'
						+ pathname
						+ '?t='
						+ f.meta.dataHash.toString(16)
						+ '_'
						+ f.meta.depsHash.toString(16)
						+ ')';
				}
			});

		next();
	});
};


module.exports = function (config) {
	/**
	 * Stamp JS or CSS pathnames.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file,
			extname = path.extname(file.pathname);

		if (extname === '.js') {
			stampJS(context, next, PATTERN_STAMP);
		} else if (extname === '.css') {
			stampCSS(context, next, PATTERN_IMAGE_FONT_DEPS);
		} else {
			next();
		}
	};
};

