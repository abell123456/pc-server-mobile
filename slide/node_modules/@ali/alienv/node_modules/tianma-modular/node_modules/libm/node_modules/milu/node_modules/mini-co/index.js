'use strict';

var toArray = (function () {
	var slice = Array.prototype.slice;

	return function (obj) {
		return slice.call(obj);
	};
}());

/**
 * Generator runner.
 * @param g {Object}
 * @param callback {Function}
 */
function run(g, callback) {
	(function next(err, data) {
		try {
			var ret = err ? g.throw(err) : g.next(data);
		
			if (!ret.done) {
				ret.value(next);
			} else {
				callback(null, ret.value);
			}
		} catch (err) {
			callback(err);
		}
	}());
}

/**
 * Bind a generator with the runner.
 * @param generator {Function*}
 * @return {Function}
 */
module.exports = function (generator) {
	return function () {
		var args = toArray(arguments),
			callback = args.pop(),
			g = generator.apply(this, args);
			
		run(g, callback);
	};
};