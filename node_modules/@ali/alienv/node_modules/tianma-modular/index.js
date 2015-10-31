'use strict';	

var fs = require('fs'),
	libm = require('libm'),
	path = require('path');

module.exports = function (config) {
	if (typeof config === 'string') {
		config = {
			root: config
		};
	}

	config.root = path.resolve(config.root || './');
	
	var compile;

	return function *(next) {
		var req = this.request,
			res = this.response,
			extname = path.extname(req.pathname);
			
		compile = compile || libm({
			root: config.root, 
			base: (req.base || '/').substring(1),
			scope: config.scope || '',
			moduledir: config.moduledir || 'node_modules'
		});
		
		yield next;
		
		switch (res.is('tpl', 'json', 'js', 'css')) {
		case 'tpl':
		case 'json':
			res.type('js'); // Fall through.
		case 'js':
		case 'css':
			res.data(yield compile.bind(null, req.pathname.substring(1), String(res.data())));
			break;
		}
	};
};