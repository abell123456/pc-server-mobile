var pegasus = require('pegasus'),
	util = pegasus.util,
	Unicorn = require('./unicorn'),
	Version = require('./version'),
	UnicornJIT = require('./unicorn-jit');

var FACTORY = {},

	CONFIG = {};

FACTORY.dev = FACTORY.test = pegasus.createPipe(UnicornJIT);

FACTORY.combo = pegasus.createPipe(Unicorn);

FACTORY.version = pegasus.createPipe(Version);

CONFIG.prod = CONFIG.test = {
	longExpires: 31536000,
	normalExpires: 1800,
	shortExpires: 30
};

CONFIG.dev = {
	longExpires: 0,
	normalExpires: 0,
	shortExpires: 0
};

/**
 * Call different factory per mode.
 * @param config {Object}
 * @return {Function}
 */
exports = module.exports = function (config) {
	config = util.mix({
		mode: 'dev',
		source: null,
		patch: null
	}, config);

	config = util.mix(config, CONFIG[config.mode]);

	return (FACTORY[config.mode] || FACTORY.dev)(config);
};

['combo', 'version'].forEach(function (name) {
	exports[name] = function (config) {
		config = util.mix(config, CONFIG['prod']);
		return FACTORY[name](config);
	};
});


