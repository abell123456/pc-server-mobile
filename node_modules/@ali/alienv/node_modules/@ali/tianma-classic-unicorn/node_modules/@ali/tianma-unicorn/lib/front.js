var path = require('path'),
	qs = require('querystring'),
	util = require('pegasus').util;

var PATTERN_SIMPLE_URL = /^(.*?(\.js|\.css|\.png|\.jpeg|\.jpg|\.gif|\.eot|\.woff|\.ttf|\.svg))(?:\?(.*))?$/,

	PATTERN_V1_URL = /^(.*?)(?:\|(?:MODERN_BROWSER|OLD_BROWSER))?(?:\|v_([a-f0-9]+_[a-f0-9]+))?(\.js|\.css)(?:\?.*)?$/,

	PATTERN_V2_URL = /^(.*?)\?\?(.*?)(?:\?(.*))?$/,

	PATTERN_EXTNAME = /^\.(?:js|css)$/,

	// Front constructor.
	Front = util.inherit(Object, {
		/**
		 * Parse simple URL.
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseSimple: function (re) {
			if (!re) { // Not a JS or CSS request.
				return null;
			}

			return {
				base: '',
				pathnames: [ re[1] ],
				params: qs.parse(re[3] || ''),
				type: re[2]
			};
		},

		/**
		 * Parse old style combo URL.
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseV1: function (re) {
			var	params = {},
				pathnames = [],
				extname;

			if (!re) { // Not a JS or CSS request.
				return null;
			}

			if (re[2]) { // Version.
				params.t = re[2];
			}

			extname = re[3];

			re[1].split('|').forEach(function (value) {
				pathnames.push('js/5v/' + value + extname, 'css/' + value + extname);
			});

			return {
				base: '',
				pathnames: pathnames,
				params: params,
				type: extname
			};
		},

		/**
		 * Parse nginx style combo URL.
		 * @param re {Object}
		 * @return {Object|null}
		 */
		_parseV2: function (re) {
			var	base = re[1],
				pathnames = re[2],
				params = qs.parse(re[3] || ''),
				extname,
				conflict = false;

			pathnames = pathnames.split(',').map(function (pathname) {
				if (extname && path.extname(pathname) !== extname) {
					conflict = true;
				} else {
					extname = path.extname(pathname);
				}

				return base + pathname;
			});

			return conflict || !PATTERN_EXTNAME.test(extname) ? null : {
				base: base,
				pathnames: pathnames,
				params: params,
				type: extname
			};
		},

		/**
		 * Parse simple URL or combo URL.
		 * @param url {string}
		 * @param base {string}
		 * @return {Object|null}
		 */
		parse: function (url, base) {
			var ret = null;

			// Relocate url based on mount point.
			url = url.substring(base.length);

			if (url.indexOf('|') !== -1) { // Old style combo URL.
				ret = this._parseV1(url.match(PATTERN_V1_URL));
			} else if (url.indexOf('??') !== -1) { // Nginx style combo URL.
				ret = this._parseV2(url.match(PATTERN_V2_URL));
			} else { // Simple URL.
				ret = this._parseSimple(url.match(PATTERN_SIMPLE_URL));
			}

			if (ret) {
				ret.pathnames = util.unique(ret.pathnames);
			}

			return ret;
		}
	});

module.exports = Front;
