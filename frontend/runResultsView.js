import PropTypes from 'prop-types';
import React from 'react';

import { range, zip } from './utils.js';
import { AlignmentsTab } from './alignmentsTab.js';
import { BeamSearchOutputView } from './beamSearchOutputView.js'

export { RunResultsView };


class RunResultsView extends React.Component {
    constructor(props) {
        super(props);

        this.getSelectedCaption = this.getSelectedCaption.bind(this);
        this.setInitialCapID = this.setInitialCapID.bind(this);

        const cid = this.setInitialCapID();

        this.state = {
            showAlignments: false,
            showBSOut: false,
            captionId: cid
        };
    }

    render() {
        const caption = this.getSelectedCaption();
        const cid = this.state.captionId;

        let toks = zip(caption, range(caption.length));
        toks = toks.map(([token, id]) => <CaptionToken 
            key={id} 
            caption={token} 
            onClick={() => this.props.onCaptionClick(cid, id)}
        />);

        let attTab = !this.state.showAlignments ? null :
            <AlignmentsTab 
                caption={caption}
                runId={this.props.results.runId}
                instanceId={this.props.instanceId}
                captionId={cid}
                fetchAttentionMap={this.props.fetchAttentionMap}
            />

        let bsView = !this.state.showBSOut ? null :
            <BeamSearchOutputView />

        return (
            <div>
                <CaptionToggler 
                    captionId={this.state.captionId}
                    beamSize={this.props.results.captions.beamSearchCaptions.length}
                    onChange={(cid) => this.setState({ captionId: cid })}
                />
                <div id="caption" style={{border: "solid green"}}>
                    <div style={{display: "inline"}}>
                        {toks}
                    </div>
                </div>
                <div id="alignments" style={{border: "solid pink"}}>
                    <span onClick={() => this.setState({ showAlignments: !this.state.showAlignments })}>
                        Alignments
                    </span>
                    {attTab}
                </div>
                <div id="beamSearch" style={{border: "solid #5081C1"}}>
                    <span onClick={() => this.setState({ showBSOut: !this.state.showBSOut })}>
                        Beam Search Output Graph
                    </span>
                    {bsView}
                </div>
                <div id="metrics" style={{border: "solid purple"}}>Metrics Table</div>
            </div>
        );
    }

    // returns the currently selected caption as an array of string tokens.
    getSelectedCaption() {
        const cid = this.state.captionId;
        if (cid === 0) {
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

function CaptionToken(props) {
    return (
        <div style={{display: "inline", padding: "3px"}} 
            onClick={props.onClick}>{props.caption}
        </div>
    );
}

function CaptionToggler(props) {
    const greedyOpt = <option value={0} >greedy hypothesis</option>; // what if greedy c. not provided?
    const bsOpts = range(props.beamSize).map(i => 
        <option value={i}>{`beam search hypothesis ${i + 1}`}</option>)
    return (
        <div>
            <select value={props.captionId} onChange={e => props.onChange(e.target.value)}>
                {greedyOpt}
                {bsOpts}
            </select>
        </div>
    );
}


RunResultsView.propTypes = {
    results: PropTypes.shape(
        {
            runId: PropTypes.number,
            runnerId: PropTypes.number,
            captions: PropTypes.shape({
                greedyCaption: PropTypes.arrayOf(PropTypes.string),
                beamSearchCaptions: PropTypes.arrayOf(
                    PropTypes.arrayOf(PropTypes.string))
            })
        }
    ).isRequired,
    instanceId: PropTypes.number.isRequired,
    onCaptionClick: PropTypes.func.isRequired,
    fetchAttentionMap: PropTypes.func.isRequired
};

CaptionToggler.propTypes = {
    captionId: PropTypes.number,
    beamSize: PropTypes.number,
    onChange: PropTypes.func
};