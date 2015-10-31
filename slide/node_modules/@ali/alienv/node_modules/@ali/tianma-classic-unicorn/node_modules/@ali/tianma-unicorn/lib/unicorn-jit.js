var path = require('path'),
	util = require('pegasus').util,
	Front = require('./front-jit'),
	Source = require('./source-jit'),
	Unicorn = require('./unicorn');

var PATTERN_YUI = /(YAHOO\.register\s*\(\s*['"]event['"][\s\S]*?\))/,

	// UnicornJIT constructor.
	UnicornJIT = Unicorn.extend({
		/**
		 * Initializer.
		 * @override
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._config = config;

			this._front = new Front();
		},

		/**
		 * Combine files.
		 * @override
		 * @param extname {String}
		 * @param files {Array}
		 * @return {Array}
		 */
		_combine: function (extname, files) {
			var config = this._config,
				dev = (config.mode === 'dev'),
				output = [];

			if (dev && (extname === '.css' || extname === '.js')) {
				files.forEach(function (file) {
					output.push(
						new Buffer('/*** START OF ' + file.pathname + ' ***/\n'),
						file.data,
						new Buffer('\n/*** END OF ' + file.pathname + ' ***/\n')
					);

				});
				return output;
			} else {
				return Unicorn.prototype._combine.call(this, extname, files);
			}
		},

		/**
		 * Turn on the debug switch for YUI2.
		 * @param data {string}
		 * @return {string}
		 */
		_enableDebug: function (data) {
			return data
				.replace(PATTERN_YUI,
					'$1,YAHOO.util.Event.throwErrors=true');
		},

		/**
		 * Return faked version data.
		 * @param pathname
		 */
		_getVersion:function(pathname){
			var config = this._config,
				expires = config.shortExpires,
				now = new Date();

			this._response(200, {
				'content-type': 'text/plain',
				'expires': new Date(now.getTime() + 1000 * expires).toGMTString(),
				'cache-control': 'max-age=' + expires,
				'last-modified': new Date().toGMTString(),
				'vary': 'Accept-Encoding'
			}, pathname === '/version' ? [new Buffer('{}')] : [new Buffer('')]);
		},

		/**
		 * refine data
		 * @param extname
		 * @param datum {Array}
		 * @private
		 */
		_refine: function (extname, datum) {
			datum = Buffer.concat(datum).toString('binary');
			datum = this._enableDebug(datum);

			return [ new Buffer(datum, 'binary') ];
		},

		/**
		 * Pipe function entrance.
		 * @override
		 * @param request {Object}
		 * @param response {Object}
		 */
		main: function (request, response) {
			var config = this._config,
				source = config.source,
				pathname = request.pathname,
				context = this.context,
				front = this._front;

			this._source = new Source({
				loader: function (pathname, callback) {
					request(source + pathname, function (response) {
						if (response.status !== 200) {
							callback(null);
						} else {
							callback({
								pathname: pathname,
								data: response.body('binary'),
                                mtime: new Date(response.head('last-modified') || Date.now()).getTime()
							});
						}
					});
				},
				mode: config.mode
			});

			if (pathname === '/version' || pathname === '/versionData.htm') {
				this._getVersion(pathname);
			} else if (url = front.parse(request.path, context.base)) { // Assign.
				this._getFile(url);
			} else {
				this.next();
			}
		},

		/**
		 * Check whether to process current request.
		 * @param request {Object}
		 * @param response {Object}
		 * @return {boolean}
		 */
		match: function (request, response) {
			return request.method === 'GET'
				&& response.status() === 404;
		}
	});

module.exports = UnicornJIT;
