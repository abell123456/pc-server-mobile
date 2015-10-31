var fs = require('fs'),
	path = require('path'),
	util = require('../util');

var PATTERN_BOUNDARY = /boundary=(.*?)(?:;.*)?$/,

	PATTERN_HEADER = /^([\w\-]+)\s*:\s*(.*)$/,

	PATTERN_NAME = /name="(.*?)"/,

	PATTERN_FILENAME = /filename="(.*?)"/,

	/**
	 * Find first positon in binary of string.
	 * @param bin {Buffer}
	 * @param str {string}
	 * @param startAt {number}
	 * @return {number}
	 */
	indexOf = function (bin, str, startAt) {
		var pattern = [],
			len1,
			len2,
			i,
			j;

		for (i = 0, len1 = str.length; i < len1; ++i) {
			pattern[i] = str.charCodeAt(i);
		}

		for (j = startAt || 0, len2 = bin.length - len1 + 1; j < len2; ++j) {
			for (i = 0; i < len1; ++i) {
				if (pattern[i] !== bin[j + i]) {
					break;
				} else if (i === len1 - 1) {
					return j;
				}
			}
		}

		return -1;
	},

	/**
	 * Parse multipart post request.
	 * @param bin {Buffer}
	 * @param parameter {string}
	 * @param charset {string}
	 * @return {Object|null}
	 */
	parse = function (bin, parameter, charset) {
		var re = parameter.match(PATTERN_BOUNDARY),
			boundary, parts, data;

		if (re) {
			boundary = '--' + re[1];
			parts = split(bin, boundary);
			data = {};
		} else {
			return null;
		}

		parts.forEach(function (part) {
			var head = part.head,
				body = part.body,
				re,
				name,
				contentType;

			head = util.decode(head, charset).split('\r\n');
			head.forEach(function (value, index, head) {
				if (re = value.trim().match(PATTERN_HEADER)) {
					head[re[1].toLowerCase()] = re[2];
				}
			});

			if (re = head['content-disposition'].match(PATTERN_NAME)) {
				name = re[1];
				contentType = head['content-type'];

				if (!contentType) { // Text field doesn't has content-type header.
					body = util.decode(body, charset);
				} else { // File field.
					body = {
						type: contentType,
						data: body,
						save: save.bind(null, body),
						size: body.length
					};
					if (re = head['content-disposition'].match(PATTERN_FILENAME)) {
						body.name = path.basename(re[1]);
					}
				}

				util.append(data, name, body);
			}
		});

		return data;
	},

	/**
	 * Save binary data to file.
	 * @param bin {Buffer}
	 * @param filename {string}
	 */
	save = function (bin, filename) {
		fs.writeFile(filename, bin, 'binary', function (err) {
			if (err) {
				throw err;
			}
		});
	},

	/**
	 * Split multipart body by boundary.
	 * @param bin {Buffer}
	 * @param boundary {string}
	 * @return {Array}
	 */
	split = function (bin, boundary) {
		var len = boundary.length + 2, // Bounary length includes CRLF.
			start = 0,
			middle = 0,
			end = 0,
			parts = [],
			part;

		while (true) {
			start = indexOf(bin, boundary + '\r\n', end);
			end = start === -1 ? -1 : indexOf(bin, '\r\n' + boundary, start + len);

			if (end > start) {
				part = bin.slice(start + len, end);
				middle = indexOf(part, '\r\n\r\n');
				parts.push({
					head: part.slice(0, middle),
					body: part.slice(middle + 4)
				});
			} else {
				break;
			}
		}

		return parts;
	};

exports.parse = parse;
