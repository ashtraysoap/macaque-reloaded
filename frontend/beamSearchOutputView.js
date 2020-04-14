import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import './style.css';

export { BeamSearchOutputView };


class BeamSearchOutputView extends React.Component {
    constructor(props) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
    }

    render() {
        return (
            <div>
                <svg id="BSGraph"></svg>
            </div>
        );
    }

    componentDidMount() {
        if (this.props.graph === null)
            return;

        const root = this.props.graph;

        let d3Tree = d3.layout.tree()
            .size([1000, 1000]);

        d3.select("svg").selectAll("*").remove();

        let svg = d3.select("svg")
            .attr("width", 1500)
            .attr("height", 1500)
            .append("g")
            .attr("transform", "translate(" + 100 + "," + 20 + ")");

        let diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var i = 0;

        // initialize the tree layout and return a list of the nodes
        var nodes = d3Tree.nodes(root).reverse();

        // collect a list of the links connecting the tree nodes
        var links = d3Tree.links(nodes);

        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .on("click", this.handleNodeClick);

        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        nodeEnter.append("rect")
            .attr("width", 64)
            .attr("height", 40)
            .attr("x", -32)
            .attr("y", -20)
            .attr("rx", 9)
            .attr("ry", 9);

        nodeEnter.append("line")
            .attr("x1", -32)
            .attr("x2", 32)
            .attr("y1", 0)
            .attr("y2", 0);

        nodeEnter.append("text")
            .attr("dy", "-4")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.token })

        nodeEnter.append("text")
            .attr("dy", "14")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.score.toFixed(5) })

        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    handleNodeClick(node) {
        if (!node.displayed) {
            if (node.alignment === null || node.alignment === undefined) {
                // No alignment present, will display original image.
                this.props.displayAlignment(null);
            } else {
                this.props.displayAlignment(node.alignment);
                node.displayed = true;
            }
        } else {
            // Already displaying node's alignment; display the original image.
            node.displayed = false;
            this.props.displayAlignment(null);
        }
    }
}

BeamSearchOutputView.propTypes = {
    graph: PropTypes.object.isRequired,
    displayAlignment: PropTypes.func.isRequired
};