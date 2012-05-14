(function (){

var cube = '{"edges": [["000", "001", null], ["000", "010", null], ["000", "100", null], ["001", "011", null], ["001", "101", null], ["010", "011", null], ["010", "110", null], ["011", "111", null], ["100", "101", null], ["100", "110", null], ["101", "111", null], ["110", "111", null]], "vertices": ["000", "001", "010", "011", "100", "101", "110", "111"], "name": "G", "pos": {"010": [0.50000000000000011, 0.8660254037844386], "011": [3.3306690738754696e-16, 1.7320508075688772], "001": [-0.49999999999999978, 0.86602540378443871], "000": [0.0, 0.0], "111": [1.0000000000000002, 1.7320508075688772], "110": [1.5, 0.8660254037844386], "100": [1.0, 0.0], "101": [0.50000000000000022, 0.86602540378443871]}}';


$(document).ready(function () {
    my_graph_editor = new GraphEditor('#graph_ed', { JSONdata : cube,
    width : 500,
    height : 500,
    multigraph: true});
        $('#set_json').click( function () {
            my_graph_editor.import_from_JSON($('#json').val());
        });
        $('#get_sage').click( function () {
            $('#sage').val(my_graph_editor.export_sage);
        });
        $('#get_latex').click( function () {
            $('#latex').val(my_graph_editor.export_tkz);
        });
	$('#rest').css('clear','both');
});
}());
