var http = require( "http" );

var responseBody = '',
    currentRequest = {},
    requestFromMobileInit = {
        from: 'mobile',
        turn: 'current'
    },
    requestFromMobile = requestFromMobileInit,
    requestFromPc;

var server = http.createServer(
    function( request, response ){

        // 当处理跨域请求处理的时候，客户端应该把它的请求域发送过来。我们应该回应该域，没传则置为*
        var origin = (request.headers.origin || "*");

        // 跨域请求时浏览器会先发一个method值为OPTIONS的请求以保证安全。
        // 详情可见：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
        if (request.method.toUpperCase() === "OPTIONS"){

            // 响应该域的请求，这样客户端就保证可以对该请求接口做后续请求。
            response.writeHead(
                "204",
                "No Content",
                {
                    "access-control-allow-origin": origin,
                    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "access-control-allow-headers": "content-type, accept",
                    "access-control-max-age": 10, // Seconds.
                    "content-length": 0
                }
            );

            // 结束响应
            return( response.end() );
        }

        request.on("data",function( chunk ){
                chunk = JSON.parse(chunk.toString());

                if(chunk.from === 'pc'){
                    requestFromPc = chunk;
                }else if(chunk.from === 'mobile'){
                    requestFromMobile = chunk;
                }
                currentRequest = chunk;
            }
        );

        // 一旦所有的请求数据已经被发送到了服务器，请求会触发一个结束事件。
        request.on("end",function(){
                if(currentRequest.from === 'pc'){
                    responseBody = JSON.stringify(requestFromMobile);
                    requestFromMobile = requestFromMobileInit;
                }else if(currentRequest.from === 'mobile'){
                    responseBody = JSON.stringify({
                        status: true
                    });
                }

                // 将头信息返回。
                response.writeHead(
                    "200",
                    "OK",
                    {
                        "access-control-allow-origin": origin,
                        "content-type": "text/plain",
                        "content-length": responseBody.length
                    }
                );

                return( response.end( responseBody ) );
            }
        );
    }
);

server.listen( 8080 );

console.log( "Node.js listening on port 8080" );
