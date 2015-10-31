var path = require('path'),

	Front = require('./front');

	// FrontJIT constructor.
var	FrontJIT = Front.extend({
		/**
		 * Parse simple URL.
		 * @override
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseSimple: function (re) {
			var ret = Front.prototype._parseSimple.apply(this, arguments);

			if (ret) {
				ret.base = [ '' ];
			}

			return ret;
		},

		/**
		 * Parse old style combo URL.
		 * @override
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseV1: function (re) {
			var	params = {},
				pathnames = [],
				extname, base;

			if (!re) { // Not a JS or CSS request.
				return null;
			}

			if (re[2]) { // Version.
				params.t = re[2];
			}

			extname = re[3];

			if (extname === '.js') {
				base = [ 'js/5v/', 'css/' ];
			} else {
				base = [ 'css/', 'js/5v/' ];
			}

			re[1].split('|').forEach(function (value) {
				pathnames.push(value + extname);
			});

			return {
				base: base,
				pathnames: pathnames,
				params: params,
				type: extname
			};
		},

		/**
		 * Parse nginx style combo URL.
		 * @override
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseV2: function (re) {
			var ret = Front.prototype._parseV2.apply(this, arguments);

			if (ret) {
				ret.base = [ '' ];
			}

			return ret;
		}
	});

module.exports = FrontJIT;
