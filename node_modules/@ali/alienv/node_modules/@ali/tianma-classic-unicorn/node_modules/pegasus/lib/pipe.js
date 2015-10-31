var util = require('./util');

	/**
	 * Create a pipe function.
	 * @param ctor {Function|Object}
	 * @return {Function}
	 */
var create = function (ctor) {
		if (!util.isFunction(ctor)) {
			ctor = util.inherit(Object, ctor);
		}

		return function (config) {
			var instance = new ctor(config || {});

			return function (context, next) {
				var request = context.request,
					response = context.response,
					child = Object.create(instance);

				child.context = context;
				child.next = next;

				if (!child.match || child.match(request, response)) {
					child.main(request, response);
				} else {
					next();
				}
			};
		};
	};

exports.create = create;
