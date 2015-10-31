'use strict';

module.exports = function () {
	return function (next, done) {
		if (this.data[0] === '\uFEFF') {
			this.data = this.data.substring(1);
		}
		
		next(done);
	};
};