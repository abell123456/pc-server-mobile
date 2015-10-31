var co = require('mini-co');

module.exports = function (verb) {
	verb = verb || {};

	for (var name in verb) {
		verb[name] = function (factory) {
			return function () {
				return this.use(factory.apply(null, arguments));
			};
		}(verb[name]);
	}

	function wrap(fn, parent) {
		var node = Object.create(verb),
			sibling,
			child;

		fn = fn || function (next, done) {
			next(done);
		};
		
		if (fn.constructor.name === 'GeneratorFunction') {
			fn = co(fn);
		}
		
		node.use = function (fn) {
			return (sibling = wrap(fn, parent));
		};
		
		node.run = function (context, callback) {
			var deep = false,
			
				next = function (callback) {
					var node = child || sibling;
					
					deep = true;

					if (node) {
						node.run(context, callback);
					} else {
						callback.call(context, null);
					}
				},
				
				done = function (err) {
					if (!err && !deep && child && sibling) {
						sibling.run(context, callback);
					} else if (callback) {
						callback.call(context, err);
					}
				};
			
			fn.call(context, next, done);
		};

		Object.defineProperties(node, {
			then: {
				get: function () {
					return (child = wrap(null, node));
				}
			},
			end: {
				get: function () {
					return parent || node;
				}
			}
		});
		
		return node;
	}
	
	return wrap();
};
