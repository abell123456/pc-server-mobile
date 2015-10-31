var clientRequest = require('./client-request'),
	cookie = require('cookie'),
	parser = require('./parser'),
	qs = require('querystring'),
	url = require('url'),
	util = require('./util');

var PATTERN_HREF = /^(\w+:)\/\/([^\/]+@)?([^\/]+?)(:\d+)?(\/[^\?]*)(\?.*)?$/,

	// ServerRequest constructor.
	ServerRequest = util.inherit(Function, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			var request = config.request,
				protocol = request.protocol
					|| (request.connection.encrypted ? 'https:' : 'http:'),
				url = request.url,
				href = protocol + '//' + request.headers.host;

			this._config = config;
			this._headers = request.headers;
			this._body = request.body || new Buffer(0);

			this.method = request.method;
			this.ip = request.client.remoteAddress;

			try {
				url = decodeURI(url);
			} catch (err) {
				// Broken URL falls back to /.
				url = '/';
			}

			href += url;

			this._parseUrl(href);
			this._parseCookie();
			this._parseBody();
		},

		/**
		 * Parse body.
		 */
		_parseBody: function () {
			var config = this._config,
				body = this._body,
				contentType = this._headers['content-type'],
				result;

			if (contentType && body.length > 0) {
				result = parser.parse(body, contentType, config.charset);
				if (result) {
					switch (result.type) {
					case 'application/json':
						this.json = result.data;
						break;
					case 'application/x-www-form-urlencoded': // Fall through.
					case 'multipart/form-data':
						this.form = result.data;
					default:
					}
				}
			}
		},

		/**
		 * Parse and split cookie to pieces.
		 */
		_parseCookie: function () {
			var value = this._headers['cookie'];

			if (value) {
				try {
					this.cookie = cookie.parse(value);
				} catch (err) {
					// Ignore broken cookie.
				}
			}
		},

		/**
		 * Parse and split URL to pieces.
		 * @param href {string}
		 */
		_parseUrl: function (href) {
			var re = href.match(PATTERN_HREF) || {};

			this.href = href;

			this.protocol = re[1];

			this.host = (re[2] || '') + re[3] + (re[4] || '');
			this.auth = re[2] ? re[2].split['@'][0] : '';
			this.hostname = re[3];
			this.port = re[4] ? re[4].split(':')[1]
				: this.protocol === 'http:' ? 80 : 443;

			this.path = re[5] + (re[6] || '');
			this.pathname = re[5];
			this.search = re[6] || '';

			if (re[6]) {
				this.query = qs.parse(re[6].substring(1));
			}
		},

		/**
		 * Get body.
		 * @param [charset] {string}
		 * @return {Buffer|string}
		 */
		body: function (charset) {
			charset = charset || this._config.charset;

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
 * @return {Function}
 */
exports.create = function (config) {
	var fn = clientRequest.create(config);

	fn.__proto__ = new ServerRequest(config);

	return fn;
};
