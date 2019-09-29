import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import './style.css';

export { BeamSearchOutputView };


class BeamSearchOutputView extends React.Component {
    constructor(props) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    render() {
        return (
            <div>
                <svg></svg>
            </div>
        );
    }

    componentDidMount() {
        //const root = this.props.beamSearchOutputGraph;
        const root = {
            token: "START",
            score: 0.0,
            children: [
                {
                    token: "cat",
                    score: 3.4,
                    children: [
                        {
                            token: "walrus",
                            score: 7.7,
                            children: []
                        }
                    ]
                },
                {
                    token: "doggy",
                    score: 3.6,
                    children: []
                }
            ]
        };

        let d3Tree = d3.layout.tree()
            .size([500, 500]);

        let svg = d3.select("svg")
            .attr("width", 700)
            .attr("height", 700)
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

    handleNodeClick(node) {
        console.log(node);
    }
}

function click(node) {
    if (!node.displayed) {
      acquireImage(node);
      if (!node.imageUrl) {
        // fetch the image
        var init = {
          method: 'POST',
          body: JSON.stringify(node.alignment)
        };
  
        fetch('single_alpha', init).then(response => {
          response.blob().then(blob => {
            node.imageUrl = URL.createObjectURL(blob);
          })
          .then(() => {
            d3.select("img")
              .attr("src", node.imageUrl)
          });
        });
      }
      else {
        d3.select("img")
          .attr("src", node.imageUrl)
      }
    }
    else {
      d3.select("img")
        .attr("src", url);
      releaseImage(node);
    }
  }

// BeamSearchOutputView.propTypes = {
//     beamSearchOutputGraph: PropTypes.object.isRequired
// };