/*
  JSONdata format (compatible with sage python code)
  {"vertices" : [v0.label, v1.label, .... , vn.label],
  "edges" : [ [e0v0.label, e0v1label, edgelabel], ... ],
  "pos"" : [ [v0x, v0y], [v1x, v1y], ... ],
  "name" : "a_graph"
  } */

function import_from_JSON(JSONdata) {
    var i, data = JSON.parse(JSONdata), dict = {}, new_v, pos, vertex;
    erase_graph();
    for (i = 0; i < data.vertices.length; i += 1) {
        new_v = new Vertex({x: 0, y: 0}, data.vertices[i]);
        dict[data.vertices[i]] = new_v;
        nodes.push(new_v);
    }
    if (data.pos) {
        var maxx = -Infinity, minx = Infinity,
        maxy = -Infinity, miny = Infinity, newx, newy, dx, dy;
        for (i in data.pos) {
            maxx = Math.max(maxx, data.pos[i][0]);
            maxy = Math.max(maxy, data.pos[i][1]);
            minx = Math.min(minx, data.pos[i][0]);
            miny = Math.min(miny, data.pos[i][1]);
        }
        dx = maxx - minx;
        dy = maxy - miny;
        for (i in data.pos) {
            pos = data.pos[i];
            vertex = dict[i];
            newx = (data.pos[i][0] - minx) / dx;
            newx = newx * 8 * SIZE.x / 10 + SIZE.x / 10;
            newy = (data.pos[i][1] - miny) / dy;
            newy = newy * 8 * SIZE.y / 10 + SIZE.y / 10;
            vertex.set_pos({x: newx, y: newy});
        }
    } else {
        circular_layout();
    }
    for (i = 0; i < data.edges.length; i += 1) {
        edge_list.push(new Edge(dict[data.edges[i][0]],
              dict[data.edges[i][1]], 1, dict[data.edges[i][2]]));
    }
    graph_name = data.name;
    draw();
}

function positions_dict() {
    var i, out, pos;
    out = '{';
    out += nodes.map(function(n, i) {
        var pos = n.get_pos();
        return i + ':[' + [pos.x, (SIZE.y - pos.y)].join(',') + ']';
    }).join(',');
    return out + '}';
}

function adjacency_lists_dict() {
    var edge, empty, i, j, node, out;
    out = '{';
    out += nodes.map(function(node,i) {
        return i + ':[' + edge_list.map(function(e) {
            var enodes = e.get_nodes();
            if (enodes.node1 === node) {
                return nodes.indexOf(enodes.node2);
            }
            if (enodes.node2 === node) {
                return nodes.indexOf(enodes.node1);
            }
        }).filter(nonundef).join(',') + ']';
    });
    return out + '}';
}

function export_tkz() {
    var pos, edge, i, j, out, px2pt;
    px2pt = 0.75;
    out = '';
    out += '\\begin{tikzpicture}\n\n';
    for (i = 0; i<nodes.length; i++) {
        out += '\\Vertex';
        pos = nodes[i].get_pos();
        out += '[x=' + px2pt * pos.x + 'pt,y=' + px2pt * (SIZE.y - pos.y) + 'pt]';
        out += '{' + i + '};\n';
    }
    out += '\n';
    for (j = 0; j<edge_list.length; j++){
        out += '\\Edge';
        edge = edge_list[j].get_nodes();
        out += '('+nodes.indexOf(edge.node1)+')';
        out += '('+nodes.indexOf(edge.node2)+')';
        out += '\n';
    }
    out += '\n';
    out += '\\end{tikzpicture}\n';
    return out;
}

function export_sage() {
    var data = {}, pos, i, exec = '';
    data.vertices = nodes.map(function(n) {
        return n.label;
    });
    data.edges = edge_list.map(function(e) {
        return [e.node1.label, e.node2.label, e.label];
    });
    data.pos = {};
    for (i = 0; i < nodes.length; i++) {
        pos = nodes[i].get_pos();
        data.pos[nodes[i].label] = [pos.x, pos.y];
    }
    data.name = graph_name;
    return JSON.stringify(data);
}
