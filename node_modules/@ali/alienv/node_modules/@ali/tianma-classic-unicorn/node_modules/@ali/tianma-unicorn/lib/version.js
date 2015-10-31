var util = require('pegasus').util,
	CascadeFile = require('./cascade-file');

var PATTERN_JSON_VERSION_FILTER = /\.(?:js|css)$/,

	PATTERN_FLAT_VERSION_FILTER = /^(?:js\/5v\/|css\/)(.*)$/,

	PATTERN_LAST_SLASH = /\/$/,

	Version = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._cFile = new CascadeFile(config);

			this._data = {
				version: {},
				versionData: '',
				mtime: 0
			};

			this._expires = config.shortExpires;
		},

		/**
		 * Generate version data from meta.
		 * @param meta {Object}
		 */
		_generate: function (meta) {
			var data = this._data,
				versionData = [],
				version = { '': {} },
				re;

			util.each(meta, function (data, pathname) {
				if (PATTERN_JSON_VERSION_FILTER.test(pathname)) {
					var parts = pathname.split('/'),
						value = data.dataHash + '.' + data.depsHash,
						key;

					while (parts.length > 0) {
						key = parts.join('/');

						if (!version[key]) {
							version[key] = {};
						}

						version[key][pathname] = value;
						parts.pop();
					}

					version[''][pathname] = value;

					if (re = pathname.match(PATTERN_FLAT_VERSION_FILTER)) { // Assign.
						versionData.push(
							re[1] + '=' + data.dataHash + '.' + data.depsHash);
					}
				}
			});

			util.each(version, function (value, key) {
				version[key] = new Buffer(JSON.stringify(value));
			});

			data.versionData = new Buffer(versionData.join('|'));
			data.version = version;
		},

		/**
		 * Refresh version data.
		 * @param callback {Function}
		 */
		_refresh: function (callback) {
			var data = this._data,
				cFile = this._cFile,
				self = this,
				meta;

			cFile.stat('.meta', function (file) {
				if (file.mtime !== data.mtime) {
					data.mtime = file.mtime;
					cFile.read('.meta', function (file) {
						try {
							meta = JSON.parse(file.data.toString('utf-8'));
						} catch (err) {
							util.throwError('JSON syntax error in ".meta"');
						}
						self._generate(meta);
						callback();
					});
				} else {
					callback();
				}
			});
		},

		/**
		 * Response with JSON version data.
		 * @param filter {string}
		 */
		_getVersion: function (filter) {
			var data = this._data,
				self = this;

			// Make filter end with slash compatible.
			filter = filter.replace(PATTERN_LAST_SLASH, '');

			this._refresh(function () {
				self._response(data.version[filter] || '{}');
			});
		},

		/**
		 * Response with flat version data.
		 */
		_getVersionData: function () {
			var data = this._data,
				self = this;

			this._refresh(function () {
				self._response(data.versionData);
			});
		},

		/**
		 * Send response.
		 * @param data {Buffer|string}
		 */
		_response: function (data) {
			var config = this._config,
				expires = this._expires,
				mtime = new Date(this._data.mtime),
				now = new Date();

			this.context.response
				.status(200)
				.head({
					'content-type': 'text/plain',
					'expires': new Date(now.getTime() + 1000 * expires).toGMTString(),
					'cache-control': 'max-age=' + expires,
					'last-modified': mtime.toGMTString(),
					'vary': 'Accept-Encoding'
				})
				.clear()
				.write(data);

			this.next();
		},

		/**
		 * Pipe function entrance.
		 * @param request {Object}
		 * @param response {Object}
		 */
		main: function (request, response) {
			var pathname = request.pathname;

			if (pathname === '/version') {
				this._getVersion(request.query && request.query.filter || '');
			} else if (pathname === '/versionData.htm') {
				this._getVersionData();
			} else {
				this.next();
			}
		}
	});

module.exports = Version;
