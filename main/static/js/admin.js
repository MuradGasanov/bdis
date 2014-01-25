/**
 * Created by user on 23.01.14.
 */

var ADMIN_BASE_URL = "admin/";

(function($) {
    $(document).ready(function(e) {
        $("#tab_strip").kendoTabStrip({
            animation:  {
                open: {
                    effects: "fadeIn"
                }
            }
        });

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
                            return {models: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        fields: { name: {
                                    validation: { required: { message: "Поле не может быть пустым" } }
                        }, tel: {} }
                    }
                }
            },
            toolbar:  [
                { template: kendo.template($("#subdivision_header_template").html()) }
            ],
            height: 430,
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
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            name: { },
                            surname: { },
                            patronymic: { },
                            tel: {},
                            mail: {},
                            department: { defaultValue: { id: 0, text: ""} }
                        }
                    }
                }
            },
            toolbar:  [
                { template: kendo.template($("#authors_header_template").html()) }
            ],
            height: 430,
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
                                $('<input required="Поле не может быть пустым" placeholder="Фамилия" data-bind="value: surname" class="k-textbox" style="margin: 3px 3px 1px"/>')
                                    .appendTo(container);
                                $('<input required="Поле не может быть пустым" placeholder="Имя" data-bind="value: name" class="k-textbox" style="margin: 3px 3px 1px"/>')
                                    .appendTo(container);
                                $('<input data-bind="value: patronymic" placeholder="Отчество" class="k-textbox" style="margin: 3px 3px 1px"/>')
                                    .appendTo(container);
                            }},
                { field: "tel", title: "Телефон", width: "300px", attributes: {title: "#=tel#"} },
                { field: "mail", title: "Электронный адрес", width: "300px", attributes: {title: "#=mail#"} },
                { field: "department", title: "Подразделение", width: "300px", attributes: {title: ""} },
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
        })

    });
})(jQuery);

function detailInit(e) {
    var detailRow = e.detailRow;
    var subdivision_id = e.data.id;

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
                    return {models: kendo.stringify(options)};
                }
            }
        },
        schema: {
            model: {
                id: "id",
                fields: { name: {
                            validation: {
                                required: { message: "Поле не может быть пустым" }
                            }
                }, tel: {}, mail: {} }
            }
        },
        requestStart: function(e) {
//            console.log("request started",e);
        },
        requestEnd: function(e) {
//            console.log("request ended",e);
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
            if (e.model.id != "") { ///возможно это редактирование
                return
            } else { //возможно это добавление, (id == "")
                var new_name = e.model.name;
                var data = department_dataSource.data();
                var result = $.grep(data,
                    function(e) {
                        if (e.id != "") { return e.name.toUpperCase() == new_name.toUpperCase(); } //проверка, есть ли такие подразделения
                        else { return false; }
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
}
