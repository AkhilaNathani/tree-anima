// Set up the dimensions and margins of the diagram
const margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 3000 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#tree").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Declares a tree layout and assigns the size
const treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
const root = d3.hierarchy(indiaData, d => d.children);
root.x0 = height / 2;
root.y0 = 0;

// Collapse all nodes except the first two levels
root.children.forEach(state => {
    state.children.forEach(collapse);
});

// Initialize counter for unique IDs
let i = 0;

update(root);

// Collapse the node and all its children
function collapse(d) {
    if(d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function update(source) {
    // Assigns the x and y position for the nodes
    const treeData = treemap(root);

    // Compute the new tree layout.
    const nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(d => d.y = d.depth * 300);

    // ****** Nodes section *********

    // Update the nodes...
    const node = svg.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
        .attr('class', d => `node ${d._children ? 'collapsed' : ''}`)
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff");

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", d => d.children || d._children ? -13 : 13)
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.data.name);

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(750)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff")
        .attr('cursor', 'pointer');

    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
        .duration(750)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // ****** Links section *********

    // Update the links...
    const link = svg.selectAll('path.link')
        .data(links, d => d.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal(o, o);
        });

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(750)
        .attr('d', d => diagonal(d, d.parent));

    // Remove any exiting links
    const linkExit = link.exit().transition()
        .duration(750)
        .attr('d', d => {
            const o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
    }

    // Toggle children on click.
    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}
