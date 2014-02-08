/**
 * Created by user on 04.02.14.
 */

var API_BASE_URL = "api/";

(function ($) {
    $(document).ready(function (e) {

        var $search_name = $("#search_name"),
            $search_author = $("#search_author"),
            $search_tag = $("#search_tag");

        var search_tree = $("#search_tree").kendoTreeView({
            dataSource: new kendo.data.HierarchicalDataSource({
                type: "json",
                transport: {
                    read: {
                        url: API_BASE_URL+"tree/read/",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: {
                    model: {
                        id: "subdivision_id",
                        hasChildren: "has_items",
                        children: "items"
                    }
                }
            }),
            dataTextField: "name",
            template: kendo.template($("#tree_item_template").html())
        }).data("kendoTreeView");

        var result = $("#result").kendoListView({
            dataSource: {
                type: "json",
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
            },
            template: kendo.template($("#result_item_template").html())
        }).data("kendoGrid");

//        var intellectual_properties = [],
//            tags = [],
//            authors = [];
//        $.post(BASE_URL + API_BASE_URL + "intellectual_property/read/",
//               function(data) {
//                   intellectual_properties = data;
//               }, "json");
//        $.post(BASE_URL + API_BASE_URL + "tags/read/",
//               function(data) {
//                   tags = data;
//               }, "json");
//        $.post(BASE_URL + API_BASE_URL + "authors/read/",
//               function(data) {
//                   authors = [];
//                   for (var i = 0; i < data.length; i++) {
//                       authors.push({
//                           author_id: data[i].author_id,
//                           name: [data[i].surname, data[i].name, data[i].patronymic].join(" ")
//                       })
//                   }
//               }, "json");
//
//        function search_data_source_change(e) {
//            var search_data_source = [];
//            if ($search_name.is(":checked")) {
//                search_data_source = search_data_source.concat(intellectual_properties);
//            }
//            if ($search_author.is(":checked")) {
//                search_data_source = search_data_source.concat(authors);
//            }
//            if ($search_tag.is(":checked")) {
//                search_data_source = search_data_source.concat(tags);
//            }
//            console.log(search_data_source);
//            var ds = new kendo.data.DataSource({
//                data: search_data_source
//            });
//            search.setDataSource(ds);
//        }
//        $search_name.click(search_data_source_change);
//        $search_author.click(search_data_source_change);
//        $search_tag.click(search_data_source_change);

        var search = $("#search").kendoAutoComplete({
            dataSource: {
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "search_data_source/"
                    }
                }
            },
            dataTextField: "name",
            separator: ", ",
            placeholder: "Поиск",
            filter: "contains"
        }).data("kendoAutoComplete")
    });
})(jQuery)