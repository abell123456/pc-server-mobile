var fs = require('fs'),
	server = {
		'http:' : require('http'),
		'https:' : require('https')
	},
	url = require('url'),
	util = require('./util'),
	version = require('./version'),
	zlib = require('zlib');

var PATTERN_DRIVE_LETTER = /\/\w:/,

	AGENT = {},

	/**
	 * Decompress gzip or deflate data.
	 * @param data {Buffer}
	 * @param encoding {string}
	 * @param callback {Function}
	 */
	decompress = function (data, encoding, callback) {
		if (encoding === 'gzip') {
			zlib.gunzip(data, callback);
		} else if (encoding === 'deflate') {
			zlib.inflate(data, callback);
		} else {
			callback(null, data);
		}
	},

	/**
	 * Request local file system.
	 * @param pathname {string}
	 * @param callback {Function}
	 */
	fileRequest = function (pathname, callback) {
		if (PATTERN_DRIVE_LETTER.test(pathname)) { // Remove leading slash under Windows.
			pathname = pathname.substring(1);
		}

		fs.stat(pathname, function (err, stats) {
			if (err) {
				callback({
					statusCode: 404
				});
			} else if (stats.isFile()) {
				fs.readFile(pathname, function (err, data) {
					if (err) {
						callback({
							statusCode: 500
						});
					} else {
						callback({
							statusCode: 200,
							headers: {
								'content-length': stats.size,
								'content-type': util.mime(pathname),
								'last-modified': stats.mtime
							},
							body: data
						});
					}
				});
			} else {
				callback({
					statusCode: 500
				});
			}
		});
	},

	/**
	 * Request remote HTTP server.
	 * @param options {Object}
	 * @param protocol {string}
	 * @param callback {Function}
	 */
	httpRequest = function (options, protocol, callback) {
		var body = options.body,
			request;

		if (protocol === 'https:') { // Do not verify certificate.
			options.rejectUnauthorized = false;
		}

		// Use our super-max-sockets-agent instead of global agent.
		options.agent = AGENT[protocol];

		// Remove unnecessary options.
		delete options['body'];

		request = server[protocol].request(options, function (response) {
			var statusCode = response.statusCode,
				headers = response.headers,
				encoding = headers['content-encoding'],
				body = [];

			response.on('data', function (chunk) {
				body.push(chunk);
			});

			response.on('end', function () {
				decompress(Buffer.concat(body), encoding, function (err, data) {
					if (err) {
						callback({
							statusCode: 500
						});
					} else {
						// Remove unnecessary headers.
						delete headers['content-length'];
						delete headers['content-encoding'];

						callback({
							statusCode: statusCode,
							headers: headers,
							body: data
						});
					}
				});
			});
		});

		request.on('error', function (err) {
			callback({
				statusCode: 500
			});
		});

		body && request.write(body);

		request.end();
	},

	/**
	 * Make a request.
	 * @param options {Object|string}
	 * @param callback {Function}
	 */
	request = function (options, callback) {
		// Refine arguments.
		if (util.isString(options)) {
			options = {
				href: options
			};
		}

		if (!options.headers) {
			options.headers = {};
		}

		var meta = url.parse(options.href);

		if (meta.auth) { // Hostname in href has the highest priority.
			options.headers.host = meta.auth
				+ (meta.port ? ':' + meta.port : '');
		}

		switch (meta.protocol) {
		case 'file:':
			fileRequest(meta.path, callback);
			break;
		case 'http:': // Fall through.
		case 'https:':
			httpRequest({
				body: options.body,
				headers: util.mix({
					'accept-encoding': 'gzip, deflate',
					host: meta.host,
					'user-agent': 'pegasus/' + version.number
				}, options.headers),
				hostname: options.hostname || meta.hostname,
				method: options.method || 'GET',
				path: meta.path,
				port: meta.port
			}, meta.protocol, callback);
			break;
		default:
			callback({
				statusCode: 500
			});
			break;
		}
	};

[ 'http:', 'https:' ].forEach(function (protocol) {
	AGENT[protocol] = new server[protocol].Agent();
	AGENT[protocol].maxSockets = 1024;
});

module.exports = request;
