var crypto = require('crypto'),
	util = require('./util');

var count = 0,

	/**
	 * Generate MD5 session id.
	 * @param ip {string}
	 * @param ua {string}
	 * @return {string}
	 */
	generateId = function (ip, ua) {
		return crypto.createHash('md5')
			.update(++count + ip + ua + Date.now())
			.digest('hex');
	},

	// Session constructor.
	Session = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._config = util.mix({
				cookieName: '__pegasus_sid',
				maxAge: 1800000	// milliseconds
			}, config);

			this._map = {};
			this._list = {};

			this._list._next = this._list;
			this._list._prev = this._list;
		},

		/**
		 * Append a record to list.
		 * @param record {Object}
		 */
		_append: function (record) {
			var list = this._list;

			record._next = list;
			record._prev = list._prev;

			list._prev._next = record;
			list._prev = record;
		},

		/**
		 * Create a new record.
		 * @param ip {string}
		 * @param ua {string}
		 * @return {Object}
		 */
		_create: function (ip, ua) {
			var config = this._config,
				map = this._map,
				id = generateId(ip, ua),
				record = {
					data: {},
					expires: Date.now() + config.maxAge,
					id: id,
					ip: ip
				};

			map[id] = record;

			this._append(record);

			return record;
		},

		/**
		 * Drop a record and it's previous siblings.
		 * @param record {Object}
		 */
		_drop: function (record) {
			var map = this._map,
				list = this._list,
				next = record._next;

			while (record !== list) {
				delete map[record.id];
				record = record._prev;
			}

			list._next = next;
			next._prev = list;
		},

		/**
		 * Remove a record from list.
		 */
		_remove: function (record) {
			var list = this._list;

			record._prev._next = record._next;
			record._next._prev = record._prev;
		},

		/**
		 * Update record expires time.
		 * @param record {Object}
		 */
		_renew: function (record) {
			var config = this._config;

			record.expires = Date.now() + config.maxAge;

			this._remove(record);
			this._append(record);
		},

		/**
		 * Retrieve session.
		 * @param request {Object}
		 * @param response {Object}
		 * @return {Object}
		 */
		retrieve: function (request, response) {
			var config = this._config,
				map = this._map,
				id = request.cookie && request.cookie[config.cookieName],
				record = id && map[id],
				alive = true;

			if (!record || record.ip !== request.ip) { // New user.
				alive = false;
			} else if (record.expires <= Date.now()) { // Expired session.
				alive = false;
				this._drop(record);
			}

			if (alive) {
				this._renew(record);
			} else {
				record = this._create(request.ip, request.head('user-agent'));
				response.cookie(config.cookieName, record.id, { httpOnly: true });
			}

			return record.data;
		}
	});

module.exports = Session;
