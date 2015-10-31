var clientResponse = require('./client-response'),
	url = require('url'),
	util = require('./util'),
	version = require('./version');

var PATTERN_DRIVE_LETTER = /\/\w:/,

	PATTERN_LOOP = /^loop:/,

	// ClientRequest contructor.
	ClientRequest = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._charset = config.charset;
			this._route = config.router;
			this._request = config.request;
		},

		/**
		 * Loop request to another pipeline.
		 * @param pathname {string}
		 * @param callback {Function}
		 */
		_loop: function (options, callback) {
			var router = this._route,
				parentRequest = this._request,
				config = {
					charset: this._charset
				},
				request = { // Fake native request.
					body: options.body,
					client: {
						remoteAddress: '127.0.0.1'
					},
					headers: options.headers,
					method: options.method,
					protocol: 'loop:',
					url: options.url
				},
				response = { // Fake native response.
					_fake: true,
					writeHead: function (status, headers) {
						config.status = status;
						config.headers = headers;
					},
					write: function (body) {
						config.body = body;
					},
					end: function () {
						delete parentRequest.loop;
						callback(clientResponse.create(config));
					}
				};

			parentRequest.loop = request;

			setImmediate(function () {
				router(request, response);
			});
		},

		/**
		 * Make a request.
		 * @param options {Object|string}
		 * @param callback {Function}
		 */
		request: function (options, callback) {
			// Refine arguments.
			if (util.isString(options)) {
				options = {
					href: options
				};
			}

			if (!options.headers) {
				options.headers = {};
			}

			var charset = this._charset,
				meta;

			if (util.isString(options.body)) { // Convert body to binary.
				options.body = util.encode(options.body, charset);
			}

			if (PATTERN_LOOP.test(options.href)) {
				meta = url.parse(options.href);
				this._loop({
					body: options.body || new Buffer(0),
					headers: util.mix({
						host: meta.host,
						'user-agent': 'pegasus/' + version.number
					}, options.headers),
					method: options.method || 'GET',
					url: meta.path
				}, callback);
			} else {
				util.request(options, function (response) {
					callback(clientResponse.create({
						charset: charset,
						status: response.statusCode,
						headers: response.headers || {},
						body: response.body || new Buffer(0)
					}));
				});
			}
		}
	});

/**
 * Create an instance.
 * @param config {Object}
 * @return {Function}
 */
exports.create = function (config) {
	var client = new ClientRequest(config);

	return client.request.bind(client);
};
