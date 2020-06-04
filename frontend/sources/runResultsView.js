import PropTypes from 'prop-types';
import React from 'react';

import { AlignmentsTab } from './alignmentsTab.js';
import { BeamSearchOutputView } from './beamSearchOutputView.js';
import { CaptionsTab } from './captionsTab.js';

export { RunResultsView, HomeTabResultsView };


/**
 * Component wrapper for results displayed in the HomeTab
 * 
 * Component Props:
 *      See RunResultsView.
 */
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
            />
        </div>
    );
}


/**
 * Component for displaying run results for a single dataset instance.
 * 
 * Component State:
 *      showAlignments: Boolean. Whether to show or hide attention alignments.
 *      showCaption: Boolean. Whether to show captions.
 *      showBSOut: Boolean. Whether to show the beam search graph.
 * 
 * Component Props:
 *      results: Object. An object containing the results for the instance.
 *      instanceId: Number. The ID of the instance in the dataset.
 *      runId: Number. The ID of the run.
 *      onCaptionClick: Function. Handles user clicks on caption tokens.
 *      fetchAttentionMap: Function. Fetches attention maps for caption tokens.
 *      fetchAttentionMapForBSToken: Function. Fetches attention maps for 
 *              beam search output graph tokens.
 */
class RunResultsView extends React.Component {
    constructor(props) {
        super(props);
        
        this.hasAttn = false;
        this.hasBS = this.props.results.beamSearch.captions.length > 0 ? true : false;
        this.hasGraph = this.props.results.beamSearch.hasGraph;

        this.state = {
            showAlignments: false,
            showCaption: true,
            showBSOut: false,
        };

    }

    get bsGraph() {
        return fetch(`/load_bs_graph/${this.props.runId}/${this.props.instanceId}`)
        .then(res => res.json());
    }

    render() {
        const switchState = b => {
            let s = this.state;
            s[b] = !s[b];
            this.setState(s);
        };

        const r = this.props.results;
        const hasBSGraph = r.beamSearch.hasGraph;

        let captionTab = !this.state.showCaption ? null :
            <CaptionsTab
                greedyCaption={r.greedy.caption}
                beamSearchCaptions={r.beamSearch.captions}
                onTokenClick={(c, t) => this.props.onCaptionClick(c, t)}
                hasAttnGreedy={this.props.results.greedy.hasAttn}
                hasAttnBeamSearch={this.props.results.beamSearch.hasAttn}
            />;

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                greedyCaption={r.greedy.caption}
                beamSearchCaptions={r.beamSearch.captions}
                runId={this.props.runId}
                instanceId={this.props.instanceId}
                hasAttnGreedy={this.props.results.greedy.hasAttn}
                hasAttnBeamSearch={this.props.results.beamSearch.hasAttn}
            />;

        let bsView = (!this.state.showBSOut || !hasBSGraph) ? null :
            <BeamSearchOutputView 
                graphPromise={this.bsGraph}
                displayAlignment={a => this.props.fetchAttentionMapForBSToken(a)}
            />;

        return (
            <div>
                <div id="captions">
                    <div className="resultsSpan" onClick={() => switchState('showCaption')}>
                        Captions
                    </div>
                    {captionTab}
                </div>

                <div id="alignments">
                    <div className="resultsSpan" onClick={() => switchState('showAlignments')}>
                        Alignments
                    </div>
                    {attTab}
                </div>
                
                {
                    hasBSGraph &&
                    <div id="beamSearch">
                        <div className="resultsSpan" onClick={() => switchState('showBSOut')}>
                            Beam Search Output Graph
                        </div>
                    {   bsView}
                    </div>
                }

            </div>
        );
    }
}

RunResultsView.propTypes = {
    results: PropTypes.object,

    instanceId: PropTypes.number.isRequired,
    runId: PropTypes.number.isRequired,
    
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired,
    fetchAttentionMapForBSToken: PropTypes.func.isRequired,
};

// results = {
//     greedy: {
//         caption: [],
//         hasAttn: true
//     },
//     beamSearch: {
//         captions: [[]],
//         hasAttn: true,
//         hasGraph: false
//     }
// }