import PropTypes from 'prop-types';
import React from 'react';

import { AlignmentsTab } from './alignmentsTab.js';
import { BeamSearchOutputView } from './beamSearchOutputView.js';
import { CaptionTab } from './captionTab.js';
import { ElementScoreTable } from './scoreTable.js';

export { RunResultsView };


class RunResultsView extends React.Component {
    constructor(props) {
        super(props);

        this.getSelectedCaption = this.getSelectedCaption.bind(this);
        this.setInitialCapID = this.setInitialCapID.bind(this);

        const cid = this.setInitialCapID();

        this.state = {
            showAlignments: false,
            showCaption: true,
            showBSOut: false,
            showMetrics: false,
            captionId: cid
        };
    }

    render() {
        const caption = this.getSelectedCaption();
        const cid = this.state.captionId;
        
        const switchState = b => {
            let s = this.state;
            s[b] = !s[b];
            this.setState(s);
        };

        let captionTab = !this.state.showCaption ? null :
            <CaptionTab 
                caption={caption}
                onTokenClick={(tokId) => this.props.onCaptionClick(cid, tokId)}
                captionId={this.state.captionId}
                greedy={true}
                beamSize={this.props.results.captions.beamSearchCaptions.length}
                onCaptionChange={(cid) => this.setState({ captionId: cid })}
            />;

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                caption={caption}
                runId={this.props.results.runId}
                instanceId={this.props.instanceId}
                captionId={cid}
                fetchAttentionMap={this.props.fetchAttentionMap}
            />;

        let bsView = !this.state.showBSOut ? null :
            <BeamSearchOutputView />;

        let metrics = !this.state.showMetrics ? null :
            <ElementScoreTable
               scores={this.props.results.scores} 
               metrics={this.props.metrics}
            />;

        return (
            <div>
                <div>
                    <span className="resultsSpan" onClick={() => switchState('showCaption')}>
                        Caption
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
                
                {
                    this.props.metrics.length > 0 &&
                        <div id="metrics">
                            <span className="resultsSpan" onClick={() => switchState('showMetrics')}>
                                Metrics
                            </span>
                            {metrics}
                        </div>
                }
            </div>
        );
    }

    // returns the currently selected caption as an array of string tokens.
    getSelectedCaption() {
        const cid = this.state.captionId;
        if (cid == 0) {
            return this.props.results.captions.greedyCaption;
        } else if (cid > 0) {
            return this.props.results.captions.beamSearchCaptions[cid - 1];
        } else {
            return null;
        }
    }

    // sets the initially chosen caption. defaults to greedy, if it's not present
    // choose the first beam search hypothesis, if neither is present, return null.
    setInitialCapID() {
        const greedyCap = this.props.results.captions.greedyCaption;
        const bsCaps = this.props.results.captions.beamSearchCaptions;
        if (greedyCap.length > 0)
            return 0;
        if (bsCaps.length > 0)
            return 1;
        return null;
    }
}

RunResultsView.propTypes = {
    results: PropTypes.shape(
        {
            runId: PropTypes.number,
            captions: PropTypes.shape({
                greedyCaption: PropTypes.arrayOf(PropTypes.string),
                beamSearchCaptions: PropTypes.arrayOf(
                    PropTypes.arrayOf(PropTypes.string))
            })
        }
    ).isRequired,
    instanceId: PropTypes.number.isRequired,
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string).isRequired,
};
