mini-util
=========

A minimal extension to NodeJS native utilities, which feels more "complete", and more "useful".

## Install

	npm install mini-util

## API

### util.format(format, ...)

Same as the NodeJS native one.

### util.isArray(value)

Same as the NodeJS native one.

### util.isBoolean(value)

Return true if the given "value" is a primitive `boolean`, false otherwise.

	var util = require('mini-util');

	util.isBoolean(false);              // => true
	util.isBoolean(new Boolean(false)); // => false

### util.isBuffer(value)

Return true if the given "value" is an instance of `Buffer`, false otherwise.

	var util = require('mini-util');

	util.isBuffer(new Buffer(''));       // => true
	util.isBuffer('');                   // => false

### util.isDate(value)

Same as the NodeJS native one.

### util.isError(value)

Same as the NodeJS native one.

### util.isFunction(value)

Return true if the given "value" is a `function`, false otherwise.

	var util = require('mini-util');

	util.isFunction(function() {});      // => true
	util.isFunction({});                 // => false

### util.isNull(value)

Return true if the given "value" is `null`, false otherwise.

	var util = require('mini-util');

	util.isNull(null);                   // => true
	util.isNull(undefined);              // => false

### util.isNumber(value)

Return true if the given "value" is a primitive `number`, false otherwise.

	var util = require('mini-util');

	util.isNumber(1);                    // => true
	util.isNumber(new Number(1));        // => false
	util.isNumber(NaN);                  // => false

### util.isObject(value)

Return true if the given "value" is a stardard `Object`, false otherwise.

	var util = require('mini-util');

	util.isObject({});                   // => true
	util.isObject([]);                   // => false

### util.isRegExp(value)

Same as the NodeJS native one.

### util.isString(value)

Return true if the given "value" is a primitive `string`, false otherwise.

	var util = require('mini-util');

	util.isString('');                   // => true
	util.isString(new String(''));       // => false

### util.isUndefined(value)

Return true if the given "value" is `undefined`, false otherwise.

	var util = require('mini-util');

	util.isUndefined(undefined);         // => true
	util.isUndefined(null);              // => false

### util.toArray(value)

Convert "array-like" value to a "real" array.

	var util = require('mini-util');

	(function () {
		var args = util.toArray(arguments);

		util.isArray(arguments);         // => false
		util.isArray(args);              // => true
	}(1, 2));

### util.inherit(superConstructor, prototype)

Create a constructor with the given `prototype` object, which inherits the prototype objec of the super constructor.

	var util = require('mini-util');
	var EventEmitter = require("events").EventEmitter;

	var MyStream = util.inherit(EventEmitter, {
		constructor: function (body) {
			EventEmitter.call(this);
		},
		write: function (data) {
		    this.emit('data', data);
		}
	});

	var stream = new MyStream();

	stream instanceof EventEmitter;      // => true
	MyStream.super === EventEmitter.prototype;  // => true

	stream.on("data", function(data) {
		console.log('Received data: "' + data + '"');
	});

	stream.write("It works!");           // => Received data: "It works!"

If there is not a `constructor' property in the `prototype` object, a empty constructor is created automatically.

	var util = require('mini-util');

	var MyObject = util.inherit(Object, {
		hello: function () {
			console.log('world');
		}
	});

	new MyObject().hello();              // => world

The `super` property is a convenience way to access the properties on the super constructor prototype object.

	var util = require('mini-util');

	var Human = util.inherit(Object, {
		config: function (name) {
			this.name = name.trim();
		},
	});

	var Player = util.inherit(Human, {
		config: function (name, id) {
			Player.super.config.call(this, name);
			this.id = parseInt(id, 10);
		}
	});

	var jim = new Player();

	jim.config(' Jim Green', '10');

	console.log(JSON.stringify(jim));   // => {"name":"Jim Green","id":10}

### util.mix(targetObject, sourceObject, ..., override)

Shallow copy all the enumerable properties of the source objects to the target object, from left to right.

	var util = require('mini-util');

	function mixWithDefaults(config) {
		return util.mix({
			foo: 1,
			bar: 1
		}, config);
	}

	mixWithDefaults({ foo: 2, baz: 2 });  // => { foo: 2, bar: 1, baz: 2 }

If `override` argument is set to `false`, existing properties in target object will not be overrided.

	var util = require('mini-util');

	function mixWithDefaults(config) {
		return util.mix({
			foo: 1,
			bar: 1
		}, config, false);
	}

	mixWithDefaults({ foo: 2, baz: 2 });  // => { foo: 1, bar: 1, baz: 2 }

If one of the source targets is `falsy value`, it will just be omitted.

	var util = require('mini-util');

	function mixWithDefaults(config) {
		return util.mix({
			foo: 1,
			bar: 1
		}, config);
	}

	mixWithDefaults();                   // => { foo: 1, bar: 1 }

### util.merge(sourceObject, ..., override)

Merge all enumerable properties of source objects together. This is just an alias to `util.mix({}, sourceObject, ..., override)`.

### util.each(object, function, thisObject)

Just like the `arr.forEach`, but execute the privided function once per enumerable property of the input object.

	var util = require('mini-util');
	var arr = [];

	util.each({ foo: 1, bar: 2 }, function (value, key, obj) {
		this.push('%s=%s', key, value);
	}, arr);

	arr.join('&');                       // => foo=1&bar=2

### util.keys(object)

Same as the native Object.keys.

### util.values(object)

Return an array which contains all the enumerable values of the input object.

	var util = require('mini-util');

	util.values({ foo: 1, bar: 2 });     // => [ 1, 2 ]

## LICENSE

Copyright (c) 2014 Alibaba.com, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.