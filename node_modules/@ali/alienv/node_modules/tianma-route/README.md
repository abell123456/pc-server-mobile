# tianma-route

![build status](https://travis-ci.org/tianmajs/tianma-route.svg?branch=master)

路由。

## 安装

    $ npm install tianma-route

## 使用

### 方法路由

可以针对请求方法进行路由。

    var tianma = require('tianma');

    tianma(8080)
        .route('get').then
            .use(middleware)
            .end
        .route('post').then
            .use(middleware)
            .end;

### 路径路由

可以针对请求路径进行路由，并可保存路径匹配结果供其它中间件使用。路径匹配规则的详细写法请参考[path-to-regexp](https://github.com/pillarjs/path-to-regexp)。

    var tianma = require('tianma');

    tianma(8080)
        .route('/home').then
            .use(middleware)
            .end
        .route('/search/:keyword').then
            .use(function *(next) {
                var keyword = this.request.params.keyword;
                // ...
            })
            .end;

### 组合路由

可同时针对请求方法和请求路径进行路由。

    var tianma = require('tianma');

    tianma(8080)
        .route('get /article/:id').then
            .use(middleware)
            .end
        .route('post /article/').then
            .use(middleware)
            .end;

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
