'use strict';

var fs = require('fs');
var milu = require('milu');
var path = require('path');

module.exports = function (config) {
	config = config || {};

	var root = path.resolve(config.root || './');
	var	base = config.base || '';
	var verb = {};
	var scope = config.scope || '';
	var moduledir = config.moduledir || 'node_modules';
	var pipeline;
	
	fs.readdirSync(path.join(__dirname, 'filter')).forEach(function (name) {
		verb[name] = require('./filter/' + name);
	});

	(pipeline = milu(verb))
		.prepare(root, base)
		.is('.js').then
			.bomless()
			.nocomment()
			.resolve(scope, moduledir)
			.modular()
			.end
		.is('.css').then
			.bomless()
			.nocomment()
			.resolve(scope, moduledir)
			.require()
			.absolute()
			.end;
	
	return function (type, relative, data, callback) {
		pipeline.run({
			type: type,
			relative: relative,
			data: data
		}, function (err) {
			callback(err, this.data);
		});
	};
};