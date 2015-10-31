# libc

将CMD(SeaJS)模块转换为可自运行的代码。

## 原理

假设有以下一个`bundle.js`，其中包含若干CMD模块：

	define('c', [ ], function (require, exports, module) {
		var x = require('x');
		exports.value = x.value;
	});
	define('b', [ 'c' ], function (require, exports, module) {
		var c = require('c');
		exports.value = c.value;
	});
	define('a', [ 'b' ], function (require, exports, module) {
		var b = require('b');
		exports.value = b.value;
	});

通过`libc`的`compact`模式转换后，成为以下形态：

	(function () {
		var $c = function () {
			var exports = {}, module = { exports: exports };
		};
	}());

## 安装

	$npm install libc

### Usage

	var clean = require('libc');
	
	clean(code, options);

+ `options.mode` : string

	"standalone" or "compact".
	
+ `options.entries` : Array

	Avaliable only in "compact" mode.
	
## LICENSE

Copyright (c) 2015 Alibaba.com, Inc.

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
