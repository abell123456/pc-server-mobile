var util = require('./util'),
	MountPoint = require('./mount-point');

	// MountTable constructor.
var	MountTable = util.inherit(Object, {
		/**
		 * Initializer.
		 */
		_initialize: function () {
			this._mountPoints = [];
		},

		/**
		 * Add a mount point.
		 * @param config {Object}
		 */
		add: function (config) {
			var mountPoints = this._mountPoints;

			mountPoints.push(new MountPoint(config));
			mountPoints.sort(function (pointA, pointB) {
				// High priority mount point should have lower array index.
				return pointA.compareTo(pointB);
			});
		},

		/**
		 * Dispatch request to matched mount point.
		 * @param context {Object}
		 */
		dispatch: function (context) {
			var mountPoints = this._mountPoints,
				len = mountPoints.length,
				i = 0;

			for (; i < len; ++i) {
				if (mountPoints[i].match(context.request)) {
					mountPoints[i].process(context);
					return;
				}
			}

			// End unmatched request.
			context.response.end();
		}
	});

module.exports = MountTable;
