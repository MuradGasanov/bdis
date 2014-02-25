/**
 * Created by Murad Gasanov on 17.01.14.
 */
(function($) {
    $(document).ready(function(e) {
        $("form.login").submit(function(e) {
            var password = $("input[name='password']").val(),
                login = $("input[name='login']").val();
            if ((password.length == 0) || (login.length == 0)) return false;
            $.post(BASE_URL+"login/",
                JSON.stringify({login: login, password: password}),
                function(data) {
                    console.log(data);
                    if ("error" in data) {
                        if (data.error.length > 0) {
                            console.error(data.error);
                            noty_error(data.error.join("<br>"));
                        } else {
                            location.href = BASE_URL;
                            //location.reload();
                        }
                    } else {
                        noty_error("Ошибка ответа сервера");
                    }
                }, "json");
            return false;
        });
    });
})(jQuery);