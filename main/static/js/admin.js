/**
 * Created by user on 23.01.14.
 */

var ADMIN_BASE_URL = "admin/";

(function ($) {
    $(document).ready(function (e) {
        var GRID_HEIGHT = $(window).height() - $("header#main_header").height() - $("footer#main_footer").height() - 65;
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
                    create: {
                        url: BASE_URL + ADMIN_BASE_URL + "subdivision/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL + ADMIN_BASE_URL + "subdivision/update/",
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
                        fields: { name: {
                            validation: { required: { message: "Поле не может быть пустым" } }
                        }, tel: {} }
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
                    { name: "edit",
                        text: {
                            edit: "Редактировать",
                            update: "Сохранить",
                            cancel: "Отменить"
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $(".add_subdivision").click(function (e) {
            subdivision.addRow();
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
                    create: {
                        url: BASE_URL + ADMIN_BASE_URL + "authors/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL + ADMIN_BASE_URL + "authors/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        console.log(options, operation);
                        if (operation !== "read" && options) {
                            if (operation == "update") {
                                if (typeof options.department == "object") {
                                    options.department = options.department.department_id;
                                }
                            }
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
                            department: {type: "number", defaultValue: 0 }
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
                { field: "name", title: "ФИО", template: "#var fio=[surname,name,patronymic].join(' ');# #=fio#",
                    editor: function (container, options) {
                        $('<input required placeholder="Фамилия" data-bind="value: surname" class="k-textbox"/>')
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container);
                        $('<input required placeholder="Имя" data-bind="value: name" class="k-textbox" />')
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container);
                        $('<input data-bind="value: patronymic" placeholder="Отчество" class="k-textbox"/>')
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container);
                    }},
                { field: "post", title: "Ученая степень", width: "300px", attributes: {title: "#=post#"} },
                { field: "tel", title: "Телефон", width: "150px", attributes: {title: "#=tel#"} },
                { field: "mail", title: "Электронный адрес", width: "250px", attributes: {title: "#=mail#"} },
                { field: "department__name", title: "Подразделение", width: "200px", attributes: {title: ""},
                    editor: function (container, options) {
                        $('<input id="author_subdivision" data-text-field="name" data-value-field="subdivision_id" />')
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container)
                            .kendoDropDownList({
                                optionLabel: "Выберите подразделение...",
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: {
                                            url: BASE_URL + ADMIN_BASE_URL + "subdivision/read/",
                                            dataType: "json",
                                            type: "POST"
                                        }
                                    }
                                }
                            });
                        $('<input data-text-field="name" disabled="disabled" data-value-field="department_id" data-bind="value: department"/>')
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container)
                            .kendoDropDownList({
                                optionLabel: "Выберите отдел...",
                                cascadeFrom: "author_subdivision",
                                cascadeFromField: "subdivision_id",
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: {
                                            url: BASE_URL + ADMIN_BASE_URL + "department/read/",
                                            type: "POST",
                                            dataType: "json"
                                        }
                                    }
                                }
                            });
                    }
                },
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
            ]
        }).data("kendoGrid");

        $(".add_author").click(function (e) {
            authors.addRow();
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
                    create: {
                        url: BASE_URL + ADMIN_BASE_URL + "document_types/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL + ADMIN_BASE_URL + "document_types/update/",
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
                    { name: "edit",
                        text: {
                            edit: "Редактировать",
                            update: "Сохранить",
                            cancel: "Отменить"
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $(".add_document_type").click(function (e) {
            document_types.addRow();
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
                    create: {
                        url: BASE_URL + ADMIN_BASE_URL + "directions/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL + ADMIN_BASE_URL + "directions/update/",
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
                    { name: "edit",
                        text: {
                            edit: "Редактировать",
                            update: "Сохранить",
                            cancel: "Отменить"
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $(".add_direction").click(function (e) {
            directions.addRow();
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
                    create: {
                        url: BASE_URL + ADMIN_BASE_URL + "tags/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL + ADMIN_BASE_URL + "tags/update/",
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
                    { name: "edit",
                        text: {
                            edit: "Редактировать",
                            update: "Сохранить",
                            cancel: "Отменить"
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $(".add_tags").click(function (e) {
            tags.addRow();
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

        var intellectual_property_wibdow = $("#change_intellectual_property_window").kendoWindow({
            resizable: false,
            actions: [],
            animation: {
                close: {
                    effects: "",
                    duration: 350
                },
                open: {
                    effects: "",
                    duration: 350
                }
            },
            modal: true,
            visible: false,
            width: 750,
            title: "Редактировать"
        }).data("kendoWindow");

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