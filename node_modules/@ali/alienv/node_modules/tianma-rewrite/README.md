# tianma-rewrite

![build status](https://travis-ci.org/tianmajs/tianma-rewrite.svg?branch=master)

对HTTP请求提供请求路径重定向或服务端代理功能。

## 安装

    $ npm install tianma-rewrite

## 使用

### 请求重定向

将请求路径重定向为其它路径。如果请求原始路径不满足匹配条件，则不做更改。

    var tianma = require('tianma');

    tianma(8080)
        .rewrite({
              '/alpha$1': /^\/foo(.*)/,
              '/beta$1': /^\/bar(.*)/
        })
        .use(function *(next) {
            this.response.data(this.request.path);
        });

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/foo/x.js?params
    /alpha/foo/x.js?params
    $ curl http://127.0.0.1:8080/bar/x.js?params
    /beta/foo/x.js?params
    $ curl http://127.0.0.1:8080/baz/x.js?params
    /baz/x.js?params

### 服务端代理

将请求代理到远程服务器，并转发远程服务器返回的响应。如果远程服务器返回的响应状态码不等于`200`，则将请求继续交给后续模块处理。

    var tianma = require('tianma');

    tianma(8080)
        .rewrite({
              'http://remote.com$1': /^(.*)/
        })
        .use(function *(next) {
            this.response.data('fall to the bottom');
        });

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/x.js      # 假设remote.com上存在x.js文件
    var x;
    $ curl http://127.0.0.1:8080/y.js      # 假设remote.com上不存在y.js文件
    fall to the bottom

另外，可为远程服务器地址指定IP和端口，指定IP后，远程服务器域名直接解析为指定的IP。

    var tianma = require('tianma');

    tianma(8080)
        .rewrite({
              'http://remote.com@192.168.0.2:1080$1': /^(.*)/
        })
        .use(middleware);

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
