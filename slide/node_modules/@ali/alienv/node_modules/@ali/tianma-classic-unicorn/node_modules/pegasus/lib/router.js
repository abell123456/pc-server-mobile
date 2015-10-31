var	serverRequest = require('./server-request'),
	serverResponse = require('./server-response'),
	util = require('./util'),
	MountTable = require('./mount-table');

var PATTERN_MOUNT_POINT = /^([^\/]+?)?(\/.*?)?$/,

	PATTERN_LAST_SLASH = /\/?$/,

	// Router constructor.
	Router = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._config = util.mix({
				charset: 'utf-8'
			}, config);

			this._mountTable = new MountTable();
		},

		/**
		 * Add a new mount point.
		 * @param point {Object}
		 * @param [options] {Object}
		 * @param pipe {Array}
		 * @return {Object}
		 */
		mount: function (point, options, pipe) {
			var mountTable = this._mountTable,
				re;

			if (!pipe) { // Options is not supplied.
				pipe = options;
				options = {};
			}

			if (re = point.match(PATTERN_MOUNT_POINT)) { // Assign.
				mountTable.add({
					hostname: re[1] || '*',
					pathname: (re[2] || '/').replace(PATTERN_LAST_SLASH, '/'), // Should end with '/'.
					pipe: pipe || [],
					sessionMaxAge: util.isNumber(options.session) ? options.session : 0 // seconds
				});
			}

			return this;
		},

		/**
		 * Route to pipeline.
		 * @param request {Object}
		 * @param response {Object}
		 */
		route: function (request, response) {
			var config = this._config,
				mountTable = this._mountTable,
				route = this.route.bind(this),

				req = serverRequest.create({
					charset: config.charset,
					request: request,
					router: route
				}),

				res = serverResponse.create({
					charset: config.charset,
					hasBody: req.method !== 'HEAD',
					response: response
				});

			mountTable.dispatch({
				charset: config.charset,
				request: req,
				response: res
			});
		}
	});

module.exports = Router;
