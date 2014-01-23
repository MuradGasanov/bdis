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
                    parameterMap: function(options, operation) {
                        if (operation !== "read" && options.models) {
                            return {item: kendo.stringify(options.models)};
                        }
                    }
                },
                pageSize: 5,
                batch: true,
                schema: {
                    model: {
                        id: "id",
                        fields: { name: {}, tel: {} }
                    }
                }
            },
            height: 430,
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
                    display: "{0}-{1} из {2} записей",
                    empty: " ",
                    previous: "Предыдущая страница",
                    next: "Следующая страница",
                    last: "Последняя страница",
                    first: "Первая страница"
                }
            },
            detailTemplate: kendo.template($("#subdivision_template").html()),
            detailInit: detailInit,
//            dataBound: function() {
//                this.expandRow(this.tbody.find("tr.k-master-row").first());
//            },
            columns: [
                { field: "name", title: "Название" },
                { field: "tel", title: "Телефон", width: "300px" },
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
        });
    });
})(jQuery);

function detailInit(e) {
    var detailRow = e.detailRow;
    var subdivision_id = e.data.id;

    detailRow.find("#department").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL+ADMIN_BASE_URL+"department/read/",
                        data: {
                            subdivision_id: subdivision_id
                        },
                        type: "POST",
                        dataType: "json"
                    },
                    destroy: {
                        url: BASE_URL+ADMIN_BASE_URL+"department/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function(options, operation) {
                        if (operation !== "read" && options.models) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                pageSize: 5,
                batch: true,
                schema: {
                    model: {
                        id: "id",
                        fields: { name: {}, tel: {} }
                    }
                }
            },
            height: 430,
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
                    display: "{0}-{1} из {2} записей",
                    empty: " ",
                    previous: "Предыдущая страница",
                    next: "Следующая страница",
                    last: "Последняя страница",
                    first: "Первая страница"
                }
            },
        columns: [
                { field: "name", title: "Название" },
                { field: "tel", title: "Телефон", width: "300px" },
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
    });
};
