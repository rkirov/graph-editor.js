function display_graph() {
    var i;
    if (LIVE) {
        run_physics();
    }
    for (i = 0; i < edge_list.length; i += 1) {
        edge_list[i].display();
    }
    for (i = 0; i < nodes.length; i += 1) {
        nodes[i].display();
    }
}

function start_loop(speed) {
    loop_interval = setInterval(draw, speed || 1000/FPS);
}

function stop_loop() {
    clearInterval(loop_interval);
}

function draw() {
    var curtime = (new Date).getTime();
    ctx.clearRect(0, 0, SIZE.x, SIZE.y);
    display_graph();
    if (SHOWFPS) {
        ctx.fillText((1000/(curtime - last_frame)).toFixed(1), 10, 10);
    }
    last_frame = curtime;
}

function toggle_live() {
        if (LIVE) {
            LIVE = false;
            stop_loop();
        } else {
            LIVE = true;
            start_loop();
        }
        $(div+' #live_button').toggleClass('graph_editor_button_on');
    }


function init() {
    controller = Controller();
    $(div).addClass('graph_editor_container');
    $(div).append('<canvas class="graph_editor_canvas" width = "' +
        SIZE.x + '" height = "' + SIZE.y +
        '" >Your browser does not support canvas.</canvas>');
    canvastag = $(div+' canvas');
    $(div).css({width: SIZE.x+'px'});
    ctx = canvastag[0].getContext('2d');
    ctx.translate(0.5, 0.5);  // makes everything prettier.
    canvastag.attr('tabindex', '0');
    canvastag.keydown(function(e) {controller.keydown(e);});
    canvastag.keypress(function(e) {controller.keypress(e);});
    canvastag.keyup(function(e) {controller.keyup(e);});
    canvastag.dblclick(function(e) {controller.dblclick(e);});
    canvastag.mousedown(function(e) {controller.mousedown(e);});
    canvastag.mouseup(function(e) {controller.mouseup(e);});
    canvastag.mousemove(function(e) {controller.mousemove(e);});
    canvastag.mouseleave(function(e) {controller.mouseleave(e);});
    // fixes a problem where double clicking causes text to get selected on the
    // canvas.
    // TODO: do in CSS.
    canvastag[0].onselectstart = function() { return false; }
    if (options.JSONdata) {
        import_from_JSON(options.JSONdata);
        draw();
    }
    if (options.controls !== false) create_controls(div);
}

init();

// An global object graph_editor is created containing all API functions.
return {
    import_from_JSON: import_from_JSON,
    export_tkz: export_tkz,
    export_sage: export_sage,
    get_raw_data: function() {
        return {
            nodes: nodes,
            edge_list: edge_list,
            SIZE: SIZE
        };
    },
    // destructive
    complete_graph: function(n) {
        nodes = [];
        edge_list = [];
        var i, j;
        for (i = 0; i < n; i++) {
            nodes.push(new Vertex());
            for (j = 0; j < i; j++) {
                edge_list.push(new Edge(nodes[i], nodes[j]));
            }
        }
	    circular_layout();
    },
    // destructive
    grid_graph: function(m, opt_n) {
        var n = opt_n || m;
        nodes = [];
        edge_list = [];
        var i, j;
        for (i = 0; i < n*m; i++) {
            nodes.push(new Vertex());
        }
        for (i = 0; i < m; i++) {
            for (j = 0; j < n; j++) {
                if (j != n-1) {
                    edge_list.push(new Edge(nodes[i*n+j], nodes[i*n+j+1]));
                }
                if (i != m-1) {
                    edge_list.push(new Edge(nodes[i*n+j], nodes[i*n+j+n]));
                }
            }
        }
	    circular_layout();
    }
};
