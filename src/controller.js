Controller = function() {
    var hit_node, selected_object, dragging_node, dragging_frozen_flag, closest,
        mouse = new Point(), lastcheck = 0;
    return {
        select_object: function(obj) {
            if (selected_object === obj) {
                this.unselect_object();
                return;
            }
            if (selected_object) {
                this.unselect_object();
            }
            selected_object = obj;
            obj.selected = true;
            update_infobox(obj);
        },
        set_mouse: function(e) {
            var obj = e.currentTarget, offset = $(obj).offset();
            mouse = {x : e.pageX - offset.left, y: e.pageY - offset.top};
        },
        unselect_object: function() {
            if (selected_object) {
                selected_object.selected = false;
                selected_object = undefined;
                update_infobox();
            }
        },
        drag_node_start: function(node) {
            dragging_node = node;
            dragging_frozen_flag = node.get_frozen();
            if (!node.get_frozen()) {
                node.toggle_freeze();
            }
            if (!LIVE) {
                start_loop();
            }
        },
        update_drag: function(m) {
            dragging_node.set_pos(m);
            if (dragging_node === selected_object) {
                update_infobox(dragging_node);
            }
        },
        drag_node_stop: function() {
            if (dragging_frozen_flag === false ) {
                dragging_node.toggle_freeze();
            }
            dragging_node = undefined;
            if (!LIVE) {
                stop_loop();
            }
        },
        find_closest: function() {
            var closest_data, edge;
            closest_data = get_closest_node(mouse);
            if (closest_data && closest_data.d < NODE_RADIUS) {
                this.update_closest(closest_data.node);
                return;
            }
            edge = first(edge_list, function(edge) {
                var v = edge.get_nodes();
                return in_tube(mouse, v.node1.get_pos(), v.node2.get_pos(), 15);
            });
            this.update_closest(edge);
        },
        update_closest: function(object) {
            if (closest && (closest !== object)) {
                closest.closest = false;
            }
            closest = object;
            if (object) {
                object.closest = true;
            }
        },
        mousedown: function() {
            if (closest && closest instanceof Vertex) {
                hit_node = closest;
            }
            if (!LIVE) draw();
        },
        mouseup: function(e) {
            var new_v;
            if (dragging_node) {
                this.drag_node_stop();
            } else if (hit_node && (selected_object === undefined)) {
                    this.select_object(hit_node);
            } else if (hit_node && selected_object instanceof Vertex && (selected_object !== hit_node)) {
                toggle_edge(selected_object, hit_node);
                if (!SHIFT) {
                    this.unselect_object();
                }
            } else if (closest) {
                this.select_object(closest);
            } else {
                new_v = new Vertex(mouse);
                //careful for edge case of user not moving mouse afterclick
                //if live the vertex flies off
                if (!LIVE) {
                    this.update_closest(new_v);
                }
                nodes.push(new_v);
            }
            hit_node = undefined;
            if (!LIVE) draw();
        },
        mousemove: function(e) {
            this.set_mouse(e);
            if (hit_node && !dragging_node) {
                this.drag_node_start(hit_node);
            }
            if (dragging_node) {
                this.update_drag(mouse);
            }
            this.find_closest();
            if (!LIVE) draw();
        },
        keydown: function(e) {
            if (e.keyCode === 16) {
                SHIFT = true;
            }
        },
        keyup: function(e) {
            SHIFT = false;
        },
        keypress: function(e) {
            var pos, canvaspos, dialog;
            //charCode has browser problems, check with http://www.quirksmode.org/js/keys.html
            //console.log(e.charCode,String.fromCharCode(e.charCode));
            if (String.fromCharCode(e.charCode) === '-' && selected_object) {
                if (selected_object instanceof Vertex) {
                    remove_node(selected_object);
                } else if (selected_object instanceof Edge) {
                    selected_object.dec_mult();
                }
                this.unselect_object();
            }
            if (String.fromCharCode(e.charCode) === 'l') {
                toggle_live();
            }
            if (String.fromCharCode(e.charCode) === 'f') {
                SHOWFPS = !SHOWFPS;
            }
            if (String.fromCharCode(e.charCode) === 'r' && selected_object instanceof Vertex) {
                selected_object.toggle_freeze();
                this.unselect_object();
            }
            if (String.fromCharCode(e.charCode) === '+' && selected_object instanceof Edge) {
                selected_object.inc_mult();
            }
            if (String.fromCharCode(e.charCode) === 'o' && selected_object instanceof Vertex) {
                toggle_loop(selected_object);
            }
            if (String.fromCharCode(e.charCode) === 's' && selected_object instanceof Edge) {
                this.select_object(split(selected_object));
            }
            if (!LIVE) draw();
        },
        mouseleave: function() {
            this.drag_node_stop();
        },
        dblclick: function() {
        }
    };
};
