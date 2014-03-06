/**
 * Created by Murad Gasanov on 04.02.14.
 */

var API_BASE_URL = "api/";

(function ($) {
    $(document).ready(function (e) {
        var M_LOAD = "Загрузка...",
            VIEWER_URL = "/static/pdf.js/web/viewer.html",
            search_options = {
                query: "",
                field: "",
                type: "",
                clear: function() {
                    this.query = "";
                    this.field = "";
                    this.type = "";
                }
            },
            n = noty_message(M_LOAD, false);

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
////////////////////////////////////// ПОИСК ПО СЛОВАМ
        var search_query = $("#search_query").kendoAutoComplete({
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

        var $search =  $("#search"); //кнопка поиска
        $search.click(function() {
            var query = search_query.value();
            query = $.trim(query);
            if ((query.length < 3) && (query.length > 0)) return false;
            if (query.length != 0) {
                if (query.indexOf(",") != -1) {
                    if (query[query.length - 1] == ",") {
                        query = query.substring(0, query.length - 1);
                    }
                    query = query.split(",");
                } else {
                    query = query.split(" ");
                }
                $.each(query, function(i, o) {
                    query[i] = $.trim(query[i]);
                });
//                query = query.replace(/,/g, ''); //удалить все ,
//                query = query.replace(/\s+/g, ' '); //пробелы
//                query = $.trim(query);
//                query = query.split(" ");
            } else {
                query = [""];
            }
            var dt = doc_type.value();
            if (dt) { dt = parseInt(dt) } else { dt = 0 }
            search_options.clear();
            search_options.query = query;
            search_options.type = dt;
            console.log(search_options);
            $.noty.closeAll();
            n = noty_seach_log();
            result.dataSource.read();
            return false;
        });
//        $search.click();
////////////////////////////////////// ПОИСК ПО СЛОВАМ\\

////////////////////////////////////// ПОИСК ПО АВТОРАМ
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
            messages: {
                retry: "Повторить",
                requestFailed: "Не удалось загрузить список авторов.",
                loading: "Загрузка..."
            },
            select: function(e) {
                var data_item = $(e.node).find("span.tree-item")[0];
                data_item = $(data_item);
                search_options.clear();
                search_options.query = data_item.data("id");
                search_options.type = data_item.data("type");
                search_options.field = "AUTHOR";
                console.log(search_options);
                $.noty.closeAll();
                n = noty_seach_log();
                result.dataSource.read();
            }
        }).data("kendoTreeView");
////////////////////////////////////// ПОИСК ПО АВТОРАМ\\

////////////////////////////////////// ПОИСК ПО ТЕГАМ
        $body.on("click", ".tag", function() {
            var tag = $(this).text();
//            search_query.value([tag,","].join("")); //["[",tag,"]"].join("") TODO: поиск по тегам с пробелами
            search_options.clear();
            search_options.query = tag;
            search_options.field = "TAG";
            console.log(search_options);
            n = noty_seach_log();
            result.dataSource.read();
            doc_type.value("");
            search_query.value("");
            if (!$search_by_word.is(":visible")) $search_switcher.click();
            return false;
        });
////////////////////////////////////// ПОИСК ПО ТЕГАМ\\

////////////////////////////////////// ВЫВОД РЕЗУЛЬТАТОВ
        var search_data_source = new kendo.data.DataSource({
            type: "json",
            transport: {
                read: {
                    url: BASE_URL+API_BASE_URL+"search/",
                    dataType: "json",
                    type: "POST"
                },
                parameterMap: function (options, operation) {
                    console.log(options, operation);
                    if (operation == "read") {
                        var o = {
                            take: options.take,
                            skip: options.skip,
                            query: search_options.query,
                            type: search_options.type,
                            field: search_options.field
                        };
                        return {options: kendo.stringify(o)};
                    }
                }
            },
            requestEnd: function (e) {
                console.log("requestEnd");
                n.close();
            },
            pageSize: 15,
            serverPaging: true,
            schema: {
                data: "items",
                total: "total"
            }
        });

        var pager = $("#pager").kendoPager({
            dataSource: search_data_source,
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
            dataSource: search_data_source,
            template: kendo.template($("#result_item_template").html())
        }).data("kendoListView");

        function search_result_render(data) {
            if (data.length > 0) {
                download_list = [];
                $download.addClass("k-state-disabled");
                $add_directory.addClass("k-state-disabled");
                var dataSource = new kendo.data.DataSource({
                    data: data,
                    pageSize: 20
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
            var uid = $($this.parents(".intellectual_property_item.section")[0]).data("uid");
            var dataItem = result.dataSource.getByUid(uid);
//            console.log(dataItem );
//            $(current_intellectual_property).toggleClass("selected");
            var index = download_list.indexOf(id);
            if (index == -1) {
                download_list.push(id);
                $this.text("Отмена");
                $this.addClass("k-state-selected");

                dataItem.in_download_list = true;

                if ($download.hasClass("k-state-disabled")) {
                    $download.removeClass("k-state-disabled");
                    $add_directory.removeClass("k-state-disabled");
                }
            } else {
                download_list.splice(index, 1);
                $this.text("Выбрать");
                $this.removeClass("k-state-selected");

                dataItem.in_download_list = false;

                if (download_list.length == 0) {
                    $download.addClass("k-state-disabled");
                    $add_directory.addClass("k-state-disabled");
                }
            }
            return false;
        });
////////////////////////////////////// ВЫВОД РЕЗУЛЬТАТОВ\\

////////////////////////////////////// СКАЧАТЬ
        function download(id_list) {
            var send = {
                files: id_list
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
        }

        $download.click(function(e) {
            if ($download.hasClass("k-state-disabled")) return false;
            download(download_list);
            return false;
        });
////////////////////////////////////// СКАЧАТЬ\\


////////////////////////////////////// КАТАЛОГИ
        var $change_directory = $("#change_directory"),//TODO: имя скачанного архива - имя каталога а не по умолчанию(archive.zip)

            directory_window = $("#change_directory_window").kendoWindow({
                resizable: false, actions: [/*здесь скрываются кнопки*/],
                animation: { close: { effects: "", duration: 50 },
                    open: { effects: "", duration: 350 } },
                modal: true, width: 500, visible: false,
                minWidth: 0, minHeight: 0
            }).data("kendoWindow"),

            directory_model = kendo.observable({
                id: 0,
                name: ""
            });

        kendo.bind($change_directory, directory_model);
        var directory_validator = $change_directory.kendoValidator({
            rules: {
                required: function(input) {
                    if (input.is("[required]")) {
                        input.val($.trim(input.val())); //удалить обертывающиепробелы
                        return input.val() !== "";
                    } else return true;
                },
                duplicate_names: function(input) {
                    if (input.is("[name='name']")) {
                        if (input.val().length > 0) {
                            var result = $.grep(download_directory_grid.dataSource.data(),
                                function (o) { return o.name.toUpperCase() == input.val().toUpperCase();});
                            return result.length === 0;
                        }
                    }
                    return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым",
                duplicate_names: "Такой каталог уже существует"
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
                var d = download_directory_grid.dataSource;
                var item = {
                    download_dir_id: response.download_dir_id,
                    name: response.name,
                    intellectual_properties_id: response.intellectual_properties_id}
                d.add(item);
                download_directory_grid.refresh();
                var w = $(directory_window.wrapper), to = $("#show_directory_grid");
                var current = { height: w.height(), width: w.width() };
                w.animate({ left: to.position().left+to.width()/2, top: to.position().top,
                    width: 15, height: 0, opacity: 0.1 }, 300, "swing",
                    function() {
                        directory_window.close(); w.height("auto"/*current.height*/); w.width(current.width);
                        w.find("div#change_directory_window").css("overflow","hidden");
                    });
            });
            return false;
        });

        $add_directory.click(function() {
            if ($add_directory.hasClass("k-state-disabled")) return false;

            directory_model.set("id", 0);
            directory_model.set("name", "");

            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            directory_window.center().open();
            return false;
        });

        var $download_directory_window = $("#directory_window").kendoWindow({
                resizable: false, actions: [/*здесь скрываются кнопки*/],
                animation: { close: { effects: "", duration: 350 },
                    open: { effects: "", duration: 350 } },
                modal: true, width: 800, visible: false,
                open: function() {
                    var $grid_content = $(download_directory_grid.element.find("div.k-grid-content"));
//                    console.log(download_directory_grid);
                    $grid_content.height(download_directory_grid.options.height - 30);
                }
            }).data("kendoWindow"),
            download_directory_grid = $("#download_directory").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: { url: BASE_URL + API_BASE_URL + "directory/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: { url: BASE_URL + API_BASE_URL + "directory/destroy/",
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
                    model: { id: "download_dir_id",
                        fields: { name: {type: "string"} }
                    }
                }
            },
            height: 500,
            sortable: true,
            editable: { mode: "inline",
                confirmation: "Вы уверены, что хотите удалить каталог?",
                confirmDelete: "Да", cancelDelete: "Нет"
            },
            columns: [
                { field: "name", title: "Название"},
                { command: [
                    { text: 'Скачать',
                        click: function(e) {
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
//                            console.log(dataItem);
                            download(dataItem.intellectual_properties_id);
                        }
                    },
                    { name: "destroy", text: "Удалить" }]
                    , width: "200px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        $("#show_directory_grid").click(function() {
            $download_directory_window.center().open();
            return false;
        });

        $("#download_directory_close").click(function() {
            $download_directory_window.close();
            return false;
        });
////////////////////////////////////// КАТАЛОГИ\\

////////////////////////////////////// СПИСОК ФАЙЛОВ
        var files_list_window = $("#files_list_window").kendoWindow({
                resizable: false,
                animation: { close: { effects: "", duration: 50 },
                    open: { effects: "", duration: 350 } },
                modal: true, width: 500, visible: false,
                minWidth: 0, minHeight: 0
            }).data("kendoWindow"),

            files_list = $("#files_list").kendoListView({
                template: kendo.template($("#fileTemplate").html())
            }).data("kendoListView");

        $("#files_list_close").click(function() {
            files_list_window.close();
            return false;
        });

        $body.on("click", ".k-button.open-item", function(e) {
            var $this = $(this);
            var id = $this.data("id");
            var uid = $($this.parents(".intellectual_property_item.section")[0]).data("uid");
            var dataItem = result.dataSource.getByUid(uid);
            var n = noty_message(M_LOAD,false);
            $.post(API_BASE_URL + "file/get_list/",
                {item: JSON.stringify({intellectual_property_id: dataItem.intellectual_property_id})},
                function (data) {
                    n.close();
                    files_list.dataSource.data(data);
                    files_list_window.title(dataItem.name);
                    files_list_window.center().open();
                }, "json");
            return false;
        });

        $body.on("click", ".file-wrapper", function() {
            var $this = $(this);
            if ($this.data("type").toUpperCase() == ".pdf".toUpperCase()) {
                window.open(["/static/pdf.js/web/viewer.html","?file=/media/",$this.data("file-url")].join(""),"_blank")
            }
        });
////////////////////////////////////// СПИСОК ФАЙЛОВ\\

        $("#logout").click(function() {
            noty_confirm("Выйти?", function() {
                window.location = "/logout/"
            });
            return false;
        });

    });
})(jQuery)