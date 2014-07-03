graph-editor.js
===============
A graph editor (graph as in graph theory) written in JavaScript using the HTML5
canvas element. It supports multigraphs and includes a spring layout algorithm.
Originally written to be part of the sagemath.org computer algebra system.

Author
------
+ Radoslav Kirov

Contributors
------------
+ Kevin Clark
+ Mitesh Patel
+ Fidel Barrera-Cruz

Usage
-----
See index.html for description and demos.

Ideas for Future Development
----------------------------
+ Edge and vertex colors.
+ More editing options, like turning vertex into a clique, selecting multiple
  vertices and adding edges between sets of vertices.
+ Crazy embeddings, like a graph on a torus or projective plane.
+ graph6 input/output
+ new input mechanisms - joysticks, leapmotion, etc.
+ SVG renderer (would make the click handling controller a lot simpler)
+ infinite undo
+ pluggable extensions - custom renderers, layout algorithms, etc.
+ optimize the physics loop using JS typed arrays.

Similar Projects
----------------
See d3js.org and sigmajs.org for similar (and a lot more mature) graph viz JS
libraries. The main differentatior for graph-editor.js is the focus on editing
graphs vs displaing them.

Have fun!
