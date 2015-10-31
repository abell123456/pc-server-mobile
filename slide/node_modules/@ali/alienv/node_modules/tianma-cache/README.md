# tianma-cache

![build status](https://travis-ci.org/tianmajs/tianma-cache.svg?branch=master)

将后续模块对GET请求的200响应缓存起来。在缓存有效期内，如果再次有URL相同的GET请求到达，直接返回缓存内容。

## 安装

    $ npm install tianma-cache

## 使用

缓存有效期默认为`1800`秒。

    var tianma = require('tianma');

    tianma(8080)
        .cache()
        .use(function *(next) {
            this.response.data(Math.random());
        });

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/x.js
    0.9272267003543675
    $ curl http://127.0.0.1:8080/x.js      # 同样的GET请求，命中缓存。
    0.9272267003543675
    $ curl http://127.0.0.1:8080/y.js
    0.1384759375983405

另外，也可以指定缓存有效期（单位为`秒`）。

    var tianma = require('tianma');

    tianma(8080)
        .cache(3600)
        .use(middleware);

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
