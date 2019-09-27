import PropTypes from 'prop-types';
import React from 'react';

import { range, zip } from './utils.js';
import { AlignmentsTab } from './alignmentsTab.js';
import { BeamSearchOutputView } from './beamSearchOutputView.js'

export { RunResultsView };


class RunResultsView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAlignments: false,
            showBSOut: false
        }
    }

    render() {
        const runnerId = this.props.results.runnerId;
        const caption = this.props.results.caption;
        let toks = zip(caption, range(caption.length));
        toks = toks.map(([token, id]) => <CaptionToken 
            key={id} 
            caption={token} 
            onClick={() => this.props.onCaptionClick(id)}
        />);

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                caption={caption}
                runId={this.props.results.runId}
                instanceId={this.props.instanceId}
                fetchAttentionMap={this.props.fetchAttentionMap}
            />

        let bsView = !this.state.showBSOut ? null :
            <BeamSearchOutputView 

            />

        return (
            <div>
                <div style={{border: "solid green"}}>
                    Caption: {runnerId} says "
                    <div style={{display: "inline"}}>
                        {toks}
                    </div>
                    ".
                </div>
                <div style={{border: "solid pink"}}>
                    <span onClick={() => this.setState({ showAlignments: !this.state.showAlignments })}>
                        Alignments
                    </span>
                    {attTab}
                </div>
                <div style={{border: "solid #5081C1"}}>
                    <span onClick={() => this.setState({ showBSOut: !this.state.showBSOut })}>
                        Beam Search Output Graph
                    </span>
                    {bsView}
                </div>
                <div style={{border: "solid purple"}}>Metrics Table</div>
            </div>
        )
    }
}

function CaptionToken(props) {
    return (
        <div style={{display: "inline", padding: "3px"}} 
            onClick={props.onClick}>{props.caption}
        </div>
    )
}


RunResultsView.propTypes = {
    results: PropTypes.shape(
        {
            runId: PropTypes.number,
            runnerId: PropTypes.number,
            caption: PropTypes.arrayOf(PropTypes.string)
        }
    ).isRequired,
    instanceId: PropTypes.number.isRequired,
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired
};
