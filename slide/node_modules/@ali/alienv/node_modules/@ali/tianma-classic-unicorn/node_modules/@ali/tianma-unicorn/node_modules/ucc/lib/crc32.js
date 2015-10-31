/**
 * Calculate CRC32.
 * @param input {string}
 * @return {number}
 */
module.exports = (function () {
	var divisor = 0xEDB88320,

		table = [],

		byteCRC = function (input) {
			var i = 8,
				tmp = input;

			while (i--) {
				tmp = tmp & 1 ? (tmp >>> 1) ^ divisor : tmp >>> 1;
			}

			table[input] = tmp;
		},

		i = 0;

	for (i = 0; i < 256; ++i) {
		byteCRC(i);
	}

	return function (input) {
		var len = input.length,
			i = 0,
			crc = -1;

		for (; i < len; ++i) {
			crc = table[(crc ^ input[i]) & 0xFF] ^ (crc >>> 8);
		}

		return ((crc ^ -1) >>> 0);
	};
}());
