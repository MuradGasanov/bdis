/**
 * Created by murad on 12.03.14.
 */

$(document).ready(function () {
    var USERS_URL = "/users/";

    var M_SAVE = "Сохранение...",
        M_LOAD = "Загрузка...",
        n = noty_message(M_LOAD, false);

    var user_grid = $("#user_list").kendoGrid({
        dataSource: {
            type: "json",
            transport: {
                read: {
                    url: USERS_URL + "read/",
                    dataType: "json",
                    type: "POST"
                },
                destroy: {
                    url: USERS_URL + "destroy/",
                    dataType: "json",
                    type: "POST"
                },
                parameterMap: function (options, operation) {
//                        console.log(options, operation);
                    if (operation !== "read" && options) {
                        return {
                            item: kendo.stringify(options)
                        };
                    } else if (operation == "read" && options) {
                        return kendo.stringify(options);
                    }
                }
            },
            schema: {
                model: {
                    id: "id",
                    fields: {
                        username: { type: "string" },
                        first_name: { type: "string" },
                        email: { type: "string" },
                        is_superuser: { type: "boolean" }
                    }
                }
            },
            requestEnd: function (e) {
                n.close();
            }
        },
//        pageable: {
//            messages: {
//                display: "Показано {0}-{1} из {2} записей",
//                empty: "Нет данных для отображения",
//                first: "Первая страница",
//                itemsPerPage: "записей на странице",
//                last: "Последняя страница",
//                next: "Следующая страница",
//                of: "из {0}",
//                page: "Страница",
//                previous: "Предыдущая страница",
//                refresh: "Обновить"
//            }
//        },
        toolbar: [
            { template: kendo.template($("#users_header_template").html()) }
        ],
        height: 600,
        sortable: true,
//        filterable: { extra: false,
//            operators: { string: { contains: "Содержат" } },
//            messages: {
//                info: "Показать записи, которые:",
//                and: "и",
//                or: "или",
//                filter: "Применить",
//                clear: "Очистить"
//            }
//        },
        editable: {
            mode: "inline",
            confirmation: "Вы уверены, что хотите удалить запись?",
            confirmDelete: "Да",
            cancelDelete: "Нет"
        },
        columns: [
            { field: "username", title: "Логин", width: 250},
            { field: "first_name", title: "Имя", width: 250},
            { field: "email", title: "Почта" },
            { field: "is_superuser", title: "Администратор",
                template: "# if(is_superuser) { # Да # }else{ # Нет # } #",
                attributes: { style: "text-align: center;"}
            },
            { command: [
//                {   text: "Редактировать",
//                    click: function (e) {
//                        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
//                        $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//                        $("#is_user_edit").val(true);
//                        user_model.set("id", dataItem.id);
//                        user_model.set("username", dataItem.username);
//                        user_model.set("password", "");
//                        user_model.set("first_name", dataItem.first_name);
//                        user_model.set("email", dataItem.email);
//                        user_model.set("is_superuser", dataItem.is_superuser);
//                        user_window.center().open();
//                    }
//                },
                {   text: "Редактировать",
                    click: function (e) {
                        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                        $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                        user_model.set("id", dataItem.id);
                        user_model.set("username", dataItem.username);
                        user_model.set("is_user_edit", true);
                        user_model.set("password", "");
                        user_model.set("first_name", dataItem.first_name);
                        user_model.set("email", dataItem.email);
                        user_model.set("is_superuser", dataItem.is_superuser);
                        user_window.center().open();
                    }
                },
                { name: "destroy", text: "Удалить" }
            ], width: 250, attributes: { style: "text-align: center;"} }
        ]
//            save: function (e) {
//                var new_name = e.model.name;
//                var data = intellectual_property.dataSource.data();
//                var result;
//                if (e.model.intellectual_property_id != "") { ///возможно это редактирование
//                    result = $.grep(data,
//                        function (o) {
//                            if (o.intellectual_property_id != e.model.intellectual_property_id) {
//                                return o.name.toUpperCase() == new_name.toUpperCase();
//                            } else { //проверка, есть ли такие
//                                return false;
//                            }
//                        }
//                    );
//                    if (result.length > 0) {
//                        noty_error("Такое имя уже добавлен");
//                        e.preventDefault();
//                    }
//                } else { //возможно это добавление, (id == "")
//                    result = $.grep(data,
//                        function (o) {
//                            if (o.intellectual_property_id != "") {
//                                return o.name.toUpperCase() == new_name.toUpperCase();
//                            } else { //проверка, есть ли такие
//                                return false;
//                            }
//                        }
//                    );
//                    if (result.length > 0) {
//                        noty_error("Такое имя уже добавлен");
//                        e.preventDefault();
//                    }
//                }
//            }
    }).data("kendoGrid");

    var user_window = $("#change_users_window").kendoWindow({
            resizable: false,
//            actions: [],
            animation: { close: { effects: "", duration: 350 },
                open: { effects: "", duration: 350 } },
            modal: true,
            width: 550,
            visible: false
    }).data("kendoWindow");
    var user_model = kendo.observable({
        id: 0,
        username: "",
        is_user_edit: false,
        password: "",
        first_name: "",
        email: "",
        is_superuser: false
    });
    var $change_users = $("#change_users");
    kendo.bind($change_users, user_model);
    var user_validator = $change_users.kendoValidator({
        rules: {
            required: function (input) {
                if (input.is("[required]")) {
                    input.val($.trim(input.val())); //удалить обертывающие пробелы
                    if (input.is("[name='password']") && user_model.get("is_user_edit") ) { //не чекать пасс при редактировании
                        return true;
                    }
                    return input.val() !== "";
                } else return true;
            },
            unique_username: function(input) {
                input.val( $.trim(input.val()) );
                var val = input.val();
                if (input.is("[name='username']")) {
                    var data = user_grid.dataSource.data();
                    var is_unique = $.grep(data, function(o) {
                        return o.username == val;
                    });
                    return is_unique.length == 0;
                } else return true;
            }
        },
        messages: {
            required: "Поле не может быть пустым",
            unique_username: "Такой пользователь уже существует"
        }
    }).data("kendoValidator");

    $(".add_user").click(function (e) {
        $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
        user_model.set("is_user_edit", false);
        user_model.set("id", 0);
        user_model.set("username", "");
        user_model.set("password", "");
        user_model.set("first_name", "");
        user_model.set("email", "");
        user_model.set("is_superuser", "");
        user_window.center().open();
    });

    $("#user_cancel").click(function (e) {
        user_window.close();
        return false;
    });

    function check_users_subdivision(d) {
        var data = user_grid.dataSource;
        var item = data.get(d.id);
        if (item) {
            item.username = d.username;
            item.first_name = d.first_name;
            item.email = d.email;
            item.is_superuser = d.is_superuser;
        } else {
            item = {
                id: d.id,
                username: d.username,
                first_name: d.first_name,
                email: d.email,
                is_superuser: d.is_superuser
            };
            data.add(item);
        }
        n.close();
        user_grid.refresh();
        user_window.close();
    }

    $("#user_save").click(function (e) {
        if (!user_validator.validate()) return false;
        var send = {
            id: user_model.get("id"),
            username: user_model.get("username"),
            password: user_model.get("password"),
            first_name: user_model.get("first_name"),
            email: user_model.get("email"),
            is_superuser: user_model.get("is_superuser")
        };
        n = noty_message(M_SAVE, false);
        if (user_model.get("is_user_edit")) {
            $.post(USERS_URL + "update/",
                {item: JSON.stringify(send) }, check_users_subdivision, "json");
        } else {
            $.post(USERS_URL + "create/",
                {item: JSON.stringify(send) }, check_users_subdivision, "json");
        }
        return false;
    });

    var $reload_users = $(".reload_users");
    $reload_users.click(function (e) {
        n = noty_message(M_LOAD, false);
        user_grid.dataSource.read();
        user_grid.refresh();
        return false;
    });


    $("#logout").click(function () {
        noty_confirm("Выйти?", function () {
            window.location = "/logout/"
        });
        return false;
    });
});