function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
}

mycategory = getURLParameter('category');
myaudience = getURLParameter('audience');

//Edit 'key' and 'columns' to connect your spreadsheet

//enter google sheets key here
var key ="https://docs.google.com/spreadsheets/d/1YSwUAVxuTToBAIsNGboAQY1aJnhBIzoESy355X7Q3Ck/pubhtml";

//"data" refers to the column name with no spaces and no capitals
//punctuation or numbers in your column name
//"title" is the column name you want to appear in the published table
var columns = [{
    "data": "Question",
    "title": "Question"
}, {
    "data": "Category",
    "title": "Category"
}, {
    "data": "Answer",
    "title": "Answer"
}];

$(document).ready(function() {

    function initializeTabletopObject() {
        Tabletop.init({
            key: key,
            callback: function(data, tabletop) {
                writeTable(data); //call up datatables function
            },
            simpleSheet: true,
            debug: false
        });
    }

    initializeTabletopObject();


// create the table container and object
    function writeTable(data){
        var dataTableContainer = $('<table cellpadding="0" cellspacing="0" border="0" class="display table table-bordered table-striped" id="data-table-container"></table>');
        $('#demo').append(dataTableContainer);



        var faqTable = $('#data-table-container').dataTable({
            "dom": 'ftr',
            "autoWidth": false,
            "pageLength": 999,
            'data': data,
            'columns': columns,
            'order': [[ 1, "asc" ]],
            "columnDefs" : [
                { "targets": [1], "visible": false},
                { className: "question preLoad", "targets": [ 0 ]},
                { className: "answer", "targets": [ 2 ]}
            ],
            'drawCallback': function ( settings ) {
                var api = this.api();
                var rows = api.rows( {page:'current'} ).nodes();
                var last=null;

                api.column(1, {page:'current'} ).data().each( function ( group, i ) {
                    if ( last !== group ) {
                        $(rows).eq( i ).before(
                            '<tr class="group"><td colspan="2">'+group+'</td></tr>'
                        );

                        last = group;
                    }
                } );
                var tables = $('.dataTable').DataTable();
                if ($('ul#top-list').is(':empty'))	{
                    var subjectList=
                        api
                            .columns( 1, {search:'applied'} )
                            .data()
                            .eq( 0 )      // Reduce the 2D array into a 1D array of data
                            .sort()       // Sort data alphabetically
                            .unique();     // Reduce to unique values
                    var cList = $('ul#top-list')
                    var liAll = $('<li/>')//Add link for all questions
                        .appendTo(cList);
                    $('<span/>').addClass('btn btn-default btn-maroon active')
                        .attr('id','all')
                        .text('All Questions')
                        .appendTo(liAll);
                    $.each(subjectList, function(i)//create subject menu
                    {
                        var li = $('<li/>')
                            .appendTo(cList);
                        var span = $('<span/>')
                            .addClass('btn btn-default btn-maroon categorySearch')
                            .text(subjectList[i])
                            .appendTo(li);
                    });
                    $('span.categorySearch').click (function() { //add function to search buttons
                        $(".active").removeClass("active");
                        $(this).addClass("active");

                        var search = $(this).text();
                        tables.search("");
                        tables.column(1).search( search, true, false ).draw();
                    });

                    $("span#all") //add function to All button
                        .click(function(){
                            $(".active").removeClass("active");
                            $(this).addClass("active");
                            tables.search("");
                            tables.column(1).search( "", true, false ).draw();

                        });


                };
			$('#faq #data-table-container_filter label').addClass('search-label');
			$('#faq table').addClass('top30');
			$('#faq #data-table-container_filter input').addClass('form-control');

            }//end drawCallback
        });

        if (mycategory.length >0) {
            $("#top-list span").removeClass("active");
            $ (".categorySearch:contains("+mycategory+")").addClass ("active");
            faqTable.fnFilter(mycategory, 1);
        }
        else {$("#all").addClass ("active");}




        $("td.answer")
            .hide();

        $("td.preLoad")
            .prepend("<span class='answer-tab details-control glyphicon glyphicon-plus'></span>")
            .removeClass("preLoad");


        $("td.question")
            .click(function(){
                $(this)
                    .find("span.answer-tab")
                    .toggleClass("glyphicon-plus")
                    .toggleClass("glyphicon-minus")
                    .parent().parent()
                    .find("td.answer")
                    .slideToggle();
                return false;
            });

        $(".all-answers")
            .click(function(){
                $("td.answer")
                    .slideDown();
                $(".answer-tab")
                    .removeClass("glyphicon-plus")
                    .addClass("glyphicon-minus");
                return false;
            });
        $(".no-answers")
            .click(function(){
                $("td.answer")
                    .slideUp();
                $(".answer-tab")
                    .removeClass("open");
                return false;
            });


    };
});
//define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
    return ((x < y) ? -1 : ((x > y) ?  0 : 0));
};

jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};
