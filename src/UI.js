// TODO: switch to mustache.js or simpler templatization library instead of
// this string soup.
var UIside_panel_opened = false;
function add_checkbox(name, variable, container_id, onclickf) {
    var s = '<tr><td>' + name + '</td>';
    s += '<td><input type="checkbox"';
    s += ' value="' + variable + '"';
    if (variable) s += 'checked';
    s += '/></td></tr>';
    $(container_id).append(s);
    $(container_id + ' input:last').click(onclickf);
}

function add_button(name, container_id, onclickf) {
    var s = '<input type="button" id="' + name + '_button" value="' +
        name + '"' + '/>';
    $(container_id).append(s);
    $(container_id + ' input:last').click(onclickf);
}

function add_slider(name, variable, container_id, min, max, onchangef) {
    var s = '<tr><td>' + name + '</td>';
    s += '<td><div class="slider"></div></td></tr>';
    $(container_id).append(s);
    $(container_id + ' div.slider:last').slider({
        min: min,
        max: max,
        value: variable,
        slide: function(event, ui) {
            onchangef(ui.value);
        }
    });
}

function create_controls(div) {
    //Create controls and attach click functions
    var canvaspos = $(div + ' canvas').offset(),
        buttondiv = div + ' #graph_editor_button_container',
    canvas = $(div + ' canvas')[0];
    $(div).prepend('<div id="graph_editor_button_container"></div>');
    $('<div id="live_button" class="graph_editor_button">live</div>')
        .appendTo(buttondiv).click(toggle_live);
    $('<div id="tweaks_button" class="graph_editor_button">tweaks</div>')
        .appendTo(buttondiv)
        .toggle(function() {
            $(div).animate(
                {'width': SIZE.x + 310 + 'px'},
                {
                    queue: true,
                    duration: 'fast',
                    easing: 'linear',
                    complete: function() {
                        $(div + ' #graph_editor_tweaks').slideToggle('fast');
                        UIside_panel_opened = true;
                    }
            });
            $(div + ' #tweaks_button').toggleClass('graph_editor_button_on');
        },
        function() {
            $(div + ' #graph_editor_tweaks').slideToggle(
                'fast', function (){
                    $(div).animate(
                        {'width': SIZE.x +'px'},
                        {queue: true, duration: 'fast', easing: 'linear'});
                    UIside_panel_opened = false;
                });
            $(div + ' #tweaks_button').toggleClass('graph_editor_button_on');
    });

    $('<div id="help_button" class="graph_editor_button">?</div>')
        .appendTo(buttondiv)
        .click(function() {
            $('#help_dialog').dialog('open');
        });

    $('<div id="undo_button" class="graph_editor_button">undo</div>')
        .appendTo(buttondiv)
        .click(undo_remove).toggleClass('graph_editor_undo_disabled');

    $('<div id="reset_button" class="graph_editor_button">reset</div>')
        .appendTo(buttondiv)
        .click(function() {
            if (confirm("The graph will be irreversibly erased. This operation cannot be undone.")) {
                erase_graph();
            }
        });

    $('<div id="image_button" class="graph_editor_button">image</div>')
        .appendTo(buttondiv)
        .click(function() {
            var img = canvas.toDataURL("image/png");
            window.open(img, "Graph Editor Image",
                "menubar=false,toolba=false,location=false,width=" + SIZE.x +
                ",height=" + SIZE.y);
        });

    $(div).append('<div id="graph_editor_tweaks"></div>');
    var tweaks = div + ' #graph_editor_tweaks';

    $(tweaks).append("<div class='infobox'><h4 id='title'>Info</h4>" +
        "<div id='info'>Index: <span id='index'></span><br>" +
        "<span id='pos'>Position: (<span id='posx'></span>, <span id='posy'></span>)<br></span>" +
        "<span id='vert'>Vertices: <span id='v1'></span>-><span id='v2'></span><br></span>" +
        "Label: <input type='text' id='label'></div>" +
        "<div id='none_selected'>No node is selected</div></div>");
    $(div + ' .infobox #info').hide();
    $(div + ' .infobox #label').keyup(function() {
        var index = $(div + ' .infobox #index').html(),
            title = $(div + ' .infobox #title').html();
        if (title === "Vertex Info") {
            nodes[index].label = $(div + ' .infobox #label').val();
        } else if (title === "Edge Info") {
            edge_list[index].label = $(div + ' .infobox #label').val();
        }
    });

    $(tweaks).append("<h4>Tweaks</h4>");
    add_button('Circular layout', tweaks, function() {
        if (confirm("All vertices will be irrevesably moved. This operation cannot be undone.")) {
            circular_layout();
        }
    });

    $(tweaks).append('<table>');
    add_checkbox('Vertex numbers', NODE_NUMBERS, tweaks, function() {
        NODE_NUMBERS = !NODE_NUMBERS;
        draw();
    });

    add_slider('Vertex Size', NODE_RADIUS, tweaks, 0, 30, function(newval) {
        NODE_RADIUS = newval;
        draw();
    });

    add_slider('Edge Strength', 50, tweaks, 0, 100, function(newval) {
        SPRING = (1 - 1e-2) + 1e-4 * (100 - newval);
        SPEED = newval / 50.0;
        SPEED *= 2 * SPEED;
    });
    add_slider('Edge Length', FIXED_LENGTH, tweaks, 0, 200, function (newval) {
        FIXED_LENGTH = newval;
    });

    add_slider('Orientation', 0, tweaks, 0, 360, change_orientation);
    $(tweaks).append('</table>').hide();

    $(div).append("<div id='help_dialog'> <ul><li><h3>create vertex</h3>Click on empty space not too close to existing vertices. <li><h3>create/erase edge</h3>Select the first vertex. Click on another vertex (different than the selected one) to turn on/off (toggle) the edge between them. <li><h3>increase/decrease multiplicity</h3> Use +/-. When multiplicity is 0 the edge disappears.<li><h3>remove a vertex</h3>Press '-' when vertex is selected.<li><h3>keep the selected vertex after edge toggle</h3>Hold 'SHIFT' to preserve the selected vertex after creating/erasing an edge.<li><h3>split an edge</h3> press 's' when esge is selected<li><h3>freeze a vertex</h3> pressing 'r' freezes the selected vertex (it will not move in live mode)<li><h3>add/remove loop</h3> press 'o'<li><h3>undo vertex deletion</h3>Click on the Undo button. Only the last deleted vertex can be recovered.  <li><h3>turn on realtime spring-charge model</h3>Press 'l' or click on the live checkbox.  </ul> </div>");
    $('#help_dialog').dialog({
        autoOpen : false,
        width : 700,
        title : "Graph Editor Help",
        modal : true
    });
}

function update_infobox(obj) {
    if (!UIside_panel_opened) {
        return;
    }
    var pos, index, node, edge;
    if (obj && obj instanceof Vertex) {
        node = obj, pos = node.get_pos(), index = nodes.indexOf(node);
        $(div + ' .infobox #title').html('Vertex Info');
        $(div + ' .infobox #index').html(index);
        $(div + ' .infobox #pos').show();
        $(div + ' .infobox #posx').html(pos.x.toFixed(1));
        $(div + ' .infobox #posy').html(pos.y.toFixed(1));
        $(div + ' .infobox #vert').hide();
        $(div + ' .infobox #label').val(node.label);
        $(div + ' .infobox #none_selected').hide();
        $(div + ' .infobox #info').show();
    } else if (obj && obj instanceof Edge) {
        edge = obj;
        var enodes = edge.get_nodes();
        index = edge_list.indexOf(edge);
        $(div + ' .infobox #title').html('Edge Info');
        $(div + ' .infobox #index').html(index);
        $(div + ' .infobox #pos').hide();
        $(div + ' .infobox #vert').show();
        $(div + ' .infobox #v1').html(enodes.node1.label);
        $(div + ' .infobox #v2').html(enodes.node2.label);
        $(div + ' .infobox #label').val(edge.label||"none");
        $(div + ' .infobox #none_selected').hide();
        $(div + ' .infobox #info').show();
    } else {
        $(div + ' .infobox #title').html('Info');
        $(div + ' .infobox #none_selected').show();
        $(div + ' .infobox #info').hide();
    }
}
