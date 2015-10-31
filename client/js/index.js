var timeoutId = 0,
    timeout = 300;

+function recursive(){
    send({
        data: {
            from: 'pc'
        },
        onSuccess: function(response){
            if(response.turn !== 'current' || response.status){
                alert(response.turn);
            }

            // TODO:处理相应数据
            if(timeoutId){
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(recursive, timeout);
        }
    });
}();

function send(option){
    option = option || {};
    $.ajax({
        type: "POST",
        url: "http://10.18.215.246:8080",
        contentType: "application/json",
        data: JSON.stringify(option.data || {}),
        dataType: "text",
        success: function( response ){
            if(typeof response === 'string'){
                response = JSON.parse(response);
            }
            typeof option.onSuccess === 'function' && $.proxy(option.onSuccess, option)(response);
        },
        error: function( error ){
            typeof option.onError === 'function' && $.proxy(option.onError, option)(error);
        },
        complete: function(){
            typeof option.onComplete === 'function' && $.proxy(option.onComplete, option)();
        }
    });
}