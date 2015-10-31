# tianma-debug

![build status](https://travis-ci.org/tianmajs/tianma-debug.svg?branch=master)

启用包裹在注释中的调试代码。

## 安装

	$ npm install tianma-debug
    
## 使用

    var tianma = require('tianma');

	tianma(8080)
        .debug()
        .static();

然后就可以在JS和CSS当中通过以下多行注释将调试代码包裹起来。

    /*@debug
        console.log('debug info');
    */
    var x;
    
然后请求包含以上注释的代码时将得到以下内容。

        console.log('debug info');

    var x;

## 授权协议

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)