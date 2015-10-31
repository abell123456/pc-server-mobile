# tianma-combo

![build status](https://travis-ci.org/tianmajs/tianma-combo.svg?branch=master)

对形如`/dir/??file1,file2`的HTTP GET请求提供支持。

## 安装

    $ npm install tianma-combo

## 使用

### 请求合并

将形如`/dir/??file1,file2`的HTTP GET请求拆分为`/dir/file1`和`/dir/file2`两个子请求后交给后续模块处理，并将后续模块返回的响应合并后一起返回。

    var tianma = require('tianma');

    tianma(8080)
        .combo()
        .use(function *(next) {
            this.response
                .status(200)
                .type('txt')
                .data(this.request.pathname);
        });

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/dir/??file1,file2
    /dir/file1/dir/file2

### 分隔符

可通过`MIME`为特定文件类型指定合并响应结果时使用的分隔符。

    var tianma = require('tianma');

    tianma(8080)
        .combo({
            'text/plain': '\n'
        })
        .use(function *(next) {
            this.response
                .status(200)
                .type('txt')
                .data(this.request.pathname);
        });

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/dir/??file1,file2
    /dir/file1
    /dir/file2

## 注意事项

+ 本模块只处理`GET`请求。
+ 对于本模块拆分并传递给后续模块的任意子请求，如果后续模块返回了响应状态码不等于`200`，则请求处理失败。
+ 对于本模块拆分并传递给后续模块的任意子请求，如果后续模块返回的响应的`content-type`不一致，则请求处理失败。

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
