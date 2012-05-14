function neighbors_of(node) {
    var neighbor, neighbors_list = [], i;
    for (i = 0; i < edge_list.length; i += 1) {
        neighbor = edge_list[i].connects_to(node);
        if (neighbor && neighbor !== node) {
            neighbors_list.push(neighbor);
        }
    }
    return neighbors_list;
}

function next_label() {
    var i = 0, j, good = false;
    while (!good) {
        good = true;
        for (j = 0; j < nodes.length; j++) {
            if (nodes[j].label === i.toString()) {
                i++;
                good = false;
                break;
            }
        }
    }
    return i.toString();
}

Vertex = function(pos, label) {
    //copy for objects would be nice
    this.pos = pos? Point(pos.x, pos.y) : Point();
    this.v = Point();
    this.frozen = false;
    this.label = label || next_label();
};

Vertex.prototype = {
    node_loop_angle: function() {
        var angles = [], angle = 0, i, diff, bestdiff = 0, edge, npos, thispos = this.pos,
            neighbors_list = neighbors_of(this);
        angles = neighbors_list.map(function(node) {
            var npos = node.get_pos();
            return Math.atan2(-npos.y + thispos.y, npos.x - thispos.x);
        });
        angles.sort(sort_num);
        for (i = 0; i < angles.length-1; i+=1) {
            diff = angles[i+1] - angles[i];
            if (diff > bestdiff) {
                angle = angles[i] + diff/2;
                bestdiff = diff;
            }
        }
        diff = Math.PI * 2 + angles[0] - angles[angles.length - 1];
        if (diff > bestdiff){
            angle = angles[angles.length - 1] + diff/2;
        }
        return angle;
    },
    display: function() {
        var node_number;
        ctx.strokeStyle = "#000000";
        if (this.selected) {
            ctx.fillStyle = "#FF0000";
        } else if (this.closest) {
            ctx.fillStyle = "#CCC000";
        } else {
            if (NODE_NUMBERS) {
                ctx.fillStyle = "#FFFFFF";
            } else if (this.frozen){
                ctx.fillStyle = "#C0C0C0";
            } else {
                ctx.fillStyle = "#000000";
            }
        }
        circle(this.pos.x, this.pos.y, NODE_RADIUS);
        if (NODE_NUMBERS) {
            ctx.fillStyle = "#000000";
            node_number = nodes.indexOf(this).toString();
            ctx.fillText(node_number, this.pos.x - 4 * node_number.length, this.pos.y + 3);
        }
    },
    vector_from: function(v) {
        return {x: this.pos.x-v.x, y: this.pos.y - v.y};
    },
    change_vel: function(deltax,deltay) {
        if(!this.frozen){
            this.v.x += deltax;
            this.v.y += deltay;
        }
    },
    get_pos: function() {
        return this.pos;
    },
    set_pos: function(new_pos) {
        this.pos = new_pos;
    },
    toggle_freeze: function() {
        this.frozen = !this.frozen;
    },
    get_frozen: function() {
        return this.frozen;
    },
    draw_loop: function() {
        var angle = this.node_loop_angle();
        circle(this.pos.x + 1.5 * Math.cos(angle) * NODE_RADIUS, this.pos.y - 1.5 * Math.sin(angle) * NODE_RADIUS, 2 * NODE_RADIUS, true);
    },
    run: function() {
        this.pos.x += Math.min(Math.max(SPEED * this.v.x, -20), 20);
        this.pos.y += Math.min(Math.max(SPEED * this.v.y, -20), 20);
        this.v.x *= 0.5;
        this.v.y *= 0.5;
    }
};

Edge = function(node1, node2, multi, label) {
    this.node1 = node1;
    this.node2 = node2;
    this.multi = multi || 1;
    this.label = label || '{}';
};

Edge.prototype = {
    draw_arrow_tips: function(in1,in2){
        var dv = {
            x: in2.x - in1.x,
            y: in2.y - in1.y
        },
        lenv = norm(dv),
        v1 = vectoradd(in1,{
            x: dv.x*(1-NODE_RADIUS/lenv),
            y: dv.y*(1-NODE_RADIUS/lenv)
        }),
        angle = Math.PI + Math.atan2(dv.y,dv.x),
        newangle1 = angle + Math.PI/6,
        newangle2 = angle - Math.PI/6,
        smallv1 = {
            x: NODE_RADIUS*Math.cos(newangle1),
            y: NODE_RADIUS*Math.sin(newangle1)
        },
        smallv2 = {
            x: NODE_RADIUS*Math.cos(newangle2),
            y: NODE_RADIUS*Math.sin(newangle2)
        },
        tip1 = vectoradd(v1,smallv1),
        tip2 = vectoradd(v1,smallv2);

        line(v1.x,v1.y,tip1.x,tip1.y);
        line(v1.x,v1.y,tip2.x,tip2.y);
    },
    draw_simple: function(){
        var pos1 = this.node1.get_pos(), pos2 = this.node2.get_pos();
        line(pos1.x,pos1.y,pos2.x,pos2.y);
        if (DIRECTED){
            this.draw_arrow_tips(pos1,pos2);
        }
    },
    draw_multi: function(){
        var pos1 = this.node1.get_pos(), pos2 = this.node2.get_pos(),
        mid = scalarm(1/2,vectoradd(pos1, pos2)),
        dx = vectorsub(pos1, pos2), normal, control, i;
        normal = unit({x : dx.y , y: -dx.x});
        for (i = -(this.multi-1)/2; i <= (this.multi-1)/2; i += 1){
            control = vectoradd(mid, scalarm(norm(dx)*i/10, normal));
            bezier(pos1.x, pos1.y, control.x, control.y, control.x, control.y, pos2.x, pos2.y);
            if (DIRECTED){
                this.draw_arrow_tips(control,pos2);
            }
        }
    },
    display: function(){
        var dv;
        if (this.selected) {
            ctx.strokeStyle = "#CC0000";
        } else if (this.closest) {
            ctx.strokeStyle = "#CCC000";
        } else if (this.node1.selected || this.node2.selected) {
            ctx.strokeStyle = "#0000C0";
        } else {
            ctx.strokeStyle = "#000000";
        }
        if (this.node1 === this.node2) {
            this.node1.draw_loop();
        } else {
            if (this.multi < 2) {
                this.draw_simple();
            } else {
                this.draw_multi();
            }
        }
    },
    is_touching: function(node) {
        return node === this.node1 || node === this.node2;
    },
    is_loop: function(node) {
        return node === this.node1 && node === this.node2;
    },
    connects_to: function(node) {
        var neighbor;
        if (this.node1 === node) {
            neighbor = this.node2;
        }
        if (this.node2 === node) {
            neighbor = this.node1;
        }
        return neighbor;
    },
    get_nodes: function() {
        return {node1:this.node1, node2:this.node2};
    },
    inc_mult: function() {
        if (MULTIGRAPH) {
           this.multi += 1;
        }
    },
    dec_mult: function() {
        if (this.multi > 0) {
            this.multi -= 1;
        }
        if (this.multi === 0){
            remove_edge(this);
        }
    }
};

//returns object {d: closest_distance, node: corresponding node}
function get_closest_node(v){
    return fmin(nodes.map(function (n){
        return {d: d(n.get_pos(), v), node:n};
    }), function (a,b){
        return a.d < b.d;
    });
}

function remove_edge(edge){
    edge_list.splice(edge_list.indexOf(edge),1);
}

function remove_node(node){
    var edge, i, index;
    removed_edges = [];
    for (i = edge_list.length - 1; i > -1; i -= 1) {
        edge = edge_list[i];
        if (edge.is_touching(node)) {
            removed_edges = removed_edges.concat(edge_list.splice(i, 1));
        }
    }
    index = nodes.indexOf(node);
    if (index !== -1) {
        removed_node = nodes.splice(index, 1)[0];
    }
    $('#undo_button').removeClass('graph_editor_undo_disabled');
    draw();
}

function undo_remove() {
    if (removed_node) {
        removed_node.label = next_label();
        nodes.push(removed_node);
        edge_list = edge_list.concat(removed_edges);
        removed_node = undefined;
        removed_edges = [];
        $('#undo_button').addClass('graph_editor_undo_disabled');
        draw();
    }
}

function toggle_loop(node){
    var edge, 
    existing = first(edge_list, function (edge){
        return edge.is_loop(node);
    });
    if (existing) {
        edge_list.splice(edge_list.indexOf(existing), 1);
    } else {
        edge_list.push(new Edge(node, node));
    }
}

function toggle_edge(node1, node2) {
    var edge, existing = false, i;

    if (node1 === node2){
            //maybe you want toggle_loop
            return;
    }
    for (i = edge_list.length - 1; i > -1; i -= 1) {
            edge = edge_list[i];
            if (edge.is_touching(node1) && edge.is_touching(node2)) {
                existing = true;
                break;
            }
        }
    if (existing){
            edge_list.splice(i, 1);
        } else {
            edge_list.push(new Edge(node1, node2));
        }
}

function centerize(maximize){
    var min_x = 10000,
        max_x = -10000,
        min_y = 10000,
        max_y = -10000,
        width, height, scaling_factor, i, pos, newp;

    for (i = 0; i < nodes.length; i += 1) {
            pos = nodes[i].get_pos();
            min_x = Math.min(min_x, pos.x);
            max_x = Math.max(max_x, pos.x);
            min_y = Math.min(min_y, pos.y);
            max_y = Math.max(max_y, pos.y);
        }
    width = Math.max(max_x - min_x, 0.01);
    height = Math.max(max_y - min_y, 0.01);

    for (i = 0; i < nodes.length; i += 1) {
        if (nodes[i] !== hit_node) {
                pos = nodes[i].get_pos();
            if (maximize) {
                scaling_factor = Math.max(Math.max(width, height), 0.01);
                newp = { x :(SIZE.x / 2) + ((SIZE.x * 9 / 10) * (pos.x - min_x) - (SIZE.x * 9 / 20) * width) / scaling_factor,
                    y : (SIZE.y / 2) + ((SIZE.y * 9 / 10) * (pos.y - min_y) - (SIZE.y * 9 / 20) * height) / scaling_factor};
            } else {
                newp = {x : (SIZE.x - width) / 2 + pos.x - min_x, y : newy = (SIZE.y - height) / 2 + pos.y - min_y};
            }
            nodes[i].set_pos(newp);
        }
    }
}

function circular_layout() {
    var i;
    for (i = 0; i < nodes.length; i += 1) {
        nodes[i].set_pos({
            x : SIZE.x / 2 + (2 * SIZE.x / 5) * Math.sin(2 * Math.PI * i / nodes.length),
            y : SIZE.y / 2 - (2 * SIZE.y / 5) * Math.cos(2 * Math.PI * i / nodes.length)
            });
    }
    draw();
}

function change_orientation(newval) {
    var new_orientation = Math.PI *(1- newval / 180.0),
        n_x, n_y, r, theta, i, pos;
    for (i = 0; i < nodes.length; i += 1) {
        pos = nodes[i].get_pos();
        n_x = pos.x - SIZE.x / 2;
        n_y = pos.y - SIZE.y / 2;
        r = Math.sqrt(n_x * n_x + n_y * n_y);
        theta = Math.atan2(n_y, n_x) + new_orientation - ORIENTATION;
        nodes[i].set_pos({x : SIZE.x / 2 + r * Math.cos(theta),
                          y : SIZE.y / 2 + r * Math.sin(theta)});
    }
    ORIENTATION = new_orientation;
    draw();
}

function split(edge) {
    var enodes = edge.get_nodes(), new_v,
    newpos = scalarmi(1/2,vectoradd(enodes.node1.get_pos(), enodes.node2.get_pos()));
    new_v = new Vertex(newpos);
    nodes.push(new_v);
    toggle_edge(new_v, enodes.node1);
    toggle_edge(new_v, enodes.node2);
    remove_edge(edge);
    return new_v;
}

function erase_graph() {
    nodes = [];
    edge_list = [];
    draw();
}
