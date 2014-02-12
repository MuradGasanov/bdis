/**
 * Created by user on 04.02.14.
 */

var API_BASE_URL = "api/";

(function ($) {
    $(document).ready(function (e) {

        var $body = $("body");

        var download_list = [], //список с id ИС для загрузки ли добавления в каталог
            $download = $("#download").addClass("k-state-disabled"),
            $add_directory = $("#add_directory").addClass("k-state-disabled");
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
            template: kendo.template($("#tree_item_template").html()),
            select: function(e) {
                var data_item = $(e.node).find("span.tree-item")[0]
                data_item = $(data_item);
                var send = {
                    id: data_item.data("id"),
                    type: data_item.data("type")
                }
                $.noty.closeAll();
                var n = noty_seach_log();
                $.post(BASE_URL+API_BASE_URL+"search_by_author/", {item: JSON.stringify(send)},
                function(r) {
                    n.close();
                    search_result_render(r)
                }, "json");
            }
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
            }
        });

        var pager = $("#pager").kendoPager({
            dataSource: [], //result_data_source,
            messages: {
                display: "Записей в списке: {2}",
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
        }).data("kendoPager");

        var result = $("#result").kendoListView({
            dataSource: [], //result_data_source,
            template: kendo.template($("#result_item_template").html())
        }).data("kendoListView");

        var $search =  $("#search");
        $search.click(function() {
            var query = search_query.value();
            if (query.length != 0) {
                query = query.replace(/,/g, ''); //удалить все ,
                query = query.replace(/\s+/g, ' '); //пробелы
                query = $.trim(query);
                query = query.split(" ");
            } else {
                query = [""];
            }
            var dt = doc_type.value();
            if (dt) { dt = parseInt(dt) } else { dt = 0 }
            var data = {
                query: query,
                doc_type: dt
            };
            $.noty.closeAll();
            var n = noty_seach_log();
            $.post(BASE_URL+API_BASE_URL+"search/", {item: JSON.stringify(data)},
                function(r) {
                    n.close();
                    search_result_render(r);
                }, "json");
            return false;
        });
        $search.click();

        $body.on("click", ".tag", function() {
            var tag = $(this).text();
            search_query.value(tag);
            doc_type.value("");
            $search.click();
            return false;
        });

        function search_result_render(data) {
            if (data.length > 0) {
                download_list = [];
                $download.addClass("k-state-disabled");
                $add_directory.addClass("k-state-disabled");
                var dataSource = new kendo.data.DataSource({
                  data: data
                });
                pager.setDataSource(dataSource);
                result.setDataSource(dataSource);
            } else {
                noty_error("Ваш запрос не дал результатов")
            }
        }

        $body.on("click", ".k-button.select-item", function(e) {
            var $this = $(this);
            var id = $this.data("id");
//            var current_intellectual_property = $this.parents(".intellectual_property_item.section")[0];
//            $(current_intellectual_property).toggleClass("selected");
            var index = download_list.indexOf(id);
            if (index == -1) {
                download_list.push(id);
                $this.text("Отмена");
                if ($download.hasClass("k-state-disabled")) {
                    $download.removeClass("k-state-disabled");
                    $add_directory.removeClass("k-state-disabled");
                }
                $this.addClass("k-state-selected");
            } else {
                download_list.splice(index, 1);
                if (download_list.length == 0) {
                    $download.addClass("k-state-disabled");
                    $add_directory.addClass("k-state-disabled");
                }
                $this.text("Выбрать");
                $this.removeClass("k-state-selected");
            }
            return false;
        });

        $download.click(function(e) {
            if ($download.hasClass("k-state-disabled")) return false;
            var send = {
                files: download_list
            };
            $.noty.closeAll();
            var n = noty_seach_log("Подготвка в загрузке...");
            setTimeout(function() { n.close() }, 1500);
            $.fileDownload(BASE_URL+API_BASE_URL+"file/download/", {
                httpMethod: "POST",
                data: {item: JSON.stringify(send)},
                successCallback: function (url) {
                    n.close();
                    console.log(url);
                },
                failCallback: function (responseHtml, url) {
                    n.close();
                    alert("Ошибка загрузки файла");
                    console.log(responseHtml, url);
                }
            });
//            $.fileDownload(BASE_URL+API_BASE_URL+"file/download/", {httpMethod: "POST", data: {item: JSON.stringify(send)}}).done(function() {alert("asd")}).fail(function() {alert("fail")})
//            $.post(BASE_URL+API_BASE_URL+"file/download/", {item: JSON.stringify(send)},
//            function(data) {
//                n.close();
//            }, "json" );
//            console.log(download_list);
            return false;
        });

        var $change_directory = $("#change_directory"),

            directory_window = $("#change_directory_window").kendoWindow({
                resizable: false, actions: [/*здесь скрываются кнопки*/],
                animation: { close: { effects: "", duration: 350 },
                    open: { effects: "", duration: 350 } },
                modal: true, width: 500, visible: false
            }).data("kendoWindow"),

            directory_model = kendo.observable({
                id: 0,
                name: ""
            });

        window.directory_window = directory_window;

        kendo.bind($change_directory, directory_model);
        var directory_validator = $change_directory.kendoValidator({
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
        }).data("kendoValidator");

        $("#directory_cancel").click(function() {
            directory_window.close();
            return false;
        });

        $("#directory_save").click(function() {
            if (!directory_validator.validate()) return false;
            var send = {
                id: directory_model.get("id"),
                name: directory_model.get("name"),
                intellectual_properties_id: download_list
            };
            $.post(BASE_URL + API_BASE_URL + "directory/create/", {item: JSON.stringify(send) },
            function(response) {
                console.log(response);
                kendo.fx(directory_window.wrapper)
                    .transfer($("#catalogs_page"))
                    .play()
                    .then(function() { directory_window.close() })
            });
            return false;
        });

        $add_directory.click(function() {
            if ($add_directory.hasClass("k-state-disabled")) return false;
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            directory_window.center().open();
            return false;
        });


    });
})(jQuery)