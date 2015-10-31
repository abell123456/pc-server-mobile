var UCC = require('ucc');

/**
 * Mount pipelines to compiler per mode.
 * @param compiler {Object}
 */
var MOUNT = {
		'dev': function (compiler) {
			compiler
				.mount('.js', [
					'decode', 'dependency', 'nocomment',
					'modular', 'stamp', 'encode' ])
				.mount('.css', [
					'decode', 'dependency', 'stamp', 'nocomment', 'encode' ])
				.mount('.json', [
					'decode', 'json', 'encode' ])
				.mount('.tpl', [
					'decode', 'template', 'encode' ]);
		},

		'test': function (compiler) {
			compiler
				.mount('.js', [
					'decode', 'dependency', 'nocomment',
					'modular', 'stamp', 'minify', 'encode' ])
				.mount('.css', [
					'decode', 'dependency', 'stamp', 'minify', 'encode' ])
				.mount('.json', [
					'decode', 'json', 'encode' ])
				.mount('.tpl', [
					'decode', 'template', 'encode' ]);
		}
	};

/**
 * Generate a compiler.
 * @param config {Object}
 * @return {Object}
 */
exports.generate = function (config) {
	var compiler = new UCC({
			options: {
				'modular': {
					'alias': config.alias,
					'whitelist': config.modules
				}
			},
			reader: function (pathname, callback) {
				config.loader(pathname, function (file) {
					if (file === null) {
						callback(null);
					} else {
						callback(file);
					}
				});
			},
			writer: function (file, callback) {
                if (file.data) {
                    config.cache[file.pathname] = {
                        data : file.data,
                        mtime: file.mtime
                    };
                }
				callback();
			}
		});

	if (config.mode in MOUNT) {
		MOUNT[config.mode](compiler);
	}

	return compiler;
};