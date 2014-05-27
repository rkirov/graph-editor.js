//most time crucial function according to profiler, hand-optimized
function add_force(node1, node2, force_function, k) {
    var sqr_d, force, n1 = node1.get_pos(), n2 = node2.get_pos();
    var deltax = - n2.x + n1.x, deltay = - n2.y + n1.y;
    sqr_d = Math.max(Math.sqrt(deltax * deltax + deltay * deltay), 0.01);
    force = force_function(sqr_d, k) / sqr_d;
    deltax *= force;
    deltay *= force;
    node1.change_vel(deltax, deltay);
    deltax = -deltax;
    deltay = -deltay;
    node2.change_vel(deltax, deltay);
}

function spring_force(sqr_d, k) {
    return -Math.sqrt(sqr_d) / k;
}

function repulsive_force(sqr_d, k) {
    var k2 = k * k;
    return k2 * k2 / (sqr_d * sqr_d);
}

function border_repulse(node) {
    var v, p = node.get_pos(), d = (Math.min(p.x, p.y, SIZE.x-p.x, SIZE.y-p.y));
    v = scalarm(20 / (d * d), vectorsub(center, p));
    node.change_vel(v.x, v.y);
}

function run_physics() {
    var k = Math.max(Math.sqrt(FIXED_LENGTH), 0.01), i, j, edge, l;
    for (i = 0, l = nodes.length; i < l; ++i) {
        border_repulse(nodes[i]);
        for (j = i + 1; j < l; j += 1) {
            add_force(nodes[i], nodes[j], repulsive_force, k);
        }
    }
    for (i = 0, l = edge_list.length; i < l; ++i) {
        edge = edge_list[i].get_nodes();
        add_force(edge.node1, edge.node2, spring_force, k);
    }
    for (i = 0, l = nodes.length ; i < l; ++i) {
        nodes[i].run();
    }
}
