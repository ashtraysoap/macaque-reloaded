import PropTypes from 'prop-types';
import React from 'react';

import { AlignmentsTab } from './alignmentsTab.js';
import { BeamSearchOutputView } from './beamSearchOutputView.js';
import { CaptionsTab } from './captionsTab.js';

export { RunResultsView, HomeTabResultsView };

function HomeTabResultsView(props) {
    return (
        <div className="homeTabResultsView">
            <RunResultsView
                results={props.results}
                instanceId={props.instanceId}
                runId={props.runId}
                onCaptionClick={props.onCaptionClick}
                fetchAttentionMap={props.fetchAttentionMap}
                fetchAttentionMapForBSToken={props.fetchAttentionMapForBSToken}
                graph={props.graph}
            />
        </div>
    );
}

class RunResultsView extends React.Component {
    constructor(props) {
        super(props);

        this.fetchBeamSearchGraph = this.fetchBeamSearchGraph.bind(this);
        
        this.hasAttn = false;
        this.hasBS = this.props.results.beamSearch.captions.length > 0 ? true : false;
        this.hasGraph = this.props.results.beamSearch.hasGraph;

        this.state = {
            showAlignments: false,
            showCaption: true,
            showBSOut: false,
            bsGraph: null,
        };

        if (this.props.graph === undefined && this.hasGraph)
            this.fetchBeamSearchGraph();
    }

    render() {
        const switchState = b => {
            let s = this.state;
            s[b] = !s[b];
            this.setState(s);
        };

        const r = this.props.results;

        let captionTab = !this.state.showCaption ? null :
            <CaptionsTab
                greedyCaption={r.greedy.caption}
                beamSearchCaptions={r.beamSearch.captions}
                onTokenClick={(c, t) => this.props.onCaptionClick(c, t)}
            />;

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                greedyCaption={r.greedy.caption}
                beamSearchCaptions={r.beamSearch.captions}
                runId={this.props.runId}
                instanceId={this.props.instanceId}
            />;

        let bsView = !this.state.showBSOut ? null :
            <BeamSearchOutputView 
                graph={this.props.graph ? this.props.graph : this.state.bsGraph}
                displayAlignment={a => this.props.fetchAttentionMapForBSToken(a)}
            />;

        return (
            <div>
                <div>
                    <span className="resultsSpan" onClick={() => switchState('showCaption')}>
                        Captions
                    </span>
                    {captionTab}
                </div>

                <div id="alignments">
                    <span className="resultsSpan" onClick={() => switchState('showAlignments')}>
                        Alignments
                    </span>
                    {attTab}
                </div>
                
                <div id="beamSearch">
                    <span className="resultsSpan" onClick={() => switchState('showBSOut')}>
                        Beam Search Output Graph
                    </span>
                    {bsView}
                </div>

            </div>
        );
    }

    fetchBeamSearchGraph() {
        return fetch(`/load_bs_graph/${this.props.runId}/${this.props.instanceId}`)
        .then(res => res.json())
        .then(res => {
            this.setState({ bsGraph: res });
        });
    }
}

RunResultsView.propTypes = {
    results: PropTypes.object,

    instanceId: PropTypes.number.isRequired,
    runId: PropTypes.number.isRequired,
    
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired,
    fetchAttentionMapForBSToken: PropTypes.func.isRequired,

    graph: PropTypes.object
};

// results = {
//     greedy: {
//         caption: [],
//         alignmnets: [],
//         hasAttn: true
//     },
//     beamSearch: {
//         captions: [[]],
//         alignments: [[]],
//         hasAttn: true,
//         graph: null,
//         hasGraph: false
//     }
// }