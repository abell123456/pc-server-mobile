# tianma-bundle

![build status](https://travis-ci.org/tianmajs/tianma-bundle.svg?branch=master)

将后续模块返回的JS或CSS文件依赖的其它文件按依赖顺序合并在一起后再返回。

## 安装

    $ npm install tianma-bundle

## 使用

    var tianma = require('tianma');

    tianma(8080)
        .bundle()
        .static('./htdocs');

假设`./htdocs`目录下有以下JS和CSS文件：

    ＋ htdocs/
        a.js
        b.js
        c.js
        a.css
        b.css
        c.css

JS文件依赖关系如下：

    a.js -> b.js -> c.js

CSS文件依赖关系如下：

    a.css -> b.css -> c.css

上例的执行结果如下：

    $ curl http://127.0.0.1:8080/a.js
    define("c.js", ...                  # 得到c.js，b.js和a.js按顺序合并后的内容
    $ curl http://127.0.0.1:8080/a.css
    .c {} ...                           # 得到c.css，b.css和a.css按顺序合并后的内容

## 依赖申明方式

JS使用`CMD`方式申明依赖，其中出现的所有模块ID应该与对应文件的路径一致。

    define("foo/bar.js", [ "foo/baz.js" ], function (require, exports, module) {
        // ...
    });

CSS使用`@import`语句和绝对路径（以`/`开头）申明依赖。

    /* foo/bar.css */
    @import "/foo/baz.css";

## 依赖去重

当依赖中存在重复文件时，重复的文件不会多次合并。例如有以下依赖关系：

    a -> [ b, c ]
    b -> d
    c -> d

请求`a`时，得到的内容是`d, b, c, a`按顺序合并后的内容，其中`d`的内容仅出现一次。

## 循环依赖处理

循环依赖会被自动斩断。例如有以下依赖关系：

    a -> b
    b -> a

请求`a`时，得到的内容是`b, a`按顺序合并后的内容。反之，请求`b`时，得到的内容是`a, b`按顺序合并后的内容。

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
