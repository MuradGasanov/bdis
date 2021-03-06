/**
 * Created by Murad Gasanov on 17.01.14.
 */
var BASE_URL = '/';

var NOTY_ALERT = 'alert',
    NOTY_INFORMATION = 'information',
    NOTY_ERROR = 'error',
    NOTY_WARNING = 'warning',
    NOTY_NOTIFICATION = 'notification',
    NOTY_SUCCESS = 'success';

var log = function(){
    if(this.console){
        console.log( arguments );
    }
};

function noty_confirm(text, succes, cansel) {
    succes = typeof succes !== 'undefined' ? succes : function() {};
    cansel = typeof cansel !== 'undefined' ? cansel : function() {};
    noty({
        text: text,
        type: NOTY_INFORMATION,
        layout: 'topCenter',
        buttons: [
            {addClass: 'k-button', text: 'Да', onClick: function ($noty) {
                succes();
                $noty.close();
            }
            },
            {addClass: 'k-button', text: 'Отмена', onClick: function($noty) {
                cansel();
                $noty.close();
            }
            }
        ]
    });
}

function noty_alert(text, succes) {
    succes = typeof succes !== 'undefined' ? succes : function($n) { $n.close(); };
    noty({
        text: text,
        layout: 'center',
        buttons: [
            {addClass: 'k-button', text: 'Закрыть', onClick: succes }
        ]
    });
}

function noty_message(text, timeout, type) {
    text = typeof text !== 'undefined' ? text : "Загрузка...";
    timeout = typeof timeout !== 'undefined' ? timeout : 3000;
    type = typeof type !== 'undefined' ? type : NOTY_INFORMATION;
    return noty({
        text: text,
        type: type,
        timeout: timeout,
        dismissQueue: false,
        layout: 'topCenter',
        theme: 'defaultTheme'
    });
}

function noty_error(text) {
    return noty_message(text, 1000, NOTY_ERROR)
}

function noty_seach_log(text, type) {
    text = typeof text !== 'undefined' ? text : "Поиск...";
    type = typeof type !== 'undefined' ? type : NOTY_INFORMATION;
    return noty({
        text: text,
        type: type,
        dismissQueue: false,
        layout: 'topCenter',
        theme: 'defaultTheme'
    });
}

function addExtensionClass(extension) {
    switch (extension) {
        case '.jpg':
        case '.img':
        case '.png':
        case '.gif':
            return "img-file";
        case '.doc':
        case '.docx':
            return "doc-file";
        case '.xls':
        case '.xlsx':
            return "xls-file";
        case '.pdf':
            return "pdf-file";
        case '.zip':
        case '.rar':
            return "zip-file";
        default:
            return "default-file";
    }
}