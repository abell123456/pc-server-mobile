var util = require('./util');

	// ClientResponse constructor.
var	ClientResponse = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this.status = config.status || 404;

			this._charset = config.charset || 'binary';
			this._headers = config.headers || {};
			this._body = config.body || new Buffer(0);
		},

		/**
		 * Get body.
		 * @param [charset] {string}
		 * @return {Buffer|string}
		 */
		body: function (charset) {
			charset = charset || this._charset;

			return charset === 'binary' ?
				this._body :
				util.decode(this._body, charset);
		},

		/**
		 * Get a header field or the whole headers.
		 * @param [key] {string}
		 * @return {string|Object}
		 */
		head: function (key) {
			if (key) {
				return this._headers[key];
			} else {
				return this._headers;
			}
		}
	});

/**
 * Create an instance.
 * @param config {Object}
 * @return {Object}
 */
exports.create = function (config) {
	return new ClientResponse(config);
};
