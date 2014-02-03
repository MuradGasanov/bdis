/**
 * Created by user on 23.01.14.
 */

var ADMIN_BASE_URL = "admin/";

(function ($) {
    $(document).ready(function (e) {
        var GRID_HEIGHT = $(window).height() - $("header#main_header").height() - $("footer#main_footer").height() - 65;
        var window_option = {
            resizable: false,
            actions: [],
            animation: { close: { effects: "", duration: 350 },
                open: { effects: "", duration: 350 } },
            modal: true,
            width: 750,
            visible: false};
        var validator_option = {
            rules: {
                required: function(input) {
                    if (input.is("[required]")) {
                        input.val($.trim(input.val())); //удалить обертывающиепробелы
                        return input.val() !== "";
                    } else return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым"
            }
        };
        $("#tab_strip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            },
            select: function (e) {
                var height = GRID_HEIGHT;
                height = height - 63;
                $(e.contentElement).find("div.k-grid-content").css("height", height + "px");
            }
        });
/////////////////////////////////////// ПОДРАЗДЕЛЕНИЯ
        var subdivision = $("#subdivision").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "subdivision/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "subdivision/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "subdivision_id",
                        fields: { name: {type: "string"}, tel: {type: "string"} }
                    }
                },
                requestEnd: function(e) {
                    if (e.type == "destroy") {
                        $reload_author.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#subdivision_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
            detailInit: subdivision_detail_init,
            columns: [
                { field: "name", title: "Название" },
                { field: "tel", title: "Телефон", width: "300px", attributes: {title: "#=tel#"} },
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_subdivision_edit").val("true");
                            subdivision_model.set("subdivision_id", dataItem.subdivision_id);
                            subdivision_model.set("name", "");
                            subdivision_model.set("name", dataItem.name);
                            subdivision_model.set("tel", "");
                            subdivision_model.set("tel", dataItem.tel);
                            subdivision_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var subdivision_window = $("#change_subdivision_window").kendoWindow(window_option).data("kendoWindow");
        var subdivision_model = kendo.observable({
            subdivision_id: 0,
            name: "",
            tel: ""
        });
        var $change_subdivision = $("#change_subdivision");
        kendo.bind($change_subdivision, subdivision_model);
        var subdivision_validator = $change_subdivision.kendoValidator(validator_option).data("kendoValidator");

        $(".add_subdivision").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_subdivision_edit").val(false);
            subdivision_model.set("subdivision_id", 0);
            subdivision_model.set("name", "");
            subdivision_model.set("tel", "");
            subdivision_window.center().open();
        });

        $("#subdivision_cancel").click(function (e) {
            subdivision_window.close();
            return false;
        });

        function check_response_subdivision(d) {
            var data = subdivision.dataSource;
            var item = data.get(d.subdivision_id);
            console.log(data, item);
            if (item) {
                item.name = d.name;
                item.tel = d.tel;
            } else {
                item = {
                    subdivision_id: d.subdivision_id,
                    name: d.name,
                    tel: d.tel
                };
                data.add(item);
            }
            subdivision.refresh();
            subdivision_window.close();
        }

        $("#subdivision_save").click(function (e) {
            if (!subdivision_validator.validate()) return false;
            var send = {
                subdivision_id: subdivision_model.get("subdivision_id"),
                name: subdivision_model.get("name"),
                tel: subdivision_model.get("tel")
            };
            if ($("#is_subdivision_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "subdivision/create/",
                   {item: JSON.stringify(send) }, check_response_subdivision, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "subdivision/update/",
                    {item: JSON.stringify(send) }, check_response_subdivision, "json");
            }
            return false;
        });

        var $reload_subdivision = $(".reload_subdivision");
        $reload_subdivision.click(function (e) {
            subdivision.dataSource.read();
            subdivision.refresh();
            return false;
        });
/////////////////////////////////////// \\ПОДРАЗДЕЛЕНИЯ

/////////////////////////////////////// АВТОРЫ
        var authors = $("#authors").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "authors/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "authors/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        console.log(options, operation);
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "author_id",
                        fields: {
                            name: {
                                type: "string",
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            },
                            surname: { type: "string"},
                            patronymic: { type: "string"},
                            tel: {type: "string"},
                            post: {type: "string"},
                            mail: {type: "string"},
                            department: { defaultValue: {department_id: "", name: ""} }
                        }
                    }
                },
                requestEnd: function(e) {
                    if ((e.type == "update") || (e.type == "destroy")) {
                        $reload_intellectual_property.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#authors_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            columns: [
                { field: "name", title: "ФИО", template: "#var fio=[surname,name,patronymic].join(' ');# #=fio#"},
                { field: "post", title: "Учёные степени и звания", width: "300px", attributes: {title: "#=post#"} },
                { field: "tel", title: "Телефон", width: "150px", attributes: {title: "#=tel#"} },
                { field: "mail", title: "Электронный адрес", width: "250px", attributes: {title: "#=mail#"} },
                { field: "department", title: "Подразделение", width: "200px", attributes: {title: ""}, template: "#=department.name#"},
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_author_edit").val("true");
                            author_model.set("author_id", dataItem.author_id);
                            author_model.set("surname", dataItem.surname);
                            author_model.set("name", dataItem.name);
                            author_model.set("patronymic", dataItem.patronymic);
                            author_model.set("post", dataItem.post);
                            author_model.set("tel", dataItem.tel);
                            author_model.set("mail", dataItem.mail);
                            author_subdivision.value("");
                            author_model.get("subdivisions").read();
                            author_model.get("departments").read();
                            author_model.set("department", dataItem.department);
                            author_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var author_window = $("#change_author_window").kendoWindow(window_option).data("kendoWindow");
        var author_model = kendo.observable({
            author_id: 0,
            surname: "",
            name: "",
            patronymic: "",
            post: "",
            tel: "",
            mail: "",
            subdivisions: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "subdivision/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            subdivision: "",
            departments: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "department/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            department: ""
        });
        var $change_author = $("#change_author");
        kendo.bind($change_author, author_model);
        var author_subdivision = $("#author_subdivision").data("kendoDropDownList");
        var author_validator = $change_author.kendoValidator(validator_option).data("kendoValidator");

        $(".add_author").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_author_edit").val(false);
            author_model.set("author_id", 0);
            author_model.set("surname", "");
            author_model.set("name", "");
            author_model.set("patronymic", "");
            author_model.set("post", "");
            author_model.set("tel", "");
            author_model.set("mail", "");
            author_model.get("subdivisions").read();
            author_model.set("subdivision", "");
            author_model.get("departments").read();
            author_model.set("department", "");
            author_window.center().open();
        });

        $("#author_cancel").click(function (e) {
            author_window.close();
            return false;
        });

        function check_response_author(d) {
            var data = authors.dataSource;
            var item = data.get(d.author_id);
            if (item) {
                item.author_id = d.author_id;
                item.surname = d.surname;
                item.name = d.name;
                item.patronymic = d.patronymic;
                item.post = d.post;
                item.tel = d.tel;
                item.mail = d.mail;
                item.department = d.department;
            } else {
                item = {
                    author_id: d.author_id,
                    surname: d.surname,
                    name: d.name,
                    patronymic: d.patronymic,
                    post: d.post,
                    tel: d.tel,
                    mail: d.mail,
                    department: d.department
                };
                data.add(item);
            }
            authors.refresh();
            author_window.close();
        }

        $("#author_save").click(function (e) {
            if (!author_validator.validate()) return false;
            var send = {
                author_id: author_model.get("author_id"),
                surname: author_model.get("surname"),
                name: author_model.get("name"),
                patronymic: author_model.get("patronymic"),
                post: author_model.get("post"),
                tel: author_model.get("tel"),
                mail: author_model.get("mail"),
                department: author_model.get("department")
            };
            if ($("#is_author_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "authors/create/",
                   {item: JSON.stringify(send) }, check_response_author, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "authors/update/",
                    {item: JSON.stringify(send) }, check_response_author, "json");
            }
            return false;
        });

        var $reload_author = $(".reload_author");
        $reload_author.click(function (e) {
            authors.dataSource.read();
            authors.refresh();
            return false;
        });
/////////////////////////////////////// \\АВТОРЫ

///////////////////////////////////////  ВИДЫ ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТИ

        var document_types = $("#document_types").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "document_types/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "document_types/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "doc_type_id",
                        fields: {
                            name: {
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            }
                        }
                    }
                },
                requestEnd: function(e) {
                    if ((e.type == "update") || (e.type == "destroy")) {
                        $reload_intellectual_property.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#document_types_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            columns: [
                { field: "name", title: "Вид интеллектуального права"},
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_document_types_edit").val("true");
                            document_types_model.set("doc_type_id", dataItem.doc_type_id);
                            document_types_model.set("name", dataItem.name);
                            document_types_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var document_types_window = $("#change_document_types_window").kendoWindow(window_option).data("kendoWindow");
        var document_types_model = kendo.observable({
            doc_type_id: 0,
            name: ""
        });
        var $change_document_types = $("#change_document_types");
        kendo.bind($change_document_types, document_types_model);
        var document_types_validator = $change_document_types.kendoValidator(validator_option).data("kendoValidator");

        $(".add_document_type").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_document_types_edit").val(false);
            document_types_model.set("doc_type_id", 0);
            document_types_model.set("name", "");
            document_types_window.center().open();
        });

        $("#document_types_cancel").click(function (e) {
            document_types_window.close();
            return false;
        });

        function check_response_document_types(d) {
            var data = document_types.dataSource;
            var item = data.get(d.doc_type_id);
            if (item) {
                item.name = d.name;
            } else {
                item = {
                    doc_type_id: d.doc_type_id,
                    name: d.name
                };
                data.add(item);
            }
            document_types.refresh();
            document_types_window.close();
        }

        $("#document_types_save").click(function (e) {
            if (!document_types_validator.validate()) return false;
            var send = {
                doc_type_id: document_types_model.get("doc_type_id"),
                name: document_types_model.get("name")
            };
            if ($("#is_document_types_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "document_types/create/",
                   {item: JSON.stringify(send) }, check_response_document_types, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "document_types/update/",
                    {item: JSON.stringify(send) }, check_response_document_types, "json");
            }
            return false;
        });

        var $reload_document_type = $(".reload_document_type");
        $reload_document_type.click(function (e) {
            document_types.dataSource.read();
            document_types.refresh();
            return false;
        });
///////////////////////////////////////  \\ВИДЫ ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТИ

///////////////////////////////////////  НАПРАВЛЕНИЯ
        var directions = $("#directions").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "directions/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "directions/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "direction_id",
                        fields: {
                            name: {
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            }
                        }
                    }
                },
                requestEnd: function(e) {
                    if ((e.type == "update") || (e.type == "destroy")) {
                        $reload_intellectual_property.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#directions_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            columns: [
                { field: "name", title: "Направление"},
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_directions_edit").val("true");
                            directions_model.set("direction_id", dataItem.direction_id);
                            directions_model.set("name", dataItem.name);
                            directions_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var directions_window = $("#change_directions_window").kendoWindow(window_option).data("kendoWindow");
        var directions_model = kendo.observable({
            direction_id: 0,
            name: ""
        });
        var $change_directions = $("#change_directions");
        kendo.bind($change_directions, directions_model);
        var directions_validator = $change_directions.kendoValidator(validator_option).data("kendoValidator");

        $(".add_direction").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_directions_edit").val(false);
            directions_model.set("direction_id", 0);
            directions_model.set("name", "");
            directions_window.center().open();
        });

        $("#directions_cancel").click(function (e) {
            directions_window.close();
            return false;
        });

        function check_response_directions(d) {
            var data = directions.dataSource;
            var item = data.get(d.direction_id);
            if (item) {
                item.name = d.name;
            } else {
                item = {
                    direction_id: d.direction_id,
                    name: d.name
                };
                data.add(item);
            }
            directions.refresh();
            directions_window.close();
        }

        $("#directions_save").click(function (e) {
            if (!directions_validator.validate()) return false;
            var send = {
                direction_id: directions_model.get("direction_id"),
                name: directions_model.get("name")
            };
            if ($("#is_directions_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "directions/create/",
                   {item: JSON.stringify(send) }, check_response_directions, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "directions/update/",
                    {item: JSON.stringify(send) }, check_response_directions, "json");
            }
            return false;
        });

        var $reload_direction = $(".reload_direction");
        $reload_direction.click(function (e) {
            directions.dataSource.read();
            directions.refresh();
            return false;
        });
///////////////////////////////////////  \\НАПРАВЛЕНИЯ

///////////////////////////////////////  КЛЮЧЕВЫЕ СЛОВА
        var tags = $("#tags").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "tags/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "tags/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "tag_id",
                        fields: {
                            name: {
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            }
                        }
                    }
                },
                requestEnd: function(e) {
                    if ((e.type == "update") || (e.type == "destroy")) {
                        $reload_intellectual_property.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#tags_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            columns: [
                { field: "name", title: "Направление"},
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_tags_edit").val("true");
                            tags_model.set("tag_id", dataItem.tag_id);
                            tags_model.set("name", dataItem.name);
                            tags_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var tags_window = $("#tags_window").kendoWindow(window_option).data("kendoWindow");
        var tags_model = kendo.observable({
            tag_id: 0,
            name: ""
        });
        var $change_tags = $("#change_tags");
        kendo.bind($change_tags, tags_model);
        var tags_validator = $change_tags.kendoValidator(validator_option).data("kendoValidator");

        $(".add_tags").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_tags_edit").val(false);
            tags_model.set("tag_id", 0);
            tags_model.set("name", "");
            tags_window.center().open();
        });

        $("#tags_cancel").click(function (e) {
            tags_window.close();
            return false;
        });

        function check_response_tags(d) {
            var data = tags.dataSource;
            var item = data.get(d.tag_id);
            if (item) {
                item.name = d.name;
            } else {
                item = {
                    tag_id: d.tag_id,
                    name: d.name
                };
                data.add(item);
            }
            tags.refresh();
            tags_window.close();
        }

        $("#tags_save").click(function (e) {
            if (!tags_validator.validate()) return false;
            var send = {
                tag_id: tags_model.get("tag_id"),
                name: tags_model.get("name")
            };
            if ($("#is_tags_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "tags/create/",
                   {item: JSON.stringify(send) }, check_response_tags, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "tags/update/",
                    {item: JSON.stringify(send) }, check_response_tags, "json");
            }
            return false;
        });

        var $reload_tags = $(".reload_tags");
        $reload_tags.click(function (e) {
            tags.dataSource.read();
            tags.refresh();
            return false;
        });
///////////////////////////////////////  \\КЛЮЧЕВЫЕ СЛОВА

///////////////////////////////////////  ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТЬ
        var intellectual_property = $("#intellectual_property").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "intellectual_property/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + ADMIN_BASE_URL + "intellectual_property/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            if (operation == "create" || operation == "update") {
                                if (Object.prototype.toString.call(options.doc_type) == "[object Array]") {
                                    options.doc_type = options.doc_type[0];
                                }
                                if (Object.prototype.toString.call(options.direction) == "[object Array]") {
                                    options.direction = options.direction[0];
                                }
                            }
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "intellectual_property_id",
                        fields: {
                            name: {
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            },
                            doc_type: {defaultValue: {doc_type_id: "", name: ""}},
                            direction: {defaultValue: {direction_id: "", name: ""}},
                            authors: {defaultValue: []},
                            tags: {defaultValue: []}
                        }
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#intellectual_property_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            detailTemplate: kendo.template($("#intellectual_property_detail_template").html()),
            detailInit: intellectual_property_detail_init,
            columns: [
                { field: "name", title: "Наименование"},
                { field: "doc_type", title: "Тип",
                    template: "#if (doc_type) if ('name' in doc_type) {# #=doc_type.name# # } #"},
                { field: "direction", title: "Направление",
                    template: "#if (direction) if ('name' in direction) {# #=direction.name# # } #"},
                { field: "authors", title: "Авторы",
                    template: "#var fio=[];for(var i=0;i<authors.length;i++){fio.push(authors[i].name);}#" +
                        "#=fio.join(', ')#"
                },
                { field: "tags", title: "Ключевые слова",
                    template: "#var tag=[];for(var i=0;i<tags.length;i++){tag.push(tags[i].name);}#" +
                        " #=tag.join(', ')#"
                },
                { command: [
                    {   text: "Редактировать",
                        click: function(e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            console.log(dataItem);
                            $("#is_intellectual_property_edit").val("true");
                            intellectual_property_model.set("intellectual_property_id", dataItem.intellectual_property_id);
                            intellectual_property_model.set("name", "");
                            intellectual_property_model.set("name", dataItem.name);
                            intellectual_property_model.set("doc_type", "");
                            intellectual_property_model.set("doc_type", dataItem.doc_type.doc_type_id);
                            intellectual_property_model.set("direction", "");
                            intellectual_property_model.set("direction", dataItem.direction.direction_id);
                            authors_multiselect.dataSource.read();
                            tags_multiselect.dataSource.read();
                            var authors = [], tags = [], i;
                            for (i=0; i<dataItem.authors.length; i++) authors.push(dataItem.authors[i].author_id);
                            authors_multiselect.value(authors);
                            for (i=0; i<dataItem.tags.length; i++) tags.push(dataItem.tags[i].tag_id);
                            tags_multiselect.value(tags);
                            intellectual_property_model.get("doc_types").read();
                            intellectual_property_model.get("directions").read();
                            intellectual_property_wibdow.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ],
            save: function (e) {
                var new_name = e.model.name;
                var data = intellectual_property.dataSource.data();
                var result;
                if (e.model.intellectual_property_id != "") { ///возможно это редактирование
                    result = $.grep(data,
                        function (o) {
                            if (o.intellectual_property_id != e.model.intellectual_property_id) {
                                return o.name.toUpperCase() == new_name.toUpperCase();
                            } else { //проверка, есть ли такие
                                return false;
                            }
                        }
                    );
                    if (result.length > 0) {
                        noty_error("Такое имя уже добавлен");
                        e.preventDefault();
                    }
                } else { //возможно это добавление, (id == "")
                    result = $.grep(data,
                        function (o) {
                            if (o.intellectual_property_id != "") {
                                return o.name.toUpperCase() == new_name.toUpperCase();
                            } else { //проверка, есть ли такие
                                return false;
                            }
                        }
                    );
                    if (result.length > 0) {
                        noty_error("Такое имя уже добавлен");
                        e.preventDefault();
                    }
                }
            }
        }).data("kendoGrid");

        var $reload_intellectual_property = $(".reload_intellectual_property");
        $reload_intellectual_property.click(function (e) {
            intellectual_property.dataSource.read();
            intellectual_property.refresh();
            return false;
        });

        var intellectual_property_wibdow = $("#change_intellectual_property_window").kendoWindow(window_option).data("kendoWindow");

        var authors_multiselect = $("#authors_multiselect").kendoMultiSelect({
            placeholder: "Выберите авторов...",
            dataTextField: "name",
            itemTemplate: '<span class="k-state-default"><h3>#:data.name#</h3>#if(data.department!=null){ #<p>#:data.department#</p># } #</span>',
            dataValueField: "author_id",
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: BASE_URL + ADMIN_BASE_URL + "authors/read/",
                            dataType: "json",
                            success: function (result) {
                                var data = [];
                                for (var i = 0; i < result.length; i++) {
                                    data.push({
                                        author_id: result[i].author_id,
                                        name: [result[i].surname, result[i].name, result[i].patronymic].join(" "),
                                        department: result[i].department__name
                                    })
                                }
                                options.success(data);
                            }
                        });
                    }
                }
            }
        }).data("kendoMultiSelect");
        var tags_multiselect = $("#tags_multiselect").kendoMultiSelect({
            placeholder: "Выберите ключевые слова...",
            dataTextField: "name",
            dataValueField: "tag_id",

            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "tags/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }
        }).data("kendoMultiSelect");

        var intellectual_property_model = kendo.observable({
            intellectual_property_id: 0,
            name: "",

            doc_types: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "document_types/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            doc_type: "",

            directions: new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + ADMIN_BASE_URL + "directions/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            direction: ""
        });
        kendo.bind($("#change_intellectual_property"), intellectual_property_model);

        var intellectual_property_validator = $("#change_intellectual_property").kendoValidator({
            rules: {
                required: function(input) {
                    if (input.is("[required]")) {
                        return $.trim(input.val()) !== "";
                    } else return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым"
            }
        }).data("kendoValidator");

        $(".add_intellectual_property").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_intellectual_property_edit").val("false");
            intellectual_property_model.set("intellectual_property_id", 0);
            intellectual_property_model.set("name", "");
            intellectual_property_model.set("doc_type", "");
            intellectual_property_model.set("direction", "");
            authors_multiselect.dataSource.read();
            tags_multiselect.dataSource.read();
            authors_multiselect.value([]);
            tags_multiselect.valueOf([]);
            intellectual_property_model.get("doc_types").read();
            intellectual_property_model.get("directions").read();
            intellectual_property_wibdow.center().open();
        });

        $("#intellectual_property_cancel").click(function (e) {
            intellectual_property_wibdow.close();
            return false;
        });

        function check_response_intellectual_property(d) {
            var data = intellectual_property.dataSource;
            var item = data.get(d.intellectual_property_id);
            if (item) {
                item.name = d.name;
                item.doc_type = d.doc_type;
                item.direction = d.direction;
                item.authors = d.authors;
                item.tags = d.tags;
            } else {
                item = {
                    intellectual_property_id: d.intellectual_property_id,
                    name: d.name,
                    doc_type: d.doc_type,
                    direction: d.direction,
                    authors: d.authors,
                    tags: d.tags
                };
                data.add(item);
            }
            intellectual_property.refresh();
            intellectual_property_wibdow.close();
        }

        $("#intellectual_property_save").click(function (e) {
            if (!intellectual_property_validator.validate()) return false;
            var doc_type = intellectual_property_model.get("doc_type");
            if (!doc_type) {doc_type = ""}
            var direction = intellectual_property_model.get("direction");
            if (!direction) {direction = ""}
            var send = {
                intellectual_property_id: intellectual_property_model.get("intellectual_property_id"),
                name: intellectual_property_model.get("name"),
                doc_type: doc_type,
                direction: direction,
                authors: authors_multiselect.value(),
                tags: tags_multiselect.value()
            };
            if ($("#is_intellectual_property_edit").val() === "false") {
               $.post(BASE_URL + ADMIN_BASE_URL + "intellectual_property/create/",
                   {item: JSON.stringify(send) }, check_response_intellectual_property, "json");
            } else {
                $.post(BASE_URL + ADMIN_BASE_URL + "intellectual_property/update/",
                    {item: JSON.stringify(send) }, check_response_intellectual_property, "json");
            }
            return false;
        });
///////////////////////////////////////  \\ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТЬ
    });
})(jQuery);
///////////////////////////////////////  ОТДЕЛЫ
function subdivision_detail_init(e) {
    var detailRow = e.detailRow;
    var subdivision_id = e.data.subdivision_id;

    var department_dataSource = new kendo.data.DataSource({
        type: "json",
        transport: {
            read: {
                url: BASE_URL + ADMIN_BASE_URL + "department/read/",
                type: "POST",
                dataType: "json"
            },
            destroy: {
                url: BASE_URL + ADMIN_BASE_URL + "department/destroy/",
                dataType: "json",
                type: "POST"
            },
            create: {
                url: BASE_URL + ADMIN_BASE_URL + "department/create/",
                dataType: "json",
                type: "POST"
            },
            update: {
                url: BASE_URL + ADMIN_BASE_URL + "department/update/",
                dataType: "json",
                type: "POST"
            },
            parameterMap: function (options, operation) {
                if (operation == "read") {
                    return {subdivision_id: subdivision_id};
                }
                if (options) {
                    options.subdivision_id = subdivision_id;
                    return {item: kendo.stringify(options)};
                }
            }
        },
        schema: {
            model: {
                id: "department_id",
                fields: { name: {
                    validation: {
                        required: { message: "Поле не может быть пустым" }
                    }
                }, tel: {}, mail: {} }
            }
        },
        requestEnd: function(e) {
            if ((e.type == "update") || (e.type == "destroy")) {
                $(".reload_author").click();
            }
        }
    });

    var department = detailRow.find("#department").kendoGrid({
        dataSource: department_dataSource,
        height: 350,
        sortable: true,
        editable: {
            mode: "inline",
            confirmation: "Вы уверены, что хотите удалить запись?",
            confirmDelete: "Да",
            cancelDelete: "Нет"
        },
        pageable: {
            pageSize: 20,
            //pageSizes: true,
            messages: {
                display: " ",
                empty: " ",
                previous: "Предыдущая страница",
                next: "Следующая страница",
                last: "Последняя страница",
                first: "Первая страница"
            }
        },
        toolbar: [
            { template: kendo.template($("#department_header_template").html()) }
        ],
        columns: [
            { field: "name", title: "Название" },
            { field: "tel", title: "Телефон", width: "300px" },
            { field: "mail", title: "Электронный адрес", width: "300px" },
            { command: [
                { name: "edit",
                    text: {
                        edit: "Редактировать",
                        update: "Сохранить",
                        cancel: "Отменить"
                    }
                },
                { name: "destroy", text: "Удалить" }
            ], width: "250px", attributes: { style: "text-align: center;"} }
        ],
        save: function (e) {
            var new_name = e.model.name;
            var data = department_dataSource.data();
            var result;
            if (e.model.department_id != "") { ///возможно это редактирование
                result = $.grep(data,
                    function (o) {
                        if (o.department_id != e.model.department_id) {
                            return o.name.toUpperCase() == new_name.toUpperCase();
                        } else { //проверка, есть ли такие подразделения
                            return false;
                        }
                    }
                );
                if (result.length > 0) {
                    noty_error("Такой отдел уже добавлен");
                    e.preventDefault();
                }
            } else { //возможно это добавление, (id == "")
                result = $.grep(data,
                    function (o) {
                        if (o.department_id != "") {
                            return o.name.toUpperCase() == new_name.toUpperCase();
                        } else { //проверка, есть ли такие подразделения
                            return false;
                        }
                    }
                );
                if (result.length > 0) {
                    noty_error("Такой отдел уже добавлен");
                    e.preventDefault();
                }
            }
        }
    }).data("kendoGrid");

    detailRow.find(".add_department").click(function (e) {
        department.addRow();
        return false;
    });

    detailRow.find(".add_reload").click(function (e) {
        department.dataSource.read();
        department.refresh();
        return false;
    });
}
///////////////////////////////////////  \\ОТДЕЛЫ

///////////////////////////////////////  ФАЙЛЫ
function intellectual_property_detail_init(e) {
    var detailRow = e.detailRow;
    var intellect_prop_id = e.data.intellectual_property_id;

    var files = [
//        { name: "file1.doc", size: 525, extension: ".doc" },
//        { name: "file2.jpg", size: 600, extension: ".jpg" },
//        { name: "file3.xls", size: 720, extension: ".xls" }
    ];

    $.post(ADMIN_BASE_URL + "file/get_list/",
        {item: JSON.stringify({intellectual_property_id: intellect_prop_id})},
        function(data) {
            files = data;
            detailRow.find("#files").kendoUpload({
                multiple: true,
                async: {
                    saveUrl: ADMIN_BASE_URL + "file/upload/",
                    removeUrl: ADMIN_BASE_URL + "file/delete/",
                    autoUpload: false
                },
                localization: {
                    cancel: "Отменить",
                    dropFilesHere: "Перетащите файл сюда",
                    headerStatusUploaded: "Выполнено",
                    headerStatusUploading: "Загрузка...",
                    remove: "Удалить",
                    retry: "Повторить",
                    select: "Выбрать файлы для загрузки...",
                    statusFailed: "Ошибка загрузки",
                    statusUploaded: "Загруженно",
                    statusUploading: "Загрузка...",
                    statusWarning: "Внимание",
                    uploadSelectedFiles: "Загрузить"
                },
                template: kendo.template($('#fileTemplate').html()),
                files: files,
                select: function(e) {
                    console.log(e);
                    $.each(e.files, function (index, value) {
                        console.log("Name: " + value.name);
                        console.log("Size: " + value.size + " bytes");
                        console.log("Extension: " + value.extension);
                    });
                },
                upload: function (e) {
                    var f = e.files;
                    console.log(f);
                    for (var i=0; i<f.length; i++) {
                        for (var j=i+1; j<f.length; j++) {
                            if ((f[i].name == f[j].name) &&
                                (f[i].size == f[j].size) &&
                                (f[i].extension == f[j].extension)) {
                                noty_error("Не загружайте одинаковые файлы!");
                                e.preventDefault();
                                return;
                            }
                        }
                    }
                    e.data = {item: JSON.stringify({intellectual_property_id: intellect_prop_id})};
                },
                remove: function(e) {
                    var files = e.files;
                    e.data = {item: JSON.stringify(files)};
                    if (!confirm("Вы уверены, что хотите удалить "+files[0].name+"?")) {
                        e.preventDefault();
                    }
                }
            });
    }, "json");
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
///////////////////////////////////////  \\ФАЙЛЫ