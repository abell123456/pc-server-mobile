'use strict';

var path = require('path');

var PATTERN_BLANK = /\s/;
var	PATTERN_LETTER = /\w/;
var	PATTERN_OPERATOR = /^(?:delete|typeof|void|instanceof|new|in|return|case|throw)$/;

/**
 * Remove comments from JS/CSS.
 * @param str {string}
 * @param isJS {boolean}
 * @return {string}
 */
function nocomment(str, isJS) {
	str = str.split('');
	isJS = !!isJS;

	var mode = {
			singleQuote: false,
			doubleQuote: false,
			regex: false,
			regexBracket: false,
			blockComment: false,
			lineComment: false,
			importantComment: false
		},
		i = 0,
		len = str.length,
		j, tmp;

	for (; i < len; i++) {
		if (mode.regex) {
			if (mode.regexBracket) {
				if (str[i] === ']') {
					mode.regexBracket = false;
				}
			} else {
				if (str[i] === '[') {
					mode.regexBracket = true;
				} else if (str[i] === '\\') {
					i += 1;
				} else if (str[i] === '/') {
					mode.regex = false;
				}
			}
			continue;
		}

		if (mode.singleQuote) {
			if (str[i] === "\\") {
				i += 1;
			} else if (str[i] === "'") {
				mode.singleQuote = false;
			}
			continue;
		}

		if (mode.doubleQuote) {
			if (str[i] === "\\") {
				i += 1;
			} else if (str[i] === '"') {
				mode.doubleQuote = false;
			}
			continue;
		}

		if (mode.blockComment) {
			if (str[i] === '*' && str[i + 1] === '/') {
				str[i] = '';
				str[++i] = '';
				mode.blockComment = false;
			} else if (str[i] !== '\n' && str[i] !== '\r') {
				str[i] = '';
			}
			continue;
		}

		if (mode.lineComment) {
			if (str[i] === '\n' || str[i] === '\r') {
				mode.lineComment = false;
			} else {
				str[i] = '';
			}
			continue;
		}

		if (mode.importantComment) {
			if (str[i] === '*' && str[i + 1] === '/') {
				i += 1;
				mode.importantComment = false;
			}
			continue;
		}

		if (str[i] === '"') {
			mode.doubleQuote = true;
			continue;
		}

		if (str[i] === "'") {
			mode.singleQuote = true;
			continue;
		}

		if (str[i] === '/') {
			if (str[i + 1] === '*') {
				if (str[i + 2] === '!') {
					i += 2;
					mode.importantComment = true;
				} else {
					str[i] = '';
					str[++i] = '';
					mode.blockComment = true;
				}
				continue;
			}

			if (isJS) {
				if (str[i + 1] === '/') {
					str[i] = '';
					str[++i] = '';
					mode.lineComment = true;
					continue;
				}

				for (j = i - 1; j > 0 && PATTERN_BLANK.test(str[j]); --j)
					;
				if (str[j] === ']' || str[j] === ')') {
					continue;
				}

				if (PATTERN_LETTER.test(tmp = str[j--])) {
					for (; j >= 0 && PATTERN_LETTER.test(str[j]); j--) {
						tmp = str[j] + tmp;
					}
					if (!PATTERN_OPERATOR.test(tmp)) {
						continue;
					}
				}

				mode.regex = true;
			}
		}
	}

	return str.join('');
}

/**
 * Remove all non-important JS/CSS comments.
 */
module.exports = function () {
	return function (next, done) {
		this.data = nocomment(this.data, this.type === '.js');
		next(done);
	};
};
