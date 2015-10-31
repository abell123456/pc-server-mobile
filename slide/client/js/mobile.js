
var $leftBtn = $('#slide-left'),
    $rightBtn = $('#slide-right');

$leftBtn.on('click', function(e){
    e.preventDefault();
    send({
        data: {
            turn: 'left',
            from: 'mobile'
        },
        onSuccess: function(returnData){
            console.log('成功：'+returnData.status);
        },
        onError: function(a,b){
            alert('出错了：'+JSON.stringify(a)+'|'+b);
        }
    });
});

$rightBtn.on('click', function(e){
    e.preventDefault();
    send({
        data: {
            turn: 'right',
            from: 'mobile'
        },
        onSuccess: function(returnData){
            console.log('成功：'+returnData.status);
        },
        onError: function(a,b){
            alert('出错了：'+JSON.stringify(a)+'|'+b);
        }
    });
});

function send(option){
    option = option || {};
    $.ajax({
        type: "POST",
        url: "http://10.18.215.246:8080", // 一定得是你电脑的IP地址！！！
        contentType: "application/json",
        data: JSON.stringify(option.data || {}),
        dataType: "text",
        timeout: 3000,
        success: function( response ){
            if(typeof response === 'string'){
                response = JSON.parse(response);
            }
            typeof option.onSuccess === 'function' && $.proxy(option.onSuccess, option)(response);
        },
        error: function( a,b ){
            typeof option.onError === 'function' && $.proxy(option.onError, option)(a,b);
        },
        complete: function(){
            typeof option.onComplete === 'function' && $.proxy(option.onComplete, option)();
        }
    });
}
