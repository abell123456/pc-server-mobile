'use strict';

module.exports = function (type) {
	return function (next, done) {
		if (this.type === type) {
			next(done);
		} else {
			done();
		}
	};
};