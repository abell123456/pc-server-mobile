var pipe = require('./pipe'),
	util = require('./util'),
	version = require('./version'),
	Router = require('./router');

/**
 * Create a Router instance.
 * @param config {Object}
 * @return {Object}
 */
exports.createRouter = function (config) {
	return new Router(config);
};

/**
 * Create a pipe function.
 * @param ctor {Function|Object}
 * @return {Function}
 */
exports.createPipe = function (ctor) {
	return pipe.create(ctor);
};

// Export utility functions.
exports.util = util;

// Export version number.
exports.version = version.number;
