# tianma-mount

![build status](https://travis-ci.org/tianmajs/tianma-mount.svg?branch=master)

在给定域名或路径上使用中间件。

## 安装

	$ npm install tianma-mount

## 使用

### 挂载域名

可以为不同的域名使用不同的中间件。域名可以精确到二级或者三级，也可以模糊到一级甚至是零级。

    var tianma = require('tianma');

	tianma(8080)
		.mount('localhost').then
			.use(middleware)
			.end
		.mount('www.example.com').then
			.use(middleware)
			.end
		.mount('example.com').then
			.use(middleware)
			.end
			
### 挂载路径

也可以为不同的路径使用不同的中间件。路径可以精确到任意层级，也可以使用`/`来模糊匹配任意路径。

    var tianma = require('tianma');
    
	tianma(8080)
		.mount('/foo').then
			.use(middleware)
			.end
		.mount('/bar/baz').then
			.use(middleware)
			.end
		.mount('/').then
			.use(middleware)
			.end
			
### 挂载域名加路径

域名+路径的组合当然也是支持的。

    var tianma = require('tianma');
    
	tianma(8080)
		.mount('localhost').then
			.mount('/foo').then
				.use(middleware)
				.end
			.mount('/bar').then
				.use(middleware)
				.end
			.end
		.mount('example.com/foo').then
			.use(middleware)
			.end
		.mount('example.com/bar').then
			.use(middleware)
			.end
			
### 路径切除

请求路径与挂载路径匹配时，`request.pathname`中的挂载部分会被切除，切除掉的部分可通过`request.base`访问。

    var tianma = require('tianma');

	tianma(8080)
		.use(function *(next) {
			this.request.url('/foo/bar');
		})
		.mount('/foo').then
			.use(function *(next) {
				this.request.base; // => "/foo"
				this.request.pathname; // => "/bar"
			})
			.end
            
### 候选规则

可以使用参数风格或数组风格配置多个挂载规则，按添加顺序匹配和生效。

    var tianma = require('tianma');

	tianma(8080)
		.mount('localhost', 'www.example.com').then
			.use(middleware)
			.end
		.mount([ '/foo', '/bar' ]).then
			.use(middleware)
			.end;

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)