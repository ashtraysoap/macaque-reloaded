import PropTypes from 'prop-types';
import React from 'react';

import { zip, wait } from './utils.js';

export { AlignmentsTab };


class AlignmentsTab extends React.Component {
    constructor(props) {
        super(props);
        this.fetchAttentionMap = this.fetchAttentionMap.bind(this);
    }

    render() {
        const p = this.props;
        const bsc = p.beamSearchCaptions;

        if (!p.hasAttnGreedy && !p.hasAttnBeamSearch) {
            return (<div>
                No attention alignments present.
            </div>);
        }

        let segments = [];
        if (p.hasAttnGreedy) {
            segments.push(<AlignmentSegment
                caption={p.greedyCaption}
                fetchAttentionURL={(t) => this.fetchAttentionMap(0, t)}
                label="greedy"
            />);
        }

        if (p.hasAttnBeamSearch) {
            for (let i = 0; i < p.beamSearchCaptions.length; i++) {
                const j = i;
                segments.push(<AlignmentSegment
                    caption={bsc[j]}
                    fetchAttentionURL={(t) => this.fetchAttentionMap(j + 1, t)}
                    label={"beam " + (j + 1)}
                />);
            }
        }

        return (
            <div className="attn">
                {segments}
            </div>
        );
    };

    fetchAttentionMap(captionId, tokenId) {
        const runId = this.props.runId;
        const instanceId = this.props.instanceId;
        return fetch(`/load_attention_map/${runId}/${instanceId}/${captionId}/${tokenId}`)
        .then(res => res.arrayBuffer())
        .then(ab => {
            const view = new Uint8Array(ab);
            const url = URL.createObjectURL(new Blob([view], { type: "image/jpeg" }));
            return url;
        });
    }
}

class AlignmentSegment extends React.Component {
    constructor(props) {
        super(props);

        const len = this.props.caption.length;

        this.state = {
            urls: Array(len),
            show: false,
            hasURLs: false
        }

    }

    render() {
        const p = this.props;
        const s = this.state;

        const len = p.caption.length;

        if (len !== s.urls.length)
            this.setState({ urls: Array(len ), hasURLs: false });
        
        if (s.show && !s.hasURLs) {
            for (let i = 0; i < len; i++) {
                wait(20);
                const j = i;
                this.props.fetchAttentionURL(j)
                .then(url => {    
                    let s = this.state;
                    s.urls[j] = url;
                    this.setState(s);
                });
            }
            this.setState({ hasURLs: true });
        }
        
        const imgs = zip(s.urls, p.caption).map(x =>
            <ImageWithCaptionFrame src={x[0]} token={x[1]}/>);

        const className = this.state.show ? "attnLabelShowing" : "attnLabelHidden"

        const label = p.label !== null ? 
            <div className={className} onClick={() => this.setState({ show: !s.show })}>
                {p.label}
            </div> : null;

        return (
            <div>
                { label }
                {
                    this.state.show && 
                    <div>
                        {imgs}
                    </div>
                }
            </div>
        );
    }
}

function ImageWithCaptionFrame(props) {
    return (
        <div style={{display: "inline-block", padding: "5px", marginRight: "20px"}}>
            <img style={{display: "block"}} src={props.src} alt=""/>
            <div style={{display: "block"}}>{props.token}</div>
        </div>
    );
}


AlignmentsTab.propTypes = {
    greedyCaption: PropTypes.arrayOf(PropTypes.string),
    beamSearchCaptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    runId: PropTypes.number,
    instanceId: PropTypes.number,
    hasAttnGreedy: PropTypes.bool,
    hasAttnBeamSearch: PropTypes.bool    
};

AlignmentSegment.propTypes = {
    caption: PropTypes.arrayOf(PropTypes.string),
    fetchAttentionURL: PropTypes.func,
    label: PropTypes.string
}