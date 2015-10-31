# tianma-static

![build status](https://travis-ci.org/tianmajs/tianma-static.svg?branch=master)

提供静态文件服务。

## 安装

    $ npm install tianma-static

## 使用

### 根目录

默认配置下，使用工作目录作为根目录。

    var tianma = require('tianma');

    tianma(8080)
        .static();

可以使用简洁配置指定根目录。

    var tianma = require('tianma');

    tianma(8080)
        .static('./htdocs');

也可以使用完整配置指定根目录。

    var tianma = require('tianma');

    tianma(8080)
        .static({ root: './htdocs' });

### 目录列表

当请求的是一个目录时，默认返回目录下的文件列表。可通过以下方式禁用该功能。

    var tianma = require('tianma');

    tianma(8080)
        .static({ root: './htdocs', indexes: false });

### 默认文件

当请求的是一个目录时，请求可以被自动重定向到默认的文件上。不存在默认文件时，则返回目录下的文件列表。

    var tianma = require('tianma');

    tianma(8080)
        .static({
            root: './htdocs',
            indexes: [ 'index.html', 'default.html' ]
        });

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
