/**
 * Created by user on 23.01.14.
 */

var ADMIN_BASE_URL = "admin/";

(function($) {
    $(document).ready(function(e) {

        var GRID_HEIGHT = $(window).height() - $("header#main_header").height() - $("footer#main_footer").height() - 65;
        $("#tab_strip").kendoTabStrip({
            animation:  {
                open: {
                    effects: "fadeIn"
                }
            },
            select: function(e) {
                var height = GRID_HEIGHT;
                height = height - 63;
                $(e.contentElement).find("div.k-grid-content").css("height",height+"px");
            }
        });
/////////////////////////////////////// ПОДРАЗДЕЛЕНИЯ
        var subdivision = $("#subdivision").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL+ADMIN_BASE_URL+"subdivision/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"subdivision/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"subdivision/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"subdivision/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
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

        $(".add_subdivision").click(function(e) {
            subdivision.addRow();
            return false;
        });

        $(".reload_subdivision").click(function(e) {
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
                        url: BASE_URL+ADMIN_BASE_URL+"authors/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"authors/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"authors/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"authors/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            },
                            surname: {},
                            patronymic: {},
                            tel: {},
                            post: {},
                            mail: {},
                            department: {}
                        }
                    }
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
//            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
//            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
            columns: [
                { field: "name", title: "ФИО", template: "#var fio=[surname,name,patronymic].join(' ');# #=fio#",
                    editor: function(container, options) {
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
                { field: "post", title: "Должность", width: "300px", attributes: {title: "#=post#"} },
                { field: "tel", title: "Телефон", width: "150px", attributes: {title: "#=tel#"} },
                { field: "mail", title: "Электронный адрес", width: "250px", attributes: {title: "#=mail#"} },
                { field: "department__name", title: "Подразделение", width: "200px", attributes: {title: ""},
                    editor: function(container, options) {
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
                                            url: BASE_URL+ADMIN_BASE_URL+"department/read/",
                                            type: "POST",
                                            dataType: "json"
                                        }
                                    }
                                },
                                select: function(e) {
//                                    var dataItem = this.dataItem(e.item.index());
//                                    is_department_select = dataItem;
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
            ],
            save: function(e) {
//                if (is_department_select) { //если изменили подразделние, меняем и название
//                    if (is_department_select.department_id == e.model.department) {
//                        e.model.department__name = is_department_select.name;
//                    }
//                    is_department_select = false;
//                }
            }
        }).data("kendoGrid");

        $(".add_author").click(function(e) {
            authors.addRow();
            return false;
        });

        $(".reload_author").click(function(e) {
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
                        url: BASE_URL+ADMIN_BASE_URL+"document_types/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"document_types/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"document_types/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"document_types/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
//            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
//            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
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
            ],
            save: function(e) {
            }
        }).data("kendoGrid");

        $(".add_document_type").click(function(e) {
            document_types.addRow();
            return false;
        });

        $(".reload_document_type").click(function(e) {
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
                        url: BASE_URL+ADMIN_BASE_URL+"directions/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"directions/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"directions/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"directions/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
//            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
//            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
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

        $(".add_direction").click(function(e) {
            directions.addRow();
            return false;
        });

        $(".reload_direction").click(function(e) {
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
                        url: BASE_URL+ADMIN_BASE_URL+"tags/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"tags/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"tags/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"tags/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
//            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
//            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
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

        $(".add_tags").click(function(e) {
            tags.addRow();
            return false;
        });

        $(".reload_tags").click(function(e) {
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
                        url: BASE_URL+ADMIN_BASE_URL+"intellectual_property/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"intellectual_property/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    create: {
                        url: BASE_URL+ADMIN_BASE_URL+"intellectual_property/create/",
                        dataType: "json",
                        type: "POST"
                    },
                    update: {
                        url: BASE_URL+ADMIN_BASE_URL+"intellectual_property/update/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
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
                            doc_type: {defaultValue: {doc_type_id: 0, name: ""}},
                            direction: {defaultValue: {direction_id: 0, name: ""}},
                            authors: {defaultValue: []},
                            tags: {defaultValue: []}
                        }
                    }
                }
            },
            toolbar:  [
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
//            pageable: {
//                pageSize: 20,
//                //pageSizes: true,
//                messages: {
//                    display: "{0}-{1} из {2} записей",
//                    empty: " ",
//                    previous: "Предыдущая страница",
//                    next: "Следующая страница",
//                    last: "Последняя страница",
//                    first: "Первая страница"
//                }
//            },
//            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
//            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
            columns: [
                { field: "name", title: "Наименование"},
                { field: "doc_type", title: "Тип", template: "#if (doc_type) if ('name' in doc_type) {# #=doc_type.name# # } #",
                    editor: function(container, options) {
                        $('<input data-text-field="name" data-value-field="doc_type_id" data-bind="value: doc_type" />')
                            .css({margin: "3px 0px 1px"}).appendTo(container)
                            .kendoMultiSelect({
                                autoBind: false,
                                placeholder: "Выбрать...",
                                maxSelectedItems: 1,
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: {
                                            url: BASE_URL + ADMIN_BASE_URL + "document_types/read/",
                                            dataType: "json",
                                            type: "POST"
                                        }
                                    }
                                }
                            });
                    }
                },
                { field: "direction", title: "Направление", template: "#if (direction) if ('name' in direction) {# #=direction.name# # } #",
                    editor: function(container, options) {
                        $('<input data-text-field="name" data-value-field="direction_id" data-bind="value: direction" />')
                            .css({margin: "3px 0px 1px"}).appendTo(container)
                            .kendoMultiSelect({
                                autoBind: false,
                                placeholder: "Выбрать...",
                                maxSelectedItems: 1,
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: {
                                            url: BASE_URL + ADMIN_BASE_URL + "directions/read/",
                                            dataType: "json",
                                            type: "POST"
                                        }
                                    }
                                },
                                select: function(e) {
                                    console.log(e);
//                                    var dataItem = this.dataItem(e);
//                                    console.log("select (" + dataItem.text + " : " + dataItem.value + ")" );
//                                    console.log(e.sender._selectedValue);
                                }
                            });
                    }},
                { field: "authors", title: "Авторы",
                    template: "#var fio=[];for(var i=0;i<authors.length;i++){fio.push(authors[i].name);}#" +
                              "#=fio.join(', ')#",
                    editor: function(container, options) {
                        $("<select multiple='multiple' data-bind='value : authors'/>")
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container)
                            .kendoMultiSelect({
                                placeholder: "Выберите авторов...",
                                dataTextField: "name",
                                itemTemplate: '<span class="k-state-default"><h3>#:data.name#</h3>#if(data.department!=null){ #<p>#:data.department#</p># } #</span>',
                                dataValueField: "author_id",
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: function(options) {
                                            $.ajax({
                                                url: BASE_URL + ADMIN_BASE_URL + "authors/read/",
                                                dataType: "json",
                                                success: function(result) {
                                                    var data = [];
                                                    for(var i=0; i<result.length; i++){
                                                        data.push({
                                                            author_id: result[i].author_id,
                                                            name: [result[i].surname,result[i].name,result[i].patronymic].join(" "),
                                                            department: result[i].department__name
                                                        })
                                                    }
                                                    options.success(data);
                                                }
                                              });
                                        }
                                    }
                                }
                            });
                    }
                },
                { field: "tags", title: "Ключевые слова",
                    template: "#var tag=[];for(var i=0;i<tags.length;i++){tag.push(tags[i].name);}#" +
                              " #=tag.join(', ')#",
                    editor: function(container, options) {
                        $("<select multiple='multiple' data-bind='value : tags'/>")
                            .css({margin: "3px 0px 1px"})
                            .appendTo(container)
                            .kendoMultiSelect({
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
                            });
                    }
                },
                { command: [ { name: "edit", text:  { edit: "Редактировать", update: "Сохранить", cancel: "Отменить" } },
                             { name: "destroy", text: "Удалить" }
                           ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $(".add_intellectual_property").click(function(e) {
            intellectual_property.addRow();
            return false;
        });

        $(".reload_intellectual_property").click(function(e) {
            intellectual_property.dataSource.read();
            intellectual_property.refresh();
            return false;
        });
///////////////////////////////////////  \\ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТЬ
    });
})(jQuery);
///////////////////////////////////////  ОТДЕЛЫ
function detailInit(e) {
    var detailRow = e.detailRow;
    var subdivision_id = e.data.subdivision_id;

    var department_dataSource = new kendo.data.DataSource({
        type: "json",
        transport: {
            read: {
                url: BASE_URL+ADMIN_BASE_URL+"department/read/",
                type: "POST",
                dataType: "json"
            },
            destroy:
            {
                url: BASE_URL+ADMIN_BASE_URL+"department/destroy/",
                dataType: "json",
                type: "POST"
            },
            create: {
                url: BASE_URL+ADMIN_BASE_URL+"department/create/",
                dataType: "json",
                type: "POST"
            },
            update: {
                url: BASE_URL+ADMIN_BASE_URL+"department/update/",
                dataType: "json",
                type: "POST"
            },
            parameterMap: function(options, operation) {
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
        requestStart: function(e) {
        },
        requestEnd: function(e) {
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
        toolbar:  [
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
        save: function(e) {
            var new_name = e.model.name;
            var data = department_dataSource.data();
            var result;
            if (e.model.department_id != "") { ///возможно это редактирование
                result = $.grep(data,
                    function(o) {
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
                    function(o) {
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

    detailRow.find(".add_department").click(function(e) {
        department.addRow();
        return false;
    });

    detailRow.find(".add_reload").click(function(e) {
        department.dataSource.read();
        department.refresh();
        return false;
    });
}
///////////////////////////////////////  \\ОТДЕЛЫ