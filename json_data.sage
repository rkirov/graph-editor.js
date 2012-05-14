import json

''' Use these function to export a Sage Graph as a JSON string that can be used
by the graph editor and vice versa.'''

def graph_to_JSON(G_input):
    # in graph_editor all labels are strings
    G = G_input.relabel(str, inplace=False)
    data = {
        'vertices': G.vertices(),
        'edges': G.edges(),
        'pos': G.get_pos(),
        'name':'G'
    }
    return json.dumps(data)

def JSON_to_graph(json_data):
    data = json.loads(json_data)
    G = Graph()
    G.add_vertices(data['vertices'])
    G.add_edges(data['edges'])
    G.set_pos(data['pos'])
    return G
