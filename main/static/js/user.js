/**
 * Created by user on 04.02.14.
 */

var API_BASE_URL = "api/";

(function ($) {
    $(document).ready(function (e) {

        var t1 = 'Поиск по авторам <i class="fa fa-caret-up"></i>',
            t2 = 'Поиск <i class="fa fa-caret-down"></i>',
            $search_switcher = $("#search_switcher").addClass("margin_top").html(t1),
            $search_by_word = $("#search_by_word"),
            $search_by_author = $("#search_by_author").hide();
        $search_switcher.click(function() {
            $search_by_word.slideToggle("fast");
            $search_by_author.slideToggle("fast");
            var t = $search_switcher.html();
            $search_switcher.toggleClass("margin_top");
            $search_switcher.html(t == t1 ? t2:t1);
        });

        var search_query = $("#search_query").kendoAutoComplete({ //TODO: перевести сообщения повторной загрузки
            dataSource: {
//                serverFiltering: true,
                transport: {
                    read: {
                        dataType: "json",
                        type: "POST",
                        url: BASE_URL + API_BASE_URL + "search_data_source/"
                    }
//                    parameterMap: function(data, type) {
//                        console.log(data, type);
//                        if (type == "read") {
//                            return {filter: JSON.stringify(data.filter.filters[0].value)}
//                        }
//                    }
                }
            },
            dataTextField: "name",
            separator: ", ",
            filter: "contains"
//            placeholder: "Поиск",
        }).data("kendoAutoComplete");
        search_query.wrapper.width(310);

        var doc_type = $("#doc_type").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "doc_type_id",
            dataSource: {
                transport: {
                    read: {
                        dataType: "json",
                        type: "POST",
                        url: BASE_URL+API_BASE_URL+"document_types/read/"
                    }
                }
            },
            optionLabel: "По всем документам"
        }).data("kendoDropDownList");
        doc_type.wrapper.css({ display: "block", width: "inherit", "margin-left": "90px"});


        var search_tree = $("#search_tree").kendoTreeView({
            dataSource: new kendo.data.HierarchicalDataSource({
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL+"tree_data_source/",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        //hasChildren: "has_items",
                        children: "items"
                    }
                }
            }),
            dataTextField: "name",
            template: kendo.template($("#tree_item_template").html())
        }).data("kendoTreeView");

        var result_data_source = new kendo.data.DataSource({
            type: "json",
            pageSize: 20,
            transport: {
                read: {
                    url: BASE_URL +  "api/intellectual_property/read/",
                    dataType: "json",
                    type: "POST"
                }
            },
            schema: {
                model: {
                    id: "intellectual_property_id",
                    fields: {
                        name: {type: "string" },
                        doc_type: {},
                        direction: {},
                        authors: {},
                        tags: {}
                    }
                }
            }
        });

        $("#pager").kendoPager({
            dataSource: result_data_source,
            messages: {
                display: "{0} - {1} из {2}",
                empty: "Нет данных для отображения",
                first: "Первая страница",
                itemsPerPage: "записей на странице",
                last: "Последняя страница",
                next: "Следующая страница",
                of: "из {0}",
                page: "Страница",
                previous: "Предыдущая страница",
                refresh: "Обновить"
            }
        });

        var result = $("#result").kendoListView({
            dataSource: result_data_source,
            template: kendo.template($("#result_item_template").html())
        }).data("kendoGrid");

        var $search =  $("#search");
        $search.click(function() {
            var query = search_query.value();
            if (query.length = 0) return false; //TODO: дефолтный результат поиска
            query = query.replace(/,/g, ''); //удалить все ,
            query = query.replace(/\s+/g, ' '); //пробелы
            query = $.trim(query);
            query = query.split(" ");
            var dt = doc_type.value();
            if (dt) { dt = parseInt(dt) } else { dt = 0 }
            var data = {
                query: query,
                doc_type: dt
            };
            $.post(BASE_URL+API_BASE_URL+"search/", {item: JSON.stringify(data)},
                function(r) {
                    console.log(r)
                }, "json");
            return false;
        });

        $("body").on("click", ".tag", function() {
            var tag = $(this).text();
            search_query.value(tag);
            doc_type.value("");
            $search.click();
            return false;
        })
    });
})(jQuery)